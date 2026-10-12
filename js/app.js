/**
 * app.js - Главный контроллер приложения и рендеринг компонентов
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация Telegram SDK
  window.TelegramBridge.init();

  // 2. Инициализация хранилища и таймеров
  window.workoutState.init();
  window.restTimer.init();
  window.warmupTimer.init();

  // 3. Отображение приветствия пользователя Telegram
  renderUserInfo();

  // 4. Отрисовка программы
  renderWorkoutApp();

  // 5. Привязка глобальных модальных окон
  bindGlobalModals();

  // Обновление общего тоннажа в шапке
  updateHeaderStats();
});

function renderUserInfo() {
  const user = window.TelegramBridge.getUser();
  const userNameEl = document.getElementById('headerUserName');
  if (userNameEl && user.first_name) {
    userNameEl.textContent = `Атлет: ${user.first_name}`;
  }
}

function updateHeaderStats() {
  const summary = window.workoutState.calculateSummary();
  const tonnageEl = document.getElementById('headerTonnage');
  const setsCountEl = document.getElementById('headerCompletedSets');

  if (tonnageEl) {
    tonnageEl.textContent = `${summary.totalVolumeKg.toLocaleString('ru-RU')} кг`;
  }
  if (setsCountEl) {
    setsCountEl.textContent = `${summary.completedSetsCount}/${summary.totalSetsCount}`;
  }
}

function renderWorkoutApp() {
  const container = document.getElementById('blocksContainer');
  if (!container) return;

  container.innerHTML = '';

  const blocks = window.workoutState.state.blocks;

  blocks.forEach(block => {
    if (block.type === 'warmup') {
      container.appendChild(createWarmupCard(block));
    } else if (block.type === 'exercises') {
      container.appendChild(createExerciseBlock(block));
    } else if (block.type === 'conditional_legs') {
      container.appendChild(createLegsBlock(block));
    }
  });
}

/**
 * БЛОК 1: Кардио разминка
 */
function createWarmupCard(block) {
  const card = document.createElement('section');
  card.className = 'block-card warmup-card';
  card.id = block.id;

  const item = block.item;
  const isDone = item.completed;
  const currentMinutes = Math.round((item.targetTimeSec || 600) / 60);
  const currentDist = parseFloat(item.targetDistanceKm != null ? item.targetDistanceKm : 1.0);
  const currentSpeed = parseFloat(item.targetSpeedKmh != null ? item.targetSpeedKmh : 6.2);

  card.innerHTML = `
    <div class="block-header">
      <div class="block-number-badge">${block.number}</div>
      <div class="block-title-box">
        <div class="block-header-row">
          <h2 class="block-title">${block.title}</h2>
          <span class="badge badge-accent">${block.badge}</span>
        </div>
        <p class="block-subtitle">${block.subtitle}</p>
      </div>
    </div>

    <div class="exercise-item warmup-exercise ${isDone ? 'is-completed' : ''}">
      ${item.image ? `
      <div class="exercise-photo-wrapper">
        <img src="${item.image}" alt="${item.title}" class="exercise-photo" loading="lazy" />
        <span class="exercise-photo-badge">📍 ${item.machine}</span>
      </div>` : ''}

      <div class="exercise-top">
        <div>
          <h3 class="exercise-title">${item.title}</h3>
          <span class="machine-tag">📍 ${item.machine}</span>
        </div>
      </div>

      <div class="warmup-controls-grid">
        <!-- Время -->
        <div class="warmup-control-card">
          <span class="control-label">⏱ Время</span>
          <div class="warmup-stepper">
            <button type="button" class="btn-step-mini" id="btnWarmupTimeMinus" title="-1 мин">−1</button>
            <div class="stepper-value-wrap">
              <input type="number" id="warmupTimeInput" class="stepper-input" value="${currentMinutes}" min="1" max="60" step="1" />
              <span class="stepper-unit">мин</span>
            </div>
            <button type="button" class="btn-step-mini" id="btnWarmupTimePlus" title="+1 мин">+1</button>
          </div>
        </div>

        <!-- Дистанция -->
        <div class="warmup-control-card">
          <span class="control-label">📏 Дистанция</span>
          <div class="warmup-stepper">
            <button type="button" class="btn-step-mini" id="btnWarmupDistMinus" title="-0.1 км">−0.1</button>
            <div class="stepper-value-wrap">
              <input type="number" id="warmupDistInput" class="stepper-input" value="${currentDist.toFixed(1)}" min="0.1" max="30" step="0.1" />
              <span class="stepper-unit">км</span>
            </div>
            <button type="button" class="btn-step-mini" id="btnWarmupDistPlus" title="+0.1 км">+0.1</button>
          </div>
        </div>

        <!-- Скорость -->
        <div class="warmup-control-card">
          <span class="control-label">⚡ Скорость</span>
          <div class="warmup-stepper">
            <button type="button" class="btn-step-mini" id="btnWarmupSpeedMinus" title="-0.2 км/ч">−0.2</button>
            <div class="stepper-value-wrap">
              <input type="number" id="warmupSpeedInput" class="stepper-input" value="${currentSpeed.toFixed(1)}" min="1" max="25" step="0.2" />
              <span class="stepper-unit">км/ч</span>
            </div>
            <button type="button" class="btn-step-mini" id="btnWarmupSpeedPlus" title="+0.2 км/ч">+0.2</button>
          </div>
        </div>
      </div>

      <div class="warmup-timer-bar">
        <div class="timer-display-digits" id="warmupTimerDisplay">${currentMinutes < 10 ? '0' : ''}${currentMinutes}:00</div>
        <div class="warmup-timer-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="warmupTimerToggle">Старт (${currentMinutes} мин)</button>
          <button type="button" class="btn btn-icon btn-sm" id="warmupTimerReset" title="Сбросить">↺</button>
        </div>
      </div>

      <label class="warmup-checkbox-label">
        <input type="checkbox" id="warmupCheckbox" ${isDone ? 'checked' : ''} />
        <span class="custom-checkbox"></span>
        <span class="checkbox-text">Разминка завершена</span>
      </label>

      <div class="exercise-notes">💡 ${item.notes}</div>
    </div>
  `;

  // Обработчики интерактивных степперов
  const timeInput = card.querySelector('#warmupTimeInput');
  const distInput = card.querySelector('#warmupDistInput');
  const speedInput = card.querySelector('#warmupSpeedInput');

  const onTimeChange = (newMins) => {
    const val = Math.max(1, Math.min(60, parseInt(newMins, 10) || 10));
    timeInput.value = val;
    window.workoutState.updateWarmupSettings({ targetTimeSec: val * 60 });
    window.warmupTimer?.setDuration(val * 60);
    window.TelegramBridge?.hapticImpact('light');
  };

  card.querySelector('#btnWarmupTimeMinus').addEventListener('click', () => {
    onTimeChange((parseInt(timeInput.value, 10) || 10) - 1);
  });
  card.querySelector('#btnWarmupTimePlus').addEventListener('click', () => {
    onTimeChange((parseInt(timeInput.value, 10) || 10) + 1);
  });
  timeInput.addEventListener('change', (e) => onTimeChange(e.target.value));

  const onDistChange = (newDist) => {
    const val = Math.max(0.1, Math.min(30, Math.round((parseFloat(newDist) || 1.0) * 10) / 10));
    distInput.value = val.toFixed(1);
    window.workoutState.updateWarmupSettings({ targetDistanceKm: val });
    window.TelegramBridge?.hapticImpact('light');
  };

  card.querySelector('#btnWarmupDistMinus').addEventListener('click', () => {
    onDistChange((parseFloat(distInput.value) || 1.0) - 0.1);
  });
  card.querySelector('#btnWarmupDistPlus').addEventListener('click', () => {
    onDistChange((parseFloat(distInput.value) || 1.0) + 0.1);
  });
  distInput.addEventListener('change', (e) => onDistChange(e.target.value));

  const onSpeedChange = (newSpeed) => {
    const val = Math.max(1, Math.min(25, Math.round((parseFloat(newSpeed) || 6.2) * 10) / 10));
    speedInput.value = val.toFixed(1);
    window.workoutState.updateWarmupSettings({ targetSpeedKmh: val });
    window.TelegramBridge?.hapticImpact('light');
  };

  card.querySelector('#btnWarmupSpeedMinus').addEventListener('click', () => {
    onSpeedChange((parseFloat(speedInput.value) || 6.2) - 0.2);
  });
  card.querySelector('#btnWarmupSpeedPlus').addEventListener('click', () => {
    onSpeedChange((parseFloat(speedInput.value) || 6.2) + 0.2);
  });
  speedInput.addEventListener('change', (e) => onSpeedChange(e.target.value));

  // Инициализация таймера разминки
  setTimeout(() => {
    if (window.warmupTimer) {
      window.warmupTimer.init();
      window.warmupTimer.setDuration(currentMinutes * 60);
    }
  }, 0);

  // Обработчик чекбокса
  const checkbox = card.querySelector('#warmupCheckbox');
  checkbox.addEventListener('change', (e) => {
    window.workoutState.setWarmupCompleted(e.target.checked);
    const exBox = card.querySelector('.warmup-exercise');
    exBox.classList.toggle('is-completed', e.target.checked);
    window.TelegramBridge.hapticImpact(e.target.checked ? 'heavy' : 'light');
    updateHeaderStats();
  });

  return card;
}

/**
 * БЛОКИ С УПРАЖНЕНИЯМИ (Верх тела, Пресс)
 */
function createExerciseBlock(block) {
  const card = document.createElement('section');
  card.className = 'block-card';
  card.id = block.id;

  card.innerHTML = `
    <div class="block-header">
      <div class="block-number-badge">${block.number}</div>
      <div class="block-title-box">
        <div class="block-header-row">
          <h2 class="block-title">${block.title}</h2>
          <span class="badge ${block.id === 'block_core' ? 'badge-purple' : 'badge-primary'}">${block.badge}</span>
        </div>
        <p class="block-subtitle">${block.subtitle}</p>
      </div>
    </div>
    <div class="exercises-list" id="list_${block.id}"></div>
  `;

  const listEl = card.querySelector(`#list_${block.id}`);
  block.exercises.forEach(exercise => {
    listEl.appendChild(createExerciseElement(exercise));
  });

  return card;
}

/**
 * БЛОК 3: Нижняя часть тела (Селектор День А / День Б)
 */
function createLegsBlock(block) {
  const card = document.createElement('section');
  card.className = 'block-card';
  card.id = block.id;

  const currentMode = block.activeMode || 'day_a';

  card.innerHTML = `
    <div class="block-header">
      <div class="block-number-badge">${block.number}</div>
      <div class="block-title-box">
        <div class="block-header-row">
          <h2 class="block-title">${block.title}</h2>
          <span class="badge badge-accent">${block.badge}</span>
        </div>
        <p class="block-subtitle">${block.subtitle}</p>
      </div>
    </div>

    <!-- Переключатель Дней -->
    <div class="mode-switch-container">
      <button type="button" class="mode-switch-btn ${currentMode === 'day_a' ? 'active' : ''}" data-leg-mode="day_a">
        <span class="mode-btn-indicator"></span>
        <div class="mode-btn-text">
          <div class="mode-btn-title">День А</div>
          <div class="mode-btn-desc">Свободный вес (Присед)</div>
        </div>
      </button>
      <button type="button" class="mode-switch-btn ${currentMode === 'day_b' ? 'active' : ''}" data-leg-mode="day_b">
        <span class="mode-btn-indicator"></span>
        <div class="mode-btn-text">
          <div class="mode-btn-title">День Б</div>
          <div class="mode-btn-desc">Изоляция (Тренажеры)</div>
        </div>
      </button>
    </div>

    <div class="exercises-list" id="legsExercisesContainer"></div>
  `;

  const exercisesContainer = card.querySelector('#legsExercisesContainer');
  renderLegsExercises(exercisesContainer, block, currentMode);

  // Слушатели переключателя режимов
  card.querySelectorAll('[data-leg-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modeKey = btn.getAttribute('data-leg-mode');
      if (modeKey === block.activeMode) return;

      window.workoutState.setLegsMode(modeKey);
      window.TelegramBridge.hapticSelection();

      card.querySelectorAll('[data-leg-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderLegsExercises(exercisesContainer, block, modeKey);
      updateHeaderStats();
    });
  });

  return card;
}

function renderLegsExercises(container, block, modeKey) {
  container.innerHTML = '';
  const currentModeData = block.modes[modeKey];
  if (!currentModeData) return;

  currentModeData.exercises.forEach(exercise => {
    container.appendChild(createExerciseElement(exercise));
  });
}

/**
 * Отрисовка отдельного упражнения с вариантами и подходами
 */
function createExerciseElement(exercise) {
  const item = document.createElement('div');
  item.className = 'exercise-item';
  item.id = `ex_${exercise.id}`;

  let variantSelectorHtml = '';
  if (exercise.hasVariants && exercise.variants) {
    variantSelectorHtml = `
      <div class="variant-selector-box">
        <label class="variant-selector-label">Выберите тренажер/рукоять:</label>
        <div class="variant-pill-group">
          ${exercise.variants.map(v => `
            <button type="button" 
              class="variant-pill-btn ${v.id === exercise.selectedVariant ? 'active' : ''}" 
              data-variant-id="${v.id}"
              data-parent-ex="${exercise.id}">
              ${v.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Определение названия текущего оборудования и изображения
  let activeMachine = exercise.machine;
  let activeImage = exercise.image;
  if (exercise.hasVariants) {
    const selV = exercise.variants.find(v => v.id === exercise.selectedVariant);
    if (selV) {
      activeMachine = selV.machine;
      if (selV.image) activeImage = selV.image;
    }
  }

  item.innerHTML = `
    ${activeImage ? `
    <div class="exercise-photo-wrapper">
      <img src="${activeImage}" alt="${exercise.title}" class="exercise-photo" id="photo_${exercise.id}" loading="lazy" />
      <span class="exercise-photo-badge" id="photoBadge_${exercise.id}">📍 ${activeMachine}</span>
    </div>` : ''}

    <div class="exercise-top">
      <div>
        <h3 class="exercise-title">${exercise.title}</h3>
        <span class="machine-tag" id="machine_${exercise.id}">📍 ${activeMachine}</span>
      </div>
      <div class="exercise-top-actions">
        ${exercise.isBarbell ? `
        <button type="button" class="btn-top-chip btn-plates-calc" data-barbell-id="${exercise.id}" title="Калькулятор блинов">
          🥞 Блины
        </button>` : ''}
        <button type="button" class="btn-top-chip btn-copy-prev" data-copy-ex="${exercise.id}" title="Взять веса прошлой тренировки">
          📋 Прошлый
        </button>
        <button type="button" class="quick-timer-badge" data-quick-rest="${exercise.targetRestSec}" title="Запустить отдых">
          ⏱ ${exercise.targetRestSec}с
        </button>
      </div>
    </div>

    ${variantSelectorHtml}

    <div class="sets-table-wrapper">
      <div class="sets-table-header">
        <span class="col-num">Сет</span>
        <span class="col-weight">Вес (кг)</span>
        <span class="col-reps">Повт.</span>
        <span class="col-action">Статус</span>
      </div>
      <div class="sets-rows-list" id="sets_${exercise.id}"></div>
    </div>

    <div class="exercise-notes">💡 ${exercise.notes}</div>
  `;

  // Быстрый запуск таймера
  const timerBadge = item.querySelector('.quick-timer-badge');
  if (timerBadge) {
    timerBadge.addEventListener('click', () => {
      window.restTimer.start(exercise.targetRestSec, exercise.title);
      window.TelegramBridge.hapticImpact('light');
    });
  }

  // Копирование весов с прошлой тренировки
  const copyPrevBtn = item.querySelector(`[data-copy-ex="${exercise.id}"]`);
  if (copyPrevBtn) {
    copyPrevBtn.addEventListener('click', () => {
      const ok = window.workoutState.copyPreviousExerciseWeights(exercise.id);
      if (ok) {
        window.TelegramBridge.hapticNotification('success');
        renderWorkoutApp();
      } else {
        alert('Для этого упражнения еще нет сохраненной прошлой тренировки.');
      }
    });
  }

  // Калькулятор блинов для штанги
  const platesBtn = item.querySelector(`[data-barbell-id="${exercise.id}"]`);
  if (platesBtn) {
    platesBtn.addEventListener('click', () => {
      const heavySet = exercise.sets.slice().reverse().find(s => s.weight > 20) || exercise.sets[0];
      const calc = window.workoutState.calculatePlates(heavySet.weight);
      let msg = `🏋️ Калькулятор блинов для веса ${heavySet.weight} кг:\n`;
      msg += `• Гриф: ${calc.barWeight} кг\n`;
      msg += `• На каждую сторону: ${calc.perSide} кг\n`;
      if (calc.plates.length > 0) {
        msg += `• Блины на сторону: ${calc.plates.map(p => `${p} кг`).join(' + ')}`;
      } else {
        msg += `• Пустой гриф без блинов`;
      }
      alert(msg);
      window.TelegramBridge.hapticImpact('medium');
    });
  }

  // Переключение вариантов (например, для горизонтальной тяги)
  if (exercise.hasVariants) {
    item.querySelectorAll('.variant-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const variantId = btn.getAttribute('data-variant-id');
        window.workoutState.setRowVariant(variantId);
        window.TelegramBridge.hapticSelection();

        item.querySelectorAll('.variant-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Обновляем тег тренажера и фото
        const found = exercise.variants.find(v => v.id === variantId);
        if (found) {
          const machTag = item.querySelector(`#machine_${exercise.id}`);
          if (machTag) machTag.textContent = `📍 ${found.machine}`;
          const photoImg = item.querySelector(`#photo_${exercise.id}`);
          if (photoImg && found.image) photoImg.src = found.image;
          const photoBadge = item.querySelector(`#photoBadge_${exercise.id}`);
          if (photoBadge) photoBadge.textContent = `📍 ${found.machine}`;
        }
      });
    });
  }

  // Отрисовка подходов
  const setsListEl = item.querySelector(`#sets_${exercise.id}`);
  exercise.sets.forEach(set => {
    setsListEl.appendChild(createSetRow(exercise, set));
  });

  return item;
}

/**
 * Отрисовка строки одного подхода со степперами, подсказкой прошлых весов и PR
 */
function createSetRow(exercise, set) {
  const row = document.createElement('div');
  row.className = `set-row ${set.completed ? 'is-completed' : ''}`;
  row.id = `row_${set.id}`;

  const typeLabels = {
    warmup: 'Разминка',
    work: 'Рабочий',
    heavy: 'Пик'
  };

  const prevSet = window.workoutState.getPreviousSet(exercise.id, set.setNum);
  const prevHintText = prevSet ? `${prevSet.weight}кг×${prevSet.reps}` : '';
  const prCheck = window.workoutState.checkIsNewPR(exercise.id, set.weight, set.reps);
  const oneRM = window.workoutState.calculate1RM(set.weight, set.reps);

  row.innerHTML = `
    <!-- Номер сета и PR -->
    <div class="col-num set-number-badge">
      <div class="set-index-row">
        <span class="set-index">${set.setNum}</span>
        ${prCheck.isPR ? `<span class="pr-badge-mini" title="Новый личный рекорд! 1ПМ: ${oneRM}кг">PR🔥</span>` : ''}
      </div>
      <span class="set-type-tag ${set.type}">${typeLabels[set.type] || ''}</span>
    </div>

    <!-- Вес со степперами и подсказкой -->
    <div class="col-weight stepper-control">
      <button type="button" class="step-btn step-minus" data-step-weight="-2.5">−</button>
      <div class="stepper-center-box">
        <input type="number" step="0.5" min="0" max="400" class="step-input weight-input" value="${set.weight}" />
        <span class="set-hint-line">${prevHintText ? `пред: ${prevHintText}` : `1ПМ: ${oneRM}`}</span>
      </div>
      <button type="button" class="step-btn step-plus" data-step-weight="+2.5">+</button>
    </div>

    <!-- Повторения со степперами -->
    <div class="col-reps stepper-control">
      <button type="button" class="step-btn step-minus" data-step-reps="-1">−</button>
      <input type="number" step="1" min="1" max="100" class="step-input reps-input" value="${set.reps}" />
      <button type="button" class="step-btn step-plus" data-step-reps="+1">+</button>
    </div>

    <!-- Кнопка "Готово" -->
    <div class="col-action">
      <button type="button" class="btn-check-set ${set.completed ? 'checked' : ''}" title="Отметить подход">
        <svg class="check-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </button>
    </div>
  `;

  const weightInput = row.querySelector('.weight-input');
  const repsInput = row.querySelector('.reps-input');
  const checkBtn = row.querySelector('.btn-check-set');

  // Слушатели кнопок веса
  row.querySelector('[data-step-weight="-2.5"]').addEventListener('click', () => {
    let val = Math.max(0, parseFloat(weightInput.value || 0) - 2.5);
    weightInput.value = val;
    window.workoutState.updateSet(exercise.id, set.id, { weight: val });
    window.TelegramBridge.hapticImpact('light');
    updateHeaderStats();
  });

  row.querySelector('[data-step-weight="+2.5"]').addEventListener('click', () => {
    let val = parseFloat(weightInput.value || 0) + 2.5;
    weightInput.value = val;
    window.workoutState.updateSet(exercise.id, set.id, { weight: val });
    window.TelegramBridge.hapticImpact('light');
    updateHeaderStats();
  });

  weightInput.addEventListener('change', () => {
    let val = Math.max(0, parseFloat(weightInput.value) || 0);
    weightInput.value = val;
    window.workoutState.updateSet(exercise.id, set.id, { weight: val });
    updateHeaderStats();
  });

  // Слушатели кнопок повторений
  row.querySelector('[data-step-reps="-1"]').addEventListener('click', () => {
    let val = Math.max(1, parseInt(repsInput.value || 1, 10) - 1);
    repsInput.value = val;
    window.workoutState.updateSet(exercise.id, set.id, { reps: val });
    window.TelegramBridge.hapticImpact('light');
    updateHeaderStats();
  });

  row.querySelector('[data-step-reps="+1"]').addEventListener('click', () => {
    let val = parseInt(repsInput.value || 1, 10) + 1;
    repsInput.value = val;
    window.workoutState.updateSet(exercise.id, set.id, { reps: val });
    window.TelegramBridge.hapticImpact('light');
    updateHeaderStats();
  });

  repsInput.addEventListener('change', () => {
    let val = Math.max(1, parseInt(repsInput.value, 10) || 1);
    repsInput.value = val;
    window.workoutState.updateSet(exercise.id, set.id, { reps: val });
    updateHeaderStats();
  });

  // Отметка подхода
  checkBtn.addEventListener('click', () => {
    const isNowCompleted = !checkBtn.classList.contains('checked');
    checkBtn.classList.toggle('checked', isNowCompleted);
    row.classList.toggle('is-completed', isNowCompleted);

    window.workoutState.updateSet(exercise.id, set.id, { completed: isNowCompleted });
    updateHeaderStats();

    if (isNowCompleted) {
      window.TelegramBridge.hapticImpact('medium');

      // Автоматический запуск всплывающего таймера отдыха
      const restSec = exercise.targetRestSec || 90;
      window.restTimer.start(restSec, `${exercise.title} (Сет ${set.setNum})`);
    } else {
      window.TelegramBridge.hapticImpact('light');
    }
  });

  return row;
}

/**
 * Инициализация модальных окон (Завершение тренировки, отчет)
 */
function bindGlobalModals() {
  const finishBtn = document.getElementById('finishWorkoutBtn');
  const modal = document.getElementById('finishModal');
  const closeBtn = document.getElementById('finishModalClose');
  const sendBotBtn = document.getElementById('sendToBotBtn');
  const copyReportBtn = document.getElementById('copyReportBtn');
  const newWorkoutBtn = document.getElementById('resetWorkoutBtn');

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      openFinishModal();
      window.TelegramBridge.hapticImpact('heavy');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('visible');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('visible');
    });
  }

  // Отправка боту
  if (sendBotBtn) {
    sendBotBtn.addEventListener('click', () => {
      const summary = window.workoutState.calculateSummary();
      const payload = {
        action: 'workout_completed',
        summary,
        reportText: window.workoutState.formatReportText(summary)
      };

      // Сохраняем сессию в локальную историю и обновляем рекорды (PR)
      window.workoutState.saveCompletedSessionToHistory(summary);

      const result = window.TelegramBridge.sendDataToBot(payload);
      window.TelegramBridge.hapticNotification('success');

      // Сбрасываем тренировку для чистого нового сеанса
      window.workoutState.resetState();
      renderWorkoutApp();
      updateHeaderStats();

      if (result.success && result.method === 'tg_sendData') {
        alert('Данные успешно переданы в Telegram бот!');
        setTimeout(() => {
          window.TelegramBridge.closeApp();
        }, 300);
      } else {
        alert('Отчет подготовлен! (В браузере вне Telegram WebApp данные скопированы в буфер обмена).');
        navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
      }
    });
  }

  // Кнопка сброса в шапке
  const headerResetBtn = document.getElementById('headerResetBtn');
  if (headerResetBtn) {
    headerResetBtn.addEventListener('click', () => {
      if (confirm('Сбросить все выполненные подходы и начать тренировку заново?')) {
        window.workoutState.resetState();
        renderWorkoutApp();
        updateHeaderStats();
        window.TelegramBridge.hapticNotification('success');
      }
    });
  }

  // Копирование отчета в буфер обмена
  if (copyReportBtn) {
    copyReportBtn.addEventListener('click', () => {
      const summary = window.workoutState.calculateSummary();
      const text = window.workoutState.formatReportText(summary);
      navigator.clipboard?.writeText(text).then(() => {
        alert('Отчет скопирован в буфер обмена!');
        window.TelegramBridge.hapticNotification('success');
      }).catch(() => {
        alert('Не удалось скопировать отчет');
      });
    });
  }

  // Сброс и начало новой тренировки
  if (newWorkoutBtn) {
    newWorkoutBtn.addEventListener('click', () => {
      if (confirm('Очистить прогресс текущей тренировки и начать заново?')) {
        window.workoutState.resetState();
        renderWorkoutApp();
        updateHeaderStats();
        if (modal) modal.classList.remove('visible');
        window.TelegramBridge.hapticNotification('success');
      }
    });
  }
}

function openFinishModal() {
  const modal = document.getElementById('finishModal');
  if (!modal) return;

  const summary = window.workoutState.calculateSummary();

  document.getElementById('summaryDuration').textContent = `${summary.durationMinutes} мин`;
  document.getElementById('summaryTonnage').textContent = `${summary.totalVolumeKg.toLocaleString('ru-RU')} кг`;
  document.getElementById('summarySets').textContent = `${summary.completedSetsCount} / ${summary.totalSetsCount}`;
  document.getElementById('summaryWarmup').textContent = summary.warmupDone ? 'Выполнена ✅' : 'Пропущена ⚠️';

  const previewEl = document.getElementById('reportPreviewText');
  if (previewEl) {
    previewEl.innerHTML = window.workoutState.formatReportText(summary).replace(/\n/g, '<br/>');
  }

  modal.classList.add('visible');
}
