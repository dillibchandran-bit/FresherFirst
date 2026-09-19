import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'job';
  imageUrl?: string;
  schema?: Record<string, any>;
}

export default function SEO({ title, description, canonicalUrl, type = 'website', imageUrl, schema }: SEOProps) {
  const getSiteUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'https://fresher-first.vercel.app';
  };

  const siteUrl = getSiteUrl();
  const currentUrl = canonicalUrl ? `${siteUrl}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}` : siteUrl;
  const defaultImage = `${siteUrl}/og-image.jpg`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'job' ? 'website' : type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl || defaultImage} />

      {/* Structured Data (Schema.org / Google Jobs JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema, null, 2)}
        </script>
      )}
    </Helmet>
  );
}
