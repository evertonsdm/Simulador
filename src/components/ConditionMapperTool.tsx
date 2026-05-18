import React, { useState, useEffect } from "react";
import { BodyMap } from "./BodyMap";
import { NIVEIS_V } from "../rules/conditions";
import { CONDITION_TO_PARTS } from "../services/bodyPartMapping";
import { Copy, Check, ChevronDown } from "lucide-react";

export const ConditionMapperTool: React.FC = () => {
  const [level, setLevel] = useState<number>(1);
  const [condition, setCondition] = useState<string>("");
  const [selectedParts, setSelectedParts] = useState<{ id: string; mode: 'fixed' | 'random' }[]>([]);
  const [randomCount, setRandomCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  // Reset randomCount if it exceeds the number of random parts
  const randomPartsCount = selectedParts.filter(p => p.mode === 'random').length;
  useEffect(() => {
    if (randomCount > randomPartsCount && randomPartsCount > 0) {
      setRandomCount(randomPartsCount);
    } else if (randomPartsCount === 0) {
      setRandomCount(1);
    }
  }, [randomPartsCount, randomCount]);

  // Update condition when level changes
  useEffect(() => {
    const conditionsForLevel = NIVEIS_V[level] || [];
    if (conditionsForLevel.length > 0) {
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
        setSelectedParts(mapping.options.map(id => ({ id, mode: 'random' })));
        setRandomCount(mapping.roll);
      } else {
        const flatParts = mapping.flat();
        setSelectedParts(flatParts.map(id => ({ id, mode: 'fixed' })));
      }
    } else {
      setSelectedParts([]);
    }
  }, [condition]);

  // Handle export
  const handleExport = () => {
    if (!condition) return;
    
    const fixedParts = selectedParts.filter(p => p.mode === 'fixed').map(p => p.id);
    const randomParts = selectedParts.filter(p => p.mode === 'random').map(p => p.id);
    
    let textToCopy = `Quero que atualize as regiões que a condição (${condition}) afeta no arquivo 'bodyPartMapping.ts'. `;
    
    if (fixedParts.length > 0) {
      textToCopy += `A condição afeta FIXAMENTE (100% de chance) os seguintes membros: [${fixedParts.map(p => `'${p}'`).join(", ")}]. `;
    }
    
    if (randomParts.length > 0) {
      textToCopy += `ALÉM DISSO, o motor deve sortear aleatoriamente EXATAMENTE ${randomCount} membro(s) dentre o seguinte grupo de possibilidades: [${randomParts.map(p => `'${p}'`).join(", ")}].`;
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

    setSelectedParts((prev) => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.filter(p => p.id !== id);
      } else {
        return [...prev, { id, mode: 'fixed' }];
      }
    });
  };

  const togglePartMode = (id: string) => {
    setSelectedParts(prev => prev.map(p => 
      p.id === id ? { ...p, mode: p.mode === 'fixed' ? 'random' : 'fixed' } : p
    ));
  };

  const currentConditions = NIVEIS_V[level] || [];
  const selectedPartIds = selectedParts.map(p => p.id);

  return (
    <div className="min-h-dvh h-auto md:h-dvh flex flex-col md:flex-row bg-[#111111] text-white overflow-y-auto md:overflow-y-auto font-sans">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 flex flex-col h-auto md:h-full border-b md:border-b-0 md:border-r border-white/5 bg-[#161616] p-3 md:p-6 shrink-0 z-20 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-3 md:mb-6">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <h1 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Condition Mapper v3</h1>
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
        <div className="flex-1 flex flex-col h-auto max-h-[250px] md:max-h-none md:min-h-0 overflow-y-auto mb-4 md:mb-6">
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

        {/* Selected Parts List & Toggles */}
        <div className="hidden md:flex flex-col shrink-0 border-t border-white/5 pt-4">
          <label className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block">
            Membros Selecionados
          </label>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {selectedParts.length === 0 ? (
              <p className="text-[10px] text-white/20 italic p-4 text-center border border-dashed border-white/5 rounded-lg">Clique no mapa para selecionar membros</p>
            ) : (
              selectedParts.map((part) => (
                <div key={part.id} className="bg-white/[0.03] border border-white/5 rounded-md p-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 truncate max-w-[100px]">{part.id}</span>
                  <div className="flex bg-black/40 p-0.5 rounded border border-white/10">
                    <button 
                      onClick={() => togglePartMode(part.id)}
                      className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${part.mode === 'fixed' ? 'bg-indigo-600 text-white shadow' : 'text-white/30 hover:text-white/50'}`}
                    >
                      Fixo
                    </button>
                    <button 
                      onClick={() => togglePartMode(part.id)}
                      className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${part.mode === 'random' ? 'bg-indigo-600 text-white shadow' : 'text-white/30 hover:text-white/50'}`}
                    >
                      Roleta
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Distribution Controls */}
        {randomPartsCount > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest">Distribuição no Sorteio</label>
              <select
                value={randomCount}
                onChange={(e) => setRandomCount(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-[10px] md:text-xs font-bold outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {Array.from({ length: randomPartsCount }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Sortear {i + 1} membro(s)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </aside>

      {/* Main Composition Area */}
      <main className="flex-1 relative bg-black/20 flex flex-col min-h-[450px] md:min-h-0">
        <div className="flex-1 relative flex items-center justify-center p-2 md:p-4 h-[400px] md:h-full">
          <div className="w-full h-full max-w-[450px] relative pointer-events-none *:pointer-events-auto">
             <BodyMap
              conditions={[]}
              affectedParts={selectedPartIds}
              highlightedParts={selectedPartIds}
              onPartToggle={handlePartToggle}
              editorMode={true}
            />
          </div>
        </div>

        {/* Mobile Parts List Toggle (Simplified View) */}
        <div className="md:hidden px-4 py-2 bg-black/40 border-y border-white/5 overflow-x-auto whitespace-nowrap flex gap-2">
           {selectedParts.map(part => (
             <button 
               key={part.id} 
               onClick={() => togglePartMode(part.id)}
               className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${
                 part.mode === 'fixed' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-indigo-900/40 border-indigo-700 text-white/70'
               }`}
             >
               {part.id}: {part.mode === 'fixed' ? 'F' : 'R'}
             </button>
           ))}
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
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Prompt Copiado!" : "Gerar Prompt de Sincronizacao"}
          </button>
        </footer>
      </main>
    </div>
  );
};
