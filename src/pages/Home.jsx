/**
 * Home — Página principal del portal Radar360.
 * Layout profesional organizado en bloques visuales bien separados.
 */
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import FeaturedArticle from '../components/FeaturedArticle';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import SectionGrid from '../components/SectionGrid';
import SubscriptionForm from '../components/SubscriptionForm';
import FloatingButtons from '../components/FloatingButtons';
import Footer from '../components/Footer';
import LiveStream from '../components/LiveStream';
import HeroMetrics from '../components/HeroMetrics';
import { newsArticles, useRadarStore } from '../data/store';
import { useRadarConfig } from '../data/siteConfig';

export default function Home() {
    useRadarStore();
    useRadarConfig();
    const allPublished = newsArticles.getPublished();
    const featuredArticle = newsArticles.getFeatured();
    const nonFeatured = allPublished.filter((a) => !a.featured);

    const displayFeatured = featuredArticle;

    const topArticles = nonFeatured.slice(0, 3);
    const bottomArticles = nonFeatured.slice(3, 5);

    const getCategory = (cat) => newsArticles.getByCategory(cat);

    const politicsArticles = getCategory('Política');
    const economyArticles = getCategory('Economía');
    const sportsArticles = getCategory('Deportes');
    const techArticles = getCategory('Tecnología');
    const cultureArticles = getCategory('Cultura');

    return (
        <div className="min-h-screen bg-surface">
            {/* ── Top Bar ── */}
            <TopBar />

            {/* ── Header ── */}
            <Header />

            {/* ── Navigation ── */}
            <Navigation />

            {/* ── Hero Metrics ── */}
            <HeroMetrics />

            {/* ── Botones flotantes ── */}
            <FloatingButtons />

            {/* ══════════════════════════════════════════
          BLOQUE 1 — Artículo Destacado
          ══════════════════════════════════════════ */}
            {displayFeatured && (
                <div className="container-custom pt-16 md:pt-20 pb-12">
                    <ArticleCard article={displayFeatured} size="large" />
                </div>
            )}

            {/* ══════════════════════════════════════════
          BLOQUE LIVE STREAM
          ══════════════════════════════════════════ */}
            <div className="container-custom py-12 md:py-16">
                <LiveStream />
            </div>

            {/* ══════════════════════════════════════════
          BLOQUE 2 — Últimas Noticias + Sidebar
          ══════════════════════════════════════════ */}
            <div className="container-custom py-24 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Columna principal */}
                    <div className="lg:col-span-2">
                        {/* Encabezado */}
                        <div className="flex items-center gap-4 mb-12">
                            <div className="flex-1 h-px bg-border/50" />
                            <h2
                                className="text-xl md:text-2xl font-black text-text-primary uppercase tracking-wide text-center"
                                style={{ fontFamily: 'var(--font-heading)' }}
                            >
                                Últimas Noticias
                            </h2>
                            <div className="flex-1 h-px bg-border/50" />
                        </div>

                        {/* 3 tarjetas verticales (tamaño medium) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
                            {topArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} size="medium" />
                            ))}
                        </div>

                        {/* 2 tarjetas horizontales (tamaño small) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {bottomArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} size="small" variant="horizontal" />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Sidebar />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          BLOQUE 3 — Secciones por Categoría
          ══════════════════════════════════════════ */}
            <div className="bg-surface border-t border-border/50">
                <div className="container-custom py-28 md:py-36 space-y-24 md:space-y-32">
                    <div>
                        <SectionGrid id="section-politics" title="Política" articles={politicsArticles} />
                    </div>
                    <div>
                        <SectionGrid id="section-economy" title="Economía" articles={economyArticles} />
                    </div>
                    <div>
                        <SectionGrid id="section-sports" title="Deportes" articles={sportsArticles} />
                    </div>
                    <div>
                        <SectionGrid id="section-technology" title="Tecnología" articles={techArticles} />
                    </div>
                    <div>
                        <SectionGrid id="section-culture" title="Cultura" articles={cultureArticles} />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          BLOQUE 4 — Suscripción 
          Fondo suave que se adapta
          ══════════════════════════════════════════ */}
            <div id="subscription-section" className="bg-surface border-y border-border/30">
                <div className="max-w-3xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
                    <SubscriptionForm />
                </div>
            </div>

            {/* ── Footer ── */}
            <Footer />
        </div>
    );
}
