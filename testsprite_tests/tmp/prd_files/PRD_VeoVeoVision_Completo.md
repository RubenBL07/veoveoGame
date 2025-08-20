# Product Requirements Document (PRD)
## Veo Veo Vision - Juego de Adivinanzas con IA

### 1. Resumen Ejecutivo

**Nombre del Producto:** Veo Veo  
**Versión:** 2.0  
**Fecha:** Enero 2025  
**Tipo:** Aplicación Web y Móvil Nativa  
**Categoría:** Juego Social Multiplataforma  

**Descripción:** Veo Veo Vision es un juego social innovador que combina fotografía, inteligencia artificial y competencia en tiempo real. Los jugadores toman fotos de objetos, la IA detecta automáticamente los elementos presentes, y otros jugadores deben adivinar qué objeto específico está pensando el fotógrafo.

### 2. Visión del Producto

**Objetivo Principal:** Crear una experiencia de juego social única que conecte personas a través de la fotografía y la inteligencia artificial, fomentando la creatividad, la observación y la interacción social.

**Propuesta de Valor:**
- Juego social innovador que combina fotografía y IA
- Experiencia multiplataforma (web + móvil nativo)
- Sistema de gamificación avanzado
- Monetización freemium sostenible
- Funcionalidad offline completa

### 3. Análisis de Mercado

**Mercado Objetivo:**
- **Demografía Principal:** 18-35 años
- **Intereses:** Fotografía, juegos sociales, tecnología, creatividad
- **Dispositivos:** Smartphones (iOS/Android) y navegadores web
- **Ubicación:** Global (español como idioma principal)

**Competencia:**
- Juegos de adivinanzas tradicionales
- Apps de fotografía social
- Juegos de trivia visual
- Plataformas de IA generativa

**Ventajas Competitivas:**
- Integración nativa de IA para detección de objetos
- Experiencia multiplataforma unificada
- Sistema de gamificación avanzado
- Funcionalidad offline
- Monetización no intrusiva

### 4. Funcionalidades Principales

#### 4.1 Sistema de Autenticación y Perfiles
- **Registro/Login:** Email y contraseña con Supabase Auth
- **Perfiles de Usuario:** 
  - Nombre de usuario único
  - Nombre para mostrar
  - Avatar personalizable
  - Estadísticas de juego
  - Nivel y XP
  - Logros desbloqueados
- **Verificación de Email:** Confirmación obligatoria
- **Gestión de Perfil:** Edición de información personal

#### 4.2 Sistema de Salas y Juegos
- **Salas Privadas:** 
  - Código de acceso único
  - Límite de 3 salas diarias (usuarios gratuitos)
  - Sin límite (usuarios premium)
  - 2-8 jugadores por sala
- **Salas Públicas:** 
  - Descubrimiento automático
  - Solo para usuarios premium
  - Sin límite de jugadores
- **Gestión de Salas:**
  - Creación de salas
  - Unirse por código
  - Configuración de idioma
  - Límites de jugadores

#### 4.3 Gameplay Core
- **Captura de Fotos:**
  - Cámara nativa en móviles
  - Cámara web en navegadores
  - Galería de fotos
  - Optimización automática
- **Detección de IA:**
  - OpenAI GPT-4 Vision API
  - Detección automática de objetos
  - Lista de objetos detectados
  - Fallback a detección manual
- **Mecánica de Juego:**
  - Selección de objeto por fotógrafo
  - Rondas de adivinanza
  - Sistema de puntuación
  - Progresión de rondas
  - Determinación de ganador

#### 4.4 Sistema de Gamificación
- **Niveles y XP:**
  - XP por acciones del juego
  - Sistema de niveles progresivo
  - Recompensas por nivel
- **Logros:**
  - Logros desbloqueables
  - Categorías múltiples
  - Progreso visible
- **Desafíos Diarios:**
  - 3 desafíos diarios
  - Recompensas de XP
  - Rotación automática
- **Clasificaciones:**
  - Global y regional
  - Múltiples categorías
  - Solo para usuarios premium

#### 4.5 Funciones Sociales
- **Sistema de Amigos:**
  - Búsqueda por nombre de usuario
  - Solicitudes de amistad
  - Gestión de amigos
  - Lista de amigos online
- **Chat en Tiempo Real:**
  - Mensajes de texto
  - Mensajes del sistema
  - Mensajes del juego
  - Indicadores de estado
- **Salas Públicas:**
  - Descubrimiento de salas
  - Unirse sin invitación
  - Chat público

#### 4.6 Sistema de Torneos
- **Torneos Activos:**
  - Torneos programados
  - Inscripción automática
  - Sistema de eliminación
  - Premios y recompensas
- **Gestión de Torneos:**
  - Creación (admin)
  - Participación
  - Seguimiento de progreso
  - Resultados finales

### 5. Modelo Freemium

#### 5.1 Funcionalidades Gratuitas
- 3 salas privadas diarias
- Juego básico completo
- Sistema de niveles
- Logros básicos
- Chat en salas
- Perfil básico

#### 5.2 Funcionalidades Premium
- **Suscripción Mensual (€4.99):**
  - Salas privadas ilimitadas
  - Acceso a salas públicas
  - Clasificaciones globales
  - +50% XP bonus
  - Sin anuncios
  - 5 desafíos diarios extra
  - Temas visuales premium
  - Soporte prioritario

- **Suscripción Anual (€39.99):**
  - Todas las funciones mensuales
  - 2 meses gratis incluidos
  - Temas exclusivos anuales
  - Acceso anticipado a funciones

### 6. Experiencia de Usuario

#### 6.1 Diseño Visual
- **Tema Principal:** Oscuro con acentos vibrantes
- **Paleta de Colores:**
  - Fondo: #1a1a1a
  - Acentos: #6366f1, #8b5cf6
  - Texto: #ffffff, #a1a1aa
- **Elementos de Diseño:**
  - Efectos de cristal (glassmorphism)
  - Gradientes dinámicos
  - Animaciones suaves
  - Iconografía moderna

#### 6.2 Sistema de Temas
- **Temas Incluidos:**
  - Default (gratuito)
  - Oscuro (gratuito)
  - Claro (gratuito)
  - Neon (premium)
  - Sunset (premium)
  - Ocean (premium)
- **Temas Personalizados:**
  - Creación de temas propios
  - Exportación/importación
  - Generación aleatoria

#### 6.3 Responsividad
- **Web:** Desktop, tablet, móvil
- **Móvil Nativo:** iOS y Android
- **Adaptación Automática:** UI adaptativa
- **Optimización:** Performance nativa

### 7. Arquitectura Técnica

#### 7.1 Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui + Tailwind CSS
- **Estado:** React Query + Context API
- **Routing:** React Router DOM
- **Móvil:** Capacitor (iOS/Android)

#### 7.2 Backend
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Almacenamiento:** Supabase Storage
- **Tiempo Real:** Supabase Realtime
- **IA:** OpenAI GPT-4 Vision API
- **Pagos:** Stripe

#### 7.3 Base de Datos
**Tablas Principales:**
- `profiles`: Perfiles de usuario
- `rooms`: Salas de juego
- `room_players`: Jugadores en salas
- `games`: Partidas
- `game_rounds`: Rondas de juego
- `player_scores`: Puntuaciones
- `player_guesses`: Adivinanzas
- `friends`: Sistema de amistad
- `achievements`: Logros
- `daily_challenges`: Desafíos diarios
- `leaderboards`: Clasificaciones
- `chat_messages`: Mensajes de chat
- `tournaments`: Torneos
- `tournament_participants`: Participantes
- `tournament_games`: Juegos de torneo

#### 7.4 Seguridad
- **RLS (Row Level Security):** Políticas granulares
- **Autenticación:** JWT tokens
- **Validación:** TypeScript + Zod
- **CORS:** Configuración segura
- **HTTPS:** Obligatorio en producción

### 8. Funcionalidades Avanzadas

#### 8.1 Modo Offline
- **Almacenamiento Local:** LocalStorage
- **Sincronización:** Automática al reconectar
- **Funcionalidad Limitada:** Juego básico offline
- **Gestión de Datos:** Cola de sincronización

#### 8.2 Analytics y Métricas
- **Google Analytics 4:** Tracking completo
- **Eventos Personalizados:**
  - Creación de salas
  - Juegos completados
  - Suscripciones
  - Uso de funciones premium
- **Métricas Clave:**
  - Usuarios activos diarios/mensuales
  - Tiempo de sesión
  - Tasa de conversión premium
  - Retención de usuarios

#### 8.3 Sistema de Pagos
- **Proveedor:** Stripe
- **Planes:** Mensual y anual
- **Webhooks:** Gestión automática
- **Facturación:** Recurrente
- **Cancelación:** En cualquier momento

#### 8.4 Notificaciones
- **Push Notifications:** Móvil nativo
- **Email:** Confirmaciones y recordatorios
- **In-App:** Notificaciones del sistema
- **Tiempo Real:** Chat y actualizaciones

### 9. Requisitos No Funcionales

#### 9.1 Performance
- **Tiempo de Carga:** < 3 segundos
- **Tiempo de Respuesta:** < 500ms
- **Optimización:** Lazy loading, code splitting
- **Caché:** Estrategias múltiples

#### 9.2 Escalabilidad
- **Base de Datos:** PostgreSQL escalable
- **CDN:** Distribución global
- **Microservicios:** Arquitectura preparada
- **Auto-scaling:** Vercel + Supabase

#### 9.3 Disponibilidad
- **Uptime:** 99.9%
- **Backup:** Automático diario
- **Recuperación:** RTO < 1 hora
- **Monitoreo:** 24/7

#### 9.4 Accesibilidad
- **WCAG 2.1:** Nivel AA
- **Navegación por Teclado:** Completa
- **Screen Readers:** Compatible
- **Contraste:** Mínimo 4.5:1

### 10. Plan de Lanzamiento

#### 10.1 Fase 1: MVP (Completado)
- ✅ Autenticación básica
- ✅ Juego core funcional
- ✅ Salas privadas
- ✅ IA integrada
- ✅ UI responsive

#### 10.2 Fase 2: Social (Completado)
- ✅ Sistema de amigos
- ✅ Chat en tiempo real
- ✅ Salas públicas
- ✅ Clasificaciones

#### 10.3 Fase 3: Gamificación (Completado)
- ✅ Sistema de niveles
- ✅ Logros
- ✅ Desafíos diarios
- ✅ Torneos

#### 10.4 Fase 4: Monetización (Completado)
- ✅ Sistema de pagos
- ✅ Funciones premium
- ✅ Analytics
- ✅ Móvil nativo

#### 10.5 Fase 5: Optimización (En Progreso)
- 🔄 Performance optimization
- 🔄 A/B testing
- 🔄 User feedback integration
- 🔄 Advanced analytics

### 11. Métricas de Éxito

#### 11.1 Métricas de Usuario
- **DAU/MAU:** Objetivo 20%
- **Retención D1:** Objetivo 40%
- **Retención D7:** Objetivo 25%
- **Retención D30:** Objetivo 15%

#### 11.2 Métricas de Negocio
- **Conversión Premium:** Objetivo 5%
- **ARPU:** Objetivo €2.50
- **LTV:** Objetivo €50
- **Churn Rate:** < 5% mensual

#### 11.3 Métricas Técnicas
- **Uptime:** > 99.9%
- **Error Rate:** < 0.1%
- **Load Time:** < 3s
- **API Response:** < 500ms

### 12. Riesgos y Mitigación

#### 12.1 Riesgos Técnicos
- **Dependencia de IA:** Fallback manual
- **Escalabilidad:** Arquitectura preparada
- **Seguridad:** Auditorías regulares
- **Performance:** Monitoreo continuo

#### 12.2 Riesgos de Negocio
- **Competencia:** Diferenciación continua
- **Adopción:** Marketing agresivo
- **Monetización:** Múltiples fuentes
- **Regulación:** Cumplimiento GDPR

### 13. Roadmap Futuro

#### 13.1 Q2 2025
- Integración con redes sociales
- Modo historia/campaña
- Personalización avanzada
- API pública

#### 13.2 Q3 2025
- Realidad aumentada
- Modo colaborativo
- Marketplace de temas
- Integración con wearables

#### 13.3 Q4 2025
- IA generativa de imágenes
- Modo educativo
- Integración con IoT
- Plataforma de desarrolladores

### 14. Conclusión

Veo Veo representa una evolución significativa en el espacio de juegos sociales, combinando tecnologías emergentes como la IA con mecánicas de juego probadas. La aplicación está completamente funcional con todas las características principales implementadas, incluyendo:

- ✅ Juego core completamente funcional
- ✅ Sistema de autenticación robusto
- ✅ Funciones sociales avanzadas
- ✅ Gamificación completa
- ✅ Monetización implementada
- ✅ Aplicación móvil nativa
- ✅ Modo offline
- ✅ Analytics integrado
- ✅ Sistema de temas personalizable
- ✅ Torneos y competiciones

El producto está listo para el lanzamiento comercial y tiene una base sólida para el crecimiento futuro.

---

**Documento Preparado Por:** Equipo de Desarrollo Veo Veo Vision  
**Última Actualización:** Enero 2025  
**Versión:** 2.0 Final
