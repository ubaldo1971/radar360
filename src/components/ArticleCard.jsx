/**
 * ArticleCard — Tarjeta de artículo reutilizable.
 * Ahora con Link para navegar a la página completa del artículo.
 */
import { Link } from 'react-router-dom';

export default function ArticleCard({ article, size = 'medium', variant = 'default' }) {
    if (!article) return null;

    const articleUrl = `/articulo/${article.id}`;
    const date = article.date || new Date(article.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

    // Determinar clases basadas en el tamaño solicitado
    let containerClass = "bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer flex";
    let imgContainerClass = "relative overflow-hidden flex-shrink-0";
    let imgClass = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105";
    let contentClass = "flex flex-col flex-1";
    let titleClass = "font-bold text-text-primary leading-snug group-hover:text-accent transition-colors duration-200 line-clamp-2";
    let excerptClass = "text-text-muted leading-relaxed line-clamp-2 flex-1";

    if (size === 'large') {
        // Tarjeta hero grande
        containerClass += " flex-col";
        imgContainerClass += " w-full h-64 md:h-80 lg:h-96";
        contentClass += " p-8 md:p-10";
        titleClass += " text-2xl md:text-3xl mb-4";
        excerptClass += " text-base md:text-lg mb-6 line-clamp-3";
    } else if (size === 'small') {
        // Tarjeta compacta
        containerClass += " flex-row h-28";
        imgContainerClass += " w-28 h-full";
        contentClass += " p-4 justify-between";
        titleClass += " text-sm mb-1";
        excerptClass += " hidden"; // No excerpt in small
    } else {
        // Medium (predeterminado)
        if (variant === 'horizontal') {
            containerClass += " flex-col sm:flex-row";
            imgContainerClass += " w-full sm:w-48 h-44 sm:h-auto";
            contentClass += " p-6 md:p-8 justify-between";
        } else {
            containerClass += " flex-col";
            imgContainerClass += " w-full h-48";
            contentClass += " p-6 md:p-8";
        }
        titleClass += " text-base mb-2";
        excerptClass += " text-sm mb-4";
    }

    return (
        <Link to={articleUrl} className="block w-full">
            <article className={containerClass}>
                {/* Image */}
                <div className={imgContainerClass}>
                    <img src={article.image} alt={article.title} className={imgClass} loading="lazy" />
                    <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                        {article.category}
                    </span>
                    {article.sponsored && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                            Patrocinado
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className={contentClass}>
                    <div>
                        <h3 className={titleClass}>{article.title}</h3>
                        <p className={excerptClass}>{article.excerpt}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            {size !== 'small' && <span className="font-medium text-text-secondary">{article.author}</span>}
                            {size !== 'small' && <span>•</span>}
                            <span>{date}</span>
                        </div>
                        {size !== 'small' && <span className="text-xs text-text-muted">{article.readTime}</span>}
                        {size === 'small' && <span className="text-accent text-xs font-bold uppercase tracking-wide hover:underline">Leer Más</span>}
                    </div>
                </div>
            </article>
        </Link>
    );
}
