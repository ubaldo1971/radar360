import { useState, useEffect } from 'react';

const DEFAULT_CHANNEL = { id: 'Y-IlMeCCtIg', name: 'France 24 Español' };

export default function LiveStream() {
    const [channel, setChannel] = useState(() => {
        try {
            const saved = localStorage.getItem('ei_live_channel');
            return saved ? JSON.parse(saved) : DEFAULT_CHANNEL;
        } catch { return DEFAULT_CHANNEL; }
    });

    // Poll localStorage for admin changes
    useEffect(() => {
        const interval = setInterval(() => {
            try {
                const saved = localStorage.getItem('ei_live_channel');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.id !== channel.id) setChannel(parsed);
                }
            } catch { /* ignore */ }
        }, 2000);
        return () => clearInterval(interval);
    }, [channel.id]);

    const embedUrl = `https://www.youtube.com/embed/${channel.id}?autoplay=1&cc_load_policy=1&cc_lang_pref=es&hl=es&rel=0&modestbranding=1&playsinline=1`;

    return (
        <div className="w-full bg-card py-10 my-8 shadow-inner overflow-hidden relative">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-20 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
            
            <div className="px-8 md:px-16 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    
                    {/* Sección del Título/Descripción */}
                    <div className="lg:col-span-1 flex flex-col justify-center text-center lg:text-left z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-full self-center lg:self-start mb-4 border border-red-500/30">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            En Vivo
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-black text-text-primary mb-3 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Radar360 <span className="text-accent underline decoration-4 underline-offset-4">TV</span>
                        </h2>
                        
                        <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-md mx-auto lg:mx-0">
                            No te pierdas de nada. Transmisiones en vivo, debates políticos de alto nivel, últimas noticias, entrevistas exclusivas y mucho más las 24 horas del día.
                        </p>
                        
                        <div className="flex items-center gap-4 justify-center lg:justify-start">
                            <div className="text-center">
                                <p className="text-2xl font-black text-text-primary">1.2k</p>
                                <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold">Viendo</p>
                            </div>
                            <div className="w-px h-8 bg-surface/20" />
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-surface text-text-primary font-bold rounded-xl hover:bg-slate-100 transition-all text-sm shadow-xl shadow-white/5 group">
                                <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                Suscribirme
                            </button>
                        </div>
                    </div>

                    {/* Contenedor del Video */}
                    <div className="lg:col-span-2 w-full relative z-10 group cursor-pointer lg:-my-4">
                        <div className="aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-border shadow-2xl relative">
                            {/* YouTube News Channel - livestream 24/7 con sonido y subtítulos */}
                            <iframe
                                key={channel.id}
                                className="w-full h-full absolute inset-0"
                                src={embedUrl}
                                title={`Radar360 TV - ${channel.name}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                            
                            {/* Overlay degradado para mejor contraste de UI */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                            
                            {/* Metadata inferior del video */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 flex items-end justify-between pointer-events-none">
                                <div>
                                    <p className="text-text-primary text-sm md:text-base font-bold shadow-sm mb-1 line-clamp-1">MESA DE ANÁLISIS: Las decisiones de cara a las próximas elecciones 2026</p>
                                    <p className="text-text-secondary text-xs font-medium">Transmitido desde Monterrey, N.L.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-border overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" alt="Patrocinador" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-text-muted font-bold uppercase tracking-wider text-[9px] mb-0.5">Patrocinador</p>
                                        <p className="text-text-primary font-semibold">Grupo Empresarial</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Ticker de Noticias dentro del stream */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 pointer-events-none">
                                <div className="h-full bg-surface/50 w-1/3 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
