document.addEventListener('DOMContentLoaded', () => {
    // --- ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP ---
    const tg = window.Telegram.WebApp;
    if (tg) {
        tg.expand();
        if (tg.setHeaderColor) {
            tg.setHeaderColor('secondary_bg_color');
        }
    }

    // --- ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ---
    const selectionScreen = document.getElementById('selection-screen');
    const settingsScreen = document.getElementById('settings-screen');
    const scheduleScreen = document.getElementById('schedule-screen');

    const openSettingsBtn = document.getElementById('open-settings-btn');
    const scheduleSettingsBtn = document.getElementById('schedule-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const backBtn = document.getElementById('back-btn');

    const courseGrid = document.getElementById('course-grid');
    const groupBlock = document.getElementById('group-block');
    const groupGrid = document.getElementById('group-grid');
    const submitBtn = document.getElementById('submit-btn');

    const defaultCourseSelect = document.getElementById('default-course-select');
    const defaultGroupSelect = document.getElementById('default-group-select');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    const currentSelectionTitle = document.getElementById('current-selection-title');
    const daysTabs = document.getElementById('days-tabs');
    const scheduleContainer = document.getElementById('schedule-container');

    // Элементы кастомизации фона и цветов
    const bgFileInput = document.getElementById('bg-file-input');
    const removeBgBtn = document.getElementById('remove-bg-btn');
    const cardColorPicker = document.getElementById('card-color-picker');
    const textColorPicker = document.getElementById('text-color-picker');
    const resetColorsBtn = document.getElementById('reset-colors-btn');

    // --- ДАННЫЕ ГРУПП И КУРСОВ ---
    const groupsData = {
        "1": [
            { id: "1", name: "1 (ИСИТ)" }, { id: "2", name: "2 (ИСИТ)" },
            { id: "3", name: "3 (ИСИТ)" }, { id: "4", name: "4 (ЦД)" },
            { id: "5", name: "5 (ЦД)" }, { id: "6", name: "6 (ПИ)" },
            { id: "7", name: "7 (ПИ)" }, { id: "8", name: "8 (ПИ)" }
        ],
        "2": [
            { id: "1", name: "1 (ИСИТ)" }, { id: "2", name: "2 (ИСИТ)" },
            { id: "3", name: "3 (ИСИТ)" }, { id: "4", name: "4 (ЦД)" },
            { id: "5", name: "5 (ЦД)" }, { id: "6", name: "6 (ПИ)" },
            { id: "7", name: "7 (ПИ)" }, { id: "8", name: "8 (ПИ)" }
        ],
        "3": [
            { id: "1", name: "1 (ИСИТ)" }, { id: "2", name: "2 (ИСИТ)" },
            { id: "3", name: "3 (ИСИТ)" }, { id: "4", name: "4 (ЦД)" },
            { id: "5", name: "5 (ЦД)" }, { id: "6", name: "6 (ПИ)" },
            { id: "7", name: "7 (ПИ)" }, { id: "8", name: "8 (ПИ)" }
        ],
        "4": [
            { id: "1", name: "1 (ИСИТ)" }, { id: "2", name: "2 (ИСИТ)" },
            { id: "3", name: "3 (ИСИТ)" }, { id: "4", name: "4 (ЦД)" },
            { id: "5", name: "5 (ЦД)" }, { id: "6", name: "6 (ПИ)" },
            { id: "7", name: "7 (ПИ)" }, { id: "8", name: "8 (ПИ)" }
        ]
    };

    // Тестовое расписание
    const mockSchedule = {
        "1": {
            "1": [
                { time: "08:30 - 10:00", title: "Высшая математика", type: "Лекция", room: "ауд. 201-4" },
                { time: "10:15 - 11:45", title: "История белорусской государственности", type: "Практика", room: "ауд. 310-4" }
            ],
            "2": [
                { time: "08:30 - 10:00", title: "Физика", type: "Лекция", room: "ауд. 105-2" },
                { time: "10:15 - 11:45", title: "Иностранный язык", type: "Практика", room: "ауд. 415-3" }
            ]
        }
    };

    let selectedCourse = null;
    let selectedGroup = null;
    let selectedDay = "1";

    // --- ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ---
    function showScreen(screenId) {
        [selectionScreen, settingsScreen, scheduleScreen].forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    // --- ЛОГИКА ВЫБОРА КУРСА И ГРУППЫ ---
    courseGrid.addEventListener('click', (e) => {
        if (!e.target.classList.contains('choice-btn')) return;
        
        document.querySelectorAll('#course-grid .choice-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');

        selectedCourse = e.target.getAttribute('data-val');
        selectedGroup = null;
        submitBtn.disabled = true;

        renderGroups(selectedCourse);
        groupBlock.classList.remove('hidden');
    });

    function renderGroups(course) {
        groupGrid.innerHTML = '';
        const groups = groupsData[course] || [];
        
        groups.forEach(group => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.setAttribute('data-type', 'group');
            btn.setAttribute('data-val', group.id);
            btn.textContent = group.name;
            groupGrid.appendChild(btn);
        });
    }

    groupGrid.addEventListener('click', (e) => {
        if (!e.target.classList.contains('choice-btn')) return;

        document.querySelectorAll('#group-grid .choice-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');

        selectedGroup = e.target.getAttribute('data-val');
        submitBtn.disabled = false;
    });

    submitBtn.addEventListener('click', () => {
        if (selectedCourse && selectedGroup) {
            openSchedule(selectedCourse, selectedGroup);
        }
    });

    function openSchedule(course, group) {
        const groupObj = groupsData[course].find(g => g.id === group);
        currentSelectionTitle.textContent = `${course} курс, гр. ${groupObj ? groupObj.name : group}`;
        showScreen('schedule-screen');
        renderScheduleDays();
        renderScheduleContent(course, group, selectedDay);
    }

    // --- ДНИ НЕДЕЛИ И РАСПИСАНИЕ ---
    function renderScheduleDays() {
        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-day') === selectedDay);
        });
    }

    daysTabs.addEventListener('click', (e) => {
        if (!e.target.classList.contains('day-tab')) return;
        selectedDay = e.target.getAttribute('data-day');
        renderScheduleDays();
        renderScheduleContent(selectedCourse, selectedGroup, selectedDay);
    });

    function renderScheduleContent(course, group, day) {
        scheduleContainer.innerHTML = '';
        const daysData = mockSchedule[course] || {};
        const lessons = daysData[day] || [];

        if (lessons.length === 0) {
            scheduleContainer.innerHTML = '<div class="no-lessons">Пар нет или расписание не найдено 🎉</div>';
            return;
        }

        lessons.forEach(lesson => {
            const card = document.createElement('div');
            card.className = 'lesson-card';
            card.innerHTML = `
                <div class="lesson-time">${lesson.time}</div>
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-details">
                    <span class="lesson-type">${lesson.type}</span>
                    <span class="lesson-room">${lesson.room}</span>
                </div>
            `;
            scheduleContainer.appendChild(card);
        });
    }

    // --- НАСТРОЙКИ, ТЕМЫ И КАСТОМИЗАЦИЯ ---
    openSettingsBtn.addEventListener('click', () => showScreen('settings-screen'));
    scheduleSettingsBtn.addEventListener('click', () => showScreen('settings-screen'));
    
    closeSettingsBtn.addEventListener('click', () => {
        if (selectedCourse && selectedGroup) {
            showScreen('schedule-screen');
        } else {
            showScreen('selection-screen');
        }
    });

    backBtn.addEventListener('click', () => {
        showScreen('selection-screen');
    });

    // Переключение готовых тем (пресетов)
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-theme');
            applyTheme(theme);
            localStorage.setItem('app_theme', theme);
        });
    });

    function applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    // --- ЗАГРУЗКА КАСТОМНОЙ КАРТИНКИ НА ФОН ---
    bgFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Image = e.target.result;
                document.documentElement.style.setProperty('--bg-image', `url(${base64Image})`);
                localStorage.setItem('app_custom_bg', base64Image);
            };
            reader.readAsDataURL(file);
        }
    });

    removeBgBtn.addEventListener('click', () => {
        document.documentElement.style.setProperty('--bg-image', 'none');
        localStorage.removeItem('app_custom_bg');
        bgFileInput.value = '';
    });

    // --- КАСТОМНАЯ ПАЛИТРА ЦВЕТОВ ---
    cardColorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const rgba = `rgba(${r}, ${g}, ${b}, 0.85)`;

        document.documentElement.style.setProperty('--card-bg', rgba);
        localStorage.setItem('app_card_color', rgba);
    });

    textColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--text-color', color);
        localStorage.setItem('app_text_color', color);
    });

    resetColorsBtn.addEventListener('click', () => {
        localStorage.removeItem('app_card_color');
        localStorage.removeItem('app_text_color');
        document.documentElement.style.removeProperty('--card-bg');
        document.documentElement.style.removeProperty('--text-color');
        cardColorPicker.value = '#ffffff';
        textColorPicker.value = '#333333';
    });

    // --- СОХРАНЕНИЕ ГРУППЫ ПО УМОЛЧАНИЮ ---
    saveSettingsBtn.addEventListener('click', () => {
        const dCourse = defaultCourseSelect.value;
        const dGroup = defaultGroupSelect.value;
        if (dCourse && dGroup) {
            localStorage.setItem('default_course', dCourse);
            localStorage.setItem('default_group', dGroup);
            alert('Настройки сохранены!');
        } else {
            alert('Выберите курс и группу для быстрого запуска.');
        }
    });

    resetSettingsBtn.addEventListener('click', () => {
        localStorage.removeItem('default_course');
        localStorage.removeItem('default_group');
        defaultCourseSelect.value = '';
        defaultGroupSelect.value = '';
        alert('Быстрый запуск сброшен.');
    });

    // --- ЗАГРУЗКА СОХРАНЕННЫХ НАСТРОЕК ПРИ СТАРТЕ ---
    function loadSavedSettings() {
        // Темы
        const savedTheme = localStorage.getItem('app_theme') || 'dark';
        applyTheme(savedTheme);

        // Кастомная картинка фона
        const savedCustomBg = localStorage.getItem('app_custom_bg');
        if (savedCustomBg) {
            document.documentElement.style.setProperty('--bg-image', `url(${savedCustomBg})`);
        }

        // Цвета карточек и текста
        const savedCardColor = localStorage.getItem('app_card_color');
        if (savedCardColor) {
            document.documentElement.style.setProperty('--card-bg', savedCardColor);
        }

        const savedTextColor = localStorage.getItem('app_text_color');
        if (savedTextColor) {
            document.documentElement.style.setProperty('--text-color', savedTextColor);
            textColorPicker.value = savedTextColor;
        }

        // Автозапуск группы
        const defCourse = localStorage.getItem('default_course');
        const defGroup = localStorage.getItem('default_group');
        if (defCourse && defGroup) {
            defaultCourseSelect.value = defCourse;
            defaultGroupSelect.value = defGroup;
            selectedCourse = defCourse;
            selectedGroup = defGroup;
            openSchedule(defCourse, defGroup);
        }
    }

    loadSavedSettings();
});
