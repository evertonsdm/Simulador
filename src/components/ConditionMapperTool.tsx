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
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

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
      setCondition(conditionsForLevel[0].name);
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
    <div className="flex flex-col min-h-full w-full bg-[#111111] text-white overflow-visible pointer-events-auto">
      {/* Cabeçalho Fixo / Seleção */}
      <div className={`flex-none border-b border-white/5 bg-[#161616]/90 backdrop-blur-md z-10 transition-all duration-300 shadow-lg ${isHeaderExpanded ? 'p-4 md:p-6' : 'p-3 md:p-4'}`}>
        <div 
          className="flex justify-between items-center w-full cursor-pointer select-none group" 
          onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
        >
          <div className="flex items-center gap-3">
             <span className="text-[11px] text-[#FFBF00] uppercase tracking-[0.1em] font-mono font-bold group-hover:text-gold-hover transition-colors">Painel de Sincronia</span>
             {!isHeaderExpanded && condition && (
               <span className="text-[10px] text-white/40 hidden md:inline-block">({condition}) — {selectedParts.length} partes selecionadas</span>
             )}
          </div>
          <button className="text-white/50 group-hover:text-white flex items-center gap-2 transition-colors">
            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:inline-block">{isHeaderExpanded ? 'Ocultar Controles' : 'Expandir Controles'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isHeaderExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHeaderExpanded ? 'max-h-[500px] mt-4 md:mt-6 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
            <div className="flex flex-col gap-1.5 w-full md:w-48">
              <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono font-bold">
                Nível / Gravidade
              </label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full appearance-none bg-black/50 border border-white/10 rounded px-4 py-2.5 text-sm md:text-base focus:outline-none focus:border-[#FFBF00]/50 transition-colors cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                    <option key={l} value={l}>
                      Nível {l}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  ▼
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 w-full md:min-w-[200px]">
              <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono font-bold">
                Condição Visível (Nível {level})
              </label>
              <div className="relative">
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full appearance-none bg-black/50 border border-white/10 rounded px-4 py-2.5 text-sm md:text-base focus:outline-none focus:border-[#FFBF00]/50 transition-colors cursor-pointer"
                >
                  {currentConditions.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  ▼
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full md:w-64">
              <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono font-bold">
                Quantas partes afetar?
              </label>
              <div className="relative">
                <select
                  value={rollCount}
                  onChange={(e) => setRollCount(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  disabled={selectedParts.length === 0}
                  className="w-full appearance-none bg-black/50 border border-white/10 rounded px-4 py-2.5 text-sm md:text-base focus:outline-none focus:border-[#FFBF00]/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">Aplicar a Todos os Selecionados</option>
                  {selectedParts.length > 0 && Array.from({ length: selectedParts.length }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Sortear {i + 1}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area SVG */}
      <div className="flex-[1_1_0%] min-h-0 w-full relative z-0 p-2 md:p-4 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-[400px] h-full flex items-center justify-center">
          <BodyMap
            conditions={[]}
            affectedParts={selectedParts}
            onPartToggle={handlePartToggle}
            editorMode={true}
          />
        </div>
      </div>

      {/* Rodapé / Ação */}
      <div className="flex-none p-4 md:p-6 border-t border-white/5 bg-[#161616]/90 backdrop-blur-md z-10 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={handleExport}
          disabled={!condition || selectedParts.length === 0}
          className={`flex items-center gap-3 px-8 py-4 rounded font-bold uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 ${
            !condition || selectedParts.length === 0
              ? "bg-black/40 border border-white/5 text-white/20 cursor-not-allowed"
              : "bg-[#FFBF00]/10 border border-[#FFBF00]/50 hover:bg-[#FFBF00] hover:text-black text-[#FFBF00] shadow-[0_0_20px_rgba(255,191,0,0.2)]"
          }`}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied
            ? "Copiado para a Área de Transferência!"
            : "Exportar Configuração"}
        </button>
      </div>
    </div>
  );
};
