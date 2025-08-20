# Veo Veo - AI-Powered Multiplayer Game

Un juego multijugador moderno que recrea el clásico "Veo Veo" utilizando inteligencia artificial para detección de objetos en fotografías en tiempo real. Disponible como **aplicación web** y **app móvil nativa** para Android e iOS.

## 📱 **App Móvil Nativa**

¡Veo Veo ahora está disponible como app móvil nativa! 

### ✅ **Características de la App Móvil:**
- **Cámara nativa** con acceso directo al hardware
- **Vibración háptica** para feedback táctil
- **UI optimizada** para pantallas táctiles
- **Performance nativa** con carga rápida
- **Compatibilidad**: Android 5.0+ e iOS 12.0+

### 🚀 **Cómo ejecutar la app móvil:**

#### **Para Android:**
```bash
npx cap open android
```

#### **Para iOS (solo en macOS):**
```bash
npx cap open ios
```

#### **Para desarrollo web:**
```bash
npm run dev
```

**📖 Ver [MOBILE_APP_SETUP.md](./MOBILE_APP_SETUP.md) para instrucciones detalladas.**

## 🎮 Características

### Core Gameplay
- **Detección IA**: Análisis automático de objetos en fotos usando OpenAI Vision API
- **Multijugador en Tiempo Real**: Hasta 5 jugadores por sala con sincronización instantánea
- **Sistema de Salas**: Salas privadas con códigos y salas públicas para usuarios premium
- **Puntuación Dinámica**: Sistema de XP y niveles con recompensas por logros

### Funcionalidades Premium
- **Salas Públicas**: Acceso a salas mundiales con matchmaking global
- **Leaderboards**: Clasificaciones globales y regionales
- **Sin Límites**: Salas privadas ilimitadas (vs 3/día en versión gratuita)
- **Bonus XP**: 25% de bonus en experiencia para usuarios premium
- **Sin Anuncios**: Experiencia completamente libre de publicidad

### Sistema Social
- **Desafíos Diarios**: Objetivos diarios con recompensas XP
- **Logros**: Sistema de logros desbloqueables
- **Perfiles Personalizables**: Avatares y estadísticas detalladas
- **Sistema de Amigos**: Gestión de amigos y invitaciones

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **IA**: OpenAI GPT-4 Vision API
- **Estado**: React Query + Context API
- **Routing**: React Router DOM
- **App Móvil**: Capacitor (Android + iOS)
- **Cámara Nativa**: Capacitor Camera Plugin
- **Analytics**: Google Analytics

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de OpenAI (opcional, para IA real)

## ⚙️ Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd veo-veo-vision
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `env.example` a `.env.local` y configura las variables:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase Configuration (REQUERIDO)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (OPCIONAL - para IA real)
VITE_OPENAI_API_KEY=your_openai_api_key

# Opcional: Analytics y Monitoreo
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Opcional: Procesamiento de Pagos (para suscripciones Premium)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### 4. Configurar Supabase

#### Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la anon key a tu `.env.local`

#### Ejecutar migraciones
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link tu proyecto
supabase link --project-ref your-project-ref

# Ejecutar migraciones
supabase db push
```

### 5. Configurar Storage
En el dashboard de Supabase, crea un bucket llamado `game-photos` con las siguientes políticas:

```sql
-- Permitir subida de fotos por usuarios autenticados
CREATE POLICY "Users can upload photos" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'game-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir visualización de fotos del juego
CREATE POLICY "Users can view game photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'game-photos');
```

## 🏃‍♂️ Ejecutar el Proyecto

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## 🎯 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables
│   ├── ui/             # Componentes shadcn/ui
│   ├── Avatar.tsx      # Componente de avatar personalizado
│   └── LoadingSpinner.tsx
├── hooks/              # Custom hooks
│   ├── useAuth.tsx     # Hook de autenticación
│   └── use-toast.ts    # Hook de notificaciones
├── integrations/       # Integraciones externas
│   └── supabase/       # Cliente y tipos de Supabase
├── lib/                # Servicios y utilidades
│   ├── aiService.ts    # Servicio de IA
│   ├── gameService.ts  # Lógica del juego
│   └── utils.ts        # Utilidades generales
├── pages/              # Páginas de la aplicación
│   ├── Auth.tsx        # Autenticación
│   ├── Home.tsx        # Dashboard principal
│   ├── Game.tsx        # Pantalla de juego
│   ├── Room.tsx        # Sala de espera
│   ├── CreateRoom.tsx  # Crear sala
│   ├── JoinRoom.tsx    # Unirse a sala
│   ├── PublicRooms.tsx # Salas públicas (Premium)
│   ├── Premium.tsx     # Página de suscripción
│   └── Profile.tsx     # Perfil de usuario
└── App.tsx             # Componente principal
```

## 🎮 Cómo Jugar

### Flujo Básico
1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Crear/Unirse**: Crea una sala privada o únete con código
3. **Esperar Jugadores**: Espera a que se unan otros jugadores
4. **Tomar Foto**: El fotógrafo toma una foto de un objeto
5. **IA Detecta**: La IA analiza la foto y detecta objetos
6. **Seleccionar**: El fotógrafo elige qué objeto adivinar
7. **Adivinar**: Los demás jugadores adivinan el objeto
8. **Puntuación**: Se otorgan puntos y XP por aciertos

### Modos de Juego
- **Automático**: La IA selecciona aleatoriamente el objeto
- **Manual**: El fotógrafo elige de la lista detectada

### Sistema de XP
- **+50 XP**: Completar partida
- **+100 XP**: Adivinar objeto correctamente
- **+200 XP**: Ganar partida
- **+25 XP**: Tomar foto válida
- **+500 XP**: Completar desafío diario
- **+25% Bonus**: Usuarios premium

## 🔧 Configuración de IA

### Con OpenAI (Recomendado)
1. Obtén una API key de [OpenAI](https://platform.openai.com)
2. Configura `VITE_OPENAI_API_KEY` en tu `.env.local`
3. La IA detectará objetos reales en las fotos

### Sin OpenAI (Fallback)
Si no configuras la API key, el sistema usará detección simulada con objetos predefinidos.

## 📱 Características Móviles

- **Responsive Design**: Optimizado para móviles y tablets
- **Camera Integration**: Acceso directo a la cámara del dispositivo
- **Touch Optimized**: Interfaz táctil optimizada
- **Offline Support**: Funcionalidad básica sin conexión

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discord**: [Servidor de la comunidad](link-to-discord)

## 🎯 Roadmap

### v1.1 - Mejoras de IA
- [ ] Soporte para más idiomas
- [ ] Mejora en precisión de detección
- [ ] Filtros de contenido automáticos

### v1.2 - Funcionalidades Sociales
- [ ] Sistema de amigos completo
- [ ] Chat en tiempo real
- [ ] Compartir resultados

### v2.0 - Expansión
- [ ] Modo torneo
- [ ] Temas personalizables
- [ ] Integración con redes sociales

---

**¡Disfruta jugando Veo Veo! 🎮✨**
