/**
 * SubscriptionForm — Formulario de suscripción al newsletter.
 * Campos: nombre completo, teléfono (10 dígitos), email.
 * Diseño premium con layout horizontal en desktop.
 */
import { useState } from 'react';
import { subscriptions } from '../data/store';

export default function SubscriptionForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    /** Solo permite dígitos y máximo 10 en teléfono */
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, [name]: cleaned }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    /** Validación de campos */
    const validate = () => {
        const e = {};
        if (!formData.fullName.trim()) e.fullName = 'Requerido';
        else if (formData.fullName.trim().length < 3) e.fullName = 'Nombre muy corto';
        if (!formData.phone) e.phone = 'Requerido';
        else if (formData.phone.length !== 10) e.phone = `Faltan ${10 - formData.phone.length} dígitos`;
        if (!formData.email.trim()) e.email = 'Requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /** Envío — guarda en base de datos */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        subscriptions.add(formData);
        setLoading(false);
        setSubmitted(true);
    };

    /* ===== Estado de éxito ===== */
    if (submitted) {
        return (
            <div className="rounded-2xl bg-gradient-to-r from-card to-surface p-10 text-center shadow-xl">
                <div className="w-16 h-16 mx-auto mb-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    ¡Suscripción Exitosa!
                </h3>
                <p className="text-text-secondary text-sm mb-5">
                    Gracias, <span className="text-text-primary font-semibold">{formData.fullName}</span>.
                    Recibirás las noticias en <span className="text-accent font-semibold">{formData.email}</span>.
                </p>
                <button
                    onClick={() => { setFormData({ fullName: '', phone: '', email: '' }); setErrors({}); setSubmitted(false); }}
                    className="px-5 py-2 bg-surface text-text-primary text-sm font-semibold rounded-lg border border-border hover:bg-surface transition-all"
                >
                    Cerrar
                </button>
            </div>
        );
    }

    /* ===== Formulario ===== */
    return (
        <div className="relative rounded-3xl bg-gradient-to-br from-navy-dark via-navy to-navy-light shadow-2xl overflow-hidden border border-white/10">
            {/* Decoraciones de fondo */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 p-10 md:p-14">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <span className="text-accent text-sm font-black uppercase tracking-widest">Newsletter</span>
                        </div>
                        <h3
                            className="text-3xl md:text-5xl font-black text-white leading-tight"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Mantente Informado
                        </h3>
                    </div>
                    <p className="text-white/70 text-base md:text-lg max-w-md md:text-right font-medium">
                        Suscríbete para recibir las noticias más relevantes y análisis exclusivos directamente en tu correo. Cero spam.
                    </p>
                </div>

                {/* Form — grid layout profesional */}
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="sub-name" className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2 pl-1">
                                Nombre Completo
                            </label>
                            <input
                                id="sub-name"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Ej. Juan Pérez"
                                className={`w-full bg-white/10 text-white text-base px-5 py-4 rounded-xl border outline-none transition-all duration-300 placeholder:text-white/30 focus:bg-white/20 focus:ring-2 focus:ring-accent/50 ${errors.fullName ? 'border-red-400' : 'border-white/10 focus:border-accent'
                                    }`}
                            />
                            {errors.fullName && <p className="mt-2 text-red-400 text-xs font-semibold pl-1">{errors.fullName}</p>}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label htmlFor="sub-phone" className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2 pl-1">
                                Teléfono (10 dígitos)
                            </label>
                            <div className="relative">
                                <input
                                    id="sub-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Ej. 6621234567"
                                    maxLength={10}
                                    className={`w-full bg-white/10 text-white text-base px-5 py-4 pr-16 rounded-xl border outline-none transition-all duration-300 placeholder:text-white/30 focus:bg-white/20 focus:ring-2 focus:ring-accent/50 ${errors.phone
                                        ? 'border-red-400'
                                        : formData.phone.length === 10
                                            ? 'border-green-400'
                                            : 'border-white/10 focus:border-accent'
                                        }`}
                                />
                                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${formData.phone.length === 10 ? 'text-green-400' : formData.phone.length > 0 ? 'text-amber-400' : 'text-white/30'
                                    }`}>
                                    {formData.phone.length}/10
                                </span>
                            </div>
                            {errors.phone && <p className="mt-2 text-red-400 text-xs font-semibold pl-1">{errors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="sub-email" className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2 pl-1">
                                Correo Electrónico
                            </label>
                            <input
                                id="sub-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                className={`w-full bg-white/10 text-white text-base px-5 py-4 rounded-xl border outline-none transition-all duration-300 placeholder:text-white/30 focus:bg-white/20 focus:ring-2 focus:ring-accent/50 ${errors.email ? 'border-red-400' : 'border-white/10 focus:border-accent'
                                    }`}
                            />
                            {errors.email && <p className="mt-2 text-red-400 text-xs font-semibold pl-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Submit + Privacy row */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between border-t border-white/10 pt-6 mt-2">
                        <p className="text-white/50 text-xs font-medium max-w-sm">
                            Al suscribirte aceptas nuestro{' '}
                            <a href="#" className="text-white/80 underline hover:text-accent transition-colors">Aviso de Privacidad</a> y Términos de Servicio.
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-black text-base uppercase tracking-widest px-10 py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,42,42,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Suscribirme Ahora
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
