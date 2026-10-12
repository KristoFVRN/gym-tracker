/**
 * state.js - Управление состоянием тренировки и LocalStorage
 */

const STORAGE_KEY = 'tma_fitness_workout_state_v1';
const TIMER_KEY = 'tma_fitness_start_time_v1';
const LAST_SESSION_KEY = 'tma_fitness_last_session_v1';
const PR_RECORDS_KEY = 'tma_fitness_personal_records_v1';

class WorkoutStateManager {
  constructor() {
    this.state = null;
    this.sessionStartTime = null;
    this.stopwatchInterval = null;
    this.elapsedSeconds = 0;
    this.lastSessionData = null;
    this.personalRecords = {};
  }

  init() {
    this.loadState();
    this.loadHistoryAndPRs();
    this.initStopwatch();
  }

  loadHistoryAndPRs() {
    try {
      const lastRaw = localStorage.getItem(LAST_SESSION_KEY);
      this.lastSessionData = lastRaw ? JSON.parse(lastRaw) : null;
      const prRaw = localStorage.getItem(PR_RECORDS_KEY);
      this.personalRecords = prRaw ? JSON.parse(prRaw) : {};
    } catch (e) {
      console.warn('Failed to load history or PRs', e);
    }
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

  // Управление разминкой (беговая дорожка)
  setWarmupCompleted(completed) {
    const warmupBlock = this.state.blocks.find(b => b.id === 'block_warmup');
    if (warmupBlock && warmupBlock.item) {
      warmupBlock.item.completed = !!completed;
      this.saveState();
    }
  }

  updateWarmupSettings(updates) {
    const warmupBlock = this.state.blocks.find(b => b.id === 'block_warmup');
    if (warmupBlock && warmupBlock.item) {
      Object.assign(warmupBlock.item, updates);
      this.saveState();
    }
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

  // Получение данных сета с прошлой тренировки
  getPreviousSet(exerciseId, setNum) {
    if (!this.lastSessionData || !this.lastSessionData.exercises) return null;
    const exData = this.lastSessionData.exercises.find(e => e.id === exerciseId);
    if (!exData || !exData.sets) return null;
    return exData.sets.find(s => s.setNum === setNum) || null;
  }

  // Копирование весов прошлой тренировки в текущее упражнение
  copyPreviousExerciseWeights(exerciseId) {
    const exercise = this.findExercise(exerciseId);
    if (!exercise || !exercise.sets) return false;

    let modified = false;
    exercise.sets.forEach(set => {
      const prev = this.getPreviousSet(exerciseId, set.setNum);
      if (prev && prev.weight) {
        set.weight = prev.weight;
        if (prev.reps) set.reps = prev.reps;
        modified = true;
      }
    });

    if (modified) {
      this.saveState();
    }
    return modified;
  }

  // Расчет одноповторного максимума (1ПМ по формуле Эпли)
  calculate1RM(weight, reps) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30) * 10) / 10;
  }

  // Личный рекорд упражнения
  getPersonalRecord(exerciseId) {
    return this.personalRecords[exerciseId] || null;
  }

  // Проверка: является ли текущий подход новым личным рекордом (PR)
  checkIsNewPR(exerciseId, weight, reps) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (w <= 0 || r <= 0) return { isPR: false };

    const current1RM = this.calculate1RM(w, r);
    const existing = this.personalRecords[exerciseId];

    if (!existing) {
      return { isPR: true, oneRM: current1RM, weight: w, reps: r };
    }

    if (current1RM > existing.oneRM || w > existing.maxWeight) {
      return { isPR: true, oneRM: current1RM, weight: w, reps: r, prev1RM: existing.oneRM };
    }

    return { isPR: false, oneRM: current1RM };
  }

  // Сохранение завершенной тренировки в историю и обновление рекордов
  saveCompletedSessionToHistory(summary) {
    try {
      const sessionData = {
        date: summary.date,
        timestamp: summary.timestamp,
        totalVolumeKg: summary.totalVolumeKg,
        durationMinutes: summary.durationMinutes,
        exercises: []
      };

      for (const block of this.state.blocks) {
        let exerciseList = [];
        if (block.type === 'exercises') {
          exerciseList = block.exercises;
        } else if (block.type === 'conditional_legs') {
          const active = block.modes[block.activeMode];
          if (active && active.exercises) exerciseList = active.exercises;
        }

        for (const ex of exerciseList) {
          const completedSets = ex.sets
            .filter(s => s.completed)
            .map(s => ({ setNum: s.setNum, weight: s.weight, reps: s.reps }));

          if (completedSets.length > 0) {
            sessionData.exercises.push({
              id: ex.id,
              title: ex.title,
              sets: completedSets
            });

            // Обновление личных рекордов
            completedSets.forEach(s => {
              const oneRM = this.calculate1RM(s.weight, s.reps);
              const currPR = this.personalRecords[ex.id];
              if (!currPR || oneRM > currPR.oneRM || s.weight > currPR.maxWeight) {
                this.personalRecords[ex.id] = {
                  maxWeight: Math.max(s.weight, currPR ? currPR.maxWeight : 0),
                  repsAtMax: s.reps,
                  oneRM: Math.max(oneRM, currPR ? currPR.oneRM : 0),
                  date: summary.date
                };
              }
            });
          }
        }
      }

      this.lastSessionData = sessionData;
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(PR_RECORDS_KEY, JSON.stringify(this.personalRecords));
    } catch (e) {
      console.warn('Failed to save session to history', e);
    }
  }

  // Калькулятор блинов на гриф (20 кг гриф по умолчанию)
  calculatePlates(totalWeight, barWeight = 20) {
    const weight = parseFloat(totalWeight) || 0;
    if (weight <= barWeight) {
      return { perSide: 0, plates: [], barWeight };
    }

    const neededPerSide = (weight - barWeight) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const plates = [];
    let rem = neededPerSide;

    for (const plate of availablePlates) {
      while (rem >= plate - 0.01) {
        plates.push(plate);
        rem -= plate;
      }
    }

    return {
      perSide: Math.round(neededPerSide * 10) / 10,
      plates,
      barWeight
    };
  }

  // Подсчет метрик тренировки
  calculateSummary() {
    let totalVolumeKg = 0;
    let completedSetsCount = 0;
    let totalSetsCount = 0;
    const completedExercisesList = [];

    // Разминка
    const warmupBlock = this.state.blocks.find(b => b.id === 'block_warmup');
    const warmupItem = warmupBlock ? warmupBlock.item : null;
    const warmupDone = warmupItem && warmupItem.completed;
    const warmupSummary = warmupItem ? {
      completed: !!warmupItem.completed,
      minutes: Math.round((warmupItem.targetTimeSec || 600) / 60),
      distanceKm: parseFloat(warmupItem.targetDistanceKm) || 1.0,
      speedKmh: parseFloat(warmupItem.targetSpeedKmh) || 6.2
    } : null;

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
            id: ex.id,
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
      warmupSummary,
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
    
    if (summary.warmupDone) {
      const w = summary.warmupSummary || {};
      const m = w.minutes || 10;
      const d = w.distanceKm || 1.0;
      const s = w.speedKmh || 6.2;
      text += `🏃 <b>Разминка (дорожка):</b> ${m} мин / ${d} км (${s} км/ч) (Выполнена ✅)\n`;
    } else {
      text += `🏃 <b>Разминка (дорожка):</b> Пропущена ⚠️\n`;
    }
    
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
