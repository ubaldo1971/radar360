/**
 * SectionGrid — Sección de categoría con grid de artículos.
 * Lee configuración visual desde siteConfig (editable desde Admin).
 */
import ArticleCard from './ArticleCard';
import { siteConfig } from '../data/siteConfig';

export default function SectionGrid({ id, title, articles, variant = 'default' }) {
    if (!articles || articles.length === 0) return null;

    const cfg = siteConfig.get('sections');
    const sectionCfg = cfg?.items?.[title] || {};

    const bannerImage = sectionCfg.bannerImage || '';
    const subtitle = sectionCfg.subtitle || '';
    const bgColor = sectionCfg.bgColor || '';
    const textColor = sectionCfg.textColor || '#ffffff';

    return (
        <section id={id} className="scroll-mt-20 pt-20 pb-10 first:pt-0 first:border-t-0 border-t border-border/50">
            {/* Banner de sección con imagen de fondo editable */}
            {bannerImage ? (
                <div
                    className="relative rounded-2xl overflow-hidden mb-10 h-36 md:h-44 flex items-end"
                    style={{ backgroundColor: bgColor || '#0f172a' }}
                >
                    <img
                        src={bannerImage}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {sectionCfg.visualLayout && sectionCfg.visualLayout.length > 0 ? (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {sectionCfg.visualLayout.map(obj => (
                                <div 
                                    key={obj.id} 
                                    className="absolute"
                                    style={{ 
                                        left: `${obj.x}px`, 
                                        top: `${obj.y}px`,
                                        width: obj.width ? `${obj.width}px` : 'auto'
                                    }}
                                >
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative z-10 px-8 pb-6">
                            <h2
                                className="text-2xl md:text-3xl font-black uppercase tracking-wide"
                                style={{ color: textColor, fontFamily: 'var(--font-heading)' }}
                            >
                                {sectionCfg.title || title}
                            </h2>
                            {subtitle && (
                                <p className="text-sm mt-1 opacity-80" style={{ color: textColor }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Sin banner: mostrar encabezado simple */
                <div className="flex flex-col items-center gap-2 mb-12">
                    <div className="flex items-center justify-center w-full gap-4">
                        <div className="flex-1 h-px bg-border/50" />
                        <h2
                            className="text-xl md:text-2xl font-black text-text-primary uppercase tracking-wide text-center"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            {sectionCfg.title || title}
                        </h2>
                        <div className="flex-1 h-px bg-border/50" />
                    </div>
                    {subtitle && (
                        <p className="text-sm text-text-muted text-center">{subtitle}</p>
                    )}
                    <a
                        href="#"
                        className="text-xs font-bold text-accent uppercase tracking-wider hover:underline whitespace-nowrap"
                    >
                        Ver Todo →
                    </a>
                </div>
            )}

            {/* Ver todo link cuando hay banner */}
            {bannerImage && (
                <div className="flex justify-end mb-6">
                    <a href="#" className="text-xs font-bold text-accent uppercase tracking-wider hover:underline">
                        Ver Todo →
                    </a>
                </div>
            )}

            {/* Articles grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Artículo destacado de la sección (Large) ocupa 2 columnas en LG */}
                {articles.length > 0 && (
                    <div className="lg:col-span-2">
                        <ArticleCard article={articles[0]} size="large" />
                    </div>
                )}
                
                {/* Artículos secundarios (Medium o Small) */}
                {articles.length > 1 && (
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        {articles.slice(1, 3).map((article) => (
                            <ArticleCard key={article.id} article={article} size="medium" />
                        ))}
                        {articles.slice(3).map((article) => (
                            <div className="sm:col-span-2" key={article.id}>
                                <ArticleCard article={article} size="small" variant="horizontal" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
