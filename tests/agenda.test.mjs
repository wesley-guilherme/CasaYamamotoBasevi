import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
const compile=(source)=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const data=await import(compile(readFileSync(new URL('../app/agenda/agenda-data.ts',import.meta.url),'utf8')));
const localityData=JSON.parse(readFileSync(new URL('../app/agenda/brazil-localities.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const locationSource=readFileSync(new URL('../app/agenda/brazil-location.ts',import.meta.url),'utf8').replace('import localities from "./brazil-localities.json";',`const localities = ${JSON.stringify(localityData)};`);
const locations=await import(compile(locationSource));
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(readFileSync(new URL('../drizzle/0004_tranquil_daredevil.sql',import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
sqlite.exec("INSERT INTO house_agenda (kind,title,start_date,end_date,updated_by) VALUES ('reservation','Reserva antiga','2098-01-01','2098-01-03','host')");
sqlite.exec(readFileSync(new URL('../drizzle/0005_glorious_pride.sql',import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
globalThis.__agendaDatabase={prepare(sql){return {bind(...values){this.values=values;return this;},async first(){return sqlite.prepare(sql).get(...(this.values||[]))||null;},async all(){return {results:sqlite.prepare(sql).all(...(this.values||[]))};},async run(){return {meta:sqlite.prepare(sql).run(...(this.values||[]))};}};}};
let source=readFileSync(new URL('../db/agenda.ts',import.meta.url),'utf8');
source=source.replace(/async function database\(\): Promise<D1Database> \{[^\n]*\}/,'async function database() { return globalThis.__agendaDatabase; }');
source=source.replace('"../app/agenda/agenda-data"',JSON.stringify(compile(readFileSync(new URL('../app/agenda/agenda-data.ts',import.meta.url),'utf8'))));
const db=await import(compile(source));
const input=(kind,startDate,endDate,title='Private reservation')=>({kind,startDate,endDate,title,description:'Private guest details',published:true});
test('validates real dates and overnight stays; checkout is available',()=>{
 assert.equal(data.validDate('2027-02-29'),false);assert.equal(data.validDate('2028-02-29'),true);
 assert.throws(()=>data.parseAgendaInput(input('reservation','2027-01-01','2027-01-01')));
 assert.doesNotThrow(()=>data.parseAgendaInput(input('holiday','2027-01-01','2027-01-01')));
 const period={id:1,startDate:'2027-12-30',endDate:'2028-01-03'};
 assert.equal(data.isReserved('2028-01-02',[period]),true);assert.equal(data.isReserved('2028-01-03',[period]),false);
 assert.equal(data.overlapsStay('2028-01-03','2028-01-05',period),false);
 assert.equal(data.addDays('2028-02-29',1),'2028-03-01');
});
test('history date filters include occupied nights, open limits and stays spanning the selected period',()=>{
 const stay=(id,startDate,endDate)=>({...data.parseAgendaInput(input('reservation',startDate,endDate)),id});
 const items=[stay(1,'2026-09-28','2026-10-06'),stay(2,'2026-10-06','2026-10-10'),stay(3,'2026-10-15','2026-10-22'),stay(4,'2026-10-22','2026-11-01')];
 const ids=period=>data.filterHistoryPeriod(items,period).map(item=>item.id);
 assert.deepEqual(ids({startDate:'2026-10-06',endDate:'2026-10-15'}),[2,3]);
 assert.deepEqual(ids({startDate:'2026-10-07',endDate:'2026-10-07'}),[2]);
 assert.deepEqual(ids({startDate:'2026-10-10',endDate:'2026-10-14'}),[]);
 assert.deepEqual(ids({startDate:'2026-10-22'}),[4]);
 assert.deepEqual(ids({endDate:'2026-09-30'}),[1]);
 assert.deepEqual(ids({}),[1,2,3,4]);
 for(const period of [{startDate:'2026-10-20',endDate:'2026-10-01'},{startDate:'2026-02-30'}]) {
  assert.ok(data.historyPeriodError(period));assert.throws(()=>ids(period));
 }
});
test('preloaded IBGE locations resolve states and enforce city/state relationships without accents or case sensitivity',()=>{
 assert.equal(localityData.length,27);assert.equal(new Set(localityData.map(state=>state.code)).size,27);
 assert.equal(localityData.reduce((sum,state)=>sum+state.cities.length,0),5571);
 for(const state of localityData) {assert.ok(state.cities.length);assert.equal(new Set(state.cities).size,state.cities.length);}
 assert.equal(locations.findBrazilState(' BAHIA ').code,'BA');assert.equal(locations.findBrazilState('sp').name,'São Paulo');
 assert.equal(locations.findBrazilState('sao paulo').code,'SP');assert.equal(locations.findBrazilState('Bahia (BA)').code,'BA');
 assert.deepEqual(locations.parseBrazilLocation('BA',' itamaraju '),{state:'Bahia',city:'Itamaraju'});
 assert.deepEqual(locations.parseBrazilLocation('sp','sao paulo'),{state:'São Paulo',city:'São Paulo'});
 assert.deepEqual(locations.parseBrazilLocation('BA',''),{state:'Bahia',city:''});
 assert.deepEqual(locations.parseBrazilLocation('',''),{state:'',city:''});
 assert.throws(()=>locations.parseBrazilLocation('BA','São Paulo'),/cidade/);
 assert.throws(()=>locations.parseBrazilLocation('','Salvador'),/estado/);
 assert.throws(()=>locations.parseBrazilLocation('invalid','Salvador'),/estado/);
});
test('past stays move only to history after checkout in Bahia without changing rental totals',()=>{
 const reservation=(id,startDate,endDate,amount)=>({...data.parseAgendaInput(input('reservation',startDate,endDate)),id,rentalOrigin:'Site',rentalAmountCents:amount});
 const past=reservation(1,'2026-10-28','2026-11-02',10000);
 const recent=reservation(2,'2026-11-01','2026-11-03',20000);
 const checkoutToday=reservation(3,'2026-11-02','2026-11-04',30000);
 const ongoing=reservation(4,'2026-11-03','2026-11-06',40000);
 const upcoming=reservation(5,'2026-11-10','2026-11-12',50000);
 const holiday={...reservation(6,'2026-10-01','2026-10-03',60000),kind:'holiday'};
 const items=[upcoming,past,ongoing,checkoutToday,recent,holiday];
 const originalOrder=items.map(item=>item.id);
 const beforeMidnight=data.houseToday(new Date('2026-11-05T02:59:59Z'));
 const afterMidnight=data.houseToday(new Date('2026-11-05T03:00:00Z'));
 assert.equal(beforeMidnight,'2026-11-04');assert.equal(afterMidnight,'2026-11-05');
 const today=data.partitionReservations(items,beforeMidnight);
 assert.deepEqual(today.current.map(item=>item.id),[3,4,5]);
 assert.deepEqual(today.history.map(item=>item.id),[2,1]);
 assert.deepEqual(data.partitionReservations(items,afterMidnight).history.map(item=>item.id),[3,2,1]);
 assert.deepEqual(items.map(item=>item.id),originalOrder);
 assert.equal(data.summarizeRentalOrigins(items,[]).find(group=>group.origin==='Site').amountCents,150000);
 assert.equal(today.history[0].id,recent.id);assert.equal(today.history[0].rentalAmountCents,20000);
 const rescheduled=items.map(item=>item.id===past.id?{...item,startDate:'2026-12-01',endDate:'2026-12-03'}:item);
 assert.equal(data.partitionReservations(rescheduled,beforeMidnight).history.some(item=>item.id===past.id),false);
 assert.equal(data.partitionReservations(rescheduled,beforeMidnight).current.some(item=>item.id===past.id),true);
});
test('rental totals filter inclusive entry months, including year changes and empty periods',()=>{
 const rental=(id,startDate,endDate,rentalOrigin,rentalAmountCents)=>({...data.parseAgendaInput(input('reservation',startDate,endDate)),id,rentalOrigin,rentalAmountCents});
 const items=[
  rental(1,'2026-11-30','2026-12-03','Site',10000),
  rental(2,'2026-12-01','2026-12-03','Site',20000),
  rental(3,'2026-12-31','2027-01-02','Airbnb',30000),
  rental(4,'2027-01-31','2027-02-02','Site',40000),
  rental(5,'2027-02-01','2027-02-03','Booking',50000),
  rental(6,'2027-01-15','2027-01-17','Indicação',null),
  {...rental(7,'2027-01-20','2027-01-22','Site',90000),kind:'holiday'},
 ];
 const totals=(period)=>data.summarizeRentalOrigins(items,['Indicação'],period);
 const total=(groups)=>groups.reduce((sum,group)=>sum+group.amountCents,0);
 const between=totals({startMonth:'2026-12',endMonth:'2027-01'});
 assert.equal(total(between),90000);
 assert.equal(between.find(group=>group.origin==='Site').count,2);
 assert.equal(between.find(group=>group.origin==='Indicação').missingAmounts,1);
 assert.equal(total(totals({startMonth:'2026-12',endMonth:'2026-12'})),50000);
 assert.equal(total(totals({startMonth:'2027-01'})),90000);
 assert.equal(total(totals({endMonth:'2026-12'})),60000);
 assert.equal(total(totals({startMonth:'2028-02',endMonth:'2028-02'})),0);
 assert.equal(totals({startMonth:'2028-02',endMonth:'2028-02'}).reduce((sum,group)=>sum+group.count,0),0);
 assert.equal(total(totals({})),150000);
 assert.equal(data.rentalSummaryPeriodError({startMonth:'2027-01',endMonth:'2027-01'}),null);
 for(const period of [{startMonth:'2027-02',endMonth:'2027-01'},{startMonth:'2027-13'},{endMonth:'1999-12'},{startMonth:'invalid'}]) {
  assert.ok(data.rentalSummaryPeriodError(period));assert.throws(()=>totals(period));
 }
});
test('validates contact details and stores currency as exact cents',()=>{
 const reservation=input('reservation','2099-03-01','2099-03-03');
 const parsed=data.parseAgendaInput({...reservation,responsible:' Ana ',email:'ana@example.com',city:' Salvador ',state:' BA ',rentalOrigin:' airbnb ',rentalAmountCents:150099});
 assert.equal(parsed.responsible,'Ana');assert.equal(parsed.city,'Salvador');assert.equal(parsed.state,'BA');assert.equal(parsed.rentalOrigin,'Airbnb');assert.equal(parsed.rentalAmountCents,150099);
 assert.throws(()=>data.parseAgendaInput({...reservation,email:'email inválido'}),/e-mail/);
 for(const value of [-1,NaN,Infinity,1.1,'100',100000000000]) assert.throws(()=>data.parseAgendaInput({...reservation,rentalAmountCents:value}),/valor/);
 assert.equal(data.rentalAmountToCents('1500,99'),150099);assert.equal(data.rentalAmountToCents('0.10'),10);assert.equal(data.rentalAmountToCents('0'),0);assert.equal(data.rentalAmountToCents(''),null);
 assert.equal(data.rentalAmountToCents('1.000,00'),100000);
 for(const value of ['-1','12,345','1e3','1.00,00','abc']) assert.throws(()=>data.rentalAmountToCents(value));
 const holiday=data.parseAgendaInput({...input('holiday','2099-03-01','2099-03-03'),responsible:'Private',rentalAmountCents:150000,rentalOrigin:'Airbnb'});
 assert.equal(holiday.responsible,'');assert.equal(holiday.rentalAmountCents,null);assert.equal(holiday.rentalOrigin,'');
});
test('rental input inserts cents while typing, preserves exact amounts and rejects unsafe pastes',()=>{
 let value='';
 for(const [digit,expected] of [['1','0,01'],['5','0,15'],['0','1,50'],['0','15,00'],['0','150,00'],['0','1.500,00']]) {
  value=data.formatRentalAmountInput(value+digit);assert.equal(value,expected);
 }
 assert.equal(data.rentalAmountToCents(value),150000);
 assert.equal(data.formatRentalAmountInput(value.slice(0,-1)),'150,00');
 assert.equal(data.formatRentalAmountInput(''),'');assert.equal(data.formatRentalAmountInput('000'),'0,00');
 assert.equal(data.formatRentalAmountInput('R$ 1.500,25'),'1.500,25');
 for(const cents of [0,1,10,99,100,250000,150099,99999999999]) assert.equal(data.rentalAmountToCents(data.formatRentalAmountInput(String(cents))),cents);
 for(const value of ['-150000','1e3','abc','100000000000']) assert.throws(()=>data.formatRentalAmountInput(value));
});
test('migrations preserve old reservations without inventing amounts',async()=>{
 const old=(await db.listAgenda()).find(item=>item.title==='Reserva antiga');
 assert.equal(old.responsible,'');assert.equal(old.rentalOrigin,'');assert.equal(old.rentalAmountCents,null);
 const group=data.summarizeRentalOrigins([old],[]).find(group=>group.origin==='Sem origem informada');
 assert.deepEqual(group,{origin:'Sem origem informada',count:1,amountCents:0,missingAmounts:1});
 await db.deleteAgenda(old.id);
});
test('atomic SQL rejects overlapping reservations, permits adjacency and holiday suggestions',async()=>{
 const first=await db.saveAgenda(input('reservation','2099-01-02','2099-01-05'),'host');
 await assert.rejects(()=>db.saveAgenda(input('reservation','2099-01-04','2099-01-07'),'host'),/coincide/);
 await db.saveAgenda(input('reservation','2099-01-05','2099-01-07'),'host');
 await db.saveAgenda(input('holiday','2099-01-02','2099-01-06','Long weekend'),'host');
 await db.saveAgenda(input('reservation','2099-01-02','2099-01-05'),'host',first.id);
 await assert.rejects(()=>db.saveAgenda(input('reservation','2099-01-02','2099-01-06'),'host',first.id),/coincide/);
 assert.equal(await db.saveAgenda(input('holiday','2099-01-02','2099-01-06'),'host',first.id),null);
});
test('public results hide reservation details and holiday drafts; deletion releases dates',async()=>{
 await db.saveAgenda({...input('holiday','2099-02-01','2099-02-04','Draft'),published:false},'host');
 const result=await db.publicAgenda();
 assert.equal(result.holidays.length,1);assert.equal(result.holidays[0].title,'Long weekend');
 assert.deepEqual(Object.keys(result.reservations[0]).sort(),['endDate','id','startDate']);
 assert.equal(JSON.stringify(result.reservations).includes('Private'),false);
 assert.equal(await db.deleteAgenda(result.reservations[0].id),true);
 assert.equal(data.isReserved('2099-01-02',(await db.publicAgenda()).reservations),false);
});
test('origins persist and totals track edits, moves and deletion without counting holidays',async()=>{
 assert.deepEqual(await db.listRentalOrigins(),['Site','Airbnb','Booking']);
 assert.equal(await db.createRentalOrigin(' indicação '),'indicação');
 assert.equal(await db.createRentalOrigin('INDICAÇÃO'),'indicação');
 assert.equal(await db.createRentalOrigin(' booking '),'Booking');
 assert.equal((await db.listRentalOrigins()).filter(name=>name.toLowerCase()==='indicação').length,1);
 const details={responsible:'Ana',email:'ana@example.com',city:'Salvador',state:'BA',rentalOrigin:'Airbnb',rentalAmountCents:10001};
 const one=await db.saveAgenda(data.parseAgendaInput({...input('reservation','2099-03-01','2099-03-03'),...details}),'host');
 const two=await db.saveAgenda(data.parseAgendaInput({...input('reservation','2099-03-03','2099-03-05'),...details,rentalAmountCents:20002}),'host');
 const summarize=async()=>data.summarizeRentalOrigins((await db.listAgenda()).filter(item=>item.id===one.id||item.id===two.id||item.kind==='holiday'),await db.listRentalOrigins());
 let groups=await summarize();
 assert.equal(groups.find(group=>group.origin==='Airbnb').amountCents,30003);
 assert.equal(groups.find(group=>group.origin==='Airbnb').count,2);
 await db.saveAgenda({...one,rentalOrigin:'Indicação',rentalAmountCents:50055},'host',one.id);
 const reread=(await db.listAgenda()).find(item=>item.id===one.id);
 assert.equal(reread.email,details.email);assert.equal(reread.city,details.city);assert.equal(reread.rentalOrigin,'indicação');assert.equal(reread.rentalAmountCents,50055);
 groups=await summarize();assert.equal(groups.find(group=>group.origin==='Airbnb').amountCents,20002);assert.equal(groups.find(group=>group.origin==='indicação').amountCents,50055);
 const publicResults=(await db.publicAgenda()).reservations;
 for(const item of publicResults) assert.deepEqual(Object.keys(item).sort(),['endDate','id','startDate']);
 assert.equal(JSON.stringify(publicResults).includes('ana@example.com'),false);
 await db.deleteAgenda(one.id);await db.deleteAgenda(two.id);
 groups=await summarize();assert.equal(groups.reduce((sum,group)=>sum+group.amountCents,0),0);
 assert.ok((await db.listRentalOrigins()).includes('indicação'));
});
