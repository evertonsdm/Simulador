import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Book, 
  Filter, 
  Maximize2, 
  X,
  CreditCard,
  Briefcase,
  Users,
  Eye,
  EyeOff,
  Zap,
  Fingerprint,
  Heart,
  Globe,
  Flame,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RULES_REGISTRY } from '../data/rulesRegistry';

// Import data
import { 
  PROFISSOES_UNIVERSAIS, 
  PROFISSOES_REGIONAIS,
  SHINY_EVENTS,
  OP_RASTRO,
  OP_RES,
  OP_LOGISTICA_TRANSPORTE,
  RELACOES_TEXTOS,
  FILHOS_TEXTOS
} from '../data/staticData';
import { NIVEIS_V, NIVEIS_NV, OP_TRIBO, FETICHES_DATA } from '../rules/conditions';

// Defined types for safety
type CategoryKey = 
  | 'etnias' 
  | 'classes' 
  | 'identidades'
  | 'termos'
  | 'generos' 
  | 'orientacoes' 
  | 'profissoes' 
  | 'tribos' 
  | 'v_conditions' 
  | 'nv_conditions' 
  | 'rastros' 
  | 'shiny'
  | 'fetiches'
  | 'logistica'
  | 'contexto'
  | 'relacional'
  | 'papeisRelacionais'
  | 'filhos';

interface CatalogItem {
  id: string;
  text: string;
}

export const CatalogViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('profissoes');
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyLegacy, setShowOnlyLegacy] = useState(false);

  // Categories Mapping
  const categories: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
    { key: 'profissoes', label: 'Profissões', icon: Briefcase },
    { key: 'etnias', label: 'Etnias', icon: Globe },
    { key: 'classes', label: 'Classes Sociais', icon: CreditCard },
    { key: 'identidades', label: 'Identidade de Gênero', icon: Users },
    { key: 'termos', label: 'Termos de Identidade', icon: Fingerprint },
    { key: 'generos', label: 'Sexo Biológico', icon: Users },
    { key: 'orientacoes', label: 'Orientações', icon: Heart },
    { key: 'tribos', label: 'Tribos Urbanas', icon: Users },
    { key: 'v_conditions', label: 'Condições Visíveis', icon: Eye },
    { key: 'nv_conditions', label: 'Condições Não Visíveis', icon: EyeOff },
    { key: 'rastros', label: 'Rastros Digitais', icon: Fingerprint },
    { key: 'shiny', label: 'Eventos Shiny', icon: Zap },
    { key: 'fetiches', label: 'Fetiche Sexual', icon: Flame },
    { key: 'logistica', label: 'Logística', icon: Truck },
    { key: 'contexto', label: 'Contexto e Geografia', icon: Globe },
    { key: 'relacional', label: 'Bagagem Relacional', icon: Users },
    { key: 'papeisRelacionais', label: 'Papéis Relacionais', icon: Users },
    { key: 'filhos', label: 'Dinâmica de Filhos', icon: Users },
  ];

  const getRegistryInfo = useCallback((itemText: string): { key: string, category: string, data: any } | null => {
    const normalize = (str: string) => {
      if (!str) return '';
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    };
    const searchKey = normalize(itemText);
    
    const categoryMapping: Record<string, string> = {
      'profissoes': 'profissoes',
      'classes': 'classeSocial',
      'v_conditions': 'condicoesVisiveis',
      'nv_conditions': 'condicoesNaoVisiveis',
      'tribos': 'tribosUrbanas',
      'shiny': 'shinies',
      'fetiches': 'fetiches',
      'rastros': 'rastro',
      'contexto': 'contexto',
      'relacional': 'relacional',
      'papeisRelacionais': 'papeisRelacionais',
      'filhos': 'filhos',
      'logistica': 'logistica',
      'etnias': 'etnia',
      'orientacoes': 'orientacao',
      'generos': 'sexo'
    };

    const registryCategory = categoryMapping[selectedCategory];
    if (!registryCategory) return null;

    const categoryData = (RULES_REGISTRY as any)[registryCategory];
    if (!categoryData) return null;

    // First try direct lookup with normalized search key
    let itemData = categoryData[searchKey];
    let actualKey = searchKey;

    // If not found, try finding the key by normalizing items in the category
    if (!itemData) {
      const foundKey = Object.keys(categoryData).find(k => normalize(k) === searchKey);
      if (foundKey) {
        itemData = categoryData[foundKey];
        actualKey = foundKey;
      }
    }

    // Fallback for rastros/shiny crossover - sometimes they are mixed in the registry
    if (!itemData && (selectedCategory === 'rastros' || selectedCategory === 'shiny')) {
      const otherCategory = selectedCategory === 'rastros' ? 'shinies' : 'rastro';
      const otherData = (RULES_REGISTRY as any)[otherCategory];
      if (otherData) {
        const foundKey = Object.keys(otherData).find(k => normalize(k) === searchKey);
        if (foundKey) {
          itemData = otherData[foundKey];
          actualKey = foundKey;
        }
      }
    }

    // Still not found? Try a partial match if it's a long string
    if (!itemData && searchKey.length > 5) {
      const foundKey = Object.keys(categoryData).find(k => {
        const normalizedK = normalize(k);
        return normalizedK.includes(searchKey) || searchKey.includes(normalizedK);
      });
      if (foundKey) {
        itemData = categoryData[foundKey];
        actualKey = foundKey;
      }
    }

    if (!itemData) return null;

    return { key: actualKey, category: registryCategory, data: itemData };
  }, [selectedCategory]);

  const isItemMigrated = (itemText: string): boolean => {
    return !!getRegistryInfo(itemText);
  };

  // Data Extraction Logic
  const data = useMemo(() => {
    let rawItems: any[] = [];

    switch (selectedCategory) {
      case 'etnias':
        rawItems = ["Branca", "Parda", "Preta", "Amarela", "Indígena"];
        break;
      case 'classes':
        rawItems = [
          'Elite / Alta Renda',
          'Classe Média Alta / Estabilidade',
          'Classe Média Baixa / A Engrenagem',
          'Base Precarizada / Vulnerável',
          'Classe E (Extrema Pobreza)'
        ];
        break;
      case 'identidades':
        rawItems = ["Homem", "Mulher", "Não-Binário"];
        break;
      case 'termos':
        rawItems = ["Cisgênero", "Transgênero", "Transexual", "Não-Binário"];
        break;
      case 'generos':
        rawItems = ["Masculino", "Feminino"];
        break;
      case 'orientacoes':
        rawItems = ["Heterossexual", "Bissexual", "Homossexual", "Assexual", "Pansexual", "Demissexual"];
        break;
      case 'profissoes':
        const universals = Object.values(PROFISSOES_UNIVERSAIS).flat();
        const regionals = Object.values(PROFISSOES_REGIONAIS).flatMap(reg => 
          Object.values(reg).flatMap(roleList => roleList)
        );
        rawItems = Array.from(new Set([...universals, ...regionals])).sort();
        break;
      case 'tribos':
        rawItems = Object.values(OP_TRIBO).flat().map(t => t.name);
        break;
      case 'v_conditions':
        rawItems = Object.values(NIVEIS_V).flat().map(c => c.name);
        break;
      case 'nv_conditions':
        rawItems = Object.values(NIVEIS_NV).flat().map(c => c.name);
        break;
      case 'rastros':
        rawItems = OP_RASTRO.map(r => r.text);
        break;
      case 'shiny':
        rawItems = SHINY_EVENTS.map(s => s.text);
        break;
      case 'fetiches':
        rawItems = (FETICHES_DATA as any[]).map(f => f.name);
        break;
      case 'logistica':
        rawItems = OP_LOGISTICA_TRANSPORTE;
        break;
      case 'contexto':
        rawItems = [
          "Zona Rural/Remota", "Trabalho Braçal", "Setor Agro", "Cargos Altos",
          "Ansiedade", "Estresse", "Trabalha", "Estuda", "Estágio",
          "Capital", "Interior", "Sul", "Norte", "Nordeste", "Sudeste", "Centro-Oeste",
          "Preta/Parda", "Branca", "Amarela", "Indígena",
          "tierMetropole: tier_alfa", "tierMetropole: tier_beta", "tierMetropole: tier_gama", "tierMetropole: interior"
        ];
        break;
      case 'relacional':
        rawItems = Array.from(new Set([
          "Pai Vivo", "Pai Falecido", "Mãe Viva", "Mãe Falecida",
          "Relacionamento: Positivo", "Relacionamento: Neutro", "Relacionamento: Negativo",
          ...RELACOES_TEXTOS.Positivo.map(t => `Rel Positivo: ${t}`),
          ...RELACOES_TEXTOS.Neutro.map(t => `Rel Neutro: ${t}`),
          ...RELACOES_TEXTOS.Negativo.map(t => `Rel Negativo: ${t}`),
          ...Object.values(RULES_REGISTRY['relacional'] || {}).filter(i => i.name).map(i => i.name!)
        ]));
        break;
      case 'papeisRelacionais':
        // Pull directly from RULES_REGISTRY if it exists, since it's now declarative
        rawItems = Object.values(RULES_REGISTRY['papeisRelacionais'] || {}).map(i => i.name!);
        break;
      case 'filhos':
        rawItems = [
          "Filho: Criança", "Filho: Adolescente", "Filho: Adulto",
          ...Object.entries(FILHOS_TEXTOS).flatMap(([age, qualities]) => 
            Object.entries(qualities as Record<string, string[]>).flatMap(([quality, texts]) => 
              texts.map(t => `Filho ${age} (${quality}): ${t}`)
            )
          )
        ];
        break;
      default:
        rawItems = [];
    }

    // Process items to standardized CatalogItem format
    return rawItems
      .map((item, idx) => ({
        id: `${selectedCategory}-${idx}`,
        text: typeof item === 'string' ? item : (item.text || item.name || String(item))
      }))
      .filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(item => {
        if (!showOnlyLegacy) return true;
        return !isItemMigrated(item.text);
      })
      .sort((a, b) => {
        const aMigrated = !!getRegistryInfo(a.text);
        const bMigrated = !!getRegistryInfo(b.text);
        
        if (aMigrated && !bMigrated) return -1;
        if (!aMigrated && bMigrated) return 1;
        
        return a.text.localeCompare(b.text);
      });
  }, [selectedCategory, searchQuery, getRegistryInfo, showOnlyLegacy]);

  const handleCopyAll = () => {
    const textToCopy = data.map(item => item.text).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyItem = (itemText: string) => {
    const info = getRegistryInfo(itemText);
    let textToCopy = "";

    if (info) {
      // Converted: Copy raw JSON
      const jsonToCopy = {
        [info.key]: info.data
      };
      textToCopy = JSON.stringify(jsonToCopy, null, 2);
    } else {
      // Non-converted: Copy pre-programmed text
      textToCopy = `Me mande toda a estrutura, gatilhos, funcionamentos, eventos e etc desse item: ${itemText}`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedItem(itemText);
      setTimeout(() => setCopiedItem(null), 2000);
    });
  };

  const renderRuleText = (rule: any, index: number) => {
    let propLabel = rule.property;
    let valLabel = String(rule.value);

    if (rule.property === 'tierMetropole') {
      propLabel = 'Metrópole';
      const metropoleLabels: any = {
        'tier_alfa': 'Capital Alfa (SP/RJ)',
        'tier_beta': 'Capital Beta (MG/PR/RS...)',
        'tier_gama': 'Capital Gama (Outros)',
        'interior_alfa': 'Interior Alfa (SP/RJ)',
        'interior_beta': 'Interior Beta (MG/PR/RS...)',
        'interior_gama': 'Interior Gama (Outros)'
      };
      valLabel = metropoleLabels[rule.value] || rule.value;
    }

    const opLabel = rule.operator === '==' ? 'for igual a' : 
                   rule.operator === '>=' ? 'for maior/igual a' :
                   rule.operator === '<=' ? 'for menor/igual a' :
                   rule.operator === '>' ? 'for maior que' :
                   rule.operator === '<' ? 'for menor que' : rule.operator;

    return (
      <div key={`rule-${rule.property}-${rule.operator}-${rule.value}-${index}`} className="text-[10px] flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-blue-500/50">•</span>
        <span className="text-white/40">Se</span>
        <span className="text-blue-400 font-mono">{propLabel}</span>
        <span className="text-white/30">{opLabel}</span>
        <span className="text-blue-300">{valLabel}</span>
        <span className="text-white/20">→</span>
        <span className="text-gold font-bold">x{rule.multiplier}</span>
      </div>
    );
  };

  const Icon = categories.find(c => c.key === selectedCategory)?.icon || Book;

  return (
    <div className="flex-1 flex flex-col bg-dark-bg h-dvh md:h-full overflow-hidden">
      {/* Header Hook */}
      <div className="shrink-0 p-4 md:p-6 border-b border-dark-border bg-dark-surface/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="space-y-1">
              <h2 className="text-lg md:text-xl font-display font-black uppercase tracking-widest text-ice flex items-center gap-3">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                Catálogo
              </h2>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden md:block">Dicionário de dados procedurais e probabilidades estruturadas</p>
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setShowOnlyLegacy(!showOnlyLegacy)}
              className={`md:hidden flex items-center gap-2 px-3 py-1.5 rounded border transition-all duration-300 ${
                showOnlyLegacy 
                  ? 'border-gold/50 bg-gold/5 text-gold shadow-[0_0_10px_rgba(255,191,0,0.1)]' 
                  : 'border-white/10 text-white/40'
              }`}
            >
              {showOnlyLegacy ? <Zap className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="text-[9px] font-bold uppercase tracking-wider">Legado</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto items-center">
            {/* Desktop Toggle */}
            <button 
              onClick={() => setShowOnlyLegacy(!showOnlyLegacy)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300 h-8 md:h-9 ${
                showOnlyLegacy 
                  ? 'border-gold/50 bg-gold/5 text-gold shadow-[0_0_15px_rgba(255,191,0,0.15)]' 
                  : 'border-white/10 text-white/40 hover:border-white/20'
              }`}
              title="Filtrar apenas itens não convertidos"
            >
              {showOnlyLegacy ? <Zap className="w-3.5 h-3.5 animate-pulse" /> : <Zap className="w-3.5 h-3.5 opacity-40" />}
              <span className="text-[9px] font-bold uppercase tracking-widest">Apenas Legado</span>
            </button>

            <div className="relative w-full md:w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input 
                type="text" 
                placeholder="Filtrar..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-dark-border rounded-md px-8 py-1.5 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 h-8 md:h-9"
              />
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryKey)}
              className="w-full md:w-auto flex-1 md:flex-none bg-black/40 border border-dark-border rounded-md px-3 py-1.5 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 appearance-none min-w-[140px] h-8 md:h-9"
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>

            <button 
              onClick={handleCopyAll}
              className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md font-mono text-[9px] uppercase tracking-widest transition-all w-full md:w-auto h-8 md:h-9 ${
                copied ? 'bg-emerald-500 text-black font-bold' : 'bg-gold text-black hover:bg-gold-hover font-bold shadow-lg'
              }`}
            >
              {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {data.length > 0 ? (
              data.map((item) => {
                const migrated = isItemMigrated(item.text);
                const isItemCopied = copiedItem === item.text;
                
                return (
                  <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={item.id}
                    onClick={() => handleCopyItem(item.text)}
                    className="group flex items-center justify-between gap-4 p-3 md:p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 text-left"
                  >
                    <div className="flex-1 flex flex-col gap-1 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full transition-colors shrink-0 bg-white/10 group-hover:bg-gold" />
                        <span className={`text-xs md:text-sm transition-colors leading-relaxed ${migrated ? 'text-blue-500 font-medium' : 'text-white/70 group-hover:text-ice'}`}>
                          {item.text}
                        </span>
                      </div>
                      
                      {migrated && (
                        <div className="pl-3 space-y-0.5 mt-2 border-l border-white/5 ml-1.5">
                          {getRegistryInfo(item.text)?.data.rules?.map((rule: any, index: number) => renderRuleText(rule, index))}
                        </div>
                      )}
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {isItemCopied ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 whitespace-nowrap"
                        >
                          <Check className="w-3 h-3" />
                          COPIADO
                        </motion.div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy className="w-3 h-3 text-white/20 hover:text-gold" />
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border border-dark-border flex items-center justify-center mx-auto opacity-20">
                  <Book className="w-8 h-8" />
                </div>
                <p className="text-sm font-mono text-white/20 uppercase tracking-widest">Nenhum registro encontrado nesta categoria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="shrink-0 py-2.5 px-4 border-t border-dark-border bg-black/40 text-center">
        <p className="text-[8px] md:text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] md:tracking-[0.5em]">
          Total de {data.length} entradas <span className="hidden md:inline">detectadas no setor {selectedCategory.toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
};
