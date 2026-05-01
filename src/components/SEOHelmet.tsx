import { Helmet } from 'react-helmet-async';
import seoData from '@/constants/seo.json';

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
    image = 'https://compu-saif.vercel.app/logo1.png',
    url,
    type = 'website',
    productData,
}: SEOHelmetProps) => {
    const baseUrl = seoData.global.baseUrl;
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

    const defaultTitle = seoData.global.defaultTitle;
    const defaultDescription = seoData.global.defaultDescription;
    const defaultKeywords = seoData.global.defaultKeywords;

    const pageTitle = title ? `${title} | ElHashimi` : defaultTitle;
    const pageDescription = description || defaultDescription;
    const pageKeywords = keywords || defaultKeywords;

    // Create Product Schema if productData is provided
    const productSchema = productData ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": productData.name,
        "image": image,
        "description": pageDescription,
        "sku": productData.sku || '',
        "brand": {
            "@type": "Brand",
            "name": productData.brand || 'Unknown'
        },
        "offers": {
            "@type": "Offer",
            "url": fullUrl,
            "priceCurrency": productData.currency || "EGP",
            "price": productData.price || 0,
            "availability": `https://schema.org/${productData.availability || 'InStock'}`,
            "itemCondition": `https://schema.org/${productData.condition || 'NewCondition'}`,
            "seller": {
                "@type": "Organization",
                "name": "ElHashimi"
            }
        }
    } : null;

    // Create BreadcrumbList Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "الرئيسية",
                "item": baseUrl
            },
            ...(url && url !== '/' ? [{
                "@type": "ListItem",
                "position": 2,
                "name": title || 'صفحة',
                "item": fullUrl
            }] : [])
        ]
    };

    // Create WebSite Schema for Google Site Name
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ElHashimi",
        "alternateName": "الحشومي",
        "url": baseUrl
    };

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="title" content={pageTitle} />
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="ElHashimi" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={image} />

            {/* Product Schema if available */}
            {productSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(productSchema)}
                </script>
            )}

            {/* Breadcrumb Schema */}
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>

            {/* WebSite Schema for Site Name */}
            <script type="application/ld+json">
                {JSON.stringify(websiteSchema)}
            </script>
        </Helmet>
    );
};
