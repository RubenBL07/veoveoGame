# Configuración de IA para Detección de Objetos

## Descripción

Este proyecto ahora incluye integración real de IA para la detección de objetos en imágenes usando OpenAI Vision API. La implementación incluye un fallback a detección simulada cuando la API no está configurada.

## Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en tu dashboard
4. Crea una nueva API key
5. Copia la API key generada

### 2. Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza `your_openai_api_key_here` con tu API key real:

```env
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Reiniciar el Servidor

Después de configurar la API key, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Funcionamiento

### Con API Key Configurada
- Las imágenes se envían a OpenAI Vision API
- Se detectan objetos reales en la imagen
- Los objetos se devuelven en español
- Se muestra mayor precisión en la detección

### Sin API Key (Modo Simulado)
- Se usa detección simulada con objetos predefinidos
- Se muestra una notificación indicando el modo simulado
- El juego funciona normalmente con objetos aleatorios

## Características Implementadas

✅ **Servicio de IA (`src/lib/aiService.ts`)**
- Integración con OpenAI Vision API
- Conversión automática de imágenes a base64
- Manejo robusto de errores
- Fallback a detección simulada
- Validación de respuestas de la API

✅ **Integración en Game.tsx**
- Reemplazo de lógica simulada
- Procesamiento de archivos de imagen
- Notificaciones de estado
- Manejo de errores transparente

✅ **Configuración de Entorno**
- Variable `VITE_OPENAI_API_KEY` agregada
- Detección automática de configuración
- Modo de desarrollo amigable

## Costos y Consideraciones

- OpenAI Vision API tiene costos por uso
- El modelo `gpt-4o-mini` es más económico
- Se usa `detail: 'low'` para reducir costos
- Considera implementar límites de uso en producción

## Troubleshooting

### Error: "API key not configured"
- Verifica que la variable `VITE_OPENAI_API_KEY` esté configurada
- Asegúrate de que la API key sea válida
- Reinicia el servidor después de cambiar el `.env`

### Error: "Failed to parse AI response"
- La API puede devolver respuestas inesperadas
- El sistema automáticamente usa detección simulada como fallback
- Revisa los logs de consola para más detalles

### Error: "API Error: 429"
- Has excedido los límites de rate de OpenAI
- Espera unos minutos antes de intentar de nuevo
- Considera implementar rate limiting en tu aplicación

## Próximos Pasos

- [ ] Implementar caché de detecciones para imágenes similares
- [ ] Agregar soporte para múltiples proveedores de IA
- [ ] Implementar límites de uso por usuario
- [ ] Optimizar prompts para mejor precisión
- [ ] Agregar traducción automática de objetos