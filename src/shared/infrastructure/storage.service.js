export class StorageService {
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Métodos específicos para la aplicación
  static setToken(token) {
    this.setItem('movesys_token', token);
  }

  static getToken() {
    return this.getItem('movesys_token');
  }

  static setUser(user) {
    this.setItem('movesys_user', user);
  }

  static getUser() {
    return this.getItem('movesys_user');
  }

  static setLanguage(language) {
    this.setItem('movesys_language', language);
  }

  static getLanguage() {
    return this.getItem('movesys_language', 'es');
  }

  static setTheme(theme) {
    this.setItem('movesys_theme', theme);
  }

  static getTheme() {
    return this.getItem('movesys_theme', 'light');
  }

  static clearAuth() {
    this.removeItem('movesys_token');
    this.removeItem('movesys_user');
  }
}

