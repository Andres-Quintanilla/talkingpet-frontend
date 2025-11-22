import { Helmet } from 'react-helmet-async';

export default function SEO({
    title = 'TalkingPet',
    description = 'Tienda, servicios y cursos para tu mascota.',
    url = 'http://localhost:5173/',
    image = '/images/hero.svg',
}) {
    const fullTitle = `${title} | TalkingPet`;
    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
    );
}
