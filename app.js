const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

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

const teachersData = [
    { name: "доц. Гринюк Д.А.", photo: "", subject: "Арифметико-логические основы ВС", strictness: "Высокая", info: "Требовательный к защите лабораторных, любит точные формулировки." },
    { name: "доц. Ловенецкая Е.И.", photo: "", subject: "Математический анализ / Линейная алгебра", strictness: "Средняя", info: "Объясняет понятно, но на практиках спрашивает строгую теорию." },
    { name: "доц. Белодед Н.И.", photo: "", subject: "Основы алгоритмизации и программирования", strictness: "Высокая", info: "Главный по кодингу. Кодстайл превыше всего!" },
    { name: "ст. преп. Наркевич А.С.", photo: "", subject: "Основы программной инженерии", strictness: "Лояльная", info: "Практикующий специалист, ценит архитектуру." },
    { name: "доц. Жиляк Н.А.", photo: "", subject: "Компьютерные языки разметки", strictness: "Средняя", info: "Следит за версткой и чистотой разметки." }
];

let previousScreen = 'main-menu-screen';

function getTodayDayCode() {
    const jsDay = new Date().getDay();
    if (jsDay === 0 || jsDay > 6) return "1";
    return jsDay.toString();
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

// --- УПРАВЛЕНИЕ ТЕМАМИ И ФОНОМ ---
function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    
    if (localStorage.getItem('app_custom_bg')) {
        document.body.classList.add('has-custom-bg');
    }

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

const bgFileInput = document.getElementById('bg-file-input');
const removeBgBtn = document.getElementById('remove-bg-btn');

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

removeBgBtn.addEventListener('click', () => {
    document.documentElement.style.removeProperty('--bg-image');
    localStorage.removeItem('app_custom_bg');
    bgFileInput.value = '';
    document.body.classList.remove('has-custom-bg');
});

// --- УПРАВЛЕНИЕ ЭКРАНАМИ И МЕНЮ ---
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

// --- ВЫБОР КУРСА И ГРУППЫ ---
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

submitBtn.addEventListener('click', () => {
    if (state.targetFlow === 'session-screen') {
        showSessionScreen();
    } else if (state.targetFlow === 'labs-screen') {
        showScreen('labs-screen');
    } else {
        showScheduleScreen();
    }
});

// --- РАСПИСАНИЕ ---
function showScheduleScreen() {
    showScreen('schedule-screen');
    document.getElementById('current-selection-title').textContent = `${state.course} курс, гр. ${state.group}`;
    state.day = getTodayDayCode();
    updateActiveTab();
    renderSchedule();
}

const daysTabs = document.getElementById('days-tabs');
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
    const scheduleContainer = document.getElementById('schedule-container');
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
                <p>👨‍🏫 ${item.teacher || '-'}</p>
                <p>🚪 ${item.room}</p>
            </div>
        `;
        scheduleContainer.appendChild(card);
    });
}

// --- СЕССИЯ И ОЦЕНКИ ---
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
                <p>👨‍🏫 ${exam.teacher}</p>
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
    document.getElementById('gpa-score').textContent = gpa;
}

// --- НАСТРОЙКИ ---
const openSettingsBtn = document.getElementById('open-settings-btn');
const scheduleSettingsBtn = document.getElementById('schedule-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

openSettingsBtn.addEventListener('click', () => {
    showScreen('settings-screen');
    document.getElementById('default-course-select').value = localStorage.getItem('default_course') || '';
    document.getElementById('default-group-select').value = localStorage.getItem('default_group') || '';
});

if (scheduleSettingsBtn) {
    scheduleSettingsBtn.addEventListener('click', () => {
        showScreen('settings-screen');
        document.getElementById('default-course-select').value = localStorage.getItem('default_course') || '';
        document.getElementById('default-group-select').value = localStorage.getItem('default_group') || '';
    });
}

closeSettingsBtn.addEventListener('click', () => showScreen(previousScreen));

const saveSettingsBtn = document.getElementById('save-settings-btn');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const defaultCourseSelect = document.getElementById('default-course-select');
const defaultGroupSelect = document.getElementById('default-group-select');

saveSettingsBtn.addEventListener('click', () => {
    const c = defaultCourseSelect.value;
    const g = defaultGroupSelect.value;
    if (c && g) {
        localStorage.setItem('default_course', c);
        localStorage.setItem('default_group', g);
        alert('Настройки сохранены! При следующем входе группа загрузится автоматически.');
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


// --- ЛОГИКА ОТЗЫВОВ И АДМИНКИ ---
const ADMIN_TG_ID = 5555823645;
let currentTeacherId = null;

function getReviews() {
    return JSON.parse(localStorage.getItem('app_reviews') || '[]');
}

function saveReviews(reviews) {
    localStorage.setItem('app_reviews', JSON.stringify(reviews));
}

function renderTeachers() {
    const container = document.getElementById('teachers-container');
    container.innerHTML = '';
    
    const currentUserId = tg.initDataUnsafe?.user?.id;
    const adminBtn = document.getElementById('admin-panel-btn');
    if (currentUserId === ADMIN_TG_ID || localStorage.getItem('force_admin') === 'true') {
        adminBtn.classList.remove('hidden');
    }

    teachersData.forEach((t, index) => {
        const card = document.createElement('div');
        card.className = 'schedule-card teacher-card-clickable';
        card.dataset.id = index; 
        
        const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888888'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
        const photoSrc = t.photo ? t.photo : defaultAvatar;

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                <img src="${photoSrc}" alt="Фото" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; background-color: rgba(255,255,255,0.05); border: 1px solid var(--border-color);">
                <div class="subject-title" style="margin-bottom: 0;">${t.name}</div>
            </div>
            <div class="details">
                <p>📚 <b>Предмет:</b> ${t.subject}</p>
                <p>⚡ <b>Строгость:</b> ${t.strictness}</p>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: var(--accent-color); text-align: right;">Нажмите, чтобы посмотреть отзывы ➔</div>
        `;
        
        card.addEventListener('click', () => openTeacherModal(index));
        container.appendChild(card);
    });
}

const teacherModal = document.getElementById('teacher-modal');
function openTeacherModal(index) {
    currentTeacherId = index;
    const t = teachersData[index];
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888888'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
    const photoSrc = t.photo ? t.photo : defaultAvatar;

    document.getElementById('teacher-modal-header').innerHTML = `
        <img src="${photoSrc}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        <h2 style="font-size: 18px;">${t.name}</h2>
    `;
    document.getElementById('teacher-modal-info').innerHTML = `
        <p>💬 ${t.info}</p>
    `;

    renderTeacherReviews(index);
    teacherModal.classList.remove('hidden');
}

function renderTeacherReviews(teacherId) {
    const list = document.getElementById('teacher-reviews-list');
    const allReviews = getReviews();
    const approvedReviews = allReviews.filter(r => r.teacherId === teacherId && r.status === 'approved');

    // Проверяем, админ ли сейчас зашел, или сам автор отзыва
    const currentUserId = tg.initDataUnsafe?.user?.id;
    const isAdmin = (currentUserId === ADMIN_TG_ID || localStorage.getItem('force_admin') === 'true');

    list.innerHTML = '';
    if (approvedReviews.length === 0) {
        list.innerHTML = '<p style="color: var(--hint-color); font-size: 13px; text-align: center;">Пока нет отзывов.</p>';
    } else {
        approvedReviews.forEach(r => {
            // Разрешаем удалить отзыв, если это админ ИЛИ если пользователь — автор этого отзыва
            const canDelete = isAdmin || (currentUserId && r.authorId === currentUserId);
            const deleteBtnHtml = canDelete ? `<button class="delete-review-btn" data-id="${r.id}" style="float: right; background: none; border: none; font-size: 14px; cursor: pointer;">🗑️</button>` : '';

            list.innerHTML += `
                <div class="review-item" style="padding-top: 8px;">
                    <div style="font-size: 12px; color: var(--accent-color); margin-bottom: 6px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                        👤 ${r.author || 'Студент'}
                        ${deleteBtnHtml}
                    </div>
                    <div style="font-size: 13px;">${r.text}</div>
                </div>`;
        });
    }
}

// Обработка клика по иконке корзины для УДАЛЕНИЯ уже опубликованного отзыва
document.getElementById('teacher-reviews-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-review-btn');
    if (btn) {
        const id = parseInt(btn.dataset.id);
        if (confirm("Вы уверены, что хотите безвозвратно удалить этот отзыв?")) {
            let reviews = getReviews();
            reviews = reviews.filter(r => r.id !== id);
            saveReviews(reviews);
            renderTeacherReviews(currentTeacherId); // Обновляем список сразу после удаления
        }
    }
});

// Отправка отзыва
document.getElementById('submit-review-btn').addEventListener('click', () => {
    const textInput = document.getElementById('review-text');
    const text = textInput.value.trim();
    
    if (text.length < 5) {
        tg.showAlert("Отзыв слишком короткий!");
        return;
    }

    // Достаем имя пользователя из Telegram
    const user = tg.initDataUnsafe?.user;
    let authorName = "Анонимный Студент";
    let authorId = null;

    if (user) {
        // Если есть юзернейм (@ник), берем его. Если нет — берем просто Имя пользователя.
        authorName = user.username ? `@${user.username}` : user.first_name;
        authorId = user.id;
    }

    const newReview = {
        id: Date.now(),
        teacherId: currentTeacherId,
        text: text,
        author: authorName,   // Сохраняем имя
        authorId: authorId,   // Сохраняем ID, чтобы юзер мог потом удалить свой отзыв
        status: 'pending' 
    };

    const reviews = getReviews();
    reviews.push(newReview);
    saveReviews(reviews);

    textInput.value = '';
    tg.showAlert("Отзыв отправлен на модерацию!");
});

document.querySelector('.close-modal-btn').addEventListener('click', () => {
    teacherModal.classList.add('hidden');
});

const adminModal = document.getElementById('admin-modal');
const adminPanelBtn = document.getElementById('admin-panel-btn');

if(adminPanelBtn) {
    adminPanelBtn.addEventListener('click', () => {
        renderAdminReviews();
        adminModal.classList.remove('hidden');
    });
}

document.querySelector('.close-admin-btn').addEventListener('click', () => {
    adminModal.classList.add('hidden');
});

function renderAdminReviews() {
    const list = document.getElementById('admin-reviews-list');
    const allReviews = getReviews();
    const pendingReviews = allReviews.filter(r => r.status === 'pending');

    list.innerHTML = '';
    if (pendingReviews.length === 0) {
        list.innerHTML = '<p style="color: var(--hint-color); font-size: 13px; text-align: center;">Все чисто! Новых отзывов нет.</p>';
    } else {
        pendingReviews.forEach(r => {
            const tName = teachersData[r.teacherId].name;
            const item = document.createElement('div');
            item.className = 'review-item';
            // В админке теперь тоже видно, кто написал отзыв
            item.innerHTML = `
                <div style="color: var(--accent-color); font-size: 12px; margin-bottom: 4px;">
                    Кому: ${tName}<br>
                    От: 👤 ${r.author || 'Студент'}
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

document.getElementById('admin-reviews-list').addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    if (!id) return;

    const reviews = getReviews();
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex !== -1) {
        if (e.target.classList.contains('btn-approve')) {
            reviews[reviewIndex].status = 'approved';
        } else if (e.target.classList.contains('btn-reject')) {
            reviews.splice(reviewIndex, 1);
        }
        saveReviews(reviews);
        renderAdminReviews(); 
    }
});
