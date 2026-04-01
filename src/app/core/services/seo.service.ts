import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface StructuredData {
  context: string;
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private defaultSEOData: SEOData = {
    title: 'OUR-Bikes Store - Professional Motorcycle E-Commerce',
    description: 'Professional motorcycle e-commerce platform with advanced features. Browse our extensive catalog of motorcycles, accessories, and gear.',
    keywords: 'motorcycles, motorcycle accessories, bike gear, motorcycle store, professional bikes',
    author: 'OUR-Bikes Store',
    image: '/assets/images/og-image.jpg',
    type: 'website',
    siteName: 'OUR-Bikes Store',
    locale: 'en_US',
    noIndex: false,
    noFollow: false
  };

  constructor(
    private title: Title,
    private meta: Meta
  ) {
    this.initializeSEO();
  }

  private initializeSEO(): void {
    this.setSEO(this.defaultSEOData);
  }

  // Main SEO methods
  setSEO(data: SEOData): void {
    const seoData = { ...this.defaultSEOData, ...data };

    // Set page title
    this.setTitle(seoData.title || '');

    // Set meta tags
    this.setMetaTags(seoData);

    // Set Open Graph tags
    this.setOpenGraphTags(seoData);

    // Set Twitter Card tags
    this.setTwitterCardTags(seoData);

    // Set canonical URL
    if (seoData.canonical) {
      this.setCanonicalUrl(seoData.canonical);
    }

    // Set robots meta
    this.setRobotsMeta(seoData.noIndex || false, seoData.noFollow || false);
  }

  setTitle(title: string): void {
    const fullTitle = title ? `${title} | ${this.defaultSEOData.siteName}` : this.defaultSEOData.title!;
    this.title.setTitle(fullTitle);
  }

  private setMetaTags(data: SEOData): void {
    // Update or create meta tags
    this.updateMetaTag('description', data.description || '');
    this.updateMetaTag('keywords', data.keywords || '');
    this.updateMetaTag('author', data.author || '');
  }

  private setOpenGraphTags(data: SEOData): void {
    // Open Graph basic tags
    this.updateMetaProperty('og:title', data.title || '');
    this.updateMetaProperty('og:description', data.description || '');
    this.updateMetaProperty('og:image', data.image || '');
    this.updateMetaProperty('og:url', data.url || '');
    this.updateMetaProperty('og:type', data.type || 'website');
    this.updateMetaProperty('og:site_name', data.siteName || '');
    this.updateMetaProperty('og:locale', data.locale || 'en_US');

    // Open Graph additional tags
    this.updateMetaProperty('og:image:width', '1200');
    this.updateMetaProperty('og:image:height', '630');
    this.updateMetaProperty('og:image:alt', data.title || 'OUR-Bikes Store');
  }

  private setTwitterCardTags(data: SEOData): void {
    // Twitter Card basic tags
    this.updateMetaProperty('twitter:card', 'summary_large_image');
    this.updateMetaProperty('twitter:title', data.title || '');
    this.updateMetaProperty('twitter:description', data.description || '');
    this.updateMetaProperty('twitter:image', data.image || '');
    this.updateMetaProperty('twitter:site', '@ourbikesstore');
    this.updateMetaProperty('twitter:creator', '@ourbikesstore');
  }

  private setCanonicalUrl(url: string): void {
    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  private setRobotsMeta(noIndex: boolean, noFollow: boolean): void {
    const content = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;
    this.updateMetaTag('robots', content);
  }

  private updateMetaTag(name: string, content: string): void {
    try {
      // Remove existing tag first
      this.meta.removeTag(`name='${name}'`);
      // Add new tag
      this.meta.addTag({ name, content });
    } catch (error) {
      console.warn('Failed to update meta tag:', { name, content, error });
    }
  }

  private updateMetaProperty(property: string, content: string): void {
    try {
      // Remove existing tag first
      this.meta.removeTag(`property='${property}'`);
      // Add new tag
      this.meta.addTag({ property, content });
    } catch (error) {
      console.warn('Failed to update meta property:', { property, content, error });
    }
  }

  // Structured Data (JSON-LD)
  setStructuredData(structuredData: StructuredData): void {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': structuredData.context,
      '@type': structuredData.type,
      ...structuredData.data
    });
    document.head.appendChild(script);
  }

  // Product-specific SEO
  setProductSEO(product: any): void {
    const seoData: SEOData = {
      title: `${product.name} - ${product.brand} | OUR-Bikes Store`,
      description: this.generateProductDescription(product),
      keywords: this.generateProductKeywords(product),
      image: product.images?.[0] || this.defaultSEOData.image,
      url: `/product/${product.id}`,
      type: 'product'
    };

    this.setSEO(seoData);

    // Product structured data
    const structuredData: StructuredData = {
      context: 'https://schema.org',
      type: 'Product',
      data: {
        name: product.name,
        description: product.description,
        brand: {
          '@type': 'Brand',
          name: product.brand
        },
        category: product.category,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        },
        image: product.images || [this.defaultSEOData.image]
      }
    };

    this.setStructuredData(structuredData);
  }

  // Category-specific SEO
  setCategorySEO(category: string, products: any[] = []): void {
    const seoData: SEOData = {
      title: `${category} Motorcycles & Accessories | OUR-Bikes Store`,
      description: `Browse our extensive collection of ${category.toLowerCase()} motorcycles, accessories, and gear. Find the perfect ${category.toLowerCase()} for your needs.`,
      keywords: `${category}, ${category} motorcycles, ${category} accessories, ${category} gear, professional ${category}`,
      url: `/products?category=${category.toLowerCase()}`,
      type: 'website'
    };

    this.setSEO(seoData);

    // Category structured data
    const structuredData: StructuredData = {
      context: 'https://schema.org',
      type: 'CollectionPage',
      data: {
        name: `${category} Collection`,
        description: seoData.description,
        numberOfItems: products.length,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: products.length,
          itemListElement: products.slice(0, 10).map((product, index) => ({
            '@type': 'Product',
            position: index + 1,
            name: product.name,
            url: `/product/${product.id}`,
            image: product.images?.[0] || this.defaultSEOData.image
          }))
        }
      }
    };

    this.setStructuredData(structuredData);
  }

  // Homepage SEO
  setHomepageSEO(): void {
    const seoData: SEOData = {
      title: 'OUR-Bikes Store - Professional Motorcycle E-Commerce Platform',
      description: 'Discover premium motorcycles, accessories, and gear at OUR-Bikes Store. Professional e-commerce platform with advanced features, secure checkout, and worldwide shipping.',
      keywords: 'motorcycles, motorcycle accessories, bike gear, motorcycle store, professional bikes, e-commerce',
      url: '/',
      type: 'website'
    };

    this.setSEO(seoData);

    // Website structured data
    const structuredData: StructuredData = {
      context: 'https://schema.org',
      type: 'WebSite',
      data: {
        name: 'OUR-Bikes Store',
        description: seoData.description,
        url: '/',
        potentialAction: {
          '@type': 'SearchAction',
          target: '/products?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    };

    this.setStructuredData(structuredData);
  }

  // Checkout SEO (usually noindex)
  setCheckoutSEO(): void {
    const seoData: SEOData = {
      title: 'Checkout - Complete Your Purchase | OUR-Bikes Store',
      description: 'Complete your purchase securely at OUR-Bikes Store. Fast checkout with multiple payment options.',
      keywords: 'checkout, purchase, buy, secure payment',
      url: '/checkout',
      type: 'website',
      noIndex: true,
      noFollow: true
    };

    this.setSEO(seoData);
  }

  // Helper methods
  private generateProductDescription(product: any): string {
    const features = product.features?.slice(0, 3).join(', ') || '';
    return `Shop ${product.name} by ${product.brand}. ${product.category} with ${features}. Professional quality at competitive prices. Free shipping on orders over $100.`;
  }

  private generateProductKeywords(product: any): string {
    const keywords = [
      product.name,
      product.brand,
      product.category,
      product.model,
      product.year?.toString(),
      product.color,
      'motorcycle',
      'bike',
      'professional',
      'quality'
    ].filter(Boolean);

    return keywords.join(', ');
  }

  // Remove all SEO tags (useful for testing)
  clearSEO(): void {
    // Clear title
    this.title.setTitle('');

    // Clear meta tags
    const metaTags = document.querySelectorAll('meta[name], meta[property]');
    metaTags.forEach(tag => tag.remove());

    // Clear canonical link
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.remove();

    // Clear structured data
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) structuredData.remove();
  }

  // Get current SEO data (useful for debugging)
  getCurrentSEOData(): any {
    return {
      title: this.title.getTitle(),
      description: this.meta.getTag('name="description"')?.content || '',
      keywords: this.meta.getTag('name="keywords"')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      robots: this.meta.getTag('name="robots"')?.content || ''
    };
  }
}
