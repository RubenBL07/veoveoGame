#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para App Stores...\n');

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

function exec(command, options = {}) {
  try {
    log(`📋 Ejecutando: ${command}`, 'blue');
    execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      ...options 
    });
    return true;
  } catch (error) {
    log(`❌ Error ejecutando: ${command}`, 'red');
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Verificar archivos críticos
function checkPrerequisites() {
  log('🔍 Verificando prerrequisitos...', 'yellow');
  
  const requiredFiles = [
    '.env.local',
    'capacitor.config.ts',
    'package.json',
    'vite.config.ts'
  ];

  const missingFiles = requiredFiles.filter(file => !checkFileExists(file));
  
  if (missingFiles.length > 0) {
    log(`❌ Archivos faltantes: ${missingFiles.join(', ')}`, 'red');
    return false;
  }

  log('✅ Todos los archivos requeridos están presentes', 'green');
  return true;
}

// Limpiar builds anteriores
function cleanBuilds() {
  log('🧹 Limpiando builds anteriores...', 'yellow');
  
  const dirsToClean = ['dist', 'android', 'ios'];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`🗑️  Eliminando ${dir}...`, 'blue');
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

// Build de producción
function buildProduction() {
  log('🏗️  Construyendo aplicación de producción...', 'yellow');
  
  if (!exec('npm run build')) {
    log('❌ Error en el build de producción', 'red');
    return false;
  }
  
  log('✅ Build de producción completado', 'green');
  return true;
}

// Sincronizar con Capacitor
function syncCapacitor() {
  log('📱 Sincronizando con Capacitor...', 'yellow');
  
  if (!exec('npx cap sync')) {
    log('❌ Error sincronizando con Capacitor', 'red');
    return false;
  }
  
  log('✅ Sincronización con Capacitor completada', 'green');
  return true;
}

// Build para Android
function buildAndroid() {
  log('🤖 Construyendo para Android...', 'yellow');
  
  if (!exec('npx cap build android')) {
    log('❌ Error construyendo para Android', 'red');
    return false;
  }
  
  log('✅ Build de Android completado', 'green');
  return true;
}

// Build para iOS
function buildIOS() {
  log('🍎 Construyendo para iOS...', 'yellow');
  
  if (!exec('npx cap build ios')) {
    log('❌ Error construyendo para iOS', 'red');
    return false;
  }
  
  log('✅ Build de iOS completado', 'green');
  return true;
}

// Verificar archivos de build
function verifyBuilds() {
  log('🔍 Verificando builds...', 'yellow');
  
  const androidBuildPath = 'android/app/build/outputs/apk/release/app-release.apk';
  const iosBuildPath = 'ios/App/build/Release-iphoneos/App.app';
  
  if (checkFileExists(androidBuildPath)) {
    log('✅ APK de Android generado', 'green');
  } else {
    log('⚠️  APK de Android no encontrado', 'yellow');
  }
  
  if (checkFileExists(iosBuildPath)) {
    log('✅ App de iOS generada', 'green');
  } else {
    log('⚠️  App de iOS no encontrada', 'yellow');
  }
}

// Generar reporte de build
function generateBuildReport() {
  const report = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    builds: {
      web: checkFileExists('dist/index.html'),
      android: checkFileExists('android/app/build/outputs/apk/release/app-release.apk'),
      ios: checkFileExists('ios/App/build/Release-iphoneos/App.app')
    },
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  const reportPath = 'build-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📊 Reporte de build guardado en: ${reportPath}`, 'green');
  return report;
}

// Función principal
async function main() {
  const startTime = Date.now();
  
  log('🎯 Veo Veo Vision - Build para App Stores', 'green');
  log('==========================================\n', 'green');
  
  // Verificar prerrequisitos
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  // Limpiar builds anteriores
  cleanBuilds();
  
  // Build de producción
  if (!buildProduction()) {
    process.exit(1);
  }
  
  // Sincronizar con Capacitor
  if (!syncCapacitor()) {
    process.exit(1);
  }
  
  // Build para Android
  if (!buildAndroid()) {
    log('⚠️  Build de Android falló, continuando...', 'yellow');
  }
  
  // Build para iOS
  if (!buildIOS()) {
    log('⚠️  Build de iOS falló, continuando...', 'yellow');
  }
  
  // Verificar builds
  verifyBuilds();
  
  // Generar reporte
  const report = generateBuildReport();
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  log('\n🎉 ¡Build completado!', 'green');
  log(`⏱️  Duración: ${duration} segundos`, 'blue');
  log('\n📋 Resumen:', 'yellow');
  log(`   Web: ${report.builds.web ? '✅' : '❌'}`, report.builds.web ? 'green' : 'red');
  log(`   Android: ${report.builds.android ? '✅' : '❌'}`, report.builds.android ? 'green' : 'red');
  log(`   iOS: ${report.builds.ios ? '✅' : '❌'}`, report.builds.ios ? 'green' : 'red');
  
  log('\n📱 Próximos pasos:', 'yellow');
  log('   1. Revisar builds generados');
  log('   2. Probar en dispositivos reales');
  log('   3. Subir a App Store Connect (iOS)');
  log('   4. Subir a Google Play Console (Android)');
  
  log('\n📚 Documentación:', 'blue');
  log('   - APP_STORE_COMPLIANCE_CHECKLIST.md');
  log('   - public/app-icons/README.md');
  log('   - public/screenshots/README.md');
}

// Manejar errores
process.on('unhandledRejection', (error) => {
  log(`❌ Error no manejado: ${error}`, 'red');
  process.exit(1);
});

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    log(`❌ Error en el script: ${error}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkPrerequisites,
  cleanBuilds,
  buildProduction,
  syncCapacitor,
  buildAndroid,
  buildIOS,
  verifyBuilds,
  generateBuildReport
};
