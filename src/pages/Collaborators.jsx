import { useState } from 'react';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

// Mocks de colaboradores (pueden venir de store.js en un futuro)
const COLLABORATORS = [
    {
        id: 1,
        name: 'Roberto Véliz',
        role: 'Periodista de Investigación',
        category: 'Política',
        image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop',
        bio: 'Especialista en temas de corrupción gubernamental y transparencia. Ganador del Premio Nacional de Periodismo en 2024.',
        social: {
            twitter: 'https://twitter.com/',
            linkedin: 'https://linkedin.com/'
        }
    },
    {
        id: 2,
        name: 'Martha Higareda',
        role: 'Columnista',
        category: 'Economía',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        bio: 'Analista económica con más de 15 años de experiencia. Sus columnas semanales desglosan el impacto de los mercados globales.',
        social: {
            twitter: 'https://twitter.com/',
        }
    },
    {
        id: 3,
        name: 'Carlos Yépez',
        role: 'Reportero Gráfico',
        category: 'Sociedad',
        image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop',
        bio: 'La lente que capta la realidad de las calles. Ha cubierto los eventos más importantes de la ciudad en la última década.',
        social: {
            instagram: 'https://instagram.com/'
        }
    },
    {
        id: 4,
        name: 'Daniela Soto',
        role: 'Entrevistadora',
        category: 'Entrevistas',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        bio: 'Su capacidad para sacar la verdad de figuras públicas en La Silla Roja la ha posicionado como una de las mejores del país.',
        social: {
            twitter: 'https://twitter.com/',
            instagram: 'https://instagram.com/'
        }
    },
    {
        id: 5,
        name: 'Andrés García',
        role: 'Analista Deportivo',
        category: 'Deportes',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Ex-director técnico que ahora vierte toda su experiencia en sus análisis tácticos de la liga nacional.',
        social: {
            facebook: 'https://facebook.com/'
        }
    },
    {
        id: 6,
        name: 'Laura Méndez',
        role: 'Periodista Cultural',
        category: 'Cultura',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        bio: 'Cubre festivales, estrenos y el desarrollo del arte contemporáneo regional.',
        social: {
            twitter: 'https://twitter.com/',
            linkedin: 'https://linkedin.com/'
        }
    }
];

export default function Collaborators() {
    const [filter, setFilter] = useState('Todos');
    
    // Extraer categorías únicas
    const categories = ['Todos', ...new Set(COLLABORATORS.map(c => c.category))];
    
    // Filtrar
    const filtered = filter === 'Todos' ? COLLABORATORS : COLLABORATORS.filter(c => c.category === filter);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar />
            <Header />
            <Navigation />

            {/* ── Hero de Colaboradores ── */}
            <div className="bg-navy py-16 md:py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl opacity-50" />
                
                <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 relative z-10 text-center">
                    <span className="px-4 py-1.5 bg-accent/20 text-accent text-sm font-bold uppercase tracking-wider rounded-full border border-accent/20 mb-6 inline-block">Nuestro Equipo</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        Las Plumas de <span className="text-accent">Radar360</span>
                    </h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                        Conoce a los periodistas, analistas y profesionales que día a día investigan y reportan la verdad para mantenerte informado de manera imparcial y profunda.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16">
                
                {/* ── Filtros ── */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-14">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm
                                ${filter === cat 
                                    ? 'bg-navy text-white shadow-md' 
                                    : 'bg-card text-text-secondary hover:text-text-primary hover:border-border border border-transparent'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── Grid de Tarjetas ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {filtered.map(collab => (
                        <div key={collab.id} className="bg-card rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border flex flex-col items-center text-center group">
                            
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-card shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-500">
                                    <img src={collab.image} alt={collab.name} className="w-full h-full object-cover" />
                                </div>
                                {/* Circulo decorativo de fondo */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-tr from-accent/20 to-orange-500/20 rounded-full blur-md -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            
                            <span className="text-[10px] uppercase font-black tracking-widest text-accent mb-2 px-3 py-1 bg-accent/10 rounded-full">{collab.category}</span>
                            <h3 className="text-xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{collab.name}</h3>
                            <p className="text-sm font-semibold text-text-secondary mb-4">{collab.role}</p>
                            
                            <p className="text-sm text-text-muted leading-relaxed mb-8 flex-1">"{collab.bio}"</p>
                            
                            <div className="flex items-center gap-3 w-full justify-center pt-6 border-t border-border">
                                {collab.social.twitter && (
                                    <a href={collab.social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted hover:bg-black hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                )}
                                {collab.social.linkedin && (
                                    <a href={collab.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted hover:bg-blue-700 hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </a>
                                )}
                                {collab.social.instagram && (
                                    <a href={collab.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted hover:bg-pink-600 hover:text-white transition-colors">
                                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    </a>
                                )}
                                {collab.social.facebook && (
                                    <a href={collab.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted hover:bg-blue-600 hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
