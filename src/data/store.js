/**
 * store.js — Capa de almacenamiento en tiempo real con Firebase Firestore.
 * Sincroniza localmente (localStorage) para permitir una carga Offline-First
 * y notifica en tiempo real a los componentes usando el hook useRadarStore.
 */
import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    collection, 
    doc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    writeBatch, 
    getDocs,
    query,
    where
} from 'firebase/firestore';

const KEYS = {
    SUBSCRIPTIONS: 'ei_subscriptions',
    ADS: 'ei_ads',
    PRICING: 'ei_pricing',
    SECTIONS: 'ei_ad_sections',
    ARTICLES: 'ei_articles',
};

// Valores por defecto
const DEFAULT_PRICING = [
    { id: 'p1', name: '1 Semana', days: 7, price: 299, currency: 'MXN', active: true },
    { id: 'p2', name: '2 Semanas', days: 14, price: 499, currency: 'MXN', active: true },
    { id: 'p3', name: '1 Mes', days: 30, price: 899, currency: 'MXN', active: true },
    { id: 'p4', name: '3 Meses', days: 90, price: 2299, currency: 'MXN', active: true },
];

const DEFAULT_SECTIONS = [
    { id: 's1', name: '⭐ Hero (Noticia Principal)', key: 'hero', multiplier: 5, description: 'Posición principal del sitio — máxima visibilidad', active: true },
    { id: 's2', name: 'Política', key: 'politics', multiplier: 1.5, description: 'Sección de noticias políticas', active: true },
    { id: 's3', name: 'Economía', key: 'economy', multiplier: 1.5, description: 'Sección de noticias económicas', active: true },
    { id: 's4', name: 'Deportes', key: 'sports', multiplier: 1.2, description: 'Sección deportiva', active: true },
    { id: 's5', name: 'Tecnología', key: 'technology', multiplier: 1.3, description: 'Sección de tecnología', active: true },
    { id: 's6', name: 'Cultura', key: 'culture', multiplier: 1.0, description: 'Sección de cultura y entretenimiento', active: true },
    { id: 's7', name: 'Sidebar (Barra lateral)', key: 'sidebar', multiplier: 0.8, description: 'Banner en la barra lateral derecha', active: true },
];

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

/* ===== Helpers de Caché Local (Offline-First) ===== */
function getLocalCache(key, fallback = []) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
}

function setLocalCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Error al actualizar local cache: ", e);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ===== Estado en Memoria y Patrón Observer ===== */
let cachedStore = {
    subscriptions: getLocalCache(KEYS.SUBSCRIPTIONS, []),
    ads: getLocalCache(KEYS.ADS, []),
    pricing: getLocalCache(KEYS.PRICING, []),
    adSections: getLocalCache(KEYS.SECTIONS, []),
    articles: getLocalCache(KEYS.ARTICLES, []),
};

const observers = [];

function notifyObservers() {
    observers.forEach(cb => cb());
}

/**
 * Suscribe un callback de React a cambios globales del store.
 */
export function subscribeToStoreChanges(callback) {
    observers.push(callback);
    return () => {
        const index = observers.indexOf(callback);
        if (index !== -1) {
            observers.splice(index, 1);
        }
    };
}

/**
 * Hook personalizado para forzar actualizaciones automáticas de UI en tiempo real.
 */
export function useRadarStore() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        return subscribeToStoreChanges(() => setTick(t => t + 1));
    }, []);
    return tick;
}

/* ===== Sincronización con Firestore ===== */

// Variable para controlar si ya realizamos la siembra inicial
let isSeeding = false;

/**
 * Realiza la siembra (seeding) de datos iniciales en Firestore.
 * Debe ser invocada únicamente por un usuario autenticado (administrador)
 * para cumplir con las reglas de seguridad.
 */
export async function seedDatabase() {
    if (isSeeding) return;
    isSeeding = true;
    try {
        console.log("🔥 Verificando si Firestore está vacío para siembra de datos...");
        const querySnapshot = await getDocs(collection(db, 'articles'));
        if (querySnapshot.empty) {
            console.log("🔥 Firestore está vacío. Iniciando siembra (seeding)...");
            const batch = writeBatch(db);

            // Subir artículos por defecto
            DEFAULT_ARTICLES.forEach(art => {
                const docRef = doc(collection(db, 'articles'), art.id);
                batch.set(docRef, { ...art, updatedAt: new Date().toISOString() });
            });

            // Subir tarifas por defecto
            DEFAULT_PRICING.forEach(p => {
                const docRef = doc(collection(db, 'pricing'), p.id);
                batch.set(docRef, p);
            });

            // Subir secciones por defecto
            DEFAULT_SECTIONS.forEach(s => {
                const docRef = doc(collection(db, 'ad_sections'), s.id);
                batch.set(docRef, s);
            });

            await batch.commit();
            console.log("✅ Siembra de datos iniciales en Firestore completada exitosamente.");
        } else {
            console.log("✅ Firestore ya contiene artículos. No se requiere siembra.");
        }
    } catch (error) {
        console.error("Error durante la siembra de datos en Firestore: ", error);
        throw error;
    } finally {
        isSeeding = false;
    }
}

// Listeners activos para poder cancelarlos y re-crearlos
let subscriptionsUnsubscribe = null;
let adsUnsubscribe = null;
let pricingUnsubscribe = null;
let adSectionsUnsubscribe = null;
let articlesUnsubscribe = null;

// 1. Suscripciones públicas inmediatas (siempre accesibles)
function startPublicSubscriptions() {
    // Pricing
    if (!pricingUnsubscribe) {
        pricingUnsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            cachedStore.pricing = items;
            setLocalCache(KEYS.PRICING, items);
            notifyObservers();
        }, (error) => {
            console.error("Error de suscripción en pricing:", error);
        });
    }

    // Ad Sections
    if (!adSectionsUnsubscribe) {
        adSectionsUnsubscribe = onSnapshot(collection(db, 'ad_sections'), (snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            cachedStore.adSections = items;
            setLocalCache(KEYS.SECTIONS, items);
            notifyObservers();
        }, (error) => {
            console.error("Error de suscripción en ad_sections:", error);
        });
    }

    // Articles
    if (!articlesUnsubscribe) {
        articlesUnsubscribe = onSnapshot(collection(db, 'articles'), (snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            cachedStore.articles = items;
            setLocalCache(KEYS.ARTICLES, items);
            notifyObservers();
        }, (error) => {
            console.error("Error de suscripción en articles:", error);
        });
    }
}

// 2. Suscripciones dinámicas según el estado de autenticación (Admin vs Público)
onAuthStateChanged(auth, (user) => {
    // Limpiar listeners dinámicos anteriores si existen
    if (subscriptionsUnsubscribe) {
        subscriptionsUnsubscribe();
        subscriptionsUnsubscribe = null;
    }
    if (adsUnsubscribe) {
        adsUnsubscribe();
        adsUnsubscribe = null;
    }

    if (user) {
        console.log("🔒 Administrador autenticado en store.js. Iniciando suscripciones completas...");
        
        // Suscripción completa a subscriptions
        subscriptionsUnsubscribe = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            cachedStore.subscriptions = items;
            setLocalCache(KEYS.SUBSCRIPTIONS, items);
            notifyObservers();
        }, (error) => {
            console.error("Error de suscripción en subscriptions (Admin):", error);
        });

        // Suscripción completa a ads
        adsUnsubscribe = onSnapshot(collection(db, 'ads'), (snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            cachedStore.ads = items;
            setLocalCache(KEYS.ADS, items);
            notifyObservers();
        }, (error) => {
            console.error("Error de suscripción en ads (Admin):", error);
        });

    } else {
        console.log("🌐 Usuario público/no autenticado en store.js. Iniciando suscripciones restringidas...");

        // Usuario público no puede leer 'subscriptions', así que vaciamos el caché
        cachedStore.subscriptions = [];
        setLocalCache(KEYS.SUBSCRIPTIONS, []);
        notifyObservers();

        // Usuario público solo puede leer anuncios 'activos'. Hacemos una consulta filtrada
        const activeAdsQuery = query(collection(db, 'ads'), where('status', '==', 'active'));
        adsUnsubscribe = onSnapshot(activeAdsQuery, (snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            cachedStore.ads = items;
            setLocalCache(KEYS.ADS, items);
            notifyObservers();
        }, (error) => {
            console.error("Error de suscripción en ads (Público):", error);
        });
    }
});

// Iniciar suscripciones públicas al cargar el módulo
startPublicSubscriptions();

/* ===== ENTIDAD: Suscripciones ===== */
export const subscriptions = {
    getAll: () => cachedStore.subscriptions,

    add: async (data) => {
        const id = generateId();
        const entry = {
            id,
            ...data,
            status: 'active',
            createdAt: new Date().toISOString(),
        };

        // Actualización optimista local
        cachedStore.subscriptions = [...cachedStore.subscriptions, entry];
        setLocalCache(KEYS.SUBSCRIPTIONS, cachedStore.subscriptions);
        notifyObservers();

        // Guardar en Firestore
        await setDoc(doc(db, 'subscriptions', id), entry);
        return entry;
    },

    remove: async (id) => {
        // Actualización optimista local
        cachedStore.subscriptions = cachedStore.subscriptions.filter(s => s.id !== id);
        setLocalCache(KEYS.SUBSCRIPTIONS, cachedStore.subscriptions);
        notifyObservers();

        // Borrar en Firestore
        await deleteDoc(doc(db, 'subscriptions', id));
    },

    update: async (id, updates) => {
        // Actualización optimista local
        cachedStore.subscriptions = cachedStore.subscriptions.map(s => 
            s.id === id ? { ...s, ...updates } : s
        );
        setLocalCache(KEYS.SUBSCRIPTIONS, cachedStore.subscriptions);
        notifyObservers();

        // Guardar en Firestore
        await updateDoc(doc(db, 'subscriptions', id), updates);
    },
};

/* ===== ENTIDAD: Anuncios ===== */
export const ads = {
    getAll: () => cachedStore.ads,

    getActive: () => {
        ads.refreshExpirations(); // Revisar si alguno expiró
        return cachedStore.ads.filter((a) => a.status === 'active');
    },

    /** Busca anuncios que hayan pasado su fecha de fin y los expira */
    refreshExpirations: async () => {
        const all = cachedStore.ads;
        const now = new Date();

        all.forEach(async (ad) => {
            if (ad.status === 'active' && ad.endDate) {
                const end = new Date(ad.endDate);
                if (now > end) {
                    // Actualizar en Firestore
                    await updateDoc(doc(db, 'ads', ad.id), { status: 'expired' });
                    
                    // Pausar también los artículos vinculados en Redacción
                    const linkedArticle = newsArticles.getByAdId(ad.id);
                    if (linkedArticle) {
                        await updateDoc(doc(db, 'articles', linkedArticle.id), { status: 'draft' });
                    }
                }
            }
        });
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
        return cachedStore.ads
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

    add: async (data) => {
        const id = generateId();
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);
        
        if (data.planDays) {
            end.setDate(end.getDate() + data.planDays);
        } else {
            end.setDate(end.getDate() + 7);
        }

        const entry = {
            id,
            ...data,
            status: 'pending',
            createdAt: now.toISOString(),
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };

        // Actualización optimista local
        cachedStore.ads = [...cachedStore.ads, entry];
        setLocalCache(KEYS.ADS, cachedStore.ads);
        notifyObservers();

        // Firestore
        await setDoc(doc(db, 'ads', id), entry);
        return entry;
    },

    renew: async (id, newPlanDays, newTotalPrice) => {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + newPlanDays);

        const updates = {
            status: 'pending', // Vuelve a revisión tras pagar
            startDate: now.toISOString(),
            endDate: end.toISOString(),
            planDays: newPlanDays,
            totalPrice: newTotalPrice
        };

        // Actualización optimista local
        cachedStore.ads = cachedStore.ads.map(a => 
            a.id === id ? { ...a, ...updates } : a
        );
        setLocalCache(KEYS.ADS, cachedStore.ads);
        notifyObservers();

        // Firestore
        await updateDoc(doc(db, 'ads', id), updates);
    },

    remove: async (id) => {
        // Actualización optimista local
        cachedStore.ads = cachedStore.ads.filter(a => a.id !== id);
        setLocalCache(KEYS.ADS, cachedStore.ads);
        notifyObservers();

        // Firestore
        await deleteDoc(doc(db, 'ads', id));
    },

    update: async (id, updates) => {
        // Actualización optimista local
        cachedStore.ads = cachedStore.ads.map(a => 
            a.id === id ? { ...a, ...updates } : a
        );
        setLocalCache(KEYS.ADS, cachedStore.ads);
        notifyObservers();

        // Firestore
        await updateDoc(doc(db, 'ads', id), updates);
    },
};

/* ===== ENTIDAD: Precios ===== */
export const pricing = {
    getAll: () => cachedStore.pricing.length > 0 ? cachedStore.pricing : DEFAULT_PRICING,

    update: async (id, updates) => {
        // Actualización optimista local
        cachedStore.pricing = pricing.getAll().map(p => 
            p.id === id ? { ...p, ...updates } : p
        );
        setLocalCache(KEYS.PRICING, cachedStore.pricing);
        notifyObservers();

        // Firestore
        await setDoc(doc(db, 'pricing', id), pricing.getAll().find(p => p.id === id));
    },

    add: async (data) => {
        const id = generateId();
        const entry = { id, ...data, active: true };

        // Actualización optimista local
        cachedStore.pricing = [...pricing.getAll(), entry];
        setLocalCache(KEYS.PRICING, cachedStore.pricing);
        notifyObservers();

        // Firestore
        await setDoc(doc(db, 'pricing', id), entry);
        return entry;
    },

    remove: async (id) => {
        // Actualización optimista local
        cachedStore.pricing = pricing.getAll().filter(p => p.id !== id);
        setLocalCache(KEYS.PRICING, cachedStore.pricing);
        notifyObservers();

        // Firestore
        await deleteDoc(doc(db, 'pricing', id));
    },
};

/* ===== ENTIDAD: Secciones de Anuncios ===== */
export const adSections = {
    getAll: () => cachedStore.adSections.length > 0 ? cachedStore.adSections : DEFAULT_SECTIONS,

    update: async (id, updates) => {
        // Actualización optimista local
        cachedStore.adSections = adSections.getAll().map(s => 
            s.id === id ? { ...s, ...updates } : s
        );
        setLocalCache(KEYS.SECTIONS, cachedStore.adSections);
        notifyObservers();

        // Firestore
        await setDoc(doc(db, 'ad_sections', id), adSections.getAll().find(s => s.id === id));
    },

    add: async (data) => {
        const id = generateId();
        const entry = { id, ...data, active: true };

        // Actualización optimista local
        cachedStore.adSections = [...adSections.getAll(), entry];
        setLocalCache(KEYS.SECTIONS, cachedStore.adSections);
        notifyObservers();

        // Firestore
        await setDoc(doc(db, 'ad_sections', id), entry);
        return entry;
    },

    remove: async (id) => {
        // Actualización optimista local
        cachedStore.adSections = adSections.getAll().filter(s => s.id !== id);
        setLocalCache(KEYS.SECTIONS, cachedStore.adSections);
        notifyObservers();

        // Firestore
        await deleteDoc(doc(db, 'ad_sections', id));
    },
};

/* ===== ENTIDAD: Artículos / Noticias ===== */
export const newsArticles = {
    getAll: () => cachedStore.articles,

    getPublished: () => cachedStore.articles
        .filter((a) => a.status === 'published' && !a.archivedAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

    getFeatured: () => cachedStore.articles
        .find((a) => a.featured && a.status === 'published' && !a.archivedAt) || null,

    getByCategory: (cat) => newsArticles.getPublished().filter((a) => a.category === cat),

    getByAdId: (adId) => cachedStore.articles.find((a) => a.adId === adId) || null,

    getHistory: () => cachedStore.articles
        .filter((a) => !a.archivedAt)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),

    getArchived: () => cachedStore.articles
        .filter((a) => !!a.archivedAt)
        .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)),

    add: async (data) => {
        const id = data.id || generateId();
        const entry = {
            id,
            ...data,
            status: data.status || 'draft',
            featured: false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            archivedAt: null,
        };

        // Local
        cachedStore.articles = [...cachedStore.articles, entry];
        setLocalCache(KEYS.ARTICLES, cachedStore.articles);
        notifyObservers();

        // Firestore
        await setDoc(doc(db, 'articles', id), entry);
        return entry;
    },

    update: async (id, updates) => {
        const prevArticle = cachedStore.articles.find((a) => a.id === id);
        if (!prevArticle) return;

        let history = prevArticle.history || [];
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

        const fullUpdates = {
            ...updates,
            history,
            updatedAt: new Date().toISOString()
        };

        // Local
        cachedStore.articles = cachedStore.articles.map(a => 
            a.id === id ? { ...a, ...fullUpdates } : a
        );
        setLocalCache(KEYS.ARTICLES, cachedStore.articles);
        notifyObservers();

        // Firestore
        await updateDoc(doc(db, 'articles', id), fullUpdates);
    },

    archive: async (id) => {
        await newsArticles.update(id, { 
            archivedAt: new Date().toISOString(), 
            featured: false 
        });
    },

    restore: async (id) => {
        await newsArticles.update(id, { 
            archivedAt: null, 
            status: 'draft' 
        });
    },

    remove: async (id) => {
        // Local
        cachedStore.articles = cachedStore.articles.filter(a => a.id !== id);
        setLocalCache(KEYS.ARTICLES, cachedStore.articles);
        notifyObservers();

        // Firestore
        await deleteDoc(doc(db, 'articles', id));
    },

    removeByAdId: async (adId) => {
        const adArticle = newsArticles.getByAdId(adId);
        if (adArticle) {
            await newsArticles.remove(adArticle.id);
        }
    },

    setFeatured: async (id) => {
        // Hacer un batch update o simplemente secuencial en Firestore
        const promises = cachedStore.articles.map(async (art) => {
            const shouldBeFeatured = art.id === id;
            if (art.featured !== shouldBeFeatured) {
                await updateDoc(doc(db, 'articles', art.id), { featured: shouldBeFeatured });
            }
        });
        await Promise.all(promises);
    },

    createFromAd: async (ad) => {
        const sectionCategoryMap = {
            politics: 'Política',
            economy: 'Economía',
            sports: 'Deportes',
            technology: 'Tecnología',
            culture: 'Cultura',
        };

        const existing = newsArticles.getByAdId(ad.id);
        if (existing) {
            await newsArticles.update(existing.id, {
                title: ad.title,
                excerpt: ad.description,
                category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
                author: ad.publisherName || 'Anunciante',
                image: ad.photos?.[0] || existing.image,
                allPhotos: ad.photos || [],
            });
            return existing;
        }

        return await newsArticles.add({
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

    syncFromAd: async (ad) => {
        const existing = newsArticles.getByAdId(ad.id);
        if (!existing) return;

        const sectionCategoryMap = {
            politics: 'Política',
            economy: 'Economía',
            sports: 'Deportes',
            technology: 'Tecnología',
            culture: 'Cultura',
        };

        await newsArticles.update(existing.id, {
            title: ad.title,
            excerpt: ad.description,
            category: sectionCategoryMap[ad.sectionKey] || ad.section || 'General',
            author: ad.publisherName || 'Anunciante',
            image: ad.photos?.[0] || existing.image,
            allPhotos: ad.photos || [],
        });
    },
};
