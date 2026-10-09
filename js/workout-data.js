/**
 * workout-data.js - Персональная программа тренировок с фотографиями оборудования
 * Включает полную конфигурацию блоков, упражнений, подходов и вариантов
 */

const WORKOUT_PROGRAM = {
  id: 'strength_routine_v1',
  title: 'Силовая тренировка: Верх + Низ',
  author: 'DDX / Matrix / Technogym Protocol',
  blocks: [
    {
      id: 'block_warmup',
      number: '1',
      title: 'Разминка перед тренировкой',
      badge: 'Кардио',
      subtitle: 'Подготовка ССС и суставов к силовым нагрузкам',
      type: 'warmup',
      item: {
        id: 'treadmill_matrix',
        title: 'Беговая дорожка Matrix Endurance',
        machine: 'Matrix Endurance Series',
        image: 'assets/exercises/treadmill_matrix.jpg',
        targetTimeSec: 600, // 10 минут
        targetDistanceKm: 1.0,
        targetSpeedKmh: 6.2,
        notes: 'Шаг или легкий бег без наклона. Скорость 6.2 км/ч, дыхание ровное.',
        completed: false
      }
    },
    {
      id: 'block_upper',
      number: '2',
      title: 'Верх тела',
      badge: 'База & Изоляция',
      subtitle: 'Выполняется на каждой тренировке',
      type: 'exercises',
      exercises: [
        {
          id: 'bench_press_technogym',
          title: 'Жим штанги лёжа',
          machine: 'Скамья Technogym Olympic Bench',
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
        {
          id: 'chest_press_matrix',
          title: 'Жим от груди в тренажере',
          machine: 'Matrix Chest Press (стек)',
          image: 'assets/exercises/chest_press_matrix.jpg',
          targetRestSec: 90,
          restPresets: [60, 90, 120],
          notes: 'Фиксированный рабочий вес 76 кг. Контроль в негативной фазе 2 сек.',
          sets: [
            { id: 'cp_1', setNum: 1, type: 'work', weight: 76, reps: 10, completed: false },
            { id: 'cp_2', setNum: 2, type: 'work', weight: 76, reps: 10, completed: false },
            { id: 'cp_3', setNum: 3, type: 'work', weight: 76, reps: 10, completed: false },
            { id: 'cp_4', setNum: 4, type: 'work', weight: 76, reps: 10, completed: false }
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
        }
      ]
    },
    {
      id: 'block_lower',
      number: '3',
      title: 'Нижняя часть тела',
      badge: 'День А / Б',
      subtitle: 'Переключатель между базой и изолирующими тренажерами',
      type: 'conditional_legs',
      activeMode: 'day_a', // 'day_a' или 'day_b'
      modes: {
        day_a: {
          label: 'День А: Базовый свободный вес',
          shortLabel: 'День А (Свободный вес)',
          badgeColor: '#ffb800',
          exercises: [
            {
              id: 'squat_foreman',
              title: 'Присед со штангой на спине',
              machine: 'Силовая рама Foreman',
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
            }
          ]
        },
        day_b: {
          label: 'День Б: Изоляция на тренажерах',
          shortLabel: 'День Б (Изоляция)',
          badgeColor: '#00e676',
          exercises: [
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
            }
          ]
        }
      }
    },
    {
      id: 'block_core',
      number: '4',
      title: 'Мышцы кора / Пресс',
      badge: 'Финишер',
      subtitle: 'Завершающий блок тренировки',
      type: 'exercises',
      exercises: [
        {
          id: 'ab_crunch_panatta',
          title: 'Скручивания на пресс',
          machine: 'Тренажер Panatta Circular Crunch / Abdominal',
          image: 'assets/exercises/ab_crunch_panatta.jpg',
          targetRestSec: 60,
          restPresets: [45, 60, 90],
          notes: '4 подхода по 10–12 повторений с отягощением +30 кг. Мощный выдох на пиковом сокращении.',
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
};

// Функция создания глубокой копии начального состояния
function getDefaultWorkoutState() {
  return JSON.parse(JSON.stringify(WORKOUT_PROGRAM));
}
