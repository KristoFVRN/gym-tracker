/**
 * workout-data.js - Каталог упражнений и Full Body программы для атлетов до 3 лет стажа
 * Включает полную базу упражнений, предустановленные планы и конструктор
 */

// ============================================================================
// 1. КАТАЛОГ УПРАЖНЕНИЙ ДЛЯ FULL BODY (сгруппирован по движениям)
// ============================================================================
const EXERCISE_CATALOG = [
  // --- КАРДИО / РАЗМИНКА ---
  {
    id: 'treadmill_matrix',
    category: 'warmup',
    categoryLabel: 'Разминка',
    title: 'Беговая дорожка Matrix Endurance',
    machine: 'Matrix Endurance Series',
    image: 'assets/exercises/treadmill_matrix.jpg',
    targetTimeSec: 600,
    targetDistanceKm: 1.0,
    targetSpeedKmh: 6.2,
    notes: 'Шаг или легкий бег без наклона. Скорость 6.2 км/ч, ровный пульс.',
    isWarmup: true
  },

  // --- ГРУДЬ / ГОРИЗОНТАЛЬНЫЙ И НАКЛОННЫЙ ЖИМ ---
  {
    id: 'bench_press_technogym',
    category: 'chest',
    categoryLabel: 'Грудь',
    title: 'Жим штанги лёжа',
    machine: 'Скамья Technogym Olympic Bench',
    isBarbell: true,
    image: 'assets/exercises/bench_press_technogym.jpg',
    targetRestSec: 180,
    restPresets: [120, 150, 180, 210],
    notes: 'Пирамида. В 3 и 4 подходах используй страхующего или стопоры.',
    defaultSets: [
      { setNum: 1, type: 'warmup', weight: 60, reps: 10 },
      { setNum: 2, type: 'work', weight: 80, reps: 10 },
      { setNum: 3, type: 'work', weight: 100, reps: 7 },
      { setNum: 4, type: 'heavy', weight: 107.5, reps: 4 }
    ]
  },
  {
    id: 'chest_press_matrix',
    category: 'chest',
    categoryLabel: 'Грудь',
    title: 'Жим от груди в тренажере',
    machine: 'Matrix Chest Press (стек)',
    image: 'assets/exercises/chest_press_matrix.jpg',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Фиксированный вес. Контроль в негативной фазе 2 сек, мощный жим.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 76, reps: 10 },
      { setNum: 2, type: 'work', weight: 76, reps: 10 },
      { setNum: 3, type: 'work', weight: 76, reps: 10 },
      { setNum: 4, type: 'work', weight: 76, reps: 10 }
    ]
  },
  {
    id: 'dumbbell_incline_press',
    category: 'chest',
    categoryLabel: 'Грудь',
    title: 'Жим гантелей на наклонной скамье',
    machine: 'Скамья 30° + гантели',
    isBarbell: false,
    image: '',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Угол 30 градусов, локти под 45 градусов к корпусу.',
    defaultSets: [
      { setNum: 1, type: 'warmup', weight: 16, reps: 12 },
      { setNum: 2, type: 'work', weight: 22, reps: 10 },
      { setNum: 3, type: 'work', weight: 24, reps: 10 },
      { setNum: 4, type: 'work', weight: 26, reps: 8 }
    ]
  },

  // --- СПИНА / ВЕРТИКАЛЬНАЯ И ГОРИЗОНТАЛЬНАЯ ТЯГА ---
  {
    id: 'lat_pulldown_matrix',
    category: 'back',
    categoryLabel: 'Спина',
    title: 'Вертикальная тяга в кроссовере',
    machine: 'Кроссовер Matrix Versa / Ultra',
    image: 'assets/exercises/lat_pulldown_matrix.jpg',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Лесенка с повышением веса. Лопатки сведены, тяга к ключицам.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 76, reps: 10 },
      { setNum: 2, type: 'work', weight: 81, reps: 10 },
      { setNum: 3, type: 'work', weight: 86, reps: 10 },
      { setNum: 4, type: 'heavy', weight: 92, reps: 10 }
    ]
  },
  {
    id: 'horizontal_row_block',
    category: 'back',
    categoryLabel: 'Спина',
    title: 'Горизонтальная тяга на спину',
    machine: 'Matrix Seated Row / Cable',
    hasVariants: true,
    selectedVariant: 'variant_a',
    variants: [
      {
        id: 'variant_a',
        label: 'Вариант A (Подвижные рукояти)',
        title: 'Горизонтальная тяга с подвижными рукоятями',
        machine: 'Matrix Converging Seated Row',
        image: 'assets/exercises/row_variant_a.jpg'
      },
      {
        id: 'variant_b',
        label: 'Вариант B (Тросовая к поясу)',
        title: 'Горизонтальная тяга — тросовая к поясу',
        machine: 'Technogym Low Row Cable',
        image: 'assets/exercises/row_variant_b.jpg'
      },
      {
        id: 'variant_c',
        label: 'Вариант C (Упор в грудь)',
        title: 'Горизонтальная тяга с упором в грудь',
        machine: 'Matrix Chest Supported Row',
        image: 'assets/exercises/row_variant_c.jpg'
      }
    ],
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Спина ровная, локти ведем вдоль корпуса назад, пауза 1 сек в пике.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 82, reps: 10 },
      { setNum: 2, type: 'work', weight: 82, reps: 10 },
      { setNum: 3, type: 'work', weight: 82, reps: 10 },
      { setNum: 4, type: 'work', weight: 82, reps: 10 }
    ]
  },
  {
    id: 'dumbbell_row_single',
    category: 'back',
    categoryLabel: 'Спина',
    title: 'Тяга гантели в наклоне с упором',
    machine: 'Горизонтальная скамья + гантель',
    isBarbell: false,
    image: '',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Спина параллельна полу, тянем локтем к тазу.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 22, reps: 10 },
      { setNum: 2, type: 'work', weight: 26, reps: 10 },
      { setNum: 3, type: 'work', weight: 28, reps: 10 },
      { setNum: 4, type: 'work', weight: 30, reps: 8 }
    ]
  },

  // --- НОГИ / КВАДРИЦЕПС И БИЦЕПС БЕДРА ---
  {
    id: 'squat_foreman',
    category: 'legs',
    categoryLabel: 'Ноги',
    title: 'Присед со штангой на спине',
    machine: 'Силовая рама Foreman',
    isBarbell: true,
    image: 'assets/exercises/squat_foreman.jpg',
    targetRestSec: 180,
    restPresets: [120, 150, 180, 240],
    notes: 'Пирамида. Бедро параллельно полу. Контроль коленей и поясницы.',
    defaultSets: [
      { setNum: 1, type: 'warmup', weight: 60, reps: 10 },
      { setNum: 2, type: 'work', weight: 80, reps: 10 },
      { setNum: 3, type: 'work', weight: 100, reps: 7 },
      { setNum: 4, type: 'heavy', weight: 107.5, reps: 4 }
    ]
  },
  {
    id: 'leg_extension_matrix',
    category: 'legs',
    categoryLabel: 'Ноги',
    title: 'Разгибание голени сидя',
    machine: 'Matrix Leg Extension (квадрицепс)',
    image: 'assets/exercises/leg_extension_matrix.jpg',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Пирамида до 105 кг. Фиксация в верхней точке на 1 секунду.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 76, reps: 10 },
      { setNum: 2, type: 'work', weight: 86, reps: 10 },
      { setNum: 3, type: 'work', weight: 95, reps: 10 },
      { setNum: 4, type: 'heavy', weight: 105, reps: 10 }
    ]
  },
  {
    id: 'leg_curl_technogym',
    category: 'legs',
    categoryLabel: 'Ноги',
    title: 'Сгибание голени сидя',
    machine: 'Technogym Seated Leg Curl (бицепс бедра)',
    image: 'assets/exercises/leg_curl_technogym.jpg',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Плавный темп. Прогрессия до 56 кг в финальном подходе.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 42, reps: 10 },
      { setNum: 2, type: 'work', weight: 47, reps: 10 },
      { setNum: 3, type: 'work', weight: 52, reps: 10 },
      { setNum: 4, type: 'heavy', weight: 56, reps: 10 }
    ]
  },
  {
    id: 'leg_press_machine',
    category: 'legs',
    categoryLabel: 'Ноги',
    title: 'Жим ногами в тренажере',
    machine: 'Тренажер под 45 градусов',
    isBarbell: false,
    image: '',
    targetRestSec: 120,
    restPresets: [90, 120, 150],
    notes: 'Колени до угла 90°, в коленях в верхней точке микросгиб (не вставлять суставы).',
    defaultSets: [
      { setNum: 1, type: 'warmup', weight: 100, reps: 12 },
      { setNum: 2, type: 'work', weight: 140, reps: 10 },
      { setNum: 3, type: 'work', weight: 160, reps: 10 },
      { setNum: 4, type: 'heavy', weight: 180, reps: 8 }
    ]
  },

  // --- ПЛЕЧИ И РУКИ ---
  {
    id: 'dumbbell_shoulder_press',
    category: 'shoulders',
    categoryLabel: 'Плечи/Руки',
    title: 'Жим гантелей сидя на плечи',
    machine: 'Скамья со спинкой 85° + гантели',
    isBarbell: false,
    image: '',
    targetRestSec: 90,
    restPresets: [60, 90, 120],
    notes: 'Гантели на уровне ушей внизу, мощный выжим вверх.',
    defaultSets: [
      { setNum: 1, type: 'warmup', weight: 12, reps: 12 },
      { setNum: 2, type: 'work', weight: 16, reps: 10 },
      { setNum: 3, type: 'work', weight: 18, reps: 10 },
      { setNum: 4, type: 'work', weight: 20, reps: 8 }
    ]
  },
  {
    id: 'lateral_delts_raise',
    category: 'shoulders',
    categoryLabel: 'Плечи/Руки',
    title: 'Махи гантелями в стороны',
    machine: 'Гантели стоя',
    isBarbell: false,
    image: '',
    targetRestSec: 60,
    restPresets: [45, 60, 90],
    notes: 'Локти чуть согнуты, подъем до параллели плеча с полом без раскачки.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 8, reps: 12 },
      { setNum: 2, type: 'work', weight: 9, reps: 12 },
      { setNum: 3, type: 'work', weight: 10, reps: 10 },
      { setNum: 4, type: 'work', weight: 10, reps: 10 }
    ]
  },
  {
    id: 'biceps_cable_curl',
    category: 'shoulders',
    categoryLabel: 'Плечи/Руки',
    title: 'Сгибание на бицепс на нижнем блоке',
    machine: 'Кроссовер (нижний блок)',
    isBarbell: false,
    image: '',
    targetRestSec: 60,
    restPresets: [45, 60, 90],
    notes: 'Локти зафиксированы у ребер, пиковое сокращение бицепса 1 сек.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 25, reps: 12 },
      { setNum: 2, type: 'work', weight: 30, reps: 10 },
      { setNum: 3, type: 'work', weight: 35, reps: 10 },
      { setNum: 4, type: 'work', weight: 35, reps: 10 }
    ]
  },
  {
    id: 'triceps_rope_pushdown',
    category: 'shoulders',
    categoryLabel: 'Плечи/Руки',
    title: 'Разгибание на трицепс с канатом',
    machine: 'Кроссовер (верхний блок)',
    isBarbell: false,
    image: '',
    targetRestSec: 60,
    restPresets: [45, 60, 90],
    notes: 'В нижней точке разводим концы каната в стороны, фиксируем локти.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 25, reps: 12 },
      { setNum: 2, type: 'work', weight: 30, reps: 12 },
      { setNum: 3, type: 'work', weight: 35, reps: 10 },
      { setNum: 4, type: 'work', weight: 35, reps: 10 }
    ]
  },

  // --- МЫШЦЫ КОРА / ПРЕСС ---
  {
    id: 'ab_crunch_panatta',
    category: 'core',
    categoryLabel: 'Пресс',
    title: 'Скручивания на пресс',
    machine: 'Тренажер Panatta Circular Crunch',
    image: 'assets/exercises/ab_crunch_panatta.jpg',
    targetRestSec: 60,
    restPresets: [45, 60, 90],
    notes: 'Мощный выдох на скручивании. Контролируемый возврат.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 30, reps: 12 },
      { setNum: 2, type: 'work', weight: 30, reps: 12 },
      { setNum: 3, type: 'work', weight: 30, reps: 12 },
      { setNum: 4, type: 'work', weight: 30, reps: 12 }
    ]
  },
  {
    id: 'hanging_leg_raise',
    category: 'core',
    categoryLabel: 'Пресс',
    title: 'Подъем коленей / ног в упоре',
    machine: 'Брусья с упором на предплечья',
    isBarbell: false,
    image: '',
    targetRestSec: 60,
    restPresets: [45, 60, 90],
    notes: 'Поднимаем колени выше уровня таза за счет скручивания пресса.',
    defaultSets: [
      { setNum: 1, type: 'work', weight: 0, reps: 15 },
      { setNum: 2, type: 'work', weight: 0, reps: 15 },
      { setNum: 3, type: 'work', weight: 0, reps: 15 },
      { setNum: 4, type: 'work', weight: 0, reps: 15 }
    ]
  }
];


// ============================================================================
// 2. ПРЕДУСТАНОВЛЕННЫЕ НАУЧНЫЕ FULL BODY ПРОГРАММЫ (до 3 лет стажа)
// ============================================================================
const DEFAULT_PLANS = [
  {
    id: 'fullbody_ddx_v1',
    title: 'DDX Full Body (День А / День Б)',
    badge: 'Основная база',
    description: 'Идеальное чередование базового свободного веса и тренажеров 3 раза в неделю (Вт, Чт, Сб).',
    isDefault: true,
    activeDayId: 'day_a',
    days: [
      {
        id: 'day_a',
        title: 'Фулбоди День А (Свободный вес)',
        shortTitle: 'День А',
        badge: 'Свободный вес',
        badgeColor: '#ffb800',
        subtitle: 'Присед со штангой + Жим лёжа + Тяга + Пресс',
        blocks: [
          {
            id: 'block_warmup',
            number: '1',
            title: 'Разминка перед тренировкой',
            badge: 'Кардио',
            subtitle: 'Подготовка ССС и суставов к нагрузке',
            type: 'warmup',
            item: {
              id: 'treadmill_matrix',
              title: 'Беговая дорожка Matrix Endurance',
              machine: 'Matrix Endurance Series',
              image: 'assets/exercises/treadmill_matrix.jpg',
              targetTimeSec: 600,
              targetDistanceKm: 1.0,
              targetSpeedKmh: 6.2,
              notes: 'Шаг или легкий бег без наклона. Скорость 6.2 км/ч, ровный пульс.',
              completed: false
            }
          },
          {
            id: 'block_exercises',
            number: '2',
            title: 'Основная Full Body часть',
            badge: 'Все тело',
            subtitle: 'Грудь, Спина, Ноги, Пресс',
            type: 'exercises',
            exercises: [
              // 1. Жим лежа
              {
                id: 'bench_press_technogym',
                title: 'Жим штанги лёжа',
                machine: 'Скамья Technogym Olympic Bench',
                isBarbell: true,
                image: 'assets/exercises/bench_press_technogym.jpg',
                targetRestSec: 180,
                restPresets: [120, 150, 180, 210],
                notes: 'Пирамида. В 3 и 4 подходах используй страхующего или стопоры.',
                sets: [
                  { id: 'bp_1', setNum: 1, type: 'warmup', weight: 60, reps: 10, completed: false },
                  { id: 'bp_2', setNum: 2, type: 'work', weight: 80, reps: 10, completed: false },
                  { id: 'bp_3', setNum: 3, type: 'work', weight: 100, reps: 7, completed: false },
                  { id: 'bp_4', setNum: 4, type: 'heavy', weight: 107.5, reps: 4, completed: false }
                ]
              },
              // 2. Вертикальная тяга
              {
                id: 'lat_pulldown_matrix',
                title: 'Вертикальная тяга в кроссовере',
                machine: 'Кроссовер Matrix Versa / Ultra',
                image: 'assets/exercises/lat_pulldown_matrix.jpg',
                targetRestSec: 90,
                restPresets: [60, 90, 120],
                notes: 'Лесенка с повышением веса. Лопатки сведены, тяга к ключицам.',
                sets: [
                  { id: 'lp_1', setNum: 1, type: 'work', weight: 76, reps: 10, completed: false },
                  { id: 'lp_2', setNum: 2, type: 'work', weight: 81, reps: 10, completed: false },
                  { id: 'lp_3', setNum: 3, type: 'work', weight: 86, reps: 10, completed: false },
                  { id: 'lp_4', setNum: 4, type: 'heavy', weight: 92, reps: 10, completed: false }
                ]
              },
              // 3. Присед со штангой
              {
                id: 'squat_foreman',
                title: 'Присед со штангой на спине',
                machine: 'Силовая рама Foreman',
                isBarbell: true,
                image: 'assets/exercises/squat_foreman.jpg',
                targetRestSec: 180,
                restPresets: [120, 150, 180, 240],
                notes: 'Пирамида. Глубина — бедро параллельно полу. Контроль коленей и поясницы.',
                sets: [
                  { id: 'sq_1', setNum: 1, type: 'warmup', weight: 60, reps: 10, completed: false },
                  { id: 'sq_2', setNum: 2, type: 'work', weight: 80, reps: 10, completed: false },
                  { id: 'sq_3', setNum: 3, type: 'work', weight: 100, reps: 7, completed: false },
                  { id: 'sq_4', setNum: 4, type: 'heavy', weight: 107.5, reps: 4, completed: false }
                ]
              },
              // 4. Пресс
              {
                id: 'ab_crunch_panatta',
                title: 'Скручивания на пресс',
                machine: 'Тренажер Panatta Circular Crunch / Abdominal',
                image: 'assets/exercises/ab_crunch_panatta.jpg',
                targetRestSec: 60,
                restPresets: [45, 60, 90],
                notes: '4 подхода по 10–12 повторений с отягощением +30 кг. Мощный выдох.',
                sets: [
                  { id: 'core_1', setNum: 1, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_2', setNum: 2, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_3', setNum: 3, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_4', setNum: 4, type: 'work', weight: 30, reps: 12, completed: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'day_b',
        title: 'Фулбоди День Б (Тренажеры)',
        shortTitle: 'День Б',
        badge: 'Изоляция & Блоки',
        badgeColor: '#00e676',
        subtitle: 'Жим сидя + Горизонтальная тяга + Ноги в тренажере + Пресс',
        blocks: [
          {
            id: 'block_warmup',
            number: '1',
            title: 'Разминка перед тренировкой',
            badge: 'Кардио',
            subtitle: 'Подготовка ССС и суставов к нагрузке',
            type: 'warmup',
            item: {
              id: 'treadmill_matrix',
              title: 'Беговая дорожка Matrix Endurance',
              machine: 'Matrix Endurance Series',
              image: 'assets/exercises/treadmill_matrix.jpg',
              targetTimeSec: 600,
              targetDistanceKm: 1.0,
              targetSpeedKmh: 6.2,
              notes: 'Шаг или легкий бег без наклона. Скорость 6.2 км/ч, ровный пульс.',
              completed: false
            }
          },
          {
            id: 'block_exercises',
            number: '2',
            title: 'Основная Full Body часть',
            badge: 'Все тело',
            subtitle: 'Грудь, Спина, Квадрицепс, Бицепс бедра, Пресс',
            type: 'exercises',
            exercises: [
              // 1. Жим сидя в тренажере
              {
                id: 'chest_press_matrix',
                title: 'Жим от груди в тренажере',
                machine: 'Matrix Chest Press (стек)',
                image: 'assets/exercises/chest_press_matrix.jpg',
                targetRestSec: 90,
                restPresets: [60, 90, 120],
                notes: 'Фиксированный вес 76 кг. Контроль в негативной фазе 2 сек.',
                sets: [
                  { id: 'cp_1', setNum: 1, type: 'work', weight: 76, reps: 10, completed: false },
                  { id: 'cp_2', setNum: 2, type: 'work', weight: 76, reps: 10, completed: false },
                  { id: 'cp_3', setNum: 3, type: 'work', weight: 76, reps: 10, completed: false },
                  { id: 'cp_4', setNum: 4, type: 'work', weight: 76, reps: 10, completed: false }
                ]
              },
              // 2. Горизонтальная тяга
              {
                id: 'horizontal_row_block',
                title: 'Горизонтальная тяга на спину',
                hasVariants: true,
                selectedVariant: 'variant_a',
                variants: [
                  {
                    id: 'variant_a',
                    label: 'Вариант A (Подвижные рукояти)',
                    title: 'Горизонтальная тяга с подвижными рукоятями',
                    machine: 'Matrix Converging Seated Row',
                    image: 'assets/exercises/row_variant_a.jpg'
                  },
                  {
                    id: 'variant_b',
                    label: 'Вариант B (Тросовая к поясу)',
                    title: 'Горизонтальная тяга — тросовая к поясу',
                    machine: 'Technogym Low Row Cable',
                    image: 'assets/exercises/row_variant_b.jpg'
                  },
                  {
                    id: 'variant_c',
                    label: 'Вариант C (Упор в грудь)',
                    title: 'Горизонтальная тяга с упором в грудь',
                    machine: 'Matrix Chest Supported Row',
                    image: 'assets/exercises/row_variant_c.jpg'
                  }
                ],
                targetRestSec: 90,
                restPresets: [60, 90, 120],
                notes: 'Спина ровная, локти ведем вдоль корпуса назад, пауза 1 сек в пике.',
                sets: [
                  { id: 'hr_1', setNum: 1, type: 'work', weight: 82, reps: 10, completed: false },
                  { id: 'hr_2', setNum: 2, type: 'work', weight: 82, reps: 10, completed: false },
                  { id: 'hr_3', setNum: 3, type: 'work', weight: 82, reps: 10, completed: false },
                  { id: 'hr_4', setNum: 4, type: 'work', weight: 82, reps: 10, completed: false }
                ]
              },
              // 3. Разгибание голени
              {
                id: 'leg_extension_matrix',
                title: 'Разгибание голени сидя',
                machine: 'Matrix Leg Extension (квадрицепс)',
                image: 'assets/exercises/leg_extension_matrix.jpg',
                targetRestSec: 90,
                restPresets: [60, 90, 120],
                notes: 'Пирамида до 105 кг. Фиксация в верхней точке на 1 секунду.',
                sets: [
                  { id: 'le_1', setNum: 1, type: 'work', weight: 76, reps: 10, completed: false },
                  { id: 'le_2', setNum: 2, type: 'work', weight: 86, reps: 10, completed: false },
                  { id: 'le_3', setNum: 3, type: 'work', weight: 95, reps: 10, completed: false },
                  { id: 'le_4', setNum: 4, type: 'heavy', weight: 105, reps: 10, completed: false }
                ]
              },
              // 4. Сгибание голени
              {
                id: 'leg_curl_technogym',
                title: 'Сгибание голени сидя',
                machine: 'Technogym Seated Leg Curl (бицепс бедра)',
                image: 'assets/exercises/leg_curl_technogym.jpg',
                targetRestSec: 90,
                restPresets: [60, 90, 120],
                notes: 'Плавный темп. Прогрессия до 56 кг в финальном подходе.',
                sets: [
                  { id: 'lc_1', setNum: 1, type: 'work', weight: 42, reps: 10, completed: false },
                  { id: 'lc_2', setNum: 2, type: 'work', weight: 47, reps: 10, completed: false },
                  { id: 'lc_3', setNum: 3, type: 'work', weight: 52, reps: 10, completed: false },
                  { id: 'lc_4', setNum: 4, type: 'heavy', weight: 56, reps: 10, completed: false }
                ]
              },
              // 5. Пресс
              {
                id: 'ab_crunch_panatta',
                title: 'Скручивания на пресс',
                machine: 'Тренажер Panatta Circular Crunch / Abdominal',
                image: 'assets/exercises/ab_crunch_panatta.jpg',
                targetRestSec: 60,
                restPresets: [45, 60, 90],
                notes: '4 подхода по 10–12 повторений с отягощением +30 кг. Мощный выдох.',
                sets: [
                  { id: 'core_1', setNum: 1, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_2', setNum: 2, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_3', setNum: 3, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_4', setNum: 4, type: 'work', weight: 30, reps: 12, completed: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'fullbody_3day_v1',
    title: 'Классический Full Body 3 дня (А / Б / В)',
    badge: '3 вариации',
    description: '3 разных дня под расписание Вт (День А), Чт (День Б), Сб (День В). Разнообразие стимулов.',
    isDefault: true,
    activeDayId: 'day_a',
    days: [
      {
        id: 'day_a',
        title: 'Фулбоди День А (Тяжелый присед и жим)',
        shortTitle: 'День А',
        badge: 'Силовой',
        badgeColor: '#ffb800',
        subtitle: 'Присед + Жим лёжа + Вертикальная тяга + Пресс',
        blocks: [
          {
            id: 'block_warmup',
            number: '1',
            title: 'Разминка перед тренировкой',
            badge: 'Кардио',
            subtitle: '10 мин кардио для разогрева',
            type: 'warmup',
            item: {
              id: 'treadmill_matrix',
              title: 'Беговая дорожка Matrix Endurance',
              machine: 'Matrix Endurance Series',
              image: 'assets/exercises/treadmill_matrix.jpg',
              targetTimeSec: 600,
              targetDistanceKm: 1.0,
              targetSpeedKmh: 6.2,
              notes: 'Шаг или легкий бег без наклона.',
              completed: false
            }
          },
          {
            id: 'block_exercises',
            number: '2',
            title: 'Упражнения Фулбоди Дня А',
            badge: 'Все тело',
            subtitle: 'Ноги, Грудь, Спина, Пресс',
            type: 'exercises',
            exercises: [
              {
                id: 'squat_foreman',
                title: 'Присед со штангой на спине',
                machine: 'Силовая рама Foreman',
                isBarbell: true,
                image: 'assets/exercises/squat_foreman.jpg',
                targetRestSec: 180,
                restPresets: [120, 150, 180],
                notes: 'Базовый присед. Пирамида весов.',
                sets: [
                  { id: 'sq_1', setNum: 1, type: 'warmup', weight: 60, reps: 10, completed: false },
                  { id: 'sq_2', setNum: 2, type: 'work', weight: 80, reps: 10, completed: false },
                  { id: 'sq_3', setNum: 3, type: 'work', weight: 100, reps: 8, completed: false }
                ]
              },
              {
                id: 'bench_press_technogym',
                title: 'Жим штанги лёжа',
                machine: 'Скамья Technogym Olympic Bench',
                isBarbell: true,
                image: 'assets/exercises/bench_press_technogym.jpg',
                targetRestSec: 180,
                restPresets: [120, 150, 180],
                notes: 'Горизонтальный жим. Сведение лопаток.',
                sets: [
                  { id: 'bp_1', setNum: 1, type: 'warmup', weight: 60, reps: 10, completed: false },
                  { id: 'bp_2', setNum: 2, type: 'work', weight: 80, reps: 10, completed: false },
                  { id: 'bp_3', setNum: 3, type: 'work', weight: 95, reps: 8, completed: false }
                ]
              },
              {
                id: 'lat_pulldown_matrix',
                title: 'Вертикальная тяга в кроссовере',
                machine: 'Кроссовер Matrix Versa / Ultra',
                image: 'assets/exercises/lat_pulldown_matrix.jpg',
                targetRestSec: 90,
                restPresets: [60, 90, 120],
                notes: 'Широчайшие мышцы спины.',
                sets: [
                  { id: 'lp_1', setNum: 1, type: 'work', weight: 75, reps: 10, completed: false },
                  { id: 'lp_2', setNum: 2, type: 'work', weight: 80, reps: 10, completed: false },
                  { id: 'lp_3', setNum: 3, type: 'work', weight: 85, reps: 10, completed: false }
                ]
              },
              {
                id: 'ab_crunch_panatta',
                title: 'Скручивания на пресс',
                machine: 'Тренажер Panatta Circular Crunch',
                image: 'assets/exercises/ab_crunch_panatta.jpg',
                targetRestSec: 60,
                restPresets: [45, 60],
                notes: 'Работа на мышцы брюшного пресса.',
                sets: [
                  { id: 'core_1', setNum: 1, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_2', setNum: 2, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_3', setNum: 3, type: 'work', weight: 30, reps: 12, completed: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'day_b',
        title: 'Фулбоди День Б (Жим ногами и плечи)',
        shortTitle: 'День Б',
        badge: 'Объемный',
        badgeColor: '#00e5ff',
        subtitle: 'Жим ногами + Жим на плечи + Тяга к поясу + Руки',
        blocks: [
          {
            id: 'block_warmup',
            number: '1',
            title: 'Разминка перед тренировкой',
            badge: 'Кардио',
            subtitle: '10 мин кардио',
            type: 'warmup',
            item: {
              id: 'treadmill_matrix',
              title: 'Беговая дорожка Matrix Endurance',
              machine: 'Matrix Endurance Series',
              image: 'assets/exercises/treadmill_matrix.jpg',
              targetTimeSec: 600,
              targetDistanceKm: 1.0,
              targetSpeedKmh: 6.2,
              notes: 'Шаг или легкий бег.',
              completed: false
            }
          },
          {
            id: 'block_exercises',
            number: '2',
            title: 'Упражнения Фулбоди Дня Б',
            badge: 'Все тело',
            subtitle: 'Ноги, Плечи, Спина, Руки',
            type: 'exercises',
            exercises: [
              {
                id: 'leg_press_machine',
                title: 'Жим ногами в тренажере',
                machine: 'Тренажер 45°',
                isBarbell: false,
                image: '',
                targetRestSec: 120,
                restPresets: [90, 120],
                notes: 'Упор стопами всей плоскостью.',
                sets: [
                  { id: 'lp_1', setNum: 1, type: 'work', weight: 120, reps: 10, completed: false },
                  { id: 'lp_2', setNum: 2, type: 'work', weight: 150, reps: 10, completed: false },
                  { id: 'lp_3', setNum: 3, type: 'work', weight: 170, reps: 10, completed: false }
                ]
              },
              {
                id: 'dumbbell_shoulder_press',
                title: 'Жим гантелей сидя на плечи',
                machine: 'Скамья со спинкой + гантели',
                isBarbell: false,
                image: '',
                targetRestSec: 90,
                restPresets: [60, 90],
                notes: 'Вертикальный жим на дельтовидные.',
                sets: [
                  { id: 'sp_1', setNum: 1, type: 'work', weight: 16, reps: 10, completed: false },
                  { id: 'sp_2', setNum: 2, type: 'work', weight: 18, reps: 10, completed: false },
                  { id: 'sp_3', setNum: 3, type: 'work', weight: 20, reps: 8, completed: false }
                ]
              },
              {
                id: 'horizontal_row_block',
                title: 'Горизонтальная тяга на спину',
                hasVariants: true,
                selectedVariant: 'variant_a',
                variants: [
                  {
                    id: 'variant_a',
                    label: 'Вариант A (Подвижные рукояти)',
                    title: 'Горизонтальная тяга Matrix',
                    machine: 'Matrix Seated Row',
                    image: 'assets/exercises/row_variant_a.jpg'
                  }
                ],
                targetRestSec: 90,
                restPresets: [60, 90],
                notes: 'Сведение лопаток назад.',
                sets: [
                  { id: 'hr_1', setNum: 1, type: 'work', weight: 75, reps: 10, completed: false },
                  { id: 'hr_2', setNum: 2, type: 'work', weight: 80, reps: 10, completed: false },
                  { id: 'hr_3', setNum: 3, type: 'work', weight: 85, reps: 10, completed: false }
                ]
              },
              {
                id: 'triceps_rope_pushdown',
                title: 'Разгибание на трицепс с канатом',
                machine: 'Кроссовер',
                isBarbell: false,
                image: '',
                targetRestSec: 60,
                restPresets: [45, 60],
                notes: 'Изоляция трицепса.',
                sets: [
                  { id: 'tr_1', setNum: 1, type: 'work', weight: 25, reps: 12, completed: false },
                  { id: 'tr_2', setNum: 2, type: 'work', weight: 30, reps: 10, completed: false },
                  { id: 'tr_3', setNum: 3, type: 'work', weight: 35, reps: 10, completed: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'day_c',
        title: 'Фулбоди День В (Изоляция ног и грудь)',
        shortTitle: 'День В',
        badge: 'Восстановительный',
        badgeColor: '#ff5722',
        subtitle: 'Жим сидя + Разгибания/Сгибания ног + Тяга гантели + Пресс',
        blocks: [
          {
            id: 'block_warmup',
            number: '1',
            title: 'Разминка перед тренировкой',
            badge: 'Кардио',
            subtitle: '10 мин кардио',
            type: 'warmup',
            item: {
              id: 'treadmill_matrix',
              title: 'Беговая дорожка Matrix Endurance',
              machine: 'Matrix Endurance Series',
              image: 'assets/exercises/treadmill_matrix.jpg',
              targetTimeSec: 600,
              targetDistanceKm: 1.0,
              targetSpeedKmh: 6.2,
              notes: 'Шаг или легкий бег.',
              completed: false
            }
          },
          {
            id: 'block_exercises',
            number: '2',
            title: 'Упражнения Фулбоди Дня В',
            badge: 'Все тело',
            subtitle: 'Грудь, Квадрицепс, Бицепс бедра, Спина, Пресс',
            type: 'exercises',
            exercises: [
              {
                id: 'chest_press_matrix',
                title: 'Жим от груди в тренажере',
                machine: 'Matrix Chest Press',
                image: 'assets/exercises/chest_press_matrix.jpg',
                targetRestSec: 90,
                restPresets: [60, 90],
                notes: 'Жим в тренажере сидя.',
                sets: [
                  { id: 'cp_1', setNum: 1, type: 'work', weight: 70, reps: 10, completed: false },
                  { id: 'cp_2', setNum: 2, type: 'work', weight: 75, reps: 10, completed: false },
                  { id: 'cp_3', setNum: 3, type: 'work', weight: 75, reps: 10, completed: false }
                ]
              },
              {
                id: 'leg_extension_matrix',
                title: 'Разгибание голени сидя',
                machine: 'Matrix Leg Extension',
                image: 'assets/exercises/leg_extension_matrix.jpg',
                targetRestSec: 90,
                restPresets: [60, 90],
                notes: 'Квадрицепс бедра.',
                sets: [
                  { id: 'le_1', setNum: 1, type: 'work', weight: 75, reps: 10, completed: false },
                  { id: 'le_2', setNum: 2, type: 'work', weight: 85, reps: 10, completed: false },
                  { id: 'le_3', setNum: 3, type: 'work', weight: 95, reps: 10, completed: false }
                ]
              },
              {
                id: 'leg_curl_technogym',
                title: 'Сгибание голени сидя',
                machine: 'Technogym Seated Leg Curl',
                image: 'assets/exercises/leg_curl_technogym.jpg',
                targetRestSec: 90,
                restPresets: [60, 90],
                notes: 'Бицепс бедра.',
                sets: [
                  { id: 'lc_1', setNum: 1, type: 'work', weight: 40, reps: 10, completed: false },
                  { id: 'lc_2', setNum: 2, type: 'work', weight: 45, reps: 10, completed: false },
                  { id: 'lc_3', setNum: 3, type: 'work', weight: 50, reps: 10, completed: false }
                ]
              },
              {
                id: 'ab_crunch_panatta',
                title: 'Скручивания на пресс',
                machine: 'Panatta Circular Crunch',
                image: 'assets/exercises/ab_crunch_panatta.jpg',
                targetRestSec: 60,
                restPresets: [45, 60],
                notes: 'Пресс финишер.',
                sets: [
                  { id: 'core_1', setNum: 1, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_2', setNum: 2, type: 'work', weight: 30, reps: 12, completed: false },
                  { id: 'core_3', setNum: 3, type: 'work', weight: 30, reps: 12, completed: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];


// ============================================================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ КОНСТРУКТОРА
// ============================================================================

// Создание глубокой копии стандартных планов
function getDefaultPlans() {
  return JSON.parse(JSON.stringify(DEFAULT_PLANS));
}

// Создание нового пустого Full Body плана
function createEmptyFullbodyPlan(title) {
  const planId = 'custom_plan_' + Date.now();
  return {
    id: planId,
    title: title || 'Мой Full Body план',
    badge: 'Кастомный',
    description: 'Индивидуальная Full Body программа тренировок.',
    isDefault: false,
    activeDayId: 'day_a',
    days: [
      {
        id: 'day_a',
        title: 'Фулбоди День А',
        shortTitle: 'День А',
        badge: 'День А',
        badgeColor: '#ffb800',
        subtitle: 'Тренировка всего тела',
        blocks: [
          {
            id: 'block_warmup',
            number: '1',
            title: 'Разминка перед тренировкой',
            badge: 'Кардио',
            subtitle: '10 мин разминка на дорожке',
            type: 'warmup',
            item: {
              id: 'treadmill_matrix',
              title: 'Беговая дорожка Matrix Endurance',
              machine: 'Matrix Endurance Series',
              image: 'assets/exercises/treadmill_matrix.jpg',
              targetTimeSec: 600,
              targetDistanceKm: 1.0,
              targetSpeedKmh: 6.2,
              notes: 'Шаг или легкий бег без наклона.',
              completed: false
            }
          },
          {
            id: 'block_exercises',
            number: '2',
            title: 'Силовая часть',
            badge: 'Все тело',
            subtitle: 'Основные упражнения',
            type: 'exercises',
            exercises: []
          }
        ]
      }
    ]
  };
}

// Создание нового тренировочного дня
function createEmptyWorkoutDay(dayTitle, dayLetter) {
  const dayId = 'day_' + (dayLetter || Date.now()).toString().toLowerCase();
  return {
    id: dayId,
    title: dayTitle || `Фулбоди День ${dayLetter || 'Новый'}`,
    shortTitle: `День ${dayLetter || 'Новый'}`,
    badge: `День ${dayLetter || 'Новый'}`,
    badgeColor: '#00e5ff',
    subtitle: 'Тренировка всего тела',
    blocks: [
      {
        id: 'block_warmup',
        number: '1',
        title: 'Разминка перед тренировкой',
        badge: 'Кардио',
        subtitle: '10 мин разминка на дорожке',
        type: 'warmup',
        item: {
          id: 'treadmill_matrix',
          title: 'Беговая дорожка Matrix Endurance',
          machine: 'Matrix Endurance Series',
          image: 'assets/exercises/treadmill_matrix.jpg',
          targetTimeSec: 600,
          targetDistanceKm: 1.0,
          targetSpeedKmh: 6.2,
          notes: 'Шаг или легкий бег без наклона.',
          completed: false
        }
      },
      {
        id: 'block_exercises',
        number: '2',
        title: 'Силовая часть',
        badge: 'Все тело',
        subtitle: 'Основные упражнения',
        type: 'exercises',
        exercises: []
      }
    ]
  };
}

// Создание упражнения из каталога для добавления в день
function createExerciseFromCatalog(catalogItem) {
  const uid = catalogItem.id + '_' + Date.now();
  const sets = catalogItem.defaultSets ? catalogItem.defaultSets.map(s => ({
    id: `${uid}_set_${s.setNum}`,
    setNum: s.setNum,
    type: s.type || 'work',
    weight: s.weight,
    reps: s.reps,
    completed: false
  })) : [
    { id: `${uid}_set_1`, setNum: 1, type: 'warmup', weight: 40, reps: 10, completed: false },
    { id: `${uid}_set_2`, setNum: 2, type: 'work', weight: 60, reps: 10, completed: false },
    { id: `${uid}_set_3`, setNum: 3, type: 'work', weight: 70, reps: 8, completed: false }
  ];

  return {
    id: uid,
    catalogId: catalogItem.id,
    title: catalogItem.title,
    machine: catalogItem.machine,
    isBarbell: !!catalogItem.isBarbell,
    image: catalogItem.image || '',
    targetRestSec: catalogItem.targetRestSec || 90,
    restPresets: catalogItem.restPresets || [60, 90, 120],
    notes: catalogItem.notes || '',
    hasVariants: !!catalogItem.hasVariants,
    selectedVariant: catalogItem.selectedVariant || (catalogItem.variants ? catalogItem.variants[0].id : null),
    variants: catalogItem.variants ? JSON.parse(JSON.stringify(catalogItem.variants)) : null,
    sets
  };
}
