#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Configurando seguridad para App Stores...\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function createFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content);
  log(`✅ Creado: ${filePath}`, 'green');
}

// Configurar Content Security Policy
function configureCSP() {
  log('🛡️  Configurando Content Security Policy...', 'yellow');
  
  const cspContent = `default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
media-src 'self' data: https: blob:;
connect-src 'self' https://jfwhgjojlmltcbplnbrm.supabase.co https://api.openai.com https://www.google-analytics.com https://api.stripe.com wss://jfwhgjojlmltcbplnbrm.supabase.co;
frame-src https://js.stripe.com https://hooks.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;`;
  
  createFile('public/csp.txt', cspContent);
  
  // Agregar CSP al index.html
  const indexPath = 'index.html';
  if (checkFileExists(indexPath)) {
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    if (!htmlContent.includes('Content-Security-Policy')) {
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${cspContent.replace(/\n/g, ' ')}">`;
      htmlContent = htmlContent.replace('<head>', `<head>\n    ${cspMeta}`);
      fs.writeFileSync(indexPath, htmlContent);
      log('✅ CSP agregado al index.html', 'green');
    } else {
      log('ℹ️  CSP ya está configurado en index.html', 'blue');
    }
  }
}

// Configurar headers de seguridad
function configureSecurityHeaders() {
  log('🔐 Configurando headers de seguridad...', 'yellow');
  
  const headersContent = `# Headers de Seguridad para Veo Veo Vision
# Configuración para App Stores

# Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' data: https: blob:; connect-src 'self' https://jfwhgjojlmltcbplnbrm.supabase.co https://api.openai.com https://www.google-analytics.com https://api.stripe.com wss://jfwhgjojlmltcbplnbrm.supabase.co; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests

# X-Frame-Options (previene clickjacking)
X-Frame-Options: DENY

# X-Content-Type-Options (previene MIME sniffing)
X-Content-Type-Options: nosniff

# X-XSS-Protection (protección XSS para navegadores antiguos)
X-XSS-Protection: 1; mode=block

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy (anteriormente Feature Policy)
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# Strict-Transport-Security (HSTS)
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Cache Control para recursos estáticos
Cache-Control: public, max-age=31536000, immutable

# Cross-Origin Resource Policy
Cross-Origin-Resource-Policy: same-origin

# Cross-Origin Embedder Policy
Cross-Origin-Embedder-Policy: require-corp

# Cross-Origin Opener Policy
Cross-Origin-Opener-Policy: same-origin`;
  
  createFile('security-headers.conf', headersContent);
}

// Configurar manifest.json para PWA
function configurePWA() {
  log('📱 Configurando PWA...', 'yellow');
  
  const manifestContent = {
    "name": "Veo Veo Vision",
    "short_name": "VeoVeo",
    "description": "Juego de adivinanzas con IA usando fotos",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a1a1a",
    "theme_color": "#6366f1",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "es",
    "categories": ["games", "entertainment", "social"],
    "icons": [
      {
        "src": "/app-icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/app-icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "screenshots": [
      {
        "src": "/screenshots/phone-1.png",
        "sizes": "390x844",
        "type": "image/png",
        "form_factor": "narrow"
      },
      {
        "src": "/screenshots/tablet-1.png",
        "sizes": "1024x1366",
        "type": "image/png",
        "form_factor": "wide"
      }
    ]
  };
  
  createFile('public/manifest.json', JSON.stringify(manifestContent, null, 2));
}

// Configurar robots.txt
function configureRobots() {
  log('🤖 Configurando robots.txt...', 'yellow');
  
  const robotsContent = `# Robots.txt para Veo Veo Vision
User-agent: *
Allow: /

# Permitir indexación de páginas públicas
Allow: /public-rooms
Allow: /leaderboards

# Bloquear páginas privadas
Disallow: /room/
Disallow: /game/
Disallow: /profile
Disallow: /friends
Disallow: /premium

# Sitemap
Sitemap: https://tu-dominio.com/sitemap.xml`;
  
  createFile('public/robots.txt', robotsContent);
}

// Configurar sitemap.xml
function configureSitemap() {
  log('🗺️  Configurando sitemap.xml...', 'yellow');
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tu-dominio.com/</loc>
    <lastmod>2025-01-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tu-dominio.com/public-rooms</loc>
    <lastmod>2025-01-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tu-dominio.com/leaderboards</loc>
    <lastmod>2025-01-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tu-dominio.com/premium</loc>
    <lastmod>2025-01-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
  
  createFile('public/sitemap.xml', sitemapContent);
}

// Configurar .htaccess para Apache
function configureHtaccess() {
  log('🌐 Configurando .htaccess...', 'yellow');
  
  const htaccessContent = `# Configuración de seguridad para Veo Veo Vision
# Headers de seguridad
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Cross-Origin-Resource-Policy "same-origin"
    Header always set Cross-Origin-Embedder-Policy "require-corp"
    Header always set Cross-Origin-Opener-Policy "same-origin"
</IfModule>

# Redirección HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Compresión GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache para recursos estáticos
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# SPA routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>`;
  
  createFile('public/.htaccess', htaccessContent);
}

// Configurar nginx.conf
function configureNginx() {
  log('🐘 Configurando nginx.conf...', 'yellow');
  
  const nginxContent = `# Configuración de Nginx para Veo Veo Vision
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    # Root directory
    root /var/www/veoveovision;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Cache static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass https://jfwhgjojlmltcbplnbrm.supabase.co/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;
  
  createFile('nginx.conf', nginxContent);
}

// Verificar configuraciones
function verifyConfigurations() {
  log('🔍 Verificando configuraciones...', 'yellow');
  
  const configs = [
    'public/csp.txt',
    'security-headers.conf',
    'public/manifest.json',
    'public/robots.txt',
    'public/sitemap.xml',
    'public/.htaccess',
    'nginx.conf'
  ];
  
  const missing = configs.filter(config => !checkFileExists(config));
  
  if (missing.length > 0) {
    log(`❌ Configuraciones faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todas las configuraciones de seguridad están presentes', 'green');
  return true;
}

// Función principal
async function main() {
  log('🔒 Veo Veo Vision - Configuración de Seguridad', 'green');
  log('==============================================\n', 'green');
  
  // Configurar CSP
  configureCSP();
  
  // Configurar headers de seguridad
  configureSecurityHeaders();
  
  // Configurar PWA
  configurePWA();
  
  // Configurar SEO
  configureRobots();
  configureSitemap();
  
  // Configurar servidores web
  configureHtaccess();
  configureNginx();
  
  // Verificar configuraciones
  if (verifyConfigurations()) {
    log('\n🎉 ¡Configuración de seguridad completada!', 'green');
    log('\n📋 Resumen de configuraciones:', 'yellow');
    log('   ✅ Content Security Policy (CSP)');
    log('   ✅ Headers de seguridad');
    log('   ✅ PWA Manifest');
    log('   ✅ Robots.txt');
    log('   ✅ Sitemap.xml');
    log('   ✅ .htaccess (Apache)');
    log('   ✅ nginx.conf');
    
    log('\n⚠️  Acciones requeridas:', 'yellow');
    log('   1. Reemplazar "tu-dominio.com" con tu dominio real');
    log('   2. Configurar certificados SSL');
    log('   3. Generar iconos de la aplicación');
    log('   4. Capturar screenshots');
    log('   5. Configurar webhooks de Stripe');
    
    log('\n📚 Documentación:', 'blue');
    log('   - APP_STORE_COMPLIANCE_CHECKLIST.md');
    log('   - APP_ICONS_GUIDE.md');
    log('   - APP_SCREENSHOTS_GUIDE.md');
  } else {
    log('\n❌ Error en la configuración de seguridad', 'red');
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    log(`❌ Error en el script: ${error}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  configureCSP,
  configureSecurityHeaders,
  configurePWA,
  configureRobots,
  configureSitemap,
  configureHtaccess,
  configureNginx,
  verifyConfigurations
};
