import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeService, DEFAULT_THEMES } from '../themeService';

describe('ThemeService', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getCurrentTheme', () => {
    it('should return default theme when no theme is set', () => {
      const theme = ThemeService.getCurrentTheme();
      expect(theme.id).toBe('default');
      expect(theme.name).toBe('Clásico');
    });

    it('should return saved theme from localStorage', () => {
      // Configurar el mock para devolver 'dark' para el tema y '[]' para custom themes
      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'veoveo_theme') return 'dark';
        if (key === 'veoveo_custom_themes') return '[]';
        return null;
      });
      const theme = ThemeService.getCurrentTheme();
      expect(theme.id).toBe('dark');
      expect(theme.name).toBe('Oscuro');
    });
  });

  describe('applyTheme', () => {
    it('should save theme to localStorage', () => {
      const theme = DEFAULT_THEMES[1]; // dark theme
      ThemeService.applyTheme(theme);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('veoveo_theme', 'dark');
    });

    it('should apply CSS variables to document root', () => {
      const theme = DEFAULT_THEMES[1]; // dark theme
      ThemeService.applyTheme(theme);
      
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(theme.colors.primary);
      expect(document.documentElement.style.getPropertyValue('--background')).toBe(theme.colors.background);
    });
  });

  describe('getAllThemes', () => {
    it('should return default themes when no custom themes exist', () => {
      const themes = ThemeService.getAllThemes();
      expect(themes).toHaveLength(DEFAULT_THEMES.length);
      expect(themes[0].id).toBe('default');
    });

    it('should include custom themes', () => {
      const customTheme = {
        name: 'Test Theme',
        description: 'Test Description',
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
          accent: '#0000ff',
          background: '#ffffff',
          surface: '#f0f0f0',
          text: '#000000',
          textSecondary: '#666666'
        }
      };

      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'veoveo_theme') return 'default';
        if (key === 'veoveo_custom_themes') return JSON.stringify([customTheme]);
        return null;
      });
      const themes = ThemeService.getAllThemes();
      
      expect(themes.length).toBe(DEFAULT_THEMES.length + 1);
      expect(themes[themes.length - 1].name).toBe('Test Theme');
    });
  });

  describe('createCustomTheme', () => {
    it('should create and save custom theme', () => {
      const customTheme = {
        name: 'Custom Theme',
        description: 'A custom theme',
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
          accent: '#0000ff',
          background: '#ffffff',
          surface: '#f0f0f0',
          text: '#000000',
          textSecondary: '#666666'
        }
      };

      const createdTheme = ThemeService.createCustomTheme(customTheme);
      
      expect(createdTheme.id).toMatch(/^custom_\d+$/);
      expect(createdTheme.name).toBe('Custom Theme');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('isThemePremium', () => {
    it('should return true for premium themes', () => {
      expect(ThemeService.isThemePremium('neon')).toBe(true);
      expect(ThemeService.isThemePremium('sunset')).toBe(true);
    });

    it('should return false for non-premium themes', () => {
      expect(ThemeService.isThemePremium('default')).toBe(false);
      expect(ThemeService.isThemePremium('dark')).toBe(false);
    });
  });

  describe('generateRandomTheme', () => {
    it('should generate a theme with random colors', () => {
      const theme = ThemeService.generateRandomTheme();
      
      expect(theme.id).toMatch(/^random_\d+$/);
      expect(theme.name).toMatch(/^Tema Aleatorio \d+$/);
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.secondary).toBeDefined();
      expect(theme.colors.accent).toBeDefined();
    });
  });
});
