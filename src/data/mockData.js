/**
 * Mock data for Radar360 news portal.
 * All content is placeholder — no real news content.
 */

export const categories = [
    { id: 'home', label: 'Inicio', path: '/' },
    { id: 'politics', label: 'Política', path: '/politica' },
    { id: 'economy', label: 'Economía', path: '/economia' },
    { id: 'sports', label: 'Deportes', path: '/deportes' },
    { id: 'technology', label: 'Tecnología', path: '/tecnologia' },
    { id: 'culture', label: 'Cultura', path: '/cultura' },
];

export const featuredArticle = {
    id: 1,
    title: 'Última Hora: Gran Escándalo Político Sacude la Capital del País',
    excerpt:
        'Las autoridades investigan presuntas irregularidades en contratos gubernamentales que podrían involucrar a varios funcionarios de alto rango. La investigación continúa con nuevas revelaciones cada día.',
    category: 'Política',
    author: 'María González',
    date: '22 Feb 2026',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=600&fit=crop',
    readTime: '8 min',
    socialNetworks: { facebookUrl: '#', twitterUrl: '#', instagramUrl: '#' }
};

export const articles = [
    {
        id: 2,
        title: 'Actualización Económica: Cambios en el Mercado Global',
        excerpt:
            'Los principales indicadores financieros muestran tendencias mixtas mientras los inversores evalúan el impacto de las nuevas políticas comerciales.',
        category: 'Economía',
        author: 'Carlos Ramírez',
        date: '22 Feb 2026',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
        readTime: '5 min',
        socialNetworks: { facebookUrl: '#', twitterUrl: '#' }
    },
    {
        id: 3,
        title: 'Deportes: Equipo Local Consigue Victoria Histórica',
        excerpt:
            'Con un marcador contundente, el equipo local se posiciona como favorito para la fase final del torneo nacional.',
        category: 'Deportes',
        author: 'Roberto Herrera',
        date: '21 Feb 2026',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
        readTime: '4 min',
        socialNetworks: { instagramUrl: '#' }
    },
    {
        id: 4,
        title: 'Tecnología: Nueva Inteligencia Artificial Revoluciona la Industria',
        excerpt:
            'Investigadores presentan un modelo de IA capaz de resolver problemas complejos en tiempo récord, marcando un antes y después.',
        category: 'Tecnología',
        author: 'Ana Martínez',
        date: '21 Feb 2026',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
        readTime: '6 min',
    },
    {
        id: 5,
        title: 'Crisis Financiera: Bolsa de Valores Registra Caída Significativa',
        excerpt:
            'Los mercados internacionales reaccionan ante la incertidumbre geopolítica con una jornada marcada por la volatilidad.',
        category: 'Economía',
        author: 'Luis Fernández',
        date: '20 Feb 2026',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop',
        readTime: '5 min',
    },
    {
        id: 6,
        title: 'Elecciones: Partidos Anuncian Candidatos para Próximos Comicios',
        excerpt:
            'Las principales fuerzas políticas definen sus estrategias de cara a las elecciones nacionales del próximo año.',
        category: 'Política',
        author: 'Patricia López',
        date: '20 Feb 2026',
        image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&h=400&fit=crop',
        readTime: '7 min',
    },
    {
        id: 7,
        title: 'Cultura: Festival Internacional de Cine Anuncia Programación',
        excerpt:
            'Más de 200 películas de 45 países serán exhibidas durante la próxima edición del reconocido festival cinematográfico.',
        category: 'Cultura',
        author: 'Diana Torres',
        date: '19 Feb 2026',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop',
        readTime: '4 min',
    },
    {
        id: 8,
        title: 'Deportes: Selección Nacional Prepara Estrategia para Eliminatorias',
        excerpt:
            'El cuerpo técnico confirma la convocatoria de 26 jugadores para los partidos decisivos del próximo mes.',
        category: 'Deportes',
        author: 'Miguel Ángel Ruiz',
        date: '19 Feb 2026',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop',
        readTime: '3 min',
    },
    {
        id: 9,
        title: 'Ciencia: Descubrimiento Astronómico Sorprende a la Comunidad Científica',
        excerpt:
            'Telescopios espaciales captan señales inusuales provenientes de una galaxia a millones de años luz de distancia.',
        category: 'Tecnología',
        author: 'Sofía Navarro',
        date: '18 Feb 2026',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop',
        readTime: '6 min',
    },
    {
        id: 10,
        title: 'Economía: Nuevo Programa de Estímulo Fiscal Beneficiará a Pymes',
        excerpt:
            'El gobierno anuncia un paquete de medidas para impulsar la reactivación económica de las pequeñas y medianas empresas.',
        category: 'Economía',
        author: 'Jorge Castillo',
        date: '18 Feb 2026',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
        readTime: '5 min',
    },
    {
        id: 11,
        title: 'Cultura: Exposición de Arte Contemporáneo Llega a la Ciudad',
        excerpt:
            'Artistas de renombre internacional presentarán sus obras más recientes en una muestra que promete cautivar al público.',
        category: 'Cultura',
        author: 'Valentina Méndez',
        date: '17 Feb 2026',
        image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=400&fit=crop',
        readTime: '4 min',
    },
    {
        id: 12,
        title: 'Política: Reforma Educativa Genera Debate en el Congreso',
        excerpt:
            'Legisladores de distintos partidos discuten los alcances de la propuesta que busca transformar el sistema educativo nacional.',
        category: 'Política',
        author: 'Fernando Reyes',
        date: '17 Feb 2026',
        image: 'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=600&h=400&fit=crop',
        readTime: '6 min',
    },
];

export const trendingTopics = [
    'Elecciones 2026',
    'Presupuesto Nacional',
    'Cambio Climático',
    'Reforma Fiscal',
    'Inteligencia Artificial',
    'Crisis Energética',
];

export const socialLinks = [
    { id: 'facebook', label: 'Facebook', url: '#' },
    { id: 'twitter', label: 'Twitter', url: '#' },
    { id: 'instagram', label: 'Instagram', url: '#' },
    { id: 'linkedin', label: 'LinkedIn', url: '#' },
];
