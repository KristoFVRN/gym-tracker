/**
 * timer.js - Высокоточный таймер отдыха и разминки с синтезом звука Web Audio API
 */

class SoundEffects {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Звуковой сигнал обратного отсчета (3, 2, 1)
  playTick() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.debug('Audio error', e);
    }
  }

  // Финальный двойной гонг окончания отдыха
  playCompletionChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Тон 1: 880 Гц (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Тон 2: 1320 Гц (E6) через 180 мс
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.18);
      gain2.gain.setValueAtTime(0.3, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.75);
    } catch (e) {
      console.debug('Audio error', e);
    }
  }
}

const soundEffects = new SoundEffects();

class RestTimer {
  constructor() {
    this.totalSeconds = 90;
    this.remainingSeconds = 90;
    this.intervalId = null;
    this.isRunning = false;
    this.isOpen = false;
    this.currentExerciseTitle = '';

    // Элементы DOM
    this.overlay = null;
    this.timeDisplay = null;
    this.progressRing = null;
    this.floatingBar = null;
    this.floatingTime = null;
    this.exerciseLabel = null;
  }

  init() {
    this.overlay = document.getElementById('restTimerModal');
    this.timeDisplay = document.getElementById('timerSecondsText');
    this.progressRing = document.getElementById('timerProgressCircle');
    this.floatingBar = document.getElementById('floatingTimerBar');
    this.floatingTime = document.getElementById('floatingTimerTime');
    this.exerciseLabel = document.getElementById('timerExerciseLabel');

    this.bindEvents();
  }

  bindEvents() {
    // Пресеты времени
    document.querySelectorAll('[data-timer-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const seconds = parseInt(btn.getAttribute('data-timer-preset'), 10);
        this.setTimer(seconds);
        window.TelegramBridge?.hapticImpact('light');
      });
    });

    // Кнопка +30 сек
    const add30Btn = document.getElementById('timerAdd30Btn');
    if (add30Btn) {
      add30Btn.addEventListener('click', () => {
        this.addSeconds(30);
        window.TelegramBridge?.hapticImpact('light');
      });
    }

    // Кнопка пауза/старт
    const toggleBtn = document.getElementById('timerTogglePauseBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.togglePause();
        window.TelegramBridge?.hapticImpact('medium');
      });
    }

    // Свернуть / Закрыть
    const closeBtn = document.getElementById('timerCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal(true);
      });
    }

    // Тап по плавающему бару открывает модалку
    if (this.floatingBar) {
      this.floatingBar.addEventListener('click', () => {
        this.openModal();
      });
    }

    // Закрытие по свайпу или клику вне контейнера
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.closeModal(false);
        }
      });
    }
  }

  start(seconds, exerciseTitle = '') {
    // Активация аудио-контекста по клику пользователя
    soundEffects.getAudioContext();

    this.totalSeconds = Math.max(10, seconds || 90);
    this.remainingSeconds = this.totalSeconds;
    this.currentExerciseTitle = exerciseTitle;
    this.isRunning = true;

    if (this.exerciseLabel) {
      this.exerciseLabel.textContent = exerciseTitle || 'Отдых между подходами';
    }

    this.openModal();
    this.updateDisplay();
    this.startInterval();
  }

  startInterval() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;

      this.remainingSeconds--;

      // Звуковой отсчет на последних 3 секундах
      if (this.remainingSeconds === 3 || this.remainingSeconds === 2 || this.remainingSeconds === 1) {
        soundEffects.playTick();
        window.TelegramBridge?.hapticImpact('light');
      }

      if (this.remainingSeconds <= 0) {
        this.onFinish();
      } else {
        this.updateDisplay();
      }
    }, 1000);
  }

  setTimer(seconds) {
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
    this.isRunning = true;
    this.updateToggleBtnState();
    this.updateDisplay();
  }

  addSeconds(extraSec = 30) {
    this.remainingSeconds += extraSec;
    this.totalSeconds = Math.max(this.totalSeconds, this.remainingSeconds);
    this.updateDisplay();
  }

  togglePause() {
    this.isRunning = !this.isRunning;
    this.updateToggleBtnState();
  }

  updateToggleBtnState() {
    const toggleBtn = document.getElementById('timerTogglePauseBtn');
    if (toggleBtn) {
      toggleBtn.textContent = this.isRunning ? 'Пауза' : 'Продолжить';
      toggleBtn.classList.toggle('btn-paused', !this.isRunning);
    }
  }

  onFinish() {
    this.isRunning = false;
    this.remainingSeconds = 0;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateDisplay();

    // Сигнал окончания
    soundEffects.playCompletionChime();
    window.TelegramBridge?.hapticNotification('success');

    // Автоматическое скрытие модалки через 1.5 секунды
    setTimeout(() => {
      this.closeModal(true);
    }, 1200);
  }

  updateDisplay() {
    const mins = Math.floor(Math.max(0, this.remainingSeconds) / 60);
    const secs = Math.max(0, this.remainingSeconds) % 60;
    const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (this.timeDisplay) {
      this.timeDisplay.textContent = formatted;
    }

    if (this.floatingTime) {
      this.floatingTime.textContent = formatted;
    }

    // Обновление кольца прогресса (SVG Circle dashoffset)
    if (this.progressRing) {
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      const progressFraction = this.remainingSeconds / Math.max(1, this.totalSeconds);
      const offset = circumference * (1 - Math.max(0, Math.min(1, progressFraction)));
      this.progressRing.style.strokeDashoffset = offset;
    }

    // Подсветка активного пресета
    document.querySelectorAll('[data-timer-preset]').forEach(btn => {
      const p = parseInt(btn.getAttribute('data-timer-preset'), 10);
      btn.classList.toggle('active-preset', p === this.totalSeconds);
    });
  }

  openModal() {
    this.isOpen = true;
    if (this.overlay) {
      this.overlay.classList.add('visible');
    }
    if (this.floatingBar) {
      this.floatingBar.classList.remove('visible');
    }
    this.updateToggleBtnState();
  }

  closeModal(stopTimer = false) {
    this.isOpen = false;
    if (this.overlay) {
      this.overlay.classList.remove('visible');
    }

    if (stopTimer) {
      this.isRunning = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.floatingBar) {
        this.floatingBar.classList.remove('visible');
      }
    } else {
      // Свернуть в плавающий бар внизу
      if (this.isRunning && this.remainingSeconds > 0 && this.floatingBar) {
        this.floatingBar.classList.add('visible');
      }
    }
  }
}

// Отдельный контроллер для 10-минутного таймера разминки (беговая дорожка)
class WarmupTimer {
  constructor() {
    this.totalSeconds = 600; // 10 минут
    this.remainingSeconds = 600;
    this.intervalId = null;
    this.isRunning = false;
    this.displayEl = null;
    this.startBtn = null;
    this.resetBtn = null;
  }

  init() {
    this.displayEl = document.getElementById('warmupTimerDisplay');
    this.startBtn = document.getElementById('warmupTimerToggle');
    this.resetBtn = document.getElementById('warmupTimerReset');

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        soundEffects.getAudioContext();
        this.toggle();
        window.TelegramBridge?.hapticImpact('medium');
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.reset();
        window.TelegramBridge?.hapticImpact('light');
      });
    }

    this.updateDisplay();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    if (this.startBtn) {
      this.startBtn.textContent = 'Пауза';
      this.startBtn.classList.add('btn-active');
    }
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.onFinish();
      } else {
        this.updateDisplay();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.startBtn) {
      this.startBtn.textContent = 'Старт (10 мин)';
      this.startBtn.classList.remove('btn-active');
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
  }

  onFinish() {
    this.pause();
    this.remainingSeconds = 0;
    this.updateDisplay();
    soundEffects.playCompletionChime();
    window.TelegramBridge?.hapticNotification('success');

    // Автоматически отметить чекбокс разминки как выполненный
    const warmupCheck = document.getElementById('warmupCheckbox');
    if (warmupCheck && !warmupCheck.checked) {
      warmupCheck.checked = true;
      warmupCheck.dispatchEvent(new Event('change'));
    }
  }

  updateDisplay() {
    if (!this.displayEl) return;
    const mins = Math.floor(Math.max(0, this.remainingSeconds) / 60);
    const secs = Math.max(0, this.remainingSeconds) % 60;
    this.displayEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

window.restTimer = new RestTimer();
window.warmupTimer = new WarmupTimer();
window.soundEffects = soundEffects;
