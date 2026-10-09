/**
 * state.js - Управление состоянием тренировки и LocalStorage
 */

const STORAGE_KEY = 'tma_fitness_workout_state_v1';
const TIMER_KEY = 'tma_fitness_start_time_v1';

class WorkoutStateManager {
  constructor() {
    this.state = null;
    this.sessionStartTime = null;
    this.stopwatchInterval = null;
    this.elapsedSeconds = 0;
  }

  init() {
    this.loadState();
    this.initStopwatch();
  }

  loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.state = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse state from localStorage', e);
        this.state = getDefaultWorkoutState();
      }
    } else {
      this.state = getDefaultWorkoutState();
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  resetState() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMER_KEY);
    this.state = getDefaultWorkoutState();
    this.sessionStartTime = Date.now();
    localStorage.setItem(TIMER_KEY, this.sessionStartTime.toString());
    this.elapsedSeconds = 0;
    this.saveState();
  }

  initStopwatch() {
    const storedStart = localStorage.getItem(TIMER_KEY);
    if (storedStart) {
      this.sessionStartTime = parseInt(storedStart, 10);
    } else {
      this.sessionStartTime = Date.now();
      localStorage.setItem(TIMER_KEY, this.sessionStartTime.toString());
    }

    this.updateStopwatchTick();
    if (this.stopwatchInterval) clearInterval(this.stopwatchInterval);
    this.stopwatchInterval = setInterval(() => {
      this.updateStopwatchTick();
    }, 1000);
  }

  updateStopwatchTick() {
    if (!this.sessionStartTime) return;
    this.elapsedSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const headerTime = document.getElementById('headerElapsedTime');
    if (headerTime) {
      const hrs = Math.floor(this.elapsedSeconds / 3600);
      const mins = Math.floor((this.elapsedSeconds % 3600) / 60);
      const secs = this.elapsedSeconds % 60;
      if (hrs > 0) {
        headerTime.textContent = `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      } else {
        headerTime.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }
  }

  // Обновление подхода
  updateSet(exerciseId, setId, updates) {
    const exercise = this.findExercise(exerciseId);
    if (!exercise || !exercise.sets) return;

    const targetSet = exercise.sets.find(s => s.id === setId);
    if (!targetSet) return;

    Object.assign(targetSet, updates);
    this.saveState();
  }

  // Поиск упражнения во всех блоках с учетом режимов
  findExercise(exerciseId) {
    for (const block of this.state.blocks) {
      if (block.type === 'exercises') {
        const found = block.exercises.find(e => e.id === exerciseId);
        if (found) return found;
      } else if (block.type === 'conditional_legs') {
        const modeData = block.modes[block.activeMode];
        if (modeData && modeData.exercises) {
          const found = modeData.exercises.find(e => e.id === exerciseId);
          if (found) return found;
        }
      }
    }
    return null;
  }

  // Переключение режима Дня А / Дня Б для ног
  setLegsMode(modeKey) {
    const legsBlock = this.state.blocks.find(b => b.id === 'block_lower');
    if (legsBlock && legsBlock.modes[modeKey]) {
      legsBlock.activeMode = modeKey;
      this.saveState();
    }
  }

  // Переключение варианта горизонтальной тяги
  setRowVariant(variantId) {
    const upperBlock = this.state.blocks.find(b => b.id === 'block_upper');
    if (upperBlock) {
      const rowExercise = upperBlock.exercises.find(e => e.id === 'horizontal_row_block');
      if (rowExercise) {
        rowExercise.selectedVariant = variantId;
        this.saveState();
      }
    }
  }

  // Отметка разминки
  setWarmupCompleted(completed) {
    const warmupBlock = this.state.blocks.find(b => b.id === 'block_warmup');
    if (warmupBlock && warmupBlock.item) {
      warmupBlock.item.completed = Boolean(completed);
      this.saveState();
    }
  }

  // Подсчет метрик тренировки
  calculateSummary() {
    let totalVolumeKg = 0;
    let completedSetsCount = 0;
    let totalSetsCount = 0;
    const completedExercisesList = [];

    // Разминка
    const warmupBlock = this.state.blocks.find(b => b.id === 'block_warmup');
    const warmupDone = warmupBlock && warmupBlock.item && warmupBlock.item.completed;

    // Сбор упражнений
    for (const block of this.state.blocks) {
      let exerciseList = [];
      if (block.type === 'exercises') {
        exerciseList = block.exercises;
      } else if (block.type === 'conditional_legs') {
        const active = block.modes[block.activeMode];
        if (active && active.exercises) {
          exerciseList = active.exercises;
        }
      }

      for (const ex of exerciseList) {
        let exCompletedSets = 0;
        let exVolume = 0;
        const totalExSets = ex.sets.length;
        totalSetsCount += totalExSets;

        const setsSummary = [];
        ex.sets.forEach(s => {
          if (s.completed) {
            completedSetsCount++;
            exCompletedSets++;
            const vol = Number(s.weight) * Number(s.reps);
            exVolume += vol;
            totalVolumeKg += vol;
            setsSummary.push(`${s.weight} кг × ${s.reps}`);
          }
        });

        if (exCompletedSets > 0) {
          let exTitle = ex.title;
          if (ex.hasVariants) {
            const v = ex.variants.find(x => x.id === ex.selectedVariant);
            if (v) exTitle += ` (${v.label})`;
          }
          completedExercisesList.push({
            title: exTitle,
            machine: ex.machine,
            completedSets: exCompletedSets,
            totalSets: totalExSets,
            setsSummary,
            volume: exVolume
          });
        }
      }
    }

    const durationMinutes = Math.max(1, Math.round(this.elapsedSeconds / 60));

    return {
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      durationMinutes,
      totalVolumeKg,
      completedSetsCount,
      totalSetsCount,
      warmupDone,
      legsMode: this.state.blocks.find(b => b.id === 'block_lower')?.activeMode || 'day_a',
      exercises: completedExercisesList
    };
  }

  // Форматирование текстового отчета для Telegram бота
  formatReportText(summary) {
    const dateFormatted = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    const legsModeLabel = summary.legsMode === 'day_a' ? 'День А (Свободный вес)' : 'День Б (Изоляция)';

    let text = `🏋️‍♂️ <b>Отчет о силовой тренировке</b>\n`;
    text += `📅 <i>${dateFormatted}</i>\n\n`;
    text += `⏱ <b>Длительность:</b> ${summary.durationMinutes} мин\n`;
    text += `📊 <b>Тоннаж:</b> ${summary.totalVolumeKg.toLocaleString('ru-RU')} кг\n`;
    text += `✅ <b>Подходов выполнено:</b> ${summary.completedSetsCount} из ${summary.totalSetsCount}\n`;
    text += `🏃 <b>Разминка (дорожка):</b> ${summary.warmupDone ? '10 мин / 1 км (Выполнена ✅)' : 'Пропущена ⚠️'}\n`;
    text += `🦵 <b>Режим ног:</b> ${legsModeLabel}\n\n`;
    text += `📋 <b>Выполненные упражнения:</b>\n`;

    if (summary.exercises.length === 0) {
      text += `<i>Нет отмеченных подходов.</i>\n`;
    } else {
      summary.exercises.forEach((ex, idx) => {
        text += `\n<b>${idx + 1}. ${ex.title}</b> [${ex.completedSets}/${ex.totalSets}]\n`;
        text += `   • Схема: ${ex.setsSummary.join(', ')}\n`;
        text += `   • Объем: ${ex.volume} кг\n`;
      });
    }

    text += `\n💪 <i>Отличная работа! Тренировка зафиксирована.</i>`;
    return text;
  }
}

window.workoutState = new WorkoutStateManager();
