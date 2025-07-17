import React from 'react';
import { Helmet } from 'react-helmet-async';
import { config } from '@/config/environment';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'مندلين - منصة الخدمات الموحدة للمواطن',
  description = 'منصة مندلين توفر خدمات ذكية موحدة للمواطنين من خلال الذكاء الاصطناعي. تواصل مع الحكومة والمنظمات والفنادق والمستشفيات وخدمات السفر بسهولة.',
  keywords = 'مندلين، خدمات ذكية، ذكاء اصطناعي، الأردن، خدمات حكومية، فنادق، مستشفيات، سفر، منظمات غير حكومية',
  image = '/placeholder.svg',
  url = window.location.href,
  type = 'website',
  noIndex = false
}) => {
  const fullTitle = title.includes('مندلين') ? title : `${title} | مندلين`;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Mandaleen Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Language and Direction */}
      <html lang="ar" dir="rtl" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="مندلين" />
      <meta property="og:locale" content="ar_JO" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* App-specific Meta Tags */}
      <meta name="application-name" content={config.appName} />
      <meta name="apple-mobile-web-app-title" content={config.appName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#ea580c" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data for Arabic Content */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "مندلين",
          "alternateName": "Mandaleen",
          "url": window.location.origin,
          "description": description,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "inLanguage": "ar",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "JOD"
          },
          "author": {
            "@type": "Organization",
            "name": "Mandaleen Team"
          }
        })}
      </script>
    </Helmet>
  );
};