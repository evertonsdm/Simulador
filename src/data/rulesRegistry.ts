export interface RuleModifier {
  property: string; // e.g., 'idade', 'capital', 'bioSex'
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'includes';
  value: any;
  multiplier: number;
}

export interface RegistryItem {
  baseWeight: number;
  rules: RuleModifier[];
  name?: string;
}

// O banco nasce mapeado por categorias, mas com as coleções vazias aguardando a migração
export const RULES_REGISTRY: Record<string, Record<string, RegistryItem>> = {
  condicoesVisiveis: {
    "crisedeespasmos": {
      baseWeight: 1,
      rules: [
        { property: "encefalopatiaEletricaModerada", operator: "==", value: true, multiplier: 5.0 },
        { property: "falhaResistenciaFisica", operator: "==", value: true, multiplier: 2.0 }
      ]
    },
    "encefalopatiaeneuropatiaelectricamoderada": {
      baseWeight: 1,
      rules: [
        { property: "contatoCorrenteEletrica", operator: "==", value: true, multiplier: 10 },
        { property: "fadigaExtrema", operator: "==", value: true, multiplier: 2 }
      ]
    },
    "neuropatiaperifericaeencefalopatiagravesequeladeraio": {
      baseWeight: 0.5,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Masculino", "multiplier": 4.5 },
        { "property": "sexo", "operator": "==", "value": "Feminino", "multiplier": 0.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 2.5 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 2 },
        { "property": "zonaRuralRemota", "operator": "==", "value": true, "multiplier": 3 },
        { "property": "braçal", "operator": "==", "value": true, "multiplier": 3 }
      ]
    },
    "calvícieandrogenéticainicial": {
      baseWeight: 1,
      rules: [
        { property: "sexo", operator: "==", value: "Masculino", multiplier: 1.5 },
        { property: "sexo", operator: "==", value: "Feminino", multiplier: 0.1 },
        { property: "idade", operator: ">", value: 19, multiplier: 2.5 },
        { property: "idade", operator: "<", value: 26, multiplier: 1 },
        { property: "idade", operator: ">", value: 40, multiplier: 0.5 }
      ]
    },
    "cicatrizpequena(rosto/braço)": {
      baseWeight: 1,
      rules: [
        { property: "exMilitarDesertor", operator: "==", value: true, multiplier: 15 },
        { property: "protecaoTestemunha", operator: "==", value: true, multiplier: 3 }
      ]
    },
    "dermatiteatópicavisível": {
      baseWeight: 1,
      rules: [
        { property: "demissaoHumilhante", operator: "==", value: true, multiplier: 15 },
        { property: "saberCrimeFamoso", operator: "==", value: true, multiplier: 15 },
        { property: "expulsaGravidez", operator: "==", value: true, multiplier: 5 },
        { property: "ansiedade", operator: "==", value: true, multiplier: 2.5 },
        { property: "climaFrio", operator: "==", value: true, multiplier: 2.5 }
      ]
    },
    "olheirascrônicasmarcadas": {
      baseWeight: 1,
      rules: [
        { property: "falenciaEmpresaFamilia", operator: "==", value: true, multiplier: 10 },
        { property: "vitimaStalker", operator: "==", value: true, multiplier: 10 },
        { property: "abandonadoAltar", operator: "==", value: true, multiplier: 10 },
        { property: "casamentoInteressePaixao", operator: "==", value: true, multiplier: 10 },
        { property: "doouOrgaoVital", operator: "==", value: true, multiplier: 4 }
      ]
    },
    "cabelogrisalhoprematuro": {
      baseWeight: 1,
      rules: [
        { property: "idade", operator: ">", value: 40, multiplier: 0 },
        { property: "guardaIrmaosPrisaoPais", operator: "==", value: true, multiplier: 12 },
        { property: "doouOrgaoVital", operator: "==", value: true, multiplier: 3 }
      ]
    },
    "cicatrizcirúrgicaextensa(flanco/abdômen)": {
      baseWeight: 1,
      rules: [
        { property: "expulsaGravidez", operator: "==", value: true, multiplier: 10 },
        { property: "incestoAbuso", operator: "==", value: true, multiplier: 2.65 },
        { property: "sexo", operator: "==", value: "Feminino", multiplier: 2.65 },
        { property: "comaPosAcidente", operator: "==", value: true, multiplier: 5 },
        { property: "doouOrgaoVital", operator: "==", value: true, multiplier: 10 }
      ]
    },
    "cicatrizesdeacneseveranorosto": {
      baseWeight: 1,
      rules: [
        { property: "idade", operator: "<", value: 27, multiplier: 2.5 }
      ]
    },
    "narizquebrado/torto": {
      baseWeight: 1,
      rules: [
        { property: "exMilitarDesertor", operator: "==", value: true, multiplier: 3 }
      ]
    },
    "tatuagemmilitarcoberta/queimada": {
      baseWeight: 1,
      rules: [
        { property: "idade", operator: "<", value: 19, multiplier: 0 },
        { property: "exMilitarDesertor", operator: "==", value: true, multiplier: 4 },
        { property: "sexo", operator: "==", value: "Feminino", multiplier: 0.3 },
        { property: "idade", operator: ">", value: 18, multiplier: 0.4 },
        { property: "idade", operator: ">", value: 29, multiplier: 2 },
        { property: "idade", operator: ">", value: 39, multiplier: 1.5 },
        { property: "idade", operator: ">", value: 49, multiplier: 1.33 },
        { property: "idade", operator: ">", value: 59, multiplier: 1.25 }
      ]
    },
    "psoríaseemplacas(cotovelos/joelhos)": {
      baseWeight: 1,
      rules: [
        { property: "estresse", operator: "==", value: true, multiplier: 3 }
      ]
    },
    "calvícieandrogenéticaavançada": {
      baseWeight: 1,
      rules: []
    },
    "obesidadegraui": {
      baseWeight: 1,
      rules: [
        { property: "obeso", operator: "==", value: true, multiplier: 4 },
        { property: "massaMagra", operator: "==", value: true, multiplier: 0.25 },
        { property: "doouOrgaoVital", operator: "==", value: true, multiplier: 1.5 }
      ]
    },
    "vitiligogeneralizado": {
      baseWeight: 1,
      rules: []
    },
    "sobrepesovisível": {
      baseWeight: 1,
      rules: [
        { property: "sobrepeso", operator: "==", value: true, multiplier: 2.5 },
        { property: "doouOrgaoVital", operator: "==", value: true, multiplier: 1.5 }
      ]
    },
    "cegueiratotal": {
      baseWeight: 1,
      rules: [
        {
          "property": "glaucoma",
          "operator": "==",
          "value": true,
          "multiplier": 4
        },
        {
          "property": "traumaViolento",
          "operator": "==",
          "value": true,
          "multiplier": 4
        },
        {
          "property": "altaMiopiaDegenerativacomLesoesRetinianas",
          "operator": "==",
          "value": true,
          "multiplier": 10
        }
      ]
    },
    "paralisiacerebralcomespasticidade": {
      baseWeight: 1,
      rules: [
        {
          "property": "idade",
          "operator": "<",
          "value": 12,
          "multiplier": 4
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 11,
          "multiplier": 0.5
        }
      ]
    },
    "teanível1(suporteleve)": {
      baseWeight: 0.009,
      rules: [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 1.5
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 0.6
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 12,
          "multiplier": 2.5
        },
        {
          "property": "caucasiano",
          "operator": "==",
          "value": true,
          "multiplier": 1.2
        }
      ]
    },
    "teanível2(suportesubstancial)": {
      baseWeight: 0.005,
      rules: [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 1.5
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 0.6
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 12,
          "multiplier": 2.5
        },
        {
          "property": "caucasiano",
          "operator": "==",
          "value": true,
          "multiplier": 1.2
        },
        {
          "property": "baixaRenda",
          "operator": "==",
          "value": true,
          "multiplier": 1.4
        },
        {
          "property": "estado",
          "operator": "==",
          "value": "BA",
          "multiplier": 1.3
        }
      ]
    },
    "teanível3(muitosuportesubstancial)": {
      baseWeight: 0.003,
      rules: [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 1.5
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 0.6
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 12,
          "multiplier": 2.5
        },
        {
          "property": "caucasiano",
          "operator": "==",
          "value": true,
          "multiplier": 1.2
        },
        {
          "property": "baixaRenda",
          "operator": "==",
          "value": true,
          "multiplier": 1.5
        },
        {
          "property": "estado",
          "operator": "==",
          "value": "BA",
          "multiplier": 1.3
        }
      ]
    },
    "tetraplegia": {
      baseWeight: 0.05,
      rules: [
        {
          "property": "lesaoTronco",
          "operator": "==",
          "value": true,
          "multiplier": 150
        },
        {
          "property": "mergulhoVelocidade",
          "operator": "==",
          "value": true,
          "multiplier": 20
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 60,
          "multiplier": 1.5
        },
        {
          "property": "transporte",
          "operator": "==",
          "value": "Veículo Próprio (Carro)",
          "multiplier": 1.2
        },
        {
          "property": "violenciaUrbana",
          "operator": "==",
          "value": true,
          "multiplier": 3.5
        },
        {
          "property": "trabalhoArriscado",
          "operator": "==",
          "value": true,
          "multiplier": 2
        }
      ]
    }
  },
  condicoesNaoVisiveis: {
    "tdahgrave(disfunçãoexecutivaehiperfocorotativo)": {
      "name": "TDAH Grave (Disfunção Executiva e Hiperfoco Rotativo)",
      "baseWeight": 0.006,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 18,
          "multiplier": 1.46
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 44,
          "multiplier": 1.17
        },
        {
          "property": "ansiedade",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "estresseCronico",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "historicoFamiliarNeurodivergente",
          "operator": "==",
          "value": true,
          "multiplier": 4.0
        }
      ]
    },
    "tdahmoderado(conscienteediagnosticado)": {
      "name": "TDAH Moderado (Consciente e Diagnosticado)",
      "baseWeight": 0.012,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 18,
          "multiplier": 1.46
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 44,
          "multiplier": 1.17
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Média Alta",
          "multiplier": 1.8
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Elite",
          "multiplier": 1.8
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Baixa Renda",
          "multiplier": 0.3
        }
      ]
    },
    "tdahleve(nãosabequepossui)": {
      "name": "TDAH Leve (Não sabe que possui)",
      "baseWeight": 0.042,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 18,
          "multiplier": 1.46
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 44,
          "multiplier": 1.17
        }
      ]
    },
    "dependênciaquímicaativa": {
      baseWeight: 1,
      rules: [
        { "property": "vicioJogoPerdaCasa", "operator": "==", "value": true, "multiplier": 15 },
        { "property": "incestoAbuso", "operator": "==", "value": true, "multiplier": 10 },
        { "property": "ruinaFinanceira", "operator": "==", "value": true, "multiplier": 5 },
        { "property": "doouOrgaoVital", "operator": "==", "value": true, "multiplier": 2.2 }
      ]
    },
    "depressãoprofunda": {
      baseWeight: 1,
      rules: [
        { "property": "obraArteDestruida", "operator": "==", "value": true, "multiplier": 15 },
        { "property": "falenciaEmpresaFamilia", "operator": "==", "value": true, "multiplier": 15 },
        { "property": "acidenteFatalPedestre", "operator": "==", "value": true, "multiplier": 15 },
        { "property": "filhoFugiu", "operator": "==", "value": true, "multiplier": 10 },
        { "property": "expulsaGravidez", "operator": "==", "value": true, "multiplier": 8 },
        { "property": "ruinaFinanceira", "operator": "==", "value": true, "multiplier": 4 },
        { "property": "doouOrgaoVital", "operator": "==", "value": true, "multiplier": 3 }
      ]
    },
    "sobrecargasensorial": {
      baseWeight: 1,
      rules: []
    },
    "neuropatiatraumaticaposeletricaleve": {
      baseWeight: 0.02,
      rules: [
        {
          "property": "idade",
          "operator": ">=",
          "value": 20,
          "multiplier": 1.5
        },
        {
          "property": "idade",
          "operator": "<=",
          "value": 50,
          "multiplier": 2
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 3
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 0.3
        },
        {
          "property": "braçal",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        }
      ]
    },
    "altamiopiadegenerativacomlesõesretinianas": {
      baseWeight: 1,
      rules: [
        {
          "property": "cegueiraTotal",
          "operator": "==",
          "value": true,
          "multiplier": 99
        }
      ]
    },
    "gastriteleveporestresse": {
      baseWeight: 1,
      rules: [
        {
          "property": "piramideFinanceira",
          "operator": "==",
          "value": true,
          "multiplier": 15
        },
        {
          "property": "segundaFamiliaConjuge",
          "operator": "==",
          "value": true,
          "multiplier": 4.5
        },
        {
          "property": "ruinaFinanceira",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "estresse",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        }
      ]
    },
    "zumbidonoouvido(tinnitus)": {
      baseWeight: 1,
      rules: [
        {
          "property": "profissao",
          "operator": "==",
          "value": "Comerciante na 25 de Março",
          "multiplier": 2.5
        }
      ]
    },
    "ansiedadesituacional": {
      baseWeight: 1,
      rules: [
        {
          "property": "profissao",
          "operator": "==",
          "value": "Comerciante na 25 de Março",
          "multiplier": 2.5
        }
      ]
    },
    "dispepsiafuncional(gastritenervosa)": {
      baseWeight: 1,
      rules: [
        {
          "property": "profissao",
          "operator": "==",
          "value": "Comerciante na 25 de Março",
          "multiplier": 3
        }
      ]
    },
    "câncerdemama(estágioinicial/precoce)": {
      baseWeight: 0.013,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Masculino", "multiplier": 0.01 },
        { "property": "idade", "operator": ">", "value": 50, "multiplier": 2.5 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "negroPardo", "operator": "==", "value": true, "multiplier": 0.7 }
      ]
    },
    "câncerdemama(localmenteavançado)": {
      baseWeight: 0.005,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Masculino", "multiplier": 0.01 },
        { "property": "idade", "operator": ">", "value": 50, "multiplier": 2.5 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "negroPardo", "operator": "==", "value": true, "multiplier": 1.4 }
      ]
    },
    "câncerdemama(metastático/estágioiv)": {
      baseWeight: 0.002,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Masculino", "multiplier": 0.01 },
        { "property": "idade", "operator": ">", "value": 50, "multiplier": 2.5 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "negroPardo", "operator": "==", "value": true, "multiplier": 1.8 }
      ]
    },
    "amputação(dedosoupartedamão)": {
      "name": "Amputação (Dedos ou Parte da Mão)",
      "baseWeight": 1,
      "rules": [
        {
          "property": "perdeuMembroAcidente",
          "operator": "==",
          "value": true,
          "multiplier": 15
        },
        {
          "property": "trabalhoRisco",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "braçal",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "acidenteTransito",
          "operator": "==",
          "value": true,
          "multiplier": 3
        }
      ]
    },
    "câncerdepróstata(estágioinicial)": {
      baseWeight: 0.014,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Feminino", "multiplier": 0 },
        { "property": "idade", "operator": "<", "value": 40, "multiplier": 0.01 },
        { "property": "idade", "operator": ">", "value": 50, "multiplier": 2.5 },
        { "property": "idade", "operator": ">", "value": 65, "multiplier": 2 },
        { "property": "negroPardo", "operator": "==", "value": true, "multiplier": 1.5 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 0.8 }
      ]
    },
    "câncerdepróstata(avançado)": {
      baseWeight: 0.004,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Feminino", "multiplier": 0 },
        { "property": "idade", "operator": "<", "value": 40, "multiplier": 0.01 },
        { "property": "idade", "operator": ">", "value": 50, "multiplier": 2.5 },
        { "property": "idade", "operator": ">", "value": 65, "multiplier": 2 },
        { "property": "negroPardo", "operator": "==", "value": true, "multiplier": 1.8 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 0.8 }
      ]
    },
    "câncerdepróstata(metastático)": {
      baseWeight: 0.002,
      rules: [
        { "property": "sexo", "operator": "==", "value": "Feminino", "multiplier": 0 },
        { "property": "idade", "operator": "<", "value": 40, "multiplier": 0.01 },
        { "property": "idade", "operator": ">", "value": 50, "multiplier": 2.5 },
        { "property": "idade", "operator": ">", "value": 65, "multiplier": 2 },
        { "property": "negroPardo", "operator": "==", "value": true, "multiplier": 2 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 0.8 }
      ]
    },
    "miopialeve": {
      baseWeight: 1,
      rules: [
        {
          "property": "tecnologia",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "miopiaCongenita",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 1.6
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 31,
          "multiplier": 3.5
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 20,
          "multiplier": 0.5714
        },
        {
          "property": "tecnologia",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "corporativo",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "capital",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "estado",
          "operator": "==",
          "value": "SP",
          "multiplier": 2.5
        }
      ]
    },
    "miopialeveamoderada": {
      baseWeight: 1,
      rules: [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 1.6
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 31,
          "multiplier": 3.5
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 20,
          "multiplier": 0.5714
        },
        {
          "property": "tecnologia",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "corporativo",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "capital",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "estado",
          "operator": "==",
          "value": "SP",
          "multiplier": 2.5
        }
      ]
    },
    "altamiopia(acimade6graus)": {
      baseWeight: 0.8,
      rules: [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 1.6
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 31,
          "multiplier": 3.5
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 20,
          "multiplier": 0.5714
        },
        {
          "property": "tecnologia",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "corporativo",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "capital",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "estado",
          "operator": "==",
          "value": "SP",
          "multiplier": 2.5
        }
      ]
    }
  },
  profissoes: {
    "trabalhadordazonafranca": {
      "name": "Trabalhador da Zona Franca",
      "baseWeight": 0.5,
      "rules": [
        {
          "property": "estado",
          "operator": "!=",
          "value": "AM",
          "multiplier": 0.0
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "tier_",
          "multiplier": 4.0
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "interior_",
          "multiplier": 1.0
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 18,
          "multiplier": 0.0
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Elite",
          "multiplier": 0.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Alta",
          "multiplier": 0.7
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Baixa",
          "multiplier": 0.9
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 24,
          "multiplier": 0.99
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 34,
          "multiplier": 0.9
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 24,
          "multiplier": 0.99
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 20,
          "multiplier": 0.96
        }
      ]
    },
    "operadordeempilhadeira": {
      "name": "Operador de Empilhadeira",
      "baseWeight": 1,
      "rules": [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 10
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 0.05
        },
        {
          "property": "idade",
          "operator": ">=",
          "value": 26,
          "multiplier": 4
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 35,
          "multiplier": 0.25
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Baixa Renda",
          "multiplier": 3
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Vulnerável",
          "multiplier": 3
        }
      ]
    },
    "guiaturísticonaamazônia": {
      "name": "Guia Turístico na Amazônia",
      "baseWeight": 0.5,
      "rules": [
        {
          "property": "estado",
          "operator": "==",
          "value": "AM",
          "multiplier": 15.0
        },
        {
          "property": "estado",
          "operator": "!=",
          "value": "AM",
          "multiplier": 0.0
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "tier_",
          "multiplier": 1.35
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "interior_",
          "multiplier": 1.0
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Elite",
          "multiplier": 0.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Base Precarizada",
          "multiplier": 0.75
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Alta",
          "multiplier": 0.90
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Baixa",
          "multiplier": 1.0
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 16,
          "multiplier": 0.0
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 60,
          "multiplier": 0.0
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 25,
          "multiplier": 0.99
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 35,
          "multiplier": 0.90
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 25,
          "multiplier": 0.99
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 20,
          "multiplier": 0.95
        }
      ]
    },
    "vendedorlojista": {
      baseWeight: 1,
      rules: [
        {
          "property": "classe",
          "operator": "==",
          "value": "Classe Média Baixa / A Engrenagem",
          "multiplier": 12
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Baixa Renda / Subsistência",
          "multiplier": 8
        },
        {
          "property": "capital",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "transporte",
          "operator": "==",
          "value": "Público sobre Pneus (Ônibus urbano / Lotação)",
          "multiplier": 2.5
        },
        {
          "property": "braçal",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Sudeste",
          "multiplier": 1.5
        },
        {
          "property": "estresse",
          "operator": "==",
          "value": true,
          "multiplier": 1.5
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Elite / Alta Renda",
          "multiplier": 0.1
        }
      ]
    },
    "auditorcontabil": {
      baseWeight: 1,
      rules: [
        { property: "classe", operator: "includes", value: "Classe Média Alta", multiplier: 3.0 },
        { property: "classe", operator: "includes", value: "Elite", multiplier: 1.5 },
        { property: "escritorio", operator: "==", value: true, multiplier: 5.0 },
        { property: "estresse", operator: "==", value: true, multiplier: 1.5 }
      ]
    },
    "diretorexecutivonapaulista": {
      baseWeight: 1,
      rules: [
        {
          "property": "regiao",
          "operator": "==",
          "value": "Sudeste",
          "multiplier": 10
        },
        {
          "property": "capital",
          "operator": "==",
          "value": true,
          "multiplier": 5
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Elite / Alta Renda",
          "multiplier": 10
        },
        {
          "property": "cargosAltos",
          "operator": "==",
          "value": true,
          "multiplier": 10
        },
        {
          "property": "estresse",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "estado",
          "operator": "!=",
          "value": "SP",
          "multiplier": 0
        }
      ]
    },
    "costureiradefacção(trabalhoinformal)": {
      "name": "Costureira de Facção (Trabalho Informal)",
      "baseWeight": 1,
      "rules": [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 0
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 5
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Base Precarizada / Vulnerável",
          "multiplier": 10
        },
        {
          "property": "braçal",
          "operator": "==",
          "value": true,
          "multiplier": 5
        },
        {
          "property": "periferico",
          "operator": "==",
          "value": true,
          "multiplier": 3
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 1
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 0.95
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gama",
          "multiplier": 1.05
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 1.07
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 0.94
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 0.94
        }
      ]
    },
    "comerciantena25demarço": {
      "name": "Comerciante na 25 de Março",
      "baseWeight": 0.5,
      "rules": [
        {
          "property": "estado",
          "operator": "==",
          "value": "SP",
          "multiplier": 10.0
        },
        {
          "property": "estado",
          "operator": "!=",
          "value": "SP",
          "multiplier": 0.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 9.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 1.0
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "beta",
          "multiplier": 0.0
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "gama",
          "multiplier": 0.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média",
          "multiplier": 3.0
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Elite",
          "multiplier": 1.2
        },
        {
          "property": "classe",
          "operator": "==",
          "value": "Base Precarizada",
          "multiplier": 1.2
        }
      ]
    },
    "agrônomoespecialistaemirrigação": {
      baseWeight: 1,
      rules: [
        { property: "capital", operator: "==", value: false, multiplier: 2.0 },
        { property: "regiao", operator: "==", value: "Centro-Oeste", multiplier: 2.5 },
        { property: "regiao", operator: "==", value: "Sul", multiplier: 2.0 },
        { property: "classe", operator: "includes", value: "Elite", multiplier: 2.0 },
        { property: "classe", operator: "includes", value: "Classe Média Alta", multiplier: 1.5 }
      ]
    },
    "barãodasoja": {
      "name": "Barão da Soja",
      "baseWeight": 0.1,
      "rules": [
        {
          "property": "regiao",
          "operator": "==",
          "value": "Centro-Oeste",
          "multiplier": 15.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Elite",
          "multiplier": 5.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 3.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 2.0
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "tier_",
          "multiplier": 0.0
        }
      ]
    },
    "frentista": {
      "name": "Frentista",
      "baseWeight": 1.0,
      "rules": [
        {
          "property": "sexo",
          "operator": "==",
          "value": "Masculino",
          "multiplier": 2.5
        },
        {
          "property": "sexo",
          "operator": "==",
          "value": "Feminino",
          "multiplier": 0.2
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Sudeste",
          "multiplier": 2.0
        },
        {
          "property": "estado",
          "operator": "==",
          "value": "SP",
          "multiplier": 1.5
        },
        {
          "property": "tierMetropole",
          "operator": "includes",
          "value": "tier_",
          "multiplier": 1.5
        },
        {
          "property": "escolaridade",
          "operator": "==",
          "value": "Ensino Médio",
          "multiplier": 2.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Elite",
          "multiplier": 0.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Alta",
          "multiplier": 0.0
        },
        {
          "property": "idade",
          "operator": "==",
          "value": 33,
          "multiplier": 3.0
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 33,
          "multiplier": 0.95
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 45,
          "multiplier": 0.5
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 33,
          "multiplier": 0.95
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 22,
          "multiplier": 0.7
        }
      ]
    }
  },
  shinies: {
    "recebeuumafortunadeherançadeumcompletodesconhecido": {
      "name": "Recebeu uma fortuna de herança de um completo desconhecido",
      "baseWeight": 1,
      "rules": []
    },
    "ganhouamega-senaeperdeutudoem2anos": {
      baseWeight: 1,
      rules: [
        { "property": "idade", "operator": "<=", "value": 25, "multiplier": 0 }
      ]
    },
    "podereinfluência": {
      baseWeight: 1,
      rules: [
        { "property": "classe", "operator": "includes", "value": "Elite", "multiplier": 2 }
      ]
    },
    "traumagrave": {
      baseWeight: 1,
      rules: [
        { property: "zonaRuralRemota", operator: "==", value: true, multiplier: 3 }
      ]
    },
    "endemiarural": {
      baseWeight: 1,
      rules: [
        { property: "zonaRuralRemota", operator: "==", value: true, multiplier: 3 }
      ]
    },
    "viverelaçãoincestuosacommãe": {
      baseWeight: 1,
      rules: [
        {
          "property": "idade",
          "operator": "<",
          "value": 16,
          "multiplier": 0
        }
      ]
    },
    "perdeuaseconomiasdeumavidainteiraemumesquemadepirâmidefinanceira": {
      baseWeight: 1,
      rules: [
        {
          "property": "piramideFinanceira",
          "operator": "==",
          "value": true,
          "multiplier": 99
        },
        {
          "property": "gastriteLevePorEstresse",
          "operator": "==",
          "value": true,
          "multiplier": 2
        }
      ]
    },
    "encontrouumamalacheiadedinheirosujoevivefugindodosverdadeirosdonos": {
      baseWeight: 1,
      rules: [
        {
          "property": "profissao",
          "operator": "==",
          "value": "Comerciante na 25 de Março",
          "multiplier": 4
        }
      ]
    },
    "vivesobopesodesaberquemcometeuumcrimefamoso": {
      baseWeight: 1.0,
      rules: [
        {
          "property": "profissao",
          "operator": "==",
          "value": "Comerciante na 25 de Março",
          "multiplier": 3.5
        }
      ]
    },
    "faliuumaempresacentenáriaedeixoutodosnamiséria": {
      baseWeight: 1,
      rules: [
        {
          "property": "profissao",
          "operator": "==",
          "value": "Comerciante na 25 de Março",
          "multiplier": 3
        }
      ]
    },
    "cuidadospaliativoscâncerdemama": {
      baseWeight: 1.0,
      rules: [
        { "property": "cancerMamaMetastatico", "operator": "!=", "value": true, "multiplier": 0.0 }
      ]
    },
    "remissãomilagrosacâncerdemama": {
      baseWeight: 0.001,
      rules: [
        { "property": "cancerMamaMetastatico", "operator": "!=", "value": true, "multiplier": 0.0 }
      ]
    },
    "dooutodooseupatrimônioparaumaorganizaçãoqueserevelouumafarsa": {
      "name": "Doou todo o seu patrimônio para uma organização que se revelou uma farsa",
      "baseWeight": 1,
      "rules": [
        { "property": "idade", "operator": "<=", "value": 25, "multiplier": 0 },
        { "property": "altruista", "operator": "==", "value": true, "multiplier": 3 },
        { "property": "isolamentoTotal", "operator": "==", "value": true, "multiplier": 2 }
      ]
    },
    "cuidadospaliativoscâncerdepróstata": {
      baseWeight: 1.0,
      rules: [
        { "property": "cancerProstataMetastatico", "operator": "!=", "value": true, "multiplier": 0.0 }
      ]
    },
    "remissãomilagrosacâncerdepróstata": {
      baseWeight: 0.001,
      rules: [
        { "property": "cancerProstataMetastatico", "operator": "!=", "value": true, "multiplier": 0.0 }
      ]
    }
  },
  contexto: {
    "zonarural/remota": {
      baseWeight: 1,
      rules: [
        { "property": "setor", "operator": "==", "value": "agro", "multiplier": 1.3 }
      ]
    },
    "estresse": {
      baseWeight: 1,
      rules: [
        { property: "profissao", operator: "==", value: "Agrônomo Especialista em Irrigação", multiplier: 1.4 },
        { property: "profissao", operator: "==", value: "Barão da Soja", multiplier: 1.4 },
        { property: "classe", operator: "includes", value: "Elite", multiplier: 1.2 },
        { property: "classe", operator: "includes", value: "Classe Média Alta", multiplier: 1.2 }
      ]
    },
    "ansiedade": {
      baseWeight: 1,
      rules: [
        { property: "profissao", operator: "==", value: "Agrônomo Especialista em Irrigação", multiplier: 1.3 },
        { property: "profissao", operator: "==", value: "Barão da Soja", multiplier: 1.3 },
        { property: "classe", operator: "includes", value: "Elite", multiplier: 1.2 },
        { property: "classe", operator: "includes", value: "Classe Média Alta", multiplier: 1.2 }
      ]
    },
    "trabalhobraçal": {
      baseWeight: 1,
      rules: [
        { property: "profissao", operator: "includes", value: "agrícola", multiplier: 2 }
      ]
    },
    "setoragro": {
      baseWeight: 1,
      rules: [
        { "property": "profissao", "operator": "includes", "value": "Soja", "multiplier": 2 }
      ]
    },
    "cargosaltos": {
      baseWeight: 1,
      rules: [
        { "property": "classe", "operator": "==", "value": "Elite", "multiplier": 2 }
      ]
    }
  },
  tribosUrbanas: {
    "cidadãodebem/padrão": {
      baseWeight: 2,
      rules: []
    }
  },
  papeisRelacionais: {
    "irmão/irmã": { "name": "Irmão/Irmã", "baseWeight": 1, "rules": [] },
    "amigo(a)": { "name": "Amigo(a)", "baseWeight": 1, "rules": [] },
    "ex-cônjuge": {
      "name": "Ex-Cônjuge",
      "baseWeight": 1,
      "rules": [
        { "property": "idade", "operator": "<", "value": 18, "multiplier": 0 },
        { "property": "idade", "operator": ">=", "value": 30, "multiplier": 1.5 }
      ]
    },
    "colegadetrabalho": {
      "name": "Colega de Trabalho",
      "baseWeight": 1,
      "rules": [
        { "property": "idade", "operator": "<", "value": 14, "multiplier": 0 }
      ]
    },
    "mentor(a)": { "name": "Mentor(a)", "baseWeight": 1, "rules": [] },
    "inimigo(a)": { "name": "Inimigo(a)", "baseWeight": 1, "rules": [] },
    "filho(a)": {
      "name": "Filho(a)",
      "baseWeight": 1,
      "rules": [
        { "property": "idade", "operator": "<", "value": 14, "multiplier": 0 },
        { "property": "idade", "operator": ">=", "value": 25, "multiplier": 1.5 }
      ]
    }
  },
  fetiches: {},
  temperamento: {},
  resiliencia: {},
  corpo: {},
  rastro: {
    "listadedividasnoblocodenotasdocelular": {
      "name": "Lista de dívidas no bloco de notas do celular",
      "baseWeight": 1.0,
      "rules": [
        {
          "property": "idade",
          "operator": ">=",
          "value": 25,
          "multiplier": 3.0
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 0.33
        },
        {
          "property": "traicaoSocioDivida",
          "operator": "==",
          "value": true,
          "multiplier": 1.15
        },
        {
          "property": "ruinaFinanceira",
          "operator": "==",
          "value": true,
          "multiplier": 1.15
        },
        {
          "property": "falenciaEmpresaFamilia",
          "operator": "==",
          "value": true,
          "multiplier": 1.15
        }
      ]
    },
    "abaanonimapesquisandopassagensaereasbaratas": {
      "name": "Aba anônima pesquisando passagens aéreas baratas",
      "baseWeight": 1.0,
      "rules": [
        {
          "property": "idade",
          "operator": ">=",
          "value": 25,
          "multiplier": 3.0
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 0.33
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Elite",
          "multiplier": 0.0
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Alta",
          "multiplier": 1.05
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Classe Média Baixa",
          "multiplier": 1.10
        },
        {
          "property": "classe",
          "operator": "includes",
          "value": "Base Precarizada",
          "multiplier": 1.15
        },
        {
          "property": "traicaoSocioDivida",
          "operator": "==",
          "value": true,
          "multiplier": 1.15
        },
        {
          "property": "ruinaFinanceira",
          "operator": "==",
          "value": true,
          "multiplier": 1.15
        },
        {
          "property": "falenciaEmpresaFamilia",
          "operator": "==",
          "value": true,
          "multiplier": 1.15
        }
      ]
    },
    "encaminhoucorrentenogrupodafamíliaesaiuoffline": {
      "name": "Encaminhou corrente no grupo da família e saiu offline",
      "baseWeight": 0.1,
      "rules": [
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 40.0
        },
        {
          "property": "triboUrbana",
          "operator": "includes",
          "value": "Cidadão de Bem",
          "multiplier": 1.25
        },
        {
          "property": "triboUrbana",
          "operator": "includes",
          "value": "Conservador",
          "multiplier": 1.25
        },
        {
          "property": "triboUrbana",
          "operator": "includes",
          "value": "Anarcopunk",
          "multiplier": 1.25
        }
      ]
    },
    "fotodeperfildowhatsappdesfocadatiradadebaixoparacima": {
      "name": "Foto de perfil do WhatsApp desfocada tirada de baixo para cima",
      "baseWeight": 0.3,
      "rules": [
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 15
        }
      ]
    },
    "comentárioemcaixaaltanofacebookreclamandodoclima": {
      "name": "Comentário em caixa alta no Facebook reclamando do clima",
      "baseWeight": 0.05,
      "rules": [
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 80
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Norte",
          "multiplier": 1.2
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Nordeste",
          "multiplier": 1.2
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Sul",
          "multiplier": 1.2
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Sudeste",
          "multiplier": 0.85
        },
        {
          "property": "regiao",
          "operator": "==",
          "value": "Centro-Oeste",
          "multiplier": 0.85
        },
        {
          "property": "vitiligoGeneralizado",
          "operator": "==",
          "value": true,
          "multiplier": 1.35
        }
      ]
    },
    "pesquisaansiosanogooglesobresintomasfísicos": {
      "name": "Pesquisa ansiosa no Google sobre sintomas físicos",
      "baseWeight": 1,
      "rules": [
        {
          "property": "idade",
          "operator": ">=",
          "value": 25,
          "multiplier": 3.5
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 0.29
        },
        {
          "property": "ansiedade",
          "operator": "==",
          "value": true,
          "multiplier": 2
        },
        {
          "property": "estresseHard",
          "operator": "==",
          "value": true,
          "multiplier": 1.5
        }
      ]
    },
    "históricodebuscas:'comosabersetenhotdah'": {
      "name": "Histórico de buscas: 'como saber se tenho TDAH'",
      "baseWeight": 0.2,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 25,
          "multiplier": 15
        },
        {
          "property": "tdahLeve",
          "operator": "==",
          "value": true,
          "multiplier": 45
        }
      ]
    },
    "contasecundárianoinstagramfechadaapenaspara3amigos": {
      "name": "Conta secundária no Instagram fechada apenas para 3 amigos",
      "baseWeight": 0.05,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 25,
          "multiplier": 60
        },
        {
          "property": "ansiedade",
          "operator": "==",
          "value": true,
          "multiplier": 1.4
        },
        {
          "property": "fobiaSocial",
          "operator": "==",
          "value": true,
          "multiplier": 1.4
        }
      ]
    },
    "rascunhodevídeonotiktoknuncapostado": {
      "name": "Rascunho de vídeo no TikTok nunca postado",
      "baseWeight": 0.1,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 25,
          "multiplier": 30
        }
      ]
    },
    "áudiodechoroapagadonowhatsapp": {
      "name": "Áudio de choro apagado no WhatsApp",
      "baseWeight": 0.1,
      "rules": [
        {
          "property": "idade",
          "operator": "<",
          "value": 25,
          "multiplier": 35
        }
      ]
    },
    "áudiode5minutosenviadoporengano": {
      "name": "Áudio de 5 minutos enviado por engano",
      "baseWeight": 0.3,
      "rules": [
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 13.33
        }
      ]
    },
    "fotodepôrdosolsemlegendanoinstagram": {
      "name": "Foto de pôr do sol sem legenda no Instagram",
      "baseWeight": 0.5,
      "rules": [
        {
          "property": "idade",
          "operator": ">=",
          "value": 25,
          "multiplier": 6
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 0.17
        }
      ]
    },
    "textodedesabafonolinkedinapagadoantesdeenviar": {
      "name": "Texto de desabafo no LinkedIn apagado antes de enviar",
      "baseWeight": 0.1,
      "rules": [
        { "property": "idade", "operator": ">=", "value": 25, "multiplier": 6.324555 },
        { "property": "idade", "operator": "<=", "value": 40, "multiplier": 6.324555 }
      ]
    },
    "últimotweetdemadrugada": {
      "name": "Último tweet de madrugada",
      "baseWeight": 1,
      "rules": [
        { "property": "idade", "operator": "<", "value": 25, "multiplier": 4.0 },
        { "property": "idade", "operator": ">", "value": 24, "multiplier": 0.1 }
      ]
    },
    "buscanoyoutube:'comolimparcelulartravando'": {
      "name": "Busca no YouTube: 'como limpar celular travando'",
      "baseWeight": 1,
      rules: [
        {
          "property": "idade",
          "operator": ">",
          "value": 40,
          "multiplier": 4
        },
        {
          "property": "idade",
          "operator": "<",
          "value": 41,
          "multiplier": 0.2
        }
      ]
    }
  },
  libido: {},
  sexo: {},
  identidadeGenero: {},
  termoIdentidade: {},
  orientacao: {},
  logistica: {
    "mobilidadeativaapebicicleta": {
      "name": "Mobilidade Ativa (A pé / Bicicleta)",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "interior_gama", "multiplier": 2.5 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_beta", "multiplier": 1.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe E (Extrema Pobreza)", "multiplier": 3.0 },
        { "property": "classeSocial", "operator": "includes", "value": "Base Precarizada", "multiplier": 1.5 },
        { "property": "etnia", "operator": "==", "value": "Indígena", "multiplier": 2.0 },
        { "property": "locomocaoComprometida", "operator": "==", "value": true, "multiplier": 0.0 }
      ]
    },
    "coletivodemassametrotrembrt": {
      "name": "Coletivo de Massa (Metrô / Trem / BRT)",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "tier_alfa", "multiplier": 2.5 },
        { "property": "tierMetropole", "operator": "==", "value": "tier_beta", "multiplier": 1.5 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_alfa", "multiplier": 0.8 },
        { "property": "tierMetropole", "operator": "==", "value": "tier_gama", "multiplier": 0.0 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_beta", "multiplier": 0.0 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_gama", "multiplier": 0.0 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Baixa", "multiplier": 2.0 },
        { "property": "classeSocial", "operator": "includes", "value": "Base Precarizada", "multiplier": 1.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Elite", "multiplier": 0.1 },
        { "property": "etnia", "operator": "==", "value": "Parda", "multiplier": 1.2 },
        { "property": "etnia", "operator": "==", "value": "Preta", "multiplier": 1.2 }
      ]
    },
    "publicosobrepneusonibusurbanolotacao": {
      "name": "Público sobre Pneus (Ônibus urbano / Lotação)",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "tier_gama", "multiplier": 2.5 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_beta", "multiplier": 2.0 },
        { "property": "tierMetropole", "operator": "==", "value": "tier_beta", "multiplier": 2.0 },
        { "property": "classeSocial", "operator": "includes", "value": "Base Precarizada", "multiplier": 2.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Baixa", "multiplier": 2.0 },
        { "property": "classeSocial", "operator": "includes", "value": "Elite", "multiplier": 0.1 }
      ]
    },
    "transportesobdemandaapptaxi": {
      "name": "Transporte Sob Demanda (App / Táxi)",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "tier_alfa", "multiplier": 2.5 },
        { "property": "tierMetropole", "operator": "==", "value": "tier_beta", "multiplier": 1.5 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_gama", "multiplier": 0.2 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Alta", "multiplier": 2.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Elite", "multiplier": 1.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe E (Extrema Pobreza)", "multiplier": 0.0 }
      ]
    },
    "fretadocorporativoindustrial": {
      "name": "Fretado Corporativo / Industrial",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "interior_alfa", "multiplier": 3.0 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_beta", "multiplier": 1.5 },
        { "property": "tierMetropole", "operator": "==", "value": "tier_alfa", "multiplier": 1.2 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Baixa", "multiplier": 2.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Alta", "multiplier": 1.2 }
      ]
    },
    "veiculopropriomotocicleta": {
      "name": "Veículo Próprio (Motocicleta)",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "interior_gama", "multiplier": 3.0 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_beta", "multiplier": 2.5 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 2.0 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 1.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Base Precarizada", "multiplier": 2.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Baixa", "multiplier": 1.8 },
        { "property": "classeSocial", "operator": "includes", "value": "Elite", "multiplier": 0.2 }
      ]
    },
    "veiculopropriocarro": {
      "name": "Veículo Próprio (Carro)",
      "baseWeight": 1.0,
      "rules": [
        { "property": "tierMetropole", "operator": "==", "value": "interior_alfa", "multiplier": 2.0 },
        { "property": "tierMetropole", "operator": "==", "value": "tier_beta", "multiplier": 1.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Elite", "multiplier": 3.0 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe Média Alta", "multiplier": 2.5 },
        { "property": "classeSocial", "operator": "includes", "value": "Base Precarizada", "multiplier": 0.1 },
        { "property": "classeSocial", "operator": "includes", "value": "Classe E (Extrema Pobreza)", "multiplier": 0.0 },
        { "property": "etnia", "operator": "==", "value": "Branca", "multiplier": 1.5 }
      ]
    }
  },
  relacional: {
    "relnegativo:distanciamentoporausênciacrônicaealtoestressenotrabalho": {
      "name": "Rel Negativo: Distanciamento por ausência crônica e alto estresse no trabalho",
      "baseWeight": 0.5,
      "rules": [
        {
          "property": "profissao",
          "operator": "includes",
          "value": "CEO",
          "multiplier": 3
        },
        {
          "property": "profissao",
          "operator": "includes",
          "value": "Faria",
          "multiplier": 3
        },
        {
          "property": "profissao",
          "operator": "includes",
          "value": "Investment Banker",
          "multiplier": 3
        },
        {
          "property": "profissao",
          "operator": "includes",
          "value": "Diretor",
          "multiplier": 3
        },
        {
          "property": "profissao",
          "operator": "includes",
          "value": "Médico Clínico",
          "multiplier": 3
        },
        {
          "property": "profissao",
          "operator": "includes",
          "value": "Motorista de Aplicativo",
          "multiplier": 3
        },
        {
          "property": "estresseHard",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "corporativoEstresse",
          "operator": "==",
          "value": true,
          "multiplier": 1.5
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 1.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 0.92
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gamma",
          "multiplier": 0.7
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 0.95
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 0.88
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gamma",
          "multiplier": 0.5
        }
      ]
    },
    "paifalecido": {
      baseWeight: 0.25,
      rules: [
        {
          "property": "sobreviventeDesastre",
          "operator": "==",
          "value": true,
          "multiplier": 400
        },
        {
          "property": "doouOrgaoVital",
          "operator": "==",
          "value": true,
          "multiplier": 2.5
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 70,
          "multiplier": 3
        },
        {
          "property": "idade",
          "operator": ">",
          "value": 85,
          "multiplier": 8
        },
        {
          "property": "violenciaUrbana",
          "operator": "==",
          "value": true,
          "multiplier": 1.5
        }
      ]
    }
  },
  etnia: {
    "branca": {
      "name": "Branca",
      "baseWeight": 4.0,
      "rules": [
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 2.5 },
        { "property": "estado", "operator": "==", "value": "SP", "multiplier": 1.5 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Centro-Oeste", "multiplier": 0.8 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 0.4 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.3 }
      ]
    },
    "parda": {
      "name": "Parda",
      "baseWeight": 4.5,
      "rules": [
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 1.5 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 1.4 },
        { "property": "regiao", "operator": "==", "value": "Centro-Oeste", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 0.8 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 0.4 }
      ]
    },
    "preta": {
      "name": "Preta",
      "baseWeight": 1.0,
      "rules": [
        { "property": "estado", "operator": "==", "value": "BA", "multiplier": 3.0 },
        { "property": "estado", "operator": "==", "value": "MA", "multiplier": 2.0 },
        { "property": "estado", "operator": "==", "value": "RJ", "multiplier": 1.5 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 1.3 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 1.1 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.8 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 0.3 }
      ]
    },
    "amarela": {
      "name": "Amarela",
      "baseWeight": 0.2,
      "rules": [
        { "property": "estado", "operator": "==", "value": "SP", "multiplier": 3.0 },
        { "property": "estado", "operator": "==", "value": "PR", "multiplier": 2.0 },
        { "property": "estado", "operator": "==", "value": "MS", "multiplier": 1.5 },
        { "property": "estado", "operator": "==", "value": "PA", "multiplier": 1.2 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 0.3 },
        { "property": "regiao", "operator": "==", "value": "Nordeste", "multiplier": 0.2 }
      ]
    },
    "indigena": {
      "name": "Indígena",
      "baseWeight": 0.3,
      "rules": [
        { "property": "estado", "operator": "==", "value": "RR", "multiplier": 6.0 },
        { "property": "estado", "operator": "==", "value": "AM", "multiplier": 5.0 },
        { "property": "tierMetropole", "operator": "==", "value": "interior_gama", "multiplier": 3.0 },
        { "property": "regiao", "operator": "==", "value": "Norte", "multiplier": 2.5 },
        { "property": "regiao", "operator": "==", "value": "Centro-Oeste", "multiplier": 1.5 },
        { "property": "regiao", "operator": "==", "value": "Sudeste", "multiplier": 0.2 },
        { "property": "regiao", "operator": "==", "value": "Sul", "multiplier": 0.1 },
        { "property": "zonaRuralRemota", "operator": "==", "value": true, "multiplier": 3.0 }
      ]
    }
  },
  filhos: {},
  classeSocial: {
    "baseprecarizadavulneravel": {
      "name": "Base Precarizada / Vulnerável",
      "baseWeight": 3.0,
      "rules": [
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 1.8
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 0.8
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 1.5
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 1.2
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gama",
          "multiplier": 1.8
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 1.5
        },
        { "property": "etnia", "operator": "==", "value": "Indígena", "multiplier": 2.5 },
        { "property": "etnia", "operator": "==", "value": "Preta", "multiplier": 1.8 },
        { "property": "etnia", "operator": "==", "value": "Parda", "multiplier": 1.5 },
        { "property": "etnia", "operator": "==", "value": "Branca", "multiplier": 0.5 },
        { "property": "etnia", "operator": "==", "value": "Amarela", "multiplier": 0.4 }
      ]
    },
    "classeeextremapobreza": {
      "name": "Classe E (Extrema Pobreza)",
      "baseWeight": 1.0,
      "rules": [
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 0.8
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 0.4
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 1.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 1.2
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gama",
          "multiplier": 2.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 3.5
        },
        { "property": "etnia", "operator": "==", "value": "Indígena", "multiplier": 2.5 },
        { "property": "etnia", "operator": "==", "value": "Preta", "multiplier": 1.8 },
        { "property": "etnia", "operator": "==", "value": "Parda", "multiplier": 1.5 },
        { "property": "etnia", "operator": "==", "value": "Branca", "multiplier": 0.5 },
        { "property": "etnia", "operator": "==", "value": "Amarela", "multiplier": 0.4 }
      ]
    },
    "elitealtarenda": {
      "name": "Elite / Alta Renda",
      "baseWeight": 1.0,
      "rules": [
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 3.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 2.5
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 1.5
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 1.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gama",
          "multiplier": 0.5
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 0.1
        },
        {
          "property": "exMilitarDesertor",
          "operator": "==",
          "value": true,
          "multiplier": 0.0
        },
        { "property": "etnia", "operator": "==", "value": "Branca", "multiplier": 1.8 },
        { "property": "etnia", "operator": "==", "value": "Amarela", "multiplier": 1.8 },
        { "property": "etnia", "operator": "==", "value": "Parda", "multiplier": 0.6 },
        { "property": "etnia", "operator": "==", "value": "Preta", "multiplier": 0.4 },
        { "property": "etnia", "operator": "==", "value": "Indígena", "multiplier": 0.2 }
      ]
    },
    "classemediabaixaaengrenagem": {
      "name": "Classe Média Baixa / A Engrenagem",
      "baseWeight": 4.0,
      "rules": [
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 1.2
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 1.2
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 1.1
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 1.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gama",
          "multiplier": 0.8
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 0.5
        },
        { "property": "etnia", "operator": "==", "value": "Parda", "multiplier": 1.2 },
        { "property": "etnia", "operator": "==", "value": "Branca", "multiplier": 1.0 },
        { "property": "etnia", "operator": "==", "value": "Preta", "multiplier": 0.9 },
        { "property": "etnia", "operator": "==", "value": "Amarela", "multiplier": 0.8 },
        { "property": "etnia", "operator": "==", "value": "Indígena", "multiplier": 0.6 }
      ]
    },
    "classemediaaltaestabilidade": {
      "name": "Classe Média Alta / Estabilidade",
      "baseWeight": 2.0,
      "rules": [
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_alfa",
          "multiplier": 2.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_alfa",
          "multiplier": 1.8
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_beta",
          "multiplier": 1.2
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_beta",
          "multiplier": 1.0
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "tier_gama",
          "multiplier": 0.6
        },
        {
          "property": "tierMetropole",
          "operator": "==",
          "value": "interior_gama",
          "multiplier": 0.2
        },
        { "property": "etnia", "operator": "==", "value": "Branca", "multiplier": 1.8 },
        { "property": "etnia", "operator": "==", "value": "Amarela", "multiplier": 1.8 },
        { "property": "etnia", "operator": "==", "value": "Parda", "multiplier": 0.6 },
        { "property": "etnia", "operator": "==", "value": "Preta", "multiplier": 0.4 },
        { "property": "etnia", "operator": "==", "value": "Indígena", "multiplier": 0.2 }
      ]
    }
  }
};
