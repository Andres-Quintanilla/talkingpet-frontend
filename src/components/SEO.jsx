import { Helmet } from 'react-helmet-async';

export default function SEO({
    title = 'TalkingPet - Todo para tu Mascota',
    description = 'Productos, servicios veterinarios, peluquería, adiestramiento y más para el cuidado de tu mascota. Innovación con tapetes de botones. Servicios a domicilio en Bolivia.',
    url = 'http://localhost:5173/',
    image = '/imagenes/logo-talkingpet.svg',
    type = 'website',
    keywords = 'mascotas, veterinaria, peluquería canina, productos para mascotas, adiestramiento, tapetes de botones, servicios a domicilio, Bolivia',
    author = 'TalkingPet',
    locale = 'es_BO',
    structuredData = null,
}) {
    const fullTitle = title.includes('TalkingPet') ? title : `${title} | TalkingPet`;
    const siteUrl = url.startsWith('http') ? url : `http://localhost:5173${url}`;
    const imageUrl = image.startsWith('http') ? image : `http://localhost:5173${image}`;
    
    // Structured Data por defecto (Organization)
    const defaultStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'TalkingPet',
        url: 'http://localhost:5173',
        logo: 'http://localhost:5173/imagenes/logo-talkingpet.svg',
        description: 'Productos y servicios integrales para el cuidado de mascotas en Bolivia',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'BO',
            addressLocality: 'Santa Cruz',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: 'Spanish',
        },
        sameAs: [
            'https://facebook.com/talkingpet',
            'https://instagram.com/talkingpet',
        ],
    };
    
    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <link rel="canonical" href={siteUrl} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="TalkingPet" />
            <meta property="og:locale" content={locale} />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:site" content="@TalkingPet" />
            <meta name="twitter:creator" content="@TalkingPet" />
            
            {/* Additional SEO */}
            <meta name="language" content="Spanish" />
            <meta name="revisit-after" content="7 days" />
            <meta name="distribution" content="global" />
            <meta name="rating" content="general" />
            
            {/* Mobile App */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="TalkingPet" />
            
            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData || defaultStructuredData)}
            </script>
        </Helmet>
    );
}
