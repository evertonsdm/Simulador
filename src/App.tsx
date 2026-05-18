/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  RefreshCw, 
  Copy, 
  Trash2, 
  Check, 
  Zap, 
  ShieldCheck, 
  Terminal,
  Settings,
  Scale,
  Brain,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  MapPin,
  Briefcase,
  Layers,
  Anchor,
  Link2Off,
  EyeOff,
  Eye,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Info,
  Globe,
  Flame,
  Ruler,
  Activity,
  Home,
  Car,
  Camera,
  Book,
  MonitorPlay
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { BodyMap } from './components/BodyMap';
import { 
  generateCharacterData
} from './services/characterGenerator';
import { ProbData, GenerationOptions, CharacterResult } from './types/character';
import { SHINY_EVENTS } from './data/staticData';
import { NIVEIS_V, NIVEIS_NV } from './rules/conditions';
import { CONDITION_TO_PARTS } from './services/bodyPartMapping';

import { ConditionMapperTool } from './components/ConditionMapperTool';
import { CatalogViewer } from './components/CatalogViewer';
import { ProbabilitySandbox } from './components/ProbabilitySandbox';
import { CATEGORIES } from './components/RuleForge';
import { RULES_REGISTRY } from './data/rulesRegistry';
import { RuleForge } from './components/RuleForge';

// --- Types ---
interface FilterState {
  fixedBioSex: 'Masculino' | 'Feminino' | null;
  fixedIdentityTerm: string | null;
  fixedAge: string;
  fixedRegion: 'Sul' | 'Norte' | 'Nordeste' | 'Sudeste' | 'Centro-Oeste' | null;
  fixedClass: string | null;
  fixedShiny: string | null;
  fixedCondition: string | null;
  minVisibleLevel: number;
  minNonVisibleLevel: number;
}

// --- Components ---

const Badge = ({ children, color = 'gold' }: { children: React.ReactNode, color?: string }) => (
  <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-mono tracking-widest uppercase flex items-center gap-1 ${
    color === 'gold' ? 'bg-gold/10 border-gold/40 text-gold' : 
    color === 'red' ? 'bg-carmine/10 border-carmine/40 text-carmine' :
    'bg-white/5 border-white/10 text-white/40'
  }`}>
    {children}
  </span>
);

const Prob = ({ value }: { value?: ProbData | ProbData[] }) => {
  if (!value || Array.isArray(value) || typeof value.prob !== 'number') return null;
  return (
    <span className="text-[10px] text-white/20 font-mono ml-1">
      ({value.prob.toFixed(1)}%{value.poolSize ? `| 1/${value.poolSize}` : ''})
    </span>
  );
};

const MigratedItem = ({ name, migratedList }: { name: string, migratedList?: string[] }) => {
  if (!name) return null;
  
  const normalize = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  
  const normalizedName = normalize(name);
  const isMigrated = migratedList?.some(m => normalize(m) === normalizedName);
  
  if (!isMigrated) return <>{name}</>;
  
  return (
    <span className="text-blue-500 font-extrabold drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse-slow">
      {name}
    </span>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<'simulator' | 'mapper' | 'catalog' | 'sandbox' | 'ruleforge'>('simulator');
  const [result, setResult] = useState<CharacterResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isBodyMapEditor, setIsBodyMapEditor] = useState(false);
  const [affectedParts, setAffectedParts] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const conversionStats = useMemo(() => {
    let total = 0;
    const countItems = (data: any) => {
      if (Array.isArray(data)) {
        total += data.length;
      } else if (typeof data === 'object' && data !== null) {
        for (const key in data) {
          countItems(data[key]);
        }
      }
    };
    CATEGORIES.forEach(cat => countItems(cat.data));
    
    let converted = 0;
    for (const catKey in RULES_REGISTRY) {
      if ((RULES_REGISTRY as any)[catKey]) {
        converted += Object.keys((RULES_REGISTRY as any)[catKey]).length;
      }
    }
    
    return {
      total,
      converted,
      notConverted: total - converted
    };
  }, [RULES_REGISTRY]);

  const handlePartToggle = (id: string) => {
    if (id === 'reset') {
      setAffectedParts([]);
      return;
    }
    setAffectedParts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const mapConditionsToParts = useCallback((conditions: string[]): string[] => {
    const parts = new Set<string>();
    conditions.forEach(cond => {
      const mapping = CONDITION_TO_PARTS[cond];
      if (mapping) {
        if (!Array.isArray(mapping)) {
          // It's a RandomMapping { options: string[], roll: number }
          const shuffled = [...mapping.options].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, mapping.roll);
          selected.forEach(p => parts.add(p));
        } else if (Array.isArray(mapping[0])) {
          // It's a choice mapping like [['right-arm'], ['left-arm']]
          // We pick one randomly
          const choice = mapping[Math.floor(Math.random() * mapping.length)] as string[];
          choice.forEach(p => parts.add(p));
        } else {
          // It's a direct list of parts
          (mapping as string[]).forEach(p => parts.add(p));
        }
      }
    });
    return Array.from(parts);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    fixedBioSex: null,
    fixedIdentityTerm: null,
    fixedAge: '',
    fixedRegion: null,
    fixedClass: null,
    fixedShiny: null,
    fixedCondition: null,
    minVisibleLevel: 0,
    minNonVisibleLevel: 0,
  });

  const [locks, setLocks] = useState({
    sex: false,
    identity: false,
    age: false,
    region: false,
    class: false,
    shiny: false,
    condition: false
  });

  const allConditions = useMemo(() => {
    const v = Object.values(NIVEIS_V).flat().map(c => c.name);
    const nv = Object.values(NIVEIS_NV).flat().map(c => c.name);
    return Array.from(new Set([...v, ...nv])).sort();
  }, []);

  const handleGenerate = useCallback(() => {
    const options: GenerationOptions = {
      fixedBioSex: filters.fixedBioSex || undefined,
      fixedIdentityTerm: filters.fixedIdentityTerm || undefined,
      fixedAge: filters.fixedAge ? parseInt(filters.fixedAge) : undefined,
      fixedRegion: filters.fixedRegion || undefined,
      fixedClass: filters.fixedClass || undefined,
      fixedShiny: filters.fixedShiny || undefined,
      fixedCondition: filters.fixedCondition || undefined,
      minVisibleLevel: filters.minVisibleLevel,
      minNonVisibleLevel: filters.minNonVisibleLevel
    };
    const newResult = generateCharacterData(options);
    setResult(newResult);
    setAffectedParts(mapConditionsToParts(newResult.metadata.vConditions));
    setCopied(false);
  }, [filters, mapConditionsToParts]);

  const handleSandboxFinish = (finalResult: CharacterResult) => {
    setResult(finalResult);
    setActiveView('simulator');
    setAffectedParts(mapConditionsToParts(finalResult.metadata.vConditions));
  };

  const toggleLock = (type: 'sex' | 'identity' | 'age' | 'region' | 'class' | 'shiny' | 'condition') => {
    if (!result) return;
    
    setLocks(l => {
      const newState = { ...l, [type]: !l[type] };
      
      let identityFromGen = "";
      if (result.metadata.genero) {
        identityFromGen = result.metadata.genero.includes("Transgênero") ? "Transgênero" : 
                          result.metadata.genero.includes("Não-Binário") ? "Não-Binário" : 
                          result.metadata.genero.includes("Cisgênero") ? "Cisgênero" : "Transexual";
      }

      // If we are locking, update the filter with current value
      if (newState[type]) {
        setFilters(f => ({
          ...f,
          fixedBioSex: type === 'sex' ? (result.metadata.bioSex as any) : f.fixedBioSex,
          fixedIdentityTerm: type === 'identity' ? identityFromGen : f.fixedIdentityTerm,
          fixedAge: type === 'age' ? String(result.metadata.idade) : f.fixedAge,
          fixedRegion: type === 'region' ? (result.metadata.regiao as any) : f.fixedRegion,
          fixedClass: type === 'class' ? result.metadata.classe : f.fixedClass,
          fixedShiny: type === 'shiny' ? result.metadata.shiny : f.fixedShiny,
          fixedCondition: type === 'condition' ? (result.metadata.vConditions[0] || result.metadata.nvConditions[0] || null) : f.fixedCondition
        }));
      } else {
        // If unlocking, clear that filter
        setFilters(f => ({
          ...f,
          fixedBioSex: type === 'sex' ? null : f.fixedBioSex,
          fixedIdentityTerm: type === 'identity' ? null : f.fixedIdentityTerm,
          fixedAge: type === 'age' ? '' : f.fixedAge,
          fixedRegion: type === 'region' ? null : f.fixedRegion,
          fixedClass: type === 'class' ? null : f.fixedClass,
          fixedShiny: type === 'shiny' ? null : f.fixedShiny,
          fixedCondition: type === 'condition' ? null : f.fixedCondition
        }));
      }
      return newState;
    });
  };

  const handleClear = useCallback(() => {
    setResult(null);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return [
      { subject: 'Saúde Física', A: result.metadata.metrics.physical, fullMark: 100 },
      { subject: 'Saúde Mental', A: result.metadata.metrics.mental, fullMark: 100 },
      { subject: 'Impacto Social', A: result.metadata.metrics.relational, fullMark: 100 },
      { subject: 'Renda', A: result.metadata.metrics.income, fullMark: 100 },
      { subject: 'Resiliência', A: result.metadata.metrics.resilience, fullMark: 100 },
      { subject: 'Mobilidade', A: result.metadata.metrics.urbanLife, fullMark: 100 },
    ];
  }, [result]);

  const isShiny = result ? result.metadata.shiny !== "Nenhum evento significativo detectado." : false;
  const isIllicito = result?.metadata.statusOcupacional?.includes("Marginal") ?? false;

  return (
    <div className="h-[100dvh] bg-dark-bg text-ice font-sans flex overflow-hidden">
      
      {/* Sidebar Filters */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="h-full bg-dark-surface border-r border-dark-border flex flex-col shrink-0 overflow-hidden relative z-50"
      >
        <div className="p-6 flex flex-col gap-8 w-[300px] h-full overflow-y-auto custom-scrollbar pb-20">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gold" />
            <h2 className="font-display font-bold uppercase tracking-[0.2em] text-xs">Filtros de Recrutamento</h2>
          </div>

          <div className="space-y-6">
            {/* BioSex Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Gênero Bio</label>
                <button 
                  onClick={() => toggleLock('sex')}
                  disabled={!result && !filters.fixedBioSex}
                  className="disabled:opacity-20"
                >
                  {locks.sex || filters.fixedBioSex ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Masculino', 'Feminino'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilters(f => ({ ...f, fixedBioSex: f.fixedBioSex === s ? null : s as any }))}
                    className={`py-2 px-3 text-[9px] font-bold rounded border transition-all ${
                      filters.fixedBioSex === s ? 'bg-gold border-gold text-black' : 'bg-transparent border-dark-border text-white/40 hover:text-white'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Identity Term Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Identidade</label>
                <button 
                  onClick={() => toggleLock('identity')}
                  disabled={!result && !filters.fixedIdentityTerm}
                  className="disabled:opacity-20"
                >
                  {locks.identity || filters.fixedIdentityTerm ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <select 
                value={filters.fixedIdentityTerm || ''}
                onChange={e => setFilters(f => ({ ...f, fixedIdentityTerm: e.target.value || null }))}
                className="w-full bg-black/40 border border-dark-border rounded px-3 py-2 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 appearance-none"
              >
                <option value="">SORTEAR</option>
                <option value="Cisgênero">Cisgênero</option>
                <option value="Transgênero">Transgênero</option>
                <option value="Transexual">Transexual</option>
                <option value="Não-Binário">Não-Binário</option>
              </select>
            </div>

            {/* Age Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Idade</label>
                <button 
                  onClick={() => toggleLock('age')}
                  disabled={!result && !filters.fixedAge}
                  className="disabled:opacity-20"
                >
                  {locks.age || filters.fixedAge ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <input 
                type="number" 
                value={filters.fixedAge}
                onChange={e => setFilters(f => ({ ...f, fixedAge: e.target.value }))}
                placeholder="Rand [15-60]"
                className="w-full bg-black/40 border border-dark-border rounded px-3 py-2 text-xs font-mono text-gold focus:outline-none focus:border-gold/40"
              />
            </div>

            {/* STRATA Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Classe Social</label>
                <button onClick={() => toggleLock('class')} disabled={!result && !filters.fixedClass} className="disabled:opacity-20">
                  {locks.class || filters.fixedClass ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <select 
                value={filters.fixedClass || ''}
                onChange={e => setFilters(f => ({ ...f, fixedClass: e.target.value || null }))}
                className="w-full bg-black/40 border border-dark-border rounded px-3 py-2 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 appearance-none"
              >
                <option value="">Aleatória</option>
                <option value="Base Precarizada / Vulnerável">Base Precarizada</option>
                <option value="Classe Média Baixa / A Engrenagem">Classe Média Baixa</option>
                <option value="Classe Média Alta / Estabilidade">Classe Média Alta</option>
                <option value="Elite / Alta Renda">Elite / Alta Renda</option>
              </select>
            </div>

            {/* Region Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Região</label>
                <button 
                  onClick={() => toggleLock('region')}
                  disabled={!result && !filters.fixedRegion}
                  className="disabled:opacity-20"
                >
                  {locks.region || filters.fixedRegion ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <select 
                value={filters.fixedRegion || ''}
                onChange={e => setFilters(f => ({ ...f, fixedRegion: e.target.value as any || null }))}
                className="w-full bg-black/40 border border-dark-border rounded px-3 py-2 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 appearance-none"
              >
                <option value="">Aleatória</option>
                {['Sul', 'Sudeste', 'Norte', 'Nordeste', 'Centro-Oeste'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Shiny Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Evento Shiny</label>
                <button onClick={() => toggleLock('shiny')} disabled={!result && !filters.fixedShiny} className="disabled:opacity-20">
                  {locks.shiny || filters.fixedShiny ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <select 
                value={filters.fixedShiny || ''}
                onChange={e => setFilters(f => ({ ...f, fixedShiny: e.target.value || null }))}
                className="w-full bg-black/40 border border-dark-border rounded px-3 py-2 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 appearance-none"
              >
                <option value="">Nenhum / Aleatório</option>
                {SHINY_EVENTS.map((e, i) => (
                  <option key={i} value={e.text}>{e.text.length > 30 ? e.text.substring(0, 30) + '...' : e.text}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Condição Específica</label>
                <button onClick={() => toggleLock('condition')} disabled={!result && !filters.fixedCondition} className="disabled:opacity-20">
                  {locks.condition || filters.fixedCondition ? <Lock className="w-3 h-3 text-gold" /> : <Unlock className="w-3 h-3 text-white/20" />}
                </button>
              </div>
              <select 
                value={filters.fixedCondition || ''}
                onChange={e => setFilters(f => ({ ...f, fixedCondition: e.target.value || null }))}
                className="w-full bg-black/40 border border-dark-border rounded px-3 py-2 text-[10px] font-mono text-gold focus:outline-none focus:border-gold/40 appearance-none"
              >
                <option value="">Nenhuma / Aleatória</option>
                {allConditions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Clinical Thresholds */}
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                  <span className="text-emerald-500/60">Nível Visível Mín.</span>
                  <span className="text-emerald-500">{filters.minVisibleLevel || 'OFF'}</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={filters.minVisibleLevel}
                  onChange={e => setFilters(f => ({ ...f, minVisibleLevel: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-500 h-1 bg-dark-border appearance-none rounded"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                  <span className="text-gold/60">Nível Oculto Mín.</span>
                  <span className="text-gold">{filters.minNonVisibleLevel || 'OFF'}</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={filters.minNonVisibleLevel}
                  onChange={e => setFilters(f => ({ ...f, minNonVisibleLevel: parseInt(e.target.value) }))}
                  className="w-full accent-gold h-1 bg-dark-border appearance-none rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070707] relative overflow-hidden">
        
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-12 bg-dark-surface border border-dark-border rounded-full flex items-center justify-center z-[60] hover:border-gold/40 group transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3 text-white/40 group-hover:text-gold" /> : <ChevronRight className="w-3 h-3 text-white/40 group-hover:text-gold" />}
        </button>

        {/* Header */}
        <header className="h-14 border-b border-white/5 px-4 md:px-8 flex items-center justify-center shrink-0 bg-black/60 backdrop-blur-xl z-40 sticky top-0">
          <nav className="flex items-center justify-center gap-1.5 md:gap-4 max-w-4xl w-full">
            {/* Simulator Tab */}
            <button 
              onClick={() => setActiveView('simulator')}
              title="Simulador Principal"
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-200 ${
                activeView === 'simulator' 
                  ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <MonitorPlay size={16} />
              <span className="hidden md:inline">Simulador</span>
            </button>

            {/* Catalog Tab */}
            <button 
              onClick={() => setActiveView('catalog')}
              title="Dicionário de Dados"
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-200 ${
                activeView === 'catalog' 
                  ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Book size={16} />
              <span className="hidden md:inline">Catálogo</span>
            </button>

            {/* RuleForge Tab */}
            <button 
              onClick={() => setActiveView('ruleforge')}
              title="Editor de Regras"
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-200 ${
                activeView === 'ruleforge' 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Settings size={16} />
              <span className="hidden md:inline">RuleForge</span>
            </button>

            {/* Mapper Tab */}
            <button 
              onClick={() => setActiveView('mapper')}
              title="Editor de BodyMap"
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-200 ${
                activeView === 'mapper' 
                  ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Layers size={16} />
              <span className="hidden md:inline">Mapper</span>
            </button>

            {/* Sandbox Tab */}
            <button 
              onClick={() => setActiveView('sandbox')}
              title="Sandbox de Probabilidades"
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-200 ${
                activeView === 'sandbox' 
                  ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Zap size={16} />
              <span className="hidden md:inline">Sandbox</span>
            </button>

            {/* Stats (Hidden on small mobile) */}
            <div className={`hidden lg:flex px-3 py-1.5 rounded border border-white/5 bg-black/40 items-center gap-2 ml-4`}>
              <span className="text-[9px] font-mono tracking-widest">
                <span className="text-blue-500 font-bold">{conversionStats.converted}</span>
                <span className="text-white/20"> / </span>
                <span className="text-white/40">{conversionStats.total}</span>
              </span>
            </div>
          </nav>
        </header>

        {/* Content Scroll Area */}
        {activeView === 'mapper' ? (
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <ConditionMapperTool />
          </div>
        ) : activeView === 'catalog' ? (
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <CatalogViewer />
          </div>
        ) : activeView === 'sandbox' ? (
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <ProbabilitySandbox onFinish={handleSandboxFinish} />
          </div>
        ) : activeView === 'ruleforge' ? (
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <RuleForge />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 pb-24">
          <div className="max-w-6xl mx-auto flex flex-col gap-3 md:gap-6">
            
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full border border-dark-border flex items-center justify-center bg-dark-surface shadow-2xl relative">
                    <div className="absolute inset-0 rounded-full border border-gold/5 animate-ping"></div>
                    <Terminal className="w-8 h-8 text-gold/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-white/60 tracking-widest uppercase">Base de Dados Vazia</h3>
                    <p className="text-xs text-white/20 font-mono">Configure os filtros e acione o Motor para gerar um perfil de alta fidelidade.</p>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    className="px-10 py-4 bg-gold text-black font-black uppercase text-[10px] tracking-widest rounded hover:bg-gold-hover transition-all flex items-center gap-3 shadow-xl"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Iniciar Varredura
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min"
                >
                  {/* Bio Card (High Profile) */}
                  <div className="md:col-span-8 bg-dark-surface border border-dark-border rounded-lg p-4 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <User className="w-64 h-64 -mr-20 -mt-20" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8">
                      {/* Avatar Placeholder */}
                      <div className="w-32 h-32 md:w-40 md:h-40 bg-black rounded-lg border border-dark-border flex items-center justify-center shrink-0 overflow-hidden relative">
                        <User className="w-20 h-20 text-white/5" />
                        <div className="absolute bottom-0 inset-x-0 bg-gold/10 text-gold text-[8px] font-mono text-center py-1 border-t border-gold/20">
                          ID: REF-{Math.floor(Math.random()*10000)}
                        </div>
                        {/* Scan Lines atop "Photo" */}
                        <div className="absolute inset-0 scan-lines opacity-20 pointer-events-none"></div>
                      </div>

                      <div className="space-y-4 md:space-y-6 flex-1">
                        <div className="space-y-1">
                          <h2 className="font-display font-black text-3xl md:text-4xl text-ice tracking-tighter uppercase leading-none">{result.metadata.nome}</h2>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge>{result.metadata.idade} Anos<Prob value={result.metadata.probs.idade} /></Badge>
                            <Badge color="white">
                              {result.metadata.regiao} • {result.metadata.estado}
                              {(() => {
                                const regProb = result.metadata.probs.regiao;
                                if (!regProb || Array.isArray(regProb)) return null;
                                const counts: Record<string, number> = { 'Sudeste': 4, 'Sul': 3, 'Nordeste': 9, 'Norte': 7, 'Centro-Oeste': 4 };
                                const stateCount = counts[result.metadata.regiao] || 1;
                                const combinedProb = regProb.prob / stateCount;
                                const combinedPool = regProb.poolSize * stateCount;
                                return (
                                  <span className="text-[10px] text-white/20 font-mono ml-1">
                                    ({combinedProb.toFixed(1)}% | 1/{combinedPool})
                                  </span>
                                );
                              })()}
                            </Badge>
                            <Badge color="white"><MigratedItem name={result.metadata.etnia} migratedList={result.metadata.migratedItems} /><Prob value={result.metadata.probs.etnia} /></Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-2">
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><HeartPulse className="w-3 h-3" /> Gênero</p>
                            <p className="text-xs font-bold text-white/80"><MigratedItem name={result.metadata.genero} migratedList={result.metadata.migratedItems} /><Prob value={result.metadata.probs.genero} /></p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3" /> Orientação</p>
                            <p className="text-xs font-bold text-white/80"><MigratedItem name={result.metadata.orientacao} migratedList={result.metadata.migratedItems} /><Prob value={result.metadata.probs.orientacao} /></p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Localização</p>
                            <p className="text-xs font-bold text-white/80 truncate">{result.metadata.perfilUrbano.split(' - ')[0]}<Prob value={result.metadata.probs.perfilUrbano} /></p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Globe className="w-3 h-3" /> Tribo</p>
                            <p className="text-xs font-bold text-white/80"><MigratedItem name={result.metadata.triboUrbana} migratedList={result.metadata.migratedItems} /><Prob value={result.metadata.probs.triboUrbana} /></p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Ruler className="w-3 h-3" /> Biometria</p>
                            <p className="text-xs font-bold text-white/80">{result.metadata.altura}m | {result.metadata.peso}kg</p>
                            <p className="text-[9px] text-white/40 leading-none">IMC: {result.metadata.imc.toFixed(1)} {result.metadata.massaMagra ? '(Muscular)' : ''}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Activity className="w-3 h-3" /> Biotipo</p>
                            <p className="text-xs font-bold text-white/80 capitalize">{(result.metadata.biotipo || '').toLowerCase()} {result.metadata.biotipoAnomalia ? `(${result.metadata.biotipoAnomalia})` : ''}<Prob value={result.metadata.probs.biotipoAnomalia || result.metadata.probs.biotipo} /></p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3" /> Cena de Sexualidade</p>
                            <p className="text-xs font-bold text-gold/80">{result.metadata.cenaSexualidade}<Prob value={result.metadata.probs.cenaSexualidade} /></p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Brain className="w-3 h-3" /> Temperamento</p>
                            <p className="text-xs font-bold text-white/80">{result.metadata.temperamento}<Prob value={result.metadata.probs.temperamento} /></p>
                          </div>
                          <div className="space-y-1 md:col-span-3">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Flame className="w-3 h-3" /> Fetiches & Sombras</p>
                            <p className="text-xs font-bold text-ice/80">
                              {result.metadata.fetiches.length > 0 
                                ? result.metadata.fetiches.map((f, idx) => (
                                    <span key={idx}>
                                      <MigratedItem name={f} migratedList={result.metadata.migratedItems} /><Prob value={(result.metadata.probs.fetiches as ProbData[])[idx]} />{idx < result.metadata.fetiches.length - 1 ? ', ' : ''}
                                    </span>
                                  ))
                                : <span className="text-white/40 italic">Nenhum fetiche detectado <Prob value={result.metadata.probs.fetichesNone} /></span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Brutalism Accent */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-gold to-transparent opacity-20"></div>
                  </div>

                  {/* Status / Econ Card */}
                  <div id="status-card" className={`md:col-span-4 border rounded-lg p-3 md:p-6 flex flex-col justify-between group overflow-hidden relative ${isIllicito ? 'bg-carmine/5 border-carmine/40 ring-1 ring-carmine/20' : 'bg-dark-surface border-dark-border'}`}>
                    {isIllicito && <div className="absolute inset-0 classified-pattern opacity-40 pointer-events-none"></div>}
                    <div className="space-y-3 md:space-y-6 relative z-10">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 ${isIllicito ? 'text-carmine' : 'text-white/40'}`}>
                          <Scale className="w-3.5 h-3.5" /> Estratificação
                        </h3>
                        {isIllicito && <Badge color="red">Alvo Identificado</Badge>}
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-gold uppercase tracking-widest">
                            <MigratedItem name={result.metadata.classe} migratedList={result.metadata.migratedItems} /><Prob value={result.metadata.probs.classe} /></p>
                          <p className="text-xs text-white/60 leading-tight">{result.metadata.statusOcupacional}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-display font-bold text-white/80"><MigratedItem name={result.metadata.profissao} migratedList={result.metadata.migratedItems} /><Prob value={result.metadata.probs.profissao} /></p>
                        </div>
                        <div className="pt-1 space-y-2 md:space-y-3">
                           <div className="bg-black/20 p-2 rounded border border-white/5 space-y-1.5">
                             <div>
                               <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1"><Home className="w-2.5 h-2.5" /> Habitação</p>
                               <p className="text-[10px] text-white/60 truncate">{result.metadata.habitacao.replace("[AÇÃO DO LLM]: Estrutura e Geografia: '", "").replace("'.", "")}</p>
                             </div>
                             <div>
                               <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1"><Car className="w-2.5 h-2.5" /> Logística</p>
                               <p className="text-[10px] text-white/60">{result.metadata.transporte}<Prob value={result.metadata.probs.transporte} /></p>
                             </div>
                             <div className="pt-1.5 border-t border-white/5 mt-0.5">
                               <p className="text-[8px] font-mono text-gold/40 uppercase tracking-widest mb-1">Fricção Urbana</p>
                               <p className="text-[10px] text-white/50 leading-tight italic line-clamp-2 md:line-clamp-none">"{result.metadata.friccaoUrbana}"</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-4 md:pt-6">
                      <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest text-white/20">
                        <span>Privilégios Sociais</span>
                        <span>{result.metadata.metrics.income}%</span>
                      </div>
                      <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-dark-border">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.metadata.metrics.income}%` }}
                          className="h-full bg-gold/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Graph Card */}
                  <div className="md:col-span-4 bg-dark-surface border border-dark-border rounded-lg p-4 md:p-6 flex flex-col h-[300px]">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-4">Métricas de Impacto</h3>
                    <div className="flex-1 min-h-0 -mx-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                          <PolarGrid stroke="#222" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#444', fontSize: 8, fontStyle: 'monospace' }} />
                          <Radar
                            name="Atributos"
                            dataKey="A"
                            stroke="#ffbf00"
                            fill="#ffbf00"
                            fillOpacity={0.2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Health Card */}
                  <div className="md:col-span-8 bg-dark-surface border border-dark-border rounded-lg p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2"><HeartPulse className="w-3.5 h-3.5" /> Prontuário Médico</h3>
                      <div className="flex gap-2">
                        {result.metadata.metrics.physical < 50 ? <Badge color="red">Crítico</Badge> : <Badge color="gold">Estável</Badge>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Body Map */}
                      <div className="lg:col-span-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-dark-border pb-2 group">
                          <div className="flex items-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                            <Activity className="w-3 h-3" /> Mapa Bioestatístico
                          </div>
                          <button 
                            onClick={() => setIsBodyMapEditor(!isBodyMapEditor)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-tighter transition-all ${isBodyMapEditor ? 'bg-gold text-black font-bold' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                          >
                            <Settings className={`w-2.5 h-2.5 ${isBodyMapEditor ? 'animate-spin-slow' : ''}`} />
                            {isBodyMapEditor ? 'Sair do Editor' : 'Modo Editor'}
                          </button>
                        </div>
                          <BodyMap 
                            conditions={result.metadata.vConditions} 
                            affectedParts={affectedParts}
                            highlightedParts={affectedParts}
                            onPartToggle={handlePartToggle}
                            editorMode={isBodyMapEditor} 
                          />
                      </div>

                      {/* Right: Lists */}
                      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {/* Visible */}
                        <div className="space-y-3 p-4 bg-black/30 rounded border border-dark-border/50 h-fit">
                          <div className="flex items-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-widest border-b border-dark-border pb-2">
                            <Eye className="w-3 h-3" /> Condições Visíveis
                          </div>
                          <ul className="space-y-2">
                            {result.metadata.vConditions.length > 0 ? result.metadata.vConditions.map((c, i) => (
                              <li key={i} className="group/cond text-[11px] text-white/70 flex items-start gap-2 hover:text-gold transition-colors cursor-default">
                                <span className="text-gold mt-1 group-hover/cond:scale-125 transition-transform">•</span> <MigratedItem name={c} migratedList={result.metadata.migratedItems} /><Prob value={(result.metadata.probs.vConditions as ProbData[])[i]} />
                              </li>
                            )) : <li className="text-[10px] text-white/20 italic">Nenhum sinal físico evidente <Prob value={result.metadata.probs.vConditionsNone} /></li>}
                          </ul>
                        </div>

                        {/* Not Visible */}
                        <div className="space-y-3 p-4 bg-black/30 rounded border border-dark-border/50 h-fit">
                          <div className="flex items-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-widest border-b border-dark-border pb-2">
                            <EyeOff className="w-3 h-3" /> Patologias Ocultas
                          </div>
                          <ul className="space-y-2">
                            {result.metadata.nvConditions.length > 0 ? result.metadata.nvConditions.map((c, i) => (
                              <li key={i} className="group/cond text-[11px] text-white/70 flex items-start gap-2 hover:text-carmine transition-colors cursor-default">
                                <span className="text-carmine mt-1 group-hover/cond:scale-125 transition-transform">•</span> <MigratedItem name={c} migratedList={result.metadata.migratedItems} /><Prob value={(result.metadata.probs.nvConditions as ProbData[])[i]} />
                              </li>
                            )) : <li className="text-[10px] text-white/20 italic">Sem registros internos <Prob value={result.metadata.probs.nvConditionsNone} /></li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relational Baggage */}
                  <div className="md:col-span-7 bg-dark-surface border border-dark-border rounded-lg p-4 md:p-6 space-y-4 md:space-y-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Bagagem Relacional</h3>
                    
                    <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                      <div className="space-y-4">
                        {result.metadata.baggage.map((item, i) => (
                          <div key={i} className={`group/item flex items-start gap-3 p-3 rounded border transition-all ${
                            item.type === "Positivo" ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                            item.type === "Negativo" ? 'bg-carmine/5 border-carmine/20 hover:border-carmine/40 shadow-[0_0_15px_rgba(153,0,0,0.05)]' :
                            'bg-black/20 border-white/5 hover:border-white/10'
                          }`}>
                            <div className="mt-0.5">
                              {item.type === "Positivo" ? <Anchor className="w-4 h-4 text-emerald-500" /> : 
                               item.type === "Negativo" ? <Link2Off className="w-4 h-4 text-carmine" /> : 
                               <Scale className="w-4 h-4 text-white/20" />}
                            </div>
                            <p className={`text-[11px] leading-relaxed transition-colors ${
                              item.isMigrated ? 'text-blue-500 font-medium' :
                              item.type === "Positivo" ? 'text-emerald-500/90' :
                              item.type === "Negativo" ? 'text-carmine/90' :
                              'text-white/60'
                            }`}>
                              {item.text} <Prob value={item.prob} />
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                   {/* Shiny / Rastro */}
                   <div className="md:col-span-5 flex flex-col gap-4">
                     {/* Shiny Event */}
                     <div className={`bg-dark-surface border rounded-lg p-4 md:p-6 flex-1 flex flex-col gap-3 md:gap-4 relative overflow-hidden transition-all duration-700 ${isShiny ? 'border-gold shadow-[0_0_40px_rgba(255,191,0,0.05)]' : 'border-dark-border'}`}>
                        {isShiny && <div className="absolute inset-0 bg-gold/5 animate-pulse pointer-events-none"></div>}
                        <div className="flex justify-between items-center relative z-10">
                          <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Evento de Destaque</h3>
                          {isShiny && <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(255,191,0,1)]"></div>}
                        </div>
                        <p className={`text-xs leading-relaxed italic relative z-10 ${isShiny ? 'text-gold font-bold' : 'text-white/40'}`}>
                          <MigratedItem name={result.metadata.shiny} migratedList={result.metadata.migratedItems} /> <Prob value={result.metadata.probs.shiny as ProbData} />
                        </p>
                        {isShiny && (
                           <div className="pt-4 border-t border-gold/10 mt-auto">
                             <p className="text-[8px] font-mono text-gold/40 uppercase tracking-widest">Procedência Unívoca / Anomalía Detectada</p>
                           </div>
                        )}
                     </div>

                      {/* Rastro Digital */}
                      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
                         <div className="flex justify-between items-center">
                           <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2"><Brain className="w-3.5 h-3.5" /> Rastro Digital</h3>
                           <Badge color="white">Psicometria: {result.metadata.resiliencia.split("'")[1] || "Estável"}</Badge>
                         </div>
                         <div className="p-3 bg-black/40 rounded border border-dark-border/50 text-[11px] text-white/60 font-mono italic">
                           "<MigratedItem name={result.metadata.rastro} migratedList={result.metadata.migratedItems} />" <Prob value={result.metadata.probs.rastro as ProbData} />
                         </div>
                         <div className="pt-2 space-y-2">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-2"><Camera className="w-3 h-3" /> Galeria Interceptada</p>
                            <div className="grid grid-cols-1 gap-1">
                               <div className="text-[9px] text-white/30 truncate border-l border-white/5 pl-2">
                                 • Psicotipo: {result.metadata.resiliencia}<Prob value={result.metadata.probs.resiliencia as ProbData} />
                               </div>
                               {result.metadata.photos.map((p, i) => (
                                 <div key={i} className="text-[9px] text-white/30 truncate border-l border-white/5 pl-2">
                                   • {p}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Footer Branding for Result */}
                   <div className="md:col-span-12 pt-4 md:pt-8 flex items-center gap-4 opacity-10">
                     <div className="h-px flex-1 bg-white/20"></div>
                     <span className="text-[9px] font-mono tracking-[1em] uppercase">End_Of_Dossier</span>
                     <div className="h-px flex-1 bg-white/20"></div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        )}

        {/* Sticky Actions Bar (Only in Simulator) */}
        {activeView === 'simulator' && (
          <div className="h-7 md:h-9 border-t border-dark-border bg-dark-bg/80 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-center gap-2 md:gap-6 shrink-0 z-50 fixed bottom-0 left-0 right-0 md:left-auto md:w-[calc(100%-0px)]">
             <button
               onClick={handleGenerate}
               className="px-2 md:px-4 h-5 md:h-6 bg-gold text-black font-black uppercase text-[8px] md:text-[9px] tracking-tight md:tracking-widest rounded hover:bg-gold-hover transition-all flex items-center gap-1 md:gap-2 shadow-lg active:scale-95"
             >
               <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
               Re-Sincronizar
             </button>
  
             <div className="hidden md:block w-px h-4 bg-dark-border mx-1"></div>
  
             <button
               onClick={handleCopy}
               disabled={!result}
               className={`px-2 md:px-4 h-5 md:h-6 border border-dark-border text-white font-bold uppercase text-[8px] md:text-[9px] tracking-tight md:tracking-widest rounded transition-all flex items-center gap-1 md:gap-2 active:scale-95 ${!result ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 hover:border-gold/30 hover:text-gold'}`}
             >
               {copied ? <Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <Copy className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-50" />}
               {copied ? 'Copiado' : 'Copiar'}
             </button>
  
             <button
               onClick={handleClear}
               disabled={!result}
               className={`px-2 md:px-4 h-5 md:h-6 border border-dark-border text-white/40 font-bold uppercase text-[8px] md:text-[9px] tracking-tight md:tracking-widest rounded transition-all flex items-center gap-1 md:gap-2 active:scale-95 ${!result ? 'opacity-20 cursor-not-allowed' : 'hover:bg-carmine/10 hover:border-carmine/40 hover:text-carmine'}`}
             >
               <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-50" />
               Expurgar
             </button>
          </div>
        )}

        {/* Global Accent - Left Bar */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gold/10 hidden md:block"></div>
      </main>
    </div>
  );
}
