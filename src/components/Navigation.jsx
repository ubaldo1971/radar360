/**
 * Navigation — Menú horizontal de categorías con scroll suave a secciones.
 */
import { useState } from 'react';
import { categories } from '../data/mockData';

export default function Navigation() {
    const [active, setActive] = useState('home');
    const [mobileOpen, setMobileOpen] = useState(false);

    /**
     * Maneja el click en una categoría:
     * - "home" → scroll al top
     * - Otras → scroll suave a la sección correspondiente
     */
    const handleNavClick = (catId) => {
        setActive(catId);

        if (catId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const section = document.getElementById(`section-${catId}`);
        if (section) {
            // Offset para no quedar detrás del nav sticky
            const navHeight = 60;
            const top = section.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                {/* Desktop menu */}
                <ul className="hidden md:flex items-center gap-1">
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <button
                                onClick={() => handleNavClick(cat.id)}
                                className={`
                  relative px-5 py-4 text-sm font-semibold uppercase tracking-wide
                  transition-all duration-300 border-b-[3px] group
                  ${active === cat.id
                                        ? 'text-accent border-accent'
                                        : 'text-text-secondary border-transparent hover:text-text-primary'
                                    }
                `}
                            >
                                {/* Hover glow background */}
                                <span className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 rounded-t-xl transition-all duration-300" />

                                {/* Animated underline on hover */}
                                <span
                                    className={`
                    absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full
                    transition-all duration-300 ease-out
                    ${active === cat.id
                                            ? 'w-full bg-accent'
                                            : 'w-0 bg-cardy group-hover:w-full'
                                        }
                  `}
                                />

                                {/* Label */}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <NavIcon catId={cat.id} isActive={active === cat.id} />
                                    {cat.label}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Mobile hamburger */}
                <div className="md:hidden flex items-center justify-between py-3">
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wide">Menú</span>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg hover:bg-surface transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile dropdown */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-[500px] pb-4' : 'max-h-0'
                        }`}
                >
                    <ul className="flex flex-col gap-1">
                        {categories.map((cat) => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => {
                                        handleNavClick(cat.id);
                                        setMobileOpen(false);
                                    }}
                                    className={`
                    w-full text-left px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide
                    transition-all duration-300 flex items-center gap-2
                    ${active === cat.id
                                            ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]'
                                            : 'text-text-secondary hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent hover:text-text-primary hover:pl-6'
                                        }
                  `}
                                >
                                    <NavIcon catId={cat.id} isActive={active === cat.id} />
                                    {cat.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

/**
 * Pequeños iconos SVG para cada categoría.
 * Agrega contexto visual al menú.
 */
function NavIcon({ catId, isActive }) {
    const className = `w-4 h-4 transition-all duration-300 ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'
        }`;

    const icons = {
        home: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
        ),
        politics: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        economy: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        sports: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        technology: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        culture: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m0 2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V6a2 2 0 012-2zm0 10v2m0-2a2 2 0 01-2-2V9a2 2 0 012-2 2 2 0 012 2v3a2 2 0 01-2 2zm10-10v2m0-2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V6a2 2 0 012-2zm0 10v2m0-2a2 2 0 01-2-2V9a2 2 0 012-2 2 2 0 012 2v3a2 2 0 01-2 2z" />
            </svg>
        ),
    };

    return icons[catId] || null;
}
