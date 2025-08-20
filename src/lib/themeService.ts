export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  isPremium?: boolean;
  isDefault?: boolean;
}

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Clásico',
    description: 'Tema original de Veo Veo',
    isDefault: true,
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#a1a1aa'
    }
  },
  {
    id: 'dark',
    name: 'Oscuro',
    description: 'Tema oscuro elegante',
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#f97316',
      background: '#0a0a0a',
      surface: '#1f1f1f',
      text: '#ffffff',
      textSecondary: '#9ca3af'
    }
  },
  {
    id: 'light',
    name: 'Claro',
    description: 'Tema claro y moderno',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#ea580c',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'neon',
    name: 'Neón',
    description: 'Tema con colores neón vibrantes',
    isPremium: true,
    colors: {
      primary: '#00ff88',
      secondary: '#ff0080',
      accent: '#ffff00',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#888888'
    }
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    description: 'Tema cálido inspirado en atardeceres',
    isPremium: true,
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ffd23f',
      background: '#2d1b69',
      surface: '#3d2b7a',
      text: '#ffffff',
      textSecondary: '#e0e0e0'
    }
  },
  {
    id: 'ocean',
    name: 'Océano',
    description: 'Tema refrescante inspirado en el mar',
    isPremium: true,
    colors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      accent: '#06b6d4',
      background: '#0c4a6e',
      surface: '#0f172a',
      text: '#ffffff',
      textSecondary: '#cbd5e1'
    }
  }
];

export class ThemeService {
  private static readonly THEME_KEY = 'veoveo_theme';
  private static readonly CUSTOM_THEMES_KEY = 'veoveo_custom_themes';

  /**
   * Obtener tema actual
   */
  static getCurrentTheme(): Theme {
    try {
      const themeId = localStorage.getItem(this.THEME_KEY) || 'default';
      const allThemes = [...DEFAULT_THEMES, ...this.getCustomThemes()];
      return allThemes.find(theme => theme.id === themeId) || DEFAULT_THEMES[0];
    } catch (error) {
      console.error('Error getting current theme:', error);
      return DEFAULT_THEMES[0];
    }
  }

  /**
   * Aplicar tema
   */
  static applyTheme(theme: Theme): void {
    try {
      // Guardar en localStorage
      localStorage.setItem(this.THEME_KEY, theme.id);

      // Aplicar variables CSS
      const root = document.documentElement;
      root.style.setProperty('--primary', theme.colors.primary);
      root.style.setProperty('--secondary', theme.colors.secondary);
      root.style.setProperty('--accent', theme.colors.accent);
      root.style.setProperty('--background', theme.colors.background);
      root.style.setProperty('--surface', theme.colors.surface);
      root.style.setProperty('--text', theme.colors.text);
      root.style.setProperty('--text-secondary', theme.colors.textSecondary);

      // Aplicar clases adicionales
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${theme.id}`);

    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }

  /**
   * Obtener todos los temas disponibles
   */
  static getAllThemes(): Theme[] {
    return [...DEFAULT_THEMES, ...this.getCustomThemes()];
  }

  /**
   * Obtener temas personalizados
   */
  static getCustomThemes(): Theme[] {
    try {
      const customThemes = localStorage.getItem(this.CUSTOM_THEMES_KEY);
      return customThemes ? JSON.parse(customThemes) : [];
    } catch (error) {
      console.error('Error getting custom themes:', error);
      return [];
    }
  }

  /**
   * Crear tema personalizado
   */
  static createCustomTheme(theme: Omit<Theme, 'id'>): Theme {
    const customThemes = this.getCustomThemes();
    const newTheme: Theme = {
      ...theme,
      id: `custom_${Date.now()}`
    };

    customThemes.push(newTheme);
    localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(customThemes));

    return newTheme;
  }

  /**
   * Eliminar tema personalizado
   */
  static deleteCustomTheme(themeId: string): boolean {
    try {
      const customThemes = this.getCustomThemes();
      const filteredThemes = customThemes.filter(theme => theme.id !== themeId);
      
      localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(filteredThemes));

      // Si el tema eliminado era el actual, cambiar al default
      if (this.getCurrentTheme().id === themeId) {
        this.applyTheme(DEFAULT_THEMES[0]);
      }

      return true;
    } catch (error) {
      console.error('Error deleting custom theme:', error);
      return false;
    }
  }

  /**
   * Verificar si un tema es premium
   */
  static isThemePremium(themeId: string): boolean {
    const theme = this.getAllThemes().find(t => t.id === themeId);
    return theme?.isPremium || false;
  }

  /**
   * Obtener tema por ID
   */
  static getThemeById(themeId: string): Theme | undefined {
    return this.getAllThemes().find(theme => theme.id === themeId);
  }

  /**
   * Inicializar tema al cargar la aplicación
   */
  static initializeTheme(): void {
    const currentTheme = this.getCurrentTheme();
    this.applyTheme(currentTheme);
  }

  /**
   * Exportar tema personalizado
   */
  static exportTheme(themeId: string): string | null {
    try {
      const theme = this.getThemeById(themeId);
      if (!theme) return null;

      return JSON.stringify(theme, null, 2);
    } catch (error) {
      console.error('Error exporting theme:', error);
      return null;
    }
  }

  /**
   * Importar tema personalizado
   */
  static importTheme(themeJson: string): Theme | null {
    try {
      const theme = JSON.parse(themeJson);
      
      // Validar estructura del tema
      if (!theme.name || !theme.colors) {
        throw new Error('Invalid theme structure');
      }

      // Crear tema personalizado
      return this.createCustomTheme(theme);
    } catch (error) {
      console.error('Error importing theme:', error);
      return null;
    }
  }

  /**
   * Generar tema aleatorio
   */
  static generateRandomTheme(): Theme {
    const colorPalettes = [
      ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
      ['#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5', '#ff8b94'],
      ['#ff9ff3', '#f368e0', '#ff6b6b', '#ee5a24', '#feca57'],
      ['#48dbfb', '#0abde3', '#54a0ff', '#5f27cd', '#c44569'],
      ['#ff9ff3', '#f368e0', '#ff6b6b', '#ee5a24', '#feca57']
    ];

    const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    
    return {
      id: `random_${Date.now()}`,
      name: `Tema Aleatorio ${Math.floor(Math.random() * 1000)}`,
      description: 'Tema generado automáticamente',
      colors: {
        primary: palette[0],
        secondary: palette[1],
        accent: palette[2],
        background: '#0f0f23',
        surface: '#1a1a2e',
        text: '#ffffff',
        textSecondary: '#a1a1aa'
      }
    };
  }
}
