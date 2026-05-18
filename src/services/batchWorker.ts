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
    shinies: {}
  };

  const chunkSize = Math.max(1, Math.floor(count / 20)); // Enviar progresso a cada 5%
  const characters: any[] = [];

  for (let i = 0; i < count; i++) {
    const res = generateCharacterData();
    characters.push(res);
    const meta = res.metadata;

    // Agregação de dados
    stats.orientation[meta.orientacao] = (stats.orientation[meta.orientacao] || 0) + 1;
    stats.bioSex[meta.bioSex] = (stats.bioSex[meta.bioSex] || 0) + 1;
    stats.ethnicity[meta.etnia] = (stats.ethnicity[meta.etnia] || 0) + 1;
    stats.socialClass[meta.classe] = (stats.socialClass[meta.classe] || 0) + 1;
    
    const identity = meta.genero.split(' ')[0];
    stats.identity[identity] = (stats.identity[identity] || 0) + 1;

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
    if (meta.shiny !== "Nenhum evento significativo detectado.") {
      stats.flags.shiny++;
      stats.shinies[meta.shiny] = (stats.shinies[meta.shiny] || 0) + 1;
    }

    stats.professions[meta.profissao] = (stats.professions[meta.profissao] || 0) + 1;

    // Reportar progresso a cada chunk
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
