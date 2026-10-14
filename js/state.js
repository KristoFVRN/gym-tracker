/**
 * state.js - Управление состоянием тренировки, LocalStorage и умными рекомендациями весов
 */

const STORAGE_KEY = 'tma_fitness_workout_state_v1';
const TIMER_KEY = 'tma_fitness_start_time_v1';
const LAST_SESSION_KEY = 'tma_fitness_last_session_v1';
const PR_RECORDS_KEY = 'tma_fitness_personal_records_v1';
const BOT_RECS_KEY = 'tma_fitness_bot_recs_v1';

// Базовые данные тренировки #2 от 13 октября (гарантия работы даже до пересылки URL)
const FALLBACK_INITIAL_SESSION = {
  workoutId: 2,
  date: '2026-10-13',
  totalVolumeKg: 23201,
  durationMinutes: 4,
  exercises: [
    {
      id: 'bench_press_technogym',
      title: 'Жим штанги лёжа',
      sets: [
        { setNum: 1, weight: 60, reps: 10 },
        { setNum: 2, weight: 80, reps: 10 },
        { setNum: 3, weight: 100, reps: 10 },
        { setNum: 4, weight: 110, reps: 4 }
      ]
    },
    {
      id: 'lat_pulldown_matrix',
      title: 'Вертикальная тяга в кроссовере',
      sets: [
        { setNum: 1, weight: 76, reps: 10 },
        { setNum: 2, weight: 82, reps: 10 },
        { setNum: 3, weight: 86, reps: 10 },
        { setNum: 4, weight: 92, reps: 10 }
      ]
    },
    {
      id: 'chest_press_matrix',
      title: 'Жим от груди в тренажере',
      sets: [
        { setNum: 1, weight: 76, reps: 11 },
        { setNum: 2, weight: 76, reps: 11 },
        { setNum: 3, weight: 76, reps: 11 },
        { setNum: 4, weight: 76, reps: 11 }
      ]
    },
    {
      id: 'horizontal_row_block',
      title: 'Горизонтальная тяга на спину (Вариант A)',
      sets: [
        { setNum: 1, weight: 72, reps: 20 },
        { setNum: 2, weight: 72, reps: 20 },
        { setNum: 3, weight: 72, reps: 20 },
        { setNum: 4, weight: 72, reps: 20 }
      ]
    },
    {
      id: 'leg_extension_matrix',
      title: 'Разгибание голени сидя',
      sets: [
        { setNum: 1, weight: 76, reps: 11 },
        { setNum: 2, weight: 86, reps: 11 },
        { setNum: 3, weight: 95, reps: 11 },
        { setNum: 4, weight: 108, reps: 10 }
      ]
    },
    {
      id: 'leg_curl_technogym',
      title: 'Сгибание голени сидя',
      sets: [
        { setNum: 1, weight: 42, reps: 10 },
        { setNum: 2, weight: 47, reps: 10 },
        { setNum: 3, weight: 52, reps: 10 },
        { setNum: 4, weight: 66, reps: 10 }
      ]
    },
    {
      id: 'ab_crunch_panatta',
      title: 'Скручивания на пресс',
      sets: [
        { setNum: 1, weight: 40, reps: 12 },
        { setNum: 2, weight: 40, reps: 12 },
        { setNum: 3, weight: 40, reps: 12 },
        { setNum: 4, weight: 40, reps: 12 }
      ]
    }
  ]
};

class WorkoutStateManager {
  constructor() {
    this.state = null;
    this.sessionStartTime = null;
    this.stopwatchInterval = null;
    this.elapsedSeconds = 0;
    this.lastSessionData = null;
    this.personalRecords = {};
    this.botRecommendations = null;
    this.isBotRecsSource = false;
  }

  init() {
    this.loadHistoryAndPRs();
    this.loadState();
    this.applySmartRecommendationsIfFresh();
    this.initStopwatch();
  }

  loadHistoryAndPRs() {
    try {
      this.parseUrlRecommendations();

      const lastRaw = localStorage.getItem(LAST_SESSION_KEY);
      if (lastRaw) {
        this.lastSessionData = JSON.parse(lastRaw);
      } else {
        this.lastSessionData = FALLBACK_INITIAL_SESSION;
        localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(FALLBACK_INITIAL_SESSION));
      }

      const prRaw = localStorage.getItem(PR_RECORDS_KEY);
      this.personalRecords = prRaw ? JSON.parse(prRaw) : {};
    } catch (e) {
      console.warn('Failed to load history or PRs', e);
      this.lastSessionData = FALLBACK_INITIAL_SESSION;
    }
  }

  parseUrlRecommendations() {
    try {
      let b64Str = null;
      if (typeof window !== 'undefined' && window.location) {
        if (window.location.hash) {
          const match = window.location.hash.match(/recs=([^&]+)/);
          if (match) b64Str = match[1];
        }
        if (!b64Str && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          b64Str = params.get('recs');
        }
      }

      if (b64Str) {
        const normalized = b64Str.replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = decodeURIComponent(escape(atob(normalized)));
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          this.botRecommendations = parsed;
          this.isBotRecsSource = true;
          localStorage.setItem(BOT_RECS_KEY, JSON.stringify(parsed));
          return;
        }
      }

      const cached = localStorage.getItem(BOT_RECS_KEY);
      if (cached) {
        this.botRecommendations = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Could not parse recommendations from URL/storage', e);
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
    this.applySmartRecommendations();
    this.sessionStartTime = Date.now();
    localStorage.setItem(TIMER_KEY, this.sessionStartTime.toString());
    this.elapsedSeconds = 0;
    this.saveState();
  }

  // Применение умных рекомендаций, если тренировка еще не начата (все сеты не выполнены)
  applySmartRecommendationsIfFresh() {
    if (!this.state || !this.state.blocks) return;
    const hasAnyCompleted = this.getAllExercises().some(ex => ex.sets && ex.sets.some(s => s.completed));
    if (!hasAnyCompleted) {
      this.applySmartRecommendations();
    }
  }

  // Проход по всем упражнениям и автозаполнение рекомендованными весами и повторениями
  applySmartRecommendations() {
    if (!this.state || !this.state.blocks) return;

    for (const block of this.state.blocks) {
      let exerciseList = [];
      if (block.type === 'exercises') {
        exerciseList = block.exercises || [];
      } else if (block.type === 'conditional_legs' && block.modes) {
        // Заполняем оба режима (День А и День Б)
        Object.values(block.modes).forEach(m => {
          if (m.exercises) exerciseList.push(...m.exercises);
        });
      }

      for (const ex of exerciseList) {
        if (!ex.sets) continue;
        ex.sets.forEach(set => {
          const rec = this.getSmartRecommendation(ex.id, set.setNum, set.reps, set.weight, ex.isBarbell);
          set.weight = rec.recommendedWeight;
          set.reps = rec.recommendedReps;
          set.recommendation = rec;
        });
      }
    }

    this.saveState();
  }

  // Алгоритм умных рекомендаций прогрессии нагрузок
  getSmartRecommendation(exerciseId, setNum, defaultReps, defaultWeight, isBarbell = false) {
    // 1. Проверяем расчет от Telegram бота
    if (this.botRecommendations && this.botRecommendations[exerciseId]) {
      const recSets = this.botRecommendations[exerciseId];
      const sIdx = setNum - 1;
      if (recSets[sIdx]) {
        const [recW, recR, isProg] = recSets[sIdx];
        return {
          recommendedWeight: recW,
          recommendedReps: recR,
          isProgress: !!isProg,
          badgeText: isProg ? '💡 +2.5 кг прогресс 🔥' : `💡 ${recW} кг (закрепление 💪)`,
          tooltip: isProg ? 'Прогрессивная перегрузка от бота (+2.5 кг)' : 'Закрепление техники'
        };
      }
    }

    // 2. Расчет на основе сохраненной предыдущей тренировки
    const prev = this.getPreviousSet(exerciseId, setNum);

    // Случай 1: Первая тренировка (нет истории)
    if (!prev || !prev.weight) {
      return {
        recommendedWeight: defaultWeight,
        recommendedReps: defaultReps,
        isProgress: false,
        badgeText: '💡 Стартовый вес',
        tooltip: 'Рекомендованная базовая нагрузка'
      };
    }

    const prevW = parseFloat(prev.weight) || defaultWeight;
    const prevR = parseInt(prev.reps, 10) || defaultReps;
    // Для силовой программы фулбоди целевой диапазон гипертрофии 10 повт. (12 для пресса)
    const targetR = (exerciseId === 'ab_crunch_panatta') ? 12 : 10;

    // Случай 2: Прошлый подход выполнен успешно (выполнены все целевые повторения)
    if (prevR >= targetR) {
      let step = (isBarbell || prevW >= 30) ? 2.5 : 1.0;
      const newWeight = Math.round((prevW + step) * 10) / 10;

      return {
        recommendedWeight: newWeight,
        recommendedReps: targetR,
        isProgress: true,
        badgeText: `💡 +${step} кг прогресс 🔥`,
        tooltip: `Прошлый раз: ${prevW} кг × ${prevR}. Прогрессивная перегрузка!`
      };
    }

    // Случай 3: В прошлый раз повторений не хватило — закрепляем вес
    return {
      recommendedWeight: prevW,
      recommendedReps: targetR,
      isProgress: false,
      badgeText: `💡 ${prevW} кг (закрепление 💪)`,
      tooltip: `В прошлый раз было ${prevW} кг × ${prevR}. Закрепляем технику на ${targetR} повт.`
    };
  }



  // Получение данных сета с прошлой тренировки
  getPreviousSet(exerciseId, setNum) {
    if (!this.lastSessionData || !this.lastSessionData.exercises) return null;
    const exData = this.lastSessionData.exercises.find(e => e.id === exerciseId);
    if (!exData || !exData.sets) return null;
    return exData.sets.find(s => s.setNum === setNum) || null;
  }

  // Копирование точных весов прошлой тренировки
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

  // Список всех упражнений активного режима
  getAllExercises() {
    const list = [];
    if (!this.state || !this.state.blocks) return list;
    for (const block of this.state.blocks) {
      if (block.type === 'exercises') {
        list.push(...(block.exercises || []));
      } else if (block.type === 'conditional_legs' && block.modes) {
        const modeData = block.modes[block.activeMode];
        if (modeData && modeData.exercises) list.push(...modeData.exercises);
      }
    }
    return list;
  }

  // Поиск упражнения во всех блоках с учетом режимов
  findExercise(exerciseId) {
    if (!this.state || !this.state.blocks) return null;
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
        const completedSets = [];
        ex.sets.forEach(s => {
          if (s.completed) {
            completedSetsCount++;
            exCompletedSets++;
            const w = parseFloat(s.weight) || 0;
            const r = parseInt(s.reps, 10) || 0;
            const vol = w * r;
            exVolume += vol;
            totalVolumeKg += vol;
            setsSummary.push(`${s.weight} кг × ${s.reps}`);
            completedSets.push({ setNum: s.setNum, weight: w, reps: r });
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
            sets: completedSets,
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

    let text = `🏋️‍♂️ <b>Отчет о силовой тренировке (Full Body)</b>\n`;
    text += `📅 <i>${dateFormatted}</i>\n\n`;
    text += `⏱ <b>Длительность:</b> ${summary.durationMinutes} мин\n`;
    text += `📊 <b>Тоннаж:</b> ${summary.totalVolumeKg.toLocaleString('ru-RU')} кг\n`;
    text += `✅ <b>Подходов выполнено:</b> ${summary.completedSetsCount} из ${summary.totalSetsCount}\n`;
    
    if (summary.warmupDone) {
      const w = summary.warmupSummary || {};
      const m = w.minutes || 10;
      const d = w.distanceKm || 1.0;
      const s = w.speedKmh || 6.2;
      text += `🏃 <b>Разминка (дорожка):</b> ${m} мин / ${d} км (${s} км/ч) ✅\n`;
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
