/**
 * siteConfig.js — Configuración visual del portal Radar360.
 * Permite editar desde el Admin el contenido de cada sección del portal.
 */

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

function getAll() {
    try {
        const stored = JSON.parse(localStorage.getItem(KEY));
        if (!stored) {
            localStorage.setItem(KEY, JSON.stringify(DEFAULT_CONFIG));
            return DEFAULT_CONFIG;
        }
        // Deep merge: stored over defaults to handle new keys gracefully
        return deepMerge(DEFAULT_CONFIG, stored);
    } catch {
        return DEFAULT_CONFIG;
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

export const siteConfig = {
    getAll,

    get: (section) => getAll()[section] || {},

    update: (section, updates) => {
        const current = getAll();
        current[section] = { ...current[section], ...updates };
        localStorage.setItem(KEY, JSON.stringify(current));
    },

    updateSection: (sectionName, updates) => {
        const current = getAll();
        const prevSectionState = current.sections.items[sectionName] || {};
        
        // Time Machine: Save previous state if there are visual layout updates
        let history = prevSectionState.history || [];
        if (updates.visualLayout || updates.bannerImage || updates.bgColor) {
            // Guardar solo si el estado actual tiene visualLayout (para no guardar vacíos inútiles)
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
                history = [historyEntry, ...history].slice(0, 10); // Keep last 10
            }
        }

        current.sections.items[sectionName] = {
            ...prevSectionState,
            ...updates,
            history
        };
        localStorage.setItem(KEY, JSON.stringify(current));
    },

    reorderSections: (newOrder) => {
        const current = getAll();
        current.sections.order = newOrder;
        localStorage.setItem(KEY, JSON.stringify(current));
    },

    reset: () => {
        localStorage.setItem(KEY, JSON.stringify(DEFAULT_CONFIG));
    },
};
