class NotificationService {
  constructor() {
    this.toast = null;
  }

  setToastInstance(toastInstance) {
    this.toast = toastInstance;
  }

  success(message, title = 'Éxito') {
    if (this.toast) {
      this.toast.add({ severity: 'success', summary: title, detail: message, life: 3000 });
    } else {
      console.log(`[SUCCESS] ${title}: ${message}`);
    }
  }

  error(message, title = 'Error') {
    if (this.toast) {
      this.toast.add({ severity: 'error', summary: title, detail: message, life: 5000 });
    } else {
      console.error(`[ERROR] ${title}: ${message}`);
    }
  }

  warning(message, title = 'Advertencia') {
    if (this.toast) {
      this.toast.add({ severity: 'warn', summary: title, detail: message, life: 4000 });
    } else {
      console.warn(`[WARN] ${title}: ${message}`);
    }
  }

  info(message, title = 'Información') {
    if (this.toast) {
      this.toast.add({ severity: 'info', summary: title, detail: message, life: 3000 });
    } else {
      console.info(`[INFO] ${title}: ${message}`);
    }
  }
}

export const notificationService = new NotificationService();

