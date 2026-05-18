
import { fakerPT_BR as faker } from '@faker-js/faker';
import { 
  randomChoice, 
  weightedRandom, 
  rollWeighted, 
  rollUniform, 
  gaussRandom, 
  normalPdf 
} from '../utils/math';
import { 
  ConditionContext, 
  CharacterCondition, 
  GenerationOptions, 
  CharacterResult,
  ProbData,
  ShinyEvent
} from '../types/character';
import {
  PROFISSOES_UNIVERSAIS,
  PROFISSOES_REGIONAIS,
  PROFISSOES_CATEGORIZADAS,
  ILICITO_UNIVERSAL,
  OP_RES,
  NOMES_NEUTROS,
  OP_RASTRO,
  SHINY_EVENTS,
  RELACOES_TEXTOS,
  OP_LIBIDO,
  OP_TEMPERAMENTO,
  OP_CORPO,
  FILHOS_TEXTOS
} from '../data/staticData';
import {
  NIVEIS_NV,
  NIVEIS_V,
  OP_TRIBO,
  FETICHES_DATA,
  FILHOS_PESADOS_CONDICIONAIS
} from '../rules/conditions';
import { RULES_REGISTRY } from '../data/rulesRegistry';
import { CONDITION_TO_PARTS } from './bodyPartMapping';

export const getLogistics = (classe: string, regiao: string, perfil: string): { value: string, prob: number, poolSize: number } => {
    const isCapital = perfil.includes("Capital");
    const options = ["Público/Alternativo", "Transporte por App", "Veículo Próprio"];
    let weights = [33.3, 33.3, 33.3];
    
    // Sudeste & Sul/Centro-Oeste (Modern Urban)
    if (regiao === "Sudeste" || regiao === "Sul" || regiao === "Centro-Oeste") {
        if (classe.includes("Base")) weights = [80, 15, 5];
        else if (classe.includes("Baixa")) weights = [50, 30, 20];
        else if (classe.includes("Alta")) weights = [20, 30, 50];
        else if (classe.includes("Elite")) weights = [5, 20, 75];
    } 
    // Norte (Rural/River focus)
    else if (regiao === "Norte") {
        if (!isCapital) {
             // In interior of North, apps are almost non-existent for the base.
             if (classe.includes("Base")) weights = [90, 2, 8];
             else if (classe.includes("Baixa")) weights = [70, 5, 25];
             else weights = [10, 5, 85];
        } else {
             if (classe.includes("Base")) weights = [70, 20, 10];
             else if (classe.includes("Baixa")) weights = [40, 40, 20];
             else weights = [10, 20, 70];
        }
    }
    // Nordeste (Mixed)
    else if (regiao === "Nordeste") {
        if (classe.includes("Base")) weights = [75, 20, 5];
        else if (classe.includes("Baixa")) weights = [45, 35, 20];
        else weights = [15, 25, 60];
    }
    
    return rollWeighted(options, weights);
};

// --- Exclusivity Constants & Helpers ---

const CONDITION_FAMILIES: Record<string, string[]> = {
  'Miopia': ['Miopia Leve', 'Miopia Leve a Moderada', 'Alta Miopia (Acima de 6 Graus)', 'Alta Miopia Degenerativa com Lesões Retinianas'],
  'Gastrite': ['Gastrite Leve por Estresse', 'Dispepsia Funcional (Gastrite Nervosa)', 'Gastrite Erosiva por Estresse Crônico', 'Gastrite Aguda por Estresse com Risco de Sangramento'],
  'Alopecia': ['Calvície Androgenética Inicial', 'Calvície Androgenética Avançada', 'Alopecia Areata (Perda em Placas)'],
  'Colesterol': ['Dislipidemia Leve (LDL-C Alterado)', 'Hipercolesterolemia Moderada (Risco Cardiovascular Alto)', 'Hipercolesterolemia Familiar ou Risco Cardiovascular Muito Alto'],
  'Esteatose': ['Esteatose Hepática Leve (Grau I)', 'Esteatose Hepática Moderada (Grau II)', 'Esteatose Hepática Avançada (Esteato-hepatite / NASH)'],
  'Trauma Elétrico': ['Neuropatia Traumática Pós-Elétrica Leve', 'Encefalopatia e Neuropatia Elétrica Moderada', 'Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)', 'Neuropatia Periférica e Encefalopatia por Trauma Elétrico Atmosférico']
};

const getFamily = (name: string) => {
  for (const [family, members] of Object.entries(CONDITION_FAMILIES)) {
    if (members.includes(name)) return family;
  }
  return null;
};

// --- Interception Engine V2 (Declarative Rules) ---
export const calculateDeclarativeWeight = (
  category: string, 
  itemName: string, 
  ctx: ConditionContext, 
  fallbackWeightFn: (ctx: ConditionContext) => number,
  migratedItems?: string[],
  level?: number
): number => {
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
  const itemKey = normalize(itemName);
  
  const registryItem = RULES_REGISTRY[category]?.[itemKey];
  
  // Se NÃO existir no registro, executa o fallback (código antigo)
  if (!registryItem) {
    // SHORT-CIRCUIT: Trava de Migração para Níveis 1 e 2 de Condições Visíveis
    const levelsMigrated = [1, 2];
    if (category === 'condicoesVisiveis' && levelsMigrated.includes(level ?? 0)) {
      return 0; // Força ignorar o código legado para estes níveis migrados
    }
    return fallbackWeightFn(ctx);
  }
  
  // Se EXISTIR, aplica a lógica declarativa JSON e marca como migrado
  if (migratedItems && !migratedItems.includes(itemName)) {
    migratedItems.push(itemName);
  }

  let finalWeight = registryItem.baseWeight;
  
  for (const rule of registryItem.rules) {
    const ctxValue = (ctx as any)[rule.property];
    let matches = false;
    
    // Comparação flexível (string vs primitive)
    const val = String(rule.value);
    const target = String(ctxValue);

    switch (rule.operator) {
      case '==': matches = target === val; break;
      case '!=': matches = target !== val; break;
      case '>': matches = Number(ctxValue) > Number(rule.value); break;
      case '<': matches = Number(ctxValue) < Number(rule.value); break;
      case '>=': matches = Number(ctxValue) >= Number(rule.value); break;
      case '<=': matches = Number(ctxValue) <= Number(rule.value); break;
      case 'includes': matches = target.toLowerCase().includes(val.toLowerCase()); break;
    }
    
    if (matches) {
      finalWeight *= rule.multiplier;
    }
  }
  
  return finalWeight;
};

const addConditionWithExclusivity = (name: string, conditionsV: string[], conditionsNV: string[], force: boolean = false) => {
  const familyName = getFamily(name);
  const members = familyName ? CONDITION_FAMILIES[familyName] : [];

  if (familyName && !force) {
    if (conditionsV.some(c => members.includes(c)) || conditionsNV.some(c => members.includes(c))) {
      return false; // Already has a member of this family
    }
  }

  if (familyName && force) {
     // Overwrite lighter/other variants
     for (let i = conditionsV.length - 1; i >= 0; i--) {
       if (members.includes(conditionsV[i])) conditionsV.splice(i, 1);
     }
     for (let i = conditionsNV.length - 1; i >= 0; i--) {
       if (members.includes(conditionsNV[i])) conditionsNV.splice(i, 1);
     }
  }

  const isInV = Object.values(NIVEIS_V).some(lvl => lvl.some(c => c.name === name));
  if (isInV) {
    if (!conditionsV.includes(name)) conditionsV.push(name);
  } else {
    if (!conditionsNV.includes(name)) conditionsNV.push(name);
  }
  return true;
};

// --- Core Logic Helpers ---

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

const getWeightedTribo = (ctx: ConditionContext, migratedItems: string[]): { name: string, prob: ProbData } => {
  const categories = Object.keys(OP_TRIBO);
  const catRoll = rollUniform(categories);
  const pool = OP_TRIBO[catRoll.value];
  const weights = pool.map(i => calculateDeclarativeWeight('tribosUrbanas', i.name, ctx, i.weight, migratedItems));
  const roll = rollWeighted(pool.map(p => p.name), weights);
  return { name: roll.value, prob: { prob: (catRoll.prob / 100) * roll.prob, poolSize: roll.poolSize } };
};

const getWeightedCenaSexualidade = (ctx: ConditionContext): { value: string, prob: ProbData } => {
  const options = ["Tradicional / Monogâmica", "Poliamor / Aberta", "Casual / Desapegada", "NSFW / BDSM Oculto", "Celibato / Involuntário", "Hedonista / Sem Limites"];
  const roll = rollUniform(options);
  return { value: roll.value, prob: { prob: roll.prob, poolSize: roll.poolSize } };
};

const getWeightedFetishes = (ctx: ConditionContext, migratedItems: string[]): { names: string[], probs: ProbData[] } => {
  const names: string[] = [];
  const probs: ProbData[] = [];
  
  const baseChance = 0.3;
  if (Math.random() < baseChance) {
    const weights = FETICHES_DATA.map(f => calculateDeclarativeWeight('fetiches', f.name, ctx, f.weight, migratedItems));
    const roll = rollWeighted(FETICHES_DATA.map(f => f.name), weights);
    names.push(roll.value);
    probs.push({ prob: baseChance * (roll.prob / 100) * 100, poolSize: roll.poolSize });
    
    const secondChance = 0.2;
    if (Math.random() < secondChance) {
      const secondRoll = rollUniform(FETICHES_DATA.map(f => f.name));
      if (!names.includes(secondRoll.value)) {
        names.push(secondRoll.value);
        probs.push({ prob: secondChance * (secondRoll.prob / 100) * 100, poolSize: secondRoll.poolSize });
      }
    }
  }
  return { names, probs };
};

const getSeniorityLevel = (idade: number, classe: string): string => {
  if (idade < 18) return "";
  if (classe.includes("Vulnerável")) return Math.random() < 0.1 ? "Sênior" : "";
  if (idade > 45) return "Diretor(a)";
  if (idade > 35) return "Sênior";
  if (idade > 28) return "Pleno";
  return "Júnior";
};

const getMaxConditionLevel = (conditionsV: string[], conditionsNV: string[]) => {
  let maxLevel = 0;
  [...conditionsV, ...conditionsNV].forEach(name => {
    for (let level = 1; level <= 10; level++) {
      if (NIVEIS_V[level] && NIVEIS_V[level].some(c => c.name === name)) {
        if (level > maxLevel) maxLevel = level;
      }
      if (NIVEIS_NV[level] && NIVEIS_NV[level].some(c => c.name === name)) {
        if (level > maxLevel) maxLevel = level;
      }
    }
  });
  return maxLevel;
};

const defineOccupationStatus = (ctx: ConditionContext, maxLevel: number, options: GenerationOptions) => {
  let aposentado = false;
  let trabalha = false;
  let estuda = false;
  let estagio = false;
  let desempregado = false;

  const isElite = ctx.classe.includes("Elite");
  const isVulnerable = ctx.classe.includes("Base Precarizada / Vulnerável") || ctx.classe.includes("Baixa");

  // 1. Force Quit Médico / Idade
  if (maxLevel >= 8 || ctx.idade >= 65) {
    if (isElite && ctx.idade >= 65 && Math.random() < 0.40) {
      trabalha = true;
    } else {
      aposentado = true;
    }
  }

  if (!aposentado && !trabalha) {
    if (ctx.idade >= 18 && ctx.idade <= 24) {
      if (isElite || ctx.classe.includes("Média Alta")) {
        const roll = Math.random();
        if (roll < 0.80) {
          estuda = true;
          if (Math.random() < (ctx.capital ? 0.45 : 0.15)) {
              estagio = true;
              trabalha = true;
          }
        } else if (roll < 0.95) {
          trabalha = true;
        } else {
          desempregado = true;
        }
      } else if (isVulnerable) {
        const roll = Math.random();
        const isNorthNortheastBlack = ctx.negroPardo && (ctx.regiao === "Norte" || ctx.regiao === "Nordeste");
        const unemploymentChance = isNorthNortheastBlack ? 0.25 : 0.10;

        if (roll < 0.60) {
          trabalha = true;
          estuda = true; 
        } else if (roll < 0.90 - (isNorthNortheastBlack ? 0.15 : 0)) {
          trabalha = true;
        } else {
          desempregado = true;
        }
      } else {
          trabalha = true;
          if (Math.random() < 0.4) estuda = true;
      }
    } else if (ctx.idade >= 25 && ctx.idade <= 64) {
      estuda = Math.random() < 0.10;
      let unempChance = 0.08;
      if (isVulnerable && !ctx.capital) unempChance = 0.15;
      if (isElite && ctx.capital) unempChance = 0.02;

      if (Math.random() < unempChance) {
        desempregado = true;
      } else {
        trabalha = true;
      }
    } else if (ctx.idade < 18) {
        estuda = true;
    }
  }

  if (options.forceUnemployed) {
      trabalha = false;
      desempregado = true;
      estagio = false;
  }

  return { aposentado, trabalha, estuda, estagio, desempregado };
};

const selectProfession = (ctx: ConditionContext, migratedItems: string[]) => {
  // RULE OF GOLD: If doesn't work, specific label.
  if (ctx.aposentado) return { value: "Aposentado / Inválido", prob: 100, poolSize: 1 };
  if (ctx.desempregado) return { value: "Desempregado", prob: 100, poolSize: 1 };
  if (ctx.estuda && !ctx.trabalha) return { value: "Estudante", prob: 100, poolSize: 1 };

  let pool: string[] = [];
  const isElite = ctx.classe.includes("Elite");
  const isAgroZone = (ctx.regiao === "Centro-Oeste" || ctx.regiao === "Sul") && !ctx.capital;
  const isBrasilia = ctx.regiao === "Centro-Oeste" && ctx.capital;
  const isVulnerable = ctx.classe.includes("Base") || ctx.classe.includes("Baixa");

  // Tier 1: Core Sector Selection
  if (isElite && ctx.regiao === "Sudeste" && ctx.capital) {
    pool = [...PROFISSOES_CATEGORIZADAS["Alta Elite & Corporativo"]];
  } else if (isAgroZone && (isElite || ctx.classe.includes("Média"))) {
    pool = [...PROFISSOES_CATEGORIZADAS["Agronegócio & Latifúndio"]];
  } else if (isVulnerable) {
    pool = [...PROFISSOES_CATEGORIZADAS["Base / Vulneráveis"]];
  } else if (ctx.classe.includes("Média")) {
    pool = [...PROFISSOES_CATEGORIZADAS["Engrenagem Corporativa / Classe Média"]];
  } else {
    pool = [...PROFISSOES_CATEGORIZADAS["Base / Vulneráveis"]];
  }

  // Tier 2: Niche Additions
  
  // Politics
  if (isBrasilia || (isElite && ctx.capital && Math.random() < 0.3)) {
    pool = [...pool, ...PROFISSOES_CATEGORIZADAS["Política e Poder"]];
  }

  // Regional Niches (40% chance to swap to regional pool or merge)
  if (Math.random() < 0.4) {
    if (ctx.regiao === "Norte") pool = [...pool, ...PROFISSOES_CATEGORIZADAS["Regional Norte"]];
    if (ctx.regiao === "Nordeste") pool = [...pool, ...PROFISSOES_CATEGORIZADAS["Regional Nordeste"]];
    if (ctx.regiao === "Sul") pool = [...pool, ...PROFISSOES_CATEGORIZADAS["Regional Sul"]];
    if (ctx.regiao === "Sudeste") pool = [...pool, ...PROFISSOES_CATEGORIZADAS["Regional Sudeste"]];
  }

  // Subworld / Illegal (based on specific context tags)
  if (ctx.marginalizado || ctx.isolamentoRemoto || ctx.exDetento || ctx.paranoiaFortuna || ctx.herdeiroImperioCriminoso) {
    pool = [...pool, ...PROFISSOES_CATEGORIZADAS["Submundo & Fronteira"]];
  }

  // Final fallback if pool empty (safety)
  if (pool.length === 0) {
    pool = ["Trabalhador Autônomo", "Comerciante Local"];
  }

  // Use Declarative Engine for each item in pool
  const weights = pool.map(profName => 
    calculateDeclarativeWeight('profissoes', profName, ctx, () => 1.0, migratedItems)
  );

  const roll = rollWeighted(pool, weights);
  return { value: roll.value, prob: roll.prob, poolSize: roll.poolSize };
};

const getFriccaoUrbana = (regiao: string, perfil: string, classe: string, nome: string): string => {
  const isCapital = perfil.includes("Capital");
  
  if (regiao === "Sudeste") {
    if (isCapital) {
      if (classe.includes("Base")) return `Dependência absoluta de metrô/trem alimentado por ônibus da periferia. Alta fricção física, empurra-empurra e deslocamento diário acima de 3h.`;
      if (classe.includes("Baixa")) return `Uso estratégico do metrô para fugir do trânsito. Carro popular na garagem para economizar, aplicativos em dias de chuva.`;
      if (classe.includes("Alta")) return `Deslocamento em SUV/Sedan próprio com ar-condicionado. Metrô é raro e apenas se houver linha expressa direta.`;
      return `Veículos blindados conduzidos por motorista particular. Uso de helipontos para evitar o solo em distâncias críticas.`;
    } else {
      if (classe.includes("Base")) return `Caminhadas sob o sol e bicicletas antigas como meio principal. Ônibus intermunicipais com poucos horários.`;
      if (classe.includes("Baixa")) return `Motocicletas de baixa cilindrada para cortar o trânsito local. Carros antigos com manutenção postergada.`;
      if (classe.includes("Alta")) return `Sedans robustos ou picapes compactas. Dependência total do automóvel pela ausência de transporte estruturado.`;
      return `Picapes topo de linha ou SUVs importados. Uso de aeródromos regionais para acessar a capital rapidamente.`;
    }
  }

  if (regiao === "Norte") {
    if (isCapital) {
      if (classe.includes("Base")) return `Ônibus circulares saturados de poeira e calor. Em áreas ribeirinhas, começa com pequenas embarcações de madeira (catraias).`;
      if (classe.includes("Baixa")) return `Uso intenso de motocicletas adaptadas ao clima instável e aplicativos rodando por vias com alagamentos sazonais.`;
      if (classe.includes("Alta")) return `SUVs de tração integral essenciais para a infraestrutura local. Posse de lanchas em marinas privadas para recreação.`;
      return `Picapes de luxo e veículos importados. Deslocamentos interestaduais feitos por táxi aéreo ou embarcações climatizadas.`;
    } else {
      if (classe.includes("Base")) return `Viagens fluviais longas em barcos de recreio onde se dorme em redes por dias. Em terra, a pé ou em caminhões de carga.`;
      if (classe.includes("Baixa")) return `Barcos de linha de médio porte e motocicletas trail para estradas de terra batida.`;
      if (classe.includes("Alta")) return `Embarcações rápidas (voadeiras) de uso privado ou picapes seminovas para rodovias estaduais.`;
      return `Lanchas de luxo com alta autonomia ou bimotores privados. O transporte aéreo é a única alternativa para evitar o isolamento.`;
    }
  }

  if (regiao === "Nordeste") {
    if (isCapital) {
      if (classe.includes("Base")) return `Sistemas de BRT ou trens urbanos combinados com vans. Uso de mototáxi para vencer relevos acidentados e vielas estreitas.`;
      if (classe.includes("Baixa")) return `Ônibus convencionais e alto uso de aplicativos para corridas curtas ou divididas. Presença de motos econômicas.`;
      if (classe.includes("Alta")) return `Automóveis próprios com ar-condicionado vital. Aplicativos premium nos fins de semana para zonas litorâneas.`;
      return `Sedans executivos e SUVs europeus circulando estritamente entre bairros nobres e condomínios de veraneio.`;
    } else {
      if (classe.includes("Base")) return `Bicicletas cargueiras, vans antigas adaptadas ou veículos de carroceria aberta (paus-de-arara) em vilarejos.`;
      if (classe.includes("Baixa")) return `Motocicletas de uso misto (estrada/terra) e carros populares compactos com mais de uma década de uso.`;
      if (classe.includes("Alta")) return `Picapes cabine dupla a diesel ou SUVs de entrada, indispensáveis para a ponte entre propriedades agrícolas e polos.`;
      return `Caminhonetes importadas, vans executivas fretadas e conexões frequentes através de aeroportos regionais.`;
    }
  }

  // Sul / Centro-Oeste
  if (isCapital) {
    if (classe.includes("Base")) return `Redes integradas de BRT com canaletas exclusivas. Trajetos longos mas com maior previsibilidade de horários.`;
    if (classe.includes("Baixa")) return `Ônibus articulados conjugados com carros hatch. Alto índice de caronas compartilhadas intermunicipais.`;
    if (classe.includes("Alta")) return `Veículos modernos focados em tecnologia. Forte adesão ao uso de bicicletas em ciclovias por estilo de vida.`;
    return `Sedans de luxo e SUVs esportivos premium. A blindagem é menos frequente, priorizando conforto e potência.`;
  } else {
    if (classe.includes("Base")) return `Ônibus fretados por cooperativas ou usinas. Bicicletas de marcha e motos de baixo valor para comércio local.`;
    if (classe.includes("Baixa")) return `Veículos robustos de segunda mão com boa altura (para estradas de cascalho) ou motos utilitárias.`;
    if (classe.includes("Alta")) return `Picapes cabine dupla modernas usadas como ferramenta de trabalho na lavoura e transporte familiar.`;
    return `Picapes de grande porte importadas e customizadas, SUVs de luxo e aeronaves turboélice baseadas nos hangares das fazendas.`;
  }
};

// --- Main Export ---


interface PhotoContext {
  idade: number;
  classe: string;
  regiao: string;
  imc: number;
  conditionsV: string[];
  shiny: string;
  mentalHealth: number;
  physicalHealth: number;
}

function generateDossierPhotos(ctx: PhotoContext): string[] {
  const rnd = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  // -- FOTO 1: ROSTO E CÂMERA POR IDADE --
  let f1Base = "";
  if (ctx.idade < 25) {
    f1Base = rnd([
      "Selfie no espelho trincado", 
      "Print screen de vídeo do TikTok", 
      "Story expirado do Instagram com filtro granulado", 
      "BeReal capturado fora de hora"
    ]);
  } else if (ctx.idade <= 40) {
    f1Base = rnd([
      "Foto de crachá corporativo mal iluminada", 
      "Câmera de notebook (Webcam) ativada remotamente", 
      "Foto de perfil do LinkedIn em estúdio genérico"
    ]);
  } else {
    f1Base = rnd([
      "Câmera de caixa eletrônico (ATM) em ângulo superior", 
      "Selfie acidental de baixo para cima com pouca nitidez", 
      "Foto de documento (RG/CNH) escaneada com reflexo do flash"
    ]);
  }

  let f1Conds = "";
  const headParts = ["head", "neck", "orbit", "face"];
  const hasHeadCondition = ctx.conditionsV.find(c => {
    const parts = CONDITION_TO_PARTS[c];
    if (!parts) return false;
    const flatParts = Array.isArray(parts) ? parts.flat() : parts.options;
    return headParts.some(hp => flatParts.includes(hp));
  });

  if (hasHeadCondition) {
    const lowerCond = hasHeadCondition.toLowerCase();
    if (lowerCond.includes("alopecia")) f1Conds = " A imagem revela falhas circulares severas no couro cabeludo.";
    else if (lowerCond.includes("vitiligo")) f1Conds = " O contraste da iluminação destaca as manchas de despigmentação na pele do rosto.";
    else if (lowerCond.includes("olheiras")) f1Conds = " Olhos fundos com marcas escuras extremas indicando exaustão crônica.";
    else if (lowerCond.includes("hemiplesia") || lowerCond.includes("paralisia")) f1Conds = " Assimetria facial severa ou flacidez em um dos lados do rosto registrada na pose.";
    else if (lowerCond.includes("cicatriz") && lowerCond.includes("rosto")) f1Conds = " O ângulo da câmera expõe tecido cicatricial denso e marcante na face.";
    else f1Conds = ` A imagem registra evidentes anomalias dermatológicas ou estruturais (${hasHeadCondition}) na região da face/pescoço.`;
  } else {
     f1Conds = " Expressão facial neutra ou levemente tensionada perante a captura.";
  }

  let f1RegionAtmosphere = "";
  if (ctx.regiao === "Sudeste") f1RegionAtmosphere = " Tons visuais de poluição severa e reflexos de neon ou semáforo na lente.";
  else if (ctx.regiao === "Sul") f1RegionAtmosphere = " Luz fria de inverno, com neblina leve ao fundo desfocando o ambiente.";
  else if (ctx.regiao === "Norte" || ctx.regiao === "Nordeste") f1RegionAtmosphere = " Iluminação diurna dura e estourada devido ao sol intenso, com tons quentes e umidade perceptível na lente.";
  else f1RegionAtmosphere = " Iluminação mista com artefatos digitais de compressão.";

  const foto1 = `${f1Base}.${f1Conds}${f1RegionAtmosphere}`;


  // -- FOTO 2: CORPO, IMC, CLASSE, ROUPAS --
  let f2Base = rnd([
    "Captura de Corpo Inteiro em movimento",
    "Registro Pessoal Estático",
    "Imagem do Circuito de Vigilância de Rua",
    "Drone de Monitoramento em Baixa Altitude"
  ]);

  let f2Background = "";
  if (ctx.classe.includes("Vulnerável") || ctx.classe.includes("Baixa")) {
    f2Background = rnd([
      " O fundo mostra paredes sem reboco e fiação exposta.", 
      " Tirada no fundão de um ônibus lotado da EMTU.", 
      " Reflexo de poça d'água em calçada esburacada.",
      " Iluminação precária de um poste piscando na periferia."
    ]);
  } else if (ctx.classe.includes("Alta") || ctx.classe.includes("Elite")) {
    f2Background = rnd([
      " Captura por câmera 4K do circuito fechado de condomínio de luxo.", 
      " Fundo mostra painel de madeira de carro importado.", 
      " Vidraça panorâmica de andar alto no bairro nobre.",
      " Iluminação perfeita de estúdio ou restaurante de alta gastronomia."
    ]);
  } else {
    f2Background = rnd([
      " O fundo revela um escritório em plano aberto / cubículo cinza.", 
      " Tirada no volante de um carro popular no trânsito.", 
      " Prateleiras de supermercado desfocadas ao fundo."
    ]);
  }

  let f2Body = "";
  if (ctx.imc >= 40) f2Body = " Postura pesada, silhueta ocupando grande volume no assento do transporte.";
  else if (ctx.imc < 17) f2Body = " Silhueta perigosamente esquelética, destacada pelas roupas largas.";
  else f2Body = " Estrutura corporal acompanhando o desvio padrão urbano, postura defensiva.";

  let f2Conds = "";
  const isParaplegic = ctx.conditionsV.some(c => c.toLowerCase().includes("paraplegia") || c.toLowerCase().includes("tetraplegia") || c.toLowerCase().includes("cadeirante") || c.toLowerCase().includes("cadeira de rodas"));
  const isAmputee = ctx.conditionsV.some(c => c.toLowerCase().includes("amputaç") || c.toLowerCase().includes("amputado"));

  if (isParaplegic) {
    f2Conds = " Sujeito registrado utilizando cadeira de rodas manual/motorizada, com atrofia visível nos membros inferiores.";
  } else if (isAmputee) {
    f2Conds = " A foto confirma a ausência funcional de membro, com dobra vazia no tecido da roupa.";
  } else {
    const bodyParts = ["right-arm", "left-arm", "right-leg", "left-leg", "chest", "torso", "abdomen"];
    const hasBodyCondition = ctx.conditionsV.find(c => {
      const parts = CONDITION_TO_PARTS[c];
      if (!parts) return false;
      const flatParts = Array.isArray(parts) ? parts.flat() : parts.options;
      return bodyParts.some(bp => flatParts.includes(bp));
    });

    if (hasBodyCondition) {
      if ((ctx.regiao === "Sul" || ctx.classe.includes("Elite") || ctx.classe.includes("Alta"))) {
        f2Conds = " O sujeito veste roupas pesadas/longas, ocultando potenciais anomalias descritas nos membros.";
      } else if (ctx.regiao === "Norte" || ctx.regiao === "Nordeste") {
        f2Conds = ` Vestindo roupas curtas devido ao clima, deixando visíveis as anomalias/marcas na pele (${hasBodyCondition}).`;
      } else {
        f2Conds = ` Vestimentas casuais urbanas revelam relances de anomalias/marcas (${hasBodyCondition}) pelo corpo.`;
      }
    }
  }

  const foto2 = `${f2Base}.${f2Background}${f2Body}${f2Conds}`;


  // -- FOTO 3: SHINY OVERRIDE OU RASTRO MENTAL --
  let foto3 = "";
  let shinyVal = ctx.shiny && ctx.shiny.trim();

  if (shinyVal && shinyVal !== "Nenhum evento anômalo registrado") {
    let lowerShiny = shinyVal.toLowerCase();
    
    const crimeWords = ["assalto", "crime", "refém", "prisão", "culpa", "roubo", "morte", "assassina", "sequestro"];
    const moneyWords = ["milionário", "fortuna", "empresa", "patrimônio", "herança", "falência", "desvio", "fraude"];
    const isoWords = ["seita", "isolado", "stalker", "proteção", "escondido", "exilado", "perseguido", "fuga"];
    const loveWords = ["casamento", "parceiro", "noivado", "amor", "romance", "amigo", "amante"];

    if (crimeWords.some(w => lowerShiny.includes(w))) {
      foto3 = rnd([
        "Evidência do Incidente: Fotografia forense contendo manchas irregulares no asfalto e faixas de isolamento da polícia ao fundo.",
        "Registro da Câmera de Segurança: Timestamp adulterado mostrando uma movimentação caótica e o personagem ao fundo durante o pânico."
      ]);
    } else if (moneyWords.some(w => lowerShiny.includes(w))) {
      foto3 = rnd([
        "Documento Interceptado: Foto tremida de uma tela de computador mostrando extratos bancários bloqueados e e-mails judiciais.",
        "Detalhe: Maleta executiva aberta em cima de uma mesa de vidro, contendo documentos amassados."
      ]);
    } else if (isoWords.some(w => lowerShiny.includes(w))) {
      foto3 = rnd([
        "Imagem não classificada: Captura noturna através de uma fresta de janela. Há vários trincos de segurança na porta.",
        "Foto impressa achada no lixo: O rosto do sujeito está rabiscado violentamente com caneta preta."
      ]);
    } else if (loveWords.some(w => lowerShiny.includes(w))) {
      foto3 = rnd([
        "Polaroid rasgada ao meio: Mostra duas mãos entrelaçadas sobre a mesa de um café fechado.",
        "Captura de chat deletado: Imagem de um anel de compromisso guardado dentro de uma gaveta escura."
      ]);
    } else {
      foto3 = "Evidência Anômala: Registro fotográfico corrompido que documenta parcialmente o incidente relatado em seu dossiê.";
    }

  } else {
    if (ctx.mentalHealth < 25) {
      foto3 = "Detalhe de Rastreio: Close-up nas mãos do sujeito. Unhas roídas até a carne e pele ressecada demonstrando picos de ansiedade severa.";
    } else if (ctx.physicalHealth < 25) {
      foto3 = "Detalhe de Rastreio: Blister de comprimidos tarja preta semi-vazio e copos plásticos empilhados em uma mesa desorganizada.";
    } else {
      foto3 = rnd([
        "Registro de Consumo: Cupom fiscal amassado de uma farmácia/loja de conveniência de madrugada.",
        "Câmera de Bordo: Visão de trás do retrovisor mostrando o cansaço cotidiano."
      ]);
    }
  }

  return [foto1 ?? "Câmera de vigilância urbana não identificada", foto2 ?? "Câmera de vigilância urbana não identificada", foto3 ?? "Câmera de vigilância urbana não identificada"];
}

export function generateCharacterData(options: GenerationOptions = {}): CharacterResult {
  const probs: Record<string, ProbData | ProbData[]> = {};
  const migratedItems: string[] = []; // Trackers for Blue Dot debug
  const conditionsV: string[] = [];
  const conditionsNV: string[] = [];
  const vProbs: ProbData[] = [];
  const nvProbs: ProbData[] = [];

  let incomeLevel = 0;
  let urbanScore = 50;
  let relationalModifier = 0;

  // 1. Initial State
  let initialIdade = options.fixedAge ?? Math.floor(gaussRandom(26, 12));
  if (initialIdade < 15) initialIdade = 15 + Math.floor(Math.random() * 3);
  const idade = initialIdade;
  probs.idade = { prob: normalPdf(idade, 26, 12) };
  
  let identidadeGenero = rollWeighted(["Homem", "Mulher", "Não-Binário"], [48, 49, 3]).value;
  let termoIdentidade = "";
  let isCis = true;

  if (options.fixedIdentityTerm) {
    if (options.fixedIdentityTerm === "Não-Binário") {
      identidadeGenero = "Não-Binário";
      termoIdentidade = "Não-Binário";
      isCis = false;
    } else if (options.fixedIdentityTerm === "Cisgênero") {
      isCis = true;
      if (identidadeGenero === "Não-Binário") identidadeGenero = randomChoice(["Homem", "Mulher"]);
      termoIdentidade = "Cisgênero";
    } else { // Transgênero / Transexual
      isCis = false;
      if (identidadeGenero === "Não-Binário") identidadeGenero = randomChoice(["Homem", "Mulher"]);
      termoIdentidade = options.fixedIdentityTerm;
    }
  }

  probs.genero = { prob: 100, poolSize: 1 };

  let bioSexVal = options.fixedBioSex;
  let bioSexProb = 100;
  let bioSexPoolSize = 1;

  if (!bioSexVal) {
    if (options.fixedIdentityTerm) {
      if (identidadeGenero === "Homem") bioSexVal = isCis ? "Masculino" : "Feminino";
      else if (identidadeGenero === "Mulher") bioSexVal = isCis ? "Feminino" : "Masculino";
      else bioSexVal = randomChoice(["Masculino", "Feminino"]);
    } else {
      const isTransRoll = options.fixedTrans ?? (Math.random() < 0.02);
      if (identidadeGenero === "Homem") {
        bioSexVal = isTransRoll ? "Feminino" : "Masculino";
        bioSexProb = isTransRoll ? 2 : 98;
      } else if (identidadeGenero === "Mulher") {
        bioSexVal = isTransRoll ? "Masculino" : "Feminino";
        bioSexProb = isTransRoll ? 2 : 98;
      } else {
        bioSexVal = randomChoice(["Masculino", "Feminino"]);
        bioSexProb = 50;
      }
    }
  }

  const bioSex = bioSexVal;
  probs.bioSex = { prob: 100, poolSize: 1 };
  
  let nome = "";
  if (identidadeGenero === "Não-Binário") {
    nome = `${randomChoice(NOMES_NEUTROS)} ${faker.person.lastName()}`;
  } else {
    const nameGender = identidadeGenero === "Homem" ? 'male' : 'female';
    nome = faker.person.fullName({ sex: nameGender });
  }

  if (!options.fixedIdentityTerm) {
    isCis = (identidadeGenero === "Homem" && bioSex === "Masculino") || (identidadeGenero === "Mulher" && bioSex === "Feminino");
    termoIdentidade = isCis ? "Cisgênero" : "Transgênero/Não-Binário";
  }
  
  const orientRoll = rollWeighted(["Heterossexual", "Bissexual", "Homossexual", "Assexual", "Pansexual", "Demissexual"], [75, 10, 5, 4, 3, 3]);
  const orientacao = orientRoll.value;
  probs.orientacao = { prob: orientRoll.prob, poolSize: orientRoll.poolSize };

  const regRoll = rollUniform(['Sudeste', 'Nordeste', 'Sul', 'Norte', 'Centro-Oeste']);
  const regiao = options.fixedRegion ?? regRoll.value;
  probs.regiao = { prob: regRoll.prob, poolSize: regRoll.poolSize };

  const statesByRegion: Record<string, string[]> = {
    'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
    'Sul': ['PR', 'SC', 'RS'],
    'Nordeste': ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'],
    'Norte': ['AM', 'PA', 'AC', 'RR', 'RO', 'TO', 'AP'],
    'Centro-Oeste': ['DF', 'GO', 'MT', 'MS']
  };
  const estado = randomChoice(statesByRegion[regiao] || ['SP']);

  const etniaRoll = rollWeighted(["Branca", "Parda", "Preta", "Amarela", "Indígena"], [40, 45, 10, 2, 3]);
  const etnia = options.fixedEthnicity ?? etniaRoll.value;
  probs.etnia = { prob: etniaRoll.prob, poolSize: etniaRoll.poolSize };

  // 2. Shiny Initialization
  let shiny = options.fixedShiny ?? "Nenhum evento significativo detectado.";
  probs.shiny = { prob: 95, poolSize: 1 }; // Base case

  const classRoll = rollWeighted(["Base Precarizada / Vulnerável", "Classe Média Baixa / A Engrenagem", "Classe Média Alta / Estabilidade", "Elite / Alta Renda"], [30, 40, 20, 10]);
  const classe = options.fixedClass ?? classRoll.value;
  probs.classe = { prob: classRoll.prob, poolSize: classRoll.poolSize };

  const perfRoll = rollUniform(["Interior", "Capital"]);
  const perfilUrbanoVal = options.fixedLocality ?? perfRoll.value;
  const perfilUrbanoStr = `${perfilUrbanoVal} - ${regiao}`;
  probs.perfilUrbano = { prob: perfRoll.prob, poolSize: perfRoll.poolSize };

  // 3. Socioeconomic & Preliminary Context for Shiny
  let professionPool: string[] = [];
  const regionalPool = PROFISSOES_REGIONAIS[regiao]?.[classe] || [];
  const universalPool = PROFISSOES_UNIVERSAIS[classe] || [];
  professionPool = [...regionalPool, ...universalPool];
  
  const profRollBase = rollUniform(professionPool);
  const professionBase = profRollBase.value;

  const resRoll = rollUniform(OP_RES);
  const tempRoll = rollUniform(OP_TEMPERAMENTO);

  const initialCtx: ConditionContext = {
    idade: idade, sexo: bioSex, orientacao, classe: classe, regiao, 
    identidadeGenero, termoIdentidade, transgenero: !isCis,
    profissao: professionBase,
    capital: perfilUrbanoStr.includes("Capital"), 
    transporte: 'Público/Alternativo',
    habitacao: 'Residência Padrão',
    trabalha: false,
    estuda: false, estagio: false, aposentado: false, desempregado: false, estresse: Math.random() < 0.4,
    estresseHard: Math.random() < 0.1, remoto: Math.random() < 0.2,
    climaFrio: false, ansiedade: Math.random() < 0.3, 
    alternativo: Math.random() < 0.2 || professionBase.toLowerCase().includes("artista") || professionBase.toLowerCase().includes("designer") || professionBase.toLowerCase().includes("músico") || professionBase.toLowerCase().includes("freelancer"),
    escritorio: professionBase.toLowerCase().includes("escritório") || professionBase.toLowerCase().includes("analista") || professionBase.toLowerCase().includes("gerente") || professionBase.toLowerCase().includes("diretor") || professionBase.toLowerCase().includes("contábil") || professionBase.toLowerCase().includes("jurídico"),
    industriaOuMusica: false, 
    sobrepeso: false, abaixoDoPeso: false, pesoIdeal: true, obesidadeI: false, obesidadeII: false, obesidadeIII: false, falsoSaudavel: false,
    cargosAltos: classe.includes("Elite"),
    cafeina: Math.random() < 0.5, 
    alcoolOuObesidade: Math.random() < 0.3,
    alcoolico: Math.random() < 0.1, 
    braçalOuSentado: Math.random() < 0.5, diabetico: Math.random() < 0.05, midia: false, fumante: Math.random() < 0.2,
    aco: false, baixaRenda: classe.includes("Base"), gayCis: orientacao === "Homossexual" && isCis,
    proSe: false, drogasInjetaveis: false, traumaArquivado: false, hipertenso: Math.random() < 0.15,
    traumaInfancia: Math.random() < 0.1, 
    militarPolicia: professionBase.toLowerCase().includes("militar") || professionBase.toLowerCase().includes("polícia") || professionBase.toLowerCase().includes("guarda") || professionBase.toLowerCase().includes("vigilante") || professionBase.toLowerCase().includes("segurança"),
    vitimaCrime: false, hipertensoFumante: false,
    negroPardo: etnia === "Preta" || etnia === "Parda", abusoHistorico: false, historicoDepressivo: false,
    desempregoLongo: false, corporativoEstresse: false, lutoRecente: false, obesoFumante: false,
    caucasiano: etnia === "Branca", abusoInfanciaProlongado: false, diabeticoOuHipertenso: false,
    isolamentoTotal: false, falenciaLuto: false, infartoPrevio: false, drogasPesadas: false,
    fumanteQuimico: false, atletaMilitar: false, trabalhadorNuclear: false, baixaSaudeMental: false,
    intoxicacaoMedicamentosa: false, biotipoAnomalia: "", massaMagra: false, 
    tecnologia: Math.random() < 0.4 || professionBase.toLowerCase().includes("tecnologia") || professionBase.toLowerCase().includes("software") || professionBase.toLowerCase().includes("ti") || professionBase.toLowerCase().includes("análise"),
    setor: (() => {
      const lower = professionBase.toLowerCase();
      if (lower.includes("agrícola") || lower.includes("agro") || lower.includes("irrigação") || lower.includes("latifúndio") || lower.includes("soja") || lower.includes("pecuária") || lower.includes("agrônomo")) return "agro";
      if (lower.includes("tecnologia") || lower.includes("software") || lower.includes("ti") || lower.includes("dados") || lower.includes("hacker") || lower.includes("cripto")) return "tech";
      if (lower.includes("corporativo") || lower.includes("diretor") || lower.includes("multinacional") || lower.includes("startup") || lower.includes("faria limer") || lower.includes("analista") || lower.includes("financeiro")) return "corporativo";
      if (lower.includes("milícia") || lower.includes("gangue") || lower.includes("traficante") || lower.includes("drogas") || lower.includes("contrabandista") || lower.includes("ilegal") || lower.includes("clandestina") || lower.includes("crime")) return "crime";
      if (lower.includes("médico") || lower.includes("cirurgião") || lower.includes("clínica") || lower.includes("enfermagem") || lower.includes("hospital")) return "saúde";
      return "serviços";
    })(),
    estado,
    tierMetropole: getTierMetropole(estado, perfilUrbanoStr.includes("Capital")),
    geneticaFamiliar: Math.random() < 0.1, 
    braçal: professionBase.toLowerCase().includes("obra") || professionBase.toLowerCase().includes("pedreiro") || professionBase.toLowerCase().includes("campo") || professionBase.toLowerCase().includes("roça") || professionBase.toLowerCase().includes("pesca") || professionBase.toLowerCase().includes("braçal") || professionBase.toLowerCase().includes("agrícola"), 
    sop: false, peleClara: etnia === "Branca",
    tdah: Math.random() < 0.1, insonia: Math.random() < 0.2, turnosNoturnos: Math.random() < 0.1,
    idoso: idade > 60, botox: false, lutador: false, violencia: false, lutoSevero: false,
    obeso: false, corticoides: false, exPresidiario: false, gangue: false, corporativo: professionBase.toLowerCase().includes("corporativo") || professionBase.toLowerCase().includes("executivo") || professionBase.toLowerCase().includes("diretor"),
    autoimune: false, sedentario: Math.random() < 0.5, trabalhoRisco: false, alcoolicoAbstinencia: false,
    fogo: false, hepatite: false, miopiaCongenita: false, fumantePesado: false, professorCantor: false,
    acidenteTransito: false, doencaPulmonarCoracao: false, ensolarado: false, moradorRua: false,
    dependenteQuimicoAtivo: false, trabalhoBarulhento: false, acidenteMotorLesao: false, baixaIodo: false,
    diabeticoLesaoPe: false, colesterolAlto: false, 
    zonaRuralRemota: perfilUrbanoStr.includes("Interior") && Math.random() < 0.3, 
    herniaDisco: false,
    internacaoUTI: false, mausHabitos: false, traumaViolento: false, interrogatorioIntimidacao: false,
    quimioterapia: false, avcExtenso: false, glaucoma: false, cancerLaringe: false, retinopatia: false,
    cancerMama: false, cancerMamaMetastatico: false, cancerProstataMetastatico: false, posBariatrica: false, depressaoProfunda: false, cancerIntestinalCrohn: false,
    zonaTropical: false, escleroseMultipla: false, tumorHipofisario: false, transtornoBorderlineDepressao: false,
    anorexiaContext: false, neurologico: false, veteranoGuerra: false, explosao: false, bombeiro: false,
    traumaGrave: false, catarataContext: false, endemiaRural: false, compulsaoTrauma: false,
    duchenneContext: false, talidomidaContext: false, mergulhoVelocidade: false, lesaoTronco: false,
    sepse: false, marginalizado: false, cancerPeleNaoTratado: false, 
    sobreviventeDesastre: false, ruinaFinanceira: false, protecaoTestemunha: false, paranoiaFortuna: false,
    comaPosAcidente: false, incestoAbuso: false, incestoConsentido: false, matouAlguem: false, exDetento: false,
    abandonadoAltar: false, segundaFamiliaConjuge: false, filhoFugiu: false, trocadoMaternidade: false, 
    casamentoInteressePaixao: false, expulsaGravidez: false, criouFilhoAmigo: false, escolhaFamiliarPerigo: false, 
    irmaoGemeoAdotado: false, guardaIrmaosPrisaoPais: false,
    alergiaSolar: false, perdeuMembroAcidente: false, amnesiaRetrografa: false, catalepsiaCronica: false,
    paraplegiaEsporte: false, mutacoesCobaia: false, anacusiaTotal: false, transplanteCoracaoCriminoso: false,
    ataqueAnimalSelvagem: false, erroMedicoGrosseiro: false,
    refemAssalto: false, acusadoFalsamente: false, casaInvadida: false, acidenteFatalPedestre: false,
    testemunhouQuedaAviao: false, seitaExtremistaAbusiva: false, vitimaStalker: false, saberCrimeFamoso: false,
    falenciaEmpresaFamilia: false, piramideFinanceira: false, demissaoHumilhante: false, vendeuPatenteBarato: false,
    vicioJogoPerdaCasa: false, traicaoSocioDivida: false, doouPatrimonioFarsa: false, malaDinheiroSujo: false,
    ataqueHackerZerouContas: false, obraArteDestruida: false,
    restosMortaisQuintal: false, herancaDesconhecido: false, herdeiroImperioCriminoso: false, naufragioDeriva: false,
    atingidoRaio: false, carroEsmagadoCarreta: false, canceladoInternet: false, isolamentoRemoto: false,
    deportadoErroBurocratico: false, heroiAnonimo: false,
    paiMorto: false, maeMorta: false, relacaoPositiva: false, relacaoNeutra: false, relacaoNegativa: false, temFilhos: false,
    vingativo: tempRoll.value.includes("Colérico") || Math.random() < 0.1,
    imigranteRefugiado: Math.random() < 0.05,
    altruista: Math.random() < 0.15,
    exposicaoPublica: Math.random() < 0.1 || (professionBase.toLowerCase().includes("mídia") || professionBase.toLowerCase().includes("repórter")) || classe.includes("Elite"),
    fobiaSocial: Math.random() < 0.05,
    agorafobia: Math.random() < 0.03,
    nerd: Math.random() < 0.2 || professionBase.toLowerCase().includes("cientista") || professionBase.toLowerCase().includes("tecnologia"),
    depressao: Math.random() < 0.15,
  };

  if (!options.fixedShiny && Math.random() < 0.05) {
     const validEvents = SHINY_EVENTS.filter(e => !e.condition || e.condition(initialCtx));
     const weights = validEvents.map(e => {
         let w = calculateDeclarativeWeight('shinies', e.text, initialCtx, e.weight);
         if (e.text === "Foi vítima de um stalker obsessivo que destruiu sua paz durante anos") {
             if (bioSex === "Feminino") w *= 5.0;
             if (idade >= 16 && idade <= 22) w *= 3.0;
             else w *= 0.2;
         }
         return w;
     });
     const shinyRoll = rollWeighted(validEvents.map(e => e.text), weights);
     shiny = shinyRoll.value;
     probs.shiny = { prob: 5 * (shinyRoll.prob / 100), poolSize: validEvents.length };
  } else if (!options.fixedShiny) {
     probs.shiny = { prob: 95, poolSize: 1 };
  }

  const doouOrgaoVital = shiny === "Doou um órgão vital para um familiar que não resistiu";
  const exMilitarDesertor = shiny === "Ex-militar desertor vivendo sob pseudônimo";
  const ruinaFinanceira = shiny === "Ganhou a Mega-Sena e perdeu tudo em 2 anos";
  const sobreviventeDesastre = shiny === "Único sobrevivente de desastre aéreo familiar";
  const protecaoTestemunha = shiny === "Vive em programa de proteção à testemunha";
  const paranoiaFortuna = shiny === "Possui uma fortuna enterrada no quintal";
  const comaPosAcidente = shiny === "Coma por meses após um acidente";
  const incestoPai = shiny === "Vive relação incestuosa com Pai";
  const incestoMae = shiny === "Vive relação incestuosa com Mãe";
  const incestoIrmao = shiny === "Vive relação incestuosa com Irmão/Irmã";
  const incestoTio = shiny === "Vive relação incestuosa com Tio";
  const incestoQualquer = incestoPai || incestoMae || incestoIrmao || incestoTio;
  const matouAlguem = shiny === "Matou alguém";
  const exDetento = shiny === "Cumpriu pena e hoje está livre de forma justa";
  const abandonadoAltar = shiny === "Foi abandonado no altar para centenas de convidados e nunca superou o trauma";
  const segundaFamiliaConjuge = shiny === "Descobriu que seu cônjuge tinha uma segunda família completa em outra cidade";
  const filhoFugiu = shiny === "O filho fugiu de casa na adolescência e nunca mais deu notícias";
  const trocadoMaternidade = shiny === "Descobriu que foi trocado na maternidade 30 anos após o nascimento";
  const casamentoInteressePaixao = shiny === "Casou-se por interesse, mas apaixonou-se perdidamente quando o parceiro adoeceu";
  const expulsaGravidez = shiny === "Engravidou na adolescência e foi expulso de casa pela família conservadora";
  const criouFilhoAmigo = shiny === "Criou o filho do melhor amigo como seu após a morte repentina dele";
  const escolhaFamiliarPerigo = shiny === "Foi forçado a escolher qual familiar salvar em uma situação de perigo iminente";
  const irmaoGemeoAdotado = shiny === "Descobriu na fase adulta que seu irmão gêmeo foi dado para adoção ao nascer";
  const guardaIrmaosPrisaoPais = shiny === "Teve de assumir a guarda dos irmãos mais novos após a prisão dos pais";
  const alergiaSolar = shiny === "Desenvolveu uma alergia severa e incapacitante à luz solar";
  const perdeuMembroAcidente = shiny === "Perdeu um membro em um grave acidente com maquinário pesado";
  const amnesiaRetrografa = shiny === "Sofre de amnésia dissociativa e não se lembra dos primeiros 20 anos de vida";
  const catalepsiaCronica = shiny === "Acordou no meio de seu próprio velório após ser diagnosticado com catalepsia";
  const paraplegiaEsporte = shiny === "Ficou paralisado da cintura para baixo após uma queda em esporte radical";
  const mutacoesCobaia = shiny === "Foi cobaia de um ensaio clínico experimental que causou mutações crônicas";
  const anacusiaTotal = shiny === "Perdeu a audição de forma irreversível após uma explosão no local de trabalho";
  const transplanteCoracaoCriminoso = shiny === "Recebeu um transplante de coração de um criminoso notório e sofre com o estigma";
  const ataqueAnimalSelvagem = shiny === "Sobreviveu a um ataque brutal de um animal selvagem de grande porte";
  const erroMedicoGrosseiro = shiny === "Sofreu um erro médico grosseiro em uma cirurgia de rotina que mudou sua vida";
  const refemAssalto = shiny === "Foi feito refém durante um assalto a banco que durou dias de terror";
  const acusadoFalsamente = shiny === "Foi falsamente acusado de um crime hediondo e precisou fugir de um linchamento";
  const casaInvadida = shiny === "Teve a casa invadida e destruída enquanto dormia com a família";
  const acidenteFatalPedestre = shiny === "Causou um acidente de trânsito fatal que vitimou um pedestre inocente";
  const testemunhouQuedaAviao = shiny === "Testemunhou a queda de um avião de pequeno porte e foi o primeiro nos destroços";
  const seitaExtremistaAbusiva = shiny === "Cresceu em uma seita extremista abusiva da qual conseguiu escapar com vida";
  const vitimaStalker = shiny === "Foi vítima de um stalker obsessivo que destruiu sua paz durante anos";
  const saberCrimeFamoso = shiny === "Vive com o peso de saber quem cometeu um crime famoso, mas teme falar";
  const internacaoUTI = shiny === "Internação em UTI";
  const traumaGraveShiny = shiny === "Trauma Grave";
  const falenciaEmpresaFamilia = shiny === "Faliu a empresa centenária da família e deixou todos na miséria absoluta";
  const piramideFinanceira = shiny === "Perdeu as economias de uma vida inteira em um esquema de pirâmide financeira";
  const demissaoHumilhante = shiny === "Foi demitido publicamente e humilhado após uma falsa acusação de fraude";
  const vendeuPatenteBarato = shiny === "Vendeu a patente de uma invenção bilionária por um valor irrisório antes do sucesso";
  const vicioJogoPerdaCasa = shiny === "Desenvolveu um vício incontrolável em jogos de azar e perdeu a própria casa";
  const traicaoSocioDivida = shiny === "Foi traído pelo parceiro de negócios e assumiu sozinho uma dívida milionária";
  const doouPatrimonioFarsa = shiny === "Doou todo o seu patrimônio para uma organização que se revelou uma farsa";
  const malaDinheiroSujo = shiny === "Encontrou uma mala cheia de dinheiro sujo e vive fugindo dos verdadeiros donos";
  const ataqueHackerZerouContas = shiny === "Foi vítima de um ataque hacker que zerou suas contas e destruiu seu crédito";
  const obraArteDestruida = shiny === "Trabalhou anos em uma obra de arte-prima que foi destruída em um incêndio";
  const restosMortaisQuintal = shiny === "Descobriu restos mortais enterrados no quintal de sua recém-comprada casa";
  const herancaDesconhecido = shiny === "Recebeu uma fortuna de herança de um completo desconhecido";
  const herdeiroImperioCriminoso = shiny === "Descobriu ser o herdeiro direto de um império criminoso internacional";
  const naufragioDeriva = shiny === "Sobreviveu a um naufrágio e passou dias à deriva sem água ou comida";
  const atingidoRaio = shiny === "Foi atingido diretamente por um raio e sobreviveu, mas desenvolveu sequelas neurológicas";
  const carroEsmagadoCarreta = shiny === "Teve o carro completamente esmagado por uma carreta e saiu fisicamente ileso";
  const canceladoInternet = shiny === "Foi cancelado na internet em escala nacional por um mal-entendido catastrófico";
  const isolamentoRemoto = shiny === "Passou 10 anos vivendo isolado em uma comunidade remota sem contato com o exterior";
  const deportadoErroBurocratico = shiny === "Foi deportado do país onde viveu a vida inteira por um erro burocrático";
  const heroiAnonimo = shiny === "Salvo de uma tragédia por um herói anônimo que desapareceu logo em seguida";
  const infartoPrevioShiny = shiny === "Sobreviveu a um infarto agudo do miocárdio aos 30 anos";

  let forcedConditions: string[] = [];
  if (shiny !== "Nenhum evento significativo detectado." && Math.random() < 0.10) {
      if (alergiaSolar) forcedConditions.push("Fotodermatite Actínica Severa");
      if (perdeuMembroAcidente) forcedConditions.push(randomChoice(["Amputação Parcial de Membro Superior", "Amputação de Membro Inferior (Cadeira de Rodas)"]));
      if (amnesiaRetrografa) forcedConditions.push("Amnésia Dissociativa Retrógrada Focal");
      if (catalepsiaCronica) forcedConditions.push("Catalepsia Patológica Crônica");
      if (paraplegiaEsporte) forcedConditions.push("Paraplegia (Cadeirante)");
      if (mutacoesCobaia) forcedConditions.push("Síndrome de Degeneração Mutagênica Iatrogênica");
      if (anacusiaTotal) forcedConditions.push("Anacusia Bilateral Neurosensorial");
      if (transplanteCoracaoCriminoso) forcedConditions.push("Imunossupressão Crônica Pós-Transplante Cardíaco");
      if (ataqueAnimalSelvagem) forcedConditions.push("Sequelas de Trauma Tecidual por Laceração Extensa");
      if (erroMedicoGrosseiro) forcedConditions.push("Dor Crônica Neuropática Iatrogênica Estágio II");
      if (refemAssalto) forcedConditions.push(randomChoice(["TEPT (Transtorno de Estresse Pós-Traumático)", "Síndrome do Pânico"]));
      if (acusadoFalsamente) forcedConditions.push("Paranoia Persecutória Reativa de Massa");
      if (casaInvadida) forcedConditions.push("Hipervigilância Noturna Pós-Traumática");
      if (acidenteFatalPedestre) forcedConditions.push("Depressão Profunda");
      if (testemunhouQuedaAviao) forcedConditions.push("Estresse Agudo com Somatização Sensorial");
      if (seitaExtremistaAbusiva) {
          forcedConditions.push("Síndrome de Abuso Religioso e Despersonalização Parcial");
          if (Math.random() < 0.1) forcedConditions.push("Alopecia Areata (Perda em Placas)");
      }
      if (vitimaStalker) {
          forcedConditions.push("Ansiedade Generalizada por Perseguição Crônica");
          forcedConditions.push("Olheiras Crônicas Marcadas");
          if (Math.random() < 0.1) forcedConditions.push("Alopecia Areata (Perda em Placas)");
      }
      if (abandonadoAltar) {
          if (Math.random() < 0.1) forcedConditions.push("Alopecia Areata (Perda em Placas)");
      }
      if (protecaoTestemunha) forcedConditions.push("Transtorno de Ansiedade por Dissociação de Identidade Imposta");
      if (saberCrimeFamoso) {
          forcedConditions.push("Ansiedade Fóbica Crônica por Silêncio Forçado");
          forcedConditions.push("Dermatite Atópica Visível"); // impact on neck
      }
      if (falenciaEmpresaFamilia) {
          forcedConditions.push(randomChoice(["Depressão Profunda", "Insônia Crônica"]));
          forcedConditions.push("Olheiras Crônicas Marcadas");
      }
      if (piramideFinanceira) forcedConditions.push("Gastrite Leve por Estresse");
      if (demissaoHumilhante) {
          forcedConditions.push(randomChoice(["Síndrome do Pânico", "Transtorno de Personalidade Evitativa"]));
          forcedConditions.push("Dermatite Atópica Visível");
      }
      if (vendeuPatenteBarato) forcedConditions.push("Transtorno Bipolar Tipo II");
      if (vicioJogoPerdaCasa) forcedConditions.push(randomChoice(["Alcoolismo Severo", "Dependência Química Ativa"]));
      if (traicaoSocioDivida) forcedConditions.push("Úlcera Gástrica Ativa");
      if (doouPatrimonioFarsa) forcedConditions.push("Transtorno de Personalidade Evitativa");
      if (malaDinheiroSujo) {
          forcedConditions.push(randomChoice(["Paranoia Persecutória Reativa de Massa", "Hipervigilância Noturna Pós-Traumática"]));
          forcedConditions.push("Tremor Essencial (Mãos)");
      }
      if (ataqueHackerZerouContas) forcedConditions.push(randomChoice(["Ansiedade Situacional", "Insônia Crônica"]));
      if (obraArteDestruida) forcedConditions.push("Depressão Profunda");
      if (restosMortaisQuintal) forcedConditions.push("Transtorno de Estresse Traumático por Achado Macabro Domiciliar");
      if (herancaDesconhecido) forcedConditions.push("Paranoia Existencial e Obsessão por Vigilância Patrimonial");
      if (herdeiroImperioCriminoso) forcedConditions.push("Transtorno de Ansiedade Generalizada por Ameaça de Extradição ou Execução");
      if (naufragioDeriva) {
          forcedConditions.push(randomChoice(["TEPT (Transtorno de Estresse Pós-Traumático)", "Anorexia Nervosa (Caquexia)"]));
          forcedConditions.push("Insuficiência Renal Aguda por Desidratação Crônica com Sequelas de Inanição");
      }
      if (atingidoRaio) {
          forcedConditions.push("Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)");
          forcedConditions.push("Tremor Essencial (Mãos)");
      }
      if (carroEsmagadoCarreta) forcedConditions.push(randomChoice(["Síndrome do Pânico", "Insônia Crônica", "Síndrome do Sobrevivente com Mutismo Seletivo Temporário e Choque Psíquico"]));
      if (canceladoInternet) forcedConditions.push(randomChoice(["Agorafobia Severa", "Fobia Social Aguda e Transtorno de Pânico por Linchamento Virtual"]));
      if (isolamentoRemoto) forcedConditions.push("Transtorno de Adaptação Crônica com Déficit de Socialização Urbana");
      if (deportadoErroBurocratico) forcedConditions.push("Crise de Identidade Transcultural com Estresse de Desenraizamento");
      if (heroiAnonimo) forcedConditions.push("Síndrome de Débito Moral Obsessivo com Ideação de Busca");
      
      if (exMilitarDesertor) {
          forcedConditions.push("TEPT (Transtorno de Estresse Pós-Traumático)");
          forcedConditions.push("Cicatriz Pequena (Rosto/Braço)");
      }
      if (shiny === "Cegueira Total") {
          forcedConditions.push("Alta Miopia Degenerativa com Lesões Retinianas");
      }
      if (infartoPrevioShiny && Math.random() < 0.10) {
          forcedConditions.push("Hipercolesterolemia Familiar ou Risco Cardiovascular Muito Alto");
      }
      if (doouOrgaoVital && Math.random() < 0.10) {
          forcedConditions.push("Esteatose Hepática Avançada (Esteato-hepatite / NASH)");
      }
      if ((internacaoUTI || traumaGraveShiny || comaPosAcidente || escolhaFamiliarPerigo) && Math.random() < 0.10) {
          forcedConditions.push("Gastrite Aguda por Estresse com Risco de Sangramento");
      }
  }

  // Ensure BodyMap related conditions are forced regardless of 10% loop for these specific Shiny events
  if (alergiaSolar) forcedConditions.push("Fotodermatite Actínica Severa");
  if (mutacoesCobaia) forcedConditions.push("Síndrome de Degeneração Mutagênica Iatrogênica");
  if (ataqueAnimalSelvagem) forcedConditions.push("Sequelas de Trauma Tecidual por Laceração Extensa");
  if (paraplegiaEsporte) forcedConditions.push("Paraplegia (Cadeirante)");
  if (internacaoUTI && Math.random() < 0.1) forcedConditions.push("Gastrite Aguda por Estresse com Risco de Sangramento");
  if (traumaGraveShiny && Math.random() < 0.1) forcedConditions.push("Gastrite Aguda por Estresse com Risco de Sangramento");
  if (perdeuMembroAcidente && !conditionsV.some(c => c.includes("Amputação")) && !forcedConditions.some(c => c.includes("Amputação"))) {
      forcedConditions.push(randomChoice(["Amputação Parcial de Membro Superior", "Amputação de Membro Inferior (Cadeira de Rodas)"]));
  }

  let incestoAbuso = false;
  let incestoConsentido = false;
  if (incestoQualquer) {
    if (Math.random() < 0.7) {
      incestoAbuso = true;
    } else {
      incestoConsentido = true;
    }
  }

  // 2.1 Overrides for Shiny
  let finalIdade = idade;
  let finalClasse = classe;
  if (exMilitarDesertor) {
    if (finalIdade <= 35) finalIdade = 35 + Math.floor(Math.random() * 20);
    if (finalClasse.includes("Elite")) {
      finalClasse = randomChoice(["Base Precarizada / Vulnerável", "Classe Média Baixa / A Engrenagem"]);
    }
  }

  // 3. MOTOR DE DIVERGÊNCIA BIOMÉTRICA
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  
  // Fase 1: O Sorteio da Faixa de Peso (Weighted Funnel)
  const pesoBase = {
    abaixo: 2.0,
    saudavel: 35.4,
    sobrepeso: 36.9,
    obesidade: 25.7
  };

  // Fase 2: Modificadores Demográficos
  if (bioSex === 'Feminino') {
    pesoBase.saudavel -= 4.3;
    pesoBase.obesidade += 4.3;
  }

  if (regiao === 'Sul' || regiao === 'Sudeste') {
    const obesoMod = 1.15;
    const sobreMod = 1.10;
    const oldObeso = pesoBase.obesidade;
    const oldSobre = pesoBase.sobrepeso;
    pesoBase.obesidade *= obesoMod;
    pesoBase.sobrepeso *= sobreMod;
    const diff = (pesoBase.obesidade - oldObeso) + (pesoBase.sobrepeso - oldSobre);
    pesoBase.saudavel -= diff;
  }

  if (idade >= 20 && idade <= 35) {
    const obesoMod = 1.05;
    const oldObeso = pesoBase.obesidade;
    pesoBase.obesidade *= obesoMod;
    const diff = pesoBase.obesidade - oldObeso;
    pesoBase.saudavel -= diff;
  }

  const categoryNames = ["Abaixo do Peso", "Peso Saudável", "Sobrepeso", "Obesidade"];
  const weights = [pesoBase.abaixo, pesoBase.saudavel, pesoBase.sobrepeso, pesoBase.obesidade];
  const categoryRoll = rollWeighted(categoryNames, weights);
  const category = categoryRoll.value;
  const categoryProb = categoryRoll.prob;

  let biotipo = "PADRÃO";
  let biotipoAnomalia = "";
  let massaMagra = false;
  let imc = 22.0;

  // Trackers para Probs Biométricas
  let imcMean = 22.5;
  let imcStdev = 1.5;
  let subRollProb = 100;

  // Fase 3: A Geração Gaussiana Intracategoria (The Micro-Math)
  if (category === "Abaixo do Peso") {
    imcMean = 17.5; imcStdev = 1.0;
    imc = gaussRandom(imcMean, imcStdev);
    imc = clamp(imc, 15.0, 18.5);
    if (imc < 16.5) biotipoAnomalia = "Déficit Severo";
  } else if (category === "Peso Saudável") {
    imcMean = 22.5; imcStdev = 1.5;
    imc = gaussRandom(imcMean, imcStdev);
    imc = clamp(imc, 18.6, 24.9);
  } else if (category === "Sobrepeso") {
    imcMean = 27.5; imcStdev = 1.5;
    imc = gaussRandom(imcMean, imcStdev);
    imc = clamp(imc, 25.0, 29.9);
  } else if (category === "Obesidade") {
    const subRoll = Math.random();
    if (subRoll < 0.7) { // Grau I
       imcMean = 32.5; imcStdev = 1.25;
       imc = gaussRandom(imcMean, imcStdev);
       imc = clamp(imc, 30.0, 34.9);
       subRollProb = 70;
    } else if (subRoll < 0.9) { // Grau II
       imcMean = 37.5; imcStdev = 1.25;
       imc = gaussRandom(imcMean, imcStdev);
       imc = clamp(imc, 35.0, 39.9);
       subRollProb = 20;
    } else { // Grau III
       imcMean = 42.5; imcStdev = 1.25;
       imc = gaussRandom(imcMean, imcStdev);
       imc = clamp(imc, 40.0, 45.0);
       biotipoAnomalia = "Carga Excessiva";
       subRollProb = 10;
    }
  }

  // Fase 4: A Exceção do "Falso Saudável" (Bodybuilders)
  const bbChance = 0.03;
  if (idade < 45 && Math.random() < bbChance) {
    imc = 28.0 + (Math.random() * 6.0); // 28 to 34
    massaMagra = true;
    biotipoAnomalia = "Falso Saudável";
  }

  // Fase 5: O Cálculo Retroativo da Altura e Peso
  let altura = 1.70;
  let hMean = bioSex === "Masculino" ? 1.73 : 1.61;
  let hStdev = 0.06;
  const hExtremoChance = 0.01;

  if (Math.random() < hExtremoChance) {
    biotipoAnomalia = "Extremo Vertical";
    if (Math.random() < 0.5) altura = parseFloat((Math.random() * (1.45 - 1.10) + 1.10).toFixed(2));
    else altura = parseFloat((Math.random() * (2.10 - 1.92) + 1.92).toFixed(2));
    probs.altura = { prob: hExtremoChance * 100 };
  } else {
    altura = parseFloat(gaussRandom(hMean, hStdev).toFixed(2));
    probs.altura = { prob: normalPdf(altura, hMean, hStdev) };
  }
  
  if (biotipoAnomalia !== "") biotipo = "ELÁSTICO";
  
  imc = parseFloat(imc.toFixed(1));
  let peso = parseFloat((imc * (altura * altura)).toFixed(1));
  
  // Cálculo final de probabilidades biométricas
  const hProb = (biotipoAnomalia === "Extremo Vertical") ? (hExtremoChance * 100) : (1 - hExtremoChance) * normalPdf(altura, hMean, hStdev);
  probs.altura = { prob: hProb };

  const imcProb = (massaMagra) ? (bbChance * 100) : (categoryProb / 100) * (subRollProb / 100) * normalPdf(imc, imcMean, imcStdev);
  probs.imc = { prob: imcProb };
  
  probs.peso = { prob: (imcProb * (probs.altura as ProbData).prob) / 100 };

  // Probabilidade do Biotipo e Anomalias (Cálculo da Árvore de Decisão)
  const pDeficitProb = (pesoBase.abaixo / 100) * 0.158 * 100;
  const pCargaProb = (pesoBase.obesidade / 100) * 0.10 * 100;
  const pFalsoProb = bbChance * 100;
  const pExtremoProb = hExtremoChance * 100;
  const pElasticoTotal = pDeficitProb + pCargaProb + pFalsoProb + pExtremoProb;

  probs.biotipo = { prob: (biotipo === "PADRÃO") ? (100 - pElasticoTotal) : pElasticoTotal };
  
  if (biotipoAnomalia === "Falso Saudável") probs.biotipoAnomalia = { prob: pFalsoProb };
  else if (biotipoAnomalia === "Carga Excessiva") probs.biotipoAnomalia = { prob: pCargaProb };
  else if (biotipoAnomalia === "Déficit Severo") probs.biotipoAnomalia = { prob: pDeficitProb };
  else if (biotipoAnomalia === "Extremo Vertical") probs.biotipoAnomalia = { prob: pExtremoProb };
  else probs.biotipoAnomalia = { prob: 0 };

  // 4. Draft Context for Condition Picking
  const ctx: ConditionContext = {
    ...initialCtx,
    idade: finalIdade, sexo: bioSex, orientacao, classe: finalClasse, regiao, 
    identidadeGenero, termoIdentidade, transgenero: !isCis,
    capital: perfilUrbanoStr.includes("Capital"), 
    trabalha: false,
    estuda: false,
    estagio: false,
    aposentado: false,
    desempregado: false,
    estresse: options.fixedStress ?? (initialCtx.estresse || exMilitarDesertor),
    estresseHard: initialCtx.estresseHard || exMilitarDesertor, 
    ansiedade: options.fixedAnxiety ?? (initialCtx.ansiedade || exMilitarDesertor), 
    sobrepeso: imc >= 25.0 && imc <= 29.9,
    abaixoDoPeso: imc < 18.5,
    pesoIdeal: imc >= 18.6 && imc <= 24.9,
    obesidadeI: imc >= 30.0 && imc <= 34.9 && !massaMagra,
    obesidadeII: imc >= 35.0 && imc <= 39.9 && !massaMagra,
    obesidadeIII: biotipoAnomalia === "Carga Excessiva",
    falsoSaudavel: massaMagra,
    alcoolOuObesidade: (imc > 30 && !massaMagra) || initialCtx.alcoolOuObesidade,
    obeso: imc >= 30.0 && !massaMagra,
    biotipoAnomalia, 
    massaMagra, 
    corporativo: false,
    sobreviventeDesastre, ruinaFinanceira, protecaoTestemunha, paranoiaFortuna,
    comaPosAcidente, incestoAbuso, incestoConsentido, matouAlguem, exDetento,
    abandonadoAltar, segundaFamiliaConjuge, filhoFugiu, trocadoMaternidade, 
    casamentoInteressePaixao, expulsaGravidez, criouFilhoAmigo, escolhaFamiliarPerigo, 
    irmaoGemeoAdotado, guardaIrmaosPrisaoPais,
    alergiaSolar, perdeuMembroAcidente, amnesiaRetrografa, catalepsiaCronica,
    paraplegiaEsporte, mutacoesCobaia, anacusiaTotal, transplanteCoracaoCriminoso,
    ataqueAnimalSelvagem, erroMedicoGrosseiro,
    refemAssalto, acusadoFalsamente, casaInvadida, acidenteFatalPedestre,
    testemunhouQuedaAviao, seitaExtremistaAbusiva, vitimaStalker, saberCrimeFamoso,
    falenciaEmpresaFamilia, piramideFinanceira, demissaoHumilhante, vendeuPatenteBarato,
    vicioJogoPerdaCasa, traicaoSocioDivida, doouPatrimonioFarsa, malaDinheiroSujo,
    ataqueHackerZerouContas, obraArteDestruida: initialCtx.obraArteDestruida,
    restosMortaisQuintal, herancaDesconhecido, herdeiroImperioCriminoso, naufragioDeriva,
    atingidoRaio, carroEsmagadoCarreta, canceladoInternet, isolamentoRemoto,
    deportadoErroBurocratico, heroiAnonimo,
    vingativo: initialCtx.vingativo,
    imigranteRefugiado: initialCtx.imigranteRefugiado,
    altruista: initialCtx.altruista,
    exposicaoPublica: initialCtx.exposicaoPublica,
    fobiaSocial: initialCtx.fobiaSocial,
    agorafobia: initialCtx.agorafobia,
    nerd: initialCtx.nerd,
    depressao: initialCtx.depressao,
    infartoPrevio: infartoPrevioShiny,
    doouOrgaoVital, exMilitarDesertor,
    braçal: options.fixedManualLabor ?? initialCtx.braçal,
    zonaRuralRemota: options.fixedRemoteArea ?? initialCtx.zonaRuralRemota,
    vulneravel: finalClasse.includes("Vulnerável"),
    hipertenso: initialCtx.hipertenso,
    tierMetropole: initialCtx.tierMetropole,
    traumaArquivado: initialCtx.traumaArquivado,
    drogasInjetaveis: initialCtx.drogasInjetaveis,
    proSe: initialCtx.proSe,
    transporte: getLogistics(finalClasse, regiao, perfilUrbanoStr).value,
    habitacao: faker.location.streetAddress()
  };

  const pickCondition = (pool: Record<number, CharacterCondition[]>, minLevel: number = 0, type: 'v' | 'nv', currentV: string[], currentNV: string[]) => {
    const selected: { name: string, prob: ProbData }[] = [];
    const baseChance = type === 'v' ? 0.12 : 0.20;
    
    // Families already selected for this NPC
    const familiasJaSorteadas: string[] = [];
    [...currentV, ...currentNV].forEach(c => {
      const f = getFamily(c);
      if (f && !familiasJaSorteadas.includes(f)) familiasJaSorteadas.push(f);
    });

    let activePool: (CharacterCondition & { nivel: number })[] = [];
    Object.entries(pool).forEach(([levelStr, conditions]) => {
      const level = Number(levelStr);
      conditions.forEach(c => {
        activePool.push({ ...c, nivel: level });
      });
    });

    if (minLevel > 0) {
      activePool = activePool.filter(condicao => condicao.nivel >= minLevel);
    }

    if (activePool.length === 0) return selected;

    let count = 1;
    const multiRoll = Math.random();
    if (multiRoll < 0.15) count = 2;
    if (multiRoll < 0.03) count = 3;
    
    for (let i = 0; i < count; i++) {
      const possible = activePool.filter(c => {
        const f = getFamily(c.name);
        return !f || !familiasJaSorteadas.includes(f);
      });

      if (possible.length === 0) break;

      const names = possible.map(c => c.name);
      const weights = possible.map(c => {
         const baseCondWeight = calculateDeclarativeWeight(type === 'v' ? 'condicoesVisiveis' : 'condicoesNaoVisiveis', c.name, ctx, c.weight, migratedItems, c.nivel);
         const levelWeight = 1 / (c.nivel * c.nivel); 
         return baseCondWeight * levelWeight;
      });
      
      // Bloqueio condicional da opção "Nenhuma"
      // Só testamos a chance de não ter nenhuma doença no PRIMEIRO roll e se o minLevel for 0 (OFF)
      if (i === 0 && minLevel === 0) {
         const totalWeight = weights.reduce((a, b) => a + b, 0);
         // Se a chance de ter algo é baseChance, a chance de "Nenhuma" é o complemento.
         const nenhumaWeight = totalWeight * (1 - baseChance) / baseChance;
         names.push("Nenhuma");
         weights.push(nenhumaWeight);
      }

      const condRoll = rollWeighted(names, weights);
      
      // Se caiu na opção Nenhuma (ou array vazio resultou em fallback), encerramos.
      if (condRoll.value === "Nenhuma") {
         break;
      }

      selected.push({ name: condRoll.value, prob: { prob: condRoll.prob, poolSize: possible.length } });
      
      const f = getFamily(condRoll.value);
      if (f) familiasJaSorteadas.push(f);
    }

    return selected;
  };

  const selectedV = pickCondition(NIVEIS_V, options.minVisibleLevel, 'v', conditionsV, conditionsNV);
  const selectedNV = pickCondition(NIVEIS_NV, options.minNonVisibleLevel, 'nv', conditionsV, conditionsNV);

  selectedV.forEach(s => { 
      if (addConditionWithExclusivity(s.name, conditionsV, conditionsNV)) {
          vProbs.push(s.prob);
          
          // Sincronização de flags de contexto baseada em nomes de itens
          if (s.name.includes("Câncer de Mama")) ctx.cancerMama = true;
          if (s.name.includes("Metastático") && s.name.includes("Mama")) ctx.cancerMamaMetastatico = true;
          if (s.name.includes("Câncer de Próstata") && s.name.includes("Metastático")) ctx.cancerProstataMetastatico = true;
          if (s.name.includes("Amputação")) ctx.perdeuMembroAcidente = true;
          if (s.name.includes("Câncer de Pele")) ctx.cancerPeleNaoTratado = true;
          if (s.name.includes("Laringe")) ctx.cancerLaringe = true;

          // Reverse trigger: 10% chance to force shiny if rolled naturally
          if (Math.random() < 0.10 && shiny === "Nenhum evento significativo detectado.") {
              if (s.name === "Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)") {
                shiny = "Foi atingido diretamente por um raio e sobreviveu, mas desenvolveu sequelas neurológicas";
                if (!conditionsV.includes("Tremor Essencial (Mãos)")) {
                  forcedConditions.push("Tremor Essencial (Mãos)");
                }
              }
              if (s.name === "Tremor Essencial (Mãos)") {
                if (Math.random() < 0.1) {
                  forcedConditions.push("Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)");
                  if (shiny === "Nenhum evento significativo detectado.") {
                    shiny = "Foi atingido diretamente por um raio e sobreviveu, mas desenvolveu sequelas neurológicas";
                  }
                }
              }
              if (s.name === "Fotodermatite Actínica Severa") shiny = "Desenvolveu uma alergia severa e incapacitante à luz solar";
              if (s.name.includes("Amputação")) shiny = "Perdeu um membro em um grave acidente com maquinário pesado";
              if (s.name === "Sequelas de Trauma Tecidual por Laceração Extensa") shiny = "Sobreviveu a um ataque brutal de um animal selvagem de grande porte";
              if (s.name === "Síndrome de Degeneração Mutagênica Iatrogênica") shiny = "Foi cobaia de um ensaio clínico experimental que causou mutações crônicas";
              if (s.name === "Paraplegia (Cadeirante)") shiny = "Ficou paralisado da cintura para baixo após uma queda em esporte radical";
              if (s.name === "Dermatite Atópica Visível" && ctx.saberCrimeFamoso) shiny = "Vive com o peso de saber quem cometeu um crime famoso, mas teme falar";
              if (s.name === "Alopecia Areata (Perda em Placas)" && Math.random() < 0.1 && shiny === "Nenhum evento significativo detectado.") {
                shiny = randomChoice([
                  "Foi abandonado no altar para centenas de convidados e nunca superou o trauma",
                  "Foi vítima de um stalker obsessivo que destruiu sua paz durante anos",
                  "Cresceu em uma seita extremista abusiva da qual conseguiu escapar com vida"
                ]);
              }
          }
      }
  });
  selectedNV.forEach(s => { 
      if (addConditionWithExclusivity(s.name, conditionsV, conditionsNV)) {
          nvProbs.push(s.prob);

          // Sincronização de flags de contexto baseada em nomes de itens
          if (s.name.includes("Câncer de Mama")) ctx.cancerMama = true;
          if (s.name.includes("Metastático") && s.name.includes("Mama")) ctx.cancerMamaMetastatico = true;
          if (s.name.includes("Câncer de Próstata") && s.name.includes("Metastático")) ctx.cancerProstataMetastatico = true;
          if (s.name.includes("Amputação")) ctx.perdeuMembroAcidente = true;
          if (s.name.includes("Câncer de Pele")) ctx.cancerPeleNaoTratado = true;
          if (s.name.includes("Laringe")) ctx.cancerLaringe = true;
          if (s.name.includes("TDAH Leve")) ctx.tdahLeve = true;
          if (s.name.includes("TDAH Moderado")) ctx.tdahModerado = true;
          if (s.name.includes("TDAH Grave")) ctx.tdahGrave = true;
          if (s.name.includes("Vitiligo Generalizado")) ctx.vitiligoGeneralizado = true;

          // Reverse trigger
          if (Math.random() < 0.10 && shiny === "Nenhum evento significativo detectado.") {
              if (s.name === "Amnésia Dissociativa Retrógrada Focal") shiny = "Sofre de amnésia dissociativa e não se lembra dos primeiros 20 anos de vida";
              if (s.name === "Catalepsia Patológica Crônica") shiny = "Acordou no meio de seu próprio velório após ser diagnosticado com catalepsia";
              if (s.name === "Anacusia Bilateral Neurosensorial") shiny = "Perdeu a audição de forma irreversível após uma explosão no local de trabalho";
              if (s.name === "Imunossupressão Crônica Pós-Transplante Cardíaco") shiny = "Recebeu um transplante de coração de um criminoso notório e sofre com o estigma";
              if (s.name === "Dor Crônica Neuropática Iatrogênica Estágio II") shiny = "Sofreu um erro médico grosseiro em uma cirurgia de rotina que mudou sua vida";
              if (s.name === "Hipervigilância Noturna Pós-Traumática") shiny = "Teve a casa invadida e destruída enquanto dormia com a família";
              if (s.name === "Paranoia Persecutória Reativa de Massa") shiny = "Foi falsamente acusado de um crime hediondo e precisou fugir de um linchamento";
              if (s.name === "Estresse Agudo com Somatização Sensorial") shiny = "Testemunhou a queda de um avião de pequeno porte e foi o primeiro nos destroços";
              if (s.name === "Síndrome de Abuso Religioso e Despersonalização Parcial") shiny = "Cresceu em uma seita extremista abusiva da qual conseguiu escapar com vida";
              if (s.name === "Ansiedade Generalizada por Perseguição Crônica") shiny = "Foi vítima de um stalker obsessivo que destruiu sua paz durante anos";
              if (s.name === "Transtorno de Ansiedade por Dissociação de Identidade Imposta") shiny = "Vive em programa de proteção à testemunha";
              if (s.name === "Ansiedade Fóbica Crônica por Silêncio Forçado") shiny = "Vive com o peso de saber quem cometeu um crime famoso, mas teme falar";
              if (s.name === "Ansiedade Situacional" && ctx.ataqueHackerZerouContas) shiny = "Foi vítima de um ataque hacker que zerou suas contas e destruiu seu crédito";
              if (s.name === "Úlcera Gástrica Ativa" && ctx.traicaoSocioDivida) shiny = "Foi traído pelo parceiro de negócios e assumiu sozinho uma dívida milionária";
              if (s.name === "Gastrite Leve por Estresse" && ctx.piramideFinanceira) shiny = "Perdeu as economias de uma vida inteira em um esquema de pirâmide financeira";
              if (s.name === "Síndrome de Débito Moral Obsessivo com Ideação de Busca") shiny = "Salvo de uma tragédia por um herói anônimo que desapareceu logo em seguida";
              if (s.name === "Transtorno de Adaptação Crônica com Déficit de Socialização Urbana") shiny = "Passou 10 anos vivendo isolado em uma comunidade remota sem contato com o exterior";
              if (s.name === "Crise de Identidade Transcultural com Estresse de Desenraizamento") shiny = "Foi deportado do país onde viveu a vida inteira por um erro burocrático";
              if (s.name === "Fobia Social Aguda e Transtorno de Pânico por Linchamento Virtual") shiny = "Foi cancelado na internet em escala nacional por um mal-entendido catastrófico";
              if (s.name === "Síndrome do Sobrevivente com Mutismo Seletivo Temporário e Choque Psíquico") shiny = "Teve o carro completamente esmagado por uma carreta e saiu fisicamente ileso";
              if (s.name === "Insuficiência Renal Aguda por Desidratação Crônica com Sequelas de Inanição") shiny = "Sobreviveu a um naufrágio e passou dias à deriva sem água ou comida";
              if (s.name === "Transtorno de Ansiedade Generalizada por Ameaça de Extradição ou Execução") shiny = "Descobriu ser o herdeiro direto de um império criminoso internacional";
              if (s.name === "Paranoia Existencial e Obsessão por Vigilância Patrimonial") shiny = "Recebeu uma fortuna de herança de um completo desconhecido";
              if (s.name === "Transtorno de Estresse Traumático por Achado Macabro Domiciliar") shiny = "Descobriu restos mortais enterrados no quintal de sua recém-comprada casa";
              if (s.name === "Alta Miopia Degenerativa com Lesões Retinianas") shiny = "Cegueira Total";
              if (s.name === "Esteatose Hepática Avançada (Esteato-hepatite / NASH)" && Math.random() < 0.10) {
                if (Math.random() < 0.5 && shiny === "Nenhum evento significativo detectado.") {
                  shiny = "Doou um órgão vital para um familiar que não resistiu";
                } else {
                  forcedConditions.push("Cirrose Hepática Inicial");
                }
              }
              if (s.name === "Cirrose Hepática Inicial" && Math.random() < 0.10) {
                forcedConditions.push("Esteatose Hepática Avançada (Esteato-hepatite / NASH)");
              }
              if (s.name === "Hipercolesterolemia Familiar ou Risco Cardiovascular Muito Alto" && Math.random() < 0.10) shiny = "Sobreviveu a um infarto agudo do miocárdio aos 30 anos";
              if (s.name === "Gastrite Aguda por Estresse com Risco de Sangramento" && Math.random() < 0.10) {
                shiny = randomChoice(["Internação em UTI", "Trauma Grave", "Coma por meses após um acidente", "Foi forçado a escolher qual familiar salvar em uma situação de perigo iminente"]);
              }
          }
      }
  });

  // Forced by shiny AFTER natural selection, ignoring limits, simply pushing
  // Eliminamos as duplicatas primeiro
  const uniqueForcedConditions = [...new Set(forcedConditions)];
  uniqueForcedConditions.forEach(fc => {
      const isInV = Object.values(NIVEIS_V).some(lvl => lvl.some(c => c.name === fc));
      if (isInV) {
          if (!conditionsV.includes(fc)) conditionsV.push(fc);
          vProbs.push({ prob: 10, poolSize: 1 }); // Sinalizando doença forçada (100% chance após gatilho, mas com 'prob' 10 para referenciar)
      } else {
          const isInNV = Object.values(NIVEIS_NV).some(lvl => lvl.some(c => c.name === fc));
          if (isInNV || !isInV) { // se não for visível, empurra pra NV (fallback)
             if (!conditionsNV.includes(fc)) conditionsNV.push(fc);
             nvProbs.push({ prob: 10, poolSize: 1 });
          }
      }
  });

  probs.vConditions = vProbs;
  probs.nvConditions = nvProbs;
  probs.vConditionsNone = { prob: 88.0 };
  probs.nvConditionsNone = { prob: 80.0 };
  probs.fetichesNone = { prob: 70.0 };

  // 6. Metrics assemble
  const physicalHealthBase = Math.max(10, 100 - (conditionsV.length * 15) - (conditionsNV.length * 5));
  let physicalHealth = physicalHealthBase;
  
  // BMI Penalties
  if (imc < 18.5) physicalHealth -= 10;
  if (imc >= 25.0 && imc <= 29.9) physicalHealth -= 2;
  if (imc >= 30.0 && imc <= 34.9 && !massaMagra) physicalHealth -= 5;
  if (imc >= 35.0 && imc <= 39.9 && !massaMagra) physicalHealth -= 12;
  if (imc >= 40.0 && !massaMagra) physicalHealth -= 25;

  let mentalStability = Math.max(10, 90 - (conditionsNV.length * 10) - (doouOrgaoVital ? 30 : 0) - (exMilitarDesertor ? 25 : 0));

  if (comaPosAcidente) physicalHealth = Math.max(10, physicalHealth - 30);
  if (transplanteCoracaoCriminoso) {
    physicalHealth = Math.max(5, physicalHealth - 40);
    mentalStability = Math.max(5, mentalStability - 30);
  }
  if (alergiaSolar) physicalHealth = Math.max(10, physicalHealth - 15);
  if (mutacoesCobaia) physicalHealth = Math.max(5, physicalHealth - 30);
  if (anacusiaTotal) physicalHealth = Math.max(10, physicalHealth - 10);
  if (ataqueAnimalSelvagem) physicalHealth = Math.max(10, physicalHealth - 25);
  if (perdeuMembroAcidente) physicalHealth = Math.max(10, physicalHealth - 30);
  if (paraplegiaEsporte) physicalHealth = Math.max(10, physicalHealth - 40);
  if (erroMedicoGrosseiro) physicalHealth = Math.max(10, physicalHealth - 20);

  if (conditionsNV.includes("Miopia Leve a Moderada")) physicalHealth -= 5;
  if (conditionsNV.includes("Alta Miopia (Acima de 6 Graus)")) physicalHealth -= 15;
  if (conditionsNV.includes("Alta Miopia Degenerativa com Lesões Retinianas")) physicalHealth -= 35;

  if (conditionsNV.includes("Dislipidemia Leve (LDL-C Alterado)")) physicalHealth -= 5;
  if (conditionsNV.includes("Hipercolesterolemia Moderada (Risco Cardiovascular Alto)")) {
    physicalHealth -= 15;
    mentalStability -= 5;
  }
  if (conditionsNV.includes("Hipercolesterolemia Familiar ou Risco Cardiovascular Muito Alto")) {
    physicalHealth -= 35;
    urbanScore -= 10;
  }

  if (conditionsNV.includes("Esteatose Hepática Leve (Grau I)")) physicalHealth -= 5;
  if (conditionsNV.includes("Esteatose Hepática Moderada (Grau II)")) {
    physicalHealth -= 15;
    mentalStability -= 5;
  }
  if (conditionsNV.includes("Esteatose Hepática Avançada (Esteato-hepatite / NASH)")) {
    physicalHealth -= 35;
    urbanScore -= 15;
  }
  
  if (conditionsNV.includes("Neuropatia Traumática Pós-Elétrica Leve")) {
    physicalHealth -= 10;
    mentalStability -= 5;
  }
  if (conditionsV.includes("Encefalopatia e Neuropatia Elétrica Moderada")) {
    physicalHealth -= 25;
    mentalStability -= 15;
  }
  if (conditionsV.includes("Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)")) {
    physicalHealth -= 45;
    mentalStability -= 30;
    urbanScore -= 15;
  }
  if (conditionsV.includes("Neuropatia Periférica e Encefalopatia por Trauma Elétrico Atmosférico")) {
    physicalHealth -= 35;
    mentalStability -= 25;
    urbanScore -= 10;
  }

  if (conditionsNV.includes("Dispepsia Funcional (Gastrite Nervosa)")) {
    physicalHealth -= 5;
    mentalStability -= 5;
  }
  if (conditionsNV.includes("Gastrite Erosiva por Estresse Crônico")) {
    physicalHealth -= 15;
    urbanScore -= 10;
  }
  if (conditionsNV.includes("Gastrite Aguda por Estresse com Risco de Sangramento")) {
    physicalHealth -= 35;
    mentalStability -= 15;
  }

  if (conditionsV.includes("Calvície Androgenética Inicial")) {
    mentalStability -= 2;
  }
  if (conditionsV.includes("Calvície Androgenética Avançada")) {
    mentalStability -= 10;
  }
  if (conditionsV.includes("Alopecia Areata (Perda em Placas)")) {
    mentalStability -= 15;
  }

  physicalHealth = Math.max(0, physicalHealth);

  incomeLevel = finalClasse.includes("Elite") ? 100 : finalClasse.includes("Alta") ? 75 : finalClasse.includes("Média") ? 50 : 25;

  // --- Shiny Metric Overrides ---
  if (herancaDesconhecido) {
    incomeLevel = 100;
    mentalStability = Math.max(15, mentalStability - 25);
  }
  if (deportadoErroBurocratico) {
    incomeLevel = 0;
    mentalStability = Math.max(10, mentalStability - 25);
  }
  if (ruinaFinanceira) {
    incomeLevel = Math.min(incomeLevel, 15);
    mentalStability = Math.max(10, mentalStability - 20);
  }
  if (piramideFinanceira) {
    incomeLevel = Math.min(incomeLevel, 20);
    mentalStability = Math.max(10, mentalStability - 25);
  }
  if (demissaoHumilhante) {
    incomeLevel = Math.min(incomeLevel, 10);
    mentalStability = Math.max(10, mentalStability - 30);
  }
  if (vendeuPatenteBarato) {
    incomeLevel = Math.min(incomeLevel, 40);
  }
  if (vicioJogoPerdaCasa) {
    incomeLevel = 0;
  }
  if (traicaoSocioDivida) {
    incomeLevel = -50;
  }
  if (doouPatrimonioFarsa) {
    incomeLevel = Math.min(incomeLevel, 15);
    mentalStability = Math.max(10, mentalStability - 20);
  }
  if (ataqueHackerZerouContas) {
    incomeLevel = 0;
  }
  if (expulsaGravidez) {
    incomeLevel = Math.min(incomeLevel, 20);
    mentalStability = Math.max(10, mentalStability - 25);
  }
  if (guardaIrmaosPrisaoPais) {
    incomeLevel = Math.min(incomeLevel, 25);
    mentalStability = Math.max(10, mentalStability - 15);
  }
  if (falenciaEmpresaFamilia) {
    incomeLevel = Math.min(incomeLevel, 15);
    mentalStability = Math.max(5, mentalStability - 40);
  }

  if (amnesiaRetrografa) mentalStability = Math.max(10, mentalStability - 20);
  if (catalepsiaCronica) mentalStability = Math.max(10, mentalStability - 15);
  if (refemAssalto) mentalStability = Math.max(5, mentalStability - 40);
  if (acusadoFalsamente) mentalStability = Math.max(10, mentalStability - 20);
  if (casaInvadida) mentalStability = Math.max(10, mentalStability - 15);
  if (testemunhouQuedaAviao) mentalStability = Math.max(10, mentalStability - 20);
  if (seitaExtremistaAbusiva) mentalStability = Math.max(5, mentalStability - 35);
  if (vitimaStalker) mentalStability = Math.max(10, mentalStability - 25);
  if (saberCrimeFamoso) mentalStability = Math.max(15, mentalStability - 15);
  
  if (restosMortaisQuintal) mentalStability = Math.max(10, mentalStability - 20);
  if (herdeiroImperioCriminoso) mentalStability = Math.max(5, mentalStability - 35);
  if (atingidoRaio) mentalStability = Math.max(10, mentalStability - 30);
  if (carroEsmagadoCarreta) mentalStability = Math.max(10, mentalStability - 25);
  if (canceladoInternet) mentalStability = Math.max(5, mentalStability - 45);
  if (isolamentoRemoto) mentalStability = Math.max(20, mentalStability - 15);
  if (heroiAnonimo) mentalStability = Math.max(30, mentalStability - 10);
  if (sobreviventeDesastre) mentalStability = Math.max(10, mentalStability - 30);
  if (matouAlguem) mentalStability = Math.max(10, mentalStability - 20);
  if (trocadoMaternidade) mentalStability = Math.max(10, mentalStability - 15);
  if (casamentoInteressePaixao) mentalStability = Math.max(10, mentalStability - 20);
  if (escolhaFamiliarPerigo) mentalStability = Math.max(10, mentalStability - 40);
  if (irmaoGemeoAdotado) mentalStability = Math.max(10, mentalStability - 10);
  if (malaDinheiroSujo) mentalStability = Math.max(5, mentalStability - 40);
  if (obraArteDestruida) mentalStability = Math.max(5, mentalStability - 50);

  // 7. Relational Baggage
  const relacionamentosAtivos: { type: string, text: string, prob?: ProbData, isMigrated?: boolean }[] = [];
  
  // Scoped Relational Modifiers for Shiny events
  if (falenciaEmpresaFamilia) relationalModifier -= 40;
  if (vicioJogoPerdaCasa) relationalModifier -= 50;
  if (traicaoSocioDivida) relationalModifier -= 40;
  if (herdeiroImperioCriminoso) relationalModifier -= 40;
  if (canceladoInternet) relationalModifier -= 70;
  if (deportadoErroBurocratico) relationalModifier -= 60;
  
  if (sobreviventeDesastre) relationalModifier -= 50;

  const paiFalecidoWeight = calculateDeclarativeWeight('relacional', 'Pai Falecido', initialCtx, (ctx) => {
    return ctx.sobreviventeDesastre ? 100 : 0.25;
  }, migratedItems);
  let isFatherDeceased = Math.random() < paiFalecidoWeight;
  if (options.fixedRelational?.includes("Pai Vivo")) isFatherDeceased = false;
  if (options.fixedRelational?.includes("Pai Falecido")) isFatherDeceased = true;

  let isMotherDeceased = sobreviventeDesastre || Math.random() < 0.25;
  if (options.fixedRelational?.includes("Mãe Viva")) isMotherDeceased = false;
  if (options.fixedRelational?.includes("Mãe Falecida")) isMotherDeceased = true;

  const relQualLock = options.fixedRelational?.find(r => r.startsWith("Relacionamento: "))?.split(": ")[1];

  // Father roll
  let fatherTypeRoll = isFatherDeceased ? { value: "Negativo" as string, prob: 25 } : rollWeighted(["Positivo", "Neutro", "Negativo"], [30, 55, 15]);
  if (relQualLock && !isFatherDeceased) fatherTypeRoll = { value: relQualLock, prob: 100 };
  fatherTypeRoll.prob = isFatherDeceased ? 25 : 75 * (fatherTypeRoll.prob / 100);
  let fatherText = isFatherDeceased ? "Falecido - " : "Vivo - ";
  
  if (exMilitarDesertor) { fatherText = "Falecido ou sem contato há uma década."; fatherTypeRoll.value = "Negativo"; }
  else if (sobreviventeDesastre) { fatherText = "Falecido: Morto no desastre aéreo."; fatherTypeRoll.value = "Negativo"; }
  else if (exDetento && bioSex === "Feminino") { fatherText = "Negativo: Abandono e corte total de laços após o encarceramento."; fatherTypeRoll.value = "Negativo"; }
  else if (expulsaGravidez || guardaIrmaosPrisaoPais) {
      fatherTypeRoll.value = "Negativo";
      fatherText = expulsaGravidez ? "Negativo: Expulsão e abandono após gravidez na adolescência." : "Negativo: Pais ausentes devido ao encarceramento.";
  }
  else if (trocadoMaternidade) {
      fatherText = "Complexo: Pai de criação (afeto tênue) vs Pai biológico (desconhecido).";
      fatherTypeRoll.value = "Neutro";
  }
  else if (incestoPai) { 
    fatherText = incestoAbuso ? "Negativo: Relação de abuso e trauma profundo." : "Neutro/Complexo: Relação incestuosa consentida.";
    fatherTypeRoll.value = incestoAbuso ? "Negativo" : "Neutro";
  }
  else if (doouOrgaoVital && Math.random() < 0.4) { fatherText = "Falecido: Seu sacrifício não foi suficiente."; fatherTypeRoll.value = "Negativo"; }
  else if (isFatherDeceased && Math.random() < 0.70) { fatherText = "Falecido: Sente saudades."; fatherTypeRoll.value = "Positivo"; }
  else { 
    const lockedText = options.fixedRelational?.find(r => r.startsWith(`Rel ${fatherTypeRoll.value}: `))?.split(": ")[1];
    fatherText += lockedText || randomChoice(RELACOES_TEXTOS[fatherTypeRoll.value]); 
  }
  relacionamentosAtivos.push({ 
    type: fatherTypeRoll.value, 
    text: `Pai: ${fatherText}`, 
    prob: { prob: fatherTypeRoll.prob }, 
    isMigrated: isFatherDeceased ? migratedItems.includes('Pai Falecido') : migratedItems.includes('Pai Vivo') 
  });

  // Mother roll
  let motherTypeRoll = isMotherDeceased ? { value: "Negativo" as string, prob: 25 } : rollWeighted(["Positivo", "Neutro", "Negativo"], [30, 55, 15]);
  if (relQualLock && !isMotherDeceased) motherTypeRoll = { value: relQualLock, prob: 100 };
  motherTypeRoll.prob = isMotherDeceased ? 25 : 75 * (motherTypeRoll.prob / 100);
  let motherText = isMotherDeceased ? "Falecida - " : "Viva - ";
  
  if (exMilitarDesertor) { motherText = "Falecida ou sem contato há uma década."; motherTypeRoll.value = "Negativo"; }
  else if (sobreviventeDesastre) { motherText = "Falecida: Morta no desastre aéreo."; motherTypeRoll.value = "Negativo"; }
  else if (exDetento && bioSex === "Feminino") { motherText = "Negativa: Abandono e corte total de laços após o encarceramento."; motherTypeRoll.value = "Negativo"; }
  else if (expulsaGravidez || guardaIrmaosPrisaoPais) {
      motherTypeRoll.value = "Negativo";
      motherText = expulsaGravidez ? "Negativa: Expulsão e abandono após gravidez na adolescência." : "Negativa: Pais ausentes devido ao encarceramento.";
  }
  else if (trocadoMaternidade) {
      motherText = "Complexo: Mãe de criação (afeto tênue) vs Mãe biológica (desconhecido).";
      motherTypeRoll.value = "Neutro";
  }
  else if (incestoMae) { 
    motherText = incestoAbuso ? "Negativo: Relação de abuso e trauma profundo." : "Neutro/Complexo: Relação incestuosa consentida.";
    motherTypeRoll.value = incestoAbuso ? "Negativo" : "Neutro";
  }
  else if (doouOrgaoVital && !fatherText.includes("Falecido") && Math.random() < 0.4) { motherText = "Falecida: Seu sacrifício não foi suficiente."; motherTypeRoll.value = "Negativo"; }
  else if (isMotherDeceased && Math.random() < 0.70) { motherText = "Falecida: Sente saudades."; motherTypeRoll.value = "Positivo"; }
  else { 
    const lockedText = options.fixedRelational?.find(r => r.startsWith(`Rel ${motherTypeRoll.value}: `))?.split(": ")[1];
    motherText += lockedText || randomChoice(RELACOES_TEXTOS[motherTypeRoll.value]); 
  }
  relacionamentosAtivos.push({ type: motherTypeRoll.value, text: `Mãe: ${motherText}`, prob: { prob: motherTypeRoll.prob } });

  let extraCount = (protecaoTestemunha || seitaExtremistaAbusiva) ? 0 : 3;
  if (isFatherDeceased && !sobreviventeDesastre && !protecaoTestemunha && !seitaExtremistaAbusiva) extraCount++;
  if (isMotherDeceased && !sobreviventeDesastre && !protecaoTestemunha && !seitaExtremistaAbusiva) extraCount++;

  for (let i = 0; i < extraCount; i++) {
    // Substituindo `rollUniform` para usar o motor declarativo
    const rolesKeys = Object.keys(migratedItems['papeisRelacionais'] || {});
    const roleOptions = rolesKeys.length > 0 
      ? rolesKeys.map(k => migratedItems['papeisRelacionais'][k].name!)
      : ["Irmão/Irmã", "Amigo(a)", "Ex-Cônjuge", "Colega de Trabalho", "Mentor(a)", "Inimigo(a)", "Filho(a)"];
    
    const roleWeights = roleOptions.map(r => calculateDeclarativeWeight('papeisRelacionais', r, ctx, () => 1.0, migratedItems));
    let roleRoll = rollWeighted(roleOptions, roleWeights);
    
    // Child Dynamics Lock Hijack
    const lockedChildText = options.fixedFilhos?.find(f => f.includes(": "))?.split(": ")[1];
    if (lockedChildText && i === 0) {
      roleRoll = { value: "Filho(a)", prob: 100, poolSize: 1 };
      relacionamentosAtivos.push({ type: "Complexo", text: `Filho(a): ${lockedChildText}`, prob: { prob: 100 } });
      continue;
    }

    const typeRoll = rollWeighted(["Positivo", "Neutro", "Negativo"], [30, 55, 15]);
    
    let roleText = roleRoll.value;
    let impactText = "";

    if (sobreviventeDesastre && (roleText === "Irmão/Irmã" || roleText === "Filho(a)")) {
        impactText = "Falecido(a) no desastre familiar.";
        relacionamentosAtivos.push({ type: "Negativo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (escolhaFamiliarPerigo && i === 0) {
        roleText = "Familiar (Escolha)";
        impactText = "Falecido - Culpa Extrema do Sobrevivente: Você escolheu não salvá-lo.";
        relacionamentosAtivos.push({ type: "Negativo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }
    if (escolhaFamiliarPerigo && i === 1) {
        roleText = "Familiar (Salvo)";
        impactText = "Neutro / Tênue: Vínculo corroído pelo trauma compartilhado e silêncio culpado.";
        relacionamentosAtivos.push({ type: "Neutro", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (filhoFugiu && i === 0) {
        roleText = "Filho(a)";
        impactText = "Desaparecido / Trauma Abrupto: Fugiu na adolescência e nunca mais deu notícias.";
        relacionamentosAtivos.push({ type: "Negativo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (expulsaGravidez && i === 0) {
        roleText = "Filho(a) (Adulto)";
        impactText = "Positivo - Vínculo Protetor: Criado com sacrifício após a expulsão da família.";
        relacionamentosAtivos.push({ type: "Positivo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (criouFilhoAmigo) {
        if (i === 0) {
            roleText = "Melhor Amigo";
            impactText = "Falecido - Saudade Crônica: Morreu repentinamente, deixando o filho sob seus cuidados.";
            relacionamentosAtivos.push({ type: "Positivo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
            continue;
        }
        if (i === 1) {
            roleText = "Filho Adotivo";
            impactText = "Positivo - Vínculo Protetor Absoluto: Filho do melhor amigo, criado como seu.";
            relacionamentosAtivos.push({ type: "Positivo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
            continue;
        }
    }

    if (irmaoGemeoAdotado && i === 0) {
        roleText = "Irmão Gêmeo";
        impactText = "Neutro - Desconhecido: Dado para adoção ao nascer; busca ativa em andamento.";
        relacionamentosAtivos.push({ type: "Neutro", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (guardaIrmaosPrisaoPais && (roleText === "Irmão/Irmã" || i < 2)) {
        roleText = "Irmão Novo";
        impactText = "Positivo - Dependência Financeira e Afetiva Total: Sob sua guarda após a prisão dos pais.";
        relacionamentosAtivos.push({ type: "Positivo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (casamentoInteressePaixao && i === 0) {
        roleText = "Cônjuge";
        impactText = "Positivo - Doente Grave / Culpa e Devoção: Casou por interesse, mas agora cuida com amor genuíno.";
        relacionamentosAtivos.push({ type: "Positivo", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (incestoIrmao && roleRoll.value === "Irmão/Irmã") {
        roleText = "Irmão/Irmã";
        impactText = incestoAbuso ? "Relação de abuso incestuoso e trauma." : "Relação incestuosa consentida.";
        relacionamentosAtivos.push({ type: incestoAbuso ? "Negativo" : "Neutro", text: `${roleText}: ${impactText}`, prob: { prob: 100 } });
        continue;
    }

    if (roleText === "Filho(a)") {
      // Logic for subtype based on parent age
      let subType: "Criança" | "Adolescente" | "Adulto" = "Criança";
      if (finalIdade > 45) {
        subType = Math.random() < 0.7 ? "Adulto" : "Adolescente";
      } else if (finalIdade > 30) {
        subType = Math.random() < 0.6 ? "Criança" : "Adolescente";
      }
      
      roleText = `${roleText} (${subType})`;

      if (subType === "Criança" && typeRoll.value === "Negativo") {
        // Special logic for Negativo Criança to include weighted variants
        const possibleWeighted = FILHOS_PESADOS_CONDICIONAIS.filter(cond => cond.condition(ctx));
        if (possibleWeighted.length > 0) {
           const pool = [
             ...FILHOS_TEXTOS["Criança"]["Negativo"].map(t => ({text: t, weight: 1})), 
             ...possibleWeighted
           ];
           const chosen = weightedRandom(pool.map(p => p.text), pool.map(p => p.weight));
           impactText = chosen;
        } else {
           impactText = randomChoice(FILHOS_TEXTOS["Criança"]["Negativo"]);
        }
      } else {
        impactText = randomChoice(FILHOS_TEXTOS[subType][typeRoll.value]);
      }
    } else {
      impactText = randomChoice(RELACOES_TEXTOS[typeRoll.value]);
    }

    relacionamentosAtivos.push({ 
      type: typeRoll.value, 
      text: `${roleText}: ${impactText}`, 
      prob: { prob: (roleRoll.prob / 100) * typeRoll.prob, poolSize: typeRoll.poolSize } 
    });
  }

  const resRollDummy = resRoll; // Already defined earlier
  const tempRollDummy = tempRoll; // Already defined earlier

  const resMap: Record<string, number> = {
    "Resiliência Inabalável": 100,
    "Estoicismo Forçado": 80,
    "Resiliência Padrão": 65,
    "Cinismo Defensivo": 45,
    "Resiliência Fragilizada": 25,
    "Colapso Iminente": 10
  };
  let resilienceScore = resMap[resRoll.value] || 50;
  let finalResilienceValue = resRoll.value;

  if (paranoiaFortuna) {
    finalResilienceValue = "Paranoia Defensiva";
    resilienceScore = 30; // High vigilance, low actual stability
  }
  if (heroiAnonimo) {
    finalResilienceValue = randomChoice(["Estoicismo Forçado", "Resiliência Inabalável"]);
    resilienceScore = 85;
  }
  if (refemAssalto) {
    finalResilienceValue = randomChoice(["Colapso Iminente", "Cinismo Defensivo"]);
    resilienceScore = finalResilienceValue === "Colapso Iminente" ? 10 : 45;
  }

  if (heroiAnonimo) {
    finalResilienceValue = randomChoice(["Estoicismo Forçado", "Resiliência Inabalável"]);
    resilienceScore = 85;
  }
  
  const transRoll = { value: ctx.transporte, prob: 0, poolSize: 0 }; // We already calculated it for ctx

  if (transRoll.value === "Veículo Próprio") urbanScore = 90;
  else if (transRoll.value === "Transporte por App") urbanScore = 70;
  else urbanScore = 40;
  
  if (finalClasse.includes("Elite")) urbanScore += 10;
  if (finalClasse.includes("Alta")) urbanScore += 5;
  if (finalClasse.includes("Vulnerável")) urbanScore -= 10;

  // BMI Urban Friction
  if (imc >= 35.0 && !massaMagra) urbanScore -= 15;

  urbanScore = Math.max(10, Math.min(100, urbanScore));

  // Scoped Urban Modifiers for Shiny events
  if (malaDinheiroSujo) {
    urbanScore = Math.max(5, urbanScore - 60);
  }
  if (ataqueHackerZerouContas) {
    urbanScore = Math.max(5, urbanScore - 30);
  }
  if (herdeiroImperioCriminoso) {
    urbanScore = Math.max(5, urbanScore - 50);
  }
  if (isolamentoRemoto) {
    urbanScore = Math.max(5, urbanScore - 80);
  }

  let finalFriccaoUrbana = getFriccaoUrbana(regiao, perfilUrbanoStr, finalClasse, nome);
  if (ruinaFinanceira) {
    finalFriccaoUrbana = `Transição traumática: Acostumado ao luxo de veículos blindados e motoristas, agora enfrenta a fricção física bruta do transporte público periférico. ${finalFriccaoUrbana}`;
  }

  const friccaoUrbana = finalFriccaoUrbana;
  const rastroWeights = OP_RASTRO.map(r => calculateDeclarativeWeight('rastro', r.text, ctx, r.weight, migratedItems));
  const rastroRoll = rollWeighted(OP_RASTRO.map(r => r.text), rastroWeights);
  const tribo = getWeightedTribo(ctx, migratedItems);
  const sexualidade = getWeightedCenaSexualidade(ctx);
  const fetiches = getWeightedFetishes(ctx, migratedItems);

  probs.resiliencia = { prob: resRoll.prob, poolSize: resRoll.poolSize };
  probs.temperamento = { prob: tempRoll.prob, poolSize: tempRoll.poolSize };
  probs.transporte = { prob: transRoll.prob, poolSize: transRoll.poolSize };
  probs.rastro = { prob: rastroRoll.prob, poolSize: rastroRoll.poolSize };
  probs.triboUrbana = tribo.prob;
  probs.cenaSexualidade = sexualidade.prob;
  
  const fProbArray = fetiches.probs.length > 0 ? fetiches.probs : [{ prob: 70.0 }];
  probs.fetiches = fProbArray;
  probs.sexo = { prob: 50, poolSize: 2 };
  probs.bioSex = { prob: ((probs.genero as ProbData).prob / 100) * bioSexProb, poolSize: bioSexPoolSize };

  // --- FINAL OCCUPATION & PROFESSION FUNNEL ---
  const maxLevel = getMaxConditionLevel(conditionsV, conditionsNV);
  const status = defineOccupationStatus(ctx, maxLevel, options);
  
  ctx.trabalha = status.trabalha;
  ctx.estuda = status.estuda;
  ctx.estagio = status.estagio;
  ctx.aposentado = status.aposentado;
  ctx.desempregado = status.desempregado;
  
  if (ctx.trabalha && ctx.estuda && (ctx.classe.includes("Vulnerável") || ctx.classe.includes("Baixa"))) {
      ctx.estresse = true;
      ctx.estresseHard = true;
  }

  const profResult = selectProfession(ctx, migratedItems);
  const professionFinalBase = profResult.value;
  probs.profissao = { prob: profResult.prob, poolSize: profResult.poolSize };

  const seniority = getSeniorityLevel(finalIdade, finalClasse);
  const needsSeniority = seniority && !exMilitarDesertor && ctx.trabalha && !ctx.aposentado && !ctx.desempregado && !(ctx.estuda && !ctx.trabalha);
  const profissaoFinal = needsSeniority ? `${professionFinalBase} ${seniority}` : professionFinalBase;
  
  ctx.corporativo = profissaoFinal.toLowerCase().includes("corporativo") || profissaoFinal.toLowerCase().includes("executivo") || profissaoFinal.toLowerCase().includes("diretor") || profissaoFinal.toLowerCase().includes("analista");

  let statusOcupacional = "Mercado de Trabalho Ativo";
  if (ctx.aposentado) statusOcupacional = "Aposentado(a) / Invalidez";
  else if (ctx.desempregado) statusOcupacional = "Desempregado(a)";
  else if (ctx.estuda && !ctx.trabalha) statusOcupacional = "Estudante";
  else if (ctx.estuda && ctx.trabalha) statusOcupacional = "Estudante / Trabalhador";
  else if (ctx.estagio) statusOcupacional = "Estudante / Estagiário";

  const relationalStability = Math.max(10, 50 + (relacionamentosAtivos.filter(r => r.type === 'Positivo').length * 10) - (relacionamentosAtivos.filter(r => r.type === 'Negativo').length * 15) + relationalModifier);
  if (protecaoTestemunha || seitaExtremistaAbusiva) {
    relationalModifier = -50; // Heavy penalty
  }
  if (exDetento && bioSex === "Feminino") {
      relationalModifier -= 100; // Nuclear option for relational
  }
  if (abandonadoAltar) relationalModifier -= 30;
  if (segundaFamiliaConjuge) relationalModifier -= 30;
  if (filhoFugiu) relationalModifier -= 40;
  if (expulsaGravidez) relationalModifier -= 50;
  if (guardaIrmaosPrisaoPais) relationalModifier -= 20;

  const finalRelationalStability = (protecaoTestemunha || seitaExtremistaAbusiva || (exDetento && bioSex === "Feminino") || expulsaGravidez) ? Math.min(20, Math.max(0, relationalStability)) : relationalStability;

  // BodyMap Impacts (Specific Somatizations)
  const bodyMapImpacts: { id: string, color: string }[] = [];
  if (atingidoRaio || conditionsV.includes("Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)")) {
    // Lichtenberg figures - Grave Trajetory
    ["chest", "right-arm", "left-arm", "right-hand", "left-hand"].forEach(id => {
      bodyMapImpacts.push({ id, color: "#FFBF00" });
    });
  } else if (conditionsV.includes("Encefalopatia e Neuropatia Elétrica Moderada")) {
    // Moderada: chest + asymmetric arm
    bodyMapImpacts.push({ id: "chest", color: "#FFBF00" });
    bodyMapImpacts.push({ id: Math.random() < 0.5 ? "right-arm" : "left-arm", color: "#FFBF00" });
  }
  if (conditionsV.some(c => c.includes("Calvície") || c.includes("Alopecia"))) {
    bodyMapImpacts.push({ id: "head", color: "#FFBF00" });
  }
  if (falenciaEmpresaFamilia || abandonadoAltar) {
    bodyMapImpacts.push({ id: "orbit", color: "#FFBF00" });
  }

  const generatedPhotos = generateDossierPhotos({
    idade: finalIdade,
    classe: finalClasse,
    regiao,
    imc,
    conditionsV,
    shiny,
    mentalHealth: mentalStability,
    physicalHealth
  });

  const habitacaoStr = ctx.habitacao;
  const resilienciaStr = (filhoFugiu) ? randomChoice(["Colapso Iminente", "Cinismo Defensivo"]) : (criouFilhoAmigo) ? "Resiliência Padrão" : finalResilienceValue;

  const rawText = `=== DOSSIÊ DE IDENTIDADE INTERCEPTADO ===

[DADOS PESSOAIS E DEMOGRÁFICOS]
Nome: ${nome}
Idade: ${finalIdade}
Gênero: ${identidadeGenero} (${termoIdentidade})
Bio Sexo: ${bioSex}
Etnia: ${etnia}
Orientação Sexual: ${orientacao}
Classe Social: ${finalClasse}
Região: ${regiao}
Perfil Urbano: ${perfilUrbanoStr}
Tribo Urbana: ${tribo.name}

[PERFIL PROFISSIONAL E STATUS]
Profissão: ${profissaoFinal}
Status Ocupacional: ${statusOcupacional}

[BIOMETRIA E CONDIÇÕES FÍSICAS]
Altura: ${altura}m | Peso: ${peso}kg | IMC: ${imc}
Biotipo: ${biotipo} (${biotipoAnomalia})
Massa Magra Visível: ${massaMagra ? "Sim" : "Não"}
Condições Visíveis: ${conditionsV.length > 0 ? conditionsV.join(", ") : "Nenhuma"}
Patologias Ocultas: ${conditionsNV.length > 0 ? conditionsNV.join(", ") : "Nenhuma"}

[PERFIL PSICOLÓGICO E COMPORTAMENTAL]
Temperamento: ${tempRoll.value}
Psicotipo/Resiliência: ${resilienciaStr}
Fricção Urbana: ${friccaoUrbana}
Rastro Digital: ${rastroRoll.value}

[SEXUALIDADE E INTIMIDADE]
Expressão da Libido: ${sexualidade.value}
Fetiches & Sombras: ${fetiches.names.length > 0 ? fetiches.names.join(", ") : "Nenhum fetiche detectado"}

[REGISTRO FOTOGRÁFICO / RASTREAMENTO]
- ${generatedPhotos[0]}
- ${generatedPhotos[1]}
- ${generatedPhotos[2]}

[LOGÍSTICA URBANA]
Habitação: ${habitacaoStr}
Transporte Principal: ${transRoll.value}

[RELATÓRIO DE INCIDENTE ANÔMALO (SHINY)]
Evento: ${shiny || "Nenhum evento anômalo registrado"}

[BAGAGEM RELACIONAL]
${relacionamentosAtivos.length > 0 ? relacionamentosAtivos.map(r => `[${r.type.toUpperCase()}] ${r.text}`).join("\n") : "Sem bagagem relacional registrada"}

--- Fim da Transmissão ---`;

  return {
    text: rawText,
    metadata: {
      nome, idade: finalIdade, genero: `${identidadeGenero} ${termoIdentidade}`, bioSex, etnia, orientacao, classe: finalClasse, regiao, 
      perfilUrbano: perfilUrbanoStr, profissao: profissaoFinal, statusOcupacional,
      vConditions: conditionsV, nvConditions: conditionsNV, 
      habitacao: habitacaoStr, transporte: transRoll.value, 
      resiliencia: resilienciaStr, 
      temperamento: tempRoll.value, 
      shiny, cenaSexualidade: sexualidade.value, fetiches: fetiches.names, triboUrbana: tribo.name, rastro: rastroRoll.value, 
      biotipo, biotipoAnomalia, altura, peso, imc, massaMagra, photos: generatedPhotos, 
      baggage: relacionamentosAtivos,
      metrics: { 
        physical: physicalHealth, 
        mental: mentalStability, 
        income: incomeLevel, 
        relational: finalRelationalStability,
        resilience: resilienceScore,
        urbanLife: urbanScore
      },
      probs,
      friccaoUrbana,
      migratedItems,
      bodyMap: bodyMapImpacts
    }
  };
}
