# Iconos de la Aplicación - Veo Veo Vision

## 📁 Estructura de Archivos

```
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
```

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
