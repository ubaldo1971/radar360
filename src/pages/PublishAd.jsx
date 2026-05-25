/**
 * PublishAd — Página completa para publicar un anuncio.
 * Drag & drop de fotos (máx 5, tamaño limitado), texto, datos del publicador,
 * descargo de responsabilidad, selección de plan y simulación de pago.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ads, pricing as pricingStore, adSections as sectionsStore } from '../data/store';

export default function PublishAd() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [plans, setPlans] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [disclaimer, setDisclaimer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        publisherName: '',
        publisherPhone: '',
        publisherEmail: '',
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
    });
    const [errors, setErrors] = useState({});

    const MAX_PHOTOS = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    useEffect(() => {
        setPlans(pricingStore.getAll().filter((p) => p.active));
        setSections(sectionsStore.getAll().filter((s) => s.active));
    }, []);

    /* Calcula precio total: base × multiplicador de sección */
    const getTotal = () => {
        const plan = plans.find((p) => p.id === selectedPlan);
        const section = sections.find((s) => s.id === selectedSection);
        if (!plan || !section) return null;
        return Math.round(plan.price * section.multiplier);
    };

    /* ── Manejo de archivos ── */
    const processFiles = useCallback((files) => {
        const valid = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            if (file.size > MAX_FILE_SIZE) {
                alert(`"${file.name}" excede 5 MB.`);
                continue;
            }
            if (photos.length + valid.length >= MAX_PHOTOS) {
                alert(`Máximo ${MAX_PHOTOS} fotos.`);
                break;
            }
            valid.push({
                id: Date.now() + Math.random(),
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
            });
        }
        setPhotos((prev) => [...prev, ...valid]);
    }, [photos.length]);

    const removePhoto = (id) => {
        setPhotos((prev) => {
            const photo = prev.find((p) => p.id === id);
            if (photo) URL.revokeObjectURL(photo.preview);
            return prev.filter((p) => p.id !== id);
        });
    };

    /* ── Drag & Drop ── */
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragIn = (e) => { handleDrag(e); setDragging(true); };
    const handleDragOut = (e) => { handleDrag(e); setDragging(false); };
    const handleDrop = (e) => {
        handleDrag(e);
        setDragging(false);
        if (e.dataTransfer.files?.length) processFiles(Array.from(e.dataTransfer.files));
    };

    /* ── Form handlers ── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'publisherPhone') {
            setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Requerido';
        if (!form.description.trim()) e.description = 'Requerido';
        if (!form.publisherName.trim()) e.publisherName = 'Requerido';
        if (form.publisherPhone.length !== 10) e.publisherPhone = '10 dígitos requeridos';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.publisherEmail)) e.publisherEmail = 'Email inválido';
        if (!selectedPlan) e.plan = 'Selecciona un plan';
        if (!selectedSection) e.section = 'Selecciona una sección';
        if (!disclaimer) e.disclaimer = 'Debes aceptar el descargo';
        if (photos.length === 0) e.photos = 'Agrega al menos 1 foto';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── Convertir imagen File a Base64 ── */
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        // Convertir todas las fotos a base64 para que persistan en localStorage
        const photoDataUrls = [];
        for (const photo of photos) {
            try {
                const base64 = await fileToBase64(photo.file);
                photoDataUrls.push(base64);
            } catch {
                // Si falla, intentar usar el preview URL existente
                photoDataUrls.push(photo.preview);
            }
        }

        const plan = plans.find((p) => p.id === selectedPlan);
        const section = sections.find((s) => s.id === selectedSection);
        const totalPrice = getTotal();
        ads.add({
            ...form,
            plan: plan?.name || '',
            planDays: plan?.days || 0,
            planBasePrice: plan?.price || 0,
            section: section?.name || '',
            sectionKey: section?.key || '',
            sectionMultiplier: section?.multiplier || 1,
            totalPrice: totalPrice || 0,
            photos: photoDataUrls,
            photosCount: photos.length,
            paymentStatus: 'completed',
        });

        setLoading(false);
        setSuccess(true);
    };

    /* ── Estado de éxito ── */
    if (success) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="bg-card rounded-3xl shadow-xl p-14 md:p-16 max-w-md text-center border border-border">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-text-primary mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        ¡Anuncio Enviado!
                    </h2>
                    <p className="text-text-muted text-sm mb-6">
                        Tu anuncio está en revisión. Recibirás confirmación en <strong>{form.publisherEmail}</strong>.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-card text-text-primary font-semibold rounded-xl hover:bg-card-light transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* Header bar */}
            <div className="bg-card text-text-primary">
                <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 py-5 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                    <h1 className="text-lg font-bold">Publicar Anuncio</h1>
                    <div className="w-16" />
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* ══ SECCIÓN 1: Fotos ══ */}
                    <div className="bg-card rounded-2xl shadow-lg border border-border" style={{ padding: '2rem 3rem' }}>
                        <h3 className="text-lg font-bold text-text-primary mb-2">📷 Fotos del Anuncio</h3>
                        <p className="text-text-secondary text-sm mb-6">Máximo {MAX_PHOTOS} fotos, 5 MB cada una. Formatos: JPG, PNG, WebP.</p>

                        {/* Drop zone */}
                        <div
                            onDragEnter={handleDragIn}
                            onDragLeave={handleDragOut}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragging
                                    ? 'border-accent bg-accent/5 scale-[1.02]'
                                    : errors.photos
                                        ? 'border-red-400 bg-red-500/10'
                                        : 'border-border hover:border-border hover:bg-slate-100 dark:bg-slate-800/50'
                                }
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => processFiles(Array.from(e.target.files))}
                            />
                            <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-semibold text-text-primary">
                                Arrastra tus fotos aquí o <span className="text-accent underline">selecciona archivos</span>
                            </p>
                            <p className="text-xs text-text-muted mt-1">{photos.length}/{MAX_PHOTOS} fotos</p>
                        </div>
                        {errors.photos && <p className="mt-2 text-red-500 text-xs">{errors.photos}</p>}

                        {/* Preview grid */}
                        {photos.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square">
                                        <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo.id)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-text-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ══ SECCIÓN 2: Información del anuncio ══ */}
                    <div className="bg-card rounded-2xl shadow-lg border border-border" style={{ padding: '2rem 3rem' }}>
                        <h3 className="text-lg font-bold text-text-primary" style={{ marginBottom: '1.5rem' }}>📝 Información del Anuncio</h3>
                        <div className="space-y-7">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>Título del Anuncio</label>
                                <input name="title" value={form.title} onChange={handleChange} placeholder="Ej: Venta de auto seminuevo..."
                                    className={`w-full px-5 py-3.5 rounded-xl border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${errors.title ? 'border-red-400' : 'border-border focus:border-accent'}`}
                                />
                                {errors.title && <p className="mt-1 text-red-400 text-xs">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>Descripción</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={15} placeholder="Describe tu anuncio con el mayor detalle posible..."
                                    className={`w-full px-5 py-3.5 rounded-xl border bg-surface text-text-primary text-sm outline-none transition-all resize-none focus:ring-2 focus:ring-accent/20 ${errors.description ? 'border-red-400' : 'border-border focus:border-accent'}`}
                                />
                                {errors.description && <p className="mt-1 text-red-400 text-xs">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 3: Datos del publicador ══ */}
                    <div className="bg-card rounded-2xl shadow-lg border border-border" style={{ padding: '2rem 3rem' }}>
                        <h3 className="text-lg font-bold text-text-primary" style={{ marginBottom: '1.5rem' }}>👤 Datos del Anunciante</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>Nombre Completo</label>
                                <input name="publisherName" value={form.publisherName} onChange={handleChange} placeholder="Tu nombre"
                                    className={`w-full px-5 py-3.5 rounded-xl border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${errors.publisherName ? 'border-red-400' : 'border-border focus:border-accent'}`}
                                />
                                {errors.publisherName && <p className="mt-1 text-red-400 text-xs">{errors.publisherName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>Teléfono (10 dígitos)</label>
                                <input name="publisherPhone" value={form.publisherPhone} onChange={handleChange} placeholder="6621234567" maxLength={10}
                                    className={`w-full px-5 py-3.5 rounded-xl border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${errors.publisherPhone ? 'border-red-400' : form.publisherPhone.length === 10 ? 'border-green-400' : 'border-border focus:border-accent'}`}
                                />
                                {errors.publisherPhone && <p className="mt-1 text-red-400 text-xs">{errors.publisherPhone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>Email</label>
                                <input name="publisherEmail" value={form.publisherEmail} onChange={handleChange} placeholder="correo@ejemplo.com"
                                    className={`w-full px-5 py-3.5 rounded-xl border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${errors.publisherEmail ? 'border-red-400' : 'border-border focus:border-accent'}`}
                                />
                                {errors.publisherEmail && <p className="mt-1 text-red-400 text-xs">{errors.publisherEmail}</p>}
                            </div>
                        </div>

                        {/* Redes Sociales del Anunciante */}
                        <div className="grid grid-cols-1 md:grid-cols-3 mt-6" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                                    Facebook (Opcional)
                                </label>
                                <input name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..."
                                    className="w-full px-5 py-3.5 rounded-xl border border-border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>
                                    <svg className="w-4 h-4 text-text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    X / Twitter (Opcional)
                                </label>
                                <input name="twitterUrl" value={form.twitterUrl} onChange={handleChange} placeholder="https://x.com/..."
                                    className="w-full px-5 py-3.5 rounded-xl border border-border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary" style={{ marginBottom: '0.5rem' }}>
                                    <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    Instagram (Opcional)
                                </label>
                                <input name="instagramUrl" value={form.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..."
                                    className="w-full px-5 py-3.5 rounded-xl border border-border bg-surface text-text-primary text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 4: Ubicación del anuncio ══ */}
                    <div className="bg-card rounded-2xl shadow-lg border border-border" style={{ padding: '2rem 3rem' }}>
                        <h3 className="text-lg font-bold text-text-primary mb-2">📍 ¿Dónde publicar tu anuncio?</h3>
                        <p className="text-text-secondary text-sm mb-6">El precio varía según la sección. El Hero es la posición con mayor visibilidad.</p>
                        {errors.section && <p className="mb-3 text-red-400 text-xs">{errors.section}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => { setSelectedSection(section.id); if (errors.section) setErrors((p) => ({ ...p, section: '' })); }}
                                    className={`
                                        relative rounded-xl border-2 text-left transition-all duration-200
                                        ${selectedSection === section.id
                                            ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                                            : 'border-border hover:border-border hover:bg-slate-100 dark:bg-slate-800/50'
                                        }
                                        ${section.key === 'hero' ? 'ring-2 ring-amber-400/30' : ''}
                                    `}
                                    style={{ padding: '1.5rem' }}
                                >
                                    {selectedSection === section.id && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-text-primary">{section.name}</p>
                                        {section.key === 'hero' && (
                                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded-full">Premium</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-muted mb-3">{section.description}</p>
                                    <p className="text-xs font-bold text-accent">×{section.multiplier} sobre precio base</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══ SECCIÓN 5: Plan de duración ══ */}
                    <div className="bg-card rounded-2xl shadow-lg border border-border" style={{ padding: '2rem 3rem' }}>
                        <h3 className="text-lg font-bold text-text-primary mb-6">💳 Plan de Duración</h3>
                        {errors.plan && <p className="mb-3 text-red-400 text-xs">{errors.plan}</p>}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {plans.map((plan) => {
                                const section = sections.find((s) => s.id === selectedSection);
                                const adjustedPrice = section ? Math.round(plan.price * section.multiplier) : plan.price;
                                return (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => { setSelectedPlan(plan.id); if (errors.plan) setErrors((p) => ({ ...p, plan: '' })); }}
                                        className={`
                                            relative rounded-2xl border-2 text-center transition-all duration-200 group
                                            ${selectedPlan === plan.id
                                                ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                                                : 'border-border hover:border-border hover:bg-slate-100 dark:bg-slate-800/50'
                                            }
                                        `}
                                        style={{ padding: '1.5rem' }}
                                    >
                                        {selectedPlan === plan.id && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        <p className="text-sm font-bold text-text-primary">{plan.name}</p>
                                        <p className="text-2xl font-black text-accent mt-2">${adjustedPrice.toLocaleString()}</p>
                                        <p className="text-xs text-text-muted mt-2">{plan.currency}</p>
                                        {section && section.multiplier !== 1 && (
                                            <p className="text-[10px] text-text-muted mt-2 line-through">${plan.price.toLocaleString()} base</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Resumen de precio */}
                        {getTotal() && (
                            <div className="mt-6 p-6 bg-surface/50 rounded-xl border border-border flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-text-primary">Total a pagar</p>
                                    <p className="text-xs text-text-muted">
                                        {plans.find((p) => p.id === selectedPlan)?.name} • {sections.find((s) => s.id === selectedSection)?.name}
                                    </p>
                                </div>
                                <p className="text-3xl font-black text-accent">${getTotal().toLocaleString()} <span className="text-sm">MXN</span></p>
                            </div>
                        )}
                    </div>

                    {/* ══ SECCIÓN 6: Descargo de responsabilidad ══ */}
                    <div className="bg-card rounded-2xl shadow-lg border border-border" style={{ padding: '2rem 3rem' }}>
                        <h3 className="text-lg font-bold text-text-primary mb-4">⚖️ Descargo de Responsabilidad</h3>
                        <div className="bg-surface rounded-xl p-5 mb-5 text-xs text-text-secondary leading-relaxed max-h-36 overflow-y-auto">
                            <p className="mb-2">Al publicar este anuncio en Radar360, el anunciante declara y acepta que:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>El contenido publicado es responsabilidad exclusiva del anunciante.</li>
                                <li>Radar360 no se hace responsable por la veracidad, exactitud o legalidad del contenido publicado.</li>
                                <li>El anunciante garantiza tener los derechos sobre las imágenes y textos proporcionados.</li>
                                <li>Radar360 se reserva el derecho de rechazar, modificar o retirar cualquier anuncio sin previo aviso.</li>
                                <li>El pago realizado no es reembolsable una vez que el anuncio ha sido publicado.</li>
                                <li>El anunciante exime a Radar360 de cualquier responsabilidad legal derivada del contenido publicado.</li>
                            </ol>
                        </div>
                        <label className={`flex items-start gap-3 cursor-pointer group ${errors.disclaimer ? 'text-red-400' : ''}`}>
                            <input
                                type="checkbox"
                                checked={disclaimer}
                                onChange={(e) => { setDisclaimer(e.target.checked); if (errors.disclaimer) setErrors((p) => ({ ...p, disclaimer: '' })); }}
                                className="mt-0.5 w-5 h-5 rounded border-border bg-surface text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                He leído y acepto el descargo de responsabilidad de <strong>Radar360</strong>.
                            </span>
                        </label>
                        {errors.disclaimer && <p className="mt-1 text-red-400 text-xs">{errors.disclaimer}</p>}
                    </div>

                    {/* ══ Botón de envío ══ */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-text-primary font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Procesando Pago...
                                </>
                            ) : (
                                <>
                                    Publicar y Pagar {getTotal() ? `$${getTotal().toLocaleString()} MXN` : ''}
                                </>
                            )}
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="text-text-secondary text-sm hover:text-text-primary transition-colors">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
