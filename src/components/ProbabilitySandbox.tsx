import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  Zap, 
  Eye, 
  EyeOff, 
  Dice5, 
  FileJson, 
  RefreshCw,
  Globe,
  Users,
  Compass,
  MapPin,
  TrendingDown,
  Activity,
  Heart,
  Briefcase,
  Flame,
  Layout,
  Fingerprint,
  GraduationCap,
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  NIVEIS_V, 
  NIVEIS_NV,
  OP_TRIBO,
  FETICHES_DATA,
  FILHOS_PESADOS_CONDICIONAIS
} from '../rules/conditions';
import { 
  SHINY_EVENTS,
  OP_RASTRO,
  PROFISSOES_UNIVERSAIS,
  PROFISSOES_REGIONAIS,
  PROFISSOES_CATEGORIZADAS,
  OP_LOGISTICA_TRANSPORTE,
  RELACOES_TEXTOS,
  FILHOS_TEXTOS
} from '../data/staticData';
import { ConditionContext, GenerationOptions, CharacterResult } from '../types/character';
import { generateCharacterData, calculateDeclarativeWeight } from '../services/characterGenerator';
import { RULES_REGISTRY } from '../data/rulesRegistry';

// Deleted SandboxLocks interface as state is unified in DashboardLocksState

interface DashboardLocksState {
  // Character Identity & Context (Previously in Locks Panel)
  identidade: string[]; // Sexo, Orientação, Etnia
  geografia: string[];  // Região, Perfil
  classe: string[];     // Classe Social
  fisico: string[];     // Biotipo, Flags Físicas
  contexto: string[];   // Flags de Contexto
  idade: string[];      // Faixas Etárias
  
  // Dashboard Analytics
  visible: string[];
  hidden: string[];
  shiny: string[];
  tribos: string[];
  rastros: string[];
  fetiches: string[];
  dinamicas: string[];
  ocupacao: string[];
  profissoes: string[];
  logistica: string[];
  relacional: string[];
  filhos: string[];
}

const DEFAULT_DASHBOARD_LOCKS: DashboardLocksState = {
  identidade: [],
  geografia: [],
  classe: [],
  fisico: [],
  contexto: [],
  idade: [],
  visible: [],
  hidden: [],
  shiny: [],
  tribos: [],
  rastros: [],
  fetiches: [],
  dinamicas: [],
  ocupacao: [],
  profissoes: [],
  logistica: [],
  relacional: [],
  filhos: []
};

const DASHBOARD_LIMITS: Record<string, number> = {
  identidade: 3,
  geografia: 2,
  classe: 1,
  fisico: 4,
  contexto: 7,
  idade: 1,
  visible: 3,
  hidden: 2,
  shiny: 1,
  tribos: 1,
  rastros: 1,
  fetiches: 3,
  dinamicas: 2,
  ocupacao: 1,
  profissoes: 1,
  logistica: 2,
  relacional: 3,
  filhos: 2
};

// Deleted DEFAULT_LOCKS as state is unified in DashboardLocksState

export const ProbabilitySandbox: React.FC<{ onFinish: (result: CharacterResult) => void }> = ({ onFinish }) => {
  const [dashboardLocks, setDashboardLocks] = useState<DashboardLocksState>(DEFAULT_DASHBOARD_LOCKS);
  const [copied, setCopied] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'locks' | 'dashboard'>('dashboard');

  // Lists
  const regioes = ['Norte', 'Sul', 'Sudeste', 'Centro-Oeste', 'Nordeste'] as const;
  const classes = ["Base Precarizada / Vulnerável", "Classe Média Baixa / A Engrenagem", "Classe Média Alta / Estabilidade", "Elite / Alta Renda"];
  const etnias = ["Branca", "Parda", "Preta", "Amarela", "Indígena"];
  const oris = ["Heterossexual", "Bissexual", "Homossexual", "Assexual", "Pansexual", "Demissexual"];
  const biotipos = ["Déficit Severo", "Excesso Adiposo", "Extrema Musculatura", "Extremo Vertical"];
  const idades = ["Jovem (15-25)", "Adulto (26-45)", "Maduro (46-60)", "Idoso (61-80)"];
  const allTribes = Object.values(OP_TRIBO).flat().map(t => t.name);

  // Helper to check if any specific category item is selected
  const getSelected = (cat: keyof DashboardLocksState, pool: readonly string[] | string[]) => {
    return dashboardLocks[cat].find(item => pool.includes(item));
  };

  // Context Mapper
  const currentCtx = useMemo((): ConditionContext => {
    const selOri = getSelected('identidade', oris);
    const selSex = getSelected('identidade', ["Masculino", "Feminino"]);
    const selEtnia = getSelected('identidade', etnias);
    const selRegiao = getSelected('geografia', regioes as any);
    const selPerfil = getSelected('geografia', ["Capital", "Interior"]);
    const selClasse = getSelected('classe', classes);
    const selIdade = getSelected('idade', idades);
    const selBio = getSelected('fisico', biotipos);
    const selTrans = getSelected('logistica', OP_LOGISTICA_TRANSPORTE);
    const selHab = getSelected('logistica', ["Residência Padrão", "Condomínio Fechado", "Zeladoria", "Pensão/Quitinete", "Ocupação/Favela", "Zona Rural/Sítio"]);

    const getTierMetropole = (estado: string, isCapital: boolean): 'tier_alfa' | 'tier_beta' | 'tier_gama' | 'interior_alfa' | 'interior_beta' | 'interior_gama' => {
      const alfa = ['SP', 'RJ'];
      const beta = ['DF', 'MG', 'PR', 'RS', 'BA', 'PE', 'CE'];
      if (isCapital) {
        if (alfa.includes(estado)) return 'tier_alfa';
        if (beta.includes(estado)) return 'tier_beta';
        return 'tier_gama';
      } else {
        if (alfa.includes(estado)) return 'interior_alfa';
        if (beta.includes(estado)) return 'interior_beta';
        return 'interior_gama';
      }
    };

    // Age derivation
    let idadeVal = 30;
    if (selIdade === "Jovem (15-25)") idadeVal = 20;
    if (selIdade === "Adulto (26-45)") idadeVal = 35;
    if (selIdade === "Maduro (46-60)") idadeVal = 52;
    if (selIdade === "Idoso (61-80)") idadeVal = 70;

    const ctx: ConditionContext = {
      idade: idadeVal,
      sexo: (selSex as any) || 'Masculino',
      identidadeGenero: (selSex as any) || 'Homem',
      termoIdentidade: dashboardLocks.identidade.includes("Transgênero") ? "Transgênero/Não-Binário" : "Cisgênero",
      transgenero: dashboardLocks.identidade.includes("Transgênero"),
      orientacao: (selOri as any) || 'Heterossexual',
      classe: (selClasse as any) || classes[0],
      regiao: (selRegiao as any) || 'Sudeste',
      profissao: "", 
      capital: selPerfil === 'Capital',
      transporte: selTrans || 'Público sobre Pneus (Ônibus urbano / Lotação)',
      habitacao: selHab || 'Residência Padrão',
      trabalha: dashboardLocks.contexto.includes("Trabalha"),
      estuda: dashboardLocks.contexto.includes("Estuda"),
      estagio: dashboardLocks.contexto.includes("Estágio"),
      aposentado: false,
      estresse: dashboardLocks.contexto.includes("Estresse"),
      estresseHard: false,
      remoto: false,
      climaFrio: selRegiao === 'Sul',
      ansiedade: dashboardLocks.contexto.includes("Ansiedade"),
      alternativo: dashboardLocks.tribos.length > 0,
      escritorio: false,
      industriaOuMusica: false,
      sobrepeso: dashboardLocks.fisico.includes("Sobrepeso"),
      abaixoDoPeso: false,
      pesoIdeal: !dashboardLocks.fisico.includes("Sobrepeso"),
      obesidadeI: false,
      obesidadeII: false,
      obesidadeIII: false,
      falsoSaudavel: false,
      cargosAltos: selClasse?.includes("Elite") || false,
      cafeina: false,
      alcoolOuObesidade: false,
      alcoolico: false,
      desempregado: !dashboardLocks.contexto.includes("Trabalha"),
      braçalOuSentado: dashboardLocks.contexto.includes("Trabalho Braçal"),
      diabetico: false,
      midia: false,
      fumante: false,
      aco: false,
      baixaRenda: selClasse?.includes("Base") || false,
      gayCis: selOri === 'Homossexual' && selSex === 'Masculino',
      proSe: false,
      drogasInjetaveis: false,
      traumaArquivado: false,
      hipertenso: false,
      traumaInfancia: false,
      militarPolicia: false,
      vitimaCrime: false,
      hipertensoFumante: false,
      negroPardo: selEtnia === "Preta" || selEtnia === "Parda",
      indigena: selEtnia === "Indígena",
      abusoHistorico: false,
      historicoDepressivo: false,
      desempregoLongo: false,
      corporativoEstresse: false,
      lutoRecente: false,
      obesoFumante: false,
      caucasiano: selEtnia === "Branca",
      abusoInfanciaProlongado: false,
      diabeticoOuHipertenso: false,
      isolamentoTotal: false,
      falenciaLuto: false,
      infartoPrevio: false,
      drogasPesadas: false,
      fumanteQuimico: false,
      atletaMilitar: false,
      trabalhadorNuclear: false,
      baixaSaudeMental: false,
      intoxicacaoMedicamentosa: false,
      biotipoAnomalia: (selBio as any) || "",
      massaMagra: dashboardLocks.fisico.includes("Massa Magra"),
      tecnologia: dashboardLocks.fisico.includes("Foco Tech"),
      setor: "",
      estado: "SP",
      tierMetropole: getTierMetropole("SP", selPerfil === 'Capital'),
      geneticaFamiliar: false,
      braçal: dashboardLocks.contexto.includes("Trabalho Braçal"),
      sop: false,
      peleClara: selEtnia === "Branca",
      tdah: false,
      insonia: false,
      turnosNoturnos: false,
      idoso: idadeVal > 60,
      botox: false,
      lutador: false,
      violencia: false,
      lutoSevero: false,
      obeso: dashboardLocks.fisico.includes("Sobrepeso"),
      corticoides: false,
      exPresidiario: false,
      gangue: false,
      corporativo: false,
      autoimune: false,
      sedentario: false,
      trabalhoRisco: false,
      alcoolicoAbstinencia: false,
      fogo: false,
      hepatite: false,
      miopiaCongenita: false,
      fumantePesado: false,
      professorCantor: false,
      acidenteTransito: false,
      doencaPulmonarCoracao: false,
      ensolarado: false,
      moradorRua: false,
      dependenteQuimicoAtivo: false,
      trabalhoBarulhento: false,
      acidenteMotorLesao: false,
      baixaIodo: false,
      diabeticoLesaoPe: false,
      colesterolAlto: false,
      zonaRuralRemota: dashboardLocks.contexto.includes("Zona Rural/Remota"),
      herniaDisco: false,
      internacaoUTI: false,
      mausHabitos: false,
      traumaViolento: false,
      interrogatorioIntimidacao: false,
      quimioterapia: false,
      avcExtenso: false,
      glaucoma: false,
      cancerLaringe: false,
      retinopatia: false,
      cancerMama: false,
      cancerMamaMetastatico: false,
      cancerProstataMetastatico: false,
      cancerPeleNaoTratado: false,
      posBariatrica: false,
      depressaoProfunda: false,
      cancerIntestinalCrohn: false,
      zonaTropical: false,
      escleroseMultipla: false,
      tumorHipofisario: false,
      transtornoBorderlineDepressao: false,
      anorexiaContext: false,
      neurologico: false,
      veteranoGuerra: false,
      explosao: false,
      bombeiro: false,
      traumaGrave: false,
      catarataContext: false,
      endemiaRural: false,
      compulsaoTrauma: false,
      duchenneContext: false,
      talidomidaContext: false,
      mergulhoVelocidade: false,
      lesaoTronco: false,
      sepse: false,
      marginalizado: false,
      sobreviventeDesastre: false,
      ruinaFinanceira: false,
      protecaoTestemunha: false,
      paranoiaFortuna: false,
      comaPosAcidente: false,
      incestoAbuso: false,
      incestoConsentido: false,
      matouAlguem: false,
      exDetento: false,
      abandonadoAltar: false,
      segundaFamiliaConjuge: false,
      filhoFugiu: false,
      trocadoMaternidade: false,
      casamentoInteressePaixao: false,
      expulsaGravidez: false,
      criouFilhoAmigo: false,
      escolhaFamiliarPerigo: false,
      irmaoGemeoAdotado: false,
      guardaIrmaosPrisaoPais: false,
      alergiaSolar: false,
      perdeuMembroAcidente: false,
      amnesiaRetrografa: false,
      catalepsiaCronica: false,
      paraplegiaEsporte: false,
      mutacoesCobaia: false,
      anacusiaTotal: false,
      transplanteCoracaoCriminoso: false,
      ataqueAnimalSelvagem: false,
      erroMedicoGrosseiro: false,
      refemAssalto: false,
      acusadoFalsamente: false,
      casaInvadida: false,
      acidenteFatalPedestre: false,
      testemunhouQuedaAviao: false,
      seitaExtremistaAbusiva: false,
      vitimaStalker: false,
      saberCrimeFamoso: false,
      falenciaEmpresaFamilia: false,
      piramideFinanceira: false,
      demissaoHumilhante: false,
      vendeuPatenteBarato: false,
      vicioJogoPerdaCasa: false,
      traicaoSocioDivida: false,
      doouPatrimonioFarsa: false,
      malaDinheiroSujo: false,
      ataqueHackerZerouContas: false,
      obraArteDestruida: false,
      restosMortaisQuintal: false,
      herancaDesconhecido: false,
      herdeiroImperioCriminoso: false,
      naufragioDeriva: false,
      atingidoRaio: false,
      carroEsmagadoCarreta: false,
      canceladoInternet: false,
      isolamentoRemoto: false,
      deportadoErroBurocratico: false,
      heroiAnonimo: false,
      // New Relational Locks
      paiMorto: dashboardLocks.relacional.includes("Pai Falecido"),
      maeMorta: dashboardLocks.relacional.includes("Mãe Falecida"),
      relacaoPositiva: dashboardLocks.relacional.includes("Relacionamento: Positivo"),
      relacaoNeutra: dashboardLocks.relacional.includes("Relacionamento: Neutro"),
      relacaoNegativa: dashboardLocks.relacional.includes("Relacionamento: Negativo"),
      temFilhos: dashboardLocks.filhos.some(f => f.includes("Filho")),
    };

    // Integrate Dashboard Locks into Context
    const allDashboardItems: string[] = (Object.values(dashboardLocks) as string[][]).flat();
    
    // Explicit mappings for items that affect context
    allDashboardItems.forEach((item: string) => {
      if (!item) return;
      
      // Identity specific ones
      if (item === "Pobreza Extrema") ctx.baixaRenda = true;
      if (item === "Riqueza Extrema") ctx.cargosAltos = true;
      
      // Shiny Events -> Context Flags
      if (item === "Doou um órgão vital para um familiar que não resistiu") ctx.doouOrgaoVital = true;
      if (item === "Ex-militar desertor vivendo sob pseudônimo") ctx.exMilitarDesertor = true;
      if (item === "Ganhou a Mega-Sena e perdeu tudo em 2 anos") ctx.ruinaFinanceira = true;
      if (item === "Único sobrevivente de desastre aéreo familiar") ctx.sobreviventeDesastre = true;
      if (item === "Vive em programa de proteção à testemunha") ctx.protecaoTestemunha = true;
      if (item === "Possui uma fortuna enterrada no quintal") ctx.paranoiaFortuna = true;
      if (item === "Coma por meses após um acidente") ctx.comaPosAcidente = true;
      if (item === "Matou alguém") ctx.matouAlguem = true;
      if (item === "Cumpriu pena e hoje está livre de forma justa") ctx.exDetento = true;
      if (item === "Foi abandonado no altar para centenas de convidados e nunca superou o trauma") ctx.abandonadoAltar = true;
      if (item === "Descobriu que seu cônjuge tinha uma segunda família completa em outra cidade") ctx.segundaFamiliaConjuge = true;
      if (item === "O filho fugiu de casa na adolescência e nunca mais deu notícias") ctx.filhoFugiu = true;
      if (item === "Descobriu que foi trocado na maternidade 30 anos após o nascimento") ctx.trocadoMaternidade = true;
      if (item === "Casou-se por interesse, mas apaixonou-se perdidamente quando o parceiro adoeceu") ctx.casamentoInteressePaixao = true;
      if (item === "Engravidou na adolescência e foi expulso de casa pela família conservadora") ctx.expulsaGravidez = true;
      if (item === "Criou o filho do melhor amigo como seu após a morte repentina dele") ctx.criouFilhoAmigo = true;
      if (item === "Foi forçado a escolher qual familiar salvar em uma situação de perigo iminente") ctx.escolhaFamiliarPerigo = true;
      if (item === "Descobriu na fase adulta que seu irmão gêmeo foi dado para adoção ao nascer") ctx.irmaoGemeoAdotado = true;
      if (item === "Teve de assumir a guarda dos irmãos mais novos após a prisão dos pais") ctx.guardaIrmaosPrisaoPais = true;
      if (item === "Desenvolveu uma alergia severa e incapacitante à luz solar") ctx.alergiaSolar = true;
      if (item === "Perdeu um membro em um grave acidente com maquinário pesado") ctx.perdeuMembroAcidente = true;
      if (item === "Sofre de amnésia dissociativa e não se lembra dos primeiros 20 anos de vida") ctx.amnesiaRetrografa = true;
      if (item === "Acordou no meio de seu próprio velório após ser diagnosticado com catalepsia") ctx.catalepsiaCronica = true;
      if (item === "Ficou paralisado da cintura para baixo após uma queda em esporte radical") ctx.paraplegiaEsporte = true;
      if (item === "Foi cobaia de um ensaio clínico experimental que causou mutações crônicas") ctx.mutacoesCobaia = true;
      if (item === "Perdeu a audição de forma irreversível após uma explosão no local de trabalho") ctx.anacusiaTotal = true;
      if (item === "Recebeu um transplante de coração de um criminoso notório e sofre com o estigma") ctx.transplanteCoracaoCriminoso = true;
      if (item === "Sobreviveu a um ataque brutal de um animal selvagem de grande porte") ctx.ataqueAnimalSelvagem = true;
      if (item === "Sofreu um erro médico grosseiro em uma cirurgia de rotina que mudou sua vida") ctx.erroMedicoGrosseiro = true;
      if (item === "Foi feito refém durante um assalto a banco que durou dias de terror") ctx.refemAssalto = true;
      if (item === "Foi falsamente acusado de um crime hediondo e precisou fugir de um linchamento") ctx.acusadoFalsamente = true;
      if (item === "Teve a casa invadida e destruída enquanto dormia com a família") ctx.casaInvadida = true;
      if (item === "Causou um acidente de trânsito fatal que vitimou um pedestre inocente") ctx.acidenteFatalPedestre = true;
      if (item === "Testemunhou a queda de um avião de pequeno porte e foi o primeiro nos destroços") ctx.testemunhouQuedaAviao = true;
      if (item === "Cresceu em uma seita extremista abusiva da qual conseguiu escapar com vida") ctx.seitaExtremistaAbusiva = true;
      if (item === "Foi vítima de um stalker obsessivo que destruiu sua paz durante anos") ctx.vitimaStalker = true;
      if (item === "Vive com o peso de saber quem cometeu um crime famoso, mas teme falar") ctx.saberCrimeFamoso = true;
      if (item === "Faliu a empresa centenária da família e deixou todos na miséria absoluta") ctx.falenciaEmpresaFamilia = true;
      if (item === "Perdeu as economias de uma vida inteira em um esquema de pirâmide financeira") ctx.piramideFinanceira = true;
      if (item === "Foi demitido publicamente e humilhado após uma falsa acusação de fraude") ctx.demissaoHumilhante = true;
      if (item === "Vendeu a patente de uma invenção bilionária por um valor irrisório antes do sucesso") ctx.vendeuPatenteBarato = true;
      if (item === "Desenvolveu um vício incontrolável em jogos de azar e perdeu a própria casa") ctx.vicioJogoPerdaCasa = true;
      if (item === "Foi traído pelo parceiro de negócios e assumiu sozinho uma dívida milionária") ctx.traicaoSocioDivida = true;
      if (item === "Doou todo o seu patrimônio para uma organização que se revelou uma farsa") ctx.doouPatrimonioFarsa = true;
      if (item === "Encontrou uma mala cheia de dinheiro sujo e vive fugindo dos verdadeiros donos") ctx.malaDinheiroSujo = true;
      if (item === "Foi vítima de um ataque hacker que zerou suas contas e destruiu seu crédito") ctx.ataqueHackerZerouContas = true;
      if (item === "Trabalhou anos em uma obra de arte-prima que foi destruída em um incêndio") ctx.obraArteDestruida = true;
      if (item === "Descobriu restos mortais enterrados no quintal de sua recém-comprada casa") ctx.restosMortaisQuintal = true;
      if (item === "Recebeu uma fortuna de herança de um completo desconhecido") ctx.herancaDesconhecido = true;
      if (item === "Descobriu ser o herdeiro direto de um império criminoso internacional") ctx.herdeiroImperioCriminoso = true;
      if (item === "Sobreviveu a um naufrágio e passou dias à deriva sem água ou comida") ctx.naufragioDeriva = true;
      if (item === "Foi atingido diretamente por um raio e sobreviveu, mas desenvolveu sequelas neurológicas") ctx.atingidoRaio = true;
      if (item === "Teve o carro completamente esmagado por uma carreta e saiu fisicamente ileso") ctx.carroEsmagadoCarreta = true;
      if (item === "Foi cancelado na internet em escala nacional por um mal-entendido catastrófico") ctx.canceladoInternet = true;
      if (item === "Passou 10 anos vivendo isolado em uma comunidade remota sem contato com o exterior") ctx.isolamentoRemoto = true;
      if (item === "Foi deportado do país onde viveu a vida inteira por um erro burocrático") ctx.deportadoErroBurocratico = true;
      if (item === "Salvo de uma tragédia por um herói anônimo que desapareceu logo em seguida") ctx.heroiAnonimo = true;
      if (item === "Sobreviveu a um infarto agudo do miocárdio aos 30 anos") ctx.infartoPrevio = true;

      // Occupational overrides from Ocupação dashboard if selected
      if (item === "Só Trabalha") { ctx.trabalha = true; ctx.estuda = false; ctx.estagio = false; }
      if (item === "Só Estuda") { ctx.trabalha = false; ctx.estuda = true; ctx.estagio = false; }
      if (item === "Trabalha e Estuda") { ctx.trabalha = true; ctx.estuda = true; ctx.estagio = false; }
      if (item === "Estuda e Estagia") { ctx.trabalha = false; ctx.estuda = true; ctx.estagio = true; }
      if (item === "Desempregado (Inativo)") { ctx.trabalha = false; ctx.estuda = false; ctx.estagio = false; }

      // Map common condition names to ctx flags if they exist
      const normalizedItem = item.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '');

      // Manual mapping for some tricky ones
      if (item === "Hipertensão") ctx.hipertenso = true;
      if (item === "Diabetes") ctx.diabetico = true;
      if (item === "Tabagismo") ctx.fumante = true;
      
      // Auto-mapping check
      // Iterate through keys in ctx and check if normalized item matches
      Object.keys(ctx).forEach(key => {
        if (key && key.toLowerCase() === normalizedItem) {
          (ctx as any)[key] = true;
        }
      });
    });

    return ctx;
  }, [dashboardLocks]);

  // Probability Results
  const stats = useMemo(() => {
    const calc = (list: any[], category: string) => {
      const items = list.map(item => {
        const label = item.name || item.text || "Unknown";
        const isSelected = dashboardLocks[category as keyof DashboardLocksState]?.includes(label);
        
        let regCategory = category;
        if (category === 'visible') regCategory = 'condicoesVisiveis';
        if (category === 'hidden') regCategory = 'condicoesNaoVisiveis';
        if (category === 'tribos') regCategory = 'tribosUrbanas';
        if (category === 'rastros') regCategory = 'rastro';
        if (category === 'shiny') regCategory = 'shinies';
        if (category === 'classe') regCategory = 'classeSocial';
        if (category === 'identidade' && etnias.includes(label)) regCategory = 'etnia';
        if (category === 'identidade' && (label === 'Homem' || label === 'Mulher' || label === 'Não-Binário')) regCategory = 'identidade';
        if (category === 'relacional') regCategory = 'relacional';
        if (category === 'filhos') regCategory = 'filhos';

        const fallbackFn = (ctx: any) => {
          const meetsCondition = !item.condition || (typeof item.condition === 'function' && item.condition(ctx));
          return meetsCondition ? (typeof item.weight === 'function' ? item.weight(ctx) : (item.weight || 1)) : 0;
        };

        const migratedList: string[] = [];
        let weight = calculateDeclarativeWeight(regCategory, label, currentCtx, fallbackFn, migratedList);
        
        // If selected, force it
        if (isSelected) weight = 999999;

        return {
          label,
          weight,
          selected: isSelected,
          converted: migratedList.length > 0
        };
      });
      
      const totalWeight = items.reduce((acc, i) => acc + (i.selected ? 0 : i.weight), 0);
      const selectedCount = items.filter(i => i.selected).length;

      return items.map(item => ({
        ...item,
        relativeProb: item.selected ? 100 : (totalWeight > 0 ? (item.weight / totalWeight) * 100 * (1 - selectedCount/10) : 0)
      })).sort((a, b) => b.weight - a.weight);
    };

    return {
      identidade: calc([
        ...["Masculino", "Feminino"].map(s => ({ text: s, weight: 1 })), 
        { text: "Transgênero", weight: 0.1 },
        ...oris.map(o => ({ text: o, weight: 1 })), 
        ...etnias.map(e => ({ text: e, weight: 1 }))
      ], 'identidade'),
      geografia: calc([...regioes.map(r => ({ text: r, weight: 1 })), { text: "Capital", weight: 1 }, { text: "Interior", weight: 1 }], 'geografia'),
      classe: calc(classes.map(c => ({ text: c, weight: 1 })), 'classe'),
      fisico: calc([...biotipos.map(b => ({ text: b, weight: 1 })), { text: "Sobrepeso", weight: 1 }, { text: "Massa Magra", weight: 1 }, { text: "Foco Tech", weight: 1 }], 'fisico'),
      contexto: calc([
        { text: "Trabalho Braçal", weight: 1 }, { text: "Zona Rural/Remota", weight: 1 }, { text: "Ansiedade", weight: 1 }, 
        { text: "Estresse", weight: 1 }, { text: "Trabalha", weight: 1 }, { text: "Estuda", weight: 1 }, { text: "Estágio", weight: 1 }
      ], 'contexto'),
      idade: calc(idades.map(i => ({ text: i, weight: 1 })), 'idade'),
      visible: calc(Object.values(NIVEIS_V).flat(), 'visible'),
      hidden: calc(Object.values(NIVEIS_NV).flat(), 'hidden'),
      shiny: calc(SHINY_EVENTS as any[], 'shiny'),
      tribos: calc(Object.values(OP_TRIBO).flat() as any[], 'tribos'),
      rastros: calc(OP_RASTRO as any[], 'rastros'),
      fetiches: calc(FETICHES_DATA as any[], 'fetiches'),
      dinamicas: calc(FILHOS_PESADOS_CONDICIONAIS.map(d => ({ text: d.text, weight: (ctx: any) => d.weight, condition: d.condition })), 'dinamicas'),
      relacional: calc(Array.from(new Set([
        "Pai Vivo", "Pai Falecido",
        "Mãe Viva", "Mãe Falecida",
        "Relacionamento: Positivo",
        "Relacionamento: Neutro",
        "Relacionamento: Negativo",
        ...RELACOES_TEXTOS.Positivo.map(t => `Rel Positivo: ${t}`),
        ...RELACOES_TEXTOS.Neutro.map(t => `Rel Neutro: ${t}`),
        ...RELACOES_TEXTOS.Negativo.map(t => `Rel Negativo: ${t}`),
        ...Object.values(RULES_REGISTRY['relacional'] || {}).filter(i => i.name).map(i => i.name!)
      ])).map(text => {
        let weight = 1/5;
        if (text === "Pai Vivo" || text === "Mãe Viva") weight = 0.75;
        if (text === "Pai Falecido" || text === "Mãe Falecida") weight = 0.25;
        if (text === "Relacionamento: Positivo") weight = 0.30;
        if (text === "Relacionamento: Neutro") weight = 0.55;
        if (text === "Relacionamento: Negativo") weight = 0.15;
        return { text, weight };
      }), 'relacional'),
      filhos: calc([
        { text: "Filho: Criança", weight: 1 },
        { text: "Filho: Adolescente", weight: 1 },
        { text: "Filho: Adulto", weight: 1 },
        ...Object.entries(FILHOS_TEXTOS).flatMap(([age, qualities]) => 
          Object.entries(qualities as Record<string, string[]>).flatMap(([quality, texts]) => 
            texts.map(t => ({ 
              text: `Filho ${age} (${quality}): ${t}`, 
              weight: age === "Criança" ? 1/15 : 1/3,
              condition: (ctx: any) => ctx.idade >= (age === "Criança" ? 18 : age === "Adolescente" ? 32 : 45)
            }))
          )
        )
      ], 'filhos'),
      logistica: calc([
        ...OP_LOGISTICA_TRANSPORTE.map(t => ({ text: t })),
        ...["Residência Padrão", "Condomínio Fechado", "Zeladoria", "Pensão/Quitinete", "Ocupação/Favela", "Zona Rural/Sítio"].map(h => ({ text: h }))
      ], 'logistica'),
      ocupacao: calc([
        { text: "Só Trabalha", condition: (ctx: any) => ctx.trabalha && !ctx.estuda && !ctx.estagio, weight: 1 },
        { text: "Só Estuda", condition: (ctx: any) => !ctx.trabalha && ctx.estuda && !ctx.estagio, weight: 1 },
        { text: "Trabalha e Estuda", condition: (ctx: any) => ctx.trabalha && ctx.estuda && !ctx.estagio, weight: 1 },
        { text: "Estuda e Estagia", condition: (ctx: any) => !ctx.trabalha && ctx.estuda && ctx.estagio, weight: 1 },
        { text: "Desempregado (Inativo)", condition: (ctx: any) => !ctx.trabalha && !ctx.estuda && !ctx.estagio, weight: 1 },
      ], 'ocupacao'),
      profissoes: (() => {
        const currentClasse = getSelected('classe', classes) || classes[0];
        const currentRegiao = getSelected('geografia', regioes as any) || 'Sudeste';
        const isCapital = getSelected('geografia', ["Capital", "Interior"]) === 'Capital';
        
        const isElite = currentClasse.includes("Elite");
        const isAgroZone = (currentRegiao === "Centro-Oeste" || currentRegiao === "Sul") && !isCapital;
        const isBrasilia = currentRegiao === "Centro-Oeste" && isCapital;
        const isVulnerable = currentClasse.includes("Base") || currentClasse.includes("Baixa");

        // Pools from regional and universal
        const regionalPool = PROFISSOES_REGIONAIS[currentRegiao]?.[currentClasse] || [];
        const universalPool = PROFISSOES_UNIVERSAIS[currentClasse] || [];
        const illicitPool = PROFISSOES_REGIONAIS[currentRegiao]?.["Ilícito"] || [];
        
        // Dynamic construction similar to characterGenerator
        let pool = [...new Set([...regionalPool, ...universalPool, ...illicitPool])];

        const isMiddle = currentClasse.includes("Média");
        
        // Add sector specific categories
        if (isAgroZone && (isElite || isMiddle)) {
          pool = [...new Set([...pool, ...PROFISSOES_CATEGORIZADAS["Agronegócio & Latifúndio"]])];
        }
        
        if (isElite || isMiddle) {
          pool = [...new Set([...pool, ...PROFISSOES_CATEGORIZADAS["Engrenagem Corporativa / Classe Média"]])];
        }

        if (isElite) {
          pool = [...new Set([...pool, ...PROFISSOES_CATEGORIZADAS["Alta Elite & Corporativo"]])];
        }

        if (isVulnerable) {
          pool = [...new Set([...pool, ...PROFISSOES_CATEGORIZADAS["Base / Vulneráveis"]])];
        }

        // Politics & Power
        if (isBrasilia || isElite) {
          pool = [...new Set([...pool, ...PROFISSOES_CATEGORIZADAS["Política e Poder"]])];
        }

        // Subworld / Illegal - If any illicit or underworld shiny is selected
        const hasIllegalContext = dashboardLocks.shiny.length > 0 || dashboardLocks.tribos.some(t => t && (t.toLowerCase().includes("crime") || t.toLowerCase().includes("marginal")));
        if (hasIllegalContext) {
          pool = [...new Set([...pool, ...PROFISSOES_CATEGORIZADAS["Submundo & Fronteira"]])];
        }

        const professions = pool.map(p => ({ text: p, weight: 1 }));
        return calc(professions, 'profissoes');
      })()
    };
  }, [currentCtx, dashboardLocks, regioes, classes, etnias, oris, biotipos, idades]);

  const toggleDashboardLock = (category: keyof DashboardLocksState, label: string) => {
    setDashboardLocks(prev => {
      const current = prev[category] || [];
      if (current.includes(label)) {
        return { ...prev, [category]: current.filter(i => i !== label) };
      }
      
      const limit = DASHBOARD_LIMITS[category] || 1;
      const actualLimit = category === 'visible' && prev.shiny.length > 0 ? limit + 1 : limit;

      if (current.length >= actualLimit) {
        if (actualLimit === 1) return { ...prev, [category]: [label] };
        return prev;
      }

      return { ...prev, [category]: [...current, label] };
    });
  };

  const handleExport = () => {
    const exportData = JSON.stringify(dashboardLocks, null, 2);
    navigator.clipboard.writeText(exportData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFinalRoll = () => {
    const selOri = getSelected('identidade', oris);
    const selSex = getSelected('identidade', ["Masculino", "Feminino"]);
    const selEtnia = getSelected('identidade', etnias);
    const selRegiao = getSelected('geografia', regioes as any);
    const selPerfil = getSelected('geografia', ["Capital", "Interior"]);
    const selClasse = getSelected('classe', classes);
    const selIdade = getSelected('idade', idades);

    let idadeVal = undefined;
    if (selIdade === "Jovem (15-25)") idadeVal = 20;
    if (selIdade === "Adulto (26-45)") idadeVal = 35;
    if (selIdade === "Maduro (46-60)") idadeVal = 52;
    if (selIdade === "Idoso (61-80)") idadeVal = 70;

    const generationOptions: GenerationOptions = {
      fixedAge: idadeVal,
      fixedBioSex: selSex as any,
      fixedTrans: dashboardLocks.identidade.includes("Transgênero"),
      fixedClass: selClasse,
      fixedRegion: selRegiao as any,
      fixedEthnicity: selEtnia,
      fixedLocality: selPerfil as any,
      fixedManualLabor: dashboardLocks.contexto.includes("Trabalho Braçal"),
      fixedRemoteArea: dashboardLocks.contexto.includes("Zona Rural/Remota"),
      fixedAnxiety: dashboardLocks.contexto.includes("Ansiedade"),
      fixedStress: dashboardLocks.contexto.includes("Estresse"),
      fixedRelational: dashboardLocks.relacional,
      fixedFilhos: dashboardLocks.filhos
    };
    
    const result = generateCharacterData(generationOptions);
    onFinish(result);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg overflow-hidden border-t border-dark-border">
      {/* Mobile Tab Switcher - Now simpler as there's only one main view */}
      <div className="md:hidden flex shrink-0 border-b border-dark-border bg-dark-surface/50">
        <div className="flex-1 p-4 text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center justify-center gap-2 bg-gold/10">
          <Activity className="w-3 h-3" />
          Probabilidades Dashboard
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="flex-1 overflow-x-auto custom-scrollbar bg-black/40 backdrop-blur-sm">
        <div className="min-w-[2800px] h-full p-6 flex flex-col space-y-6 overflow-hidden">
          
          <div className="shrink-0 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-ice flex items-center gap-3">
                <Activity className="w-6 h-6 text-gold" />
                Live Probabilities Dashboard
              </h2>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Simulação estocástica total em colunas de decisão</p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleExport}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded border border-white/5 font-mono text-[9px] uppercase tracking-[0.2em] transition-all bg-dark-bg/60 hover:bg-white/5 text-white/60`}
              >
                {copied ? <RefreshCw className="w-3 h-3 animate-spin shadow-gold/20 shadow-lg" /> : <FileJson className="w-3 h-3" />}
                {copied ? 'Exportado' : 'Exportar JSON'}
              </button>
              
              <button 
                onClick={handleFinalRoll}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-gold text-black font-display font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-gold-hover active:scale-95 transition-all shadow-gold/20"
              >
                <Dice5 className="w-4 h-4" />
                Finalizar Roll das Opções Restantes
              </button>
            </div>
          </div>
 
          <div className="flex-1 grid grid-cols-16 gap-6 overflow-hidden">
            {/* Context Columns (Old Locks) */}
            <DashboardColumn icon={<Users className="w-4 h-4 text-blue-400" />} title="Identidade" items={stats.identidade} onToggle={(l) => toggleDashboardLock('identidade', l)} limit={DASHBOARD_LIMITS.identidade} />
            <DashboardColumn icon={<GraduationCap className="w-4 h-4 text-indigo-400" />} title="Idade" items={stats.idade} onToggle={(l) => toggleDashboardLock('idade', l)} limit={DASHBOARD_LIMITS.idade} />
            <DashboardColumn icon={<Globe className="w-4 h-4 text-cyan-400" />} title="Geografia" items={stats.geografia} onToggle={(l) => toggleDashboardLock('geografia', l)} limit={DASHBOARD_LIMITS.geografia} />
            <DashboardColumn icon={<TrendingDown className="w-4 h-4 text-emerald-400" />} title="Classe" items={stats.classe} onToggle={(l) => toggleDashboardLock('classe', l)} limit={DASHBOARD_LIMITS.classe} />
            <DashboardColumn icon={<Heart className="w-4 h-4 text-rose-400" />} title="Físico" items={stats.fisico} onToggle={(l) => toggleDashboardLock('fisico', l)} limit={DASHBOARD_LIMITS.fisico} />
            <DashboardColumn icon={<Compass className="w-4 h-4 text-amber-400" />} title="Contexto" items={stats.contexto} onToggle={(l) => toggleDashboardLock('contexto', l)} limit={DASHBOARD_LIMITS.contexto} />

            {/* Analytics Columns */}
            <DashboardColumn 
              icon={<Eye className="w-4 h-4 text-emerald-400" />} 
              title="Visíveis" 
              items={stats.visible} 
              onToggle={(label) => toggleDashboardLock('visible', label)} 
              limit={DASHBOARD_LIMITS.visible + (dashboardLocks.shiny.length > 0 ? 1 : 0)} 
            />
            <DashboardColumn 
              icon={<EyeOff className="w-4 h-4 text-orange-400" />} 
              title="Ocultas" 
              items={stats.hidden} 
              onToggle={(label) => toggleDashboardLock('hidden', label)}
              limit={DASHBOARD_LIMITS.hidden} 
            />
            <DashboardColumn 
              icon={<Zap className="w-4 h-4 text-gold" />} 
              title="Shinies" 
              items={stats.shiny} 
              onToggle={(label) => toggleDashboardLock('shiny', label)}
              limit={DASHBOARD_LIMITS.shiny} 
            />
            <DashboardColumn 
              icon={<Briefcase className="w-4 h-4 text-amber-400" />} 
              title="Ocupação" 
              items={stats.ocupacao} 
              onToggle={(label) => toggleDashboardLock('ocupacao', label)}
              limit={DASHBOARD_LIMITS.ocupacao} 
            />
            <DashboardColumn 
              icon={<Briefcase className="w-4 h-4 text-emerald-400" />} 
              title="Profissões" 
              items={stats.profissoes} 
              onToggle={(label) => toggleDashboardLock('profissoes', label)}
              limit={DASHBOARD_LIMITS.profissoes} 
            />
            <DashboardColumn 
              icon={<Layout className="w-4 h-4 text-purple-400" />} 
              title="Tribos" 
              items={stats.tribos} 
              onToggle={(label) => toggleDashboardLock('tribos', label)}
              limit={DASHBOARD_LIMITS.tribos} 
            />
            <DashboardColumn 
              icon={<Fingerprint className="w-4 h-4 text-cyan-400" />} 
              title="Rastros" 
              items={stats.rastros} 
              onToggle={(label) => toggleDashboardLock('rastros', label)}
              limit={DASHBOARD_LIMITS.rastros} 
            />
            <DashboardColumn 
              icon={<Flame className="w-4 h-4 text-red-500" />} 
              title="Fetiches" 
              items={stats.fetiches} 
              onToggle={(label) => toggleDashboardLock('fetiches', label)}
              limit={DASHBOARD_LIMITS.fetiches} 
            />
            <DashboardColumn 
              icon={<Users className="w-4 h-4 text-blue-400" />} 
              title="Dinâmicas" 
              items={stats.dinamicas} 
              onToggle={(label) => toggleDashboardLock('dinamicas', label)}
              limit={DASHBOARD_LIMITS.dinamicas} 
            />
            <DashboardColumn 
              icon={<Users className="w-4 h-4 text-blue-400" />} 
              title="Relacional" 
              items={stats.relacional} 
              onToggle={(label) => toggleDashboardLock('relacional', label)}
              limit={DASHBOARD_LIMITS.relacional} 
            />
            <DashboardColumn 
              icon={<Users className="w-4 h-4 text-indigo-400" />} 
              title="Filhos" 
              items={stats.filhos} 
              onToggle={(label) => toggleDashboardLock('filhos', label)}
              limit={DASHBOARD_LIMITS.filhos} 
            />
            <DashboardColumn 
              icon={<Truck className="w-4 h-4 text-orange-400" />} 
              title="Logística" 
              items={stats.logistica} 
              onToggle={(label) => toggleDashboardLock('logistica', label)}
              limit={DASHBOARD_LIMITS.logistica} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

// SandboxSelect removed as it's no longer used

const DashboardColumn = ({ icon, title, items, onToggle, limit }: { icon: React.ReactNode, title: string, items: any[], onToggle: (label: string) => void, limit: number }) => {
  const selectedCount = items.filter(i => i.selected).length;
  
  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-white/5 last:border-0 pr-4">
      <div className="flex items-center justify-between py-3 border-b border-white/5 shrink-0 mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-white/80">{title}</h4>
        </div>
        <span className={`text-[9px] font-mono ${selectedCount >= limit ? 'text-gold' : 'text-white/20'}`}>
          {selectedCount}/{limit}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar-slim space-y-4 pb-12">
        {items.map((s, idx) => (
          <div key={idx} onClick={() => onToggle(s.label)} className="cursor-pointer">
            <ProbabilityBar 
              label={s.label} 
              weight={s.weight} 
              relativeProb={s.relativeProb} 
              selected={s.selected} 
              converted={s.converted} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProbabilityBar = ({ label, weight, relativeProb, selected, converted }: { label: string, weight: number, relativeProb: number, selected?: boolean, converted?: boolean }) => {
  const colorClass = selected ? 'bg-gold shadow-[0_0_8px_rgba(255,191,0,0.5)]' : (weight > 10 ? 'bg-red-500' : weight > 5 ? 'bg-orange-500' : weight > 1 ? 'bg-gold' : 'bg-white/10');

  const getTextColor = () => {
    if (selected) return 'text-gold font-bold';
    if (converted) return 'text-blue-400 font-medium'; // Changed from "bolinha azul" to blue text
    return 'text-white/40 group-hover:text-white';
  };

  return (
    <div className={`space-y-1 group transition-all duration-300 ${selected ? 'scale-[1.02]' : ''}`}>
      <div className="flex justify-between text-[10px] font-mono items-center">
        <span className={`transition-colors truncate mr-2 ${getTextColor()}`} title={label}>
          {selected && <Lock className="w-2 h-2 inline mr-1 mb-0.5" />}
          {label}
        </span>
        <div className="flex gap-2 shrink-0">
          <span className={selected ? 'text-gold/60' : converted ? 'text-blue-400/60' : 'text-white/20'}>{relativeProb.toFixed(selected ? 0 : 2)}%</span>
          <span className={`${selected || weight > 1.1 ? 'text-gold font-bold' : 'text-white/20'}`}>
            {selected ? 'LOCKED' : `${weight.toFixed(1)}x`}
          </span>
        </div>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ width: `${Math.min(relativeProb * (selected ? 1 : 8), 100)}%` }} // Visual scaling
          className={`h-full transition-all duration-500 ${colorClass}`}
        />
      </div>
    </div>
  );
};
