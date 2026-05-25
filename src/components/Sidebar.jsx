/**
 * Sidebar — Trending topics, ad placeholder, social follow.
 */
import { trendingTopics, socialLinks } from '../data/mockData';
import CandidatePoll from './CandidatePoll';

/* Social icon SVGs */
const SocialIcon = ({ type }) => {
    const icons = {
        facebook: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        twitter: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        instagram: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
        linkedin: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    };
    return icons[type] || null;
};

export default function Sidebar() {
    return (
        <aside className="space-y-6">
            {/* ===== Simulador de Votaciones ===== */}
            <CandidatePoll />

            {/* ===== Trending Topics ===== */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Tendencias
                </h3>
                <ul className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                        <li key={index}>
                            <a
                                href="#"
                                className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm text-text-secondary hover:bg-surface hover:text-accent transition-all duration-200 group"
                            >
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-text-primary group-hover:bg-accent group-hover:text-white transition-all duration-200">
                                    {index + 1}
                                </span>
                                <span className="font-medium">{topic}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ===== Ad Placeholder ===== */}
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
                <div className="bg-gradient-to-br from-surface to-card h-52 flex items-center justify-center">
                    <div className="text-center text-white/50">
                        <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-xs uppercase tracking-widest font-semibold">Espacio Publicitario</p>
                        <p className="text-[10px] mt-1">300 × 250</p>
                    </div>
                </div>
            </div>

            {/* ===== Follow Us ===== */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-wide mb-4">
                    Síguenos
                </h3>
                <div className="flex items-center gap-3">
                    {socialLinks.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            aria-label={link.label}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-surface text-white hover:bg-accent transition-all duration-200 hover:scale-110"
                        >
                            <SocialIcon type={link.id} />
                        </a>
                    ))}
                </div>
            </div>
        </aside>
    );
}
