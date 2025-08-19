import { toast } from '@/hooks/use-toast';

interface DetectedObject {
  name: string;
  confidence: number;
}

interface AIDetectionResponse {
  objects: DetectedObject[];
  success: boolean;
  error?: string;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured. Using mock detection.');
    }
  }

  private getMockObjects(): DetectedObject[] {
    const mockObjects = [
      'pelota', 'libro', 'teléfono', 'botella', 'zapato', 'reloj', 'lápiz', 'taza',
      'silla', 'mesa', 'ventana', 'puerta', 'coche', 'árbol', 'flor', 'gato',
      'perro', 'casa', 'computadora', 'televisión', 'cama', 'almohada', 'espejo',
      'lámpara', 'planta', 'cuadro', 'bolso', 'gafas', 'llaves', 'moneda'
    ];

    // Seleccionar 8-12 objetos aleatorios
    const numObjects = Math.floor(Math.random() * 5) + 8;
    const selectedObjects = [];
    const shuffled = [...mockObjects].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numObjects && i < shuffled.length; i++) {
      selectedObjects.push({
        name: shuffled[i],
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      });
    }

    return selectedObjects;
  }

  private async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async detectObjects(imageFile: File): Promise<AIDetectionResponse> {
    try {
      // Si no hay API key configurada, usar detección simulada
      if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de API
        return {
          objects: this.getMockObjects(),
          success: true
        };
      }

      // Convertir imagen a base64
      const base64Image = await this.convertImageToBase64(imageFile);

      // Preparar el prompt para detección de objetos
      const prompt = `Analiza esta imagen y detecta todos los objetos visibles. 
Devuelve ÚNICAMENTE un array JSON con objetos que tengan las propiedades 'name' (en español) y 'confidence' (número entre 0 y 1).
Ejemplo: [{"name": "pelota", "confidence": 0.95}, {"name": "mesa", "confidence": 0.87}]
No incluyas explicaciones adicionales, solo el JSON.`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'low'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from API');
      }

      // Intentar parsear la respuesta JSON
      let objects: DetectedObject[];
      try {
        // Limpiar la respuesta en caso de que tenga texto adicional
        const jsonMatch = content.match(/\[.*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        objects = JSON.parse(jsonString);
        
        // Validar estructura
        if (!Array.isArray(objects)) {
          throw new Error('Response is not an array');
        }
        
        // Filtrar y validar objetos
        objects = objects.filter(obj => 
          obj && 
          typeof obj.name === 'string' && 
          typeof obj.confidence === 'number' &&
          obj.name.trim().length > 0 &&
          obj.confidence >= 0 && obj.confidence <= 1
        );
        
        if (objects.length === 0) {
          throw new Error('No valid objects detected');
        }
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw response:', content);
        throw new Error('Failed to parse AI response');
      }

      return {
        objects,
        success: true
      };

    } catch (error) {
      console.error('AI Detection Error:', error);
      
      // En caso de error, usar detección simulada como fallback
      toast({
        title: "Usando detección simulada",
        description: "Error en la API de IA. Usando objetos de ejemplo.",
        variant: "destructive"
      });
      
      return {
        objects: this.getMockObjects(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Método para verificar si la API está configurada
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_openai_api_key_here');
  }
}

// Exportar instancia singleton
export const aiService = new AIService();
export type { DetectedObject, AIDetectionResponse };