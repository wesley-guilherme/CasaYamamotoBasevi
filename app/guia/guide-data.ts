export type GuideArea =
  | "Prado"
  | "Guaratiba"
  | "Quati"
  | "Cumuruxatiba"
  | "Corumbau"
  | "Alcobaça"
  | "Caravelas";

export type DurationFilter = "rápido" | "meio-dia" | "dia-inteiro";
export type RouteSide = "prado" | "alcobaca" | "cumuruxatiba";

export type GuideTrait =
  | "casal"
  | "familia-criancas"
  | "grupo-amigos"
  | "restaurante"
  | "praia-deserta"
  | "mar-agitado"
  | "bom-noite"
  | "idoso"
  | "mar-calmo"
  | "agendar"
  | "rio"
  | "mirante"
  | "temporada"
  | "passeio-nautico"
  | "tabua-mare";

export type Destination = {
  id: string;
  area: GuideArea;
  title: string;
  category: string;
  summary: string;
  distanceKm: number;
  distance: string;
  driveMinutes: number;
  driveTime: string;
  duration: string;
  durationFilter: DurationFilter;
  routeSide: RouteSide;
  access: string;
  routeQuery: string;
  bestFor: string[];
  traits: GuideTrait[];
  features: string[];
  images?: string[];
  tide?: string;
  alert?: string;
  color: "coral" | "ocean" | "forest" | "sun" | "clay" | "night";
};

export const guideTraitLabels: Record<GuideTrait, string> = {
  casal: "casal",
  "familia-criancas": "família com crianças",
  "grupo-amigos": "grupo de amigos",
  restaurante: "tem restaurante",
  "praia-deserta": "praia deserta",
  "mar-agitado": "mar agitado em alguns horários",
  "bom-noite": "bom à noite",
  idoso: "adequado para idosos",
  "mar-calmo": "mar calmo",
  agendar: "agendar antes",
  rio: "rio",
  mirante: "mirante",
  temporada: "somente na temporada",
  "passeio-nautico": "passeio náutico",
  "tabua-mare": "confirmar maré com a operadora",
};

export const routeSideLabels: Record<RouteSide, string> = {
  prado: "Prado e arredores",
  alcobaca: "Litoral Sul",
  cumuruxatiba: "Litoral Norte",
};

export const guideAreas: GuideArea[] = [
  "Prado", "Guaratiba", "Quati", "Cumuruxatiba", "Corumbau", "Alcobaça", "Caravelas",
];

export const guideDestinations: Destination[] = [
  {
    id: "centro-historico-prado", area: "Prado", title: "Centro histórico e Beco das Garrafas",
    category: "Cultura e gastronomia", summary: "Casario, Igreja Matriz, praça, sabores locais e a noite mais gostosa da cidade.",
    distanceKm: 3.4, distance: "aprox. 3,4 km", driveMinutes: 6, driveTime: "6 min", duration: "2 a 4 horas", durationFilter: "rápido", routeSide: "prado",
    access: "Vias urbanas pavimentadas", routeQuery: "Beco das Garrafas, Prado - BA",
    bestFor: ["casal", "família", "amigos", "gastronomia", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "bom-noite", "idoso"],
    features: ["restaurantes", "passeio a pé", "bom à noite"], images: ["/images/guia/prado/centro_historico_beco_das_garrafas_1.webp", "/images/guia/prado/centro_historico_beco_das_garrafas_2.webp"], color: "coral",
  },
  {
    id: "praia-centro-coqueiral", area: "Prado", title: "Praias do Centro e Coqueiral",
    category: "Praia com estrutura", summary: "Uma escolha simples para curtir o mar sem transformar o dia em deslocamento.",
    distanceKm: 3.5, distance: "aprox. 3,5 km", driveMinutes: 8, driveTime: "8 min", duration: "2 a 5 horas", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Vias urbanas pavimentadas", routeQuery: "Praia do Coqueiral, Prado - BA",
    bestFor: ["casal", "família", "crianças", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso"],
    features: ["barracas", "alimentação", "mar varia ao longo do dia"], images: ["/images/guia/prado/praia_do_centro_coqueiral_1.webp", "/images/guia/prado/praia_do_centro_coqueiral_2.webp"], color: "ocean",
  },
  {
    id: "praia-novo-prado", area: "Prado", title: "Praia do Novo Prado", category: "Praia com estrutura",
    summary: "Praia urbana com barracas e acesso simples para passar algumas horas perto da cidade.",
    distanceKm: 2.4, distance: "aprox. 2,4 km", driveMinutes: 6, driveTime: "6 min", duration: "2 a 5 horas", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Vias urbanas pavimentadas", routeQuery: "Praia do Novo Prado, Prado - BA",
    bestFor: ["casal", "família", "crianças", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso"],
    features: ["barracas", "alimentação", "perto da Casa"], images: ["/images/guia/prado/praia_do_novo_prado.webp"], color: "sun",
  },
  {
    id: "praia-basevi", area: "Prado", title: "Praia Basevi", category: "Praia perto da Casa",
    summary: "A opção mais próxima para sentir o mar, caminhar na areia e aproveitar sem precisar de um grande deslocamento.",
    distanceKm: 0.3, distance: "aprox. 300 m", driveMinutes: 2, driveTime: "2 min", duration: "1 a 4 horas", durationFilter: "rápido", routeSide: "cumuruxatiba",
    access: "Acesso local pelo bairro Basevi", routeQuery: "Praia Basevi, Prado - BA",
    bestFor: ["casal", "família", "crianças", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso"],
    features: ["perto da Casa", "banho de mar", "caminhada"], images: ["/images/guia/prado/praia_basevi.webp"], color: "ocean",
  },
  {
    id: "rio-jucurucu", area: "Prado", title: "Rio Jucuruçu", category: "Rio e paisagem",
    summary: "Um passeio leve para observar o encontro das águas, a vida ribeirinha e a paisagem de Prado.",
    distanceKm: 4.2, distance: "aprox. 4,2 km", driveMinutes: 10, driveTime: "10 min", duration: "2 a 4 horas", durationFilter: "rápido", routeSide: "prado",
    access: "Vias urbanas até a região do rio", routeQuery: "Rio Jucuruçu, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "rio"],
    features: ["rio", "paisagem", "alimentação próxima"], images: ["/images/guia/prado/rio_jucurucu.webp"], color: "forest",
  },
  {
    id: "inicio-falesias", area: "Prado", title: "Início das Falésias", category: "Mirante e falésias",
    summary: "Na Praia do Farol, o litoral começa a ganhar falésias coloridas e uma vista ampla da costa.",
    distanceKm: 6.8, distance: "aprox. 6,8 km", driveMinutes: 15, driveTime: "15 min", duration: "2 a 4 horas", durationFilter: "rápido", routeSide: "cumuruxatiba",
    access: "Siga em direção à Praia do Farol; confirme a condição do trecho final", routeQuery: "Início das Falésias Praia do Farol, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "fotografia"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mirante"],
    features: ["falésias", "mirante", "restaurante próximo"], images: ["/images/guia/prado/inicio_das_falesias_praia_do_farol.webp"], color: "clay",
  },
  {
    id: "praia-da-paixao", area: "Prado", title: "Praia da Paixão", category: "Praia e falésias",
    summary: "Falésias coloridas e uma paisagem que já começa a mostrar o litoral mais selvagem.",
    distanceKm: 9, distance: "aprox. 9 km", driveMinutes: 22, driveTime: "22 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Trechos sujeitos à condição da estrada", routeQuery: "Praia da Paixão, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "fotografia"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso"],
    features: ["falésias", "banho de mar", "confirmar estrutura"], images: ["/images/guia/prado/praia_da_paixao.webp"], color: "clay",
  },
  {
    id: "praia-do-tororao", area: "Prado", title: "Praia do Tororão", category: "Praia e natureza",
    summary: "Mar, falésias e a famosa bica de água doce junto à faixa de areia.",
    distanceKm: 11, distance: "aprox. 11 km", driveMinutes: 28, driveTime: "28 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Trechos sujeitos à condição da estrada", routeQuery: "Praia do Tororão, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "natureza"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso"],
    features: ["bica de água doce", "falésias", "restaurante"], images: ["/images/guia/prado/praia_do_tororao.webp"], color: "ocean",
  },
  {
    id: "cabana-oasis", area: "Prado", title: "Cabana Oásis Deck Praia", category: "Praia, rio e estrutura",
    summary: "Uma parada de praia com restaurante, pequeno rio e vista para as falésias no caminho do litoral norte.",
    distanceKm: 11.5, distance: "aprox. 11,5 km", driveMinutes: 27, driveTime: "27 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "BA-001, km 10, em direção a Cumuruxatiba", routeQuery: "RQ2P+Q7 Prado, Bahia",
    bestFor: ["casal", "família", "amigos", "idosos", "gastronomia"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso", "rio", "mirante"],
    features: ["restaurante", "rio", "vista das falésias"], images: ["/images/guia/prado/rancho_oasis.webp"], alert: "Confirme o funcionamento antes de sair.", color: "sun",
  },
  {
    id: "visita-baleias", area: "Prado", title: "Visita às baleias-jubarte", category: "Passeio náutico sazonal",
    summary: "Saída de barco para observar as jubartes durante a temporada, sempre com operadora habilitada.",
    distanceKm: 4, distance: "aprox. 4 km + barco", driveMinutes: 10, driveTime: "10 min + barco", duration: "Dia inteiro", durationFilter: "dia-inteiro", routeSide: "prado",
    access: "Embarque definido pela operadora; exige reserva", routeQuery: "Píer de Prado, Prado - BA",
    bestFor: ["casal", "amigos", "aventura", "natureza"], traits: ["casal", "grupo-amigos", "praia-deserta", "mar-agitado", "agendar", "temporada", "passeio-nautico", "tabua-mare"],
    features: ["temporada", "reservar antes", "passeio náutico"], images: ["/images/guia/prado/baleia_jubarte.webp"], alert: "A saída depende da temporada, do mar e da confirmação da operadora. O melhor período de avistamento é entre agosto e outubro. Avistamentos não são garantidos.", color: "ocean",
  },
  {
    id: "parque-descobrimento", area: "Prado", title: "Parque Nacional do Descobrimento", category: "Mata Atlântica",
    summary: "Uma imersão na floresta protegida que ajuda a entender o território além da praia.",
    distanceKm: 36, distance: "aprox. 36 km", driveMinutes: 50, driveTime: "50 min", duration: "Meio dia ou mais", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "BA-489, portaria no km 34", routeQuery: "Parque Nacional do Descobrimento, Prado - BA",
    bestFor: ["casal", "amigos", "aventura", "natureza"], traits: ["casal", "grupo-amigos", "agendar", "rio", "mirante"],
    features: ["agendar antes", "trilha", "mirante"], images: ["/images/guia/prado/parque_nacional_descobrimento.webp"],
    alert: "Confirme visitação, horário e necessidade de condutor com o ICMBio.", color: "forest",
  },
  {
    id: "praia-guaratiba", area: "Guaratiba", title: "Balneário Guaratiba", category: "Praia e balneário",
    summary: "Praia, descanso e estrutura de balneário no caminho de Alcobaça.",
    distanceKm: 14, distance: "aprox. 14 km", driveMinutes: 22, driveTime: "22 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "alcobaca",
    access: "Siga pela BA-001 no sentido de Alcobaça e confirme a entrada pública", routeQuery: "Balneário Guaratiba, Prado - BA",
    bestFor: ["casal", "família", "crianças", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "bom-noite", "idoso", "mar-calmo", "rio"],
    features: ["restaurantes", "bom à noite", "mar varia no dia"], images: ["/images/guia/guaratiba/praia_de_guaratiba_1.webp"], color: "sun",
  },
  {
    id: "recifes-guaratiba", area: "Guaratiba", title: "Recifes de Corais de Guaratiba", category: "Passeio náutico",
    summary: "Passeio até os recifes para contemplação e banho conforme as condições do mar e da maré.",
    distanceKm: 14, distance: "aprox. 14 km + barco", driveMinutes: 22, driveTime: "22 min + barco", duration: "Meio período", durationFilter: "meio-dia", routeSide: "alcobaca",
    access: "Saída pelo balneário com operadora; reserva e maré devem ser confirmadas", routeQuery: "Balneário Guaratiba, Prado - BA",
    bestFor: ["casal", "família", "amigos", "natureza"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "praia-deserta", "mar-agitado", "agendar", "mirante", "passeio-nautico", "tabua-mare"],
    features: ["reservar antes", "passeio náutico", "confirmar maré"], images: ["/images/guia/guaratiba/recife_corais_guaratiba.webp"], alert: "Confirme maré, vento e saída diretamente com a operadora.", color: "ocean",
  },
  {
    id: "praia-quati", area: "Quati", title: "Praia do Quati", category: "Praia preservada",
    summary: "Trecho reservado entre Prado e Alcobaça, com pouca estrutura e vocação contemplativa.",
    distanceKm: 18, distance: "aprox. 18 km", driveMinutes: 32, driveTime: "32 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "alcobaca",
    access: "Acesso pouco sinalizado; orientação local recomendada", routeQuery: "Praia do Quati, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "sossego"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "mar-agitado", "idoso", "rio"],
    features: ["rio", "pouca estrutura", "orientação local"], images: ["/images/guia/quati/pria_do_quati_1.webp"], color: "forest",
  },
  {
    id: "japara-grande", area: "Cumuruxatiba", title: "Praia Japara Grande", category: "Praia, rio e falésias",
    summary: "Encontro de rio e mar com falésias e apoio de restaurante para um passeio mais confortável.",
    distanceKm: 18.5, distance: "aprox. 18,5 km", driveMinutes: 38, driveTime: "38 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Estrada litorânea; confirme as condições após chuva", routeQuery: "Praia Japara Grande, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "natureza"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo", "rio", "mirante"],
    features: ["rio", "mirante", "restaurante"], images: ["/images/guia/cumuruxatiba/praia_japara_grande.webp"], color: "clay",
  },
  {
    id: "japara-mirim", area: "Cumuruxatiba", title: "Praia Japara Mirim", category: "Praia preservada",
    summary: "Faixa de areia tranquila entre falésias e rio, indicada para quem busca natureza e pouco movimento.",
    distanceKm: 20, distance: "aprox. 20 km", driveMinutes: 42, driveTime: "42 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Trecho litorâneo não pavimentado; confirme a condição da estrada", routeQuery: "Praia Japara Mirim, Prado - BA",
    bestFor: ["casal", "família", "amigos", "sossego", "natureza"], traits: ["casal", "familia-criancas", "grupo-amigos", "praia-deserta", "mar-calmo", "rio", "mirante"],
    features: ["praia deserta", "rio", "mirante"], images: ["/images/guia/cumuruxatiba/praia_japara_mirim.webp"], color: "forest",
  },
  {
    id: "vila-cumuruxatiba", area: "Cumuruxatiba", title: "Vila de Cumuruxatiba", category: "Vila, praia e gastronomia",
    summary: "Um dia de ritmo desacelerado entre praia, artesanato, píer e comida local.",
    distanceKm: 29, distance: "aprox. 29 km", driveMinutes: 56, driveTime: "56 min", duration: "Dia inteiro", durationFilter: "dia-inteiro", routeSide: "cumuruxatiba",
    access: "Condição do trajeto deve ser confirmada no dia", routeQuery: "Cumuruxatiba, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "gastronomia"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "praia-deserta", "bom-noite", "idoso", "mar-calmo", "rio", "mirante"],
    features: ["restaurantes", "bom à noite", "mar calmo"], images: ["/images/guia/cumuruxatiba/vila_cumuruxatiba.webp"], alert: "Consulte o anfitrião sobre acesso e segurança antes de sair.", color: "forest",
  },
  {
    id: "represa-cumuruxatiba", area: "Cumuruxatiba", title: "Represa de Cumuruxatiba", category: "Rio e natureza",
    summary: "Água doce e vegetação formam uma parada diferente das praias da vila.",
    distanceKm: 29.5, distance: "aprox. 29,5 km", driveMinutes: 60, driveTime: "1 h", duration: "2 a 4 horas", durationFilter: "rápido", routeSide: "cumuruxatiba",
    access: "Acesso local a partir da vila; peça orientação e confirme as condições", routeQuery: "Represa de Cumuruxatiba, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "natureza"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "rio"],
    features: ["água doce", "rio", "orientação local"], images: ["/images/guia/cumuruxatiba/represa_de_cumuruxatiba.webp"], color: "forest",
  },
  {
    id: "praia-pier-cumuruxatiba", area: "Cumuruxatiba", title: "Praia do Píer", category: "Praia da vila",
    summary: "O cartão-postal de Cumuruxatiba, com mar geralmente tranquilo e restaurantes por perto.",
    distanceKm: 29, distance: "aprox. 29 km", driveMinutes: 56, driveTime: "56 min", duration: "2 a 5 horas", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Acesso pela vila de Cumuruxatiba", routeQuery: "Píer de Cumuruxatiba, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo"],
    features: ["píer", "restaurantes", "mar calmo"], images: ["/images/guia/cumuruxatiba/praia_do_pier.webp"], color: "ocean",
  },
  {
    id: "praia-moreira", area: "Cumuruxatiba", title: "Praia do Moreira", category: "Praia preservada",
    summary: "Praia reservada, com encontro de água doce e visual aberto do alto das falésias.",
    distanceKm: 32, distance: "aprox. 32 km", driveMinutes: 65, driveTime: "1 h 05 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Acesso não pavimentado; orientação local é recomendada", routeQuery: "Praia do Moreira, Cumuruxatiba - BA",
    bestFor: ["casal", "família", "amigos", "sossego"], traits: ["casal", "familia-criancas", "grupo-amigos", "praia-deserta", "mar-calmo", "rio", "mirante"],
    features: ["praia deserta", "rio", "mirante"], images: ["/images/guia/cumuruxatiba/praia_do_moreira.webp"], color: "clay",
  },
  {
    id: "praia-imbassuaba", area: "Cumuruxatiba", title: "Praia do Imbassuaba", category: "Praia preservada",
    summary: "Um trecho mais isolado de mar calmo, rio e paisagem natural para conhecer sem pressa.",
    distanceKm: 36, distance: "aprox. 36 km", driveMinutes: 72, driveTime: "1 h 12 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "cumuruxatiba",
    access: "Estrada de terra e acesso local; confirme antes de seguir", routeQuery: "Praia do Imbassuaba, Prado - BA",
    bestFor: ["casal", "família", "amigos", "sossego"], traits: ["casal", "familia-criancas", "grupo-amigos", "praia-deserta", "mar-calmo", "rio", "mirante"],
    features: ["praia deserta", "rio", "mirante"], images: ["/images/guia/cumuruxatiba/praia_da_imbassuaba.webp"], color: "forest",
  },
  {
    id: "barra-do-cahy", area: "Cumuruxatiba", title: "Barra do Cahy", category: "Rio, mar e história",
    summary: "Foz do rio, falésias e memória histórica em um território de presença Pataxó.",
    distanceKm: 45, distance: "aprox. 45 km", driveMinutes: 80, driveTime: "1 h 20 min", duration: "Dia inteiro", durationFilter: "dia-inteiro", routeSide: "cumuruxatiba",
    access: "Estrada rural; não siga sem confirmação local", routeQuery: "Barra do Cahy, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "história"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo", "rio"],
    features: ["rio e mar", "restaurante", "história"], images: ["/images/guia/cumuruxatiba/praia_barra_do_cahy.webp", "/images/guia/cumuruxatiba/praia_barra_do_cahy2.webp", "/images/guia/cumuruxatiba/praia_barra_do_cahy3.webp", "/images/guia/cumuruxatiba/praia_barra_do_cahy4.webp"],
    alert: "Rota condicionada à confirmação atual de acesso e segurança.", color: "clay",
  },
  {
    id: "praia-taua", area: "Corumbau", title: "Praia do Tauá", category: "Praia preservada",
    summary: "Praia tranquila no território de Corumbau, com rio e pouca movimentação.",
    distanceKm: 67, distance: "aprox. 67 km", driveMinutes: 120, driveTime: "2 h", duration: "Dia inteiro", durationFilter: "dia-inteiro", routeSide: "cumuruxatiba",
    access: "Trajeto longo, com trechos não pavimentados e acesso a confirmar", routeQuery: "Praia do Tauá, Prado - BA",
    bestFor: ["casal", "família", "amigos", "sossego"], traits: ["casal", "familia-criancas", "grupo-amigos", "praia-deserta", "mar-calmo", "rio"],
    features: ["praia deserta", "mar calmo", "rio"], images: ["/images/guia/corumbau/praia_do_taua.webp"], alert: "Confirme acesso e segurança antes de sair.", color: "forest",
  },
  {
    id: "praia-pixane", area: "Corumbau", title: "Praia de Corumbau (Pixane)", category: "Praia preservada",
    summary: "Trecho conhecido como Pixane, cercado por natureza e indicado para um dia inteiro.",
    distanceKm: 75, distance: "aprox. 75 km", driveMinutes: 135, driveTime: "2 h 15 min", duration: "Dia inteiro", durationFilter: "dia-inteiro", routeSide: "cumuruxatiba",
    access: "Trechos não pavimentados; confirme o caminho e a segurança no dia", routeQuery: "Praia do Pixane, Corumbau - BA",
    bestFor: ["casal", "família", "amigos", "sossego"], traits: ["casal", "familia-criancas", "grupo-amigos", "praia-deserta", "mar-calmo", "rio"],
    features: ["praia deserta", "mar calmo", "rio"], images: ["/images/guia/corumbau/praia_do_pixane.webp"], alert: "Confirme acesso e segurança antes de sair.", color: "ocean",
  },
  {
    id: "ponta-corumbau", area: "Corumbau", title: "Ponta do Corumbau", category: "Paisagem de maré",
    summary: "Banco de areia, recifes, rio e cultura pesqueira em uma das paisagens mais singulares da região.",
    distanceKm: 85, distance: "aprox. 85 km", driveMinutes: 155, driveTime: "2 h 35 min", duration: "Dia inteiro", durationFilter: "dia-inteiro", routeSide: "cumuruxatiba",
    access: "Trajeto longo com trechos não pavimentados", routeQuery: "Ponta do Corumbau, Prado - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "natureza"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo"],
    features: ["depende da maré", "restaurantes", "saída cedo"], images: ["/images/guia/corumbau/praia_ponta_do_corumbau.webp"],
    tide: "A ponta de areia aparece melhor durante a maré baixa.", alert: "Confirme acesso, segurança e maré antes de sair.", color: "ocean",
  },
  {
    id: "alcobaca-orla", area: "Alcobaça", title: "Orla e centro de Alcobaça", category: "Cidade vizinha",
    summary: "Um passeio leve pela orla e pela história de uma das cidades da Costa das Baleias.",
    distanceKm: 29, distance: "aprox. 29 km", driveMinutes: 32, driveTime: "32 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "alcobaca",
    access: "BA-001 pavimentada no sentido de Alcobaça", routeQuery: "Orla de Alcobaça, Alcobaça - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "história"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "bom-noite", "idoso"],
    features: ["orla", "centro", "gastronomia"], images: ["/images/guia/alcobaca/orla_de_alcobaca.webp"], color: "sun",
  },
  {
    id: "farol-alcobaca", area: "Alcobaça", title: "Farol de Alcobaça", category: "Farol e praia",
    summary: "Um ponto marcante da orla para caminhar, observar o mar e conhecer a paisagem da cidade.",
    distanceKm: 30, distance: "aprox. 30 km", driveMinutes: 35, driveTime: "35 min", duration: "1 a 3 horas", durationFilter: "rápido", routeSide: "alcobaca",
    access: "BA-001 até Alcobaça e vias urbanas da orla", routeQuery: "Farol de Alcobaça, Alcobaça - BA",
    bestFor: ["casal", "família", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo"],
    features: ["farol", "orla", "mar calmo"], images: ["/images/guia/alcobaca/farol_de_alcobaca.webp"], color: "ocean",
  },
  {
    id: "barra-alcobaca", area: "Alcobaça", title: "Barra de Alcobaça", category: "Rio e mar",
    summary: "O encontro do rio com o mar forma um passeio tranquilo com apoio da cidade por perto.",
    distanceKm: 31, distance: "aprox. 31 km", driveMinutes: 38, driveTime: "38 min", duration: "2 a 4 horas", durationFilter: "rápido", routeSide: "alcobaca",
    access: "BA-001 até Alcobaça e acesso urbano à barra", routeQuery: "Barra de Alcobaça, Alcobaça - BA",
    bestFor: ["casal", "família", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo", "rio"],
    features: ["rio e mar", "restaurantes", "mar calmo"], images: ["/images/guia/alcobaca/praia_da_barra.webp"], color: "forest",
  },
  {
    id: "praca-caixa-dagua", area: "Alcobaça", title: "Praça da Caixa-d’Água", category: "Praça e convivência",
    summary: "Uma parada urbana para caminhar, encontrar restaurantes e aproveitar o movimento no fim do dia.",
    distanceKm: 29.5, distance: "aprox. 29,5 km", driveMinutes: 34, driveTime: "34 min", duration: "1 a 3 horas", durationFilter: "rápido", routeSide: "alcobaca",
    access: "BA-001 até Alcobaça e vias urbanas pavimentadas", routeQuery: "Praça da Caixa d'Água, Alcobaça - BA",
    bestFor: ["casal", "família", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "bom-noite", "idoso"],
    features: ["restaurantes", "bom à noite", "passeio leve"], images: ["/images/guia/alcobaca/praca_caixa_dagua.webp"], color: "coral",
  },
  {
    id: "caravelas-historica", area: "Caravelas", title: "Centro Histórico de Caravelas e píer", category: "História e manguezal",
    summary: "Casario, igrejas, rua do porto e um fim de tarde voltado para o manguezal.",
    distanceKm: 55, distance: "aprox. 55 km", driveMinutes: 60, driveTime: "1 h", duration: "Meio dia ou mais", durationFilter: "meio-dia", routeSide: "alcobaca",
    access: "BA-001 pavimentada, passando por Alcobaça", routeQuery: "Píer Municipal de Caravelas, Caravelas - BA",
    bestFor: ["casal", "família", "amigos", "idosos", "história"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "bom-noite", "idoso", "rio"],
    features: ["casario", "píer", "bom à noite"], images: ["/images/guia/caravelas/caravelas_historica.webp", "/images/guia/caravelas/pier_municipal_barra_de_caravelas.webp", "/images/guia/caravelas/barra_de_caravelas.webp"], color: "night",
  },
  {
    id: "praia-grauca", area: "Caravelas", title: "Praia do Grauçá", category: "Praia com estrutura",
    summary: "Praia próxima à cidade de Caravelas, com restaurantes e mar geralmente tranquilo.",
    distanceKm: 60, distance: "aprox. 60 km", driveMinutes: 70, driveTime: "1 h 10 min", duration: "Meio período", durationFilter: "meio-dia", routeSide: "alcobaca",
    access: "BA-001 até Caravelas e acesso local à praia", routeQuery: "Praia do Grauçá, Caravelas - BA",
    bestFor: ["casal", "família", "amigos", "idosos"], traits: ["casal", "familia-criancas", "grupo-amigos", "restaurante", "idoso", "mar-calmo"],
    features: ["restaurantes", "mar calmo", "praia"], images: ["/images/guia/caravelas/praia_do_grauca.webp"], color: "sun",
  },
  {
    id: "centro-visitantes-abrolhos", area: "Caravelas", title: "Centro de Visitantes de Abrolhos", category: "Natureza e educação",
    summary: "Uma experiência em terra com exposições, réplica de jubarte, realidade virtual e trilha costeira.",
    distanceKm: 58, distance: "aprox. 58 km", driveMinutes: 70, driveTime: "1 h 10 min", duration: "2 a 4 horas", durationFilter: "rápido", routeSide: "alcobaca",
    access: "Praia do Kitongo, acesso urbano", routeQuery: "Centro de Visitantes do Parque Nacional Marinho dos Abrolhos, Caravelas - BA",
    bestFor: ["família", "crianças", "idosos", "natureza"], traits: ["familia-criancas", "grupo-amigos", "idoso", "agendar"],
    features: ["atividade em terra", "educativo", "confirmar horário"], images: ["/images/guia/caravelas/centro_de_visitantes_de_abrolhos.webp"], color: "ocean",
  },
  {
    id: "abrolhos", area: "Caravelas", title: "Arquipélago de Abrolhos", category: "Passeio marítimo",
    summary: "Recifes, aves, mergulho e, na temporada, possibilidade de observar baleias-jubarte.",
    distanceKm: 58, distance: "aprox. 58 km + barco", driveMinutes: 70, driveTime: "1 h 10 min + barco", duration: "1 a 3 dias", durationFilter: "dia-inteiro", routeSide: "alcobaca",
    access: "Embarque em Caravelas com operadora autorizada", routeQuery: "Centro de Visitantes do Parque Nacional Marinho dos Abrolhos, Caravelas - BA",
    bestFor: ["casal", "amigos", "aventura", "natureza", "mergulho"], traits: ["casal", "grupo-amigos", "restaurante", "praia-deserta", "mar-agitado", "agendar", "mirante", "passeio-nautico", "tabua-mare"],
    features: ["reservar antes", "depende do mar", "operadora autorizada"], images: ["/images/guia/caravelas/arquipelago_de_abrolhos.webp"], alert: "O passeio depende do mar e pode ser cancelado. Confirme tudo com a operadora.", color: "ocean",
  },
];

export const casaAddress = "Rua L. Quinze, 6B · Basevi · Prado–BA";
export const casaPlusCode = "MQGH+M6 Prado, BA";
