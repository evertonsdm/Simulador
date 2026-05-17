
import { ConditionContext, CharacterCondition } from '../types/character';

export const NIVEIS_NV: Record<number, CharacterCondition[]> = {
  1: [
    { name: "Gastrite Leve por Estresse", weight: (ctx) => (ctx.piramideFinanceira ? 15.0 : ctx.segundaFamiliaConjuge ? 4.5 : ctx.ruinaFinanceira ? 3.0 : ctx.estresse ? 2.5 : 1.0) },
    { name: "Dispepsia Funcional (Gastrite Nervosa)", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.capital) weight *= 2.5;
      if (ctx.regiao === 'Sudeste') weight *= 2.0;
      else if (ctx.regiao === 'Nordeste') weight *= 1.5;
      if (ctx.estresse || ctx.ansiedade) weight *= 3.0;
      if (ctx.estresseHard) weight *= 5.0;
      return weight;
    } },
    { name: "Miopia Leve", weight: (ctx) => {
      let weight = (ctx.tecnologia || ctx.miopiaCongenita ? 2.5 : 1.0);
      if (ctx.sexo === 'Feminino') weight *= 1.6;
      if (ctx.idade < 20) weight *= 2.0;
      else if (ctx.idade >= 20 && ctx.idade <= 30) weight *= 3.5;
      if (ctx.tecnologia || ctx.escritorio) weight *= 3.0;
      if (ctx.capital) weight *= 2.0;
      if (ctx.estado === 'SP' && ctx.regiao === 'Sudeste') weight *= 2.5;
      return weight;
    } },
    { name: "Ansiedade Situacional", weight: (ctx) => (ctx.ataqueHackerZerouContas ? 15.0 : ctx.criouFilhoAmigo ? 4.0 : ctx.estresse || ctx.ansiedade ? 2.0 : 1.0) }
  ],
  2: [
    { name: "Hipertensão Estágio I", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.obesidadeIII) weight *= 5.0;
      else if (ctx.obesidadeI || ctx.obesidadeII) weight *= 3.5;
      else if (ctx.sobrepeso) weight *= 2.0;
      if (ctx.sedentario) weight *= 1.5;
      return weight;
    } },
    { name: "TDAH Leve (Não sabe que possui)", weight: (ctx) => 1.0 },
    { name: "Dislipidemia Leve (LDL-C Alterado)", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.sexo === 'Feminino') weight *= 1.15;
      if (ctx.idade >= 45) weight *= 2.5;
      else if (ctx.idade > 18) weight *= 1.0 + (ctx.idade - 18) * (1.5 / 27);
      else weight *= 0.1;

      if (ctx.obesidadeIII) weight *= 4.5;
      else if (ctx.obesidadeI || ctx.obesidadeII) weight *= 3.0;
      else if (ctx.sobrepeso) weight *= 1.5;
      
      if (ctx.sedentario || ctx.mausHabitos) weight *= 2.0;
      return weight;
    } },
    { name: "Insônia Crônica", weight: (ctx) => (ctx.restosMortaisQuintal || ctx.carroEsmagadoCarreta || ctx.falenciaEmpresaFamilia || ctx.ataqueHackerZerouContas ? 15.0 : ctx.casaInvadida ? 15.0 : ctx.matouAlguem ? 7.0 : ctx.paranoiaFortuna ? 6.0 : ctx.estresse || ctx.cafeina || ctx.turnosNoturnos ? 3.0 : ctx.exMilitarDesertor ? 2.0 : 1.0) },
    { name: "Zumbido no Ouvido (Tinnitus)", weight: (ctx) => (ctx.exMilitarDesertor ? 2.5 : 1.0) },
    { name: "Miopia Leve a Moderada", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.sexo === 'Feminino') weight *= 1.6;
      if (ctx.idade < 20) weight *= 2.0;
      else if (ctx.idade >= 20 && ctx.idade <= 30) weight *= 3.5;
      if (ctx.tecnologia || ctx.escritorio) weight *= 3.0;
      if (ctx.capital) weight *= 2.0;
      if (ctx.estado === 'SP' && ctx.regiao === 'Sudeste') weight *= 2.5;
      return weight;
    } }
  ],
  3: [
    { name: "Úlcera gástrica ativa", weight: (ctx) => (ctx.traicaoSocioDivida ? 15.0 : ctx.expulsaGravidez && ctx.sexo === 'Feminino' ? 5.0 : ctx.doouOrgaoVital ? 2.5 : ctx.estresse ? 2.0 : 1.0) },
    { name: "Esteatose Hepática Leve (Grau I)", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.doouOrgaoVital) weight *= 2.0;
      if (ctx.alcoolico) weight *= 2.5;
      if (ctx.idade > 50) weight *= 3.0;
      else if (ctx.idade >= 35) weight *= 2.0;
      
      if (ctx.obesidadeI) weight *= 3.0;
      else if (ctx.sobrepeso) weight *= 2.0;
      
      if (ctx.sedentario || ctx.diabetico) weight *= 2.0;
      return weight;
    } },
    { name: "Neuropatia Traumática Pós-Elétrica Leve", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.sexo === 'Masculino') weight *= 4.5;
      else if (ctx.sexo === 'Feminino') weight *= 0.2;
      if (ctx.regiao === 'Norte') weight *= 2.5;
      else if (ctx.regiao === 'Sudeste') weight *= 2.0;
      if (ctx.zonaRuralRemota || ctx.braçal) weight *= 3.0;
      return weight;
    } },
    { name: "Ansiedade Crônica e Humilhação", weight: (ctx) => (ctx.abandonadoAltar ? 8.0 : 1.0) },
    { name: "Paranoia Existencial e Obsessão por Vigilância Patrimonial", weight: (ctx) => (ctx.herancaDesconhecido ? 15.0 : 1.0) },
    { name: "Síndrome de Débito Moral Obsessivo com Ideação de Busca", weight: (ctx) => (ctx.heroiAnonimo ? 15.0 : 1.0) },
    {
      name: "Câncer de Mama (Estágio Inicial / Precoce)",
      weight: (ctx) => {
        let weight = 0.013;
        if (ctx.sexo === 'Masculino') weight *= 0.01;
        if (ctx.idade > 50) weight *= 2.5;
        if (ctx.regiao === 'Sudeste') weight *= 1.2;
        if (ctx.regiao === 'Sul') weight *= 1.2;
        if (ctx.regiao === 'Norte') weight *= 0.8;
        if (ctx.negroPardo) weight *= 0.7;
        return weight;
      }
    },
    {
      name: "Câncer de Próstata (Estágio Inicial)",
      weight: (ctx) => {
        let weight = 0.014;
        if (ctx.sexo === 'Feminino') weight *= 0;
        if (ctx.idade < 40) weight *= 0.01;
        if (ctx.idade > 50) weight *= 2.5;
        if (ctx.idade > 65) weight *= 2;
        if (ctx.negroPardo) weight *= 1.5;
        if (ctx.regiao === 'Sul' || ctx.regiao === 'Sudeste') weight *= 1.2;
        if (ctx.regiao === 'Norte' || ctx.regiao === 'Nordeste') weight *= 0.8;
        return weight;
      }
    }
  ],
  4: [
    { name: "Apneia do Sono Gravidade Média", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.obesidadeII || ctx.obesidadeIII) weight *= 4.0;
      if (ctx.fumante) weight *= 2.0;
      return weight;
    } },
    { name: "Gastrite Erosiva por Estresse Crônico", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.capital) weight *= 2.5;
      if (ctx.regiao === 'Sudeste') weight *= 2.0;
      else if (ctx.regiao === 'Nordeste') weight *= 1.5;
      if (ctx.estresse || ctx.ansiedade) weight *= 3.0;
      if (ctx.estresseHard) weight *= 5.0;
      return weight;
    } },
    { name: "Síndrome do Pânico", weight: (ctx) => (ctx.carroEsmagadoCarreta || ctx.demissaoHumilhante ? 15.0 : ctx.refemAssalto ? 15.0 : ctx.escolhaFamiliarPerigo ? 10.0 : ctx.segundaFamiliaConjuge ? 5.0 : ctx.protecaoTestemunha ? 4.0 : ctx.ansiedade || ctx.traumaGrave ? 3.0 : 1.0) },
    { name: "Hipervigilância Noturna Pós-Traumática", weight: (ctx) => (ctx.malaDinheiroSujo || ctx.casaInvadida ? 15.0 : 1.0) },
    { name: "Ansiedade Fóbica Crônica por Silêncio Forçado", weight: (ctx) => (ctx.saberCrimeFamoso ? 15.0 : 1.0) },
    { name: "Transtorno de Estresse Traumático por Achado Macabro Domiciliar", weight: (ctx) => (ctx.restosMortaisQuintal ? 15.0 : 1.0) },
    { name: "Transtorno de Adaptação Crônica com Déficit de Socialização Urbana", weight: (ctx) => (ctx.isolamentoRemoto ? 15.0 : 1.0) }
  ],
  5: [
    { name: "TDAH Moderado (Consciente e Diagnosticado)", weight: (ctx) => 1.0 },
    { name: "Transtorno Bipolar Tipo II", weight: (ctx) => (ctx.vendeuPatenteBarato ? 15.0 : ctx.geneticaFamiliar || ctx.transtornoBorderlineDepressao ? 3.0 : 1.0) },
    { name: "Cirrose Hepática Inicial", weight: (ctx) => (ctx.matouAlguem ? 5.0 : ctx.alcoolico || ctx.hepatite ? 4.0 : 1.0) },
    { name: "Transtorno de Personalidade Evitativa", weight: (ctx) => (ctx.demissaoHumilhante || ctx.doouPatrimonioFarsa ? 15.0 : ctx.irmaoGemeoAdotado ? 6.0 : ctx.trocadoMaternidade ? 5.0 : ctx.incestoAbuso && ctx.sexo === 'Masculino' ? 9.0 : ctx.exMilitarDesertor ? 3.5 : 1.0) },
    { name: "Alcoolismo Crônico", weight: (ctx) => (ctx.vicioJogoPerdaCasa ? 15.0 : ctx.filhoFugiu ? 8.0 : ctx.matouAlguem ? 6.0 : ctx.alcoolico ? 4.0 : 1.0) },
    { name: "Paranoia e Crises de Desconfiança", weight: (ctx) => (ctx.traicaoSocioDivida ? 15.0 : ctx.segundaFamiliaConjuge ? 7.0 : 1.0) },
    { name: "Catalepsia Patológica Crônica", weight: (ctx) => (ctx.catalepsiaCronica ? 15.0 : 1.0) },
    { name: "Anacusia Bilateral Neurosensorial", weight: (ctx) => (ctx.anacusiaTotal ? 15.0 : 1.0) },
    { name: "Estresse Agudo com Somatização Sensorial", weight: (ctx) => (ctx.testemunhouQuedaAviao ? 15.0 : 1.0) },
    { name: "Ansiedade Generalizada por Perseguição Crônica", weight: (ctx) => (ctx.vitimaStalker ? 15.0 : 1.0) },
    { name: "Transtorno de Ansiedade por Dissociação de Identidade Imposta", weight: (ctx) => (ctx.protecaoTestemunha ? 15.0 : 1.0) },
    { name: "Síndrome do Sobrevivente com Mutismo Seletivo Temporário e Choque Psíquico", weight: (ctx) => (ctx.carroEsmagadoCarreta ? 15.0 : 1.0) },
    { name: "Fobia Social Aguda e Transtorno de Pânico por Linchamento Virtual", weight: (ctx) => (ctx.canceladoInternet ? 15.0 : 1.0) },
    { name: "Crise de Identidade Transcultural com Estresse de Desenraizamento", weight: (ctx) => (ctx.deportadoErroBurocratico ? 15.0 : 1.0) },
    { name: "Alta Miopia (Acima de 6 Graus)", weight: (ctx) => {
      let weight = 0.8; // Lower base for higher severity
      if (ctx.sexo === 'Feminino') weight *= 1.6;
      if (ctx.idade < 20) weight *= 2.0;
      else if (ctx.idade >= 20 && ctx.idade <= 30) weight *= 3.5;
      if (ctx.tecnologia || ctx.escritorio) weight *= 3.0;
      if (ctx.capital) weight *= 2.0;
      if (ctx.estado === 'SP' && ctx.regiao === 'Sudeste') weight *= 2.5;
      return weight;
    } },
    { name: "Hipercolesterolemia Moderada (Risco Cardiovascular Alto)", weight: (ctx) => {
      let weight = 0.8;
      if (ctx.sexo === 'Feminino') weight *= 1.15;
      if (ctx.idade >= 45) weight *= 2.5;
      else if (ctx.idade > 18) weight *= 1.0 + (ctx.idade - 18) * (1.5 / 27);
      else weight *= 0.1;

      if (ctx.obesidadeIII) weight *= 4.5;
      else if (ctx.obesidadeI || ctx.obesidadeII) weight *= 3.0;
      else if (ctx.sobrepeso) weight *= 1.5;

      if (ctx.sedentario || ctx.mausHabitos) weight *= 2.0;
      return weight;
    } },
    { name: "Esteatose Hepática Moderada (Grau II)", weight: (ctx) => {
      let weight = 0.7; // Lower base for higher severity
      if (ctx.doouOrgaoVital) weight *= 2.0;
      if (ctx.alcoolico) weight *= 2.5;
      if (ctx.idade > 50) weight *= 3.0;
      else if (ctx.idade >= 35) weight *= 2.0;
      
      if (ctx.obesidadeII) weight *= 3.5;
      
      if (ctx.sedentario || ctx.diabetico) weight *= 2.0;
      return weight;
    } }
  ],
  6: [
    { name: "Insuficiência Cardíaca Leve", weight: (ctx) => (ctx.idoso || ctx.infartoPrevio ? 3.0 : 1.0) },
    { name: "Borderline (Instabilidade Severa)", weight: (ctx) => (ctx.irmaoGemeoAdotado ? 5.0 : ctx.incestoAbuso && ctx.sexo === 'Feminino' ? 8.0 : ctx.traumaInfancia || ctx.transtornoBorderlineDepressao ? 3.5 : 1.0) },
    { name: "Agorafobia Severa", weight: (ctx) => (ctx.canceladoInternet || ctx.acusadoFalsamente ? 15.0 : ctx.abandonadoAltar ? 7.0 : ctx.protecaoTestemunha ? 5.0 : ctx.exMilitarDesertor ? 2.5 : 1.0) },
    { name: "Crises de Despersonalização", weight: (ctx) => (ctx.trocadoMaternidade ? 8.0 : 1.0) },
    { name: "Amnésia Dissociativa Retrógrada Focal", weight: (ctx) => (ctx.amnesiaRetrografa ? 15.0 : 1.0) },
    { name: "Dor Crônica Neuropática Iatrogênica Estágio II", weight: (ctx) => (ctx.erroMedicoGrosseiro ? 15.0 : 1.0) },
    { name: "Paranoia Persecutória Reativa de Massa", weight: (ctx) => (ctx.malaDinheiroSujo || ctx.acusadoFalsamente ? 15.0 : 1.0) },
    { name: "Transtorno de Ansiedade Generalizada por Ameaça de Extradição ou Execução", weight: (ctx) => (ctx.herdeiroImperioCriminoso ? 15.0 : 1.0) },
    { name: "Sobrecarga Sensorial", weight: (ctx) => 1.0 }
  ],
  7: [
    { name: "Doença de Crohn", weight: (ctx) => (ctx.autoimune || ctx.cancerIntestinalCrohn ? 3.0 : 1.0) },
    { name: "Gastrite Aguda por Estresse com Risco de Sangramento", weight: (ctx) => {
      let weight = 0.5; // Lower base for high severity
      if (ctx.capital) weight *= 2.5;
      if (ctx.regiao === 'Sudeste') weight *= 2.0;
      else if (ctx.regiao === 'Nordeste') weight *= 1.5;
      if (ctx.estresse || ctx.ansiedade) weight *= 3.0;
      if (ctx.estresseHard) weight *= 5.0;
      return weight;
    } },
    { name: "Esclerose Múltipla", weight: (ctx) => (ctx.autoimune || ctx.escleroseMultipla ? 4.0 : 1.0) },
    { name: "TEPT (Transtorno de Estresse Pós-Traumático)", weight: (ctx) => (ctx.naufragioDeriva || ctx.refemAssalto || ctx.exMilitarDesertor ? 15.0 : ctx.escolhaFamiliarPerigo ? 12.0 : ctx.sobreviventeDesastre ? 8.0 : ctx.doouOrgaoVital ? 3.0 : 1.0) },
    { name: "Dependência Química Ativa", weight: (ctx) => (ctx.vicioJogoPerdaCasa ? 15.0 : ctx.incestoAbuso && ctx.sexo === 'Masculino' ? 10.0 : ctx.ruinaFinanceira ? 5.0 : ctx.doouOrgaoVital ? 2.2 : 1.0) },
    { name: "Traumas Reprodutivos e Pélvicos", weight: (ctx) => (ctx.incestoAbuso && ctx.sexo === 'Feminino' ? 12.0 : 1.0) },
    { name: "Imunossupressão Crônica Pós-Transplante Cardíaco", weight: (ctx) => (ctx.transplanteCoracaoCriminoso ? 15.0 : 1.0) },
    { name: "Síndrome de Abuso Religioso e Despersonalização Parcial", weight: (ctx) => (ctx.seitaExtremistaAbusiva ? 15.0 : 1.0) },
    { name: "Insuficiência Renal Aguda por Desidratação Crônica com Sequelas de Inanição", weight: (ctx) => (ctx.naufragioDeriva ? 15.0 : 1.0) },
    {
      name: "Câncer de Mama (Localmente Avançado)",
      weight: (ctx) => {
        let weight = 0.005;
        if (ctx.sexo === 'Masculino') weight *= 0.01;
        if (ctx.idade > 50) weight *= 2.5;
        if (ctx.regiao === 'Sudeste') weight *= 1.2;
        if (ctx.regiao === 'Sul') weight *= 1.2;
        if (ctx.regiao === 'Norte') weight *= 0.8;
        if (ctx.negroPardo) weight *= 1.4;
        return weight;
      }
    },
    {
      name: "Câncer de Próstata (Avançado)",
      weight: (ctx) => {
        let weight = 0.004;
        if (ctx.sexo === 'Feminino') weight *= 0;
        if (ctx.idade < 40) weight *= 0.01;
        if (ctx.idade > 50) weight *= 2.5;
        if (ctx.idade > 65) weight *= 2;
        if (ctx.negroPardo) weight *= 1.8;
        if (ctx.regiao === 'Sul' || ctx.regiao === 'Sudeste') weight *= 1.2;
        if (ctx.regiao === 'Norte' || ctx.regiao === 'Nordeste') weight *= 0.8;
        return weight;
      }
    }
  ],
  8: [
    { name: "TDAH Grave (Disfunção Executiva e Hiperfoco Rotativo)", weight: (ctx) => 1.0 },
    { name: "Neoplasia Maligna (Câncer) em Tratamento", weight: (ctx) => (ctx.quimioterapia ? 5.0 : 1.0) },
    { name: "Insuficiência Renal Crônica", weight: (ctx) => (ctx.diabetico || ctx.hipertenso || ctx.doouOrgaoVital ? 3.5 : 1.0) },
    { name: "Depressão Profunda", weight: (ctx) => (ctx.obraArteDestruida || ctx.falenciaEmpresaFamilia || ctx.acidenteFatalPedestre ? 15.0 : ctx.filhoFugiu ? 10.0 : ctx.expulsaGravidez ? 8.0 : ctx.ruinaFinanceira ? 4.0 : ctx.doouOrgaoVital ? 3.0 : 1.0) },
    { name: "Alta Miopia Degenerativa com Lesões Retinianas", weight: (ctx) => {
      let weight = 0.5; // Very low base
      if (ctx.sexo === 'Feminino') weight *= 1.6;
      if (ctx.idade < 20) weight *= 2.0;
      else if (ctx.idade >= 20 && ctx.idade <= 30) weight *= 3.5;
      if (ctx.tecnologia || ctx.escritorio) weight *= 3.0;
      if (ctx.capital) weight *= 2.0;
      if (ctx.estado === 'SP' && ctx.regiao === 'Sudeste') weight *= 2.5;
      return weight;
    } },
    { name: "Hipercolesterolemia Familiar ou Risco Cardiovascular Muito Alto", weight: (ctx) => {
      let weight = 0.5;
      if (ctx.sexo === 'Feminino') weight *= 1.15;
      if (ctx.idade >= 45) weight *= 2.5;
      else if (ctx.idade > 18) weight *= 1.0 + (ctx.idade - 18) * (1.5 / 27);
      else weight *= 0.1;

      if (ctx.obesidadeIII) weight *= 4.5;
      else if (ctx.obesidadeI || ctx.obesidadeII) weight *= 3.0;
      else if (ctx.sobrepeso) weight *= 1.5;

      if (ctx.sedentario || ctx.mausHabitos) weight *= 2.0;
      if (ctx.geneticaFamiliar) weight *= 5.0;
      return weight;
    } },
    { name: "Esteatose Hepática Avançada (Esteato-hepatite / NASH)", weight: (ctx) => {
      let weight = 0.4; // Low base
      if (ctx.doouOrgaoVital) weight *= 2.0;
      if (ctx.alcoolico) weight *= 2.5;
      if (ctx.idade > 50) weight *= 3.0;
      else if (ctx.idade >= 35) weight *= 2.0;
      
      if (ctx.obesidadeIII) weight *= 6.0;
      
      if (ctx.sedentario || ctx.diabetico) weight *= 2.0;
      return weight;
    } },
    { name: "Diabetes Tipo 2", weight: (ctx) => {
      let weight = 0.5;
      if (ctx.obesidadeIII && ctx.sedentario) weight *= 5.0;
      else if (ctx.obesidadeI || ctx.obesidadeII) weight *= 2.5;
      if (ctx.geneticaFamiliar) weight *= 3.0;
      return weight;
    } }
  ],
  9: [
    { name: "Esquizofrenia Paranóide", weight: (ctx) => (ctx.paranoiaFortuna ? 3.0 : ctx.geneticaFamiliar ? 4.0 : 1.0) },
    { name: "AIDS (Fase Avançada)", weight: (ctx) => (ctx.proSe || ctx.drogasInjetaveis ? 4.0 : 1.0) },
    {
      name: "Câncer de Mama (Metastático / Estágio IV)",
      weight: (ctx) => {
        let weight = 0.002;
        if (ctx.sexo === 'Masculino') weight *= 0.01;
        if (ctx.idade > 50) weight *= 2.5;
        if (ctx.regiao === 'Sudeste') weight *= 1.2;
        if (ctx.regiao === 'Sul') weight *= 1.2;
        if (ctx.regiao === 'Norte') weight *= 0.8;
        if (ctx.negroPardo) weight *= 1.8;
        return weight;
      }
    }
  ],
  10: [
    { name: "Doença de Alzheimer (Fase Avançada)", weight: (ctx) => (ctx.idoso || ctx.neurologico ? 6.0 : 1.0) },
    { name: "ELA (Sclerose Lateral Amiotrófica)", weight: (ctx) => (ctx.neurologico ? 6.0 : 1.0) },
    {
      name: "Câncer de Próstata (Metastático)",
      weight: (ctx) => {
        let weight = 0.002;
        if (ctx.sexo === 'Feminino') weight *= 0;
        if (ctx.idade < 40) weight *= 0.01;
        if (ctx.idade > 50) weight *= 2.5;
        if (ctx.idade > 65) weight *= 2;
        if (ctx.negroPardo) weight *= 2;
        if (ctx.regiao === 'Sul' || ctx.regiao === 'Sudeste') weight *= 1.2;
        if (ctx.regiao === 'Norte' || ctx.regiao === 'Nordeste') weight *= 0.8;
        return weight;
      }
    }
  ]
};

export const NIVEIS_V: Record<number, CharacterCondition[]> = {
  1: [
    { name: "Dermatite Atópica Visível", weight: (ctx) => (ctx.demissaoHumilhante || ctx.saberCrimeFamoso ? 15.0 : ctx.expulsaGravidez ? 5.0 : ctx.ansiedade || ctx.climaFrio ? 2.5 : 1.0) },
    { name: "Calvície Androgenética Inicial", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.sexo === 'Masculino') weight *= 1.5;
      else if (ctx.sexo === 'Feminino') weight *= 0.1; // Represents reduced chance for females
      
      if (ctx.idade >= 20 && ctx.idade <= 25) weight *= 2.5;
      else if (ctx.idade > 40) weight *= 0.5; // Decreases as it progresses to advanced
      
      return weight;
    } },
    { name: "Olheiras Crônicas Marcadas", weight: (ctx) => (ctx.falenciaEmpresaFamilia || ctx.vitimaStalker || ctx.abandonadoAltar || ctx.casamentoInteressePaixao ? 10.0 : ctx.doouOrgaoVital ? 4.0 : 1.0) },
    { name: "Cicatriz Pequena (Rosto/Braço)", weight: (ctx) => (ctx.exMilitarDesertor ? 15.0 : ctx.protecaoTestemunha ? 3.0 : 1.0) }
  ],
  2: [
    {
      name: "TEA Nível 1 (Suporte Leve)",
      weight: (ctx) => {
        let weight = 0.009;
        if (ctx.sexo === 'Masculino') weight *= 1.5;
        if (ctx.sexo === 'Feminino') weight *= 0.6;
        if (ctx.idade < 12) weight *= 2.5;
        if (ctx.caucasiano) weight *= 1.2;
        return weight;
      }
    },
    { name: "Cicatrizes de Acne Severa no Rosto", weight: (ctx) => (ctx.idade < 30 ? 2.5 : 1.0) },
    { name: "Psoríase em Placas (Cotovelos/Joelhos)", weight: (ctx) => (ctx.estresse ? 3.0 : 1.0) },
    { name: "Cabelo Grisalho Prematuro", weight: (ctx) => (ctx.guardaIrmaosPrisaoPais ? 12.0 : ctx.doouOrgaoVital ? 3.0 : 1.0) },
    { name: "Cicatriz Cirúrgica Extensa (Flanco/Abdômen)", weight: (ctx) => (ctx.expulsaGravidez ? 10.0 : ctx.incestoAbuso && ctx.sexo === 'Feminino' ? 7.0 : ctx.comaPosAcidente ? 5.0 : ctx.doouOrgaoVital ? 10.0 : 1.0) },
    { name: "Nariz Quebrado/Torto", weight: (ctx) => (ctx.exMilitarDesertor ? 3.0 : 1.0) },
    { name: "Tatuagem Militar Coberta/Queimada", weight: (ctx) => {
      const base = ctx.exMilitarDesertor ? 4.0 : 1.0;
      if (ctx.idade <= 18) return 0;
      // Linear interpolation: 18 -> 0, 60 -> 2. Multiplier = (Age - 18) / ((60 - 18) / 2) = (Age - 18) / 21
      const ageMultiplier = (ctx.idade - 18) / 21;
      const sexMultiplier = ctx.sexo === 'Feminino' ? 0.3 : 1.0;
      return base * ageMultiplier * sexMultiplier;
    } }
  ],
  3: [
    { name: "Calvície Androgenética Avançada", weight: (ctx) => {
      let weight = 0.5;
      if (ctx.sexo === 'Masculino') weight *= 1.5;
      else if (ctx.sexo === 'Feminino') weight *= 0.01; // Extremely rare for females
      
      if (ctx.idade > 40) {
        // Up to 3.5x for older men
        const ageFactor = Math.min(3.5, 1.0 + (ctx.idade - 40) * 0.1);
        weight *= ageFactor;
      }
      return weight;
    } },
    { name: "Obesidade Grau I", weight: (ctx) => (ctx.obeso && !ctx.massaMagra ? 4.0 : ctx.doouOrgaoVital ? 1.5 : 1.0) },
    { name: "Vitiligo Generalizado", weight: (ctx) => 1.0 },
    { name: "Sobrepeso Visível", weight: (ctx) => (ctx.sobrepeso ? 2.5 : ctx.doouOrgaoVital ? 1.5 : 1.0) }
  ],
  4: [
    { name: "Estrabismo Divergente", weight: (ctx) => 1.0 },
    { name: "Tremor Essencial (Mãos)", weight: (ctx) => (ctx.atingidoRaio || ctx.malaDinheiroSujo || ctx.escolhaFamiliarPerigo ? 15.0 : ctx.idoso || ctx.ansiedade ? 2.5 : 1.0) },
    { name: "Claudicação Leve ao Andar", weight: (ctx) => (ctx.comaPosAcidente ? 6.0 : ctx.exMilitarDesertor ? 3.0 : 1.0) }
  ],
  5: [
    { name: "Alopecia Areata (Perda em Placas)", weight: (ctx) => {
      let weight = 1.0;
      if (ctx.estresse || ctx.ansiedade || ctx.estresseHard) weight *= 4.0;
      return weight;
    } },
    { name: "Cicatriz Cirúrgica Extensa (Abdômen/Peito)", weight: (ctx) => (ctx.sobreviventeDesastre ? 4.0 : ctx.traumaGrave || ctx.internacaoUTI ? 3.0 : 1.0) },
    { name: "Fotodermatite Actínica Severa", weight: (ctx) => (ctx.alergiaSolar ? 15.0 : 1.0) }
  ],
  6: [
    {
      name: "TEA Nível 2 (Suporte Substancial)",
      weight: (ctx) => {
        let weight = 0.005;
        if (ctx.sexo === 'Masculino') weight *= 1.5;
        if (ctx.sexo === 'Feminino') weight *= 0.6;
        if (ctx.idade < 12) weight *= 2.5;
        if (ctx.caucasiano) weight *= 1.2;
        if (ctx.baixaRenda) weight *= 1.4;
        if (ctx.estado === 'BA') weight *= 1.3;
        return weight;
      }
    },
    { name: "Hemiplesia Facial (Sequela de AVC)", weight: (ctx) => (ctx.avcExtenso ? 4.5 : 1.0) },
    { name: "Crise de Espasmos", weight: (ctx) => 1.0 },
    {
      name: "Amputação (Dedos ou Parte da Mão)",
      weight: (ctx) => {
        let weight = 1.0;
        if (ctx.perdeuMembroAcidente) weight *= 15.0;
        if (ctx.trabalhoRisco) weight *= 2.5;
        if (ctx.braçal) weight *= 2.0;
        if (ctx.acidenteTransito) weight *= 3.0;
        return weight;
      }
    },
    { name: "Encefalopatia e Neuropatia Elétrica Moderada", weight: (ctx) => {
      let weight = 0.8;
      if (ctx.sexo === 'Masculino') weight *= 4.5;
      else if (ctx.sexo === 'Feminino') weight *= 0.2;
      if (ctx.regiao === 'Norte') weight *= 2.5;
      else if (ctx.regiao === 'Sudeste') weight *= 2.0;
      if (ctx.zonaRuralRemota || ctx.braçal) weight *= 3.0;
      return weight;
    } },
    { name: "Nanismo (Acondroplasia)", weight: (ctx) => (ctx.biotipoAnomalia === "Extremo Vertical" ? 5.0 : 0.1) },
    { name: "Sequelas de Trauma Tecidual por Laceração Extensa", weight: (ctx) => (ctx.ataqueAnimalSelvagem ? 15.0 : 1.0) }
  ],
  7: [
    { name: "Amputação Parcial de Membro Superior", weight: (ctx) => (ctx.perdeuMembroAcidente ? 15.0 : ctx.trabalhoRisco || ctx.acidenteMotorLesao ? 4.0 : 1.0) },
    { name: "Queimaduras de 3º Grau Visíveis", weight: (ctx) => (ctx.sobreviventeDesastre ? 6.0 : ctx.fogo || ctx.bombeiro || ctx.explosao ? 5.0 : 1.0) },
    { name: "Neuropatia Periférica e Encefalopatia por Trauma Elétrico Atmosférico", weight: (ctx) => (ctx.atingidoRaio ? 15.0 : 1.0) }
  ],
  8: [
    { name: "Amputação de Membro Inferior (Cadeira de Rodas)", weight: (ctx) => (ctx.perdeuMembroAcidente ? 15.0 : ctx.diabeticoLesaoPe || ctx.acidenteMotorLesao ? 4.0 : 1.0) },
    { name: "Neuropatia Periférica e Encefalopatia Grave (Sequela de Raio)", weight: (ctx) => {
      let weight = 0.5;
      if (ctx.sexo === 'Masculino') weight *= 4.5;
      else if (ctx.sexo === 'Feminino') weight *= 0.2;
      if (ctx.regiao === 'Norte') weight *= 2.5;
      else if (ctx.regiao === 'Sudeste') weight *= 2.0;
      if (ctx.zonaRuralRemota || ctx.braçal) weight *= 3.0;
      return weight;
    } },
    { name: "Paralisia Cerebral com Espasticidade", weight: (ctx) => 1.0 },
    { name: "Anorexia Nervosa (Caquexia)", weight: (ctx) => (ctx.naufragioDeriva || ctx.incestoAbuso && ctx.sexo === 'Feminino' ? 10.0 : ctx.doouOrgaoVital ? 2.0 : 1.0) },
    { name: "Amputação (Dedos ou Parte do Pé)", weight: (ctx) => (ctx.exMilitarDesertor ? 2.0 : 1.0) },
    { name: "Síndrome de Degeneração Mutagênica Iatrogênica", weight: (ctx) => (ctx.mutacoesCobaia ? 15.0 : 1.0) }
  ],
  9: [
    {
      name: "TEA Nível 3 (Muito Suporte Substancial)",
      weight: (ctx) => {
        let weight = 0.003;
        if (ctx.sexo === 'Masculino') weight *= 1.5;
        if (ctx.sexo === 'Feminino') weight *= 0.6;
        if (ctx.idade < 12) weight *= 2.5;
        if (ctx.caucasiano) weight *= 1.2;
        if (ctx.baixaRenda) weight *= 1.5;
        if (ctx.estado === 'BA') weight *= 1.3;
        return weight;
      }
    },
    { name: "Paraplegia (Cadeirante)", weight: (ctx) => (ctx.paraplegiaEsporte ? 15.0 : ctx.lesaoTronco || ctx.mergulhoVelocidade ? 5.0 : 1.0) },
    { name: "Cegueira Total", weight: (ctx) => (ctx.glaucoma || ctx.traumaViolento ? 4.0 : 1.0) }
  ],
  10: [
    { name: "Tetraplegia", weight: (ctx) => (ctx.lesaoTronco ? 6.0 : 1.0) },
    { name: "Necrose extensa de tecidos moles (Visível)", weight: (ctx) => (ctx.cancerPeleNaoTratado ? 5.0 : 1.0) }
  ]
};

export const OP_TRIBO: Record<string, CharacterCondition[]> = {
  "Mainstream": [
    { name: "Cidadão de Bem / Padrão", weight: (ctx) => 2.0 },
    { name: "Tia do Zap / Conservador Urbano", weight: (ctx) => (ctx.idade > 45 ? 3.0 : 0.5) },
    { name: "Trabalhador Cansado", weight: (ctx) => (ctx.baixaRenda ? 3.0 : 1.0) }
  ],
  "Subcultura": [
    { name: "Gótico / Trevoso", weight: (ctx) => {
      if (ctx.idade < 26) return 2.5;
      if (ctx.idade < 30) return 1.0;
      return 0.3;
    } },
    { name: "Punk / Anarcopunk", weight: (ctx) => (ctx.alternativo ? 2.5 : 1.0) },
    { name: "Otaku / Geek", weight: (ctx) => (ctx.tecnologia || ctx.idade < 25 ? 3.0 : 1.0) }
  ],
  "Estética": [
    { name: "Andrógino / Queer Artístico", weight: (ctx) => (ctx.gayCis || ctx.alternativo ? 3.0 : 1.0) },
    { name: "E-Girl / E-Boy", weight: (ctx) => (ctx.idade < 22 && ctx.capital ? 3.5 : 0.1) }
  ],
  "Marginalidade": [
    { name: "Membro de Gangue / Facção", weight: (ctx) => (ctx.exDetento && ctx.sexo === 'Masculino' ? 12.0 : ctx.baixaRenda ? 2.0 : 0.5) },
    { name: "Olheiro de Comunidade", weight: (ctx) => (ctx.baixaRenda ? 2.5 : 0.2) }
  ]
};

export const FETICHES_DATA = [
  { name: "Feederism / Gain (Controle Alimentar)", weight: (ctx: any) => (ctx.obesidadeII || ctx.obesidadeIII ? 4.0 : 0.5) },
  { name: "Fragility Fetish", weight: (ctx: any) => (ctx.abaixoDoPeso && ctx.biotipoAnomalia === "Déficit Severo" ? 3.5 : 0.2) },
  { name: "Muscle Worship", weight: (ctx: any) => (ctx.falsoSaudavel ? 4.0 : 0.5) },
  { name: "Macrophilia / Giantess", weight: (ctx: any) => (ctx.altura > 1.85 ? 3.0 : 0.3) },
  { name: "Cuckholding / Hotwife", weight: (ctx: any) => 1.0 },
  { name: "Pet Play / Pup Play", weight: (ctx: any) => 1.0 },
  { name: "BDSM / Rope Bondage", weight: (ctx: any) => 1.0 },
  { name: "Financial Domination", weight: (ctx: any) => (ctx.classe.includes("Elite") ? 2.5 : 0.2) }
];

export const FILHOS_PESADOS_CONDICIONAIS = [
  { text: "Exploração infantil enraizada. O NPC força a criança ao trabalho braçal pesado (na roça, olaria ou pesca) e impede sua frequência escolar regular.", condition: (c: ConditionContext) => (c.regiao === "Norte" || c.regiao === "Nordeste") && c.classe.includes("Vulnerável"), weight: 1.5 },
  { text: "Projeção do trauma racial. O NPC usa o terror psicológico e agressões físicas extremas exigindo \"perfeição\" da criança, com a justificativa distorcida de \"prepará-la para um mundo racista\".", condition: (c: ConditionContext) => c.negroPardo && (c.classe.includes("Vulnerável") || c.classe.includes("Baixa")), weight: 1.8 },
  { text: "Negligência corporativa severa. O NPC nunca vê a criança, deixando-a emocionalmente atrofiada em um apartamento luxuoso sendo criada por um rodízio de babás, terceirizando o afeto.", condition: (c: ConditionContext) => c.regiao === "Sudeste" && (c.classe.includes("Alta") || c.classe.includes("Elite")), weight: 1.6 },
  { text: "Repressão ultraconservadora violenta. O NPC agride fisicamente a criança por apresentar qualquer traço de sensibilidade, trejeito ou comportamento considerado \"fora do padrão de gênero\", tentando \"consertar\" a criança à força.", condition: (c: ConditionContext) => (c.regiao === "Sul" || c.regiao === "Centro-Oeste") && (c.classe.includes("Baixa") || c.classe.includes("Vulnerável")), weight: 1.7 },
  { text: "Paranoia urbana extrema. O NPC tranca a criança em casa (cárcere privado brando) e a impede de ter amigos, ir a festas ou brincar, desenvolvendo fobia social severa no filho por medo de \"violência na rua\".", condition: (c: ConditionContext) => c.capital, weight: 1.5 }
];
