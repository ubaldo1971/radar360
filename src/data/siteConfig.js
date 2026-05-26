/**
 * siteConfig.js — Configuración visual del portal Radar360 persistida en Firestore.
 * Carga localmente (Offline-First) y sincroniza cambios de diseño en tiempo real.
 */
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const KEY = 'ei_site_config';

const DEFAULT_CONFIG = {
    topbar: {
        tickerText: '📡 Bienvenido a Radar360 — Tu visión total de la actualidad. Noticias en tiempo real.',
        bgColor: '#0f172a',
        textColor: '#f8fafc',
        link: '',
    },
    header: {
        siteName: 'Radar360',
        tagline: 'Tu visión total de la actualidad',
        logoText: 'R360',
        bgColor: '#ffffff',
    },
    sections: {
        order: ['Política', 'Economía', 'Deportes', 'Tecnología', 'Cultura'],
        items: {
            Política: {
                title: 'Política',
                subtitle: 'Las decisiones que marcan el rumbo del país.',
                bannerImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=300&fit=crop',
                bgColor: '#0f172a',
                textColor: '#ffffff',
                visible: true,
            },
            Economía: {
                title: 'Economía',
                subtitle: 'Mercados, finanzas y tendencias globales.',
                bannerImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=300&fit=crop',
                bgColor: '#1e293b',
                textColor: '#ffffff',
                visible: true,
            },
            Deportes: {
                title: 'Deportes',
                subtitle: 'Lo mejor del deporte nacional e internacional.',
                bannerImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=300&fit=crop',
                bgColor: '#0f172a',
                textColor: '#ffffff',
                visible: true,
            },
            Tecnología: {
                title: 'Tecnología',
                subtitle: 'Innovación, ciencia y el futuro digital.',
                bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=300&fit=crop',
                bgColor: '#1e293b',
                textColor: '#ffffff',
                visible: true,
            },
            Cultura: {
                title: 'Cultura',
                subtitle: 'Arte, entretenimiento y sociedad.',
                bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=300&fit=crop',
                bgColor: '#0f172a',
                textColor: '#ffffff',
                visible: true,
            },
        },
    },
    sidebar: {
        widgetTitle: 'Lo más leído',
        showPopular: true,
        showNewsletter: true,
        newsletterTitle: 'Suscríbete',
        newsletterText: 'Recibe las noticias más importantes directo en tu email.',
        bgColor: '#f8fafc',
    },
    footer: {
        description: 'Radar360 es tu fuente de información confiable. Noticias verificadas, análisis profundo y cobertura en tiempo real.',
        copyright: `© ${new Date().getFullYear()} Radar360. Todos los derechos reservados.`,
        socialLinks: {
            twitter: '',
            facebook: '',
            instagram: '',
            youtube: '',
        },
        links: [
            { label: 'Aviso de Privacidad', url: '#' },
            { label: 'Términos y Condiciones', url: '#' },
            { label: 'Contacto', url: '#' },
        ],
        bgColor: '#0f172a',
        textColor: '#94a3b8',
    },
};

/* ===== Cache Helpers ===== */
function getLocalCache(key, fallback) {
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
        console.error("Error saving site config cache: ", e);
    }
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key])
        ) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

/* ===== Memory State & Observer Pattern ===== */
let cachedConfig = getLocalCache(KEY, DEFAULT_CONFIG);
const observers = [];

function notifyObservers() {
    observers.forEach(cb => cb());
}

export function subscribeToConfigChanges(callback) {
    observers.push(callback);
    return () => {
        const index = observers.indexOf(callback);
        if (index !== -1) {
            observers.splice(index, 1);
        }
    };
}

export function useRadarConfig() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        return subscribeToConfigChanges(() => setTick(t => t + 1));
    }, []);
    return tick;
}

/* ===== Firestore Real-time Sync ===== */
const configDocRef = doc(db, 'site_config', 'global');

onSnapshot(configDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
        const remoteData = docSnapshot.data();
        const merged = deepMerge(DEFAULT_CONFIG, remoteData);
        cachedConfig = merged;
        setLocalCache(KEY, merged);
        notifyObservers();
    } else {
        console.log("🌱 La configuración global no existe en Firestore. Usando valores locales por defecto.");
        cachedConfig = DEFAULT_CONFIG;
        setLocalCache(KEY, DEFAULT_CONFIG);
        notifyObservers();
    }
}, (error) => {
    console.error("Error de suscripción en siteConfig global:", error);
});

/**
 * Realiza la siembra (seeding) de la configuración global en Firestore.
 * Debe ser invocada únicamente por un usuario autenticado (administrador).
 */
export async function seedSiteConfig() {
    try {
        console.log("🌱 Seteando configuración visual global en Firestore...");
        await setDoc(configDocRef, DEFAULT_CONFIG);
        console.log("✅ Configuración visual global inicializada en Firestore.");
    } catch (error) {
        console.error("Error durante la siembra de configuración global: ", error);
        throw error;
    }
}

/* ===== Exported API ===== */
export const siteConfig = {
    getAll: () => cachedConfig,

    get: (section) => cachedConfig[section] || {},

    update: async (section, updates) => {
        const current = { ...cachedConfig };
        current[section] = { ...current[section], ...updates };
        
        // Actualización optimista local
        cachedConfig = current;
        setLocalCache(KEY, current);
        notifyObservers();

        // Firestore
        await setDoc(configDocRef, current);
    },

    updateSection: async (sectionName, updates) => {
        const current = { ...cachedConfig };
        const prevSectionState = current.sections.items[sectionName] || {};
        
        // Time Machine: Save previous state if there are visual layout updates
        let history = prevSectionState.history || [];
        if (updates.visualLayout || updates.bannerImage || updates.bgColor) {
            if (prevSectionState.visualLayout || prevSectionState.bannerImage) {
                const historyEntry = {
                    timestamp: Date.now(),
                    state: {
                        visualLayout: prevSectionState.visualLayout,
                        bannerImage: prevSectionState.bannerImage,
                        bgColor: prevSectionState.bgColor,
                        title: prevSectionState.title,
                        subtitle: prevSectionState.subtitle,
                        textColor: prevSectionState.textColor
                    }
                };
                history = [historyEntry, ...history].slice(0, 10);
            }
        }

        current.sections.items[sectionName] = {
            ...prevSectionState,
            ...updates,
            history
        };

        // Actualización optimista local
        cachedConfig = current;
        setLocalCache(KEY, current);
        notifyObservers();

        // Firestore
        await setDoc(configDocRef, current);
    },

    reorderSections: async (newOrder) => {
        const current = { ...cachedConfig };
        current.sections.order = newOrder;

        // Actualización optimista local
        cachedConfig = current;
        setLocalCache(KEY, current);
        notifyObservers();

        // Firestore
        await setDoc(configDocRef, current);
    },

    reset: async () => {
        cachedConfig = DEFAULT_CONFIG;
        setLocalCache(KEY, DEFAULT_CONFIG);
        notifyObservers();
        await setDoc(configDocRef, DEFAULT_CONFIG);
    },
};
