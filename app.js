const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let state = {
    course: null,
    group: null,
    day: "1" // По умолчанию понедельник
};

let scheduleData = {};

const groupsConfig = [
    { id: 1, spec: 'ИСИТ' }, { id: 2, spec: 'ИСИТ' }, { id: 3, spec: 'ИСИТ' },
    { id: 4, spec: 'ЦД' },   { id: 5, spec: 'ЦД' },
    { id: 6, spec: 'ПИ' },   { id: 7, spec: 'ПИ' },   { id: 8, spec: 'ПИ' }
];

// --- 1. АВТООПРЕДЕЛЕНИЕ ДНЯ НЕДЕЛИ ---
function getTodayDayCode() {
    const jsDay = new Date().getDay(); // 0 - ВС, 1 - ПН, ..., 6 - СБ
    // Если сегодня воскресенье (0) или выходной вне сетки, ставим понедельник ("1")
    if (jsDay === 0 || jsDay > 6) {
        return "1";
    }
    return jsDay.toString();
}

// --- 2. ЗАГРУЗКА ДАННЫХ И НАСТРОЕК ---
async function initApp() {
    try {
        const response = await fetch('data.json');
        scheduleData = await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке расписания:', error);
    }

    // Применяем сохраненную тему
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    setTheme(savedTheme);

    // Проверяем сохраненный автозапуск (группу по умолчанию)
    const defaultCourse = localStorage.getItem('default_course');
    const defaultGroup = localStorage.getItem('default_group');

    if (defaultCourse && defaultGroup) {
        state.course = defaultCourse;
        state.group = defaultGroup;
        showScheduleScreen();
    }
}

initApp();

// --- 3. УПРАВЛЕНИЕ ТЕМАМИ ---
function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active-theme', btn.dataset.theme === themeName);
    });
    localStorage.setItem('app_theme', themeName);
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('theme-btn')) {
        setTheme(e.target.dataset.theme);
    }
});

// --- 4. DOM ЭЛЕМЕНТЫ ---
const groupBlock = document.getElementById('group-block');
const groupGrid = document.getElementById('group-grid');
const submitBtn = document.getElementById('submit-btn');
const selectionScreen = document.getElementById('selection-screen');
const scheduleScreen = document.getElementById('schedule-screen');
const settingsScreen = document.getElementById('settings-screen');
const currentSelectionTitle = document.getElementById('current-selection-title');
const scheduleContainer = document.getElementById('schedule-container');
const backBtn = document.getElementById('back-btn');
const daysTabs = document.getElementById('days-tabs');

const openSettingsBtn = document.getElementById('open-settings-btn');
const scheduleSettingsBtn = document.getElementById('schedule-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const defaultCourseSelect = document.getElementById('default-course-select');
const defaultGroupSelect = document.getElementById('default-group-select');

// --- 5. НАВИГАЦИЯ И ЭКРАНЫ ---
openSettingsBtn.addEventListener('click', openSettings);
scheduleSettingsBtn.addEventListener('click', openSettings);

function openSettings() {
    selectionScreen.classList.add('hidden');
    scheduleScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');

    defaultCourseSelect.value = localStorage.getItem('default_course') || '';
    defaultGroupSelect.value = localStorage.getItem('default_group') || '';
}

closeSettingsBtn.addEventListener('click', () => {
    settingsScreen.classList.add('hidden');
    if (state.course && state.group) {
        scheduleScreen.classList.remove('hidden');
    } else {
        selectionScreen.classList.remove('hidden');
    }
});

saveSettingsBtn.addEventListener('click', () => {
    const c = defaultCourseSelect.value;
    const g = defaultGroupSelect.value;
    if (c && g) {
        localStorage.setItem('default_course', c);
        localStorage.setItem('default_group', g);
        alert('Настройки сохранены! При следующем открытии сразу откроется расписание.');
    } else {
        alert('Выберите курс и группу.');
    }
});

resetSettingsBtn.addEventListener('click', () => {
    localStorage.removeItem('default_course');
    localStorage.removeItem('default_group');
    defaultCourseSelect.value = '';
    defaultGroupSelect.value = '';
    alert('Автозапуск сброшен.');
});

// --- 6. ЛОГИКА ВЫБОРА (ЭКРАН 1) ---
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

// --- 7. ЛОГИКА РАСПИСАНИЯ (ЭКРАН 2) ---
submitBtn.addEventListener('click', () => {
    showScheduleScreen();
});

function showScheduleScreen() {
    selectionScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    scheduleScreen.classList.remove('hidden');
    currentSelectionTitle.textContent = `${state.course} курс, ${state.group} группа`;
    
    // Автоматически выставляем текущий день недели
    state.day = getTodayDayCode();
    updateActiveTab();
    renderSchedule();
}

backBtn.addEventListener('click', () => {
    scheduleScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
});

daysTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('day-tab')) {
        state.day = e.target.dataset.day;
        updateActiveTab();
        renderSchedule();
    }
});

function updateActiveTab() {
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.day === state.day);
    });
}

function renderSchedule() {
    scheduleContainer.innerHTML = ''; 
    
    const courseData = scheduleData[state.course] || {};
    const groupData = courseData[state.group] || {};
    const dayData = groupData[state.day] || [];

    if (dayData.length === 0) {
        scheduleContainer.innerHTML = '<p style="text-align:center; color: var(--hint-color); margin-top: 20px;">Нет пар на этот день 🎉</p>';
        return;
    }

    dayData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        card.innerHTML = `
            <div class="subject-title">${item.subject} <span class="subject-type">${item.type}</span></div>
            <div class="details">
                <p>🕒 ${item.time}</p>
                <p>👨‍🏫 ${item.teacher}</p>
                <p>🚪 ${item.room}</p>
            </div>
        `;
        scheduleContainer.appendChild(card);
    });
}