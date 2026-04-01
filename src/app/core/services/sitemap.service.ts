import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  constructor(private storageService: StorageService) {}

  generateSitemap(): string {
    const entries: SitemapEntry[] = [];
    const baseUrl = 'https://ourbikes-store.com'; // Replace with actual domain

    // Static pages
    entries.push(
      {
        url: baseUrl + '/',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: baseUrl + '/products',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: baseUrl + '/auth/login',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        url: baseUrl + '/auth/register',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      }
    );

    // Category pages
    const categories = ['Bikes', 'Accessories', 'Tools', 'Souvenirs'];
    categories.forEach(category => {
      entries.push({
        url: `${baseUrl}/products?category=${category.toLowerCase()}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Product pages
    const products = this.storageService.getProducts() as any[];
    products.forEach(product => {
      entries.push({
        url: `${baseUrl}/product/${product.id}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    // Generate XML sitemap
    return this.generateXMLSitemap(entries);
  }

  private generateXMLSitemap(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    entries.forEach(entry => {
      xml += '  <url>\n';
      xml += `    <loc>${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  generateRobotsTxt(): string {
    const baseUrl = 'https://ourbikes-store.com'; // Replace with actual domain
    
    let robots = 'User-agent: *\n';
    robots += 'Allow: /\n';
    robots += 'Disallow: /admin/\n';
    robots += 'Disallow: /auth/\n';
    robots += 'Disallow: /checkout/\n';
    robots += 'Disallow: /profile/\n';
    robots += 'Disallow: /favorites/\n';
    robots += 'Disallow: /comparison/\n';
    robots += 'Disallow: /*?*\n';
    robots += 'Disallow: /*/*?\n';
    robots += '\n';
    robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;
    
    return robots;
  }

  // Generate sitemap and download as file
  downloadSitemap(): void {
    const sitemap = this.generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generate robots.txt and download as file
  downloadRobotsTxt(): void {
    const robots = this.generateRobotsTxt();
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get sitemap entries for preview
  getSitemapEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    const baseUrl = 'https://ourbikes-store.com';

    // Static pages
    entries.push(
      {
        url: baseUrl + '/',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: baseUrl + '/products',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9
      }
    );

    // Category pages
    const categories = ['Bikes', 'Accessories', 'Tools', 'Souvenirs'];
    categories.forEach(category => {
      entries.push({
        url: `${baseUrl}/products?category=${category.toLowerCase()}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Product pages (limited to first 10 for preview)
    const products = this.storageService.getProducts() as any[];
    products.slice(0, 10).forEach(product => {
      entries.push({
        url: `${baseUrl}/product/${product.id}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    return entries;
  }
}
