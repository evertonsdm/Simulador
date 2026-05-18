import { generateCharacterData } from './characterGenerator';

// Tipo idêntico ao do componente para garantir consistência
interface BatchStats {
  total: number;
  orientation: Record<string, number>;
  bioSex: Record<string, number>;
  identity: Record<string, number>;
  ethnicity: Record<string, number>;
  socialClass: Record<string, number>;
  region: Record<string, number>;
  states: Record<string, number>;
  ageBuckets: Record<string, number>;
  tribes: Record<string, number>;
  averages: {
    physical: number;
    mental: number;
    income: number;
    relational: number;
    resilience: number;
    urbanLife: number;
  };
  flags: Record<string, number>;
  professions: Record<string, number>;
  shinies: Record<string, number>;
  conditions: Record<string, number>;
}

self.onmessage = (e: MessageEvent) => {
  const { count } = e.data;
  
  const stats: BatchStats = {
    total: count,
    orientation: {},
    bioSex: {},
    identity: {},
    ethnicity: {},
    socialClass: {},
    region: {},
    states: {},
    ageBuckets: {
      '0-17': 0,
      '18-29': 0,
      '30-49': 0,
      '50-64': 0,
      '65+': 0
    },
    tribes: {},
    averages: { physical: 0, mental: 0, income: 0, relational: 0, resilience: 0, urbanLife: 0 },
    flags: {
      estresse: 0,
      braçal: 0,
      aposentado: 0,
      estudante: 0,
      desempregado: 0,
      shiny: 0
    },
    professions: {},
    shinies: {},
    conditions: {}
  };

  const chunkSize = Math.max(1, Math.floor(count / 100)); // Mais frequente para 1M
  // Se o count for muito alto, não guardamos os personagens para evitar estouro de memória no postMessage/Worker
  // mas como o componente espera o array para os filtros, vamos manter uma amostragem se for muito alto?
  // Na verdade, vamos permitir o array até 50k, acima disso retornamos vazio e avisamos que filtros estão desativados.
  const characters: any[] = [];
  const keepCharacters = count <= 50000;

  for (let i = 0; i < count; i++) {
    const res = generateCharacterData();
    if (keepCharacters) {
      characters.push(res);
    }
    const meta = res.metadata;

    // Agregação de dados
    stats.orientation[meta.orientacao] = (stats.orientation[meta.orientacao] || 0) + 1;
    stats.bioSex[meta.bioSex] = (stats.bioSex[meta.bioSex] || 0) + 1;
    stats.ethnicity[meta.etnia] = (stats.ethnicity[meta.etnia] || 0) + 1;
    stats.socialClass[meta.classe] = (stats.socialClass[meta.classe] || 0) + 1;
    
    const identity = meta.genero.split(' ')[0];
    stats.identity[identity] = (stats.identity[identity] || 0) + 1;

    // Idade
    const age = meta.idade;
    if (age <= 17) stats.ageBuckets['0-17']++;
    else if (age <= 29) stats.ageBuckets['18-29']++;
    else if (age <= 49) stats.ageBuckets['30-49']++;
    else if (age <= 64) stats.ageBuckets['50-64']++;
    else stats.ageBuckets['65+']++;

    stats.region[meta.regiao] = (stats.region[meta.regiao] || 0) + 1;
    stats.states[meta.estado] = (stats.states[meta.estado] || 0) + 1;

    stats.averages.physical += meta.metrics.physical;
    stats.averages.mental += meta.metrics.mental;
    stats.averages.income += meta.metrics.income;
    stats.averages.relational += meta.metrics.relational;
    stats.averages.resilience += meta.metrics.resilience;
    stats.averages.urbanLife += meta.metrics.urbanLife;

    if (meta.statusOcupacional.includes("Aposentado")) stats.flags.aposentado++;
    if (meta.statusOcupacional.includes("Estudante")) stats.flags.estudante++;
    if (meta.statusOcupacional.includes("Desempregado")) stats.flags.desempregado++;
    if (meta.profissao.toLowerCase().includes("braçal") || meta.profissao.toLowerCase().includes("obra")) stats.flags.braçal++;
    if (meta.shiny !== "Nenhum evento significativo detectado." && meta.shiny !== "Não detectado") {
      stats.flags.shiny++;
      stats.shinies[meta.shiny] = (stats.shinies[meta.shiny] || 0) + 1;
    }

    stats.professions[meta.profissao] = (stats.professions[meta.profissao] || 0) + 1;

    // Conditions
    meta.vConditions.forEach(cond => {
      stats.conditions[cond] = (stats.conditions[cond] || 0) + 1;
    });

    // Tribos
    if (meta.triboUrbana) {
      stats.tribes[meta.triboUrbana] = (stats.tribes[meta.triboUrbana] || 0) + 1;
    }

    // Reportar progresso
    if ((i + 1) % chunkSize === 0 || i === count - 1) {
      self.postMessage({ type: 'progress', current: i + 1, total: count });
    }
  }

  // Finalizar médias
  stats.averages.physical /= count;
  stats.averages.mental /= count;
  stats.averages.income /= count;
  stats.averages.relational /= count;
  stats.averages.resilience /= count;
  stats.averages.urbanLife /= count;

  self.postMessage({ type: 'complete', stats, characters });
};
