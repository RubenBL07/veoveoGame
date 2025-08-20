#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Generando iconos para App Stores...\n');

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

// Generar SVG base del icono
function generateBaseIcon() {
  log('🎨 Generando icono base SVG...', 'yellow');
  
  const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  
  <!-- Círculo principal -->
  <circle cx="256" cy="256" r="180" fill="url(#primary)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Ojo izquierdo -->
  <circle cx="200" cy="220" r="25" fill="#ffffff"/>
  <circle cx="200" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="195" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Ojo derecho -->
  <circle cx="312" cy="220" r="25" fill="#ffffff"/>
  <circle cx="312" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="307" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Sonrisa -->
  <path d="M 180 280 Q 256 320 332 280" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"/>
  
  <!-- Elementos decorativos -->
  <circle cx="150" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="150" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  
  <!-- Brillo -->
  <circle cx="200" cy="200" r="60" fill="url(#primary)" opacity="0.3"/>
</svg>`;
  
  createFile('public/app-icons/icon-base.svg', svgContent);
}

// Generar iconos para iOS
function generateIOSIcons() {
  log('🍎 Generando iconos para iOS...', 'yellow');
  
  const iosSizes = [
    { name: 'icon-20x20', size: 20 },
    { name: 'icon-20x20@2x', size: 40 },
    { name: 'icon-20x20@3x', size: 60 },
    { name: 'icon-29x29', size: 29 },
    { name: 'icon-29x29@2x', size: 58 },
    { name: 'icon-29x29@3x', size: 87 },
    { name: 'icon-40x40', size: 40 },
    { name: 'icon-40x40@2x', size: 80 },
    { name: 'icon-40x40@3x', size: 120 },
    { name: 'icon-60x60@2x', size: 120 },
    { name: 'icon-60x60@3x', size: 180 },
    { name: 'icon-76x76', size: 76 },
    { name: 'icon-76x76@2x', size: 152 },
    { name: 'icon-83.5x83.5@2x', size: 167 },
    { name: 'icon-1024x1024', size: 1024 }
  ];
  
  iosSizes.forEach(icon => {
    const svgContent = `<svg width="${icon.size}" height="${icon.size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  
  <!-- Círculo principal -->
  <circle cx="256" cy="256" r="180" fill="url(#primary)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Ojo izquierdo -->
  <circle cx="200" cy="220" r="25" fill="#ffffff"/>
  <circle cx="200" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="195" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Ojo derecho -->
  <circle cx="312" cy="220" r="25" fill="#ffffff"/>
  <circle cx="312" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="307" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Sonrisa -->
  <path d="M 180 280 Q 256 320 332 280" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"/>
  
  <!-- Elementos decorativos -->
  <circle cx="150" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="150" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  
  <!-- Brillo -->
  <circle cx="200" cy="200" r="60" fill="url(#primary)" opacity="0.3"/>
</svg>`;
    
    createFile(`public/app-icons/ios/${icon.name}.svg`, svgContent);
  });
}

// Generar iconos para Android
function generateAndroidIcons() {
  log('🤖 Generando iconos para Android...', 'yellow');
  
  const androidSizes = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 },
    { name: 'play-store', size: 512 }
  ];
  
  androidSizes.forEach(icon => {
    const svgContent = `<svg width="${icon.size}" height="${icon.size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  
  <!-- Círculo principal -->
  <circle cx="256" cy="256" r="180" fill="url(#primary)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Ojo izquierdo -->
  <circle cx="200" cy="220" r="25" fill="#ffffff"/>
  <circle cx="200" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="195" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Ojo derecho -->
  <circle cx="312" cy="220" r="25" fill="#ffffff"/>
  <circle cx="312" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="307" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Sonrisa -->
  <path d="M 180 280 Q 256 320 332 280" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"/>
  
  <!-- Elementos decorativos -->
  <circle cx="150" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="150" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  
  <!-- Brillo -->
  <circle cx="200" cy="200" r="60" fill="url(#primary)" opacity="0.3"/>
</svg>`;
    
    createFile(`public/app-icons/android/${icon.name}.svg`, svgContent);
  });
}

// Generar iconos para PWA
function generatePWAIcons() {
  log('📱 Generando iconos para PWA...', 'yellow');
  
  const pwaSizes = [
    { name: 'icon-192x192', size: 192 },
    { name: 'icon-512x512', size: 512 }
  ];
  
  pwaSizes.forEach(icon => {
    const svgContent = `<svg width="${icon.size}" height="${icon.size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  
  <!-- Círculo principal -->
  <circle cx="256" cy="256" r="180" fill="url(#primary)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Ojo izquierdo -->
  <circle cx="200" cy="220" r="25" fill="#ffffff"/>
  <circle cx="200" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="195" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Ojo derecho -->
  <circle cx="312" cy="220" r="25" fill="#ffffff"/>
  <circle cx="312" cy="220" r="15" fill="#1a1a1a"/>
  <circle cx="307" cy="215" r="5" fill="#ffffff"/>
  
  <!-- Sonrisa -->
  <path d="M 180 280 Q 256 320 332 280" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"/>
  
  <!-- Elementos decorativos -->
  <circle cx="150" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="150" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="150" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  <circle cx="362" cy="362" r="8" fill="url(#accent)" opacity="0.8"/>
  
  <!-- Brillo -->
  <circle cx="200" cy="200" r="60" fill="url(#primary)" opacity="0.3"/>
</svg>`;
    
    createFile(`public/app-icons/pwa/${icon.name}.svg`, svgContent);
  });
}

// Generar iconos adaptativos para Android
function generateAdaptiveIcons() {
  log('🎯 Generando iconos adaptativos para Android...', 'yellow');
  
  // Icono de primer plano
  const foregroundSvg = `<svg width="108" height="108" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Círculo principal -->
  <circle cx="54" cy="54" r="45" fill="url(#primary)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Ojo izquierdo -->
  <circle cx="42" cy="46" r="6" fill="#ffffff"/>
  <circle cx="42" cy="46" r="4" fill="#1a1a1a"/>
  <circle cx="40" cy="44" r="1" fill="#ffffff"/>
  
  <!-- Ojo derecho -->
  <circle cx="66" cy="46" r="6" fill="#ffffff"/>
  <circle cx="66" cy="46" r="4" fill="#1a1a1a"/>
  <circle cx="64" cy="44" r="1" fill="#ffffff"/>
  
  <!-- Sonrisa -->
  <path d="M 38 58 Q 54 66 70 58" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
  
  <!-- Elementos decorativos -->
  <circle cx="32" cy="32" r="2" fill="url(#accent)" opacity="0.8"/>
  <circle cx="76" cy="32" r="2" fill="url(#accent)" opacity="0.8"/>
  <circle cx="32" cy="76" r="2" fill="url(#accent)" opacity="0.8"/>
  <circle cx="76" cy="76" r="2" fill="url(#accent)" opacity="0.8"/>
</svg>`;
  
  // Fondo del icono adaptativo
  const backgroundSvg = `<svg width="108" height="108" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="108" height="108" rx="27" fill="url(#bg)"/>
</svg>`;
  
  const adaptiveSizes = [
    { name: 'mipmap-mdpi', size: 108 },
    { name: 'mipmap-hdpi', size: 162 },
    { name: 'mipmap-xhdpi', size: 216 },
    { name: 'mipmap-xxhdpi', size: 324 },
    { name: 'mipmap-xxxhdpi', size: 432 }
  ];
  
  adaptiveSizes.forEach(icon => {
    createFile(`public/app-icons/android/adaptive/${icon.name}-foreground.svg`, foregroundSvg);
    createFile(`public/app-icons/android/adaptive/${icon.name}-background.svg`, backgroundSvg);
  });
}

// Generar README para iconos
function generateIconsREADME() {
  log('📝 Generando README para iconos...', 'yellow');
  
  const readmeContent = `# Iconos de la Aplicación - Veo Veo Vision

## 📁 Estructura de Archivos

\`\`\`
public/app-icons/
├── icon-base.svg                    # Icono base SVG
├── ios/                            # Iconos para iOS
│   ├── icon-20x20.svg
│   ├── icon-20x20@2x.svg
│   ├── icon-29x29.svg
│   ├── icon-29x29@2x.svg
│   ├── icon-40x40.svg
│   ├── icon-40x40@2x.svg
│   ├── icon-60x60@2x.svg
│   ├── icon-60x60@3x.svg
│   ├── icon-76x76.svg
│   ├── icon-76x76@2x.svg
│   ├── icon-83.5x83.5@2x.svg
│   └── icon-1024x1024.svg
├── android/                        # Iconos para Android
│   ├── mipmap-mdpi.svg
│   ├── mipmap-hdpi.svg
│   ├── mipmap-xhdpi.svg
│   ├── mipmap-xxhdpi.svg
│   ├── mipmap-xxxhdpi.svg
│   ├── play-store.svg
│   └── adaptive/                   # Iconos adaptativos
│       ├── mipmap-mdpi-foreground.svg
│       ├── mipmap-mdpi-background.svg
│       ├── mipmap-hdpi-foreground.svg
│       ├── mipmap-hdpi-background.svg
│       ├── mipmap-xhdpi-foreground.svg
│       ├── mipmap-xhdpi-background.svg
│       ├── mipmap-xxhdpi-foreground.svg
│       ├── mipmap-xxhdpi-background.svg
│       ├── mipmap-xxxhdpi-foreground.svg
│       └── mipmap-xxxhdpi-background.svg
└── pwa/                           # Iconos para PWA
    ├── icon-192x192.svg
    └── icon-512x512.svg
\`\`\`

## 🎨 Especificaciones de Diseño

### Colores
- **Fondo:** Gradiente de #1a1a1a a #2d2d2d
- **Primario:** Gradiente de #6366f1 a #8b5cf6
- **Acento:** Gradiente de #f59e0b a #ef4444
- **Blanco:** #ffffff
- **Negro:** #1a1a1a

### Elementos
- **Forma:** Círculo con bordes redondeados
- **Tema:** Emoji de cara sonriente con ojos
- **Estilo:** Flat design con gradientes
- **Bordes:** Redondeados para iOS, cuadrados para Android

## 📱 Requisitos por Plataforma

### iOS App Store
- **App Icon:** 1024x1024 px (PNG)
- **Spotlight Icon:** 120x120 px (PNG)
- **Settings Icon:** 87x87 px (PNG)
- **Notification Icon:** 40x40 px (PNG)

### Google Play Store
- **App Icon:** 512x512 px (PNG)
- **Feature Graphic:** 1024x500 px (PNG)
- **Adaptive Icon:** Foreground + Background

### PWA
- **App Icon:** 192x192 px y 512x512 px (PNG)

## 🛠️ Conversión a PNG

Para convertir los SVG a PNG, puedes usar:

### Herramientas Online
- [Convertio](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [SVG to PNG](https://svgtopng.com/)

### Herramientas de Línea de Comandos
\`\`\`bash
# Usando ImageMagick
convert icon.svg icon.png

# Usando Inkscape
inkscape icon.svg --export-filename=icon.png

# Usando rsvg-convert
rsvg-convert -h 512 icon.svg > icon.png
\`\`\`

### Herramientas de Diseño
- **Figma:** Importar SVG y exportar como PNG
- **Adobe Illustrator:** Abrir SVG y exportar como PNG
- **Sketch:** Importar SVG y exportar como PNG

## 📋 Checklist de Conversión

### iOS
- [ ] Convertir icon-1024x1024.svg a PNG
- [ ] Convertir icon-20x20.svg a PNG
- [ ] Convertir icon-20x20@2x.svg a PNG
- [ ] Convertir icon-20x20@3x.svg a PNG
- [ ] Convertir icon-29x29.svg a PNG
- [ ] Convertir icon-29x29@2x.svg a PNG
- [ ] Convertir icon-29x29@3x.svg a PNG
- [ ] Convertir icon-40x40.svg a PNG
- [ ] Convertir icon-40x40@2x.svg a PNG
- [ ] Convertir icon-40x40@3x.svg a PNG
- [ ] Convertir icon-60x60@2x.svg a PNG
- [ ] Convertir icon-60x60@3x.svg a PNG
- [ ] Convertir icon-76x76.svg a PNG
- [ ] Convertir icon-76x76@2x.svg a PNG
- [ ] Convertir icon-83.5x83.5@2x.svg a PNG

### Android
- [ ] Convertir mipmap-mdpi.svg a PNG
- [ ] Convertir mipmap-hdpi.svg a PNG
- [ ] Convertir mipmap-xhdpi.svg a PNG
- [ ] Convertir mipmap-xxhdpi.svg a PNG
- [ ] Convertir mipmap-xxxhdpi.svg a PNG
- [ ] Convertir play-store.svg a PNG
- [ ] Convertir iconos adaptativos

### PWA
- [ ] Convertir icon-192x192.svg a PNG
- [ ] Convertir icon-512x512.svg a PNG

## 🎯 Próximos Pasos

1. **Convertir SVG a PNG** usando las herramientas recomendadas
2. **Verificar calidad** en diferentes dispositivos
3. **Probar en entornos reales** (App Store Connect, Google Play Console)
4. **Optimizar si es necesario** para mejor rendimiento

## 📞 Contacto

Para preguntas sobre los iconos, consulta la documentación del proyecto o contacta al equipo de desarrollo.
`;
  
  createFile('public/app-icons/README.md', readmeContent);
}

// Verificar iconos generados
function verifyIcons() {
  log('🔍 Verificando iconos generados...', 'yellow');
  
  const requiredIcons = [
    'public/app-icons/icon-base.svg',
    'public/app-icons/ios/icon-1024x1024.svg',
    'public/app-icons/android/play-store.svg',
    'public/app-icons/pwa/icon-512x512.svg',
    'public/app-icons/android/adaptive/mipmap-xxxhdpi-foreground.svg',
    'public/app-icons/README.md'
  ];
  
  const missing = requiredIcons.filter(icon => !checkFileExists(icon));
  
  if (missing.length > 0) {
    log(`❌ Iconos faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todos los iconos han sido generados correctamente', 'green');
  return true;
}

// Función principal
async function main() {
  log('🎨 Veo Veo Vision - Generador de Iconos', 'green');
  log('=======================================\n', 'green');
  
  // Generar icono base
  generateBaseIcon();
  
  // Generar iconos para iOS
  generateIOSIcons();
  
  // Generar iconos para Android
  generateAndroidIcons();
  
  // Generar iconos para PWA
  generatePWAIcons();
  
  // Generar iconos adaptativos
  generateAdaptiveIcons();
  
  // Generar README
  generateIconsREADME();
  
  // Verificar iconos
  if (verifyIcons()) {
    log('\n🎉 ¡Iconos generados exitosamente!', 'green');
    log('\n📋 Resumen de iconos:', 'yellow');
    log('   ✅ Icono base SVG');
    log('   ✅ 15 iconos para iOS');
    log('   ✅ 6 iconos para Android');
    log('   ✅ 2 iconos para PWA');
    log('   ✅ 10 iconos adaptativos');
    log('   ✅ Documentación README');
    
    log('\n⚠️  Acciones requeridas:', 'yellow');
    log('   1. Convertir SVG a PNG usando herramientas recomendadas');
    log('   2. Verificar calidad en diferentes dispositivos');
    log('   3. Probar en entornos reales');
    log('   4. Optimizar si es necesario');
    
    log('\n📚 Documentación:', 'blue');
    log('   - public/app-icons/README.md');
    log('   - APP_ICONS_GUIDE.md');
    log('   - APP_STORE_COMPLIANCE_CHECKLIST.md');
  } else {
    log('\n❌ Error generando iconos', 'red');
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
  generateBaseIcon,
  generateIOSIcons,
  generateAndroidIcons,
  generatePWAIcons,
  generateAdaptiveIcons,
  generateIconsREADME,
  verifyIcons
};
