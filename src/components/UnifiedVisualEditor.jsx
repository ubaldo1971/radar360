import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { 
    Type, Move, Maximize2, Save, X, AlignCenter, AlignLeft, AlignRight, Type as TypeIcon, Layers, History, Clock
} from 'lucide-react';

const FONT_FAMILIES = [
    { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
    { name: 'Playfair (Serif)', value: 'Playfair Display, serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Outfit', value: 'Outfit, sans-serif' },
    { name: 'Roboto Mono', value: 'Roboto Mono, monospace' },
];

/**
 * UnifiedVisualEditor
 * @param {string} mode - 'article' | 'section'
 * @param {object} initialData - The current state object (article or section config)
 * @param {array} history - Array of previous states for the Time Machine
 * @param {function} onSave - Callback with the updated payload
 * @param {function} onCancel - Callback to close
 */
const UnifiedVisualEditor = ({ mode, initialData, history = [], onSave, onCancel }) => {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const canvasRef = useRef(null);
    const [showHistory, setShowHistory] = useState(false);

    // Default layout if none exists
    const getDefaultLayout = () => {
        if (mode === 'article') {
            return [
                { id: 'title', type: 'text', text: initialData?.title || 'Sin Título', x: 50, y: 150, fontSize: 42, fontWeight: '900', color: '#ffffff', fontFamily: 'Inter, sans-serif', textAlign: 'center', width: 800, lineHeight: 1.1, shadow: true },
                { id: 'excerpt', type: 'text', text: initialData?.excerpt || 'Sin extracto disponible...', x: 50, y: 250, fontSize: 18, fontWeight: '400', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', textAlign: 'center', width: 700, lineHeight: 1.5, shadow: true },
                { id: 'category', type: 'badge', text: (initialData?.category || 'General').toUpperCase(), x: 50, y: 100, fontSize: 12, fontWeight: '800', color: '#ffffff', bgColor: 'var(--color-accent)', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '4px 12px', radius: 9999 }
            ];
        } else {
            return [
                { id: 'title', type: 'text', text: initialData?.title || 'Sección', x: 50, y: 150, fontSize: 48, fontWeight: '900', color: initialData?.textColor || '#ffffff', fontFamily: 'Inter, sans-serif', textAlign: 'left', width: 800, lineHeight: 1.1, shadow: true },
                { id: 'subtitle', type: 'text', text: initialData?.subtitle || 'Subtítulo...', x: 50, y: 220, fontSize: 20, fontWeight: '400', color: initialData?.textColor || '#e2e8f0', fontFamily: 'Inter, sans-serif', textAlign: 'left', width: 800, lineHeight: 1.5, shadow: true }
            ];
        }
    };

    const [objects, setObjects] = useState(initialData?.visualLayout || getDefaultLayout());
    const [selectedId, setSelectedId] = useState(null);
    const selectedObject = objects.find(o => o.id === selectedId);

    // Background States
    const [bgImage, setBgImage] = useState(mode === 'article' ? (initialData.image || '') : (initialData.bannerImage || ''));
    const [bgColor, setBgColor] = useState(mode === 'section' ? (initialData.bgColor || '#0f172a') : '#000000');

    // Article Content States
    const [body, setBody] = useState(initialData.body || '');
    const [explanation, setExplanation] = useState(initialData.explanation || '');
    const [credits, setCredits] = useState(initialData.credits || '');

    useEffect(() => {
        if (canvasRef.current) {
            const updateSize = () => {
                const { width } = canvasRef.current.getBoundingClientRect();
                setCanvasSize({ width, height: width * (9/16) || 400 });
            };
            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, []);

    const updateObject = (id, updates) => {
        setObjects(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    const handleDrag = (id, e, data) => {
        updateObject(id, { x: data.x, y: data.y });
    };

    const handleSave = () => {
        try {
            const titleObj = objects.find(o => o.id === 'title');
            const subtitleObj = objects.find(o => o.id === 'subtitle' || o.id === 'excerpt');

            let payload = {};

            if (mode === 'article') {
                payload = {
                    ...initialData,
                    title: titleObj?.text || initialData.title,
                    excerpt: subtitleObj?.text || initialData.excerpt,
                    visualLayout: objects,
                    image: bgImage,
                    body,
                    explanation,
                    credits
                };
            } else {
                payload = {
                    title: titleObj?.text || initialData.title,
                    subtitle: subtitleObj?.text || initialData.subtitle,
                    bannerImage: bgImage,
                    bgColor,
                    textColor: titleObj?.color || initialData.textColor,
                    visualLayout: objects
                };
            }
            onSave(payload);
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const restoreHistory = (state) => {
        if (!confirm('¿Cargar esta versión del historial? Reemplazará tu trabajo actual.')) return;
        setObjects(state.visualLayout || getDefaultLayout());
        if (mode === 'article') {
            setBgImage(state.image || '');
        } else {
            setBgImage(state.bannerImage || '');
            setBgColor(state.bgColor || '#0f172a');
        }
        setShowHistory(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col backdrop-blur-sm">
            {/* Toolbar Top */}
            <div className="h-16 border-b border-white/10 bg-slate-900 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent/20">
                        <Maximize2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm">Editor Visual Radar360</h2>
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                            Modo: {mode === 'article' ? 'Redacción' : 'Diseño de Portal'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl transition-all ${showHistory ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <History size={16} /> Time Machine
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold transition-colors flex items-center gap-2">
                        <X size={16} /> Cancelar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-accent text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                        <Save size={16} /> Guardar Diseño
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Canvas Area */}
                <div className="flex-1 p-12 flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] overflow-auto relative">
                    
                    {/* Canvas */}
                    <div 
                        ref={canvasRef}
                        className="relative shadow-2xl shadow-black/50 overflow-hidden transition-all"
                        style={{ 
                            width: '100%', 
                            maxWidth: mode === 'article' ? '1000px' : '1200px', 
                            height: canvasSize.height || '400px',
                            backgroundColor: bgColor,
                            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                        onClick={() => setSelectedId(null)}
                    >
                        {/* Overlay Darkener */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                        {/* Draggable Objects */}
                        {objects.map(obj => {
                            const nodeRef = React.useRef(null);
                            return (
                                <Draggable
                                    key={obj.id}
                                    nodeRef={nodeRef}
                                    position={{ x: obj.x, y: obj.y }}
                                    onDrag={(e, data) => handleDrag(obj.id, e, data)}
                                    bounds="parent"
                                    onStart={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(obj.id);
                                    }}
                                >
                                    <div 
                                        ref={nodeRef}
                                        className={`absolute cursor-move select-none p-2 group ${selectedId === obj.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-transparent' : 'hover:ring-1 hover:ring-white/30'}`}
                                        style={{ 
                                            width: obj.width ? `${obj.width}px` : 'auto',
                                            zIndex: selectedId === obj.id ? 50 : 10
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(obj.id);
                                        }}
                                    >
                                        {obj.type === 'text' ? (
                                            <div style={{
                                                fontSize: `${obj.fontSize}px`,
                                                fontWeight: obj.fontWeight,
                                                color: obj.color,
                                                fontFamily: obj.fontFamily,
                                                textAlign: obj.textAlign,
                                                lineHeight: obj.lineHeight,
                                                textShadow: obj.shadow ? '0 2px 10px rgba(0,0,0,0.8)' : 'none'
                                            }}>
                                                {obj.text}
                                            </div>
                                        ) : (
                                            <div style={{
                                                fontSize: `${obj.fontSize}px`,
                                                fontWeight: obj.fontWeight,
                                                color: obj.color,
                                                backgroundColor: obj.bgColor,
                                                fontFamily: obj.fontFamily,
                                                padding: obj.padding,
                                                borderRadius: `${obj.radius}px`,
                                                display: 'inline-block',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                            }}>
                                                {obj.text}
                                            </div>
                                        )}
                                    </div>
                                </Draggable>
                            );
                        })}
                    </div>

                    {/* Time Machine History Panel */}
                    {showHistory && (
                        <div className="absolute top-0 right-0 bottom-0 w-72 bg-slate-800/90 backdrop-blur-xl border-l border-white/10 p-4 shadow-2xl flex flex-col z-50">
                            <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-indigo-400" /> Historial de Versiones
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
                                {history.length === 0 ? (
                                    <div className="text-center text-slate-500 text-xs py-8">
                                        No hay versiones anteriores guardadas.
                                    </div>
                                ) : (
                                    history.map((h, i) => (
                                        <button 
                                            key={h.timestamp}
                                            onClick={() => restoreHistory(h.state)}
                                            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group"
                                        >
                                            <div className="text-white font-bold text-xs mb-1">Versión {history.length - i}</div>
                                            <div className="text-slate-400 text-[10px]">{new Date(h.timestamp).toLocaleString('es-MX')}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Properties Sidebar */}
                <div className="w-80 bg-slate-800 border-l border-white/10 flex flex-col overflow-y-auto p-6 scrollbar-thin z-10">
                    
                    {/* Background Properties */}
                    <div className="mb-8 pb-6 border-b border-white/10">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4">Fondo</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">URL Imagen</label>
                                <input 
                                    value={bgImage} 
                                    onChange={(e) => setBgImage(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-accent"
                                />
                            </div>
                            {mode === 'section' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">Color de Fondo Base</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0 p-0 cursor-pointer" />
                                        <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    {!selectedId ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center text-center text-slate-500 py-4">
                                <Move size={32} className="mb-2 opacity-50" />
                                <h3 className="text-white font-bold text-sm">Diseño Visual</h3>
                                <p className="text-xs mt-1 px-4">Haz clic en un texto sobre la imagen para editar su estilo.</p>
                            </div>
                            
                            {mode === 'article' && (
                                <div className="mb-8 pt-6 border-t border-white/10 space-y-4">
                                    <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4 text-indigo-400">Contenido del Artículo</h3>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Texto de la Nota (Cuerpo)</label>
                                        <textarea 
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            rows={6}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent outline-none"
                                            placeholder="Escribe el contenido completo del artículo aquí..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Explicación de la nota</label>
                                        <textarea 
                                            value={explanation}
                                            onChange={(e) => setExplanation(e.target.value)}
                                            rows={3}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent outline-none"
                                            placeholder="Escribe una explicación adicional..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Créditos</label>
                                        <input 
                                            value={credits}
                                            onChange={(e) => setCredits(e.target.value)}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent outline-none"
                                            placeholder="ej. periodista: Jovani la pluma sangrienta"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                    <TypeIcon size={14} className="text-accent" /> Propiedades
                                </h3>
                                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded font-bold">{selectedId}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">Texto</label>
                                    <textarea 
                                        value={selectedObject.text}
                                        onChange={(e) => updateObject(selectedId, { text: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">Fuente</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {FONT_FAMILIES.map(font => (
                                            <button
                                                key={font.value}
                                                onClick={() => updateObject(selectedId, { fontFamily: font.value })}
                                                className={`px-3 py-2 rounded-lg text-left text-xs transition-all border ${selectedObject.fontFamily === font.value ? 'bg-accent border-accent text-white font-bold' : 'bg-slate-900 border-white/5 text-slate-300 hover:border-white/20'}`}
                                                style={{ fontFamily: font.value }}
                                            >
                                                {font.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Tamaño ({selectedObject.fontSize}px)</label>
                                        <input 
                                            type="range" min="12" max="120" step="1"
                                            value={selectedObject.fontSize}
                                            onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) })}
                                            className="w-full accent-accent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Grosor</label>
                                        <select 
                                            value={selectedObject.fontWeight}
                                            onChange={(e) => updateObject(selectedId, { fontWeight: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                                        >
                                            <option value="300">Light</option>
                                            <option value="400">Regular</option>
                                            <option value="600">Semi Bold</option>
                                            <option value="700">Bold</option>
                                            <option value="900">Black</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Alignment */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">Alineación</label>
                                    <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
                                        <button onClick={() => updateObject(selectedId, { textAlign: 'left' })} className={`flex-1 flex justify-center py-1.5 rounded ${selectedObject.textAlign === 'left' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><AlignLeft size={16} /></button>
                                        <button onClick={() => updateObject(selectedId, { textAlign: 'center' })} className={`flex-1 flex justify-center py-1.5 rounded ${selectedObject.textAlign === 'center' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><AlignCenter size={16} /></button>
                                        <button onClick={() => updateObject(selectedId, { textAlign: 'right' })} className={`flex-1 flex justify-center py-1.5 rounded ${selectedObject.textAlign === 'right' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><AlignRight size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={selectedObject.color} onChange={(e) => updateObject(selectedId, { color: e.target.value })} className="w-8 h-8 rounded border-0 p-0 cursor-pointer" />
                                    </div>
                                </div>

                                {selectedObject.type === 'text' && (
                                    <button 
                                        onClick={() => updateObject(selectedId, { shadow: !selectedObject.shadow })}
                                        className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedObject.shadow ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                                    >
                                        <Layers size={14} /> Sombrear Texto {selectedObject.shadow ? 'ON' : 'OFF'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnifiedVisualEditor;
