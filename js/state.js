/**
 * state.js - Управление планами тренировок, состоянием сессии и LocalStorage
 */

const STORAGE_KEY = 'tma_fitness_workout_state_v2';
const PLANS_KEY = 'tma_fitness_plans_v2';
const ACTIVE_PLAN_KEY = 'tma_fitness_active_plan_id_v2';
const ACTIVE_DAY_KEY = 'tma_fitness_active_day_id_v2';
const TIMER_KEY = 'tma_fitness_start_time_v1';
const LAST_SESSION_KEY = 'tma_fitness_last_session_v1';
const PR_RECORDS_KEY = 'tma_fitness_personal_records_v1';

class WorkoutStateManager {
  constructor() {
    this.plans = [];
    this.activePlanId = null;
    this.activeDayId = null;
    this.state = null; // Текущий активный день тренировки (содержит blocks и exercises)
    this.sessionStartTime = null;
    this.stopwatchInterval = null;
    this.elapsedSeconds = 0;
    this.lastSessionData = null;
    this.personalRecords = {};
  }

  init() {
    this.loadPlans();
    this.loadActivePlanAndDay();
    this.loadWorkoutState();
    this.loadHistoryAndPRs();
    this.initStopwatch();
  }

  // Загрузка планов
  loadPlans() {
    try {
      const stored = localStorage.getItem(PLANS_KEY);
      if (stored) {
        this.plans = JSON.parse(stored);
      } else {
        this.plans = getDefaultPlans();
        this.savePlans();
      }
    } catch (e) {
      console.warn('Failed to load plans from storage, using defaults', e);
      this.plans = getDefaultPlans();
    }

    // Проверяем наличие дефолтного плана DDX
    const hasDefault = this.plans.some(p => p.id === 'fullbody_ddx_v1');
    if (!hasDefault) {
      const defaults = getDefaultPlans();
      this.plans.unshift(defaults[0]);
      this.savePlans();
    }
  }

  savePlans() {
    try {
      localStorage.setItem(PLANS_KEY, JSON.stringify(this.plans));
    } catch (e) {
      console.warn('Failed to save plans to localStorage', e);
    }
  }

  loadActivePlanAndDay() {
    this.activePlanId = localStorage.getItem(ACTIVE_PLAN_KEY) || 'fullbody_ddx_v1';
    let plan = this.plans.find(p => p.id === this.activePlanId);
    if (!plan) {
      this.activePlanId = this.plans[0]?.id || 'fullbody_ddx_v1';
      plan = this.plans[0];
    }

    this.activeDayId = localStorage.getItem(ACTIVE_DAY_KEY) || plan?.days[0]?.id || 'day_a';
    const dayExists = plan?.days.some(d => d.id === this.activeDayId);
    if (!dayExists) {
      this.activeDayId = plan?.days[0]?.id || 'day_a';
    }
  }

  loadWorkoutState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Проверяем, совпадает ли сохраненный день с выбранным
        if (parsed.planId === this.activePlanId && parsed.dayId === this.activeDayId) {
          this.state = parsed;
          return;
        }
      } catch (e) {
        console.error('Failed to parse active workout state', e);
      }
    }

    // Инициализируем состояние из активного дня плана
    this.resetDayStateFromPlan();
  }

  resetDayStateFromPlan() {
    const plan = this.getActivePlan();
    const day = this.getActiveDay();
    if (!day) return;

    // Клонируем структуру дня
    this.state = JSON.parse(JSON.stringify(day));
    this.state.planId = this.activePlanId;
    this.state.planTitle = plan?.title || 'Full Body';
    this.state.dayId = this.activeDayId;
    this.state.dayTitle = day.title;

    this.saveState();
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  // Получить активный план
  getActivePlan() {
    return this.plans.find(p => p.id === this.activePlanId) || this.plans[0];
  }

  // Получить активный день
  getActiveDay() {
    const plan = this.getActivePlan();
    if (!plan || !plan.days) return null;
    return plan.days.find(d => d.id === this.activeDayId) || plan.days[0];
  }

  getAllPlans() {
    return this.plans;
  }

  // Переключение активного дня (например День А <-> День Б)
  switchActiveDay(dayId) {
    if (this.activeDayId === dayId && this.state) return;
    this.activeDayId = dayId;
    localStorage.setItem(ACTIVE_DAY_KEY, dayId);

    // Сохраняем активный день в плане
    const plan = this.getActivePlan();
    if (plan) {
      plan.activeDayId = dayId;
      this.savePlans();
    }

    this.resetDayStateFromPlan();
  }

  // Переключение активного плана
  switchActivePlan(planId, dayId = null) {
    this.activePlanId = planId;
    localStorage.setItem(ACTIVE_PLAN_KEY, planId);

    const plan = this.getActivePlan();
    this.activeDayId = dayId || plan?.activeDayId || plan?.days[0]?.id || 'day_a';
    localStorage.setItem(ACTIVE_DAY_KEY, this.activeDayId);

    this.resetDayStateFromPlan();
  }

  // Сохранение кастомного плана (создание или обновление)
  saveCustomPlan(plan) {
    const idx = this.plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      this.plans[idx] = plan;
    } else {
      this.plans.push(plan);
    }
    this.savePlans();

    // Если обновлялся текущий активный план — перезагружаем состояние
    if (this.activePlanId === plan.id) {
      this.resetDayStateFromPlan();
    }
  }

  // Удаление кастомного плана
  deletePlan(planId) {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan || plan.isDefault) return false;

    this.plans = this.plans.filter(p => p.id !== planId);
    this.savePlans();

    if (this.activePlanId === planId) {
      this.switchActivePlan('fullbody_ddx_v1', 'day_a');
    }
    return true;
  }

  // Добавление упражнения в текущий активный день
  addExerciseToActiveDay(exercise) {
    if (!this.state || !this.state.blocks) return;
    let exBlock = this.state.blocks.find(b => b.type === 'exercises');
    if (!exBlock) {
      exBlock = {
        id: 'block_exercises',
        number: '2',
        title: 'Упражнения',
        badge: 'Силовая часть',
        subtitle: 'Основные упражнения',
        type: 'exercises',
        exercises: []
      };
      this.state.blocks.push(exBlock);
    }

    exBlock.exercises.push(exercise);
    this.saveState();

    // Также обновляем шаблон в `this.plans`
    const plan = this.getActivePlan();
    const day = plan?.days.find(d => d.id === this.activeDayId);
    if (day) {
      const planExBlock = day.blocks.find(b => b.type === 'exercises');
      if (planExBlock) {
        planExBlock.exercises.push(JSON.parse(JSON.stringify(exercise)));
        this.savePlans();
      }
    }
  }

  // Удаление упражнения из активного дня
  removeExerciseFromActiveDay(exerciseId) {
    if (!this.state || !this.state.blocks) return;
    const exBlock = this.state.blocks.find(b => b.type === 'exercises');
    if (!exBlock) return;

    exBlock.exercises = exBlock.exercises.filter(e => e.id !== exerciseId);
    this.saveState();

    // Также обновляем шаблон в плане
    const plan = this.getActivePlan();
    const day = plan?.days.find(d => d.id === this.activeDayId);
    if (day) {
      const planExBlock = day.blocks.find(b => b.type === 'exercises');
      if (planExBlock) {
        planExBlock.exercises = planExBlock.exercises.filter(e => e.id !== exerciseId);
        this.savePlans();
      }
    }
  }

  // Сброс текущей тренировки
  resetState() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMER_KEY);
    this.resetDayStateFromPlan();
    this.sessionStartTime = Date.now();
    localStorage.setItem(TIMER_KEY, this.sessionStartTime.toString());
    this.elapsedSeconds = 0;
    this.saveState();
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

  // Поиск упражнения
  findExercise(exerciseId) {
    if (!this.state || !this.state.blocks) return null;
    for (const block of this.state.blocks) {
      if (block.type === 'exercises' && block.exercises) {
        const found = block.exercises.find(e => e.id === exerciseId);
        if (found) return found;
      }
    }
    return null;
  }

  // Управление разминкой (беговая дорожка)
  setWarmupCompleted(completed) {
    if (!this.state || !this.state.blocks) return;
    const warmupBlock = this.state.blocks.find(b => b.type === 'warmup');
    if (warmupBlock && warmupBlock.item) {
      warmupBlock.item.completed = !!completed;
      this.saveState();
    }
  }

  updateWarmupSettings(updates) {
    if (!this.state || !this.state.blocks) return;
    const warmupBlock = this.state.blocks.find(b => b.type === 'warmup');
    if (warmupBlock && warmupBlock.item) {
      Object.assign(warmupBlock.item, updates);
      this.saveState();
    }
  }

  // Переключение варианта тяги
  setRowVariant(variantId) {
    const ex = this.findExercise('horizontal_row_block');
    if (ex) {
      ex.selectedVariant = variantId;
      this.saveState();
    }
  }

  // Получение данных сета с прошлой тренировки
  getPreviousSet(exerciseId, setNum) {
    if (!this.lastSessionData || !this.lastSessionData.exercises) return null;
    const exData = this.lastSessionData.exercises.find(e => e.id === exerciseId || e.catalogId === exerciseId);
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

  // Проверка: является ли подход новым рекордом
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

  // Сохранение сессии в историю
  saveCompletedSessionToHistory(summary) {
    try {
      const sessionData = {
        date: summary.date,
        timestamp: summary.timestamp,
        totalVolumeKg: summary.totalVolumeKg,
        durationMinutes: summary.durationMinutes,
        planTitle: summary.planTitle,
        dayTitle: summary.dayTitle,
        exercises: []
      };

      for (const block of this.state.blocks) {
        if (block.type === 'exercises' && block.exercises) {
          for (const ex of block.exercises) {
            const completedSets = ex.sets
              .filter(s => s.completed)
              .map(s => ({ setNum: s.setNum, weight: s.weight, reps: s.reps }));

            if (completedSets.length > 0) {
              sessionData.exercises.push({
                id: ex.id,
                catalogId: ex.catalogId || ex.id,
                title: ex.title,
                sets: completedSets
              });

              // Обновление личных рекордов
              completedSets.forEach(s => {
                const oneRM = this.calculate1RM(s.weight, s.reps);
                const recId = ex.catalogId || ex.id;
                const currPR = this.personalRecords[recId];
                if (!currPR || oneRM > currPR.oneRM || s.weight > currPR.maxWeight) {
                  this.personalRecords[recId] = {
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
      }

      this.lastSessionData = sessionData;
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(PR_RECORDS_KEY, JSON.stringify(this.personalRecords));
    } catch (e) {
      console.warn('Failed to save session to history', e);
    }
  }

  // Калькулятор блинов на гриф
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
    const warmupBlock = this.state.blocks.find(b => b.type === 'warmup');
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
      if (block.type === 'exercises' && block.exercises) {
        for (const ex of block.exercises) {
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
              catalogId: ex.catalogId || ex.id,
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
    }

    const durationMinutes = Math.max(1, Math.round(this.elapsedSeconds / 60));
    const activePlan = this.getActivePlan();
    const activeDay = this.getActiveDay();

    return {
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      durationMinutes,
      totalVolumeKg,
      completedSetsCount,
      totalSetsCount,
      warmupDone,
      warmupSummary,
      planId: this.activePlanId,
      planTitle: activePlan?.title || 'Full Body',
      dayId: this.activeDayId,
      dayTitle: activeDay?.title || this.state.title || 'Фулбоди',
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

    let text = `🏋️‍♂️ <b>Фулбоди отчет: ${summary.planTitle}</b>\n`;
    text += `⚡ <i>${summary.dayTitle}</i> (${dateFormatted})\n\n`;
    text += `⏱ <b>Длительность:</b> ${summary.durationMinutes} мин\n`;
    text += `📊 <b>Тоннаж:</b> ${summary.totalVolumeKg.toLocaleString('ru-RU')} кг\n`;
    text += `✅ <b>Подходов выполнено:</b> ${summary.completedSetsCount} из ${summary.totalSetsCount}\n`;
    
    if (summary.warmupDone) {
      const w = summary.warmupSummary || {};
      const m = w.minutes || 10;
      const d = w.distanceKm || 1.0;
      const s = w.speedKmh || 6.2;
      text += `🏃 <b>Разминка:</b> ${m} мин / ${d} км (${s} км/ч) ✅\n\n`;
    } else {
      text += `🏃 <b>Разминка:</b> Пропущена ⚠️\n\n`;
    }
    
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

    text += `\n💪 <i>Отличная тренировка всего тела! Зафиксировано.</i>`;
    return text;
  }
}

window.workoutState = new WorkoutStateManager();
