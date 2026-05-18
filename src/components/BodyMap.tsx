
import React, { useState, useEffect, useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Info, Move } from 'lucide-react';

interface BodyMapProps {
  conditions: string[];
  affectedParts?: string[];
  highlightedParts?: string[];
  heatmap?: Record<string, number>;
  onPartToggle?: (id: string) => void;
  editorMode?: boolean;
}

export const BodyMap: React.FC<BodyMapProps> = ({ 
  conditions, 
  affectedParts = [], 
  highlightedParts = [],
  heatmap = {},
  onPartToggle,
  editorMode = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalAffected, setInternalAffected] = useState<string[]>(affectedParts);

  // Sync internal state with props
  useEffect(() => {
    setInternalAffected(affectedParts);
  }, [affectedParts]);

  const togglePart = (id: string) => {
    if (!editorMode) return;
    
    const newAffected = internalAffected.includes(id) 
      ? internalAffected.filter(p => p !== id)
      : [...internalAffected, id];
    
    setInternalAffected(newAffected);
    onPartToggle?.(id);
  };

  const isAfetado = (id: string) => internalAffected.includes(id) || (heatmap && heatmap[id] > 0);
  const isHighlighted = (id: string) => highlightedParts.includes(id);

  const getPartIntensityColor = (id: string) => {
    const count = heatmap[id] || 0;
    if (count >= 4) return 'fill-[#ff0000] animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)]'; // Vermelho-Fogo
    if (count === 3) return 'fill-[#ff4500]'; // Laranja-Escuro / Vermelhão
    if (count === 2) return 'fill-[#ff8c00]'; // Laranja
    if (count === 1) return 'fill-[#FFBF00]'; // Amarelo
    return isAfetado(id) ? 'fill-[#FFBF00]' : 'fill-[#D9D9D9]';
  };

  const getPartClass = (id: string) => {
    const isHigh = isHighlighted(id);
    return `transition-colors duration-300 ${getPartIntensityColor(id)} ${isHigh ? 'animate-slow-glow' : ''} ${editorMode ? 'cursor-pointer hover:fill-gold/50' : 'pointer-events-auto'}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] lg:min-h-[500px] bg-black/40 rounded-lg border flex items-center justify-center p-0 overflow-hidden transition-colors ${editorMode ? 'border-gold/50 shadow-[0_0_20px_rgba(255,191,0,0.1)]' : 'border-white/5'}`}
    >
      <style>{`
        .afetado { fill: #FFBF00 !important; }
        .body-part-path { stroke: #1a1a1a; stroke-width: 1px; }
      `}</style>
      
      {/* Human Anatomy Map - Master SVG */}
      <svg 
        id="human-anatomy-map" 
        viewBox="40 -20 460 860" 
        className="w-full h-full max-h-full max-w-full opacity-40 overflow-visible select-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* HEAD */}
        <svg id="head" x="223" y="-6" width="80.3" height="100" viewBox="0 0 181 250" overflow="visible" onClick={() => togglePart('head')}>
          <path className={`body-part-path ${getPartClass('head')}`} d="M12.6756 53L11.663 110.643L0 109.49L3 142L18.663 148L30.6756 198L62.6756 250H120.676L156.676 198L164.676 143L178.676 132L180.676 103L169.676 104L168.676 49.0808C168.676 49.0808 125.105 -0.230752 88.6756 0.999954C52.7339 2.21418 12.6756 53 12.6756 53Z" />
        </svg>

        {/* ORBIT */}
        <svg id="orbit" x="244" y="27" width="40" height="10" viewBox="0 0 96 20" overflow="visible" onClick={() => togglePart('orbit')}>
          <ellipse className={getPartClass('orbit')} cx="15" cy="10" rx="15" ry="10" />
          <ellipse className={getPartClass('orbit')} cx="81" cy="10" rx="15" ry="10" />
        </svg>

        {/* NECK */}
        <svg id="neck" x="229" y="70" width="70" height="80" viewBox="0 0 149 126" overflow="visible" onClick={() => togglePart('neck')}>
          <path className={`body-part-path ${getPartClass('neck')}`} d="M10.2703 0L52.2973 53.9L76 126L28.7568 111.3L0 27.3L10.2703 0Z" />
          <path className={`body-part-path ${getPartClass('neck')}`} d="M142 0L149 16L126 98L82 126L96 56L142 0Z" />
        </svg>

        {/* CHEST */}
        <svg id="chest" x="193" y="140" width="150" height="80" viewBox="0 0 289 165" overflow="visible" onClick={() => togglePart('chest')}>
          <path className={`body-part-path ${getPartClass('chest')}`} d="M53 0L114 13L132 121L71 165L23 148V97L0 70L35 55L53 0Z" />
          <path className={`body-part-path ${getPartClass('chest')}`} d="M221 0L252 50.2069H289L277 76V128L227 162L160.407 116L166.407 10.2069L221 0Z" />
        </svg>

        {/* RIGHT SHOULDER */}
        <svg id="right-shoulder" x="160" y="100" width="75" height="110" viewBox="0 0 154 218" overflow="visible" onClick={() => togglePart('right-shoulder')}>
          <path className={`body-part-path ${getPartClass('right-shoulder')}`} d="M135 0L154 52H105L73 36L135 0Z" />
          <path className={`body-part-path ${getPartClass('right-shoulder')}`} d="M35 51H53.916L0 151.214V107L35 51Z" />
          <path className={`body-part-path ${getPartClass('right-shoulder')}`} d="M58.916 55.2145H99.916L74.916 142.214L35.916 165.214L4.91602 217.214V155.214L58.916 55.2145Z" />
        </svg>

        {/* RIGHT ARM */}
        <svg id="right-arm" x="88" y="210" width="100" height="190" viewBox="0 0 223 445" overflow="visible" onClick={() => togglePart('right-arm')}>
          <path className={`body-part-path ${getPartClass('right-arm')}`} d="M193 0L223 42L183 167L104 200V181L160 48L193 0Z" />
          <path className={`body-part-path ${getPartClass('right-arm')}`} d="M144 14L98 191L110 69L144 14Z" />
          <path className={`body-part-path ${getPartClass('right-arm')}`} d="M181 175L172 203L106 242V212L181 175Z" />
          <path className={`body-part-path ${getPartClass('right-arm')}`} d="M90 210L100 256L18 432L0 422L36 302L90 210Z" />
          <path className={`body-part-path ${getPartClass('right-arm')}`} d="M163 234L149 295L48 445L25 439L114 253L163 234Z" />
        </svg>

        {/* RIGHT HAND */}
        <svg id="right-hand" x="53" y="387" width="60" height="90" viewBox="0 0 127 170" overflow="visible" onClick={() => togglePart('right-hand')}>
          <path className={`body-part-path ${getPartClass('right-hand')}`} d="M70 0L85 27L123 32C123 32 124.421 62.7655 126 83C128.63 116.709 111 170 111 170H100L107 131L96 126L83 167L70 165L81 119L72 113L55 158L41 157L58 106L49 101L27 151L17 149L41 66L37 53L6 73L0 66L27 27L70 0Z" />
        </svg>

        {/* LEFT SHOULDER */}
        <svg id="left-shoulder" x="298" y="95" width="100" height="110" viewBox="0 0 193 210" overflow="visible" onClick={() => togglePart('left-shoulder')}>
          <path className={`body-part-path ${getPartClass('left-shoulder')}`} d="M87 65L185 141L193 210L163 173L113 155L53 101L87 65Z" />
          <path className={`body-part-path ${getPartClass('left-shoulder')}`} d="M111 48L179 106L191 141L93 57L111 48Z" />
          <path className={`body-part-path ${getPartClass('left-shoulder')}`} d="M11 0L95 50L63 64L0 50L11 0Z" />
        </svg>

        {/* LEFT ARM */}
        <svg id="left-arm" x="350" y="202" width="100" height="190" viewBox="0 0 206 438" overflow="visible" onClick={() => togglePart('left-arm')}>
          <path className={`body-part-path ${getPartClass('left-arm')}`} d="M30 0L0 42L40 167L119 200V181L63 48L30 0Z" />
          <path className={`body-part-path ${getPartClass('left-arm')}`} d="M78 35L126 173L113 63L78 35Z" />
          <path className={`body-part-path ${getPartClass('left-arm')}`} d="M41 178L50 206L116 245V215L41 178Z" />
          <path className={`body-part-path ${getPartClass('left-arm')}`} d="M122 206V261L190 422L206 414L176 298L122 206Z" />
          <path className={`body-part-path ${getPartClass('left-arm')}`} d="M54 225L68 286L154 438L180 426L104 250L54 225Z" />
        </svg>

        {/* LEFT HAND */}
        <svg id="left-hand" x="422" y="336" width="60" height="170" viewBox="0 0 127 170" overflow="visible" onClick={() => togglePart('left-hand')}>
          <path className={`body-part-path ${getPartClass('left-hand')}`} d="M56.2675 0L41.2675 27L2.26746 36C2.26746 36 1.84616 62.7655 0.267456 83C-2.36253 116.709 15.2675 170 15.2675 170H26.2675L19.2675 131L30.2675 126L43.2675 167L56.2675 165L45.2675 119L54.2675 113L71.2675 158L85.2675 157L68.2675 106L77.2675 101L99.2675 151L109.267 149L85.2675 66L89.2675 53L120.267 73L126.267 66L99.2675 27L56.2675 0Z" />
        </svg>

        {/* ABDOMEN */}
        <svg id="abdomen" x="180" y="210" width="180" height="230" viewBox="0 0 293 420" overflow="visible" onClick={() => togglePart('abdomen')}>
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M129 11L128 54L77 85V41L129 11Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M128 73V127L76 136V105L128 73Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M127 139L126 217L81 194V153L127 139Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M126 237V317L141 417L83 339V221L126 237Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M167 232V312L152 412L210 334V216L167 232Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M159 11L221 31V75L161 50L159 11Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M164 67L216 96L220 137L164 123V67Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M212 153L217 197L165 210V142L212 153Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M57 27L21 63L1 7L57 27Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M55 38L58 84L24 70L55 38Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M61 96L67.5 154L30 126L23 78L61 96Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M67 161V215L30 191L32 134L67 161Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M59 227L69 281V386L43 388L0 320L18 252L21 208L59 227Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M235 20L271 56L291 0L235 20Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M236 31L233 77L267 63L236 31Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M233.5 89L227 147L264.5 119L271.5 71L233.5 89Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M228 153V207L265 183L263 126L228 153Z" />
          <path className={`body-part-path ${getPartClass('abdomen')}`} d="M234 217L224 271V376L250 378L293 310L275 242L272 198L234 217Z" />
        </svg>

        {/* RIGHT LEG */}
        <svg id="right-leg" x="140" y="420" width="162" height="350" viewBox="0 0 162 756" overflow="visible" onClick={() => togglePart('right-leg')}>
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M23.0673 0L33 97.5L0 299.5V162L23.0673 0Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M38 3.5L151 176V252L117 164L41 85.5L38 3.5Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M40 100.5L95 190L121 290.5L107 384L52 290.5L30 176.5L40 100.5Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M117.5 212.5L150 276.5L131 396.5L114.5 384.5L131 271.5L117.5 212.5Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M29.0001 191.5V291.5L91.0001 366L69.0001 396L16.5315 291.5L29.0001 191.5Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M61 17.5L139 68L115 98L61 17.5Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M144 71L162 96.0333L159 163L119 104.033L144 71Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M16.0001 346L40.8465 446L27.0001 436L16 496L16.0001 346Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M50 408H84L95 424L74 490H56V448L43 432L50 408Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M115 413V471L85 567L75 509L115 413Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M29.7076 449L62.7076 521L57.7076 667L75.7076 751H57.7076L13 587L29.7076 449Z" />
          <path className={`body-part-path ${getPartClass('right-leg')}`} d="M110 506L129 562L121 626L102.5 662L89 756L87 662V592L110 506Z" />
        </svg>

        {/* RIGHT FOOT */}
        <svg id="right-foot" x="180" y="773" width="60" height="50" viewBox="0 0 86 90" overflow="visible" onClick={() => togglePart('right-foot')}>
          <path className={`body-part-path ${getPartClass('right-foot')}`} d="M68 0L86 30L80 90H68L64 78L59 90L5 88L0 69L22 22L68 0Z" />
        </svg>

        {/* LEFT LEG */}
        <svg id="left-leg" x="240" y="415" width="156" height="350" viewBox="0 0 156 769" overflow="visible" onClick={() => togglePart('left-leg')}>
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M132.933 0L123 97.5L146 302L156 172L132.933 0Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M114 24L11 208L4 304.5L38 216.5L114 112V24Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M114 127L55 210.5L29 311L43 404.5L98 311L120 197L114 127Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M32.5 256L0 320L19 440L35.5 428L19 315L32.5 256Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M124 218L115 318L70.9999 384L86.9999 410L136.469 318L124 218Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M92 27L26 86.5L52 109.5L92 27Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M22 91L10 111.033L13 178L53 119.033L22 91Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M129.846 360L105 460L118.846 450L129.847 510L129.846 360Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M89 424H55L44 440L65 506H83V464L96 448L89 424Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M23 437V495L57 591L63 533L23 437Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M113 468L80 540L85 686L67 764L85 768L129.708 606L113 468Z" />
          <path className={`body-part-path ${getPartClass('left-leg')}`} d="M24 519L11 575L19 639L37.5 675L51 769L53 675V605L24 519Z" />
        </svg>

        {/* LEFT FOOT */}
        <svg id="left-foot" x="290" y="771" width="60" height="50" viewBox="0 0 86 90" overflow="visible" onClick={() => togglePart('left-foot')}>
          <path className={`body-part-path ${getPartClass('left-foot')}`} d="M18 0L0 30L6 90H18L22 78L27 90L81 88L86 69L64 22L18 0Z" />
        </svg> 
      </svg>


      {/* Grid Lining - Aesthetic only */}
      <div className={`absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none transition-opacity ${editorMode ? 'opacity-20' : 'opacity-5'}`}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border border-white/5"></div>
        ))}
      </div>

      {/* Status Indicators */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        <div className={`flex items-center gap-1.5 transition-opacity ${editorMode ? 'opacity-100' : 'opacity-20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${editorMode ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gold'}`}></div>
          <span className={`text-[8px] font-mono uppercase tracking-[0.2em] ${editorMode ? 'text-red-400 font-bold' : ''}`}>
            {editorMode ? 'System_Cal_Override' : 'Bio_Monitor_V.2'}
          </span>
        </div>
      </div>

      {editorMode && (
        <div className="absolute top-3 md:top-auto md:bottom-3 right-3 flex flex-col gap-2 items-end">
          <button 
            onClick={() => {
              setInternalAffected([]);
              onPartToggle?.('reset'); // Assuming parent handles reset or similar
            }}
            className="px-2 py-1 bg-carmine/20 hover:bg-carmine/40 border border-carmine/40 rounded text-[7px] text-carmine uppercase font-mono tracking-tighter transition-colors"
          >
            Resetar Áreas
          </button>
        </div>
      )}
    </div>
  );
};

