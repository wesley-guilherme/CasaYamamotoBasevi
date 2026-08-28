export type GuideArea =
  | "Prado"
  | "Guaratiba"
  | "Quati"
  | "Cumuruxatiba"
  | "Corumbau"
  | "Alcobaça"
  | "Caravelas";

export type DurationFilter = "rápido" | "meio-dia" | "dia-inteiro";

export type Destination = {
  id: string;
  area: GuideArea;
  title: string;
  category: string;
  summary: string;
  distance: string;
  driveTime: string;
  duration: string;
  durationFilter: DurationFilter;
  access: string;
  routeQuery: string;
  bestFor: string[];
  features: string[];
  tide?: string;
  alert?: string;
  color: "coral" | "ocean" | "forest" | "sun" | "clay" | "night";
};

export const guideAreas: GuideArea[] = [
  "Prado", "Guaratiba", "Quati", "Cumuruxatiba", "Corumbau", "Alcobaça", "Caravelas",
];

export const guideDestinations: Destination[] = [
  {
    id: "centro-historico-prado", area: "Prado", title: "Centro histórico e Beco das Garrafas",
    category: "Cultura e gastronomia", summary: "Casario, Igreja Matriz, praça, sabores locais e a noite mais gostosa da cidade.",
    distance: "aprox. 4 km", driveTime: "10 min", duration: "2 a 4 horas", durationFilter: "rápido",
    access: "Vias urbanas pavimentadas", routeQuery: "Beco das Garrafas, Prado - BA",
    bestFor: ["casal", "família", "gastronomia"], features: ["restaurantes", "passeio a pé", "bom à noite"], color: "coral",
  },
  {
    id: "praia-centro-coqueiral", area: "Prado", title: "Praias do Centro e Coqueiral",
    category: "Praia com estrutura", summary: "Uma escolha simples para curtir o mar sem transformar o dia em deslocamento.",
    distance: "aprox. 4 km", driveTime: "10 min", duration: "2 a 5 horas", durationFilter: "meio-dia",
    access: "Vias urbanas pavimentadas", routeQuery: "Praia do Coqueiral, Prado - BA",
    bestFor: ["família", "crianças", "praticidade"], features: ["barracas", "alimentação", "perto do centro"], color: "ocean",
  },
  {
    id: "praia-da-paixao", area: "Prado", title: "Praia da Paixão", category: "Praia e falésias",
    summary: "Falésias coloridas e uma paisagem que já começa a mostrar o litoral mais selvagem.",
    distance: "aprox. 13 km", driveTime: "25 min", duration: "Meio período", durationFilter: "meio-dia",
    access: "Trechos sujeitos à condição da estrada", routeQuery: "Praia da Paixão, Prado - BA",
    bestFor: ["casal", "fotografia", "natureza"], features: ["falésias", "banho de mar", "confirmar estrutura"], color: "clay",
  },
  {
    id: "praia-do-tororao", area: "Prado", title: "Praia do Tororão", category: "Praia e natureza",
    summary: "Mar, falésias e a famosa bica de água doce junto à faixa de areia.",
    distance: "aprox. 18 km", driveTime: "30 min", duration: "Meio período", durationFilter: "meio-dia",
    access: "Trechos sujeitos à condição da estrada", routeQuery: "Praia do Tororão, Prado - BA",
    bestFor: ["família", "fotografia", "natureza"], features: ["bica de água doce", "falésias", "restaurante a confirmar"], color: "ocean",
  },
  {
    id: "parque-descobrimento", area: "Prado", title: "Parque Nacional do Descobrimento", category: "Mata Atlântica",
    summary: "Uma imersão na floresta protegida que ajuda a entender o território além da praia.",
    distance: "aprox. 36 km", driveTime: "50 min", duration: "Meio dia ou mais", durationFilter: "meio-dia",
    access: "BA-489, portaria no km 34", routeQuery: "Parque Nacional do Descobrimento, Prado - BA",
    bestFor: ["aventura", "natureza", "observação"], features: ["agendar antes", "trilha", "condições variáveis"],
    alert: "Confirme visitação, horário e necessidade de condutor com o ICMBio.", color: "forest",
  },
  {
    id: "praia-guaratiba", area: "Guaratiba", title: "Praia de Guaratiba", category: "Praia tranquila",
    summary: "Mar, descanso e uma alternativa ao litoral norte para um dia sem muita pressa.",
    distance: "aprox. 15 km", driveTime: "25 min", duration: "Meio período", durationFilter: "meio-dia",
    access: "Acesso ao balneário; confirme entrada pública", routeQuery: "Praia de Guaratiba, Prado - BA",
    bestFor: ["família", "crianças", "descanso"], features: ["praia", "estrutura a confirmar", "carro comum"], color: "sun",
  },
  {
    id: "praia-quati", area: "Quati", title: "Praia do Quati", category: "Praia preservada",
    summary: "Trecho reservado entre Prado e Alcobaça, com pouca estrutura e vocação contemplativa.",
    distance: "aprox. 18 km", driveTime: "35 min", duration: "Meio período", durationFilter: "meio-dia",
    access: "Acesso pouco sinalizado; orientação local recomendada", routeQuery: "Praia do Quati, Prado - BA",
    bestFor: ["casal", "sossego", "natureza"], features: ["sem estrutura", "levar água", "melhor na maré baixa"],
    tide: "Na maré baixa, bancos de areia e pequenas piscinas ficam mais visíveis.", color: "forest",
  },
  {
    id: "vila-cumuruxatiba", area: "Cumuruxatiba", title: "Vila e praias de Cumuruxatiba", category: "Vila, praia e gastronomia",
    summary: "Um dia de ritmo desacelerado entre praia, artesanato, píer e comida local.",
    distance: "aprox. 32 km", driveTime: "1 h", duration: "Dia inteiro", durationFilter: "dia-inteiro",
    access: "Condição do trajeto deve ser confirmada no dia", routeQuery: "Cumuruxatiba, Prado - BA",
    bestFor: ["casal", "família", "gastronomia"], features: ["restaurantes", "artesanato", "praia"],
    alert: "Consulte o anfitrião sobre acesso e segurança antes de sair.", color: "forest",
  },
  {
    id: "barra-do-cahy", area: "Cumuruxatiba", title: "Barra do Cahy", category: "Rio, mar e história",
    summary: "Foz do rio, falésias e memória histórica em um território de presença Pataxó.",
    distance: "aprox. 50 km", driveTime: "1 h 35 min", duration: "Dia inteiro", durationFilter: "dia-inteiro",
    access: "Estrada rural; não siga sem confirmação local", routeQuery: "Barra do Cahy, Prado - BA",
    bestFor: ["história", "natureza", "fotografia"], features: ["rio e mar", "falésias", "acesso sensível"],
    alert: "Rota condicionada à confirmação atual de acesso e segurança.", color: "clay",
  },
  {
    id: "ponta-corumbau", area: "Corumbau", title: "Ponta do Corumbau", category: "Paisagem de maré",
    summary: "Banco de areia, recifes, rio e cultura pesqueira em uma das paisagens mais singulares da região.",
    distance: "aprox. 88 km", driveTime: "2 h 40 min", duration: "Dia inteiro", durationFilter: "dia-inteiro",
    access: "Trajeto longo com trechos não pavimentados", routeQuery: "Ponta do Corumbau, Prado - BA",
    bestFor: ["casal", "natureza", "fotografia"], features: ["depende da maré", "restaurantes", "saída cedo"],
    tide: "A ponta de areia aparece melhor durante a maré baixa.",
    alert: "Confirme acesso, segurança e maré com o anfitrião antes de sair.", color: "ocean",
  },
  {
    id: "alcobaca-orla", area: "Alcobaça", title: "Orla e centro de Alcobaça", category: "Cidade vizinha",
    summary: "Um passeio leve pela orla, pela praça e pela história de uma das cidades da Costa das Baleias.",
    distance: "aprox. 26 km", driveTime: "35 min", duration: "Meio período", durationFilter: "meio-dia",
    access: "BA-001 pavimentada", routeQuery: "Praça de Alcobaça, Alcobaça - BA",
    bestFor: ["família", "história", "passeio leve"], features: ["orla", "centro", "gastronomia"], color: "sun",
  },
  {
    id: "caravelas-historica", area: "Caravelas", title: "Caravelas histórica e píer", category: "História e manguezal",
    summary: "Casario, igrejas, rua do porto e um fim de tarde voltado para o manguezal.",
    distance: "aprox. 52 km", driveTime: "1 h", duration: "Meio dia ou mais", durationFilter: "meio-dia",
    access: "BA-001 pavimentada", routeQuery: "Píer Municipal de Caravelas, Caravelas - BA",
    bestFor: ["família", "história", "fotografia"], features: ["casario", "píer", "manguezal"], color: "night",
  },
  {
    id: "centro-visitantes-abrolhos", area: "Caravelas", title: "Centro de Visitantes de Abrolhos", category: "Natureza e educação",
    summary: "Uma experiência em terra com exposições, réplica de jubarte, realidade virtual e trilha costeira.",
    distance: "aprox. 55 km", driveTime: "1 h 10 min", duration: "2 a 4 horas", durationFilter: "rápido",
    access: "Praia do Kitongo, acesso urbano", routeQuery: "Centro de Visitantes do Parque Nacional Marinho dos Abrolhos, Caravelas - BA",
    bestFor: ["crianças", "família", "natureza"], features: ["atividade em terra", "educativo", "confirmar horário"], color: "ocean",
  },
  {
    id: "abrolhos", area: "Caravelas", title: "Arquipélago de Abrolhos", category: "Passeio marítimo",
    summary: "Recifes, aves, mergulho e, na temporada, maior chance de observar baleias-jubarte.",
    distance: "55 km + barco", driveTime: "Dia completo", duration: "1 a 3 dias", durationFilter: "dia-inteiro",
    access: "Embarque em Caravelas com operadora autorizada", routeQuery: "Centro de Visitantes do Parque Nacional Marinho dos Abrolhos, Caravelas - BA",
    bestFor: ["aventura", "natureza", "mergulho"], features: ["reservar antes", "depende do mar", "operadora autorizada"],
    alert: "O passeio depende do mar e pode ser cancelado. Não há garantia de avistamento de baleias.", color: "ocean",
  },
];

export const publicNavigationOrigin = "Basevi, Prado - BA";
