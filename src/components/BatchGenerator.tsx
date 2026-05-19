
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  RefreshCw, 
  Users, 
  MapPin, 
  Activity, 
  Briefcase, 
  Zap, 
  Info,
  Plus,
  Trash2,
  Calculator,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { RULES_REGISTRY } from '../data/rulesRegistry';
import { generateCharacterData } from '../services/characterGenerator';
import { CharacterResult } from '../types/character';

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

interface ProgressBarProps {
  key?: React.Key;
  value: number;
  label: string;
  total: number;
  color?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const isItemMigrated = (label: string) => {
  const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
  const search = normalize(label);
  
  for (const category of Object.values(RULES_REGISTRY)) {
    if (typeof category === 'object' && category !== null) {
      if (Object.keys(category).some(k => normalize(k) === search)) return true;
      if (Object.values(category).some((v: any) => v.name && normalize(v.name) === search)) return true;
    }
  }
  return false;
};

const ProgressBar = ({ value, label, total, color = 'bg-indigo-600', onClick, isActive }: ProgressBarProps) => {
  const percentage = (value / total) * 100;
  const migrated = isItemMigrated(label);

  return (
    <div 
      className={`space-y-1 p-1 rounded transition-colors ${onClick ? 'cursor-pointer hover:bg-white/5' : ''} ${isActive ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between text-[10px] font-mono tracking-tighter">
        <span className={`truncate max-w-[150px] uppercase flex items-center gap-1.5 ${migrated ? 'text-blue-400 font-black' : 'text-white/60'}`}>
          {migrated && <ShieldCheck size={8} className="text-blue-500 animate-pulse" />}
          {label}
        </span>
        <span className={`${migrated ? 'text-blue-300' : 'text-white/80'}`}>{percentage.toFixed(1)}% <span className="text-white/20">({value})</span></span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${migrated ? 'bg-blue-600' : color}`}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, icon: Icon, children, className = "" }: { title: string, icon: any, children: React.ReactNode, className?: string }) => (
  <div className={`bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-4 ${className}`}>
    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
      <Icon size={16} className="text-indigo-400" />
      <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">{title}</h3>
    </div>
    <div className="flex-1 space-y-3">
      {children}
    </div>
  </div>
);

export const BatchGenerator: React.FC = () => {
  const [activeMenuMode, setActiveMenuMode] = useState<'mass' | 'calculator'>('mass');
  const [count, setCount] = useState(100);
  const [isRolling, setIsRolling] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [rawCharacters, setRawCharacters] = useState<CharacterResult[]>([]);
  const [workerStats, setWorkerStats] = useState<BatchStats | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showAllProfessions, setShowAllProfessions] = useState(false);

  // Calculator State
  const [targetCriteria, setTargetCriteria] = useState<{ category: string, key: string, name: string, value: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItemKey, setSelectedItemKey] = useState<string>('');
  const [calcResult, setCalcResult] = useState<{ matches: number, total: number } | null>(null);

  const categories = useMemo(() => ([
    { id: 'regiao', name: 'Região' },
    { id: 'classeSocial', name: 'Classe Social' },
    { id: 'etnia', name: 'Etnia' },
    { id: 'orientacao', name: 'Orientação Sexual' },
    { id: 'bioSex', name: 'Sexo Biológico' },
    { id: 'identidade', name: 'Identidade de Gênero' },
    { id: 'profissoes', name: 'Profissão' },
    { id: 'condicoesVisiveis', name: 'Condição Visível' },
    { id: 'condicoesNaoVisiveis', name: 'Condição Não Visível' },
    { id: 'tribos', name: 'Tribo Urbana' }
  ]), []);

  const extraCategoryOptions: Record<string, string[]> = {
    regiao: ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"],
    classeSocial: ["Base Precarizada / Vulnerável", "Classe Média Baixa / A Engrenagem", "Classe Média Alta / Estabilidade", "Elite / Alta Renda", "Morador de Rua / Extrema Pobreza"],
    etnia: ["Parda", "Preta", "Branca", "Amarela", "Indígena"],
    orientacao: ["Heterossexual", "Homossexual", "Bissexual", "Pansexual", "Assexual"],
    bioSex: ["Masculino", "Feminino"],
    identidade: ["Homem", "Mulher", "Não-Binário"],
    tribos: ["Religioso Fervoroso", "Militarista / Ordem em Primeiro Lugar", "Alternativo / Underground", "Faria Limer / Performance", "Acadêmico / Intelectual", "Do Gueto / Correria", "Agro / Interiorano"]
  };

  const currentCategoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    
    if (RULES_REGISTRY[selectedCategory]) {
      return Object.entries(RULES_REGISTRY[selectedCategory]).map(([key, item]) => ({
        key,
        name: item.name || key
      }));
    }
    
    if (extraCategoryOptions[selectedCategory]) {
      return extraCategoryOptions[selectedCategory].map(val => ({
        key: val,
        name: val
      }));
    }
    
    return [];
  }, [selectedCategory]);

  const handleAddCriterion = () => {
    if (!selectedCategory || !selectedItemKey) return;
    
    const item = currentCategoryItems.find(i => i.key === selectedItemKey);
    if (!item) return;

    if (targetCriteria.some(c => c.category === selectedCategory && c.key === selectedItemKey)) return;

    setTargetCriteria(prev => [...prev, { 
      category: selectedCategory, 
      key: selectedItemKey, 
      name: item.name,
      value: item.name // Use the display name for matching in worker if it's a registry item
    }]);
    
    setSelectedItemKey('');
  };

  const removeCriterion = (index: number) => {
    setTargetCriteria(prev => prev.filter((_, i) => i !== index));
    setCalcResult(null);
  };

  const handleRunCalculator = () => {
    if (targetCriteria.length === 0) return;
    setIsRolling(true);
    setCalcResult(null);
    setProgressCount(0);

    const worker = new Worker(new URL('../services/batchWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      const { type, matches, total, current } = e.data;
      if (type === 'progress') {
        setProgressCount(current);
      } else if (type === 'calculator_complete') {
        setCalcResult({ matches, total });
        setIsRolling(false);
        worker.terminate();
      }
    };
    
    worker.postMessage({ type: 'calculator', criteria: targetCriteria });
  };

  const handleRollBatch = () => {
    setIsRolling(true);
    setProgressCount(0);
    setRawCharacters([]);
    setWorkerStats(null);
    setActiveFilters({});
    
    const worker = new Worker(new URL('../services/batchWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      const { type, current, stats: finalStats, characters } = e.data;
      
      if (type === 'progress') {
        setProgressCount(current);
      } else if (type === 'complete') {
        setRawCharacters(characters || []);
        setWorkerStats(finalStats);
        setIsRolling(false);
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setIsRolling(false);
      worker.terminate();
    };

    worker.postMessage({ count });
  };

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[category] === value) {
        delete newFilters[category];
      } else {
        newFilters[category] = value;
      }
      return newFilters;
    });
  };

  const clearFilters = () => setActiveFilters({});

  const filteredCharacters = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) return rawCharacters;
    
    return rawCharacters.filter(char => {
      const meta = char.metadata;
      for (const [category, value] of Object.entries(activeFilters)) {
        if (category === 'region' && meta.regiao !== value) return false;
        if (category === 'socialClass' && meta.classe !== value) return false;
        if (category === 'bioSex' && meta.bioSex !== value) return false;
        if (category === 'ethnicity' && meta.etnia !== value) return false;
        if (category === 'orientation' && meta.orientacao !== value) return false;
        if (category === 'identity' && !meta.genero.startsWith(value)) return false;
        if (category === 'triboUrbana' && meta.triboUrbana !== value) return false;
        if (category === 'ageBucket') {
          const age = meta.idade;
          if (value === '0-17' && age > 17) return false;
          if (value === '18-29' && (age < 18 || age > 29)) return false;
          if (value === '30-49' && (age < 30 || age > 49)) return false;
          if (value === '50-64' && (age < 50 || age > 64)) return false;
          if (value === '65+' && age < 65) return false;
        }
      }
      return true;
    });
  }, [rawCharacters, activeFilters]);

  const stats = useMemo<BatchStats | null>(() => {
    // Se temos filtros ativos ou não temos stats do worker ainda, calculamos localmente
    // No entanto, se o lote foi muito grande (>50k), não temos rawCharacters e dependemos do workerStats total
    const hasFilters = Object.keys(activeFilters).length > 0;
    
    if (!hasFilters && workerStats) return workerStats;
    if (filteredCharacters.length === 0) return workerStats;

    const currentStats: BatchStats = {
      total: filteredCharacters.length,
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

    filteredCharacters.forEach(res => {
      const meta = res.metadata;

      // Orientacao
      currentStats.orientation[meta.orientacao] = (currentStats.orientation[meta.orientacao] || 0) + 1;
      
      // Demografia
      currentStats.bioSex[meta.bioSex] = (currentStats.bioSex[meta.bioSex] || 0) + 1;
      currentStats.ethnicity[meta.etnia] = (currentStats.ethnicity[meta.etnia] || 0) + 1;
      currentStats.socialClass[meta.classe] = (currentStats.socialClass[meta.classe] || 0) + 1;
      
      const identity = meta.genero.split(' ')[0];
      currentStats.identity[identity] = (currentStats.identity[identity] || 0) + 1;

      // Idade
      const age = meta.idade;
      if (age <= 17) currentStats.ageBuckets['0-17']++;
      else if (age <= 29) currentStats.ageBuckets['18-29']++;
      else if (age <= 49) currentStats.ageBuckets['30-49']++;
      else if (age <= 64) currentStats.ageBuckets['50-64']++;
      else currentStats.ageBuckets['65+']++;

      // Localizacao
      currentStats.region[meta.regiao] = (currentStats.region[meta.regiao] || 0) + 1;
      currentStats.states[meta.estado] = (currentStats.states[meta.estado] || 0) + 1;

      // Averages
      currentStats.averages.physical += meta.metrics.physical;
      currentStats.averages.mental += meta.metrics.mental;
      currentStats.averages.income += meta.metrics.income;
      currentStats.averages.relational += meta.metrics.relational;
      currentStats.averages.resilience += meta.metrics.resilience;
      currentStats.averages.urbanLife += meta.metrics.urbanLife;

      // Flags
      if (meta.statusOcupacional.includes("Aposentado")) currentStats.flags.aposentado++;
      if (meta.statusOcupacional.includes("Estudante")) currentStats.flags.estudante++;
      if (meta.statusOcupacional.includes("Desempregado")) currentStats.flags.desempregado++;
      if (meta.profissao.toLowerCase().includes("braçal") || meta.profissao.toLowerCase().includes("obra")) currentStats.flags.braçal++;
      if (meta.shiny !== "Nenhum evento significativo detectado." && meta.shiny !== "Não detectado") {
        currentStats.flags.shiny++;
        currentStats.shinies[meta.shiny] = (currentStats.shinies[meta.shiny] || 0) + 1;
      }

      // Professions
      currentStats.professions[meta.profissao] = (currentStats.professions[meta.profissao] || 0) + 1;

      // Conditions
      meta.vConditions.forEach(cond => {
        currentStats.conditions[cond] = (currentStats.conditions[cond] || 0) + 1;
      });

      // Tribos
      if (meta.triboUrbana) {
        currentStats.tribes[meta.triboUrbana] = (currentStats.tribes[meta.triboUrbana] || 0) + 1;
      }
    });

    // Finalize averages
    currentStats.averages.physical /= currentStats.total;
    currentStats.averages.mental /= currentStats.total;
    currentStats.averages.income /= currentStats.total;
    currentStats.averages.relational /= currentStats.total;
    currentStats.averages.resilience /= currentStats.total;
    currentStats.averages.urbanLife /= currentStats.total;

    return currentStats;
  }, [filteredCharacters, workerStats, activeFilters]);


  const sortedProfessions = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.professions) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedShinies = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.shinies) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedStates = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.states) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedOrientation = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.orientation) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedEthnicity = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.ethnicity) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedSocialClass = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.socialClass) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedRegion = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.region) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedConditions = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.conditions) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedTribes = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    return (Object.entries(stats.tribes) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const sortedAgeBuckets = useMemo<[string, number][]>(() => {
    if (!stats) return [];
    // Mantém a ordem fixa das faixas
    const order = ['0-17', '18-29', '30-49', '50-64', '65+'];
    return order.map(key => [key, stats.ageBuckets[key] || 0]);
  }, [stats]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#070707] text-ice pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Mode Switcher */}
        <div className="flex gap-2 p-1 bg-slate-900 border border-white/5 rounded-xl w-fit mb-4">
          <button 
            onClick={() => { setActiveMenuMode('mass'); setCalcResult(null); }}
            className={`px-6 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${activeMenuMode === 'mass' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-white/40 hover:text-white/60'}`}
          >
            <Layers size={14} />
            Modo em Massa
          </button>
          <button 
            onClick={() => { setActiveMenuMode('calculator'); }}
            className={`px-6 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${activeMenuMode === 'calculator' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-white/40 hover:text-white/60'}`}
          >
            <Calculator size={14} />
            Calculadora de Probabilidade
          </button>
        </div>

        {/* Header / Controls */}
        <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
          {activeMenuMode === 'mass' ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-display font-black uppercase tracking-widest text-indigo-400 flex items-center gap-3">
                  <Layers className="text-indigo-500" />
                  Analítico de Lote
                </h1>
                <p className="text-xs text-white/20 font-mono">Stress Test e Verificação de Amostragem (BI Mode).</p>
                {Object.keys(activeFilters).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button 
                      onClick={clearFilters}
                      className="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-mono uppercase font-bold hover:bg-rose-500/30 transition-all"
                    >
                      Limpar {Object.keys(activeFilters).length} Filtros
                    </button>
                    {Object.entries(activeFilters).map(([cat, val]) => (
                      <span key={cat} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-mono uppercase">
                        {cat}: {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 ml-1">Quantidade</label>
                  <input 
                    type="number" 
                    value={count}
                    disabled={isRolling}
                    onChange={(e) => setCount(Math.min(999999, Math.max(10, parseInt(e.target.value) || 0)))}
                    className={`bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-indigo-300 w-32 focus:outline-none focus:border-indigo-500/50 transition-all ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                {count > 50000 && (
                   <div className="hidden lg:flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                     <AlertTriangle size={14} />
                     <span className="text-[9px] font-mono leading-none uppercase font-bold">Lote Crítico: Filtros Desativados</span>
                   </div>
                )}
                <button 
                  onClick={handleRollBatch}
                  disabled={isRolling}
                  className={`h-12 px-8 rounded-lg flex items-center gap-3 text-xs font-mono uppercase tracking-widest font-black transition-all shadow-xl active:scale-95 ${
                    isRolling 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                  }`}
                >
                  {isRolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isRolling ? 'Simulando...' : 'Rolar em Massa'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-display font-black uppercase tracking-widest text-emerald-400 flex items-center gap-3">
                  <Calculator className="text-emerald-500" />
                  Calculadora de Interseção
                </h1>
                <p className="text-xs text-white/20 font-mono">Calcula a probabilidade real de ocorrência cruzando múltiplos critérios (Monte Carlo 10k).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 ml-1">Categoria</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setSelectedItemKey(''); }}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 ml-1">Item / Valor</label>
                  <select 
                    value={selectedItemKey}
                    disabled={!selectedCategory}
                    onChange={(e) => setSelectedItemKey(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50 appearance-none disabled:opacity-20"
                  >
                    <option value="">Selecione...</option>
                    {currentCategoryItems.map(item => (
                      <option key={item.key} value={item.key}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={handleAddCriterion}
                    disabled={!selectedItemKey}
                    className="w-full h-10 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center justify-center gap-2 text-[10px] font-mono uppercase hover:bg-emerald-600/30 transition-all disabled:opacity-20"
                  >
                    <Plus size={14} />
                    Adicionar Critério
                  </button>
                </div>
              </div>

              {/* Criteria Chips */}
              {targetCriteria.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {targetCriteria.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-[10px] font-mono text-emerald-300">
                      <span className="opacity-40 uppercase">{categories.find(cat => cat.id === c.category)?.name}:</span>
                      <span className="font-bold uppercase tracking-tight">{c.name}</span>
                      <button onClick={() => removeCriterion(idx)} className="hover:text-rose-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleRunCalculator}
                  disabled={isRolling || targetCriteria.length === 0}
                  className={`h-12 px-12 rounded-full flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] font-black transition-all shadow-xl active:scale-95 ${
                    isRolling || targetCriteria.length === 0
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                  }`}
                >
                  {isRolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  {isRolling ? 'Calculando Probabilidades...' : 'Calcular Probabilidade Cruzada'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {isRolling ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="min-h-[40vh] bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-8"
            >
              <div className="relative">
                <RefreshCw size={48} className="text-indigo-500 animate-spin opacity-20" />
                <Zap size={24} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="w-full max-w-md space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Simulando População</p>
                    <p className="text-2xl font-mono font-black text-white">{progressCount.toLocaleString()} <span className="text-white/20 text-sm">/ {count.toLocaleString()}</span></p>
                  </div>
                  <p className="text-xs font-mono text-indigo-400/60 font-bold">{Math.round((progressCount / count) * 100)}%</p>
                </div>
                
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(progressCount / count) * 100}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  />
                </div>
                
                <p className="text-center text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] animate-pulse">
                  Processando amostragem estatística em background...
                </p>
              </div>
            </motion.div>
          ) : calcResult ? (
            <motion.div 
              key="calc_results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 border border-emerald-500/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-6"
            >
              <div className="p-6 bg-emerald-500/10 rounded-full ring-4 ring-emerald-500/5">
                <Calculator size={48} className="text-emerald-400" />
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center gap-3 justify-center">
                  <span className="text-5xl font-mono font-black text-white">{calcResult.matches.toLocaleString()}</span>
                  <span className="text-white/20 text-2xl font-mono">/ {calcResult.total.toLocaleString()}</span>
                </div>
                <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-[0.3em] font-bold">Matches Encontrados em Simulação Monte Carlo</p>
              </div>

              <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Probabilidade Estimada</p>
                <p className="text-6xl font-mono font-black text-emerald-400">
                  {((calcResult.matches / calcResult.total) * 100).toFixed(2)}%
                </p>
              </div>

              <div className="max-w-md text-center">
                <p className="text-[10px] font-mono text-white/20 leading-relaxed uppercase">
                  Este cálculo representa a probabilidade cruzada baseada em 10.000 iterações do motor de geração randômica com pesos declarativos.
                </p>
              </div>

              <button 
                onClick={() => setCalcResult(null)}
                className="mt-4 text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest underline underline-offset-4"
              >
                Voltar para Configuração
              </button>
            </motion.div>
          ) : activeMenuMode === 'mass' && stats ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Demografia Geral */}
              <StatCard title="Demografia Geral" icon={Users}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Sexo Biológico</p>
                    {(Object.entries(stats.bioSex) as [string, number][]).map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        onClick={() => toggleFilter('bioSex', label)}
                        isActive={activeFilters.bioSex === label}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Identidade de Gênero</p>
                    {(Object.entries(stats.identity) as [string, number][]).map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        onClick={() => toggleFilter('identity', label)}
                        isActive={activeFilters.identity === label}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Orientação Sexual</p>
                    {sortedOrientation.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        onClick={() => toggleFilter('orientation', label)}
                        isActive={activeFilters.orientation === label}
                      />
                    ))}
                  </div>
                </div>
              </StatCard>

              {/* Estrutura Social & Idade */}
              <StatCard title="Estrutura & Idade" icon={Activity}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Distribuição de Idade</p>
                    {sortedAgeBuckets.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        color="bg-amber-600"
                        onClick={() => toggleFilter('ageBucket', label)}
                        isActive={activeFilters.ageBucket === label}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Etnia</p>
                    {sortedEthnicity.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        onClick={() => toggleFilter('ethnicity', label)}
                        isActive={activeFilters.ethnicity === label}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Classe Social</p>
                    {sortedSocialClass.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        onClick={() => toggleFilter('socialClass', label)}
                        isActive={activeFilters.socialClass === label}
                      />
                    ))}
                  </div>
                </div>
              </StatCard>

              {/* Médias & Saúde */}
              <StatCard title="Métricas Médias (Averages)" icon={BarChart3}>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Saúde Física', key: 'physical', color: 'text-rose-400' },
                    { label: 'Saúde Mental', key: 'mental', color: 'text-purple-400' },
                    { label: 'Renda', key: 'income', color: 'text-emerald-400' },
                    { label: 'Relacional', key: 'relational', color: 'text-blue-400' },
                    { label: 'Resiliência', key: 'resilience', color: 'text-amber-400' },
                    { label: 'Vida Urbana', key: 'urbanLife', color: 'text-cyan-400' },
                  ].map(stat => (
                    <div key={stat.key} className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center text-center">
                      <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={`text-lg font-mono font-black ${stat.color}`}>{(stats.averages as any)[stat.key].toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                  <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Flags de Contexto (%)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {(Object.entries(stats.flags) as [string, number][]).map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white/40 uppercase">{label}</span>
                        <span className="text-white/80 font-bold">{((val / stats.total) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StatCard>

              {/* Localização */}
              <StatCard title="Geospatial" icon={MapPin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Região</p>
                    {sortedRegion.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        color="bg-emerald-600" 
                        onClick={() => toggleFilter('region', label)}
                        isActive={activeFilters.region === label}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Distribuição UF (Top 10)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {sortedStates.slice(0, 10).map(([state, count]) => (
                        <div 
                          key={state} 
                          className={`flex justify-between text-[10px] font-mono bg-white/5 px-2 py-1 rounded border border-transparent transition-colors hover:bg-white/10 ${activeFilters.state === state ? 'border-emerald-500/50 bg-emerald-500/10' : ''}`}
                        >
                          <span className="text-white/40">{state}</span>
                          <span className="text-emerald-400 font-bold">{((count / stats.total) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </StatCard>

              {/* Condições & Patologias */}
              <StatCard title="Somatização & Condições" icon={Activity}>
                <div className="space-y-2">
                  <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold mb-2">Incidência no Lote</p>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                    {sortedConditions.length > 0 ? sortedConditions.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        color="bg-rose-600" 
                      />
                    )) : (
                      <div className="h-20 flex items-center justify-center text-white/10 text-[10px] font-mono italic">
                        Nenhuma condição detectada
                      </div>
                    )}
                  </div>
                </div>
              </StatCard>

              {/* Tribos Urbanas */}
              <StatCard title="Subculturas & Tribos" icon={Users}>
                <div className="space-y-2">
                  <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold mb-2">Distribuição de Tribos</p>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                    {sortedTribes.length > 0 ? sortedTribes.map(([label, val]) => (
                      <ProgressBar 
                        key={label} 
                        label={label} 
                        value={val} 
                        total={stats.total} 
                        color="bg-purple-600"
                        onClick={() => toggleFilter('triboUrbana', label)}
                        isActive={activeFilters.triboUrbana === label}
                      />
                    )) : (
                      <div className="h-20 flex items-center justify-center text-white/10 text-[10px] font-mono italic">
                        Nenhuma tribo detectada
                      </div>
                    )}
                  </div>
                </div>
              </StatCard>

              {/* Profissões */}
              <StatCard title="Mercado de Trabalho" icon={Briefcase} className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Ocorrências de Shinies</p>
                      <span className="text-[10px] font-mono text-white/20">{stats.flags.shiny} detectados</span>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {sortedShinies.length > 0 ? sortedShinies.map(([label, val]) => (
                        <ProgressBar 
                          key={label} 
                          label={label} 
                          value={val} 
                          total={stats.total}
                          color="bg-gold"
                        />
                      )) : (
                        <div className="h-20 flex items-center justify-center text-white/10 text-[10px] font-mono italic">
                          Nenhum evento Shiny no lote
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Top Profissões</p>
                      <button 
                        onClick={() => setShowAllProfessions(!showAllProfessions)}
                        className="text-[9px] font-mono text-white/30 hover:text-indigo-400 flex items-center gap-1"
                      >
                        {showAllProfessions ? 'Recolher' : 'Ver Todas'}
                        {showAllProfessions ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                    </div>
                    <div className={`space-y-2 overflow-y-auto custom-scrollbar pr-2 transition-all ${showAllProfessions ? 'max-h-[500px]' : 'max-h-[300px]'}`}>
                      {sortedProfessions.slice(0, showAllProfessions ? undefined : 15).map(([label, val]) => (
                        <ProgressBar key={label} label={label} value={val} total={stats.total} />
                      ))}
                    </div>
                  </div>
                </div>
              </StatCard>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[40vh] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/10 gap-4"
            >
              <Users size={64} strokeWidth={0.5} />
              <div className="text-center">
                <p className="text-xs font-mono uppercase tracking-[0.3em]">Aguardando Amostragem</p>
                <p className="text-[10px] font-mono text-white/5 mt-2">Defina o volume e dispare o motor de rolagens.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Alert */}
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex gap-4 items-start">
          <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
          <div className="space-y-1">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">Nota sobre o Batch Engine</h4>
            <p className="text-[10px] text-blue-400/60 font-mono leading-relaxed">
              O processamento utiliza um **Web Worker**, permitindo simulações de até 999.999 rolagens sem congelar a interface. Para lotes acima de 50.000, os personagens individuais não são armazenados em memória para preservar a performance, impossibilitando o uso de filtros cruzados após a geração.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
