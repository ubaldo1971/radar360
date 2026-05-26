/**
 * Admin — Panel de administración premium del portal.
 * Tabs: Dashboard, Suscripciones, Anuncios, Precios, Secciones.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptions, ads, pricing, adSections, newsArticles, useRadarStore, seedDatabase } from '../data/store';
import { siteConfig, useRadarConfig } from '../data/siteConfig';
import UnifiedVisualEditor from '../components/UnifiedVisualEditor';
import { auth } from '../data/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export default function Admin() {
    useRadarStore();
    useRadarConfig();
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [pwError, setPwError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = () => setRefreshKey((k) => k + 1);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
                setPwError('');
            } else {
                setAuthenticated(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Sembrar la base de datos de manera segura solo cuando el administrador inicie sesión
    useEffect(() => {
        if (authenticated) {
            seedDatabase().catch(err => {
                console.error("Error al sembrar base de datos en Firestore:", err);
            });
        }
    }, [authenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPwError('');
        try {
            await signInWithEmailAndPassword(auth, 'admin@radar360.com', password);
        } catch (error) {
            console.error("Login error:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setPwError('Contraseña incorrecta');
            } else {
                setPwError('Error al iniciar sesión: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ══ LOGIN SCREEN ══ */
    if (!authenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-900 flex items-center justify-center p-4">
                {/* Decorative blobs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

                <form onSubmit={handleLogin} className="relative bg-card/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent/25 rotate-3 hover:rotate-0 transition-transform">
                            <span className="text-xl font-black text-white">EI</span>
                        </div>
                        <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                            Panel Admin
                        </h2>
                        <p className="text-white/40 text-sm mt-1">Radar360 — Gestión</p>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                className={`w-full bg-card/5 text-white pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all placeholder:text-white/20 focus:bg-card/10 focus:ring-2 focus:ring-accent/30 ${pwError ? 'border-red-400/50' : 'border-white/10 focus:border-accent/50'}`}
                            />
                        </div>
                        {pwError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {pwError}
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full mt-5 py-3.5 bg-gradient-to-r from-accent to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50">
                        {isLoading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="w-full mt-3 text-white/30 text-sm hover:text-white/60 transition-colors">
                        ← Volver al sitio
                    </button>
                </form>
            </div>
        );
    }

    const tabs = [
        {
            id: 'dashboard', label: 'Dashboard', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: 'subscriptions', label: 'Suscripciones', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'ads', label: 'Anuncios', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            )
        },
        {
            id: 'pricing', label: 'Precios', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'sections', label: 'Secciones', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            id: 'articles', label: 'Redacción', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            id: 'livechannel', label: 'Canal en Vivo', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'portaldesign', label: '🎨 Diseño del Portal', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-surface">
            {/* ══ SIDEBAR + TOP BAR LAYOUT ══ */}
            <div className="flex">
                {/* ── Sidebar ── */}
                <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 via-navy to-slate-900 border-r border-white/5">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                                <span className="text-sm font-black text-white">EI</span>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-sm">Radar360</h1>
                                <p className="text-white/30 text-[11px]">Panel Admin</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 p-4 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-card/10 text-white shadow-lg shadow-white/5'
                                    : 'text-white/40 hover:text-white/70 hover:bg-card/5'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Bottom actions */}
                    <div className="p-4 border-t border-white/5 space-y-2">
                        <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-4 py-2 text-white/30 hover:text-white/60 text-xs transition-colors rounded-lg hover:bg-card/5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Ver sitio
                        </button>
                        <button onClick={() => signOut(auth)} className="w-full flex items-center gap-2 px-4 py-2 text-red-400/50 hover:text-red-400 text-xs transition-colors rounded-lg hover:bg-red-500/5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <div className="flex-1 min-h-screen">
                    {/* Mobile top bar */}
                    <div className="lg:hidden bg-gradient-to-r from-slate-900 to-navy text-white">
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-accent to-orange-500 rounded-lg flex items-center justify-center text-xs font-black">EI</div>
                                <span className="font-bold text-sm">Admin</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigate('/')} className="text-white/40 hover:text-white text-xs">Ver sitio</button>
                                <button onClick={() => signOut(auth)} className="text-red-400/60 hover:text-red-400 text-xs">Salir</button>
                            </div>
                        </div>
                        {/* Mobile tabs */}
                        <div className="px-2 pb-2 flex gap-1 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-card/15 text-white'
                                        : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Page content */}
                    <div className="p-6 lg:p-8">
                        {activeTab === 'dashboard' && <DashboardPanel key={refreshKey} setActiveTab={setActiveTab} />}
                        {activeTab === 'subscriptions' && <SubscriptionsPanel key={refreshKey} onRefresh={refresh} />}
                        {activeTab === 'ads' && <AdsPanel key={refreshKey} onRefresh={refresh} />}
                        {activeTab === 'pricing' && <PricingPanel key={refreshKey} onRefresh={refresh} />}
                        {activeTab === 'sections' && <SectionsPanel key={refreshKey} onRefresh={refresh} />}
                        {activeTab === 'articles' && <ArticlesPanel key={refreshKey} onRefresh={refresh} />}
                        {activeTab === 'livechannel' && <LiveChannelPanel />}
                        {activeTab === 'portaldesign' && <PortalDesignPanel key={refreshKey} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Dashboard — Vista general con métricas
   ═══════════════════════════════════════════════ */
function DashboardPanel({ setActiveTab }) {
    const subs = subscriptions.getAll();
    const allAds = ads.getAll();
    const plans = pricing.getAll();
    const sections = adSections.getAll();

    const activeAds = allAds.filter((a) => a.status === 'active');
    const pendingAds = allAds.filter((a) => a.status === 'pending');
    const totalRevenue = allAds.reduce((sum, a) => sum + (a.totalPrice || a.planPrice || 0), 0);

    const stats = [
        {
            label: 'Suscriptores',
            value: subs.length,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20',
            tab: 'subscriptions',
        },
        {
            label: 'Anuncios Activos',
            value: activeAds.length,
            subtitle: `${pendingAds.length} pendientes`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
            color: 'from-emerald-500 to-green-500',
            shadowColor: 'shadow-emerald-500/20',
            tab: 'ads',
        },
        {
            label: 'Ingresos Totales',
            value: `$${totalRevenue.toLocaleString()}`,
            subtitle: `${allAds.length} anuncios total`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/20',
            tab: 'pricing',
        },
        {
            label: 'Secciones',
            value: sections.filter((s) => s.active).length,
            subtitle: `de ${sections.length} total`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: 'from-violet-500 to-purple-500',
            shadowColor: 'shadow-violet-500/20',
            tab: 'sections',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    Dashboard
                </h1>
                <p className="text-text-muted text-sm mt-1">Resumen general del portal Radar360</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {stats.map((stat) => (
                    <button
                        key={stat.label}
                        onClick={() => setActiveTab(stat.tab)}
                        className={`group relative bg-card rounded-2xl p-5 border border-border hover:border-border shadow-sm hover:shadow-lg ${stat.shadowColor} transition-all duration-300 text-left hover:scale-[1.02]`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-text-primary mt-1">{stat.value}</p>
                                {stat.subtitle && <p className="text-xs text-text-muted mt-1">{stat.subtitle}</p>}
                            </div>
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent subs */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-text-primary text-sm">Últimas Suscripciones</h3>
                        <button onClick={() => setActiveTab('subscriptions')} className="text-accent text-xs font-semibold hover:underline">Ver todo →</button>
                    </div>
                    {subs.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 bg-surface rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-text-muted text-sm">Sin suscripciones aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {subs.slice(-5).reverse().map((sub) => (
                                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface/70 hover:bg-surface transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {(sub.fullName || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-text-primary truncate">{sub.fullName}</p>
                                        <p className="text-xs text-text-muted truncate">{sub.email}</p>
                                    </div>
                                    <span className="text-[10px] text-text-muted">{new Date(sub.createdAt).toLocaleDateString('es-MX')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent ads */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-text-primary text-sm">Últimos Anuncios</h3>
                        <button onClick={() => setActiveTab('ads')} className="text-accent text-xs font-semibold hover:underline">Ver todo →</button>
                    </div>
                    {allAds.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 bg-surface rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" />
                                </svg>
                            </div>
                            <p className="text-text-muted text-sm">Sin anuncios publicados</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {allAds.slice(-5).reverse().map((ad) => (
                                <div key={ad.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface/70 hover:bg-surface transition-colors">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${ad.status === 'active' ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                                        : ad.status === 'pending' ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                        }`}>
                                        {ad.status === 'active' ? '✓' : ad.status === 'pending' ? '⏳' : '⏸'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-text-primary truncate">{ad.title}</p>
                                        <p className="text-xs text-text-muted truncate">{ad.section || 'Sin sección'} • {ad.publisherName}</p>
                                    </div>
                                    <span className="text-xs font-bold text-text-secondary">${(ad.totalPrice || ad.planPrice || 0).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Suscripciones
   ═══════════════════════════════════════════════ */
function SubscriptionsPanel({ onRefresh }) {
    const [data, setData] = useState([]);
    useEffect(() => { setData(subscriptions.getAll()); }, []);

    const handleDelete = (id) => {
        if (!confirm('¿Eliminar esta suscripción?')) return;
        subscriptions.remove(id);
        setData(subscriptions.getAll());
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Suscripciones</h1>
                    <p className="text-text-muted text-sm mt-1">{data.length} suscriptores registrados</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold">
                    {data.filter((s) => s.status === 'active').length} activos
                </div>
            </div>

            {data.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-text-secondary mb-1">Sin suscripciones aún</h3>
                    <p className="text-text-muted text-sm">Las suscripciones aparecerán aquí cuando los usuarios se registren.</p>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface text-text-muted text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 text-left font-semibold">Suscriptor</th>
                                    <th className="px-6 py-4 text-left font-semibold">Teléfono</th>
                                    <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                    <th className="px-6 py-4 text-left font-semibold">Fecha</th>
                                    <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-surface/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {(sub.fullName || 'U')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text-primary">{sub.fullName}</p>
                                                    <p className="text-xs text-text-muted">{sub.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted">{sub.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {sub.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-xs">
                                            {new Date(sub.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleDelete(sub.id)}
                                                className="px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Anuncios
   ═══════════════════════════════════════════════ */
function AdsPanel({ onRefresh }) {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('all');
    const [editing, setEditing] = useState(null); // null = list, id = editing
    const [renewing, setRenewing] = useState(null); // null = not renewing, id = renewing ad
    const [renewPlan, setRenewPlan] = useState('');
    const [form, setForm] = useState({
        title: '', description: '', publisherName: '', publisherPhone: '', publisherEmail: '', photos: [],
    });

    useEffect(() => { setData(ads.getAll()); }, []);

    const handleStatusChange = (id, status) => {
        ads.update(id, { status });
        const updatedAds = ads.getAll();
        setData(updatedAds);

        // Cuando se activa un anuncio, crear artículo en Redacción como borrador
        if (status === 'active') {
            const ad = updatedAds.find((a) => a.id === id);
            if (ad) {
                newsArticles.createFromAd(ad);
                alert('✅ Anuncio activado.\n📝 Se creó un borrador en Redacción para revisión editorial.');
            }
        }

        // Cuando se pausa o expira, despublicar el artículo vinculado
        if (status === 'paused' || status === 'expired') {
            const linkedArticle = newsArticles.getByAdId(id);
            if (linkedArticle) {
                newsArticles.update(linkedArticle.id, { status: 'draft' });
            }
        }
    };

    const handleDelete = (id) => {
        if (!confirm('¿Eliminar este anuncio permanentemente?\nSe eliminará también el artículo vinculado en Redacción.')) return;
        // Eliminar artículo vinculado en Redacción
        newsArticles.removeByAdId(id);
        ads.remove(id);
        setData(ads.getAll());
    };

    const startEdit = (ad) => {
        setForm({
            title: ad.title || '',
            description: ad.description || '',
            publisherName: ad.publisherName || '',
            publisherPhone: ad.publisherPhone || '',
            publisherEmail: ad.publisherEmail || '',
            photos: ad.photos || [],
        });
        setEditing(ad.id);
    };

    const saveEdit = () => {
        if (!form.title.trim()) return alert('El título es obligatorio');
        ads.update(editing, {
            title: form.title,
            description: form.description,
            publisherName: form.publisherName,
            publisherPhone: form.publisherPhone,
            publisherEmail: form.publisherEmail,
            photos: form.photos,
            photosCount: form.photos.length,
        });

        // Sincronizar cambios al artículo vinculado en Redacción
        const updatedAd = ads.getAll().find((a) => a.id === editing);
        if (updatedAd) {
            newsArticles.syncFromAd(updatedAd);
        }

        setEditing(null);
        setData(ads.getAll());
    };

    const removePhoto = (idx) => {
        setForm((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== idx),
        }));
    };

    const addPhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({
                ...prev,
                photos: [...prev.photos, reader.result],
            }));
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const statusConfig = {
        pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
        active: { label: 'Activo', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
        paused: { label: 'Pausado', color: 'bg-slate-100 text-text-muted', dot: 'bg-slate-400' },
        expired: { label: 'Expirado', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
    };

    const filtered = filter === 'all' ? data : data.filter((a) => a.status === filter);

    const handleRenewSubmit = () => {
        if (!renewPlan) return alert('Debes seleccionar un plan.');
        const plan = pricing.getAll().find((p) => p.id === renewPlan);
        const ad = data.find((a) => a.id === renewing);
        if(!plan || !ad) return;

        // Calcular el nuevo precio considerando el multiplicador original de la sección
        const newPrice = Math.round(plan.price * (ad.sectionMultiplier || 1));

        ads.renew(renewing, plan.days, newPrice);
        setRenewing(null);
        setRenewPlan('');
        setData(ads.getAll());
        alert(`✅ Anuncio enviado a revisión por $${newPrice.toLocaleString()} MXN`);
    };

    /* ═══ RENEW MODAL ═══ */
    if (renewing !== null) {
        const ad = data.find((a) => a.id === renewing);
        const plans = pricing.getAll().filter((p) => p.active);
        const planObj = plans.find((p) => p.id === renewPlan);
        const newPrice = planObj ? Math.round(planObj.price * (ad.sectionMultiplier || 1)) : 0;

        return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden">
                    <button onClick={() => setRenewing(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-text-muted rounded-full transition-colors">✕</button>
                    
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Realizar Pago</h2>
                        <p className="text-text-muted text-sm mt-1">Renovar anuncio: <strong>{ad.title}</strong></p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-2">Selecciona un nuevo plan</label>
                            <div className="grid grid-cols-2 gap-3">
                                {plans.map((p) => (
                                    <button key={p.id} onClick={() => setRenewPlan(p.id)}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${renewPlan === p.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border'}`}>
                                        <p className="font-bold text-text-primary text-sm">{p.name}</p>
                                        <p className="text-xs text-text-muted">{p.days} días</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {renewPlan && (
                            <div className="bg-surface p-4 rounded-xl border border-border">
                                <div className="flex justify-between text-sm mb-2 text-text-secondary"><span>Plan base:</span><span>${planObj.price.toLocaleString()}</span></div>
                                <div className="flex justify-between text-sm mb-2 text-text-secondary"><span>Multiplicador ({ad.section}):</span><span>×{ad.sectionMultiplier || 1}</span></div>
                                <div className="flex justify-between text-lg font-black text-text-primary mt-4 pt-4 border-t border-border">
                                    <span>Total a pagar:</span><span className="text-emerald-600">${newPrice.toLocaleString()} MXN</span>
                                </div>
                            </div>
                        )}

                        <button onClick={handleRenewSubmit} disabled={!renewPlan}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50">
                            Pagar {newPrice ? `$${newPrice.toLocaleString()}` : ''} y Renovar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══ EDIT VIEW ═══ */
    if (editing !== null) {
        const ad = data.find((a) => a.id === editing);
        return (
            <div>
                <button onClick={() => setEditing(null)}
                    className="flex items-center gap-2 text-text-muted hover:text-text-secondary text-sm font-medium mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a anuncios
                </button>

                <div className="bg-card rounded-2xl border border-border shadow-sm">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                            ✏️ Editar Anuncio
                        </h2>
                        <p className="text-text-muted text-sm mt-1">
                            Modifica los datos del anuncio. Los cambios se reflejarán en la página principal.
                        </p>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Título</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                placeholder="Título del anuncio" />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Descripción</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={15}
                                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-y"
                                placeholder="Descripción del anuncio" />
                        </div>

                        {/* Publisher info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Nombre del publicador</label>
                                <input value={form.publisherName} onChange={(e) => setForm({ ...form, publisherName: e.target.value })}
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                    placeholder="Nombre" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Teléfono</label>
                                <input value={form.publisherPhone} onChange={(e) => setForm({ ...form, publisherPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                    placeholder="10 dígitos" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
                                <input value={form.publisherEmail} onChange={(e) => setForm({ ...form, publisherEmail: e.target.value })}
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                    placeholder="correo@ejemplo.com" />
                            </div>
                        </div>

                        {/* Photos */}
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                                Fotos ({form.photos.length})
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                {form.photos.map((photo, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-border h-28">
                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                Principal
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {/* Add photo button */}
                                <label className="h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                                    <svg className="w-6 h-6 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="text-[10px] text-text-muted font-medium">Agregar</span>
                                    <input type="file" accept="image/*" onChange={addPhoto} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-text-muted">La primera foto es la imagen principal que se muestra en la tarjeta.</p>
                        </div>

                        {/* Ad metadata (read-only) */}
                        {ad && (
                            <div className="bg-surface rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted">
                                <span>📍 Sección: <strong className="text-violet-600">{ad.section}</strong></span>
                                <span>📅 Plan: <strong>{ad.plan}</strong></span>
                                <span>💰 Precio: <strong className="text-emerald-600">${(ad.totalPrice || 0).toLocaleString()} MXN</strong></span>
                                <span>📆 Creado: {new Date(ad.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-border flex items-center gap-3">
                        <button onClick={saveEdit}
                            className="px-6 py-2.5 bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all">
                            💾 Guardar Cambios
                        </button>
                        <button onClick={() => setEditing(null)}
                            className="px-6 py-2.5 bg-slate-100 text-text-muted text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══ LIST VIEW ═══ */
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Anuncios</h1>
                    <p className="text-text-muted text-sm mt-1">{data.length} anuncios en total</p>
                </div>
                <div className="flex gap-1 bg-card rounded-xl border border-border p-1">
                    {[['all', 'Todos'], ['pending', 'Pendientes'], ['active', 'Activos'], ['paused', 'Pausados'], ['expired', 'Expirados']].map(([key, label]) => (
                        <button key={key} onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === key ? 'bg-navy text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-text-secondary mb-1">Sin anuncios</h3>
                    <p className="text-text-muted text-sm">
                        {filter === 'all' ? 'Los anuncios aparecerán aquí cuando se publiquen.' : `No hay anuncios con estado "${filter}".`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((ad) => {
                        const cfg = statusConfig[ad.status] || statusConfig.pending;
                        return (
                            <div key={ad.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-border transition-all duration-200">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Thumbnail */}
                                    {ad.photos?.[0] && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                                            <img src={ad.photos[0]} alt={ad.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h4 className="font-bold text-text-primary truncate">{ad.title}</h4>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <p className="text-text-muted text-xs line-clamp-1 mb-2">{ad.description}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                                            <span className="flex items-center gap-1">👤 {ad.publisherName}</span>
                                            <span className="flex items-center gap-1">📞 {ad.publisherPhone}</span>
                                            <span className="flex items-center gap-1">📧 {ad.publisherEmail}</span>
                                            <span className="flex items-center gap-1 font-semibold text-violet-600">📍 {ad.section || 'N/A'}</span>
                                            <span className="flex items-center gap-1">📅 {ad.plan}</span>
                                            <span className="flex items-center gap-1 font-bold text-emerald-600">${(ad.totalPrice || ad.planPrice || 0).toLocaleString()} MXN</span>
                                            <span className="flex items-center gap-1">📷 {ad.photosCount || ad.photos?.length || 0} fotos</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                        {ad.status === 'expired' && (
                                            <button onClick={() => setRenewing(ad.id)}
                                                className="px-3.5 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-lg hover:bg-accent/20 transition-all">
                                                🔄 Renovar Pago
                                            </button>
                                        )}
                                        <button onClick={() => startEdit(ad)}
                                            className="px-3.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all">
                                            ✏️ Editar
                                        </button>
                                        {ad.status !== 'active' && (
                                            <button onClick={() => handleStatusChange(ad.id, 'active')}
                                                className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all">
                                                ✓ Activar
                                            </button>
                                        )}
                                        {ad.status !== 'paused' && ad.status !== 'expired' && (
                                            <button onClick={() => handleStatusChange(ad.id, 'paused')}
                                                className="px-3.5 py-1.5 bg-surface text-text-muted text-xs font-bold rounded-lg hover:bg-surface transition-all">
                                                ⏸ Pausar
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(ad.id)}
                                            className="px-3.5 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all">
                                            ✕ Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Precios
   ═══════════════════════════════════════════════ */
function PricingPanel({ onRefresh }) {
    const [data, setData] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', days: '', price: '', currency: 'MXN' });

    useEffect(() => { setData(pricing.getAll()); }, []);

    const startEdit = (plan) => {
        setEditing(plan.id);
        setForm({ name: plan.name, days: String(plan.days), price: String(plan.price), currency: plan.currency || 'MXN' });
    };

    const saveEdit = () => {
        pricing.update(editing, { name: form.name, days: Number(form.days), price: Number(form.price), currency: form.currency });
        setEditing(null);
        setData(pricing.getAll());
    };

    const addPlan = () => {
        pricing.add({ name: 'Nuevo Plan', days: 7, price: 199, currency: 'MXN' });
        setData(pricing.getAll());
    };

    const deletePlan = (id) => {
        if (!confirm('¿Eliminar este plan?')) return;
        pricing.remove(id);
        setData(pricing.getAll());
    };

    const toggleActive = (id, current) => {
        pricing.update(id, { active: !current });
        setData(pricing.getAll());
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Planes de Precios</h1>
                    <p className="text-text-muted text-sm mt-1">{data.length} planes configurados</p>
                </div>
                <button onClick={addPlan} className="px-4 py-2.5 bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all">
                    + Nuevo Plan
                </button>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface text-text-muted text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                                <th className="px-6 py-4 text-left font-semibold">Duración</th>
                                <th className="px-6 py-4 text-left font-semibold">Precio Base</th>
                                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((plan) => (
                                <tr key={plan.id} className="hover:bg-surface/50 transition-colors">
                                    {editing === plan.id ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="number" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })}
                                                    className="w-20 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                    className="w-28 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                                            </td>
                                            <td className="px-6 py-4 text-text-muted">—</td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button onClick={saveEdit} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all">Guardar</button>
                                                <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-surface text-text-muted text-xs font-bold rounded-lg hover:bg-surface transition-all">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 font-semibold text-text-primary">{plan.name}</td>
                                            <td className="px-6 py-4 text-text-muted">{plan.days} días</td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-lg text-text-primary">${plan.price.toLocaleString()}</span>
                                                <span className="text-text-muted text-xs ml-1">{plan.currency}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleActive(plan.id, plan.active)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${plan.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-text-muted hover:bg-slate-200'
                                                        }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${plan.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {plan.active ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-1">
                                                <button onClick={() => startEdit(plan)} className="px-3 py-1.5 bg-surface text-text-secondary text-xs font-semibold rounded-lg hover:bg-surface transition-all">
                                                    Editar
                                                </button>
                                                <button onClick={() => deletePlan(plan.id)} className="px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all">
                                                    Eliminar
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Secciones de Anuncios
   ═══════════════════════════════════════════════ */
function SectionsPanel({ onRefresh }) {
    const [data, setData] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', key: '', multiplier: '', description: '' });

    useEffect(() => { setData(adSections.getAll()); }, []);

    const startEdit = (section) => {
        setEditing(section.id);
        setForm({ name: section.name, key: section.key, multiplier: String(section.multiplier), description: section.description || '' });
    };

    const saveEdit = () => {
        adSections.update(editing, { name: form.name, key: form.key, multiplier: Number(form.multiplier), description: form.description });
        setEditing(null);
        setData(adSections.getAll());
    };

    const addSection = () => {
        adSections.add({ name: 'Nueva Sección', key: 'nueva-' + Date.now(), multiplier: 1, description: 'Descripción de la sección' });
        setData(adSections.getAll());
    };

    const deleteSection = (id) => {
        if (!confirm('¿Eliminar esta sección?')) return;
        adSections.remove(id);
        setData(adSections.getAll());
    };

    const toggleActive = (id, current) => {
        adSections.update(id, { active: !current });
        setData(adSections.getAll());
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Secciones de Publicación</h1>
                    <p className="text-text-muted text-sm mt-1">Define dónde se publican anuncios y su multiplicador de precio</p>
                </div>
                <button onClick={addSection} className="px-4 py-2.5 bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all">
                    + Nueva Sección
                </button>
            </div>

            {/* Section cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {data.map((section) => (
                    <div key={section.id} className={`relative bg-card rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${section.key === 'hero' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-border hover:border-border'
                        } ${!section.active ? 'opacity-50' : ''}`}>
                        {editing === section.id ? (
                            /* Edit mode */
                            <div className="space-y-3">
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre"
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="Clave"
                                        className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none font-mono" />
                                    <input type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })} placeholder="Mult."
                                        className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                                </div>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción"
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                                <div className="flex gap-2">
                                    <button onClick={saveEdit} className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all">Guardar</button>
                                    <button onClick={() => setEditing(null)} className="flex-1 py-2 bg-surface text-text-muted text-xs font-bold rounded-lg hover:bg-surface transition-all">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            /* View mode */
                            <>
                                {section.key === 'hero' && (
                                    <div className="absolute -top-2 -right-2 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-amber-500/20">
                                        ⭐ Premium
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-text-primary text-sm">{section.name}</h4>
                                        <p className="text-text-muted text-xs font-mono">{section.key}</p>
                                    </div>
                                    <div className={`text-2xl font-black ${section.multiplier >= 3 ? 'text-red-500' : section.multiplier >= 1.5 ? 'text-amber-500' : 'text-text-secondary'
                                        }`}>
                                        ×{section.multiplier}
                                    </div>
                                </div>
                                <p className="text-text-muted text-xs mb-4 line-clamp-2">{section.description}</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleActive(section.id, section.active)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${section.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-text-muted'
                                            }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${section.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        {section.active ? 'Activo' : 'Inactivo'}
                                    </button>
                                    <div className="flex-1" />
                                    <button onClick={() => startEdit(section)} className="px-2.5 py-1 text-text-muted hover:text-text-secondary text-xs font-semibold rounded-lg hover:bg-surface transition-all">
                                        Editar
                                    </button>
                                    <button onClick={() => deleteSection(section.id)} className="px-2.5 py-1 text-red-400 hover:text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all">
                                        Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Info card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">💡</span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-amber-800 mb-0.5">¿Cómo funciona el multiplicador?</p>
                    <p className="text-xs text-amber-700/80">
                        Precio final = Precio base del plan × Multiplicador de la sección. Ejemplo: Plan 1 Semana ($299) × Hero (×5) = <strong>$1,495 MXN</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Redacción — CRUD de Noticias
   ═══════════════════════════════════════════════ */
const CATEGORIES = ['Política', 'Economía', 'Deportes', 'Tecnología', 'Cultura'];

function ArticlesPanel({ onRefresh }) {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [editing, setEditing] = useState(null);
    const [articleTab, setArticleTab] = useState('list'); // 'list' | 'history' | 'trash'
    const [form, setForm] = useState({
        title: '', excerpt: '', category: 'Política', author: '', image: '', readTime: '5 min', status: 'draft', visualLayout: null
    });

    useEffect(() => { setData(newsArticles.getAll()); }, []);

    const reload = () => setData(newsArticles.getAll());

    const startNew = () => {
        setForm({ title: '', excerpt: '', body: '', explanation: '', credits: '', category: 'Política', author: '', image: '', readTime: '5 min', status: 'draft', visualLayout: null });
        setEditing('new');
    };

    const startEdit = (article) => {
        setForm({
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            author: article.author,
            image: article.image || '',
            readTime: article.readTime || '5 min',
            status: article.status || 'draft',
            visualLayout: article.visualLayout || null,
        });
        setEditing(article.id);
    };

    const archiveArticle = (id) => {
        if (!confirm('¿Mover este artículo a la papelera?')) return;
        newsArticles.archive(id);
        reload();
    };

    const restoreArticle = (id) => {
        newsArticles.restore(id);
        reload();
    };

    const permanentDelete = (id) => {
        if (!confirm('¿Eliminar definitivamente? Esta acción no se puede deshacer.')) return;
        newsArticles.remove(id);
        reload();
    };

    const toggleStatus = (id, current) => {
        newsArticles.update(id, { status: current === 'published' ? 'draft' : 'published' });
        reload();
    };

    const makeFeatured = (id) => {
        newsArticles.setFeatured(id);
        reload();
    };

    /* ═══ LIST VIEW ═══ */
    const activeArticles = data.filter(a => !a.archivedAt);
    const archivedArticles = newsArticles.getArchived();
    const historyArticles = newsArticles.getHistory();

    const statusConfig = {
        published: { label: 'Publicado', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
        draft: { label: 'Borrador', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
    };

    let filtered = activeArticles;
    if (filter === 'published') filtered = filtered.filter(a => a.status === 'published');
    if (filter === 'draft') filtered = filtered.filter(a => a.status === 'draft');
    if (catFilter !== 'all') filtered = filtered.filter(a => a.category === catFilter);
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    /* ═══ EDITOR VIEW ═══ */
    if (editing !== null) {
        return (
            <UnifiedVisualEditor
                mode="article"
                initialData={{ ...form, id: editing }}
                history={data.find(a => a.id === editing)?.history || []}
                onSave={(updated) => {
                    try {
                        const full = { ...form, ...updated };
                        if (editing === 'new') {
                            newsArticles.add({ ...full, id: `art${Date.now()}` });
                        } else {
                            newsArticles.update(editing, full);
                        }
                        setData(newsArticles.getAll().filter(a => !a.archivedAt));
                        setEditing(null);
                        setForm({ title: '', excerpt: '', body: '', explanation: '', credits: '', category: 'Política', author: '', image: '', status: 'published', readTime: '5 min' });
                    } catch (error) {
                        console.error('❌ Error al guardar:', error);
                        alert('Error al guardar: ' + error.message);
                    }
                }}
                onCancel={() => { setEditing(null); }}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Redacción</h1>
                    <p className="text-text-muted text-sm mt-1">{activeArticles.length} activas • {activeArticles.filter(a => a.status === 'published').length} publicadas • {archivedArticles.length} en papelera</p>
                </div>
                <button onClick={startNew}
                    className="px-5 py-2.5 bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nueva Noticia
                </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 bg-card rounded-xl border border-border p-1 mb-6 w-fit">
                {[['list','📋 Activas'], ['history','🕐 Historial'], ['trash','🗑️ Papelera']].map(([key, label]) => (
                    <button key={key} onClick={() => setArticleTab(key)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${articleTab === key ? 'bg-navy text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── TAB: ACTIVAS ── */}
            {articleTab === 'list' && (<>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex gap-1 bg-card rounded-xl border border-border p-1">
                        {[['all','Todos'],['published','Publicados'],['draft','Borradores']].map(([key,label]) => (
                            <button key={key} onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === key ? 'bg-navy text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 bg-card rounded-xl border border-border p-1 overflow-x-auto">
                        <button onClick={() => setCatFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${catFilter === 'all' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}>Todas</button>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${catFilter === cat ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
                {filtered.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-16 text-center">
                        <p className="text-text-muted text-sm">Sin artículos. Crea tu primera noticia.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(article => {
                            const cfg = statusConfig[article.status] || statusConfig.draft;
                            return (
                                <div key={article.id} className={`bg-card rounded-2xl border p-4 hover:shadow-md transition-all ${article.featured ? 'border-amber-200 ring-1 ring-amber-100' : 'border-border'}`}>
                                    <div className="flex gap-4">
                                        {article.image && <div className="hidden sm:block w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100"><img src={article.image} alt="" className="w-full h-full object-cover" /></div>}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {article.featured && <span className="text-amber-500 text-xs">⭐</span>}
                                                <h4 className="font-bold text-text-primary text-sm truncate">{article.title}</h4>
                                            </div>
                                            <p className="text-text-muted text-xs line-clamp-1 mb-2">{article.excerpt}</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.color}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}</span>
                                                <span className="px-2 py-0.5 bg-surface text-text-muted rounded-full text-[11px] font-semibold">{article.category}</span>
                                                <span className="text-[11px] text-text-muted">✍️ {article.author}</span>
                                                <span className="text-[11px] text-text-muted">📅 {fmtDate(article.createdAt)}</span>
                                                {article.updatedAt && article.updatedAt !== article.createdAt && <span className="text-[11px] text-text-muted">✏️ {fmtDate(article.updatedAt)}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => makeFeatured(article.id)} title="Destacado" className={`p-2 rounded-lg transition-all ${article.featured ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}`}>
                                                <svg className="w-4 h-4" fill={article.featured ? 'currentColor':'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                            </button>
                                            <button onClick={() => toggleStatus(article.id, article.status)} title={article.status === 'published' ? 'Pasar a borrador':'Publicar'} className={`p-2 rounded-lg transition-all ${article.status === 'published' ? 'text-emerald-500 hover:bg-emerald-50':'text-amber-500 hover:bg-amber-50'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={article.status === 'published' ? "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} /></svg>
                                            </button>
                                            <button onClick={() => startEdit(article)} className="p-2 text-text-muted hover:text-text-secondary hover:bg-surface rounded-lg transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => archiveArticle(article.id)} title="Mover a papelera" className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </>)}

            {/* ── TAB: HISTORIAL ── */}
            {articleTab === 'history' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-surface">
                        <h3 className="font-bold text-text-primary text-sm">Historial de noticias ({historyArticles.length})</h3>
                        <p className="text-text-muted text-xs mt-0.5">Registro de todas las noticias ordenadas por última modificación.</p>
                    </div>
                    <div className="divide-y divide-border">
                        {historyArticles.length === 0 ? (
                            <div className="p-12 text-center text-text-muted text-sm">No hay noticias aún.</div>
                        ) : historyArticles.map(a => {
                            const cfg = statusConfig[a.status] || statusConfig.draft;
                            return (
                                <div key={a.id} className="flex items-center gap-4 px-6 py-3 hover:bg-surface transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-text-primary text-sm truncate">{a.title}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                            <span className="text-[10px] text-text-muted">{a.category}</span>
                                            <span className="text-[10px] text-text-muted">✍️ {a.author}</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-[11px] text-text-muted whitespace-nowrap">
                                        <div>📅 Creado: {fmtDate(a.createdAt)}</div>
                                        {a.updatedAt && <div>✏️ Editado: {fmtDate(a.updatedAt)}</div>}
                                    </div>
                                    <button onClick={() => startEdit(a)} className="p-2 text-text-muted hover:text-accent hover:bg-surface rounded-lg transition-all flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── TAB: PAPELERA ── */}
            {articleTab === 'trash' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-red-50">
                        <h3 className="font-bold text-red-700 text-sm">🗑️ Papelera ({archivedArticles.length})</h3>
                        <p className="text-red-500 text-xs mt-0.5">Los artículos aquí pueden restaurarse o eliminarse definitivamente.</p>
                    </div>
                    <div className="divide-y divide-border">
                        {archivedArticles.length === 0 ? (
                            <div className="p-12 text-center text-text-muted text-sm">La papelera está vacía.</div>
                        ) : archivedArticles.map(a => (
                            <div key={a.id} className="flex items-center gap-4 px-6 py-3 hover:bg-red-50/40 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-text-primary text-sm truncate">{a.title}</p>
                                    <p className="text-[11px] text-text-muted mt-0.5">{a.category} • ✍️ {a.author} • Archivado: {fmtDate(a.archivedAt)}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => restoreArticle(a.id)} className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all">
                                        ↩ Restaurar
                                    </button>
                                    <button onClick={() => permanentDelete(a.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all">
                                        ✕ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Canal en Vivo
   ═══════════════════════════════════════════════ */
const PRESET_CHANNELS = [
    { id: 'Y-IlMeCCtIg', name: 'France 24 Español', description: 'Noticias internacionales 24/7 en español', logo: '🇫🇷', color: 'from-blue-600 to-blue-800' },
    { id: 'jRnqxURJ120', name: 'DW Español', description: 'Deutsche Welle — Noticias desde Alemania', logo: '🇩🇪', color: 'from-indigo-500 to-indigo-700' },
    { id: 'O9mOtdZ-nSk', name: 'Euronews Español', description: 'Noticias europeas en directo', logo: '🇪🇺', color: 'from-sky-500 to-sky-700' },
    { id: 'tQ941SU5UR0', name: 'Milenio Noticias', description: 'Canal mexicano de noticias en vivo', logo: '🇲🇽', color: 'from-emerald-500 to-emerald-700' },
    { id: 'b4tE5aKhtlg', name: 'RTVE 24h', description: 'Canal 24 horas de Televisión Española', logo: '🇪🇸', color: 'from-red-500 to-red-700' },
    { id: 'Qr61waJ6AZg', name: 'CNN en Español', description: 'Últimas noticias de CNN en español', logo: '📺', color: 'from-rose-600 to-rose-800' },
];

function LiveChannelPanel() {
    const [activeChannel, setActiveChannel] = useState(() => {
        try {
            const saved = localStorage.getItem('ei_live_channel');
            return saved ? JSON.parse(saved) : PRESET_CHANNELS[0];
        } catch { return PRESET_CHANNELS[0]; }
    });
    const [customUrl, setCustomUrl] = useState('');
    const [saved, setSaved] = useState(false);

    const selectChannel = (ch) => {
        setActiveChannel(ch);
        localStorage.setItem('ei_live_channel', JSON.stringify(ch));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        // Extract video ID from various YouTube URL formats
        let videoId = customUrl.trim();
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
            /(?:youtu\.be\/)([\w-]{11})/,
            /(?:youtube\.com\/embed\/)([\w-]{11})/,
            /(?:youtube\.com\/live\/)([\w-]{11})/,
        ];
        for (const pat of patterns) {
            const m = videoId.match(pat);
            if (m) { videoId = m[1]; break; }
        }
        if (!videoId || videoId.length < 5) return alert('URL o ID de video inválido.');
        selectChannel({ id: videoId, name: 'Canal Personalizado', description: customUrl.trim() });
        setCustomUrl('');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                        Canal en Vivo
                    </h1>
                    <p className="text-text-muted text-sm mt-1">Selecciona el canal de noticias que se mostrará en la sección "En Vivo" del portal.</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold animate-pulse">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ¡Canal actualizado!
                    </div>
                )}
            </div>

            {/* Active channel indicator */}
            <div className="bg-card rounded-2xl border border-border p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${PRESET_CHANNELS.find(c => c.id === activeChannel.id)?.color || 'from-slate-500 to-slate-700'} flex items-center justify-center text-2xl shadow-lg`}>
                        {PRESET_CHANNELS.find(c => c.id === activeChannel.id)?.logo || '📺'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <p className="text-xs font-black text-red-500 uppercase tracking-wider">Transmitiendo ahora</p>
                        </div>
                        <p className="text-lg font-black text-text-primary mt-0.5">{activeChannel.name}</p>
                        <p className="text-xs text-text-muted">{activeChannel.description || `ID: ${activeChannel.id}`}</p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="aspect-video w-48 bg-black rounded-xl overflow-hidden border border-border shadow">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${activeChannel.id}?autoplay=0&mute=1&controls=0`}
                                title="Preview"
                                frameBorder="0"
                                allow="encrypted-media"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Channel grid */}
            <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Canales Disponibles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {PRESET_CHANNELS.map((ch) => {
                    const isActive = activeChannel.id === ch.id;
                    return (
                        <button
                            key={ch.id}
                            onClick={() => selectChannel(ch)}
                            className={`relative group text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                                isActive
                                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                                    : 'border-border bg-card hover:border-border hover:shadow-md'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-xl shadow group-hover:scale-110 transition-transform`}>
                                    {ch.logo}
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary text-sm">{ch.name}</p>
                                    <p className="text-[11px] text-text-muted leading-tight">{ch.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
                                {isActive ? (
                                    <span className="text-accent flex items-center gap-1">
                                        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-accent opacity-75"></span><span className="relative rounded-full h-1.5 w-1.5 bg-accent"></span></span>
                                        En vivo ahora
                                    </span>
                                ) : (
                                    <span className="text-text-muted group-hover:text-text-secondary transition-colors">Click para activar</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Custom URL input */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider">Canal Personalizado</h3>
                <p className="text-xs text-text-muted mb-4">Pega la URL de cualquier video o livestream de YouTube para mostrarlo en la sección "En Vivo".</p>
                <form onSubmit={handleCustomSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... o ID del video"
                        className="flex-1 px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-slate-300"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                        Activar Canal
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Panel de Diseño del Portal — Editor visual
   ═══════════════════════════════════════════════ */
const PORTAL_SECTIONS = ['Política', 'Economía', 'Deportes', 'Tecnología', 'Cultura'];

function PortalDesignPanel() {
    const [cfg, setCfg] = useState(() => siteConfig.getAll());
    const [activeSection, setActiveSection] = useState('topbar');
    const [saved, setSaved] = useState(false);
    const [visualEditingSection, setVisualEditingSection] = useState(null);

    const confirmSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
    const updateTopbar = (f, v) => { const n = { ...cfg, topbar: { ...cfg.topbar, [f]: v } }; setCfg(n); siteConfig.update('topbar', n.topbar); };
    const updateHeader = (f, v) => { const n = { ...cfg, header: { ...cfg.header, [f]: v } }; setCfg(n); siteConfig.update('header', n.header); };
    const updateFooter = (f, v) => { const n = { ...cfg, footer: { ...cfg.footer, [f]: v } }; setCfg(n); siteConfig.update('footer', n.footer); };
    const updateSocial = (p, v) => { const n = JSON.parse(JSON.stringify(cfg)); n.footer.socialLinks[p] = v; setCfg(n); siteConfig.update('footer', n.footer); };
    const updateSec = (s, f, v) => { const n = JSON.parse(JSON.stringify(cfg)); if (!n.sections.items[s]) n.sections.items[s] = {}; n.sections.items[s][f] = v; setCfg(n); siteConfig.updateSection(s, { [f]: v }); };

    const inp = 'w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all';
    const lbl = 'block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5';

    const menuItems = [
        { id: 'topbar', label: '📡 Barra Superior' },
        { id: 'header', label: '🏠 Header / Logo' },
        { id: 'footer', label: '📋 Footer' },
        ...PORTAL_SECTIONS.map(n => ({ id: n, label: `📰 ${n}` })),
    ];

    const ColorRow = ({ label, value, onChange }) => (
        <div>
            <label className={lbl}>{label}</label>
            <div className="flex items-center gap-3">
                <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} className="w-12 h-10 rounded-lg border border-border cursor-pointer flex-shrink-0" />
                <input className={inp} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#rrggbb" />
            </div>
        </div>
    );

    const renderEditor = () => {
        if (activeSection === 'topbar') return (
            <div className="space-y-5">
                <h3 className="font-black text-lg text-text-primary">Barra Superior</h3>
                <div><label className={lbl}>Texto de bienvenida</label><input className={inp} value={cfg.topbar?.tickerText || ''} onChange={e => updateTopbar('tickerText', e.target.value)} /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <ColorRow label="Fondo" value={cfg.topbar?.bgColor} onChange={v => updateTopbar('bgColor', v)} />
                    <ColorRow label="Texto" value={cfg.topbar?.textColor} onChange={v => updateTopbar('textColor', v)} />
                </div>
                <div className="rounded-xl overflow-hidden border border-border">
                    <div className="text-xs font-bold text-text-muted px-4 py-2 bg-surface">Vista previa</div>
                    <div className="px-6 py-3 text-sm flex items-center justify-between" style={{ backgroundColor: cfg.topbar?.bgColor, color: cfg.topbar?.textColor }}>
                        <span>{cfg.topbar?.tickerText || '...'}</span><span className="opacity-50 text-xs">Redes →</span>
                    </div>
                </div>
            </div>
        );
        if (activeSection === 'header') return (
            <div className="space-y-5">
                <h3 className="font-black text-lg text-text-primary">Header / Logo</h3>
                <div><label className={lbl}>Nombre del sitio</label><input className={inp} value={cfg.header?.siteName || ''} onChange={e => updateHeader('siteName', e.target.value)} /></div>
                <div><label className={lbl}>Tagline</label><input className={inp} value={cfg.header?.tagline || ''} onChange={e => updateHeader('tagline', e.target.value)} /></div>
                <ColorRow label="Color de fondo del header" value={cfg.header?.bgColor} onChange={v => updateHeader('bgColor', v)} />
            </div>
        );
        if (activeSection === 'footer') return (
            <div className="space-y-5">
                <h3 className="font-black text-lg text-text-primary">Footer</h3>
                <div><label className={lbl}>Descripción</label><textarea className={inp} rows={3} value={cfg.footer?.description || ''} onChange={e => updateFooter('description', e.target.value)} /></div>
                <div><label className={lbl}>Copyright</label><input className={inp} value={cfg.footer?.copyright || ''} onChange={e => updateFooter('copyright', e.target.value)} /></div>
                <div><label className={lbl}>Redes sociales (URLs)</label>
                    <div className="space-y-3">{['twitter','facebook','instagram','youtube'].map(p => (
                        <div key={p} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-text-muted w-20 capitalize">{p}</span>
                            <input className={inp} value={cfg.footer?.socialLinks?.[p] || ''} onChange={e => updateSocial(p, e.target.value)} placeholder={`URL de ${p}`} />
                        </div>
                    ))}</div>
                </div>
            </div>
        );
        const secCfg = cfg.sections?.items?.[activeSection] || {};
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-lg text-text-primary">Sección: {activeSection}</h3>
                    <button 
                        onClick={() => setVisualEditingSection(activeSection)}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                    >
                        <span>✨ Editar Visualmente</span>
                    </button>
                </div>
                <div><label className={lbl}>Título</label><input className={inp} value={secCfg.title || activeSection} onChange={e => updateSec(activeSection, 'title', e.target.value)} /></div>
                <div><label className={lbl}>Subtítulo</label><input className={inp} value={secCfg.subtitle || ''} onChange={e => updateSec(activeSection, 'subtitle', e.target.value)} placeholder="Texto introductorio..." /></div>
                <div>
                    <label className={lbl}>Imagen de banner (URL)</label>
                    <input className={inp} value={secCfg.bannerImage || ''} onChange={e => updateSec(activeSection, 'bannerImage', e.target.value)} placeholder="https://images.unsplash.com/..." />
                    {secCfg.bannerImage && (
                        <div className="mt-3 rounded-xl overflow-hidden h-32 relative border border-border">
                            <img src={secCfg.bannerImage} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end px-4 pb-3">
                                <div>
                                    <p className="text-white font-black">{secCfg.title || activeSection}</p>
                                    {secCfg.subtitle && <p className="text-white/70 text-xs">{secCfg.subtitle}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <ColorRow label="Color de fondo" value={secCfg.bgColor} onChange={v => updateSec(activeSection, 'bgColor', v)} />
                    <ColorRow label="Color de texto" value={secCfg.textColor} onChange={v => updateSec(activeSection, 'textColor', v)} />
                </div>
            </div>
        );
    };

    return (
        <div>
            {visualEditingSection && (
                <UnifiedVisualEditor
                    mode="section"
                    initialData={cfg.sections.items[visualEditingSection] || {}}
                    history={cfg.sections.items[visualEditingSection]?.history || []}
                    onSave={(payload) => {
                        updateSec(visualEditingSection, 'title', payload.title);
                        updateSec(visualEditingSection, 'subtitle', payload.subtitle);
                        updateSec(visualEditingSection, 'bannerImage', payload.bannerImage);
                        updateSec(visualEditingSection, 'bgColor', payload.bgColor);
                        updateSec(visualEditingSection, 'textColor', payload.textColor);
                        updateSec(visualEditingSection, 'visualLayout', payload.visualLayout);
                        setVisualEditingSection(null);
                        confirmSave();
                    }}
                    onCancel={() => setVisualEditingSection(null)}
                />
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>🎨 Diseño del Portal</h1>
                    <p className="text-text-muted text-sm mt-1">Edita la imagen visual de cada sección. Los cambios se guardan en tiempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saved && <span className="text-emerald-600 text-sm font-bold">✓ Guardado</span>}
                    <button onClick={confirmSave} className="px-5 py-2.5 bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all">💾 Guardar</button>
                    <button onClick={() => { if (confirm('¿Restablecer a valores predeterminados?')) { siteConfig.reset(); setCfg(siteConfig.getAll()); } }} className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">↺ Restablecer</button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
                        <div className="px-4 py-3 border-b border-border bg-surface"><p className="text-xs font-bold text-text-muted uppercase tracking-wide">Secciones</p></div>
                        <div className="p-2 space-y-0.5">
                            {menuItems.map(item => (
                                <button key={item.id} onClick={() => setActiveSection(item.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === item.id ? 'bg-navy text-white' : 'text-text-secondary hover:bg-surface'}`}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <div className="bg-card rounded-2xl border border-border p-6 min-h-96">{renderEditor()}</div>
                </div>
            </div>
        </div>
    );
}
