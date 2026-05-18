import React, { useState, useEffect } from "react";
import { BodyMap } from "./BodyMap";
import { NIVEIS_V } from "../rules/conditions";
import { CONDITION_TO_PARTS } from "../services/bodyPartMapping";
import { Copy, Check, ChevronDown } from "lucide-react";

export const ConditionMapperTool: React.FC = () => {
  const [level, setLevel] = useState<number>(1);
  const [condition, setCondition] = useState<string>("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [rollCount, setRollCount] = useState<number | 'all'>('all');
  const [copied, setCopied] = useState(false);

  // Reset rollCount if it exceeds selectedParts length
  useEffect(() => {
    if (rollCount !== 'all' && rollCount > selectedParts.length) {
      setRollCount('all');
    }
  }, [selectedParts.length, rollCount]);

  // Update condition when level changes
  useEffect(() => {
    const conditionsForLevel = NIVEIS_V[level] || [];
    if (conditionsForLevel.length > 0) {
      // Try to keep same condition if it exists in new level, else first one
      if (!conditionsForLevel.some(c => c.name === condition)) {
        setCondition(conditionsForLevel[0].name);
      }
    } else {
      setCondition("");
    }
  }, [level]);

  useEffect(() => {
    const mapping = CONDITION_TO_PARTS[condition];
    if (mapping) {
      if (!Array.isArray(mapping)) {
        // It's a RandomMapping
        setSelectedParts(mapping.options);
        setRollCount(mapping.roll);
      } else {
        // Handle the case where some conditions have nested arrays (e.g. [['head'], ...])
        const flatParts = mapping.flat();
        setSelectedParts(flatParts);
        setRollCount('all');
      }
    } else {
      setSelectedParts([]);
      setRollCount('all');
    }
  }, [condition]);

  // Handle export
  const handleExport = () => {
    if (!condition) return;
    const partsString = selectedParts.map((p) => `'${p}'`).join(", ");
    
    let textToCopy = "";
    if (rollCount === 'all') {
      textToCopy = `Quero que atualize as regiões que a condição (${condition}) afeta. Atualize os membros afetados de forma FIXA para exatamente estes: ([${partsString}]).`;
    } else {
      textToCopy = `Quero que atualize as regiões que a condição (${condition}) afeta. Configure o arquivo 'bodyPartMapping.ts' para sortear aleatoriamente EXATAMENTE ${rollCount} membro(s) dentre as seguintes opções possíveis: ([${partsString}]).`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePartToggle = (id: string) => {
    if (id === "reset") {
      setSelectedParts([]);
      return;
    }

    setSelectedParts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const currentConditions = NIVEIS_V[level] || [];

  return (
    <div className="min-h-dvh h-auto md:h-dvh flex flex-col md:flex-row bg-[#111111] text-white overflow-y-auto md:overflow-hidden font-sans">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 flex flex-col h-auto md:h-full border-b md:border-b-0 md:border-r border-white/5 bg-[#161616] p-3 md:p-6 shrink-0 z-20 overflow-visible md:overflow-hidden">
        <div className="flex items-center gap-2 mb-3 md:mb-6">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <h1 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Condition Mapper v2</h1>
        </div>

        {/* Level Select */}
        <div className="space-y-1.5 mb-4 md:mb-6">
          <label className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest">Nível de Severidade</label>
          <div className="grid grid-cols-5 md:grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded transition-colors ${
                  level === l ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Condition List */}
        <div className="flex-1 flex flex-col h-auto max-h-[300px] md:max-h-none md:min-h-0 overflow-y-auto">
          <label className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 block">
            Condições Visíveis (Nível {level})
          </label>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1 md:space-y-1.5">
            {currentConditions.map((c) => {
              const hasMapping = CONDITION_TO_PARTS[c.name] !== undefined;
              const isActive = condition === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setCondition(c.name)}
                  className={`w-full flex items-center justify-between p-2 md:p-3 rounded-lg border text-left transition-all group ${
                    isActive 
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg' 
                      : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <span className={`text-[10px] md:text-xs font-medium truncate ${isActive ? 'font-bold' : ''}`}>
                    {c.name}
                  </span>
                  {!hasMapping && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                       <span className="text-[8px] md:text-[9px] text-red-400/80 font-bold uppercase tracking-tighter">Unmapped</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distribution Controls */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-white/5 space-y-3">
          <div className="space-y-1.5">
            <label className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest">Distribuição no Sorteio</label>
            <select
              value={rollCount}
              onChange={(e) => setRollCount(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              disabled={selectedParts.length === 0}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-[10px] md:text-xs font-bold outline-none focus:border-indigo-500 transition-colors cursor-pointer disabled:opacity-30"
            >
              <option value="all">Fixo: Todos Selecionados</option>
              {selectedParts.length > 0 && Array.from({ length: selectedParts.length }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Sorteio: {i + 1} item(s)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Stats Info */}
        <div className="hidden md:block mt-auto pt-6 opacity-30">
          <div className="text-[9px] uppercase tracking-widest leading-loose">
            <div className="flex justify-between"><span>Selected:</span> <span>{selectedParts.length}</span></div>
            <div className="flex justify-between"><span>Method:</span> <span>{rollCount === 'all' ? 'Fixed' : 'Random'}</span></div>
          </div>
        </div>
      </aside>

      {/* Main Composition Area */}
      <main className="flex-1 relative bg-black/20 flex flex-col min-h-[450px] md:min-h-0">
        <div className="flex-1 relative flex items-center justify-center p-2 md:p-4 h-[400px] md:h-full">
          <div className="w-full h-full max-w-[450px] relative pointer-events-none *:pointer-events-auto">
             <BodyMap
              conditions={[]}
              affectedParts={selectedParts}
              highlightedParts={selectedParts}
              onPartToggle={handlePartToggle}
              editorMode={true}
            />
          </div>
        </div>

        {/* Context Chip Mobile Only */}
        <div className="md:hidden absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
           <span className="text-[9px] uppercase font-bold text-white/60 tracking-wider">
             {selectedParts.length} parts selection
           </span>
        </div>

        {/* Footer Action */}
        <footer className="w-full p-3 md:p-6 bg-[#161616]/95 backdrop-blur-xl border-t border-white/5 z-30 flex justify-center sticky bottom-0">
          <button
            onClick={handleExport}
            disabled={!condition || selectedParts.length === 0}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 md:px-12 py-3 md:py-4 rounded-lg font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all active:scale-95 ${
              !condition || selectedParts.length === 0
                ? "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/30"
            }`}
          >
            {copied ? <Check size={16} md:size={18} /> : <Copy size={16} md:size={18} />}
            {copied ? "Prompt Copiado!" : "Gerar Prompt de Sincronização"}
          </button>
        </footer>
      </main>
    </div>
  );
};
