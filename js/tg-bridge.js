/**
 * tg-bridge.js - Обертка над Telegram WebApp SDK
 * Обеспечивает безопасное взаимодействие, тактильную отдачу (Haptics)
 * и отправку данных боту.
 */

const TelegramBridge = {
  tg: window.Telegram ? window.Telegram.WebApp : null,

  init() {
    if (this.isAvailable()) {
      try {
        this.tg.ready();
        this.tg.expand();
        
        // Синхронизация цветов интерфейса Telegram
        if (this.tg.setHeaderColor) {
          this.tg.setHeaderColor('#0d0f12');
        }
        if (this.tg.setBackgroundColor) {
          this.tg.setBackgroundColor('#0d0f12');
        }

        // Включение подтверждения закрытия при активной тренировке
        if (this.tg.enableClosingConfirmation) {
          this.tg.enableClosingConfirmation();
        }
      } catch (e) {
        console.warn('[TelegramBridge] Init error:', e);
      }
    } else {
      console.log('[TelegramBridge] Running in standalone web mode (outside Telegram WebApp)');
    }
  },

  isAvailable() {
    return Boolean(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== undefined);
  },

  getUser() {
    if (this.isAvailable() && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      return this.tg.initDataUnsafe.user;
    }
    return {
      first_name: 'Атлет',
      username: 'gym_user',
      id: 0
    };
  },

  // Тактильная отдача: light, medium, heavy, rigid, soft
  hapticImpact(style = 'medium') {
    if (this.isAvailable() && this.tg.HapticFeedback && this.tg.HapticFeedback.impactOccurred) {
      try {
        this.tg.HapticFeedback.impactOccurred(style);
      } catch (e) {
        console.debug('[Haptic] impact error', e);
      }
    } else if (navigator.vibrate) {
      // Браузерный fallback для мобильных устройств
      navigator.vibrate(style === 'heavy' ? 40 : 25);
    }
  },

  // Тактильная отдача: error, success, warning
  hapticNotification(type = 'success') {
    if (this.isAvailable() && this.tg.HapticFeedback && this.tg.HapticFeedback.notificationOccurred) {
      try {
        this.tg.HapticFeedback.notificationOccurred(type);
      } catch (e) {
        console.debug('[Haptic] notification error', e);
      }
    } else if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  },

  // Тактильная отдача при переключении табов / селекторов
  hapticSelection() {
    if (this.isAvailable() && this.tg.HapticFeedback && this.tg.HapticFeedback.selectionChanged) {
      try {
        this.tg.HapticFeedback.selectionChanged();
      } catch (e) {
        console.debug('[Haptic] selection error', e);
      }
    }
  },

  // Отправка данных боту через Telegram.WebApp.sendData
  sendDataToBot(dataObject) {
    const jsonStr = typeof dataObject === 'string' ? dataObject : JSON.stringify(dataObject);
    if (this.isAvailable() && this.tg.sendData) {
      try {
        this.tg.sendData(jsonStr);
        return { success: true, method: 'tg_sendData' };
      } catch (e) {
        console.error('[TelegramBridge] sendData failed:', e);
        return { success: false, error: e.message };
      }
    } else {
      console.warn('[TelegramBridge] sendData is not supported in browser preview. Mocking submission.');
      return { success: true, method: 'browser_preview_mock', data: jsonStr };
    }
  },

  closeApp() {
    if (this.isAvailable() && this.tg.close) {
      this.tg.close();
    }
  }
};

window.TelegramBridge = TelegramBridge;
