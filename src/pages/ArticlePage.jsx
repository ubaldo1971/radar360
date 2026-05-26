/**
 * ArticlePage — Página completa de un artículo con diseño tipo periódico.
 */
import { newsArticles, ads, useRadarStore } from '../data/store';
import { useRadarConfig } from '../data/siteConfig';

export default function ArticlePage() {
    useRadarStore();
    useRadarConfig();
    const { id } = useParams();
    const navigate = useNavigate();

    // Try to find article in regular articles first, then in ads
    let article = newsArticles.getAll().find((a) => a.id === id);
    let isSponsored = false;

    if (!article) {
        // Check if it's a sponsored ad article (id format: ad-XXXX)
        const adId = id.startsWith('ad-') ? id.replace('ad-', '') : id;
        const ad = ads.getAll().find((a) => a.id === adId);
        if (ad) {
            const sectionCategoryMap = {
                politics: 'Política',
                economy: 'Economía',
                sports: 'Deportes',
                technology: 'Tecnología',
                culture: 'Cultura',
            };
            article = {
                id: `ad-${ad.id}`,
                title: ad.title,
                excerpt: ad.description,
                category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
                author: ad.publisherName || 'Anunciante',
                image: ad.photos?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
                allPhotos: ad.photos || [],
                readTime: 'Patrocinado',
                createdAt: ad.createdAt,
                sponsored: true,
                socialNetworks: {
                    facebookUrl: ad.facebookUrl,
                    twitterUrl: ad.twitterUrl,
                    instagramUrl: ad.instagramUrl
                }
            };
            isSponsored = true;
        }
    }

    // 404 state
    if (!article) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-navy mb-4" style={{ fontFamily: 'var(--font-heading)' }}>404</h1>
                    <p className="text-text-muted text-lg mb-6">Artículo no encontrado</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // Format date
    const formattedDate = article.createdAt
        ? new Date(article.createdAt).toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
        : 'Fecha no disponible';

    // Generate full body content from excerpt (since we don't have full body stored)
    const bodyContent = article.body || article.excerpt || '';

    const handleShare = (network) => {
        const url = window.location.href;
        const text = article.title;
        let shareUrl = '';

        switch (network) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' \n' + url)}`;
                break;
            default:
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="min-h-screen bg-surface">
            {/* ── Back Button ── */}
            <button 
                onClick={() => navigate(-1)}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex items-center gap-3 px-6 py-4 bg-accent text-white rounded-full shadow-2xl hover:bg-accent-hover hover:scale-105 hover:shadow-accent/50 transition-all group overflow-hidden animate-bounce"
            >
                <div className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-sm">
                    <svg 
                        className="w-6 h-6 transition-transform group-hover:-translate-x-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </div>
            </button>

            {/* ── Hero Image ── */}
            <div className="relative w-full h-64 md:h-96 lg:h-[28rem] overflow-hidden">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category + Sponsored badges */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="bg-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                        {article.category}
                    </span>
                    {(article.sponsored || isSponsored) && (
                        <span className="bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                            Patrocinado
                        </span>
                    )}
                </div>
            </div>

            {/* ── Article Content ── */}
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-12" style={{ position: 'relative', zIndex: 10 }}>
                <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
                    {/* Article header */}
                    <div className="relative p-6 sm:p-8 md:p-12 min-h-[300px] flex flex-col items-center text-center overflow-hidden">
                        {article.visualLayout ? (
                            /* Renderizado del Layout Visual Personalizado */
                            <div className="absolute inset-0 w-full h-full pointer-events-none">
                                {article.visualLayout.map(obj => (
                                    <div 
                                        key={obj.id}
                                        className="absolute"
                                        style={{ 
                                            left: `${(obj.x / 1000) * 100}%`, 
                                            top: `${(obj.y / 562.5) * 100}%`,
                                            width: obj.width ? `${(obj.width / 1000) * 100}%` : 'auto',
                                            zIndex: 20
                                        }}
                                    >
                                        {obj.type === 'text' ? (
                                            <div style={{
                                                fontSize: `clamp(14px, ${(obj.fontSize / 1000) * 100}vw, ${obj.fontSize}px)`,
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
                                                fontSize: `clamp(10px, ${(obj.fontSize / 1000) * 100}vw, ${obj.fontSize}px)`,
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
                                ))}
                            </div>
                        ) : (
                            /* Renderizado Estándar (Fallback) */
                            <>
                                <h1
                                    className="text-2xl md:text-3xl lg:text-4xl font-black text-text-primary leading-tight mb-6"
                                    style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                    {article.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center gap-4 pb-6 border-b border-border w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-white text-sm font-bold">
                                            {(article.author || 'A')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{article.author}</p>
                                            <p className="text-xs text-text-muted capitalize">{formattedDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1" />

                                    <div className="flex items-center gap-4 text-xs text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {article.readTime || '5 min'} lectura
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="prose prose-lg max-w-none px-6 pb-8 sm:px-8 sm:pb-10 md:px-12 md:pb-12">
                        {article.explanation && (
                            <div className="mb-8 p-6 bg-accent/5 border border-accent/20 rounded-xl">
                                <h3 className="text-lg font-black text-accent mb-2 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Explicación de la Nota
                                </h3>
                                <p className="text-text-secondary leading-relaxed font-medium">
                                    {article.explanation}
                                </p>
                            </div>
                        )}

                        <p className="text-lg text-text-secondary leading-relaxed font-medium mb-6" style={{ borderLeft: '4px solid var(--color-accent)', paddingLeft: '1.25rem' }}>
                            {article.excerpt}
                        </p>

                        <div className="text-text-primary text-base leading-relaxed space-y-4">
                            {bodyContent.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>

                        {article.credits && (
                            <div className="flex items-center gap-2 pt-6 border-t border-border mt-8">
                                <span className="font-bold text-text-primary text-sm uppercase tracking-wider">Créditos:</span>
                                <span className="text-text-muted italic text-sm">{article.credits}</span>
                            </div>
                        )}

                        {article.allPhotos && article.allPhotos.length > 1 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                                    📷 Galería de Imágenes
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {article.allPhotos.map((photo, idx) => (
                                        <div key={idx} className="rounded-xl overflow-hidden shadow-md border border-border">
                                            <img
                                                src={photo}
                                                alt={`${article.title} - Imagen ${idx + 1}`}
                                                className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border p-6 sm:p-8 md:px-12 md:py-6">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <span className="font-semibold text-text-secondary text-sm">Compartir:</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleShare('facebook')} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" /></svg>
                                </button>
                                <button onClick={() => handleShare('twitter')} className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </button>
                                <button onClick={() => handleShare('whatsapp')} className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
