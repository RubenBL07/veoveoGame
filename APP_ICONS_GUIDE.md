# Guía de Iconos para App Stores - Veo Veo Vision

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

## 📐 Tamaños Requeridos

### iOS
- 20x20 px (1x)
- 40x40 px (2x)
- 60x60 px (3x)
- 29x29 px (1x)
- 58x58 px (2x)
- 87x87 px (3x)
- 40x40 px (1x)
- 80x80 px (2x)
- 120x120 px (3x)
- 120x120 px (2x)
- 180x180 px (3x)
- 76x76 px (1x)
- 152x152 px (2x)
- 167x167 px (2x)
- 1024x1024 px (App Store)

### Android
- 48x48 px (mdpi)
- 72x72 px (hdpi)
- 96x96 px (xhdpi)
- 144x144 px (xxhdpi)
- 192x192 px (xxxhdpi)
- 512x512 px (Play Store)

### PWA
- 192x192 px
- 512x512 px

## 🛠️ Herramientas Recomendadas

### Herramientas Online
- [Convertio](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [SVG to PNG](https://svgtopng.com/)

### Herramientas de Línea de Comandos
```bash
# Usando ImageMagick
convert icon.svg icon.png

# Usando Inkscape
inkscape icon.svg --export-filename=icon.png

# Usando rsvg-convert
rsvg-convert -h 512 icon.svg > icon.png
```

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
