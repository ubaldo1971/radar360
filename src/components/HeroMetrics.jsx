export default function HeroMetrics() {
    return (
        <div className="w-full bg-card border-b border-border relative z-20 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border w-full">
                    
                    {/* Metrica 1 - Impacto Mensual */}
                    <div className="py-4 md:py-5 px-4 flex items-center justify-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/100 group-hover:text-white transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-primary leading-none" style={{ fontFamily: 'var(--font-heading)' }}>2.4M</p>
                            <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Vistas/Mes</p>
                        </div>
                    </div>

                    {/* Metrica 2 - Audiencia Social */}
                    <div className="py-4 md:py-5 px-4 flex items-center justify-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-500/100 group-hover:text-white transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-primary leading-none" style={{ fontFamily: 'var(--font-heading)' }}>850K</p>
                            <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Seguidores</p>
                        </div>
                    </div>

                    {/* Metrica 3 - Interacciones */}
                    <div className="py-4 md:py-5 px-4 flex items-center justify-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/100 group-hover:text-white transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-primary leading-none" style={{ fontFamily: 'var(--font-heading)' }}>12K+</p>
                            <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Comentarios</p>
                        </div>
                    </div>

                    {/* Metrica 4 - Compartidos */}
                    <div className="py-4 md:py-5 px-4 flex items-center justify-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/100 group-hover:text-white transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-primary leading-none" style={{ fontFamily: 'var(--font-heading)' }}>1.1M</p>
                            <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Compartidos</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
