#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando preparación para App Stores...\n');

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

function checkDirectoryExists(dirPath) {
  return fs.existsSync(path.join(process.cwd(), dirPath));
}

// Verificar archivos críticos
function checkCriticalFiles() {
  log('📋 Verificando archivos críticos...', 'yellow');
  
  const criticalFiles = [
    '.env.local',
    'package.json',
    'vite.config.ts',
    'capacitor.config.ts',
    'public/manifest.json',
    'public/robots.txt',
    'public/sitemap.xml',
    'privacy-policy.html',
    'terms-of-service.html'
  ];
  
  const missing = criticalFiles.filter(file => !checkFileExists(file));
  
  if (missing.length > 0) {
    log(`❌ Archivos críticos faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todos los archivos críticos están presentes', 'green');
  return true;
}

// Verificar configuraciones de seguridad
function checkSecurityConfigs() {
  log('🔒 Verificando configuraciones de seguridad...', 'yellow');
  
  const securityFiles = [
    'public/csp.txt',
    'security-headers.conf',
    'public/.htaccess',
    'nginx.conf'
  ];
  
  const missing = securityFiles.filter(file => !checkFileExists(file));
  
  if (missing.length > 0) {
    log(`❌ Configuraciones de seguridad faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todas las configuraciones de seguridad están presentes', 'green');
  return true;
}

// Verificar iconos
function checkIcons() {
  log('🎨 Verificando iconos...', 'yellow');
  
  const iconFiles = [
    'public/app-icons/icon-base.svg',
    'public/app-icons/ios/icon-1024x1024.svg',
    'public/app-icons/android/play-store.svg',
    'public/app-icons/pwa/icon-512x512.svg',
    'public/app-icons/android/adaptive/mipmap-xxxhdpi-foreground.svg',
    'public/app-icons/README.md'
  ];
  
  const missing = iconFiles.filter(file => !checkFileExists(file));
  
  if (missing.length > 0) {
    log(`❌ Iconos faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todos los iconos están presentes', 'green');
  return true;
}

// Verificar documentación
function checkDocumentation() {
  log('📚 Verificando documentación...', 'yellow');
  
  const docs = [
    'APP_STORE_COMPLIANCE_CHECKLIST.md',
    'APP_ICONS_GUIDE.md',
    'APP_SCREENSHOTS_GUIDE.md',
    'PRD_VeoVeoVision_Completo.md',
    'README.md'
  ];
  
  const missing = docs.filter(doc => !checkFileExists(doc));
  
  if (missing.length > 0) {
    log(`❌ Documentación faltante: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Toda la documentación está presente', 'green');
  return true;
}

// Verificar scripts
function checkScripts() {
  log('🛠️  Verificando scripts...', 'yellow');
  
  const scripts = [
    'scripts/build-for-stores.cjs',
    'scripts/configure-security.cjs',
    'scripts/generate-icons.cjs'
  ];
  
  const missing = scripts.filter(script => !checkFileExists(script));
  
  if (missing.length > 0) {
    log(`❌ Scripts faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todos los scripts están presentes', 'green');
  return true;
}

// Verificar estructura de directorios
function checkDirectories() {
  log('📁 Verificando estructura de directorios...', 'yellow');
  
  const directories = [
    'public/app-icons',
    'public/app-icons/ios',
    'public/app-icons/android',
    'public/app-icons/android/adaptive',
    'public/app-icons/pwa',
    'scripts'
  ];
  
  const missing = directories.filter(dir => !checkDirectoryExists(dir));
  
  if (missing.length > 0) {
    log(`❌ Directorios faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Toda la estructura de directorios está presente', 'green');
  return true;
}

// Verificar variables de entorno
function checkEnvironmentVariables() {
  log('🔧 Verificando variables de entorno...', 'yellow');
  
  if (!checkFileExists('.env.local')) {
    log('❌ Archivo .env.local no encontrado', 'red');
    return false;
  }
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_GOOGLE_ANALYTICS_ID',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missing.length > 0) {
    log(`❌ Variables de entorno faltantes: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todas las variables de entorno están configuradas', 'green');
  return true;
}

// Verificar package.json scripts
function checkPackageScripts() {
  log('📦 Verificando scripts de package.json...', 'yellow');
  
  if (!checkFileExists('package.json')) {
    log('❌ package.json no encontrado', 'red');
    return false;
  }
  
  const packageContent = fs.readFileSync('package.json', 'utf8');
  const requiredScripts = [
    'build:stores',
    'security:configure',
    'icons:generate',
    'stores:prepare',
    'stores:android',
    'stores:ios'
  ];
  
  const missing = requiredScripts.filter(script => !packageContent.includes(script));
  
  if (missing.length > 0) {
    log(`❌ Scripts faltantes en package.json: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ Todos los scripts están configurados en package.json', 'green');
  return true;
}

// Generar reporte final
function generateFinalReport(results) {
  log('\n📊 Reporte Final de Preparación para App Stores', 'green');
  log('================================================\n', 'green');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('🎉 ¡TODOS LOS CHECKS PASARON!', 'green');
    log('✅ Tu aplicación está lista para las App Stores', 'green');
  } else {
    log('⚠️  ALGUNOS CHECKS FALLARON', 'yellow');
    log('❌ Tu aplicación necesita más trabajo antes de las App Stores', 'red');
  }
  
  log('\n📋 Resumen detallado:', 'yellow');
  log(`   📋 Archivos críticos: ${results.criticalFiles ? '✅' : '❌'}`, results.criticalFiles ? 'green' : 'red');
  log(`   🔒 Seguridad: ${results.security ? '✅' : '❌'}`, results.security ? 'green' : 'red');
  log(`   🎨 Iconos: ${results.icons ? '✅' : '❌'}`, results.icons ? 'green' : 'red');
  log(`   📚 Documentación: ${results.docs ? '✅' : '❌'}`, results.docs ? 'green' : 'red');
  log(`   🛠️  Scripts: ${results.scripts ? '✅' : '❌'}`, results.scripts ? 'green' : 'red');
  log(`   📁 Directorios: ${results.dirs ? '✅' : '❌'}`, results.dirs ? 'green' : 'red');
  log(`   🔧 Variables de entorno: ${results.env ? '✅' : '❌'}`, results.env ? 'green' : 'red');
  log(`   📦 Scripts de package.json: ${results.packageScripts ? '✅' : '❌'}`, results.packageScripts ? 'green' : 'red');
  
  if (allPassed) {
    log('\n🎯 Próximos pasos para publicación:', 'yellow');
    log('   1. Convertir iconos SVG a PNG');
    log('   2. Capturar screenshots de la aplicación');
    log('   3. Configurar dominio personalizado');
    log('   4. Configurar certificados SSL');
    log('   5. Configurar webhooks de Stripe');
    log('   6. Crear cuentas en App Store Connect y Google Play Console');
    log('   7. Subir builds a las plataformas');
    log('   8. Completar metadatos de la aplicación');
    log('   9. Enviar para revisión');
    
    log('\n📚 Documentación útil:', 'blue');
    log('   - APP_STORE_COMPLIANCE_CHECKLIST.md');
    log('   - public/app-icons/README.md');
    log('   - APP_ICONS_GUIDE.md');
    log('   - APP_SCREENSHOTS_GUIDE.md');
  } else {
    log('\n🔧 Acciones requeridas:', 'yellow');
    log('   1. Revisar los errores listados arriba');
    log('   2. Ejecutar los scripts faltantes');
    log('   3. Completar la configuración');
    log('   4. Volver a ejecutar este script');
  }
  
  // Guardar reporte en archivo
  const report = {
    timestamp: new Date().toISOString(),
    allPassed,
    results,
    version: require('../package.json').version
  };
  
  fs.writeFileSync('app-store-readiness-report.json', JSON.stringify(report, null, 2));
  log('\n📄 Reporte guardado en: app-store-readiness-report.json', 'blue');
  
  return allPassed;
}

// Función principal
async function main() {
  log('🔍 Veo Veo Vision - Verificación de Preparación para App Stores', 'green');
  log('================================================================\n', 'green');
  
  const results = {
    criticalFiles: checkCriticalFiles(),
    security: checkSecurityConfigs(),
    icons: checkIcons(),
    docs: checkDocumentation(),
    scripts: checkScripts(),
    dirs: checkDirectories(),
    env: checkEnvironmentVariables(),
    packageScripts: checkPackageScripts()
  };
  
  const allPassed = generateFinalReport(results);
  
  if (!allPassed) {
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
  checkCriticalFiles,
  checkSecurityConfigs,
  checkIcons,
  checkDocumentation,
  checkScripts,
  checkDirectories,
  checkEnvironmentVariables,
  checkPackageScripts,
  generateFinalReport
};
