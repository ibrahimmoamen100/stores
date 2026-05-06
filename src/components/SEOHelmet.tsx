import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface SEOHelmetProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    productData?: {
        name: string;
        brand?: string;
        price?: number;
        currency?: string;
        availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
        condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
        sku?: string;
    };
}

export const SEOHelmet = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    productData,
}: SEOHelmetProps) => {
    const { settings } = useSiteSettings();

    const baseUrl = settings.seoBaseUrl || 'https://www.شركة الحشومي.com';
    const storeName = settings.storeName || 'شركة الحشومي';
    const defTitle = settings.seoTitle || `${storeName} | لابتوب وكمبيوتر أصلي`;
    const defDesc = settings.seoDescription || '';
    const defKw = settings.seoKeywords || '';
    const defImage = settings.seoImage || settings.logoUrl || '/logo1.png';

    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
    const absImage = image
        ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
        : (defImage.startsWith('http') ? defImage : `${baseUrl}${defImage}`);

    const pageTitle = title ? `${title} | ${storeName}` : defTitle;
    const pageDescription = description || defDesc;
    const pageKeywords = keywords || defKw;

    // Product Schema
    const productSchema = productData ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": productData.name,
        "image": absImage,
        "description": pageDescription,
        "sku": productData.sku || '',
        "brand": { "@type": "Brand", "name": productData.brand || storeName },
        "offers": {
            "@type": "Offer",
            "url": fullUrl,
            "priceCurrency": productData.currency || "EGP",
            "price": productData.price || 0,
            "availability": `https://schema.org/${productData.availability || 'InStock'}`,
            "itemCondition": `https://schema.org/${productData.condition || 'NewCondition'}`,
            "seller": { "@type": "Organization", "name": storeName }
        }
    } : null;

    // BreadcrumbList
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": baseUrl },
            ...(url && url !== '/' ? [{
                "@type": "ListItem",
                "position": 2,
                "name": title || 'صفحة',
                "item": fullUrl
            }] : [])
        ]
    };

    // WebSite Schema
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": storeName,
        "alternateName": "شركة الحشومي",
        "url": baseUrl
    };

    return (
        <Helmet>
            {/* Primary */}
            <title>{pageTitle}</title>
            <meta name="title" content={pageTitle} />
            <meta name="description" content={pageDescription} />
            {pageKeywords && <meta name="keywords" content={pageKeywords} />}

            {/* Favicon */}
            {settings.faviconUrl && <link rel="icon" href={settings.faviconUrl} />}

            {/* Canonical */}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={absImage} />
            <meta property="og:site_name" content={storeName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={absImage} />

            {/* Structured Data */}
            {productSchema && (
                <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
            )}
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        </Helmet>
    );
};
