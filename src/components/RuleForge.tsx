import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Download, 
  ClipboardCopy, 
  Database, 
  Settings2, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Code,
  Search,
  Upload,
  FileJson
} from 'lucide-react';
import { 
  NIVEIS_V, 
  NIVEIS_NV, 
  OP_TRIBO, 
  FETICHES_DATA 
} from '../rules/conditions';
import { 
  SHINY_EVENTS, 
  PROFISSOES_CATEGORIZADAS, 
  PROFISSOES_REGIONAIS, 
  ILICITO_UNIVERSAL,
  OP_RES,
  OP_TEMPERAMENTO,
  OP_CORPO,
  OP_RASTRO,
  OP_LIBIDO,
  OP_LOGISTICA_TRANSPORTE,
  RELACOES_TEXTOS,
  FILHOS_TEXTOS
} from '../data/staticData';
import { ConditionContext } from '../types/character';
import { RULES_REGISTRY, RegistryItem, RuleModifier } from '../data/rulesRegistry';

interface Rule {
  id: string;
  property: string;
  operator: '==' | '!=' | '>' | '<' | 'includes';
  value: string | number | boolean;
  multiplier: number;
}

export const CATEGORIES = [
  { id: 'condicoesVisiveis', label: 'Doenças Visíveis', data: NIVEIS_V },
  { id: 'condicoesNaoVisiveis', label: 'Doenças Não Visíveis', data: NIVEIS_NV },
  { id: 'shinies', label: 'Eventos Shiny', data: SHINY_EVENTS },
  { id: 'profissoes', label: 'Profissões', data: { ...PROFISSOES_CATEGORIZADAS, ...PROFISSOES_REGIONAIS, ...ILICITO_UNIVERSAL } },
  { id: 'tribosUrbanas', label: 'Tribos Urbanas', data: OP_TRIBO },
  { id: 'fetiches', label: 'Fetiches', data: FETICHES_DATA },
  { id: 'papeisRelacionais', label: 'Papéis Relacionais', data: ["Irmão/Irmã", "Amigo(a)", "Ex-Cônjuge", "Colega de Trabalho", "Mentor(a)", "Inimigo(a)", "Filho(a)"] },
  { id: 'resiliencia', label: 'Resiliência', data: { all: OP_RES } },
  { id: 'temperamento', label: 'Temperamento', data: { all: OP_TEMPERAMENTO } },
  { id: 'corpo', label: 'Tipo de Corpo', data: { all: OP_CORPO } },
  { id: 'rastro', label: 'Rastro Digital', data: OP_RASTRO },
  { id: 'libido', label: 'Libido/Estilo', data: OP_LIBIDO },
  { id: 'sexo', label: 'Sexo Biológico', data: { all: [{ name: 'Masculino' }, { name: 'Feminino' }] } },
  { id: 'identidadeGenero', label: 'Identidade de Gênero', data: { all: [{ name: 'Homem' }, { name: 'Mulher' }, { name: 'Não-Binário' }] } },
  { id: 'termoIdentidade', label: 'Termos de Identidade', data: { all: [{ name: 'Cisgênero' }, { name: 'Transgênero' }, { name: 'Transexual' }, { name: 'Não-Binário' }] } },
  { id: 'orientacao', label: 'Orientação Sexual', data: { all: [{ name: 'Heterossexual' }, { name: 'Homossexual' }, { name: 'Bissexual' }, { name: 'Assexual' }, { name: 'Pansexual' }, { name: 'Demissexual' }] } },
  { id: 'contexto', label: 'Contexto e Geografia', data: { 
    all: [
      { name: "Zona Rural/Remota" },
      { name: "Trabalho Braçal" },
      { name: "Setor Agro" },
      { name: "Cargos Altos" },
      { name: "Ansiedade" },
      { name: "Estresse" },
      { name: "Trabalha" },
      { name: "Estuda" },
      { name: "Estágio" },
      { name: "Capital" },
      { name: "Interior" },
      { name: "Sul" },
      { name: "Norte" },
      { name: "Nordeste" },
      { name: "Sudeste" },
      { name: "Centro-Oeste" },
      { name: "Preta/Parda" },
      { name: "Branca" },
      { name: "Amarela" },
      { name: "Indígena" }
    ] 
  } },
  { id: 'logistica', label: 'Logística', data: { all: OP_LOGISTICA_TRANSPORTE.map(t => ({ name: t })) } },
  { id: 'relacional', label: 'Bagagem Relacional', data: { all: Array.from(new Set([
    "Pai Vivo", "Pai Falecido", "Mãe Viva", "Mãe Falecida",
    "Relacionamento: Positivo", "Relacionamento: Neutro", "Relacionamento: Negativo",
    ...RELACOES_TEXTOS.Positivo.map(t => `Rel Positivo: ${t}`),
    ...RELACOES_TEXTOS.Neutro.map(t => `Rel Neutro: ${t}`),
    ...RELACOES_TEXTOS.Negativo.map(t => `Rel Negativo: ${t}`),
    ...Object.values(RULES_REGISTRY['relacional'] || {}).filter(i => i.name).map(i => i.name!)
  ])).map(name => ({ name })) } },
  { id: 'filhos', label: 'Dinâmica de Filhos', data: { all: [
    { name: "Filho: Criança" }, { name: "Filho: Adolescente" }, { name: "Filho: Adulto" },
    ...Object.entries(FILHOS_TEXTOS).flatMap(([age, qualities]) => 
      Object.entries(qualities as Record<string, string[]>).flatMap(([quality, texts]) => 
        texts.map(t => ({ name: `Filho ${age} (${quality}): ${t}` }))
      )
    )
  ] } },
];

const PROPERTIES = [
  // --- IDENTIDADE & BÁSICOS ---
  { value: 'idade', label: 'Idade (number)' },
  { value: 'sexo', label: 'Sexo Biológico (string)' },
  { value: 'orientacao', label: 'Orientação Sexual (string)' },
  { value: 'classe', label: 'Classe Social (string)' },
  { value: 'regiao', label: 'Região (string)' },
  { value: 'estado', label: 'Estado/UF (string)' },
  { value: 'identidadeGenero', label: 'Identidade de Gênero (string)' },
  { value: 'termoIdentidade', label: 'Termo de Identidade (string)' },
  { value: 'transgenero', label: 'Transgênero (boolean)' },
  { value: 'gayCis', label: 'Gay Cis (boolean)' },
  { value: 'negroPardo', label: 'Negro ou Pardo (boolean)' },
  { value: 'caucasiano', label: 'Caucasiano (boolean)' },
  { value: 'peleClara', label: 'Pele Clara (boolean)' },
  { value: 'idoso', label: 'Idoso (boolean)' },

  // --- SOCIOECONÔMICO & TRABALHO ---
  { value: 'profissao', label: 'Profissão (string)' },
  { value: 'setor', label: 'Setor Ocupacional (string)' },
  { value: 'trabalha', label: 'Trabalha (boolean)' },
  { value: 'estuda', label: 'Estuda (boolean)' },
  { value: 'estagio', label: 'Estágio (boolean)' },
  { value: 'aposentado', label: 'Aposentado (boolean)' },
  { value: 'desempregado', label: 'Desempregado (boolean)' },
  { value: 'desempregoLongo', label: 'Desemprego Longo (boolean)' },
  { value: 'remoto', label: 'Trabalho Remoto (boolean)' },
  { value: 'cargosAltos', label: 'Cargos Altos/Liderança (boolean)' },
  { value: 'corporativo', label: 'Ambiente Corporativo (boolean)' },
  { value: 'braçal', label: 'Trabalho Braçal (boolean)' },
  { value: 'trabalhoRisco', label: 'Trabalho de Risco (boolean)' },
  { value: 'trabalhoBarulhento', label: 'Trabalho Barulhento (boolean)' },
  { value: 'turnosNoturnos', label: 'Turnos Noturnos (boolean)' },
  { value: 'baixaRenda', label: 'Baixa Renda (boolean)' },
  { value: 'vulneravel', label: 'Vulnerável (boolean)' },
  { value: 'marginalizado', label: 'Marginalizado (boolean)' },
  { value: 'moradorRua', label: 'Morador de Rua (boolean)' },

  // --- GEOGRAFIA & ESTILO DE VIDA ---
  { value: 'capital', label: 'Mora em Capital (boolean)' },
  { value: 'zonaRuralRemota', label: 'Zona Rural/Remota (boolean)' },
  { value: 'transporte', label: 'Tipo de Transporte (string)' },
  { value: 'habitacao', label: 'Endereço/Habitação (string)' },
  { value: 'isolamentoTotal', label: 'Isolamento Total (boolean)' },
  { value: 'tierMetropole', label: 'Tier Metrópole (Alfas/Betas/Gamas)' },
  { value: 'periferico', label: 'Perfil Periférico (boolean)' },
  { value: 'ensolarado', label: 'Ambiente Ensolarado (boolean)' },
  { value: 'climaFrio', label: 'Clima Frio (boolean)' },
  { value: 'zonaTropical', label: 'Zona Tropical (boolean)' },
  { value: 'alternativo', label: 'Estilo Alternativo (boolean)' },
  { value: 'nerd', label: 'Perfil Nerd (boolean)' },
  { value: 'tecnologia', label: 'Gosto por Tecnologia (boolean)' },
  { value: 'midia', label: 'Exposição na Mídia (boolean)' },
  { value: 'exposicaoPublica', label: 'Exposição Pública (boolean)' },

  // --- SAÚDE MENTAL & TEMPERAMENTO ---
  { value: 'ansiedade', label: 'Ansiedade (boolean)' },
  { value: 'estresse', label: 'Estresse (boolean)' },
  { value: 'estresseHard', label: 'Estresse Nível Hard (boolean)' },
  { value: 'depressao', label: 'Depressão (boolean)' },
  { value: 'depressaoProfunda', label: 'Depressão Profunda (boolean)' },
  { value: 'historicoDepressivo', label: 'Histórico Depressivo (boolean)' },
  { value: 'baixaSaudeMental', label: 'Baixa Saúde Mental (boolean)' },
  { value: 'insonia', label: 'Insônia (boolean)' },
  { value: 'tdah', label: 'TDAH (boolean)' },
  { value: 'fobiaSocial', label: 'Fobia Social (boolean)' },
  { value: 'agorafobia', label: 'Agorafobia (boolean)' },
  { value: 'traumaInfancia', label: 'Trauma de Infância (boolean)' },
  { value: 'abusoHistorico', label: 'Abuso Histórico (boolean)' },
  { value: 'abusoInfanciaProlongado', label: 'Abuso na Infância (boolean)' },
  { value: 'lutoRecente', label: 'Luto Recente (boolean)' },
  { value: 'lutoSevero', label: 'Luto Severo (boolean)' },
  { value: 'vingativo', label: 'Perfil Vingativo (boolean)' },
  { value: 'altruista', label: 'Perfil Altruísta (boolean)' },

  // --- SAÚDE FÍSICA & BIOTIPO ---
  { value: 'biotipoAnomalia', label: 'Anomalia de Biotipo (string)' },
  { value: 'sobrepeso', label: 'Sobrepeso (boolean)' },
  { value: 'obeso', label: 'Obeso (boolean)' },
  { value: 'obesidadeI', label: 'Obesidade I (boolean)' },
  { value: 'obesidadeII', label: 'Obesidade II (boolean)' },
  { value: 'obesidadeIII', label: 'Obesidade III (boolean)' },
  { value: 'baixoPeso', label: 'Abaixo do Peso (boolean)' },
  { value: 'pesoIdeal', label: 'Peso Ideal (boolean)' },
  { value: 'massaMagra', label: 'Massa Magra (boolean)' },
  { value: 'diabetico', label: 'Diabético (boolean)' },
  { value: 'hipertenso', label: 'Hipertenso (boolean)' },
  { value: 'colesterolAlto', label: 'Colesterol Alto (boolean)' },
  { value: 'autoimune', label: 'Doença Autoimune (boolean)' },
  { value: 'herniaDisco', label: 'Hérnia de Disco (boolean)' },
  { value: 'retinopatia', label: 'Retinopatia (boolean)' },
  { value: 'glaucoma', label: 'Glaucoma (boolean)' },
  { value: 'miopiaCongenita', label: 'Miopia Congênita (boolean)' },
  { value: 'anacusiaTotal', label: 'Surdez Total/Anacusia (boolean)' },
  { value: 'avcExtenso', label: 'AVC Extenso (boolean)' },
  { value: 'infartoPrevio', label: 'Infarto Prévio (boolean)' },
  { value: 'internacaoUTI', label: 'Internação em UTI (boolean)' },
  { value: 'quimioterapia', label: 'Em Quimioterapia (boolean)' },
  { value: 'cancerMama', label: 'Câncer de Mama (boolean)' },
  { value: 'cancerMamaMetastatico', label: 'Câncer de Mama Metastático (boolean)' },
  { value: 'cancerProstataMetastatico', label: 'Câncer de Próstata Metastático (boolean)' },
  { value: 'cancerLaringe', label: 'Câncer de Laringe (boolean)' },
  { value: 'cancerPeleNaoTratado', label: 'Câncer de Pele não Tratado (boolean)' },

  // --- VÍCIOS & HÁBITOS ---
  { value: 'fumante', label: 'Fumante (boolean)' },
  { value: 'fumantePesado', label: 'Fumante Pesado (boolean)' },
  { value: 'alcoolico', label: 'Alcoólico (boolean)' },
  { value: 'alcoolicoAbstinencia', label: 'Alcoólico em Abstinência (boolean)' },
  { value: 'drogasPesadas', label: 'Drogas Pesadas (boolean)' },
  { value: 'drogasInjetaveis', label: 'Drogas Injetáveis (boolean)' },
  { value: 'dependenteQuimicoAtivo', label: 'Dependente Químico Ativo (boolean)' },
  { value: 'cafeina', label: 'Consumo de Cafeína (boolean)' },
  { value: 'sedentario', label: 'Sedentário (boolean)' },
  { value: 'mausHabitos', label: 'Maus Hábitos de Saúde (boolean)' },

  // --- TRAUMAS EXTREMOS & SHINIES ---
  { value: 'vitimaCrime', label: 'Vítima de Crime (boolean)' },
  { value: 'exPresidiario', label: 'Ex-Presidiário (boolean)' },
  { value: 'exDetento', label: 'Ex-Detento (boolean)' },
  { value: 'gangue', label: 'Envolvimento com Gangue (boolean)' },
  { value: 'militarPolicia', label: 'Militar ou Polícia (boolean)' },
  { value: 'bombeiro', label: 'Bombeiro (boolean)' },
  { value: 'veteranoGuerra', label: 'Veterano de Guerra (boolean)' },
  { value: 'acidenteTransito', label: 'Acidente de Trânsito (boolean)' },
  { value: 'acidenteFatalPedestre', label: 'Causou Acidente Fatal (boolean)' },
  { value: 'perdeuMembroAcidente', label: 'Perdeu Membro em Acidente (boolean)' },
  { value: 'malaDinheiroSujo', label: 'Encontrou Mala de Dinheiro (boolean)' },
  { value: 'atingidoRaio', label: 'Atingido por Raio (boolean)' },
  { value: 'canceladoInternet', label: 'Cancelado na Internet (boolean)' },
  { value: 'naufragioDeriva', label: 'Náufrago à Deriva (boolean)' },
  { value: 'sobreviventeDesastre', label: 'Sobrevivente de Desastre (boolean)' },
  { value: 'doouOrgaoVital', label: 'Doou Órgão Vital (boolean)' },
  { value: 'restosMortaisQuintal', label: 'Restos Mortais no Quintal (boolean)' },
  { value: 'herdeiroImperioCriminoso', label: 'Herdeiro do Crime (boolean)' },
  { value: 'saberCrimeFamoso', label: 'Sabe quem cometeu crime famoso (boolean)' },
  { value: 'violenciaUrbana', label: 'Vítima de Violência Urbana (boolean)' },

  // --- RELACIONAL & DINÂMICAS FAMILIARES ---
  { value: 'paiMorto', label: 'Pai Morto (boolean)' },
  { value: 'maeMorta', label: 'Mãe Morta (boolean)' },
  { value: 'relacaoPositiva', label: 'Relação Positiva com Pais (boolean)' },
  { value: 'relacaoNeutra', label: 'Relação Neutra com Pais (boolean)' },
  { value: 'relacaoNegativa', label: 'Relação Negativa com Pais (boolean)' },
  { value: 'temFilhos', label: 'Tem Filhos (boolean)' },
];

const OPERATORS = [
  { value: '==', label: 'Igual a' },
  { value: '!=', label: 'Diferente de' },
  { value: '>', label: 'Maior que' },
  { value: '<', label: 'Menor que' },
  { value: 'includes', label: 'Contém' },
];

export const RuleForge: React.FC = () => {
  const [mode, setMode] = useState<'edit' | 'create'>('edit');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [baseWeight, setBaseWeight] = useState(1.0);
  const [rules, setRules] = useState<Rule[]>([]);
  const [copied, setCopied] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemLevel, setNewItemLevel] = useState(1);
  const [newItemImpact, setNewItemImpact] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const lastImportedItem = React.useRef<string | null>(null);
  const isImportingRef = React.useRef(false);
  const targetImportedNameRef = React.useRef<string | null>(null);

  // --- deterministic reset of isImportingRef ---
  useEffect(() => {
    if (isImportingRef.current && targetImportedNameRef.current) {
      const currentName = mode === 'edit' ? selectedItem : newItemName;
      if (currentName === targetImportedNameRef.current) {
        isImportingRef.current = false;
        targetImportedNameRef.current = null;
        console.log("[Import] Trava de importação liberada de forma determinística.");
      }
    }
  }, [selectedItem, newItemName, mode]);

  // --- Hydration Engine V2 (Declarative Pattern) ---
  const getExistingItemRules = (category: string, itemName: string) => {
    // Normalização rigorosa conforme diretriz
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const itemKey = normalize(itemName);
    
    const defaults = { baseWeight: 1.0, rules: [] as Rule[] };

    // Busca no RULES_REGISTRY global
    const registryData = RULES_REGISTRY[category]?.[itemKey];

    if (registryData) {
      return {
        found: true,
        baseWeight: registryData.baseWeight,
        rules: registryData.rules.map(r => ({ 
          ...r, 
          id: Math.random().toString(36).substr(2, 9),
          multiplier: r.multiplier ?? 1.0
        }))
      };
    }

    return { found: false, ...defaults };
  };

  useEffect(() => {
    if (mode === 'edit' && selectedItem) {
      // Bloqueia a hidratação automática do registro caso venha de um import manual recente
      if (lastImportedItem.current === selectedItem) {
        lastImportedItem.current = null;
        return;
      }
      const existingData = getExistingItemRules(selectedCategory, selectedItem);
      setBaseWeight(existingData.baseWeight);
      setRules(existingData.rules as Rule[]);
      setIsHydrated(existingData.found);
    } else if (mode === 'edit' && !selectedItem) {
      setBaseWeight(1.0);
      setRules([]);
      setIsHydrated(false);
    }
  }, [selectedItem, selectedCategory, mode]);

  const handlePasteAndImport = async () => {
    try {
      // Tentar ler a área de transferência
      const text = await navigator.clipboard.readText();
      if (text) {
        setImportJson(text);
        processImport(text);
        return;
      }
      
      // Se estiver vazio mas funcionou, abre o import manual
      setShowImport(true);
    } catch (err) {
      console.warn("Clipboard Access Denied/Blocked:", err);
      // Fallback silencioso para o modo manual
      setShowImport(true);
      // Não damos alert aqui para não ser intrusivo, o campo já vai aparecer focado
    }
  };

  const handleSmartPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setTimeout(() => {
        processImport(pastedText);
      }, 50);
    }
  };

  const processImport = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      
      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        alert("Erro: JSON vazio ou inválido.");
        return;
      }

      if (keys.length > 1) {
        alert("Erro: O JSON contém múltiplos itens. Por favor, importe apenas um item por vez.");
        return;
      }

      const itemKey = keys[0];
      const dataToImport = parsed[itemKey];

      if (!dataToImport || !dataToImport.rules || !Array.isArray(dataToImport.rules)) {
        alert("Erro: Estrutura incompatível. O JSON precisa seguir o padrão { 'item_key': { 'baseWeight': 1.0, 'rules': [...] } }");
        return;
      }

      // 1. Extrair o nome legível e metadados de UI
      const importedNameLabel = dataToImport.name || itemKey;
      const targetCategory = dataToImport._uiCategory;
      const targetLevel = dataToImport._uiLevel;

      // --- BIFURCAÇÃO: MODO FÁBRICA (ADIÇÃO) ---
      if (mode === 'create') {
        isImportingRef.current = true;
        
        if (targetCategory) setSelectedCategory(targetCategory);
        
        // Sincronização de Nível para Categorias que suportam severidade
        if (targetLevel) {
          const levelNum = Number(targetLevel);
          setNewItemLevel(levelNum);
          console.log(`[Modo Fábrica] Sincronizando Nível: ${levelNum}`);
        }

        setNewItemName(importedNameLabel);
        
        if (dataToImport.baseWeight !== undefined) {
          setBaseWeight(Number(dataToImport.baseWeight));
        }

        const hydratedRules = dataToImport.rules
          .filter((r: any) => !String(r.property).startsWith('_ui')) // Limpeza de metadados
          .map((r: any) => ({
            id: r.id ?? Math.random().toString(36).substr(2, 9),
            property: r.property ?? 'idade',
            operator: r.operator ?? '==',
            value: r.value ?? '',
            multiplier: r.multiplier ?? 1.0
          }));

        setRules(hydratedRules);
        targetImportedNameRef.current = importedNameLabel;
        alert(`Blueprint de fábrica carregado: "${importedNameLabel}"`);
        setShowImport(false);
        setImportJson('');
        return;
      }

      // --- MANTÉM MODO DETETIVE PARA EDIÇÃO ---
      const normalize = (val: string) => 
        val.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/\s+/g, '')             // Remove spaces
          .replace(/[^\w]/g, '');          // Remove any non-alphanumeric remaining
      
      const targetSearchKey = normalize(itemKey);
      const targetSearchName = normalize(importedNameLabel);

      const findFullItemPath = (key: string, name: string): { category: string, subCategory: string | null, item: string } | null => {
        const searchDeep = (data: any, depth: number, exactOnly: boolean): { item: string, sub?: string } | null => {
          if (Array.isArray(data)) {
            const match = data.find((i: any) => {
              const systemName = (i as any).name || (i as any).text || String(i);
              const systemNormalized = normalize(systemName);
              
              if (exactOnly) {
                return systemNormalized === key || systemNormalized === name;
              } else {
                // Correspondência parcial (ex: "Cicatriz Cirúrgica Extensa" combina com "Cicatriz Cirúrgica Extensa (Flanco/Abdômen)")
                return systemNormalized.includes(key) || 
                       systemNormalized.includes(name) || 
                       key.includes(systemNormalized) || 
                       name.includes(systemNormalized);
              }
            });
            if (match) return { item: (match as any).name || (match as any).text || String(match) };
          } else if (typeof data === 'object' && data !== null) {
            for (const k in data) {
              const res = searchDeep(data[k], depth + 1, exactOnly);
              if (res) return { ...res, sub: depth === 0 ? k : res.sub };
            }
          }
          return null;
        };

        // Passagem 0: Busca no RULES_REGISTRY (mais rápido se for match de chave direta)
        for (const [catId, items] of Object.entries(RULES_REGISTRY)) {
          const normKey = normalize(key);
          const normName = normalize(name);
          
          const registryItem = items[key] || items[normKey] || items[normName];
          if (registryItem) {
            // Se encontramos no registry, tentamos achar o "Pretty Name" no CATEGORIES
            const cat = CATEGORIES.find(c => c.id === catId);
            if (cat) {
              const res = searchDeep(cat.data, 0, false); // busca relaxada para achar o item na UI
              if (res) return { category: cat.id, subCategory: res.sub || null, item: res.item };
            }
            // Fallback: se não achar nas categorias estáticas, o item é órfão de interface, 
            // mas ainda podemos tentar retornar o nome que está no registry ou no import
            return { 
              category: catId, 
              subCategory: null, 
              item: registryItem.name || name || key 
            };
          }
        }

        // Passagem 1: Busca Exata nas Categorias Estáticas
        for (const cat of CATEGORIES) {
          const res = searchDeep(cat.data, 0, true);
          if (res) return { category: cat.id, subCategory: res.sub || null, item: res.item };
        }

        // Passagem 2: Busca Parcial (se não encontrou exata)
        for (const cat of CATEGORIES) {
          const res = searchDeep(cat.data, 0, false);
          if (res) return { category: cat.id, subCategory: res.sub || null, item: res.item };
        }

        return null;
      };

      const path = findFullItemPath(targetSearchKey, targetSearchName);

      // 3. Trava de Segurança (Item deve existir no banco para ser editado)
      if (!path) {
        console.warn("Import Lookup Failed for key:", targetSearchKey);
        alert("Erro: O item '" + importedNameLabel + "' não foi encontrado nas listas do sistema. Como esta é uma tela de edição, você não pode importar um item que não existe nas categorias base.");
        return;
      }

      // 4. Sincronização de Estados com Blindagem contra useEffects de reset
      isImportingRef.current = true;
      
      lastImportedItem.current = path.item; // Bloqueia a hidratação do registro original
      setSelectedCategory(path.category);
      if (path.subCategory) {
        setSelectedSubCategory(path.subCategory);
      } else {
        setSelectedSubCategory('');
      }
      setSelectedItem(path.item);
      setItemSearch('');

      const hydratedRules = dataToImport.rules
        .filter((r: any) => !String(r.property).startsWith('_ui')) // Limpeza de metadados
        .map((r: any) => {
          let prop = r.property ?? 'idade';
        if (prop === 'classeSocial') prop = 'classe';
        if (prop === 'sector') prop = 'setor';
        if (prop === 'isCapital') prop = 'capital';

        return {
          id: r.id ?? Math.random().toString(36).substr(2, 9),
          property: prop,
          operator: r.operator ?? '==',
          value: r.value ?? '',
          multiplier: r.multiplier ?? 1.0
        };
      });

      setRules(hydratedRules);
      if (dataToImport.baseWeight !== undefined) {
        setBaseWeight(Number(dataToImport.baseWeight));
      }

      targetImportedNameRef.current = path.item;
      console.log("Import Successful:", path);
      alert(`Item "${path.item}" detectado e importado com sucesso!`);
      setShowImport(false);
      setImportJson('');

    } catch (e) {
      alert('Erro: JSON inválido. Verifique a formatação.');
      console.error("Parse Error:", e);
    }
  };

  // --- Hierarchical Data Fetching ---
  const subCategories = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return [];
    
    // Se for um array direto (ex: Shiny Events), não tem sub-categoria
    if (Array.isArray(cat.data)) return [];

    // Se for um objeto (Record), as chaves são as sub-categorias
    return Object.keys(cat.data).sort();
  }, [selectedCategory]);

  const items = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return [];

    // Caso 1: Array simples
    if (Array.isArray(cat.data)) {
      const allNames = (cat.data as any[]).map(i => i.name || i.text || String(i));
      return Array.from(new Set(allNames)).sort();
    }

    // Caso 2: Objeto/Hierarquia
    if (selectedSubCategory && cat.data[selectedSubCategory]) {
      const subData = cat.data[selectedSubCategory];
      if (Array.isArray(subData)) {
        return subData.map(i => i.name || i.text || String(i)).sort();
      }
      if (typeof subData === 'object' && subData !== null) {
        // Suporte para hierarquias de mais de 1 nível (ex: Profissões Regionais)
        const flattened: string[] = [];
        const extract = (data: any) => {
          if (Array.isArray(data)) {
            data.forEach(i => flattened.push(i.name || i.text || String(i)));
          } else if (typeof data === 'object' && data !== null) {
            Object.values(data).forEach(extract);
          }
        };
        extract(subData);
        return Array.from(new Set(flattened)).sort();
      }
    }

    return [];
  }, [selectedCategory, selectedSubCategory]);

  const filteredItems = useMemo(() => {
    if (!itemSearch) return items;
    const searchLow = itemSearch.toLowerCase();
    return items.filter(item => item.toLowerCase().includes(searchLow));
  }, [items, itemSearch]);

  // Reset hierarchical selections
  useEffect(() => {
    if (isImportingRef.current) return;
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (cat && !Array.isArray(cat.data)) {
      setSelectedSubCategory(Object.keys(cat.data)[0] || '');
    } else {
      setSelectedSubCategory('');
    }
    setSelectedItem('');
    setItemSearch('');
  }, [selectedCategory]);

  const addRule = () => {
    const newRule: Rule = {
      id: Math.random().toString(36).substr(2, 9),
      property: 'idade',
      operator: '==',
      value: '',
      multiplier: 1.0,
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // --- Property Options Engine ---
  const allProperties = useMemo(() => {
    const base = [...PROPERTIES];
    
    // Extrair propriedades únicas das regras atuais que não estão na lista base
    rules.forEach(rule => {
      if (!base.find(b => b.value === rule.property)) {
        base.push({ value: rule.property, label: rule.property });
      }
    });

    return base;
  }, [rules]);

  // --- Form Validation ---
  const isFormInvalid = useMemo(() => {
    if (mode === 'edit') {
      return !selectedCategory || !selectedItem;
    } else {
      return !selectedCategory || !newItemName;
    }
  }, [mode, selectedCategory, selectedItem, newItemName]);

  const parseRules = () => {
    const operatorTranslation: Record<string, string> = {
      '==': "for igual a",
      '!=': "for diferente de",
      '>': "for estritamente maior que",
      '<': "for estritamente menor que",
      'includes': "contiver a string",
    };

    return rules.map(r => {
      const valStr = String(r.value).trim();
      const isNumeric = !isNaN(Number(valStr)) && valStr !== "";
      const isBoolean = valStr === 'true' || valStr === 'false';
      
      let formattedValue = r.value;
      if (!isNumeric && !isBoolean) {
        formattedValue = `'${valStr.replace(/'/g, "")}'`;
      }
      
      const opText = operatorTranslation[r.operator] || r.operator;
      return `- Se a propriedade 'ctx.${r.property}' ${opText} ${formattedValue}, multiplique o peso atual por ${r.multiplier}x.`;
    }).join('\n');
  };

  const handleExportPrompt = () => {
    if (!selectedCategory || !selectedItem) {
      alert("Ação Bloqueada: Você precisa selecionar a Categoria e o Item antes de exportar o prompt!");
      return;
    }

    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const itemKey = normalize(selectedItem);

    const rulesData = rules.map(({ property, operator, value, multiplier }) => ({
      property,
      operator,
      value,
      multiplier
    }));

    const jsonOutput = {
      [itemKey]: {
        name: selectedItem,
        baseWeight,
        rules: rulesData
      }
    };

    const prompt = `Perfeito, inclua o prompt abaixo no src/data/rulesRegistry.ts\n\n\`\`\`json\n${JSON.stringify(jsonOutput, null, 2)}\n\`\`\``;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleExportCreatePrompt = () => {
    if (!selectedCategory || !newItemName) {
      alert("Ação Bloqueada: Você precisa selecionar a Categoria e o Nome do Item antes de exportar o prompt!");
      return;
    }

    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const itemKey = normalize(newItemName);

    const rulesData = rules.map(({ property, operator, value, multiplier }) => ({
      property,
      operator,
      value,
      multiplier
    }));

    const jsonOutput = {
      [itemKey]: {
        name: newItemName,
        baseWeight,
        rules: rulesData
      }
    };

    const prompt = `Perfeito, inclua o prompt abaixo no src/data/rulesRegistry.ts\n\n\`\`\`json\n${JSON.stringify(jsonOutput, null, 2)}\n\`\`\``;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleExportRawJSON = () => {
    if (mode === 'edit' && (!selectedCategory || !selectedItem)) {
      alert("Ação Bloqueada: Selecione um item antes de exportar o JSON.");
      return;
    }
    if (mode === 'create' && (!selectedCategory || !newItemName)) {
      alert("Ação Bloqueada: Defina o nome do item antes de exportar o JSON.");
      return;
    }

    const normalizeKey = (val: string) => 
      val.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '')
        .replace(/[^\w]/g, '');

    const itemKey = normalizeKey(mode === 'edit' ? selectedItem : newItemName);
    
    const exportObj = {
      [itemKey]: {
        baseWeight,
        rules: rules.map(({ property, operator, value, multiplier }) => ({
          property,
          operator,
          value,
          multiplier
        }))
      }
    };

    const jsonString = JSON.stringify(exportObj, null, 2);
    
    navigator.clipboard.writeText(jsonString).then(() => {
      alert("JSON bruto copiado para a área de transferência! Cole na IA para pedir novas ideias de pesos.");
    });
  };

  const reverseSearchResults = useMemo(() => {
    if (!searchTrigger || searchTrigger.length < 2) return [];
    
    const results: any[] = [];
    const searchLow = searchTrigger.toLowerCase();

    Object.entries(RULES_REGISTRY).forEach(([catKey, items]) => {
      const categoryLabel = CATEGORIES.find(c => c.id === catKey)?.label || catKey;
      
      Object.entries(items).forEach(([itemKey, itemData]: [string, any]) => {
        if (itemData && itemData.rules && Array.isArray(itemData.rules)) {
          itemData.rules.forEach((rule: any) => {
            if (rule.property.toLowerCase().includes(searchLow)) {
              let displayValue = String(rule.value);
              if (rule.property === 'tierMetropole') {
                const labels: any = {
                  'tier_alfa': 'Capital - Tier Alfa (SP/RJ)',
                  'tier_beta': 'Capital - Tier Beta (MG/PR/RS...)',
                  'tier_gama': 'Capital - Tier Gama (AC/AP/RR...)',
                  'interior_alfa': 'Interior - Tier Alfa (SP/RJ)',
                  'interior_beta': 'Interior - Tier Beta (MG/PR/RS...)',
                  'interior_gama': 'Interior - Tier Gama (AC/AP/RR...)'
                };
                displayValue = labels[rule.value] || rule.value;
              }

              results.push({
                category: categoryLabel,
                itemKey,
                property: rule.property === 'tierMetropole' ? 'Metrópole' : rule.property,
                operator: rule.operator,
                value: displayValue,
                multiplier: rule.multiplier
              });
            }
          });
        }
      });
    });

    return results;
  }, [searchTrigger]);

  return (
    <div className="min-h-full bg-slate-950 text-slate-200 p-4 md:p-8 font-sans border-l border-slate-800/50 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col pb-20">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex shadow-2xl w-full max-w-sm">
            <button 
              onClick={() => setMode('edit')}
              className={`flex-1 px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${mode === 'edit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Editar Existente
            </button>
            <button 
              onClick={() => setMode('create')}
              className={`flex-1 px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${mode === 'create' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Fábrica
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-3 text-white">
              <Settings2 className={mode === 'edit' ? "text-blue-500" : "text-indigo-400"} />
              {mode === 'edit' ? 'Forja de Regras' : 'Fábrica de Entidades'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              {mode === 'edit' ? 'Edição de pesos e modificadores contextuais' : 'Criação de novos itens e regras matemáticas'}
            </p>
          </div>
        </header>

        {/* Busca Reversa */}
        <div 
          className="mb-6 md:mb-8 bg-slate-900/40 border border-slate-800 rounded-xl p-4 md:p-6 shadow-xl backdrop-blur-sm"
          data-lpignore="true"
          data-1pignore="true"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Search className="text-blue-400" size={18} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Busca Reversa por Gatilho</h2>
          </div>
          <div className="relative">
            <input 
              type="text"
              placeholder="Digite um gatilho para auditar itens (ex: capital, ansiedade, idade, classe)..."
              value={searchTrigger}
              onChange={(e) => setSearchTrigger(e.target.value)}
              autoComplete="off"
              data-lpignore="true"
              data-1pignore="true"
              spellCheck="false"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <AnimatePresence>
            {reverseSearchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-800">
                  {reverseSearchResults.map((res, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col gap-1.5 hover:bg-slate-900 transition-colors group"
                    >
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 truncate">
                        <span className="text-blue-400/70">{res.category}</span> 
                        <ChevronRight size={10} className="text-slate-700" /> 
                        <span className="text-slate-300">{res.itemKey}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-md border border-slate-800/50 group-hover:border-blue-500/20 transition-colors">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] text-blue-400 font-mono truncate">{res.property}</span>
                          <span className="text-[9px] text-slate-500 uppercase truncate">
                            {res.operator} <span className="text-slate-400">{String(res.value)}</span>
                          </span>
                        </div>
                        <div className="text-lg font-black text-blue-100/90 pl-3">
                          {res.multiplier}x
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {searchTrigger.length >= 2 && reverseSearchResults.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 text-center bg-slate-900/20 border border-slate-800/40 rounded-lg"
              >
                <p className="text-slate-500 text-sm">Nenhum item utiliza o gatilho <span className="text-blue-400/80 font-mono">"{searchTrigger}"</span> em suas regras.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Utilities Bar - Seção de Configurações/Utilidades Realocada */}
        <div 
          className="flex flex-col gap-4 mb-6 md:mb-8 bg-slate-900/30 border border-slate-800 p-4 rounded-xl"
          data-lpignore="true"
          data-1pignore="true"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500/80">
              <Settings2 size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Configurações e Utilidades</span>
            </div>
            <button 
              id="btn-paste-import"
              onClick={handlePasteAndImport}
              className="flex items-center gap-2 px-5 h-[50px] bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/30 rounded-lg text-sm font-bold transition-all shadow-lg shadow-amber-900/40 active:scale-95 group"
            >
              <ClipboardCopy size={18} className="group-hover:rotate-12 transition-transform" />
              Importar
            </button>
          </div>

          <AnimatePresence>
            {showImport && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <FileJson size={14} className="text-blue-400" />
                      Entrada Manual (Cole abaixo)
                    </label>
                    <textarea 
                      autoFocus
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                      onPaste={handleSmartPaste}
                      autoComplete="off"
                      data-lpignore="true"
                      data-1pignore="true"
                      spellCheck="false"
                      placeholder='Ex: { "item_key": { "baseWeight": 1.0, "rules": [...] } }'
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono h-32 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pb-2">
                    <button 
                      onClick={() => { setShowImport(false); setImportJson(''); }}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => processImport(importJson)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      Importar Manualmente
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuração do Alvo / Criação */}
          <section className="lg:col-span-1 space-y-6">
            <div 
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl"
              data-lpignore="true"
              data-1pignore="true"
            >
               <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${mode === 'edit' ? 'text-blue-400' : 'text-indigo-400'}`}>
                  {mode === 'edit' ? <Database size={20} /> : <Plus size={20} />}
                  {mode === 'edit' ? 'Seleção de Alvo' : 'Nova Entidade'}
               </h2>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedItem('');
                      }}
                      autoComplete="off"
                      data-lpignore="true"
                      data-1pignore="true"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {mode === 'edit' ? (
                    <div className="space-y-4">
                      {subCategories.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-blue-400">Sub-categoria / Nível</label>
                          <select 
                            value={selectedSubCategory}
                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                          >
                            {subCategories.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Específico</label>
                        <div className="space-y-2">
                          <input 
                            type="text"
                            placeholder="Buscar item..."
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            spellCheck="false"
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                          />
                          <select 
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                          >
                            <option value="">{filteredItems.length === 0 ? 'Nenhum item encontrado' : 'Selecione um item...'}</option>
                            {filteredItems.map(item => {
                              const checkKey = item.toLowerCase().replace(/\s+/g, '');
                              const isMigrated = !!RULES_REGISTRY[selectedCategory]?.[checkKey];
                              return (
                                <option key={item} value={item} className={isMigrated ? 'text-blue-500 font-medium' : ''}>
                                  {item}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {subCategories.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-indigo-400">Sub-categoria / Alocação</label>
                          <select 
                            value={selectedSubCategory}
                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                          >
                            {subCategories.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Novo Item</label>
                        <input 
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          autoComplete="off"
                          data-lpignore="true"
                          data-1pignore="true"
                          spellCheck="false"
                          placeholder="Ex: Tuberculose Resistente"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      {(selectedCategory === 'condicoesVisiveis' || selectedCategory === 'condicoesNaoVisiveis') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nível de Severidade (1-10)</label>
                          <select 
                            value={newItemLevel}
                            onChange={(e) => setNewItemLevel(parseInt(e.target.value))}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>Nível {n}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Impactos (Six-Axis)</label>
                        <input 
                          type="text"
                          value={newItemImpact}
                          onChange={(e) => setNewItemImpact(e.target.value)}
                          autoComplete="off"
                          data-lpignore="true"
                          data-1pignore="true"
                          spellCheck="false"
                          placeholder="Ex: physical: -20, mental: -10"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Peso Base (Default 1.0)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={baseWeight}
                        onChange={(e) => setBaseWeight(parseFloat(e.target.value) || 0)}
                        autoComplete="off"
                        data-lpignore="true"
                        data-1pignore="true"
                        spellCheck="false"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Base</span>
                    </div>
                  </div>
               </div>

               {mode === 'edit' && selectedItem && (
                 <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      Editando peso para <span className="font-bold text-blue-100">{selectedItem}</span>
                    </p>
                 </div>
               )}

               {mode === 'create' && newItemName && (
                 <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <p className="text-sm text-indigo-300">
                      Criando nova entidade: <span className="font-bold text-indigo-100">{newItemName}</span>
                    </p>
                 </div>
               )}
            </div>

            <div className="bg-slate-950 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start">
               <AlertCircle className="text-amber-500 shrink-0" size={20} />
               <p className="text-xs text-amber-500/80 leading-relaxed">
                  Os multiplicadores são cumulativos. Se duas regras baterem, seus multiplicadores serão aplicados um após o outro sobre o peso base.
               </p>
            </div>
          </section>

          {/* Regras Dinâmicas */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Modificadores Contextuais</h2>
                {mode === 'edit' && selectedItem && (
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isHydrated ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {isHydrated ? '🟢 Carregado do Registro Declarativo (JSON)' : '🟡 Item operando no padrão antigo (Código puro). Pronto para migração.'}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  id="btn-add-rule"
                  onClick={addRule}
                  className="h-[40px] pt-[6px] leading-[12px] text-[9px] bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 rounded-md flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  Adicionar Regra
                </button>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {rules.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2"
                  >
                    <Settings2 size={48} strokeWidth={1} />
                    <p>Nenhuma regra contextual definida.</p>
                    <button onClick={addRule} className="text-blue-500 text-sm font-medium hover:underline">Clique para adicionar o primeiro modificador</button>
                  </motion.div>
                ) : (
                  rules.map((rule, index) => (
                    <motion.div
                      key={`rule-${rule.property}-${rule.operator}-${rule.value}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      data-lpignore="true"
                      data-1pignore="true"
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-3 items-stretch md:items-end group relative"
                    >
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Propriedade (ctx)</label>
                        <select 
                          value={rule.property}
                          onChange={(e) => updateRule(rule.id, { property: e.target.value })}
                          autoComplete="off"
                          data-lpignore="true"
                          data-1pignore="true"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-500"
                        >
                          {allProperties.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Operador</label>
                        <select 
                          value={rule.operator}
                          onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                          autoComplete="off"
                          data-lpignore="true"
                          data-1pignore="true"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-500"
                        >
                          {OPERATORS.map(op => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Valor</label>
                        {rule.property === 'tierMetropole' ? (
                          <select
                            value={String(rule.value)}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="">Selecione...</option>
                            <option value="tier_alfa">Capital - Tier Alfa (SP/RJ)</option>
                            <option value="tier_beta">Capital - Tier Beta (MG/PR/RS...)</option>
                            <option value="tier_gama">Capital - Tier Gama (AC/AP/RR...)</option>
                            <option value="interior_alfa">Interior - Tier Alfa (SP/RJ)</option>
                            <option value="interior_beta">Interior - Tier Beta (MG/PR/RS...)</option>
                            <option value="interior_gama">Interior - Tier Gama (AC/AP/RR...)</option>
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={String(rule.value)}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            spellCheck="false"
                            placeholder="Ex: 'Norte' ou true"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-500"
                          />
                        )}
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Multiplicador</label>
                        <div className="relative">
                          <input 
                            type="number"
                            step="0.1"
                            value={rule.multiplier}
                            onChange={(e) => updateRule(rule.id, { multiplier: parseFloat(e.target.value) || 0 })}
                            autoComplete="off"
                            data-lpignore="true"
                            data-1pignore="true"
                            spellCheck="false"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs text-blue-400 font-bold">x</span>
                        </div>
                      </div>

                      <div className="md:col-span-1 flex justify-end md:pb-1">
                        <button 
                          onClick={() => removeRule(rule.id)}
                          className="p-2 md:p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-slate-800 md:border-transparent w-full md:w-auto flex justify-center items-center"
                          title="Remover regra"
                        >
                          <X size={20} className="md:w-4 md:h-4" />
                          <span className="md:hidden ml-2 text-xs font-bold uppercase">Remover</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>

      {/* Rodapé de Ações Sticky / Principal */}
      <div className="fixed bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800 p-3 z-50 flex flex-row gap-3 justify-center shadow-lg">
        <button 
          id="btn-export-raw-json-footer"
          onClick={handleExportRawJSON}
          disabled={isFormInvalid}
          className={`flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors border ${
            isFormInvalid 
              ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50' 
              : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30 shadow-lg shadow-blue-900/20'
          }`}
        >
          <Code size={18} />
          <span className="hidden md:inline">Exportar JSON Bruto</span>
          <span className="md:hidden text-xs">JSON Bruto</span>
        </button>
        <button 
          id="btn-export-prompt-footer"
          onClick={mode === 'edit' ? handleExportPrompt : handleExportCreatePrompt}
          disabled={isFormInvalid}
          className={`flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-all ${
            isFormInvalid 
              ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50' 
              : mode === 'edit' 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
          }`}
        >
          {copied ? <CheckCircle2 size={18} /> : (mode === 'edit' ? <ClipboardCopy size={18} /> : <Plus size={18} />)}
          <span>{copied ? 'Copiado!' : (mode === 'edit' ? (window.innerWidth < 768 ? 'Prompt IA' : 'Gerar Prompt IA') : 'Criar Novo')}</span>
        </button>
      </div>

      {copied && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 font-medium"
        >
          <CheckCircle2 size={20} />
          Prompt copiado com sucesso!
        </motion.div>
      )}
    </div>
  );
};
