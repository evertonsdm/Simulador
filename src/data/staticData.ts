
import { ConditionContext, ShinyEvent } from '../types/character';

export const PROFISSOES_CATEGORIZADAS = {
  "Alta Elite & Corporativo": [
    "CEO de Startup", "Diretor Executivo na Paulista", "Diretor de Multinacional", "Faria Limer / Investment Banker", 
    "Herdeiro / Gestor de Patrimônio", "Juiz de Direito", "Sócio de Construtora / Infraestrutura", 
    "Sócio de Escritório de Advocacia", "Arquiteto de Resorts e Hotelaria", "Conselheiro de Administração", 
    "Cirurgião Plástico", "Investidor de Risco"
  ],
  "Agronegócio & Latifúndio": [
    "Barão da Soja", "Grande Pecuarista", "Empresário do Agronegócio", "Diretor de Cooperativa Agrícola", 
    "Latifundiário de Grãos", "Engenheiro Agrônomo", "Agrônomo Especialista em Irrigação",
    "Gestor de Frota Agroindustrial", "Operador de Maquinário Agrícola"
  ],
  "Engrenagem Corporativa / Classe Média": [
    "Advogado Associado", "Analista Financeiro Pleno", "Analista de Suporte TI", "Arquiteto", 
    "Auditor Contábil", "Cientista de Dados Pleno", "Desenvolvedor Sênior de Polo Tecnológico", 
    "Engenheiro Civil", "Gerente de Loja", "Gerente de Projetos", "Gerente de Supply Chain / Logística",
    "Médico Clínico Geral", "Pesquisador Acadêmico", "Psicólogo Clínico", "Engenheiro Florestal"
  ],
  "Base / Vulneráveis": [
    "Ajudante de Carga e Descarga", "Auxiliar de Cozinha", "Auxiliar de Limpeza", 
    "Costureira de Facção (Trabalho Informal)", "Cuidador de Idosos (Sem Formação)", "Entregador de Aplicativo", 
    "Frentista", "Gari / Coletor de Resíduos", "Motorista de Aplicativo (Tempo Integral)", 
    "Operador de Caixa", "Porteiro", "Repositor de Supermercado", "Motorista de Lotação / Van Escolar",
    "Operador de Empilhadeira", "Recepcionista de Clínica Médica", "Técnico em Enfermagem",
    "Técnico de Manutenção Predial", "Eletricista Predial", "Assistente Administrativo",
    "Promotor de Vendas", "Vendedor Lojista"
  ],
  "Regional Norte": [
    "Garimpeiro Ilegal", "Dono de Garimpo Legalizado", "Guia Turístico na Amazônia", "Pirata de Rio", 
    "Trabalhador da Zona Franca", "Empresário da Zona Franca", "Madeireiro Clandestino",
    "Piloto de Barco de Carga", "Pesquisador Chefe de Biotecnologia"
  ],
  "Regional Nordeste": [
    "Bugueiro de Praia", "Atendente de Resort", "Desenvolvedor de Software (Porto Digital - PE)",
    "Agenciador de Terras", "Vendedor de Artesanato"
  ],
  "Regional Sul": [
    "Trabalhador de Vinícola", "Enólogo Chefe", "Industrial de Móveis", "Importador de Vinhos",
    "Vendedor de Malhas"
  ],
  "Regional Sudeste": [
    "Comerciante na 25 de Março", "Operador de Milícia Urbana (RJ)", "Engenheiro de Petróleo (RJ)", 
    "Auxiliar de Operações em Mini Hubs de Entrega", "Especialista em Planejamento Urbano / Mobilidade",
    "Gestor de Fundo Imobiliário", "Gestor de Projetos de Mobilidade (SP)"
  ],
  "Submundo & Fronteira": [
    "Atravessador de Fronteira", "Contrabandista de Eletrônicos", "Peixeiro de Drogas Internacionais", 
    "Operador de Pista de Pouso Clandestina", "Líder de Gangue Local", "Traficante de Sintéticos em Rave",
    "Operador de Jogo do Bicho", "Ladrão de Gado", "Gerente de Cripto-Golpe"
  ],
  "Política e Poder": [
    "Assessor Parlamentar Sênior", "Lobbyist em Brasília", "Lobista Corporativo",
    "Político Regional de Linhagem", "Funcionário Público Federal"
  ]
};

export const PROFISSOES_UNIVERSAIS: Record<string, string[]> = {
  "Base Precarizada / Vulnerável": PROFISSOES_CATEGORIZADAS["Base / Vulneráveis"],
  "Classe Média Baixa / A Engrenagem": PROFISSOES_CATEGORIZADAS["Engrenagem Corporativa / Classe Média"],
  "Classe Média Alta / Estabilidade": PROFISSOES_CATEGORIZADAS["Engrenagem Corporativa / Classe Média"],
  "Elite / Alta Renda": PROFISSOES_CATEGORIZADAS["Alta Elite & Corporativo"]
};

export const ILICITO_UNIVERSAL: Record<string, string[]> = {
  "Base Precarizada / Vulnerável": ["Vendedor de Produtos Piratas", "Aviãozinho", "Olheiro", "Ladrão de Varal"],
  "Classe Média Baixa / A Engrenagem": ["Golpista de Call Center/Phishing", "Falsificador de Documentos", "Cambista", "Hacker de Baixo Nível", "Desmanchador de Veículos"],
  "Classe Média Alta / Estabilidade": ["Lavador de Dinheiro", "Operador de Caixa Dois", "Advogado de Porta de Cadeia", "Contrabandista de Luxo"],
  "Elite / Alta Renda": ["Lavador de Dinheiro", "Mandante de Grilagem", "Operador de Propina", "Sócio Oculto de Offshore"]
};

export const PROFISSOES_REGIONAIS: Record<string, Record<string, string[]>> = {
  "Sudeste": {
    "Elite / Alta Renda": PROFISSOES_CATEGORIZADAS["Alta Elite & Corporativo"],
    "Classe Média Alta / Estabilidade": PROFISSOES_CATEGORIZADAS["Regional Sudeste"],
    "Classe Média Baixa / A Engrenagem": ["Comerciante na 25 de Março", "Auxiliar de Operações em Mini Hubs"],
    "Ilícito": ["Operador de Milícia Urbana (RJ)", "Traficante de Sintéticos em Rave", "Gerente de Cripto-Golpe"]
  },
  "Sul": {
    "Elite / Alta Renda": ["Latifundiário de Grãos", "Industrial de Móveis", "Importador de Vinhos"],
    "Classe Média Alta / Estabilidade": ["Enólogo Chefe", "Diretor de Cooperativa Agrícola"],
    "Classe Média Baixa / A Engrenagem": ["Trabalhador de Vinícola", "Vendedor de Malhas"],
    "Ilícito": ["Contrabandista de Eletrônicos", "Atravessador de Fronteira"]
  },
  "Norte": {
    "Elite / Alta Renda": ["Dono de Garimpo Legalizado", "Empresário da Zona Franca", "Grande Pecuarista"],
    "Classe Média Alta / Estabilidade": ["Engenheiro Florestal", "Pesquisador Chefe de Biotecnologia"],
    "Classe Média Baixa / A Engrenagem": ["Trabalhador da Zona Franca", "Guia Turístico na Amazônia", "Piloto de Barco de Carga"],
    "Ilícito": ["Garimpeiro Ilegal", "Madeireiro Clandestino", "Pirata de Rio"]
  },
  "Nordeste": {
    "Elite / Alta Renda": ["Dono de Hotéis de Luxo", "Político Regional de Linhagem"],
    "Classe Média Alta / Estabilidade": ["Arquiteto de Resorts e Hotelaria", "Desenvolvedor de Software (Porto Digital - PE)"],
    "Classe Média Baixa / A Engrenagem": ["Bugueiro de Praia", "Atendente de Resort", "Vendedor de Artesanato"],
    "Ilícito": ["Operador de Jogo do Bicho", "Líder de Gangue Local", "Agenciador de Terras"]
  },
  "Centro-Oeste": {
    "Elite / Alta Renda": ["Barão da Soja", "Lobbyist em Brasília"],
    "Classe Média Alta / Estabilidade": ["Assessor Parlamentar Sênior", "Engenheiro Agrônomo"],
    "Classe Média Baixa / A Engrenagem": ["Operador de Maquinário Agrícola", "Gestor de Frota Agroindustrial"],
    "Ilícito": ["Peixeiro de Drogas Internacionais", "Operador de Pista de Pouso Clandestina", "Ladrão de Gado"]
  }
};

export const OP_RES = ["Resiliência Inabalável", "Resiliência Fragilizada", "Resiliência Padrão", "Colapso Iminente", "Cinismo Defensivo", "Estoicismo Forçado"];

export const NOMES_NEUTROS = [
  "Alex", "Ariel", "Cris", "Dani", "Gabi", "Manu", "Val", "Fran", "Rafa", "Yuri", 
  "Sacha", "Duda", "Dominique", "René", "Jean", "Darcy", "Simone", "Andrea", "Kim", "Morgan",
  "Kai", "Neo", "Mika", "Cleo", "Juno", "Max", "Noa", "Eli", "Luca", "Ray", 
  "Sam", "Tom", "Jo", "Lee", "Bo", "Lou", "Vic", "Roni", "Mel", "Sol",
  "Rio", "Mar", "Céu", "Brisa", "Outono", "Inverno", "Sereno", "Tempestade", "Vento", "Nuvem", 
  "Raiz", "Semente", "Ocean", "River", "Sky", "Nature", "Forest", "Ash", "Clay", "Rain",
  "Âmbar", "Jade", "Cristal", "Coral", "Marfim", "Prata", "Ouro", "Blue", "Gray", "Indigo", 
  "Onyx", "Cyan", "Topázio", "Violet", "Hazel", "Sage", "Olive", "Rust", "Silver", "Brown",
  "Charlie", "Taylor", "Jordan", "Casey", "Jamie", "Jesse", "Frankie", "Harley", "Robin", "Shannon", 
  "Billie", "Andy", "Alison", "Blake", "Cameron", "Drew", "Dylan", "Emerson", "Elliot", "Ellis",
  "Finley", "Harper", "Hayden", "Hunter", "Kendall", "Kennedy", "Logan", "Marley", "Parker", "Peyton", 
  "Quinn", "Reese", "Rory", "Remy", "Rowan", "Sawyer", "Skyler", "Sydney", "Tatum", "Wren",
  "Cosmo", "Eclipse", "Raio", "Orvalho", "Alfa", "Estrela", "Cometa", "Galáxia", "Nova", "Vega", 
  "Zenith", "Nadir", "Solstício", "Equinócio", "Época", "Era", "Atlas", "Fênix", "Echo", "Azimute",
  "Paz", "Luz", "Dom", "Arte", "Poema", "Verso", "Acorde", "Ritmo", "Ecos", "Compasso", 
  "Destino", "Sorte", "Chance", "Guia", "Farol", "Horizonte", "Infinito", "Mistério", "Segredo", "Verdade",
  "Jaci", "Kaeté", "Minuano", "Pampa", "Xingu", "Tapajós", "Cairu", "Tupi", "Guará", "Guarani", 
  "Pirá", "Rudá", "Tabajara", "Tamandaré", "Arani", "Acauã", "Kaluanã", "Moara", "Abaeté", "Juruá",
  "Alix", "Akira", "Arya", "Ciel", "Elian", "Erin", "Haru", "Iman", "Jazz", "Jules", 
  "Lane", "Lux", "Nico", "Noel", "Phoenix", "Sunny", "Zion", "Vesper", "Valentine", "Van"
];

export const OP_RASTRO = [
  // Jovens (< 25)
  { text: "Último tweet de madrugada", weight: (ctx: ConditionContext) => ctx.idade < 25 ? 4.0 : 0.1 },
  { text: "Áudio de choro apagado no WhatsApp", weight: (ctx: ConditionContext) => ctx.idade < 25 ? 3.5 : 0.1 },
  { text: "Rascunho de vídeo no TikTok nunca postado", weight: (ctx: ConditionContext) => ctx.idade < 25 ? 3.0 : 0.1 },
  { text: "Conta secundária no Instagram fechada apenas para 3 amigos", weight: (ctx: ConditionContext) => ctx.idade < 25 ? 3.0 : 0.05 },
  { text: "Histórico de buscas: 'como saber se tenho TDAH'", weight: (ctx: ConditionContext) => ctx.idade < 25 ? 3.0 : 0.2 },

  // Millennials (25 - 40)
  { text: "Pesquisa ansiosa no Google sobre sintomas físicos", weight: (ctx: ConditionContext) => (ctx.idade >= 25 && ctx.idade <= 40) ? 3.5 : 1.0 },
  { text: "Lista de dívidas no bloco de notas do celular", weight: (ctx: ConditionContext) => (ctx.idade >= 25 && ctx.idade <= 40) ? 3.0 : 1.0 },
  { text: "Foto de pôr do sol sem legenda no Instagram", weight: (ctx: ConditionContext) => (ctx.idade >= 25 && ctx.idade <= 40) ? 3.0 : 0.5 },
  { text: "Aba anônima pesquisando passagens aéreas baratas", weight: (ctx: ConditionContext) => (ctx.idade >= 25 && ctx.idade <= 40) ? 3.0 : 1.0 },
  { text: "Texto de desabafo no LinkedIn apagado antes de enviar", weight: (ctx: ConditionContext) => (ctx.idade >= 25 && ctx.idade <= 40) ? 4.0 : 0.1 },

  // Gen X / Boomers (> 40)
  { text: "Encaminhou corrente no grupo da família e saiu offline", weight: (ctx: ConditionContext) => ctx.idade > 40 ? 4.0 : 0.1 },
  { text: "Comentário em caixa alta no Facebook reclamando do clima", weight: (ctx: ConditionContext) => ctx.idade > 40 ? 4.0 : 0.05 },
  { text: "Busca no YouTube: 'como limpar celular travando'", weight: (ctx: ConditionContext) => ctx.idade > 40 ? 4.0 : 0.2 },
  { text: "Foto de perfil do WhatsApp desfocada tirada de baixo para cima", weight: (ctx: ConditionContext) => ctx.idade > 40 ? 4.5 : 0.3 },
  { text: "Áudio de 5 minutos enviado por engano", weight: (ctx: ConditionContext) => ctx.idade > 40 ? 4.0 : 0.3 }
];

export const SHINY_EVENTS: ShinyEvent[] = [
  { text: "Ganhou a Mega-Sena e perdeu tudo em 2 anos", condition: (ctx) => ctx.idade > 25, weight: (ctx) => 1.0 },
  { text: "Único sobrevivente de desastre aéreo familiar", weight: (ctx) => 1.0 },
  { text: "Ex-militar desertor vivendo sob pseudônimo", condition: (ctx) => ctx.idade > 35, weight: (ctx) => 1.0 },
  { text: "Descobriu ser fruto de uma seita experimental", weight: (ctx) => 1.0 },
  { text: "Vive em programa de proteção à testemunha", condition: (ctx) => ctx.idade > 21, weight: (ctx) => 1.0 },
  { text: "Perdeu a memória dos últimos 10 anos", weight: (ctx) => 1.0 },
  { text: "Possui uma fortuna enterrada no quintal", condition: (ctx) => !ctx.capital, weight: (ctx) => 1.0 },
  { text: "Doou um órgão vital para um familiar que não resistiu", weight: (ctx) => 1.0 },
  { text: "Coma por meses após um acidente", weight: (ctx) => 1.0 },
  { text: "Vive relação incestuosa com Pai", condition: (ctx) => ctx.idade > 15, weight: (ctx) => 1.0 },
  { text: "Vive relação incestuosa com Mãe", condition: (ctx) => ctx.idade > 15, weight: (ctx) => 1.0 },
  { text: "Vive relação incestuosa com Irmão/Irmã", condition: (ctx) => ctx.idade > 15, weight: (ctx) => 1.0 },
  { text: "Vive relação incestuosa com Tio", condition: (ctx) => ctx.idade > 15, weight: (ctx) => 1.0 },
  { text: "Matou alguém", condition: (ctx) => ctx.idade > 18, weight: (ctx) => 1.0 },
  { text: "Cumpriu pena e hoje está livre de forma justa", condition: (ctx) => ctx.idade > 20, weight: (ctx) => 1.0 },
  { text: "Foi abandonado no altar para centenas de convidados e nunca superou o trauma", condition: (ctx) => ctx.idade > 22, weight: (ctx) => 1.0 },
  { text: "Descobriu que seu cônjuge tinha uma segunda família completa em outra cidade", condition: (ctx) => ctx.idade > 25, weight: (ctx) => 1.0 },
  { text: "O filho fugiu de casa na adolescência e nunca mais deu notícias", condition: (ctx) => ctx.idade > 32, weight: (ctx) => 1.0 },
  { text: "Descobriu que foi trocado na maternidade 30 anos após o nascimento", condition: (ctx) => ctx.idade >= 30, weight: (ctx) => 1.0 },
  { text: "Casou-se por interesse, mas apaixonou-se perdidamente quando o parceiro adoeceu", condition: (ctx) => ctx.idade > 20, weight: (ctx) => 1.0 },
  { text: "Engravidou na adolescência e foi expulso de casa pela família conservadora", condition: (ctx) => (ctx.sexo === "Feminino" || ctx.sexo === "Feminino") && ctx.idade > 18, weight: (ctx) => 1.0 },
  { text: "Criou o filho do melhor amigo como seu após a morte repentina dele", condition: (ctx) => ctx.idade > 25, weight: (ctx) => 1.0 },
  { text: "Foi forçado a escolher qual familiar salvar em uma situação de perigo iminente", weight: (ctx) => 1.0 },
  { text: "Descobriu na fase adulta que seu irmão gêmeo foi dado para adoção ao nascer", condition: (ctx) => ctx.idade > 18, weight: (ctx) => 1.0 },
  { text: "Teve de assumir a guarda dos irmãos mais novos após a prisão dos pais", condition: (ctx) => ctx.idade > 18, weight: (ctx) => 1.0 },
  { text: "Desenvolveu uma alergia severa e incapacitante à luz solar", weight: (ctx) => 1.0 },
  { text: "Perdeu um membro em um grave acidente com maquinário pesado", weight: (ctx) => 1.0 },
  { text: "Sofre de amnésia dissociativa e não se lembra dos primeiros 20 anos de vida", weight: (ctx) => 1.0 },
  { text: "Acordou no meio de seu próprio velório após ser diagnosticado com catalepsia", weight: (ctx) => 1.0 },
  { text: "Ficou paralisado da cintura para baixo após uma queda em esporte radical", weight: (ctx) => 1.0 },
  { text: "Foi cobaia de um ensaio clínico experimental que causou mutações crônicas", weight: (ctx) => 1.0 },
  { text: "Perdeu a audição de forma irreversível após uma explosão no local de trabalho", weight: (ctx) => 1.0 },
  { text: "Recebeu um transplante de coração de um criminoso notório e sofre com o estigma", condition: (ctx) => ctx.idade > 18, weight: (ctx) => 1.0 },
  { text: "Sobreviveu a um ataque brutal de um animal selvagem de grande porte", condition: (ctx) => ctx.idade > 10, weight: (ctx) => 1.0 },
  { text: "Sofreu um erro médico grosseiro em uma cirurgia de rotina que mudou sua vida", weight: (ctx) => 1.0 },
  { text: "Faliu uma empresa centenária e deixou todos na miséria", condition: (ctx) => ctx.idade > 30 && (ctx.classe.includes("Classe Média Alta") || ctx.classe.includes("Elite")), weight: (ctx) => 1.0 },
  { text: "Perdeu as economias de uma vida inteira em um esquema de pirâmide financeira", condition: (ctx) => ctx.idade > 25, weight: (ctx) => 1.0 },
  { text: "Foi demitido publicamente e humilhado após uma falsa acusação de fraude", condition: (ctx) => ctx.idade > 21, weight: (ctx) => 1.0 },
  { text: "Vendeu a patente de uma invenção bilionária por um valor irrisório antes do sucesso", weight: (ctx) => 1.0 },
  { text: "Desenvolveu um vício incontrolável em jogos de azar e perdeu a própria casa", condition: (ctx) => ctx.idade > 21, weight: (ctx) => 1.0 },
  { text: "Foi traído pelo parceiro de negócios e assumiu sozinho uma dívida milionária", condition: (ctx) => ctx.idade > 25 && (ctx.classe.includes("Classe Média Baixa") || ctx.classe.includes("Classe Média Alta") || ctx.classe.includes("Elite")), weight: (ctx) => 1.0 },
  { text: "Doou todo o seu patrimônio para uma organização que se revelou uma farsa", condition: (ctx) => ctx.idade > 25, weight: (ctx) => 1.0 },
  { text: "Encontrou uma mala cheia de dinheiro sujo e vive fugindo dos verdadeiros donos", weight: (ctx) => 1.0 },
  { text: "Foi vítima de um ataque hacker que zerou suas contas e destruiu seu crédito", weight: (ctx) => 1.0 },
  { text: "Trabalhou anos em uma obra de arte-prima que foi destruída em um incêndio", weight: (ctx) => 1.0 },
  { text: "Descobriu restos mortais enterrados no quintal de sua recém-comprada casa", weight: (ctx) => 1.0 },
  { text: "Recebeu uma fortuna de herança de um completo desconhecido", weight: (ctx) => 1.0 },
  { text: "Poder e Influência", weight: (ctx) => 1.0 },
  { text: "Descobriu ser o herdeiro direto de um império criminoso internacional", weight: (ctx) => 1.0 },
  { text: "Sobreviveu a um naufrágio e passou dias à deriva sem água ou comida", weight: (ctx) => 1.0 },
  { text: "Foi atingido diretamente por um raio e sobreviveu, mas desenvolveu sequelas neurológicas", weight: (ctx) => 1.0 },
  { text: "Teve o carro completamente esmagado por uma carreta e saiu fisicamente ileso", weight: (ctx) => 1.0 },
  { text: "Foi cancelado na internet em escala nacional por um mal-entendido catastrófico", weight: (ctx) => 1.0 },
  { text: "Passou 10 anos vivendo isolado em uma comunidade remota sem contato com o exterior", weight: (ctx) => 1.0 },
  { text: "Foi deportado do país onde viveu a vida inteira por um erro burocrático", weight: (ctx) => 1.0 },
  { text: "Salvo de uma tragédia por um herói anônimo que desapareceu logo em seguida", weight: (ctx) => 1.0 },
  { text: "Foi feito refém durante um assalto a banco que durou dias de terror", condition: (ctx) => ctx.idade > 12, weight: (ctx) => 1.0 },
  { text: "Foi falsamente acusado de um crime hediondo e precisou fugir de um linchamento", weight: (ctx) => 1.0 },
  { text: "Teve a casa invadida e destruída enquanto dormia com a família", weight: (ctx) => 1.0 },
  { text: "Causou um acidente de trânsito fatal que vitimou um pedestre inocente", condition: (ctx) => ctx.idade >= 18, weight: (ctx) => 1.0 },
  { text: "Testemunhou a queda de um avião de pequeno porte e foi o primeiro nos destroços", weight: (ctx) => 1.0 },
  { text: "Cresceu em uma seita extremista abusiva da qual conseguiu escapar com vida", condition: (ctx) => ctx.idade > 15, weight: (ctx) => 1.0 },
  { text: "Foi vítima de um stalker obsessivo que destruiu sua paz durante anos", condition: (ctx) => ctx.idade > 15, weight: (ctx) => 1.0 },
  { text: "Vive sob o peso de saber quem cometeu um crime famoso", weight: (ctx) => 1.0 },
  { text: "Cegueira Total", weight: (ctx) => 1.0 },
  { text: "Internação em UTI", weight: (ctx) => 1.0 },
  { text: "Trauma Grave", weight: (ctx) => 1.0 },
  { text: "Endemia Rural", weight: (ctx) => 1.0 },
  { text: "Sobreviveu a um infarto agudo do miocárdio aos 30 anos", condition: (ctx) => ctx.idade >= 30, weight: (ctx) => 1.0 },
  { text: "Cuidados Paliativos (Câncer de Mama)", weight: (ctx) => ctx.cancerMamaMetastatico ? 1.0 : 0.0 },
  { text: "Remissão Milagrosa (Câncer de Mama)", weight: (ctx) => ctx.cancerMamaMetastatico ? 0.001 : 0.0 },
  { text: "Cuidados Paliativos (Câncer de Próstata)", weight: (ctx) => ctx.cancerProstataMetastatico ? 1.0 : 0.0 },
  { text: "Remissão Milagrosa (Câncer de Próstata)", weight: (ctx) => ctx.cancerProstataMetastatico ? 0.001 : 0.0 },

  // --- Novos Eventos Exclusivos Homossexual ---
  { 
    text: "Foi deserdado e expulso de casa na adolescência, precisando construir uma 'família escolhida' nas ruas.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (ctx.idade < 30 || ctx.classe.includes('Base Precarizada / Vulnerável')) ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Perdeu o parceiro(a) de uma vida inteira e foi proibido pela família dele(a) de comparecer ao velório.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade > 40, 
    weight: (ctx) => !ctx.capital ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Fugiu de seu país de origem sob ameaça de morte devido a leis que criminalizavam sua existência.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => ctx.imigranteRefugiado ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Manteve um casamento hétero de conveniência por 40 anos para proteger a honra de uma dinastia familiar.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade >= 58, 
    weight: (ctx) => (ctx.classe.includes('Elite') || ctx.classe.includes('Classe Média Alta')) ? 3.0 * 1.3 : 1.3 
  },
  { 
    text: "Sobreviveu a 'terapias de conversão' violentas na juventude e hoje dedica a vida a caçar seus algozes.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade > 35, 
    weight: (ctx) => ctx.vingativo ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Lutou por décadas na justiça contra o próprio Estado para ter o direito de adotar uma criança.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade > 40, 
    weight: (ctx) => ctx.capital ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Teve o parceiro(a) vítima de um crime de ódio brutal, assumindo para si a missão de buscar vingança.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (ctx.regiao === 'Sul' || ctx.regiao === 'Centro-Oeste' || !ctx.capital) ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Sofreu chantagem de uma figura de poder que ameaçou expor sua orientação para a mídia de forma difamatória.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (ctx.cargosAltos || ctx.classe.includes('Elite')) ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Foi forçado(a) a viver no armário para manter seu cargo em uma instituição militar tradicional.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => ctx.militarPolicia ? 4.0 * 1.3 : 1.3 
  },
  { 
    text: "Reencontrou seu primeiro amor da juventude no asilo, 50 anos após serem separados à força pelas famílias.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade >= 70, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Adotou uma criança considerada 'inadotável' e construiu um império apenas para deixar como legado a ela.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade > 35, 
    weight: (ctx) => (ctx.cargosAltos || ctx.classe.includes('Elite')) ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Seu casamento foi anulado pelo Estado devido a uma repentina mudança nas leis de seu país.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Recebeu perdão e aceitação da mãe apenas no leito de morte, não tendo tempo de processar o luto e a mágoa.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual' && ctx.idade > 30, 
    weight: (ctx) => 1.5 * 1.3 
  },
  { 
    text: "Fundou um santuário seguro para jovens expulsos de casa, gastando até o último centavo de suas economias.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (ctx.alternativo || ctx.altruista) ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Descobriu que seu pior inimigo e opressor religioso vivia uma vida dupla secreta como homossexual.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => !ctx.capital ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Teve sua casa vandalizada e destruída por vizinhos após aparecer em uma reportagem na TV sobre adoção.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (!ctx.capital || ctx.exposicaoPublica) ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Tornou-se mártir de um movimento social após sacrificar sua liberdade para proteger ativistas mais jovens.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (ctx.alternativo || ctx.capital) ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Assumiu a culpa de um crime por amor homossexual secreto para evitar a exposição.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Viveu exilado(a) indevidamente em uma comunidade remota para viver seu amor longe do preconceito da civilização.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => (ctx.isolamentoTotal || ctx.zonaRuralRemota) ? 3.5 * 1.3 : 1.3 
  },
  { 
    text: "Herdou uma congregação religiosa intolerante e a implodiu de dentro para fora após se assumir.", 
    condition: (ctx) => ctx.orientacao === 'Homossexual', 
    weight: (ctx) => !ctx.capital ? 3.0 * 1.3 : 1.3 
  },

  // --- Novos Eventos Exclusivos Bissexual ---
  { 
    text: "Foi forçado(a) por familiares a 'escolher um lado', resultando no rompimento definitivo com a família.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => !ctx.capital ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Teve a guarda dos filhos ameaçada no tribunal pelo ex-cônjuge usando preconceito contra sua orientação.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual' && ctx.idade > 30, 
    weight: (ctx) => (ctx.classe === 'Classe Média Alta / Estabilidade' || ctx.classe === 'Elite / Alta Renda') ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Foi alvo de apagamento histórico: biógrafos e parentes tentaram ocultar seus romances com o mesmo gênero.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual' && (ctx.idade > 60 || ctx.cargosAltos), 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Viveu décadas em um casamento de fachada antes de encontrar coragem para assumir sua bissexualidade.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual' && ctx.idade > 45, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Perdeu o grande amor de sua vida por causa da insegurança e do ciúme irracional do parceiro sobre sua orientação.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Foi expulso(a) simultaneamente de um grupo conservador e rejeitado(a) por parcelas da comunidade LGBTQIAPN+ (bifobia).", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => !ctx.capital ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Formou um relacionamento a três duradouro que escandalizou e isolou a família de sua comunidade local.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => !ctx.capital ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Encontrou profunda paz e aceitação na terceira idade, mudando toda a trajetória de vida e testamento.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual' && ctx.idade > 60, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Foi vítima de uma armadilha armada por pessoas próximas para forçar uma 'saída do armário' pública e humilhante.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => ctx.idade < 25 ? 1.5 * 1.3 : 1.3 
  },
  { 
    text: "Seu parceiro de anos exigiu exclusividade de gênero sob ameaças emocionais.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Dedicou sua vida e fortuna a fundar uma ONG de apoio a jovens bissexuais após perder um amigo para o preconceito.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual' && (ctx.classe.includes('Elite') || ctx.cargosAltos), 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Descobriu que sua bissexualidade era um 'segredo de família' repetido em três gerações silenciosas.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Perdeu o emprego dos sonhos após ser visto(a) em encontros com pessoas de gêneros diferentes na mesma semana.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => (ctx.corporativo || ctx.classe === 'Classe Média Baixa / A Engrenagem') ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Transformou sua exaustiva jornada de aceitação em uma obra artística que causou fúria na censura local.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => (ctx.capital || ctx.alternativo) ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Apaixonou-se perdidamente pela pessoa que foi contratada para sabotar seu casamento.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Sofreu um violento crime de ódio disfarçado de 'terapia de casais'.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => (!ctx.capital || ctx.regiao === 'Centro-Oeste' || ctx.regiao === 'Sul') ? 2.5 * 1.3 : 1.3 
  },
  { 
    text: "Passou anos sentindo-se uma fraude emocional até viver um relacionamento verdadeiramente livre e aberto.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual' && ctx.idade >= 30, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Tornou-se o primeiro líder abertamente bissexual de um movimento político conservador.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => (ctx.regiao === 'Sul' || ctx.regiao === 'Centro-Oeste') ? 3.0 * 1.3 : 1.3 
  },
  { 
    text: "Manteve um romance duplo em segredo absoluto, o que acabou causando um colapso em sua saúde mental.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => (ctx.ansiedade || ctx.estresse) ? 2.0 * 1.3 : 1.3 
  },
  { 
    text: "Assumiu a culpa de um crime por amor bissexual secreto para evitar a exposição.", 
    condition: (ctx) => ctx.orientacao === 'Bissexual', 
    weight: (ctx) => 1.3 
  },
  
  // --- Novos Eventos Exclusivos Assexual ---
  { 
    text: "Rompeu um noivado milionário às vésperas do casamento ao compreender definitivamente sua assexualidade.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && (ctx.classe.includes('Elite') || ctx.classe.includes('Média Alta')), 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Sofreu exames médicos humilhantes e invasivos na juventude, arrastado por pais que buscavam uma 'cura hormonal'.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => { let p = 1.3; if (ctx.idade > 40) p *= 1.5; if (!ctx.capital) p *= 1.5; return p; } 
  },
  { 
    text: "Casou-se com seu(ua) melhor amigo(a) por pura conveniência e descobriu a relação mais profunda e feliz de sua vida.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && ctx.idade > 30, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Viveu anos de depressão profunda, convencido(a) de que tinha um defeito crônico antes de conhecer a assexualidade.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.depressao || ctx.ansiedade) ? (2.5 * 1.3) : 1.3 
  },
  { 
    text: "Foi abandonado(a) por diversos parceiros que interpretaram sua falta de atração como desamor ou traição.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && ctx.idade >= 23, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Desenvolveu fobia social severa após anos de intensa pressão familiar para 'constituir família' tradicional.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => { let p = 1.3; if (!ctx.capital) p *= 2.0; if (ctx.fobiaSocial || ctx.agorafobia) p *= 1.5; return p; } 
  },
  { 
    text: "Adotou dezenas de órfãos, criando um clã poderoso e unido sem nenhuma base romântica ou sexual.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && ctx.idade > 40, 
    weight: (ctx) => (ctx.classe.includes('Elite') || ctx.classe.includes('Média')) ? (2.0 * 1.3) : 1.3 
  },
  { 
    text: "Dedicou toda a sua energia vital a uma descoberta científica que alterou os rumos da humanidade.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.tecnologia || ctx.estuda || ctx.nerd) ? (3.5 * 1.3) : 0.5 
  },
  { 
    text: "Foi vítima de abuso por profissionais que prometiam 'despertar seus desejos' através de métodos antiéticos.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => !ctx.capital ? (2.0 * 1.3) : 1.3 
  },
  { 
    text: "Teve um relacionamento de conveniência exposto de forma cruel na mídia, perdendo o respeito de sua comunidade.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.cargosAltos || ctx.classe.includes('Elite')) ? (2.5 * 1.3) : 0.8 
  },
  { 
    text: "Encontrou plenitude em um relacionamento queerplatônico duradouro que sobreviveu a todas as tragédias da vida.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.capital || ctx.alternativo) ? (2.0 * 1.3) : 1.3 
  },
  { 
    text: "Passou décadas simulando desejo para atender expectativas sociais, o que gerou um colapso psicológico severo.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && ctx.idade >= 45, 
    weight: (ctx) => ctx.estresse ? (2.0 * 1.3) : 1.3 
  },
  { 
    text: "Foi acusado(a) injustamente de traição afetiva quando seu parceiro não suportou a falta de intimidade física.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Foi infantilizado(a) e impedido(a) de tomar decisões legais pelos próprios parentes sob a desculpa de 'falta de maturidade'.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && ctx.idade < 30, 
    weight: (ctx) => 2.0 * 1.3 
  },
  { 
    text: "Escolheu viver um celibato em uma ordem religiosa estrita apenas para fugir da pressão para se casar.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => { let p = 1.3; if (!ctx.capital) p *= 2.0; if (ctx.regiao === 'Nordeste' || ctx.regiao === 'Sul') p *= 1.5; return p; } 
  },
  { 
    text: "Dedicou-se a cuidar de um irmão doente por toda a vida, abdicando de qualquer outra ambição pessoal.", 
    condition: (ctx) => ctx.orientacao === 'Assexual' && ctx.idade > 35, 
    weight: (ctx) => 1.3 
  },
  { 
    text: "Aceitou um acordo peculiar: seu parceiro romântico possui outros parceiros sexuais, mas uma quebra de regra destruiu o arranjo.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => ctx.capital ? (2.0 * 1.3) : 0.7 
  },
  { 
    text: "Transformou sua vivência em um manifesto filosófico que se tornou a base de uma nova contracultura.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.alternativo || ctx.capital) ? (3.0 * 1.3) : 0.5 
  },
  { 
    text: "Foi perseguido(a) por parceiros obcecados em ser 'a pessoa que finalmente o(a) curaria'.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.idade < 35) ? (2.0 * 1.3) : 1.3 
  },
  { 
    text: "Encontrou um artefato místico/tecnológico e dedicou sua vida a ele, abandonando o convívio humano.", 
    condition: (ctx) => ctx.orientacao === 'Assexual', 
    weight: (ctx) => (ctx.tecnologia || ctx.nerd) ? (4.0 * 1.3) : 1.3 
  }
];

export const RELACOES_TEXTOS: Record<string, string[]> = {
  "Positivo": [
    "Porto seguro em meio ao caos urbano.",
    "Apoiou financeiramente em momentos críticos.",
    "Lealdade testada e comprovada em situações de risco.",
    "Relação de confiança absoluta e confidência.",
    "Parceria de longa data que sobreviveu às mudanças de classe."
  ],
  "Neutro": [
    "Contato esporádico, mas cordial.",
    "Relação baseada em conveniência e troca de favores.",
    "Afastados pelo tempo, mas sem ressentimentos.",
    "Conexão puramente profissional ou funcional.",
    "Presença constante, mas sem profundidade emocional."
  ],
  "Negativo": [
    "Histórico de traição e desconfiança mútua.",
    "Dívida financeira ou moral não resolvida.",
    "Rivalidade que beira a hostilidade aberta.",
    "Manipulação emocional e jogos de poder.",
    "Afastamento por diferenças ideológicas ou morais inconciliáveis.",
    "Distanciamento por ausência crônica e alto estresse no trabalho"
  ]
};

export const OP_LIBIDO: Record<string, string[]> = {
  "Predador Silencioso": ["Olhares fixos", "Falas curtas"],
  "Vulgaridade Sem Filtro": ["Linguagem crua", "Objetificação direta"],
  "Tímido Crônico": ["Gagueira leve", "Evita contato visual"],
  "Luxúria Intelectual": ["Sedução por repertório culto", "Debate erotizado"]
};

export const OP_TEMPERAMENTO = ["Cordial (Máscara)", "Colérico (Reprimido)", "Melancólico (Produtivo)", "Pragmático (Frio)", "Ansioso (Instável)", "Estoico (Resiliente)"];
export const OP_CORPO = ["Falso Magro", "Desgaste Urbano", "Postura Defensiva", "Atlético Funcional", "Cansaço Crônico"];
export const OP_LOGISTICA_TRANSPORTE = ["Público/Alternativo", "Transporte por App", "Veículo Próprio"];

export const FILHOS_TEXTOS: Record<string, Record<string, string[]>> = {
  "Criança": {
    "Positivo": [
      "Motivo único e inquestionável para suportar a exaustão do trabalho diário",
      "A pureza da criança curou traumas antigos e obscuros do NPC",
      "Superproteção amorosa: o NPC vive apenas para ver a criança sorrir",
      "Fonte de risadas genuínas que quebram o peso da vida adulta",
      "Redenção pessoal: o NPC mudou de vida e abandonou vícios por ela",
      "Vínculo mágico: leem histórias ou inventam mundos juntos toda noite",
      "A criança enxerga o NPC como um super-herói literalmente invencível",
      "Motivação feroz para voltar a estudar/trabalhar e dar um futuro melhor",
      "Única pessoa no mundo com quem o NPC consegue demonstrar afeto físico macio",
      "A criança herdou o mesmo dom/hobby que o NPC amava na juventude",
      "O abraço da criança é o único calmante que funciona após crises de estresse",
      "O NPC guarda cada desenho, dente e carta como um tesouro sagrado",
      "Promessa de sangue: o NPC dá à criança o amor que nunca recebeu dos próprios pais",
      "Conexão inquebrável construída após a criança sobreviver a uma doença grave",
      "Possuem rituais secretos (códigos, apertos de mão) que ninguém mais entende"
    ],
    "Neutro": [
       "Cuidados terceirizados: a criança é criada quase integralmente por avós ou babás",
       "Provedor distante: o NPC paga pensão/escola em dia, mas raramente tem tempo de visitar",
       "Relação de fim de semana: passeios roteirizados (shopping/parque) com pouco diálogo real",
       "Amor burocrático: vai às reuniões da escola e ao médico, mas não senta no chão para brincar",
       "A criança prefere as telas/videogames o tempo todo e o NPC não faz esforço para interagir",
       "Divórcio mal resolvido torna as trocas de guarda na porta de casa frias e tensas",
       "Afeto comprado: o NPC compensa sua ausência crônica com brinquedos e presentes caros",
       "Sobrecarga exaustiva: o NPC ama, mas chega tão cansado do trabalho que só quer dormir",
       "A criança tem um temperamento muito oposto ao do NPC, gerando silêncios constarregados",
       "Contato reduzido a cobranças diárias (fazer o dever de casa, tomar banho, comer a salada)",
       "NPC trata a criança como um \"mini-adulto\", sem paciência para fantasias e imaturidades",
       "A convivência é totalmente engolida pela rotina maçante e sem surpresas ou carinho",
       "Superproteção esterilizada: a criança não brinca na rua para não se sujar ou machucar",
       "O NPC delega 100% da criação afetiva e disciplinar para o cônjuge, agindo como um \"fantasma\"",
       "Amor genérico e padrão: a relação é tranquila, mas sem nenhuma profundidade ou memória marcante"
    ],
    "Negativo": [
       "Negligência emocional severa: a criança vive como um fantasma invisível dentro da própria casa",
       "O NPC desconta todo o estresse financeiro e laboral gritando histericamente com a criança",
       "Síndrome de Alienação Parental: a criança é usada como arma de chantagem contra o(a) ex",
       "Punições físicas desproporcionais disfarçadas sob o pretexto de \"educação disciplinar\"",
       "O NPC humilha a criança publicamente na frente de familiares por suas dificuldades escolares",
       "Parentificação perversa: obriga a criança a limpar a casa e criar os irmãos menores sozinha",
       "Favoritismo tóxico e cruel: o NPC rejeita abertamente esta criança em prol de um irmão",
       "A criança tem pavor absoluto de fazer qualquer barulho quando o NPC está em casa",
       "Destruição metódica da autoestima, chamando a criança de \"inútil\", \"lenta\" ou \"burra\"",
       "O NPC culpa abertamente a criança (\"se não fosse você\") pelo fracasso de sua juventude/casamento",
       "A criança é exposta deliberadamente a ambientes perigosos, criminosos ou aos vícios do NPC",
       "O NPC rouba ou penhora o dinheiro do cofrinho e os presentes de natal da criança para vícios/dívidas",
       "Punição por silêncio: o NPC ignora a existência da criança por dias quando é contrariado",
       "Ameaças crônicas de abandono (\"vou te largar no orfanato\", \"vou te dar pra polícia\") usadas como controle",
       "O NPC quebra os brinquedos favoritos ou rasga os desenhos da criança durante ataques de fúria"
    ]
  },
  "Adolescente": {
    "Positivo": ["Orgulho pelas primeiras conquistas e autonomia.", "Relação de amizade e diálogo em meio às mudanças.", "Fonte de energia e novas perspectivas sobre o mundo."],
    "Neutro": ["Fase de silêncios e busca por espaço próprio.", "Conexão limitada a questões práticas e financeiras.", "Convivência baseada no respeito, mas sem confidências."],
    "Negativo": ["Conflitos constantes de autoridade e rebeldia.", "Preocupação severa com más companhias ou vícios.", "Ruptura de comunicação e hostilidade velada."]
  },
  "Adulto": {
    "Positivo": ["Parceiro de vida e suporte emocional mútuo.", "Sucesso independente que traz alívio ao progenitor.", "Vínculo maduro baseado em escolhas e afinidade."],
    "Neutro": ["Cada um no seu canto, mantendo o vínculo mínimo.", "Relação cordial de visitas protocolares em feriados.", "Afastamento geográfico ou emocional sem grandes traumas."],
    "Negativo": ["Ressentimentos do passado que nunca cicatrizaram.", "Dependência financeira tardia que causa atritos.", "Disputas familiares ou ideológicas irreconciliáveis."]
  }
};
