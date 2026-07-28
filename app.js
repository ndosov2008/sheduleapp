import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const SUPABASE_URL = 'https://gqnzzwnfduckovlxtnzm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Zx3zDKyvL2E-Bc9KnVoXeg_q9xeVNz-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GOOGLE_APP_URL = "https://script.google.com/macros/s/AKfycbwQsWj07JbHMyUPrt_Ft0vkZw9UnyRRg-JRMXM0qSyj5GtvsA6838Gy-VB3xj1zw58G6A/exec";
const ADMIN_TG_ID = 5555823645;
let currentTeacherId = null;
let selectedRatingValue = 5;

let state = {
    course: null,
    group: null,
    day: "1",
    targetFlow: null 
};

let scheduleData = {};

const groupsConfig = [
    { id: 1, spec: 'ИСИТ' }, { id: 2, spec: 'ИСИТ' }, { id: 3, spec: 'ИСИТ' },
    { id: 4, spec: 'ЦД' },   { id: 5, spec: 'ЦД' },
    { id: 6, spec: 'ПИ' },   { id: 7, spec: 'ПИ' },   { id: 8, spec: 'ПИ' }
];

const sessionExamsData = {
    "1": {
        "8": [ 
            { id: "1_8_1", subject: "Основы алгоритмизации и программирования", type: "Экзамен", teacher: "доц. Белодед Н.И." },
            { id: "1_8_2", subject: "Математический анализ", type: "Экзамен", teacher: "доц. Ловенецкая Е.И." },
            { id: "1_8_3", subject: "Арифметико-логические основы ВС", type: "Экзамен", teacher: "доц. Гринюк Д.А." },
            { id: "1_8_4", subject: "Линейная алгебра и анал. геометрия", type: "Диф. зачет", teacher: "доц. Ловенецкая Е.И." },
            { id: "1_8_5", subject: "Компьютерные языки разметки", type: "Зачет", teacher: "доц. Жиляк Н.А." }
        ],
        "default": [
            { id: "def_1", subject: "Математика", type: "Экзамен", teacher: "Преподаватель" },
            { id: "def_2", subject: "Программирование", type: "Экзамен", teacher: "Преподаватель" }
        ]
    }
};

// ПОЛНЫЙ СПИСОК ПРЕПОДАВАТЕЛЕЙ С КАФЕДРАМИ И ДОЛЖНОСТЯМИ
const teachersData = [
    // Кафедра ИСИТ
    { name: "Блинова Е.А.", dept: "ИСИТ", position: "Заведующий кафедрой, к.т.н." },
    { name: "Урбанович П.П.", dept: "ИСИТ", position: "Профессор, д.т.н." },
    { name: "Гурин Н.И.", dept: "ИСИТ", position: "Доцент" },
    { name: "Пустовалова Н.Н.", dept: "ИСИТ", position: "Доцент, к.т.н." },
    { name: "Жиляк Н.А.", dept: "ИСИТ", position: "Доцент, к.т.н." },
    { name: "Савельева М.Г.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Кантарович В.С.", dept: "ИСИТ", position: "Старший преподаватель" },
    { name: "Жук Я.А.", dept: "ИСИТ", position: "Старший преподаватель" },
    { name: "Тимонович Г.Л.", dept: "ИСИТ", position: "Доцент, к.т.н." },
    { name: "Бернацкий П.В.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Нистюк О.А.", dept: "ИСИТ", position: "Старший преподаватель" },
    { name: "Харланович А.В.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Барковский Е.В.", dept: "ИСИТ", position: "Старший преподаватель" },
    { name: "Сергей Л.В.", dept: "ИСИТ", position: "Инженер 2 категории" },
    { name: "Шкуратова С.А.", dept: "ИСИТ", position: "Оператор" },
    { name: "Безмен Н.Б.", dept: "ИСИТ", position: "Инженер" },
    { name: "Малевич И.Д.", dept: "ИСИТ", position: "Инженер" },
    { name: "Шешолко В.К.", dept: "ИСИТ", position: "Доцент" },
    { name: "Сазонова Д.В.", dept: "ИСИТ", position: "Старший преподаватель" },
    { name: "Ржеутская Н.В.", dept: "ИСИТ", position: "Старший преподаватель" },
    { name: "Уласевич Н.И.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Николайчук А.Н.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Подрез А.А.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Алешаускас В.А.", dept: "ИСИТ", position: "Ассистент" },
    { name: "Заянковский Д.В.", dept: "ИСИТ", position: "Ассистент" },

    // Кафедра информатики и веб-дизайна
    { name: "Романенко Д.М.", dept: "Информатики и веб-дизайна", position: "Заведующий кафедрой, доцент" },
    { name: "Дятко А.А.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Новосельская О.А.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Гайдук С.С.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Шутько Н.П.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Короленя Р.О.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Кудлацкая М.Ф.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Мирончик Е.С.", dept: "Информатики и веб-дизайна", position: "Доцент" },
    { name: "Осоко С.А.", dept: "Информатики и веб-дизайна", position: "Старший преподаватель" },
    { name: "Савчук Н.А.", dept: "Информатики и веб-дизайна", position: "Старший преподаватель" },
    { name: "Щербакова А.Н.", dept: "Информатики и веб-дизайна", position: "Старший преподаватель" },
    { name: "Попеня Н.В.", dept: "Информатики и веб-дизайна", position: "Старший преподаватель" },
    { name: "Игнаткова Я.А.", dept: "Информатики и веб-дизайна", position: "Старший преподаватель" },
    { name: "Кунцевич С.В.", dept: "Информатики и веб-дизайна", position: "Инженер" },
    { name: "Кизино А.В.", dept: "Информатики и веб-дизайна", position: "Преподаватель-стажер" },
    { name: "Ворошень В.А.", dept: "Информатики и веб-дизайна", position: "Преподаватель-стажер" },
    { name: "Обухова Е.В.", dept: "Информатики и веб-дизайна", position: "Преподаватель-стажер" },
    { name: "Гончарова З.В.", dept: "Информатики и веб-дизайна", position: "Инженер" },
    { name: "Горячко Д.С.", dept: "Информатики и веб-дизайна", position: "Инженер" },

    // Кафедра программной инженерии
    { name: "Смелов В.В.", dept: "Программной инженерии", position: "Заведующий кафедрой, доцент" },
    { name: "Шиман Д.В.", dept: "Программной инженерии", position: "Доцент" },
    { name: "Парамонов А.И.", dept: "Программной инженерии", position: "Доцент" },
    { name: "Белодед Н.И.", dept: "Программной инженерии", position: "Доцент" },
    { name: "Наркевич А.С.", dept: "Программной инженерии", position: "Старший преподаватель" },
    { name: "Сухорукова И.Г.", dept: "Программной инженерии", position: "Старший преподаватель" },
    { name: "Волчек Д.И.", dept: "Программной инженерии", position: "Ассистент" },
    { name: "Мущук А.Н.", dept: "Программной инженерии", position: "Ассистент" },
    { name: "Гончар Е.А.", dept: "Программной инженерии", position: "Ассистент" },
    { name: "Некрасова А.П.", dept: "Программной инженерии", position: "Преподаватель-стажер" },
    { name: "Гурина К.С.", dept: "Программной инженерии", position: "Преподаватель-стажер" },
    { name: "Авдеева В.Д.", dept: "Программной инженерии", position: "Преподаватель-стажер" },
    { name: "Шкабара И.Н.", dept: "Программной инженерии", position: "Инженер" },
    { name: "Цягунович Т.В.", dept: "Программной инженерии", position: "Инженер" },

    // Кафедра физики
    { name: "Крук Н.Н.", dept: "Физики", position: "Заведующий кафедрой физики, профессор" },
    { name: "Наркевич И.И.", dept: "Физики", position: "Профессор" },
    { name: "Бобрович О.Г.", dept: "Физики", position: "Доцент" },
    { name: "Кленицкий Д.В.", dept: "Физики", position: "Доцент" },
    { name: "Крылов А.Б.", dept: "Физики", position: "Доцент" },
    { name: "Миксюк Ю.И.", dept: "Физики", position: "Доцент" },
    { name: "Мисевич А.В.", dept: "Физики", position: "Доцент" },
    { name: "Поплавский В.В.", dept: "Физики", position: "Доцент" },
    { name: "Тульев В.В.", dept: "Физики", position: "Доцент" },
    { name: "Фарафонтова Е.В.", dept: "Физики", position: "Доцент" },
    { name: "Вершиловская И.В.", dept: "Физики", position: "Доцент" },
    { name: "Буцень А.В.", dept: "Физики", position: "Ассистент" },
    { name: "Филиппова П.П.", dept: "Физики", position: "Преподаватель-стажер" },

    // Кафедра инженерной графики
    { name: "Касперов Г.И.", dept: "Инженерной графики", position: "Заведующий кафедрой, доцент" },
    { name: "Гарабажиу А.А.", dept: "Инженерной графики", position: "Доцент" },
    { name: "Красковский С.В.", dept: "Инженерной графики", position: "Доцент" },
    { name: "Науменко А.И.", dept: "Инженерной графики", position: "Доцент" },
    { name: "Бобровский С.Э.", dept: "Инженерной графики", position: "Старший преподаватель" },
    { name: "Гиль В.И.", dept: "Инженерной графики", position: "Старший преподаватель" },
    { name: "Исаченков В.С.", dept: "Инженерной графики", position: "Старший преподаватель" },
    { name: "Войтеховский Б.В.", dept: "Инженерной графики", position: "Старший преподаватель" },
    { name: "Ращупкин С.В.", dept: "Инженерной графики", position: "Старший преподаватель" },
    { name: "Лосик Е.А.", dept: "Инженерной графики", position: "Ассистент" },
    { name: "Журавлева Я.Ю.", dept: "Инженерной графики", position: "Преподаватель-стажер" },

    // Кафедра высшей математики
    { name: "Пыжкова О.Н.", dept: "Высшей математики", position: "Заведующий кафедрой, доцент" },
    { name: "Савва В.А.", dept: "Высшей математики", position: "Профессор" },
    { name: "Асмыкович И.К.", dept: "Высшей математики", position: "Доцент" },
    { name: "Борковская И.М.", dept: "Высшей математики", position: "Доцент" },
    { name: "Волк А.М.", dept: "Высшей математики", position: "Доцент" },
    { name: "Игнатенко В.В.", dept: "Высшей математики", position: "Доцент" },
    { name: "Ловенецкая Е.И.", dept: "Высшей математики", position: "Доцент" },
    { name: "Соловьева И.Ф.", dept: "Высшей математики", position: "Доцент" },
    { name: "Слепцов В.Ф.", dept: "Высшей математики", position: "Доцент" },
    { name: "Якименко А.А.", dept: "Высшей математики", position: "Доцент" },
    { name: "Яроцкая Л.Д.", dept: "Высшей математики", position: "Доцент" },
    { name: "Бочило Н.В.", dept: "Высшей математики", position: "Старший преподаватель" },
    { name: "Калиновская Е.В.", dept: "Высшей математики", position: "Старший преподаватель" },
    { name: "Устилко Е.В.", dept: "Высшей математики", position: "Старший преподаватель" },
    { name: "Явид Е.В.", dept: "Высшей математики", position: "Старший преподаватель" },
    { name: "Янович С.В.", dept: "Высшей математики", position: "Старший преподаватель" },
    { name: "Капура М.С.", dept: "Высшей математики", position: "Ассистент" },
    { name: "Жолуд Е.И.", dept: "Высшей математики", position: "Преподаватель-стажер" },
    { name: "Миронович Г.Н.", dept: "Высшей математики", position: "Специалист" }
];

// Присваиваем каждому преподавателю оригинальный ID для связи с модалкой
teachersData.forEach((t, i) => t.originalId = i);

let previousScreen = 'main-menu-screen';
let cachedReviewsData = null; // Кэш для отзывов

function getTodayDayCode() {
    const jsDay = new Date().getDay();
    if (jsDay === 0 || jsDay > 6) return "1";
    return jsDay.toString();
}

function getAccentColor() {
    return getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#3390ec';
}

async function initApp() {
    try {
        const response = await fetch('data.json');
        scheduleData = await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке расписания:', error);
    }

    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    setTheme(savedTheme);

    const savedCustomBg = localStorage.getItem('app_custom_bg');
    if (savedCustomBg) {
        document.documentElement.style.setProperty('--bg-image', `url(${savedCustomBg})`);
        document.body.classList.add('has-custom-bg');
    }

    const defaultCourse = localStorage.getItem('default_course');
    const defaultGroup = localStorage.getItem('default_group');
    if (defaultCourse && defaultGroup) {
        state.course = defaultCourse;
        state.group = defaultGroup;
    }
}

initApp();

function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    
    if (localStorage.getItem('app_custom_bg')) {
        document.body.classList.add('has-custom-bg');
    }

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active-theme', btn.dataset.theme === themeName);
    });
    localStorage.setItem('app_theme', themeName);
    updateStarsColor();
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('theme-btn')) {
        setTheme(e.target.dataset.theme);
    }
});

const bgFileInput = document.getElementById('bg-file-input');
const removeBgBtn = document.getElementById('remove-bg-btn');

if(bgFileInput) {
    bgFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Image = e.target.result;
                document.documentElement.style.setProperty('--bg-image', `url(${base64Image})`);
                localStorage.setItem('app_custom_bg', base64Image);
                document.body.classList.add('has-custom-bg');
            };
            reader.readAsDataURL(file);
        }
    });
}

if(removeBgBtn) {
    removeBgBtn.addEventListener('click', () => {
        document.documentElement.style.removeProperty('--bg-image');
        localStorage.removeItem('app_custom_bg');
        bgFileInput.value = '';
        document.body.classList.remove('has-custom-bg');
    });
}

function showScreen(screenId) {
    const currentActive = document.querySelector('.screen.active');
    if (currentActive && currentActive.id !== 'settings-screen') {
        previousScreen = currentActive.id; 
    }

    document.querySelectorAll('.screen').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('.menu-btn');
    if (menuBtn) {
        const targetFlow = menuBtn.dataset.target;
        state.targetFlow = targetFlow;

        if (targetFlow === 'teachers-screen') {
            showScreen(targetFlow);
            renderTeachers();
        } else {
            if (state.course && state.group) {
                if (targetFlow === 'schedule-flow') showScheduleScreen();
                if (targetFlow === 'session-screen') showSessionScreen();
                if (targetFlow === 'labs-screen') showScreen('labs-screen');
            } else {
                showScreen('selection-screen');
            }
        }
    }

    if (e.target.classList.contains('back-to-menu')) {
        showScreen('main-menu-screen');
    }
});

const groupBlock = document.getElementById('group-block');
const groupGrid = document.getElementById('group-grid');
const submitBtn = document.getElementById('submit-btn');

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.choice-btn');
    if (!btn) return;

    const type = btn.dataset.type;
    const val = btn.dataset.val;

    document.querySelectorAll(`.choice-btn[data-type="${type}"]`).forEach(b => {
        b.classList.remove('selected');
    });

    btn.classList.add('selected');
    state[type] = val;

    if (type === 'course') {
        groupBlock.classList.remove('hidden');
        renderGroups();
    }

    if (state.course && state.group) {
        submitBtn.disabled = false;
    }
});

function renderGroups() {
    if (groupGrid.children.length > 0) return;
    groupGrid.innerHTML = '';
    groupsConfig.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.type = 'group';
        btn.dataset.val = g.id;
        btn.innerHTML = `<div class="group-num">${g.id}</div><div class="group-spec">${g.spec}</div>`;
        groupGrid.appendChild(btn);
    });
}

if(submitBtn) {
    submitBtn.addEventListener('click', () => {
        if (state.targetFlow === 'session-screen') {
            showSessionScreen();
        } else if (state.targetFlow === 'labs-screen') {
            showScreen('labs-screen');
        } else {
            showScheduleScreen();
        }
    });
}

function showScheduleScreen() {
    showScreen('schedule-screen');
    document.getElementById('current-selection-title').textContent = `${state.course} курс, гр. ${state.group}`;
    state.day = getTodayDayCode();
    updateActiveTab();
    renderSchedule();
}

const daysTabs = document.getElementById('days-tabs');
if(daysTabs) {
    daysTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-tab')) {
            state.day = e.target.dataset.day;
            updateActiveTab();
            renderSchedule();
        }
    });
}

function updateActiveTab() {
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.day === state.day);
    });
}

function renderSchedule() {
    const scheduleContainer = document.getElementById('schedule-container');
    scheduleContainer.innerHTML = ''; 
    const courseData = scheduleData[state.course] || {};
    const groupData = courseData[state.group] || {};
    const dayData = groupData[state.day] || [];

    if (dayData.length === 0) {
        scheduleContainer.innerHTML = '<p style="text-align:center; color: var(--hint-color); margin-top: 20px;">Нет пар на этот день</p>';
        return;
    }

    dayData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        card.innerHTML = `
            <div class="subject-title">${item.subject} <span class="subject-type">${item.type}</span></div>
            <div class="details">
                <p>Время: ${item.time}</p>
                <p>Преподаватель: ${item.teacher || '-'}</p>
                <p>Аудитория: ${item.room}</p>
            </div>
        `;
        scheduleContainer.appendChild(card);
    });
}

let currentSessionExams = [];

function showSessionScreen() {
    showScreen('session-screen');
    document.getElementById('session-title').textContent = `Сессия (${state.course}к, ${state.group}гр)`;
    
    const courseExams = sessionExamsData[state.course] || {};
    currentSessionExams = courseExams[state.group] || courseExams["default"] || [];
    
    currentSessionExams.forEach(exam => {
        exam.grade = localStorage.getItem(`grade_${exam.id}`) || "";
    });

    renderSession();
}

function renderSession() {
    const container = document.getElementById('session-container');
    container.innerHTML = '';

    if (currentSessionExams.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--hint-color);">Данные по экзаменам не найдены</p>';
        return;
    }

    currentSessionExams.forEach(exam => {
        let optionsHtml = '';
        
        if (exam.type === 'Зачет') {
            optionsHtml = `
                <option value="">Нет результата</option>
                <option value="Сдал" ${exam.grade === 'Сдал' ? 'selected' : ''}>Сдал</option>
                <option value="Не сдал" ${exam.grade === 'Не сдал' ? 'selected' : ''}>Не сдал</option>
            `;
        } else {
            optionsHtml = `
                <option value="">Нет оценки</option>
                <option value="4" ${exam.grade === '4' ? 'selected' : ''}>4</option>
                <option value="5" ${exam.grade === '5' ? 'selected' : ''}>5</option>
                <option value="6" ${exam.grade === '6' ? 'selected' : ''}>6</option>
                <option value="7" ${exam.grade === '7' ? 'selected' : ''}>7</option>
                <option value="8" ${exam.grade === '8' ? 'selected' : ''}>8</option>
                <option value="9" ${exam.grade === '9' ? 'selected' : ''}>9</option>
                <option value="10" ${exam.grade === '10' ? 'selected' : ''}>10</option>
            `;
        }

        const card = document.createElement('div');
        card.className = 'schedule-card';
        card.innerHTML = `
            <div class="subject-title">${exam.subject} <span class="subject-type">${exam.type}</span></div>
            <div class="details" style="margin-bottom: 10px;">
                <p>Преподаватель: ${exam.teacher}</p>
            </div>
            <div class="grade-selector" style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 14px; color: var(--hint-color);">Результат:</span>
                <select class="exam-grade-select" data-id="${exam.id}" style="background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 8px;">
                    ${optionsHtml}
                </select>
            </div>
        `;
        container.appendChild(card);
    });
    calculateGPA();
}

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('exam-grade-select')) {
        const id = e.target.dataset.id;
        const val = e.target.value;
        const exam = currentSessionExams.find(ex => ex.id == id);
        if (exam) {
            exam.grade = val;
            localStorage.setItem(`grade_${id}`, val);
            calculateGPA();
        }
    }
});

function calculateGPA() {
    let sum = 0;
    let count = 0;
    currentSessionExams.forEach(exam => {
        if (exam.type !== 'Зачет' && exam.grade !== "") {
            const gradeNum = parseInt(exam.grade);
            if (!isNaN(gradeNum)) {
                sum += gradeNum;
                count++;
            }
        }
    });
    const gpa = count > 0 ? (sum / count).toFixed(2) : "0.00";
    const gpaScoreEl = document.getElementById('gpa-score');
    if(gpaScoreEl) gpaScoreEl.textContent = gpa;
}

const openSettingsBtn = document.getElementById('open-settings-btn');
const scheduleSettingsBtn = document.getElementById('schedule-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

if(openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
        showScreen('settings-screen');
        document.getElementById('default-course-select').value = localStorage.getItem('default_course') || '';
        document.getElementById('default-group-select').value = localStorage.getItem('default_group') || '';
    });
}

if (scheduleSettingsBtn) {
    scheduleSettingsBtn.addEventListener('click', () => {
        showScreen('settings-screen');
        document.getElementById('default-course-select').value = localStorage.getItem('default_course') || '';
        document.getElementById('default-group-select').value = localStorage.getItem('default_group') || '';
    });
}

if(closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => showScreen(previousScreen));
}

const saveSettingsBtn = document.getElementById('save-settings-btn');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const defaultCourseSelect = document.getElementById('default-course-select');
const defaultGroupSelect = document.getElementById('default-group-select');

if(saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
        const c = defaultCourseSelect.value;
        const g = defaultGroupSelect.value;
        if (c && g) {
            localStorage.setItem('default_course', c);
            localStorage.setItem('default_group', g);
            tg.showAlert('Настройки сохранены! При следующем входе группа загрузится автоматически.');
        } else {
            tg.showAlert('Выберите курс и группу.');
        }
    });
}

if(resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
        localStorage.removeItem('default_course');
        localStorage.removeItem('default_group');
        defaultCourseSelect.value = '';
        defaultGroupSelect.value = '';
        tg.showAlert('Автозапуск сброшен.');
    });
}

async function fetchGoogleSheet(action, payload = {}) {
    try {
        if (action === 'getReviews') {
            const { data, error } = await supabase.from('reviews').select('*');
            if (error) throw error;
            return data;
        } 
        else if (action === 'addReview') {
            const { error } = await supabase.from('reviews').insert([payload]);
            if (error) throw error;
            return { success: true };
        } 
        else if (action === 'updateStatus') {
            const { error } = await supabase
                .from('reviews')
                .update({ status: payload.status })
                .eq('id', payload.id);
            if (error) throw error;
            return { success: true };
        } 
        else if (action === 'deleteReview') {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', payload.id);
            if (error) throw error;
            return { success: true };
        }
    } catch (error) {
        console.error("Ошибка Supabase:", error);
        return { success: false, errorMsg: error.message || JSON.stringify(error) };
    }
}

// ГЛАВНАЯ ФУНКЦИЯ ДЛЯ ОТРИСОВКИ ПРЕПОДАВАТЕЛЕЙ С ФИЛЬТРАМИ И СОРТИРОВКОЙ
async function renderTeachers() {
    const container = document.getElementById('teachers-container');
    
    // 1. Рисуем интерфейс поиска и фильтров (если еще не отрисован)
    if (!document.getElementById('teacher-controls-block')) {
        const controlsHtml = `
            <div id="teacher-controls-block" style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
                <input type="text" id="teacher-search-input" placeholder="Поиск по имени..." style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color); font-size: 14px; outline: none;">
                
                <div style="display: flex; gap: 10px;">
                    <select id="teacher-dept-filter" style="flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color); font-size: 13px; outline: none;">
                        <option value="all">Все кафедры</option>
                        <option value="ИСИТ">ИСИТ</option>
                        <option value="Информатики и веб-дизайна">Информ. и веб-дизайна</option>
                        <option value="Программной инженерии">Программной инженерии</option>
                        <option value="Физики">Физики</option>
                        <option value="Инженерной графики">Инженерной графики</option>
                        <option value="Высшей математики">Высшей математики</option>
                    </select>
                    
                    <select id="teacher-sort-select" style="flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color); font-size: 13px; outline: none;">
                        <option value="name_asc">А -> Я</option>
                        <option value="name_desc">Я -> А</option>
                        <option value="rating_desc">Лучший рейтинг</option>
                        <option value="rating_asc">Низкий рейтинг</option>
                    </select>
                </div>
            </div>
            <div id="teachers-list-container"></div>
        `;
        container.innerHTML = controlsHtml;

        // Вешаем слушатели на изменение фильтров
        document.getElementById('teacher-search-input').addEventListener('input', updateTeachersListUI);
        document.getElementById('teacher-dept-filter').addEventListener('change', updateTeachersListUI);
        document.getElementById('teacher-sort-select').addEventListener('change', updateTeachersListUI);
    }

    const listContainer = document.getElementById('teachers-list-container');
    
    // Показываем кнопку админа при необходимости
    const currentUserId = tg.initDataUnsafe?.user?.id;
    const adminBtn = document.getElementById('admin-panel-btn');
    if (currentUserId === ADMIN_TG_ID || localStorage.getItem('force_admin') === 'true') {
        adminBtn.classList.remove('hidden');
    }

    // Скачиваем отзывы один раз и кэшируем, чтобы фильтры работали без задержек
    if (!cachedReviewsData) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--hint-color); padding: 20px;">Загрузка данных...</p>';
        cachedReviewsData = await fetchGoogleSheet('getReviews') || [];
    }

    updateTeachersListUI();
}

// ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ
function updateTeachersListUI() {
    const listContainer = document.getElementById('teachers-list-container');
    const searchQuery = document.getElementById('teacher-search-input').value.toLowerCase().trim();
    const deptFilter = document.getElementById('teacher-dept-filter').value;
    const sortMode = document.getElementById('teacher-sort-select').value;
    
    listContainer.innerHTML = ''; // Очищаем список

    // 1. Высчитываем актуальный рейтинг и количество отзывов для каждого препода
    let mappedTeachers = teachersData.map(t => {
        const teacherReviews = cachedReviewsData.filter(r => String(r.teacherid) === String(t.originalId) && String(r.status).trim() === 'approved');
        const ratings = teacherReviews.filter(r => r.rating !== undefined && r.rating !== "").map(r => Number(r.rating));
        
        const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
        
        return {
            ...t,
            avgRating: parseFloat(avgRating),
            reviewCount: ratings.length
        };
    });

    // 2. ФИЛЬТРУЕМ по имени и кафедре
    let filteredTeachers = mappedTeachers.filter(t => {
        const matchName = t.name.toLowerCase().includes(searchQuery);
        const matchDept = (deptFilter === 'all') || (t.dept === deptFilter);
        return matchName && matchDept;
    });

    // 3. СОРТИРУЕМ результаты
    filteredTeachers.sort((a, b) => {
        if (sortMode === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (sortMode === 'name_desc') {
            return b.name.localeCompare(a.name);
        } else if (sortMode === 'rating_desc') {
            // При равном рейтинге выше те, у кого больше отзывов
            if (b.avgRating === a.avgRating) return b.reviewCount - a.reviewCount;
            return b.avgRating - a.avgRating; 
        } else if (sortMode === 'rating_asc') {
            // Преподы без рейтинга (0) падают вниз, чтобы не мешать
            if (a.avgRating === 0 && b.avgRating !== 0) return 1;
            if (b.avgRating === 0 && a.avgRating !== 0) return -1;
            
            if (a.avgRating === b.avgRating) return b.reviewCount - a.reviewCount;
            return a.avgRating - b.avgRating;
        }
        return 0;
    });

    if (filteredTeachers.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color: var(--hint-color); margin-top: 20px;">Ничего не найдено</p>';
        return;
    }

    // 4. ОТРИСОВЫВАЕМ КАРТОЧКИ
    filteredTeachers.forEach(t => {
        const card = document.createElement('div');
        card.className = 'schedule-card teacher-card-clickable';
        card.dataset.id = t.originalId; 

        const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888888'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
        const photoSrc = t.photo ? t.photo : defaultAvatar;
        
        // Красивое форматирование бейджика рейтинга
        const displayRating = t.avgRating > 0 ? `[${t.avgRating}]` : '—';
        const reviewText = t.reviewCount > 0 ? `<div style="font-size: 10px; opacity: 0.7; margin-top: 2px;">${t.reviewCount} отзыв(ов)</div>` : `<div style="font-size: 10px; opacity: 0.7; margin-top: 2px;">Нет оценок</div>`;

        // Специальный визуальный тег для Заведующих кафедрой
        const isHead = t.position && t.position.toLowerCase().includes("заведующий");
        const positionBadge = isHead ? `<span style="background: rgba(234, 179, 8, 0.2); color: #eab308; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid rgba(234, 179, 8, 0.4);">⭐ Зав. кафедрой</span>` : '';

        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${photoSrc}" alt="Фото" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; background-color: rgba(255,255,255,0.05); border: 1px solid var(--border-color);">
                    <div>
                        <div class="subject-title" style="margin-bottom: 4px;">${t.name}</div>
                        <div style="font-size: 11px; color: var(--hint-color); line-height: 1.4;">
                            ${positionBadge} ${t.position ? t.position.replace('Заведующий кафедрой, ', '') : 'Преподаватель'}<br>
                            Кафедра: <span style="color: var(--text-color);">${t.dept}</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="background: var(--accent-color); color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                        ${displayRating}
                    </div>
                    ${reviewText}
                </div>
            </div>
            <div style="font-size: 12px; color: var(--accent-color); text-align: right; margin-top: 4px;">Оставить отзыв -></div>
        `;
        
        card.addEventListener('click', () => openTeacherModal(t.originalId));
        listContainer.appendChild(card);
    });
}

const teacherModal = document.getElementById('teacher-modal');
async function openTeacherModal(index) {
    currentTeacherId = index;
    selectedRatingValue = 5; 
    
    // Находим нужного препода по оригинальному ID
    const t = teachersData.find(item => item.originalId === index); 
    
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888888'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
    const photoSrc = t.photo ? t.photo : defaultAvatar;

    document.getElementById('teacher-modal-header').innerHTML = `
        <img src="${photoSrc}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        <div>
            <h2 style="font-size: 18px; margin-bottom: 4px;">${t.name}</h2>
            <div style="font-size: 12px; color: var(--hint-color);">${t.position || 'Преподаватель'}</div>
        </div>
    `;

    updateStarsPickerDOM();

    document.getElementById('teacher-reviews-list').innerHTML = '<p style="color: var(--hint-color); text-align: center;">Загрузка отзывов...</p>';
    teacherModal.classList.remove('hidden');

    await renderTeacherReviews(index);
}

function updateStarsPickerDOM() {
    const accentColor = getAccentColor();
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= selectedRatingValue;
        const fillColor = isActive ? accentColor : 'transparent';
        const strokeColor = isActive ? accentColor : 'var(--hint-color)';
        const opacity = isActive ? '1' : '0.4';

        starsHtml += `
            <button type="button" class="star-btn" data-value="${i}" style="background: none; border: none; cursor: pointer; padding: 4px; opacity: ${opacity}; transition: opacity 0.2s;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </button>
        `;
    }
    
    const pickerContainer = document.getElementById('star-rating-picker');
    if (pickerContainer) {
        pickerContainer.innerHTML = starsHtml;
    } else {
        const infoBlock = document.getElementById('teacher-modal-info');
        if (infoBlock) {
            infoBlock.innerHTML = `
                <div style="margin-bottom: 15px; text-align: center;">
                    <label style="font-size: 13px; color: var(--hint-color); display: block; margin-bottom: 8px;">Оценка:</label>
                    <div id="star-rating-picker" style="display: flex; justify-content: center; gap: 4px;">
                        ${starsHtml}
                    </div>
                </div>
            `;
        }
    }
}

function updateStarsColor() {
    if (!teacherModal.classList.contains('hidden')) {
        updateStarsPickerDOM();
    }
}

document.addEventListener('click', (e) => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) {
        selectedRatingValue = parseInt(starBtn.dataset.value);
        updateStarsPickerDOM();
    }
});

async function renderTeacherReviews(teacherId) {
    const list = document.getElementById('teacher-reviews-list');
    const accentColor = getAccentColor();
    
    // Загружаем отзывы и обновляем кэш, если его нет или принудительно (после добавления)
    const allReviews = await fetchGoogleSheet('getReviews');
    cachedReviewsData = allReviews; 
    
    if (!allReviews) {
        list.innerHTML = '<p style="color: red; font-size: 13px; text-align: center;">Ошибка сети.</p>';
        return;
    }

    const approvedReviews = allReviews.filter(r => String(r.teacherid) === String(teacherId) && String(r.status).trim() === 'approved');
    const currentUserId = tg.initDataUnsafe?.user?.id;
    const isAdmin = (currentUserId === ADMIN_TG_ID || localStorage.getItem('force_admin') === 'true');

    list.innerHTML = '';
    if (approvedReviews.length === 0) {
        list.innerHTML = '<p style="color: var(--hint-color); font-size: 13px; text-align: center;">Пока нет отзывов.</p>';
    } else {
        approvedReviews.forEach(r => {
            const canDelete = isAdmin || (currentUserId && String(r.authorid) === String(currentUserId));
            const deleteBtnHtml = canDelete ? `<button class="delete-review-btn" data-id="${r.id}" style="float: right; background: none; border: none; font-size: 12px; cursor: pointer; color: var(--hint-color);">[Удалить]</button>` : '';
            
            let reviewStars = '';
            if (r.rating) {
                const count = Number(r.rating);
                for (let i = 1; i <= 5; i++) {
                    const isActive = i <= count;
                    const fillColor = isActive ? accentColor : 'transparent';
                    const strokeColor = isActive ? accentColor : 'var(--hint-color)';
                    const opacity = isActive ? '1' : '0.3';
                    reviewStars += `<svg width="12" height="12" viewBox="0 0 24 24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-left:1px; opacity:${opacity};"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                }
            }

            list.innerHTML += `
                <div class="review-item" style="padding-top: 8px;">
                    <div style="font-size: 12px; color: var(--accent-color); margin-bottom: 6px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${r.author || 'Студент'} <span style="margin-left: 6px;">${reviewStars}</span></span>
                        ${deleteBtnHtml}
                    </div>
                    <div style="font-size: 13px;">${r.text}</div>
                </div>`;
        });
    }
}

document.getElementById('teacher-reviews-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-review-btn');
    if (btn) {
        const id = btn.dataset.id;
        if (confirm("Удалить этот отзыв навсегда?")) {
            btn.textContent = "...";
            await fetchGoogleSheet('deleteReview', { id: id });
            await renderTeacherReviews(currentTeacherId);
            updateTeachersListUI(); // Обновляем рейтинг снаружи
        }
    }
});

const submitReviewBtn = document.getElementById('submit-review-btn');
if(submitReviewBtn) {
    submitReviewBtn.addEventListener('click', async () => {
        const textInput = document.getElementById('review-text');
        const text = textInput.value.trim();
        const rating = selectedRatingValue.toString();
        
        if (text.length < 3) {
            tg.showAlert("Текст отзыва слишком короткий!");
            return;
        }

        const badWords = ['дурак', 'дебил', 'сука', 'хрен', 'мразь', 'бля', 'хуй', 'пизд']; 
        const lowerText = text.toLowerCase();
        
        const isBad = badWords.some(word => lowerText.includes(word));
        if (isBad) {
            tg.showAlert("Пожалуйста, выражайтесь культурно. Отзыв содержит запрещенные слова.");
            return; 
        }

        const user = tg.initDataUnsafe?.user;
        let authorName = "Анонимный Студент";
        let authorId = null;

        if (user) {
            authorName = user.username ? `@${user.username}` : user.first_name;
            authorId = user.id;
        }

        submitReviewBtn.disabled = true;
        submitReviewBtn.textContent = "Отправка...";

        const newReview = {
            teacherid: currentTeacherId.toString(),
            text: text,
            rating: rating,
            author: authorName,
            authorid: authorId ? authorId.toString() : "",
            status: 'approved' 
        };

        const res = await fetchGoogleSheet('addReview', newReview);

        if (res && res.success) {
            textInput.value = '';
            tg.showAlert("Отзыв успешно опубликован!"); 
            
            await renderTeacherReviews(currentTeacherId); // перерисовка отзывов внутри
            updateTeachersListUI(); // перерисовка главного списка (чтобы обновилась оценка)
        } else {
            tg.showAlert("Ошибка БД: " + (res?.errorMsg || "Неизвестная ошибка"));
        }

        submitReviewBtn.disabled = false;
        submitReviewBtn.textContent = "Оставить отзыв"; 
    });
}

const closeModalBtn = document.querySelector('.close-modal-btn');
if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        teacherModal.classList.add('hidden');
    });
}

const adminModal = document.getElementById('admin-modal');
const adminPanelBtn = document.getElementById('admin-panel-btn');

if(adminPanelBtn) {
    adminPanelBtn.addEventListener('click', async () => {
        adminModal.classList.remove('hidden');
        await renderAdminReviews();
    });
}

const closeAdminBtn = document.querySelector('.close-admin-btn');
if(closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });
}

async function renderAdminReviews() {
    const list = document.getElementById('admin-reviews-list');
    const accentColor = getAccentColor();
    list.innerHTML = '<p style="color: var(--hint-color); text-align: center;">Загрузка отзывов...</p>';

    const allReviews = await fetchGoogleSheet('getReviews');
    
    if (!allReviews) {
        list.innerHTML = '<p style="color: red; text-align: center;">Ошибка доступа к таблице.</p>';
        return;
    }

    const pendingReviews = allReviews.filter(r => String(r.status).trim() === 'pending');

    list.innerHTML = '';
    if (pendingReviews.length === 0) {
        list.innerHTML = '<p style="color: var(--hint-color); font-size: 13px; text-align: center;">Все чисто! Новых отзывов нет.</p>';
    } else {
        pendingReviews.forEach(r => {
            const t = teachersData.find(item => item.originalId == r.teacherid);
            const tName = t ? t.name : "Неизвестный препод";
            let reviewStars = '';
            if (r.rating) {
                const count = Number(r.rating);
                for (let i = 1; i <= 5; i++) {
                    const isActive = i <= count;
                    const fillColor = isActive ? accentColor : 'transparent';
                    const strokeColor = isActive ? accentColor : 'var(--hint-color)';
                    const opacity = isActive ? '1' : '0.3';
                    reviewStars += `<svg width="10" height="10" viewBox="0 0 24 24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-left:1px; opacity:${opacity};"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                }
            }
            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
                <div style="color: var(--accent-color); font-size: 12px; margin-bottom: 4px;">
                    Кому: ${tName} ${reviewStars ? `(Оценка: ${reviewStars})` : ''}<br>
                    От: ${r.author || 'Студент'}
                </div>
                <div>${r.text}</div>
                <div class="admin-action-btns">
                    <button class="btn-approve" data-id="${r.id}">Одобрить</button>
                    <button class="btn-reject" data-id="${r.id}">Удалить</button>
                </div>
            `;
            list.appendChild(item);
        });
    }
}

const adminReviewsList = document.getElementById('admin-reviews-list');
if(adminReviewsList) {
    adminReviewsList.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('btn-approve')) {
            e.target.textContent = "...";
            await fetchGoogleSheet('updateStatus', { id: id, status: 'approved' });
            await renderAdminReviews(); 
            cachedReviewsData = null; // сбрасываем кэш
        } else if (e.target.classList.contains('btn-reject')) {
            e.target.textContent = "...";
            await fetchGoogleSheet('deleteReview', { id: id });
            await renderAdminReviews(); 
            cachedReviewsData = null; // сбрасываем кэш
        }
    });
}
