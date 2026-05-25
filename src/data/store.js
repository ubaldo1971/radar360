/**
 * store.js — Utilidad de almacenamiento local (simula base de datos).
 * En producción, reemplazar con API real (Supabase, Firebase, etc.).
 */

const KEYS = {
    SUBSCRIPTIONS: 'ei_subscriptions',
    ADS: 'ei_ads',
    PRICING: 'ei_pricing',
    SECTIONS: 'ei_ad_sections',
    ARTICLES: 'ei_articles',
};

/* ===== Helpers ===== */
function get(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ===== Suscripciones ===== */
export const subscriptions = {
    getAll: () => get(KEYS.SUBSCRIPTIONS),

    add: (data) => {
        const all = get(KEYS.SUBSCRIPTIONS);
        const entry = {
            id: generateId(),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString(),
        };
        all.push(entry);
        set(KEYS.SUBSCRIPTIONS, all);
        return entry;
    },

    remove: (id) => {
        const all = get(KEYS.SUBSCRIPTIONS).filter((s) => s.id !== id);
        set(KEYS.SUBSCRIPTIONS, all);
    },

    update: (id, updates) => {
        const all = get(KEYS.SUBSCRIPTIONS).map((s) =>
            s.id === id ? { ...s, ...updates } : s
        );
        set(KEYS.SUBSCRIPTIONS, all);
    },
};

/* ===== Anuncios ===== */
export const ads = {
    getAll: () => get(KEYS.ADS),

    getActive: () => {
        ads.refreshExpirations(); // Revisar si alguno expiró antes de devolver
        return get(KEYS.ADS).filter((a) => a.status === 'active');
    },

    /** Busca anuncios que hayan pasado su fecha de fin (si están activos) y los expira */
    refreshExpirations: () => {
        const all = get(KEYS.ADS);
        let changed = false;
        const now = new Date();

        const updated = all.map(ad => {
            if (ad.status === 'active' && ad.endDate) {
                const end = new Date(ad.endDate);
                if (now > end) {
                    changed = true;
                    return { ...ad, status: 'expired' };
                }
            }
            return ad;
        });

        if (changed) {
            set(KEYS.ADS, updated);
            
            // Pausar también los artículos vinculados en Redacción
            const expiredAds = updated.filter(a => a.status === 'expired');
            expiredAds.forEach(ad => {
                const linkedArticle = newsArticles.getByAdId(ad.id);
                if (linkedArticle) {
                    newsArticles.update(linkedArticle.id, { status: 'draft' });
                }
            });
        }
    },

    /** Convierte anuncios activos en formato compatible con artículos para mostrar en Home */
    getActiveAsArticles: () => {
        const sectionCategoryMap = {
            politics: 'Política',
            economy: 'Economía',
            sports: 'Deportes',
            technology: 'Tecnología',
            culture: 'Cultura',
        };
        return get(KEYS.ADS)
            .filter((a) => a.status === 'active')
            .map((ad) => ({
                id: `ad-${ad.id}`,
                title: ad.title,
                excerpt: ad.description,
                category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
                author: ad.publisherName || 'Anunciante',
                image: ad.photos?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
                readTime: 'Patrocinado',
                status: 'published',
                featured: ad.sectionKey === 'hero',
                sponsored: true,
                adId: ad.id,
                createdAt: ad.createdAt,
            }));
    },

    add: (data) => {
        const all = get(KEYS.ADS);
        
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);
        
        // Si hay planDays (ej. 7, 14, 30), calculamos la fecha de fin
        if (data.planDays) {
            end.setDate(end.getDate() + data.planDays);
        } else {
            // Por defecto 7 días si no hay
            end.setDate(end.getDate() + 7);
        }

        const entry = {
            id: generateId(),
            ...data,
            status: 'pending',
            createdAt: now.toISOString(),
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
        all.push(entry);
        set(KEYS.ADS, all);
        return entry;
    },

    // Renovar anuncio
    renew: (id, newPlanDays, newTotalPrice) => {
        const all = get(KEYS.ADS);
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + newPlanDays);

        const updated = all.map((a) =>
            a.id === id ? { 
                ...a, 
                status: 'pending', // Vuelve a revisión tras pagar
                startDate: now.toISOString(),
                endDate: end.toISOString(),
                planDays: newPlanDays,
                totalPrice: newTotalPrice
            } : a
        );
        set(KEYS.ADS, updated);
    },

    remove: (id) => {
        const all = get(KEYS.ADS).filter((a) => a.id !== id);
        set(KEYS.ADS, all);
    },

    update: (id, updates) => {
        const all = get(KEYS.ADS).map((a) =>
            a.id === id ? { ...a, ...updates } : a
        );
        set(KEYS.ADS, all);
    },
};

/* ===== Precios de anuncios (base) ===== */
const DEFAULT_PRICING = [
    { id: 'p1', name: '1 Semana', days: 7, price: 299, currency: 'MXN', active: true },
    { id: 'p2', name: '2 Semanas', days: 14, price: 499, currency: 'MXN', active: true },
    { id: 'p3', name: '1 Mes', days: 30, price: 899, currency: 'MXN', active: true },
    { id: 'p4', name: '3 Meses', days: 90, price: 2299, currency: 'MXN', active: true },
];

export const pricing = {
    getAll: () => {
        const data = get(KEYS.PRICING);
        if (data.length === 0) {
            set(KEYS.PRICING, DEFAULT_PRICING);
            return DEFAULT_PRICING;
        }
        return data;
    },

    update: (id, updates) => {
        const all = pricing.getAll().map((p) =>
            p.id === id ? { ...p, ...updates } : p
        );
        set(KEYS.PRICING, all);
    },

    add: (data) => {
        const all = pricing.getAll();
        const entry = { id: generateId(), ...data, active: true };
        all.push(entry);
        set(KEYS.PRICING, all);
        return entry;
    },

    remove: (id) => {
        const all = pricing.getAll().filter((p) => p.id !== id);
        set(KEYS.PRICING, all);
    },
};

/* ===== Secciones de publicación de anuncios ===== */
const DEFAULT_SECTIONS = [
    { id: 's1', name: '⭐ Hero (Noticia Principal)', key: 'hero', multiplier: 5, description: 'Posición principal del sitio — máxima visibilidad', active: true },
    { id: 's2', name: 'Política', key: 'politics', multiplier: 1.5, description: 'Sección de noticias políticas', active: true },
    { id: 's3', name: 'Economía', key: 'economy', multiplier: 1.5, description: 'Sección de noticias económicas', active: true },
    { id: 's4', name: 'Deportes', key: 'sports', multiplier: 1.2, description: 'Sección deportiva', active: true },
    { id: 's5', name: 'Tecnología', key: 'technology', multiplier: 1.3, description: 'Sección de tecnología', active: true },
    { id: 's6', name: 'Cultura', key: 'culture', multiplier: 1.0, description: 'Sección de cultura y entretenimiento', active: true },
    { id: 's7', name: 'Sidebar (Barra lateral)', key: 'sidebar', multiplier: 0.8, description: 'Banner en la barra lateral derecha', active: true },
];

export const adSections = {
    getAll: () => {
        const data = get(KEYS.SECTIONS);
        if (data.length === 0) {
            set(KEYS.SECTIONS, DEFAULT_SECTIONS);
            return DEFAULT_SECTIONS;
        }
        return data;
    },

    update: (id, updates) => {
        const all = adSections.getAll().map((s) =>
            s.id === id ? { ...s, ...updates } : s
        );
        set(KEYS.SECTIONS, all);
    },

    add: (data) => {
        const all = adSections.getAll();
        const entry = { id: generateId(), ...data, active: true };
        all.push(entry);
        set(KEYS.SECTIONS, all);
        return entry;
    },

    remove: (id) => {
        const all = adSections.getAll().filter((s) => s.id !== id);
        set(KEYS.SECTIONS, all);
    },
};

/* ===== Artículos / Noticias ===== */
const DEFAULT_ARTICLES = [
    { id: 'art1', title: 'Última Hora: Gran Escándalo Político Sacude la Capital del País', excerpt: 'Las autoridades investigan presuntas irregularidades en contratos gubernamentales que podrían involucrar a varios funcionarios de alto rango.', category: 'Política', author: 'María González', image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=600&fit=crop', readTime: '8 min', status: 'published', featured: true, createdAt: '2026-02-22T10:00:00Z' },
    { id: 'art2', title: 'Actualización Económica: Cambios en el Mercado Global', excerpt: 'Los principales indicadores financieros muestran tendencias mixtas mientras los inversores evalúan el impacto de las nuevas políticas comerciales.', category: 'Economía', author: 'Carlos Ramírez', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop', readTime: '5 min', status: 'published', featured: false, createdAt: '2026-02-22T09:00:00Z' },
    { id: 'art3', title: 'Deportes: Equipo Local Consigue Victoria Histórica', excerpt: 'Con un marcador contundente, el equipo local se posiciona como favorito para la fase final del torneo nacional.', category: 'Deportes', author: 'Roberto Herrera', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop', readTime: '4 min', status: 'published', featured: false, createdAt: '2026-02-21T14:00:00Z' },
    { id: 'art4', title: 'Tecnología: Nueva Inteligencia Artificial Revoluciona la Industria', excerpt: 'Investigadores presentan un modelo de IA capaz de resolver problemas complejos en tiempo récord.', category: 'Tecnología', author: 'Ana Martínez', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop', readTime: '6 min', status: 'published', featured: false, createdAt: '2026-02-21T10:00:00Z' },
    { id: 'art5', title: 'Crisis Financiera: Bolsa de Valores Registra Caída Significativa', excerpt: 'Los mercados internacionales reaccionan ante la incertidumbre geopolítica con una jornada marcada por la volatilidad.', category: 'Economía', author: 'Luis Fernández', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop', readTime: '5 min', status: 'published', featured: false, createdAt: '2026-02-20T16:00:00Z' },
    { id: 'art6', title: 'Elecciones: Partidos Anuncian Candidatos para Próximos Comicios', excerpt: 'Las principales fuerzas políticas definen sus estrategias de cara a las elecciones nacionales.', category: 'Política', author: 'Patricia López', image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&h=400&fit=crop', readTime: '7 min', status: 'published', featured: false, createdAt: '2026-02-20T10:00:00Z' },
    { id: 'art7', title: 'Cultura: Festival Internacional de Cine Anuncia Programación', excerpt: 'Más de 200 películas de 45 países serán exhibidas durante la próxima edición del reconocido festival cinematográfico.', category: 'Cultura', author: 'Diana Torres', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop', readTime: '4 min', status: 'published', featured: false, createdAt: '2026-02-19T12:00:00Z' },
    { id: 'art8', title: 'Deportes: Selección Nacional Prepara Estrategia para Eliminatorias', excerpt: 'El cuerpo técnico confirma la convocatoria de 26 jugadores para los partidos decisivos del próximo mes.', category: 'Deportes', author: 'Miguel Ángel Ruiz', image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop', readTime: '3 min', status: 'published', featured: false, createdAt: '2026-02-19T09:00:00Z' },
    { id: 'art9', title: 'Ciencia: Descubrimiento Astronómico Sorprende a la Comunidad Científica', excerpt: 'Telescopios espaciales captan señales inusuales provenientes de una galaxia a millones de años luz.', category: 'Tecnología', author: 'Sofía Navarro', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop', readTime: '6 min', status: 'published', featured: false, createdAt: '2026-02-18T15:00:00Z' },
    { id: 'art10', title: 'Cultura: Exposición de Arte Contemporáneo Llega a la Ciudad', excerpt: 'Artistas de renombre internacional presentarán sus obras más recientes en una muestra que promete cautivar al público.', category: 'Cultura', author: 'Valentina Méndez', image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=400&fit=crop', readTime: '4 min', status: 'published', featured: false, createdAt: '2026-02-17T11:00:00Z' },
];

export const newsArticles = {
    getAll: () => {
        const data = get(KEYS.ARTICLES);
        if (data.length === 0) {
            set(KEYS.ARTICLES, DEFAULT_ARTICLES);
            return DEFAULT_ARTICLES;
        }
        return data;
    },

    // Solo las publicadas y no archivadas
    getPublished: () => newsArticles.getAll()
        .filter((a) => a.status === 'published' && !a.archivedAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

    getFeatured: () => newsArticles.getAll()
        .find((a) => a.featured && a.status === 'published' && !a.archivedAt) || null,

    getByCategory: (cat) => newsArticles.getPublished().filter((a) => a.category === cat),

    getByAdId: (adId) => newsArticles.getAll().find((a) => a.adId === adId) || null,

    // Historial completo: activas + borradores, sin archivadas
    getHistory: () => newsArticles.getAll()
        .filter((a) => !a.archivedAt)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),

    // Papelera: solo las archivadas
    getArchived: () => newsArticles.getAll()
        .filter((a) => !!a.archivedAt)
        .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)),

    add: (data) => {
        const all = newsArticles.getAll();
        const entry = {
            id: generateId(),
            ...data,
            status: data.status || 'draft',
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            archivedAt: null,
        };
        all.push(entry);
        set(KEYS.ARTICLES, all);
        return entry;
    },

    update: (id, updates) => {
        const all = newsArticles.getAll();
        const prevArticle = all.find((a) => a.id === id);

        if (!prevArticle) return;

        let history = prevArticle.history || [];
        // Guardar historial si cambian datos visuales
        if (updates.visualLayout || updates.image || updates.title || updates.excerpt) {
            if (prevArticle.visualLayout || prevArticle.image) {
                const historyEntry = {
                    timestamp: Date.now(),
                    state: {
                        visualLayout: prevArticle.visualLayout,
                        image: prevArticle.image,
                        title: prevArticle.title,
                        excerpt: prevArticle.excerpt
                    }
                };
                history = [historyEntry, ...history].slice(0, 10);
            }
        }

        const updatedAll = all.map((a) =>
            a.id === id ? { ...a, ...updates, history, updatedAt: new Date().toISOString() } : a
        );
        set(KEYS.ARTICLES, updatedAll);
    },

    // Mover a papelera (no borra, solo archiva)
    archive: (id) => {
        const all = newsArticles.getAll().map((a) =>
            a.id === id ? { ...a, archivedAt: new Date().toISOString(), featured: false } : a
        );
        set(KEYS.ARTICLES, all);
    },

    // Restaurar desde papelera
    restore: (id) => {
        const all = newsArticles.getAll().map((a) =>
            a.id === id ? { ...a, archivedAt: null, status: 'draft' } : a
        );
        set(KEYS.ARTICLES, all);
    },

    // Borrar definitivamente (solo desde papelera)
    remove: (id) => {
        const all = newsArticles.getAll().filter((a) => a.id !== id);
        set(KEYS.ARTICLES, all);
    },

    removeByAdId: (adId) => {
        const all = newsArticles.getAll().filter((a) => a.adId !== adId);
        set(KEYS.ARTICLES, all);
    },

    setFeatured: (id) => {
        const all = newsArticles.getAll().map((a) => ({
            ...a,
            featured: a.id === id,
        }));
        set(KEYS.ARTICLES, all);
    },

    /** Crea un artículo borrador a partir de un anuncio aprobado */
    createFromAd: (ad) => {
        const sectionCategoryMap = {
            politics: 'Política',
            economy: 'Economía',
            sports: 'Deportes',
            technology: 'Tecnología',
            culture: 'Cultura',
        };

        // Verificar si ya existe un artículo vinculado a este anuncio
        const existing = newsArticles.getByAdId(ad.id);
        if (existing) {
            // Actualizar el existente
            newsArticles.update(existing.id, {
                title: ad.title,
                excerpt: ad.description,
                category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
                author: ad.publisherName || 'Anunciante',
                image: ad.photos?.[0] || existing.image,
                allPhotos: ad.photos || [],
            });
            return existing;
        }

        // Crear nuevo artículo vinculado
        return newsArticles.add({
            title: ad.title,
            excerpt: ad.description,
            category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
            author: ad.publisherName || 'Anunciante',
            image: ad.photos?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
            allPhotos: ad.photos || [],
            readTime: 'Patrocinado',
            status: 'draft',
            sponsored: true,
            adId: ad.id,
        });
    },

    /** Sincroniza datos de un anuncio editado al artículo vinculado */
    syncFromAd: (ad) => {
        const existing = newsArticles.getByAdId(ad.id);
        if (!existing) return;

        const sectionCategoryMap = {
            politics: 'Política',
            economy: 'Economía',
            sports: 'Deportes',
            technology: 'Tecnología',
            culture: 'Cultura',
        };

        newsArticles.update(existing.id, {
            title: ad.title,
            excerpt: ad.description,
            category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
            author: ad.publisherName || 'Anunciante',
            image: ad.photos?.[0] || existing.image,
            allPhotos: ad.photos || [],
        });
    },
};
