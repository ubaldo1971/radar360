# 📰 Radar360 — Portal de Noticias

Portal de noticias moderno construido con **React 19 + Vite + Tailwind CSS 4**, con panel de administración, transmisión en vivo, sistema de anuncios y suscripciones.

🌐 **Sitio en vivo:** [https://radar360-portal-ubaldo.web.app](https://radar360-portal-ubaldo.web.app)

---

## 🚀 Arranque Rápido

### Requisitos
- **Node.js** v18 o superior
- **npm** v9 o superior

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/ubaldo1971/radar360.git
cd radar360

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

El portal estará disponible en **http://localhost:5173/**

---

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Genera el build de producción en `/dist` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint para verificar el código |

---

## 🔥 Deploy a Firebase Hosting

```bash
# 1. Build de producción
npm run build

# 2. Deploy
npx firebase-tools deploy --only hosting --project radar360-portal-ubaldo
```

---

## 🔐 Panel de Administración

Accede en: `/admin`  
**Contraseña:** `radar3602026`

### Funcionalidades del Admin:
- **Dashboard** — Métricas generales del portal
- **Suscripciones** — Gestión de suscriptores
- **Anuncios** — Publicación y moderación de anuncios
- **Precios** — Configuración de planes de publicidad
- **Secciones** — Administración de secciones del portal
- **Redacción** — Editor de artículos
- **Canal en Vivo** — Selector de canal de noticias para la sección "En Vivo"

---

## 🛠️ Stack Tecnológico

- **React 19** — UI con componentes funcionales
- **Vite 7** — Build tool ultrarrápido
- **Tailwind CSS 4** — Estilos utility-first
- **React Router 7** — Navegación SPA
- **Firebase Hosting** — Hosting de producción
- **localStorage** — Persistencia de configuración del admin

---

## 📁 Estructura del Proyecto

```
radar360/
├── public/              # Assets estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── LiveStream.jsx    # Transmisión en vivo (YouTube)
│   │   ├── Sidebar.jsx
│   │   ├── SectionGrid.jsx
│   │   └── ...
│   ├── pages/           # Páginas principales
│   │   ├── Home.jsx
│   │   ├── Admin.jsx         # Panel de administración
│   │   ├── ArticlePage.jsx
│   │   └── ...
│   ├── data/            # Datos y store
│   │   ├── mockData.js
│   │   └── store.js
│   ├── App.jsx          # Router principal
│   └── index.css        # Estilos globales
├── firebase.json        # Config de Firebase Hosting
├── .firebaserc          # Proyecto Firebase activo
├── vite.config.js       # Config de Vite
└── package.json
```
