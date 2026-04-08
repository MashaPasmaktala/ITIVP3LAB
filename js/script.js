
function save(key, value) {
    LocalStorageService.save(key, value);
}

function load(key, defaultValue) {
    return LocalStorageService.load(key, defaultValue);
}

function isEmail(value) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

let notifyBox = null;
function initNotifications() {
    notifyBox = document.createElement('div');
    notifyBox.className = 'notifications-container';
    document.body.appendChild(notifyBox);
}

function showNotification(text, type) {
    let kind = type || 'info';
    let icon = 'fa-info-circle';
    if (kind === 'success') icon = 'fa-check-circle';
    if (kind === 'error') icon = 'fa-times-circle';

    let item = document.createElement('div');
    item.className = 'notification notification--' + kind;
    item.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + text + '</span>';
    notifyBox.appendChild(item);

    setTimeout(function() {
        item.classList.add('notification--show');
    }, 10);

    setTimeout(function() {
        item.classList.remove('notification--show');
        setTimeout(function() {
            if (item.parentNode) item.parentNode.removeChild(item);
        }, 300);
    }, 3000);
}


let progressCourses = [];
let defaultCourses = [
    { id: 1, name: 'Google Ads Training 2021', totalLessons: 30, completedLessons: 22, category: 'ADS' },
    { id: 2, name: 'SEO & Affiliate Marketing Mastery', totalLessons: 25, completedLessons: 15, category: 'SEO' },
    { id: 3, name: 'Python For Beginners', totalLessons: 45, completedLessons: 18, category: 'Python' },
    { id: 4, name: 'Beginner Illustrator Suite', totalLessons: 18, completedLessons: 16, category: 'Design' }
];

function renderProgress() {
    let grid = document.querySelector('.courses--progress .courses__grid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 0; i < progressCourses.length; i++) {
        let c = progressCourses[i];
        let percent = Math.round((c.completedLessons / c.totalLessons) * 100);
        let badge = 'progress-card__badge--' + c.category.toLowerCase();

        let card = document.createElement('article');
        card.className = 'progress-card';
        card.innerHTML =
            '<figure class="progress-card__image-wrapper">' +
                '<img src="assets/images/courses/your-course-' + c.id + '.png" alt="' + c.name + '" class="progress-card__image">' +
            '</figure>' +
            '<div class="progress-card__content">' +
                '<div class="progress-card__header">' +
                    '<span class="progress-card__badge ' + badge + '">' + c.category + '</span>' +
                    '<h3 class="progress-card__title">' + c.name + '</h3>' +
                '</div>' +
                '<div class="progress-card__meta"><span class="progress-card__students">' + c.totalLessons + ' lessons</span></div>' +
                '<div class="progress-card__progress">' +
                    '<div class="progress-bar"><div class="progress-bar__fill" style="width:' + percent + '%" role="progressbar" aria-valuenow="' + percent + '"></div></div>' +
                    '<span class="progress-card__percentage">' + percent + '%</span>' +
                '</div>' +
                '<div class="progress-card__controls">' +
                    '<button class="progress-btn progress-btn--minus" data-course="' + c.id + '" data-delta="-1"><i class="fa-solid fa-minus"></i></button>' +
                    '<span class="progress-card__lessons">' + c.completedLessons + ' / ' + c.totalLessons + '</span>' +
                    '<button class="progress-btn progress-btn--plus" data-course="' + c.id + '" data-delta="1"><i class="fa-solid fa-plus"></i></button>' +
                '</div>' +
            '</div>';
        grid.appendChild(card);
    }
}

function initProgress() {
    progressCourses = load('courseProgress', defaultCourses);
    renderProgress();

    let grid = document.querySelector('.courses--progress .courses__grid');
    if (!grid) return;

    grid.addEventListener('click', function(event) {
        let btn = event.target.closest('.progress-btn');
        if (!btn) return;

        let id = Number(btn.getAttribute('data-course'));
        let delta = Number(btn.getAttribute('data-delta'));

        for (let i = 0; i < progressCourses.length; i++) {
            if (progressCourses[i].id === id) {
                let nextValue = progressCourses[i].completedLessons + delta;
                if (nextValue >= 0 && nextValue <= progressCourses[i].totalLessons) {
                    progressCourses[i].completedLessons = nextValue;
                    save('courseProgress', progressCourses);
                    renderProgress();

                    if (!navigator.onLine) {
                        LocalStorageService.addToPendingSync({
                            type: 'progress_update',
                            courseId: id,
                            completedLessons: nextValue
                        });
                    }
                }
                break;
            }
        }
    });
}


let lessons = [
    { id: 1, title: 'Введение в UI/UX дизайн', course: 'Learn Figma', duration: '15 мин' },
    { id: 2, title: 'Основы интерфейса Figma', course: 'Learn Figma', duration: '25 мин' },
    { id: 3, title: 'Работа с компонентами', course: 'Learn Figma', duration: '30 мин' },
    { id: 4, title: 'Переменные и типы данных', course: 'Python For Beginners', duration: '20 мин' },
    { id: 5, title: 'Условные операторы', course: 'Python For Beginners', duration: '25 мин' },
    { id: 6, title: 'Циклы в Python', course: 'Python For Beginners', duration: '30 мин' },
    { id: 7, title: 'Настройка рекламной кампании', course: 'Google Ads Training', duration: '35 мин' },
    { id: 8, title: 'Анализ ключевых слов', course: 'Google Ads Training', duration: '40 мин' }
];
let bookmarks = [];

function ensureBookmarksSection() {
    if (document.getElementById('bookmarks-section')) return;
    let main = document.querySelector('.main');
    let beforeSection = document.querySelector('.newsletter');
    if (!main || !beforeSection) return;

    let section = document.createElement('section');
    section.id = 'bookmarks-section';
    section.className = 'bookmarks-section';
    section.innerHTML =
        '<div class="bookmarks__container">' +
            '<header class="bookmarks__header">' +
                '<h2 class="section-title">Закладки уроков</h2>' +
                '<span class="bookmarks__count">Сохранено: <span id="bookmarks-count">0</span></span>' +
            '</header>' +
            '<div class="bookmarks__content">' +
                '<div class="bookmarks__lessons"><h3 class="bookmarks__subtitle">Доступные уроки</h3><div id="lessons-list" class="lessons-list"></div></div>' +
                '<div class="bookmarks__saved"><h3 class="bookmarks__subtitle">Мои закладки</h3><div id="bookmarks-list" class="bookmarks-list"></div></div>' +
            '</div>' +
        '</div>';
    main.insertBefore(section, beforeSection);
}

function hasBookmark(id) {
    return bookmarks.indexOf(id) !== -1;
}

function renderBookmarks() {
    let lessonsList = document.getElementById('lessons-list');
    let savedList = document.getElementById('bookmarks-list');
    let count = document.getElementById('bookmarks-count');
    if (!lessonsList || !savedList || !count) return;

    lessonsList.innerHTML = '';
    savedList.innerHTML = '';
    count.textContent = bookmarks.length;

    for (let i = 0; i < lessons.length; i++) {
        let l = lessons[i];
        let active = hasBookmark(l.id);
        let icon = active ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        let activeClass = active ? 'bookmark-btn--active' : '';

        let row = document.createElement('div');
        row.className = 'lesson-item';
        row.innerHTML =
            '<div class="lesson-item__info">' +
                '<h4 class="lesson-item__title">' + l.title + '</h4>' +
                '<p class="lesson-item__meta"><span>' + l.course + '</span><span><i class="fa-solid fa-clock"></i> ' + l.duration + '</span></p>' +
            '</div>' +
            '<button class="bookmark-btn ' + activeClass + '" data-bookmark="' + l.id + '"><i class="' + icon + '"></i></button>';
        lessonsList.appendChild(row);
    }

    if (bookmarks.length === 0) {
        savedList.innerHTML = '<p class="bookmarks__empty">Нет сохранённых закладок</p>';
        return;
    }

    for (let j = 0; j < bookmarks.length; j++) {
        let id = bookmarks[j];
        for (let k = 0; k < lessons.length; k++) {
            if (lessons[k].id === id) {
                let item = document.createElement('div');
                item.className = 'bookmark-item';
                item.innerHTML =
                    '<div class="bookmark-item__info"><h4 class="bookmark-item__title">' + lessons[k].title + '</h4><p class="bookmark-item__course">' + lessons[k].course + '</p></div>' +
                    '<button class="bookmark-remove-btn" data-remove-bookmark="' + lessons[k].id + '"><i class="fa-solid fa-times"></i></button>';
                savedList.appendChild(item);
                break;
            }
        }
    }
}

function initBookmarks() {
    bookmarks = load('lessonBookmarks', []);
    ensureBookmarksSection();
    renderBookmarks();
}


// ==================== API QUIZ ====================

let apiQuizQuestions = [];
let apiQuizStep = 0;
let apiQuizAnswers = [];
let apiQuizLoading = false;

function ensureApiQuizSection() {
    if (document.getElementById('api-quiz-section')) return;
    let main = document.querySelector('.main');
    let beforeSection = document.querySelector('.courses--top');
    if (!main || !beforeSection) return;

    let categoryOptions = '';
    for (let catId in API_CONFIG.TRIVIA_CATEGORIES) {
        categoryOptions += '<option value="' + catId + '">' + API_CONFIG.TRIVIA_CATEGORIES[catId] + '</option>';
    }

    let section = document.createElement('section');
    section.id = 'api-quiz-section';
    section.className = 'api-quiz-section';
    section.innerHTML =
        '<div class="api-quiz__container">' +
            '<header class="api-quiz__header">' +
                '<h2 class="section-title"><i class="fa-solid fa-globe"></i> Онлайн-тест (API)</h2>' +
                '<span class="api-quiz__status" id="api-quiz-network">' +
                    '<i class="fa-solid fa-wifi"></i> <span id="network-text">Online</span>' +
                '</span>' +
            '</header>' +

            '<div class="api-quiz__settings" id="api-quiz-settings">' +
                '<div class="api-quiz__field">' +
                    '<label for="quiz-category">Категория:</label>' +
                    '<select id="quiz-category" class="api-quiz__select">' + categoryOptions + '</select>' +
                '</div>' +
                '<div class="api-quiz__field">' +
                    '<label for="quiz-difficulty">Сложность:</label>' +
                    '<select id="quiz-difficulty" class="api-quiz__select">' +
                        '<option value="easy">Easy</option>' +
                        '<option value="medium" selected>Medium</option>' +
                        '<option value="hard">Hard</option>' +
                    '</select>' +
                '</div>' +
                '<button class="api-quiz__start-btn" id="api-quiz-start">' +
                    '<i class="fa-solid fa-play"></i> Начать тест' +
                '</button>' +
            '</div>' +

            '<div id="api-quiz-body" class="api-quiz__body" style="display:none;"></div>' +
        '</div>';
    main.insertBefore(section, beforeSection);
}

function renderApiQuiz() {
    let body = document.getElementById('api-quiz-body');
    let settings = document.getElementById('api-quiz-settings');
    if (!body) return;

    if (apiQuizQuestions.length === 0) {
        body.style.display = 'none';
        if (settings) settings.style.display = '';
        return;
    }

    body.style.display = '';
    if (settings) settings.style.display = 'none';

    if (apiQuizStep >= apiQuizQuestions.length) {
        let correct = 0;
        for (let i = 0; i < apiQuizQuestions.length; i++) {
            if (apiQuizAnswers[i] !== undefined && apiQuizQuestions[i].answers[apiQuizAnswers[i]].correct) {
                correct++;
            }
        }
        let percent = Math.round((correct / apiQuizQuestions.length) * 100);

        let result = {
            date: new Date().toISOString(),
            category: apiQuizQuestions[0].category,
            difficulty: apiQuizQuestions[0].difficulty,
            correct: correct,
            total: apiQuizQuestions.length,
            percent: percent
        };

        let history = LocalStorageService.load('quizHistory', []);
        history.push(result);
        LocalStorageService.save('quizHistory', history);
        SessionStorageService.save('lastQuizResult', result);

        if (!navigator.onLine) {
            LocalStorageService.addToPendingSync({
                type: 'quiz_result',
                result: result
            });
        }

        renderDashboard();

        body.innerHTML =
            '<div class="api-quiz__result">' +
                '<div class="api-quiz__score">' +
                    '<span class="api-quiz__score-value">' + percent + '%</span>' +
                    '<p>' + correct + ' из ' + apiQuizQuestions.length + ' правильных</p>' +
                '</div>' +
                '<button class="api-quiz__btn" id="api-quiz-again"><i class="fa-solid fa-redo"></i> Пройти ещё раз</button>' +
            '</div>';
        return;
    }

    let q = apiQuizQuestions[apiQuizStep];
    let answersHtml = '';
    for (let j = 0; j < q.answers.length; j++) {
        let selected = apiQuizAnswers[apiQuizStep] === j ? 'api-quiz__option--selected' : '';
        answersHtml +=
            '<label class="api-quiz__option ' + selected + '" data-api-answer="' + j + '">' +
                '<input type="radio" name="api-quiz-answer" value="' + j + '"' + (apiQuizAnswers[apiQuizStep] === j ? ' checked' : '') + '>' +
                '<span>' + q.answers[j].text + '</span>' +
            '</label>';
    }

    body.innerHTML =
        '<div class="api-quiz__progress-bar"><div class="api-quiz__progress-fill" style="width:' + ((apiQuizStep + 1) / apiQuizQuestions.length * 100) + '%"></div></div>' +
        '<p class="api-quiz__info">Вопрос ' + (apiQuizStep + 1) + ' / ' + apiQuizQuestions.length + ' &bull; ' + q.category + ' &bull; ' + q.difficulty + '</p>' +
        '<h3 class="api-quiz__question">' + q.question + '</h3>' +
        '<div class="api-quiz__options">' + answersHtml + '</div>' +
        '<div class="api-quiz__nav">' +
            '<button class="api-quiz__btn" id="api-quiz-prev"' + (apiQuizStep === 0 ? ' disabled' : '') + '>Назад</button>' +
            '<button class="api-quiz__btn api-quiz__btn--primary" id="api-quiz-next">' + (apiQuizStep === apiQuizQuestions.length - 1 ? 'Завершить' : 'Далее') + '</button>' +
        '</div>';
}

async function startApiQuiz() {
    if (apiQuizLoading) return;
    apiQuizLoading = true;

    let body = document.getElementById('api-quiz-body');
    let settings = document.getElementById('api-quiz-settings');
    let category = document.getElementById('quiz-category').value;
    let difficulty = document.getElementById('quiz-difficulty').value;

    if (settings) settings.style.display = 'none';
    body.style.display = '';
    body.innerHTML = '<p class="api-quiz__loading"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка вопросов...</p>';

    try {
        apiQuizQuestions = await ApiService.fetchQuizQuestions(5, category, difficulty);
        apiQuizStep = 0;
        apiQuizAnswers = [];

        SessionStorageService.save('currentQuiz', {
            category: category,
            difficulty: difficulty,
            startedAt: new Date().toISOString()
        });

        renderApiQuiz();
    } catch (error) {
        body.innerHTML = '<p class="api-quiz__error"><i class="fa-solid fa-exclamation-triangle"></i> ' + error.message + '</p>';
        if (settings) settings.style.display = '';
        showNotification(error.message, 'error');
    }

    apiQuizLoading = false;
}

function initApiQuiz() {
    ensureApiQuizSection();

    document.addEventListener('click', function(event) {
        if (event.target.closest('#api-quiz-start')) {
            startApiQuiz();
            return;
        }
        if (event.target.closest('#api-quiz-again')) {
            apiQuizQuestions = [];
            apiQuizStep = 0;
            apiQuizAnswers = [];
            renderApiQuiz();
            return;
        }
        if (event.target.closest('#api-quiz-prev')) {
            if (apiQuizStep > 0) { apiQuizStep--; renderApiQuiz(); }
            return;
        }
        if (event.target.closest('#api-quiz-next')) {
            if (apiQuizStep < apiQuizQuestions.length - 1) { apiQuizStep++; }
            else { apiQuizStep = apiQuizQuestions.length; }
            renderApiQuiz();
            return;
        }
        let opt = event.target.closest('[data-api-answer]');
        if (opt) {
            apiQuizAnswers[apiQuizStep] = Number(opt.getAttribute('data-api-answer'));
            renderApiQuiz();
        }
    });
}


// ==================== WIKIPEDIA SEARCH ====================

function ensureWikiSection() {
    if (document.getElementById('wiki-section')) return;
    let main = document.querySelector('.main');
    let beforeSection = document.querySelector('.courses--new');
    if (!main || !beforeSection) return;

    let section = document.createElement('section');
    section.id = 'wiki-section';
    section.className = 'wiki-section';
    section.innerHTML =
        '<div class="wiki__container">' +
            '<header class="wiki__header">' +
                '<h2 class="section-title"><i class="fa-solid fa-search"></i> Поиск статей (Wikipedia API)</h2>' +
            '</header>' +
            '<form class="wiki__form" id="wiki-form">' +
                '<input type="text" class="wiki__input" id="wiki-input" placeholder="Введите тему для поиска...">' +
                '<button type="submit" class="wiki__btn"><i class="fa-solid fa-magnifying-glass"></i> Найти</button>' +
            '</form>' +
            '<div id="wiki-results" class="wiki__results"></div>' +
        '</div>';
    main.insertBefore(section, beforeSection);
}

function renderWikiResults(results) {
    let container = document.getElementById('wiki-results');
    if (!container) return;

    if (!results || results.length === 0) {
        container.innerHTML = '<p class="wiki__empty">Ничего не найдено</p>';
        return;
    }

    let html = '';
    for (let i = 0; i < results.length; i++) {
        let r = results[i];
        html +=
            '<a href="' + r.url + '" target="_blank" class="wiki__card">' +
                '<h3 class="wiki__card-title">' + r.title + '</h3>' +
                '<p class="wiki__card-snippet">' + r.snippet + '</p>' +
                '<span class="wiki__card-link">Читать на Wikipedia <i class="fa-solid fa-external-link-alt"></i></span>' +
            '</a>';
    }
    container.innerHTML = html;
}

async function searchWiki(query) {
    let container = document.getElementById('wiki-results');
    if (!container) return;

    container.innerHTML = '<p class="wiki__loading"><i class="fa-solid fa-spinner fa-spin"></i> Поиск...</p>';

    try {
        let results = await ApiService.searchWikipedia(query);
        renderWikiResults(results);

        let history = LocalStorageService.load('searchHistory', []);
        history.unshift({ query: query, date: new Date().toISOString(), count: results.length });
        if (history.length > 20) history = history.slice(0, 20);
        LocalStorageService.save('searchHistory', history);

        SessionStorageService.save('lastSearch', query);
    } catch (error) {
        container.innerHTML = '<p class="wiki__error"><i class="fa-solid fa-exclamation-triangle"></i> ' + error.message + '</p>';
        showNotification(error.message, 'error');
    }
}

function initWikiSearch() {
    ensureWikiSection();

    let form = document.getElementById('wiki-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            let input = document.getElementById('wiki-input');
            let query = input.value.trim();
            if (query) searchWiki(query);
        });
    }
}


// ==================== LEARNING DASHBOARD ====================

function ensureDashboardSection() {
    if (document.getElementById('dashboard-section')) return;
    let main = document.querySelector('.main');
    let hero = document.querySelector('.hero');
    if (!main || !hero) return;

    let section = document.createElement('section');
    section.id = 'dashboard-section';
    section.className = 'dashboard-section';
    section.innerHTML =
        '<div class="dashboard__container">' +
            '<header class="dashboard__header">' +
                '<h2 class="section-title"><i class="fa-solid fa-chart-line"></i> Прогресс обучения</h2>' +
            '</header>' +
            '<div class="dashboard__cards" id="dashboard-cards"></div>' +
            '<div class="dashboard__history" id="dashboard-history"></div>' +
        '</div>';
    main.insertBefore(section, hero.nextSibling);
}

function renderDashboard() {
    let cardsEl = document.getElementById('dashboard-cards');
    let historyEl = document.getElementById('dashboard-history');
    if (!cardsEl || !historyEl) return;

    let quizHistory = LocalStorageService.load('quizHistory', []);
    let searchHistory = LocalStorageService.load('searchHistory', []);
    let pending = LocalStorageService.getPendingSync();

    let totalQuizzes = quizHistory.length;
    let avgScore = 0;
    if (totalQuizzes > 0) {
        let sum = 0;
        for (let i = 0; i < quizHistory.length; i++) { sum += quizHistory[i].percent; }
        avgScore = Math.round(sum / totalQuizzes);
    }

    let lastSession = SessionStorageService.load('currentQuiz', null);

    cardsEl.innerHTML =
        '<div class="dashboard__card">' +
            '<i class="fa-solid fa-question-circle dashboard__card-icon"></i>' +
            '<span class="dashboard__card-value">' + totalQuizzes + '</span>' +
            '<span class="dashboard__card-label">Тестов пройдено</span>' +
        '</div>' +
        '<div class="dashboard__card">' +
            '<i class="fa-solid fa-percent dashboard__card-icon"></i>' +
            '<span class="dashboard__card-value">' + avgScore + '%</span>' +
            '<span class="dashboard__card-label">Средний балл</span>' +
        '</div>' +
        '<div class="dashboard__card">' +
            '<i class="fa-solid fa-search dashboard__card-icon"></i>' +
            '<span class="dashboard__card-value">' + searchHistory.length + '</span>' +
            '<span class="dashboard__card-label">Запросов</span>' +
        '</div>' +
        '<div class="dashboard__card">' +
            '<i class="fa-solid fa-clock-rotate-left dashboard__card-icon"></i>' +
            '<span class="dashboard__card-value">' + pending.length + '</span>' +
            '<span class="dashboard__card-label">Ожидают синхр.</span>' +
        '</div>';

    if (quizHistory.length === 0) {
        historyEl.innerHTML = '<p class="dashboard__empty">Пройдите тест, чтобы увидеть историю</p>';
        return;
    }

    let rows = '';
    let show = quizHistory.slice(-5).reverse();
    for (let j = 0; j < show.length; j++) {
        let h = show[j];
        rows +=
            '<tr>' +
                '<td>' + DataParser.formatDate(h.date) + '</td>' +
                '<td>' + h.category + '</td>' +
                '<td>' + h.difficulty + '</td>' +
                '<td>' + h.correct + '/' + h.total + '</td>' +
                '<td>' + h.percent + '%</td>' +
            '</tr>';
    }

    historyEl.innerHTML =
        '<h3 class="dashboard__subtitle">Последние результаты</h3>' +
        '<table class="dashboard__table">' +
            '<thead><tr><th>Дата</th><th>Категория</th><th>Сложность</th><th>Результат</th><th>%</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>';
}

function initDashboard() {
    ensureDashboardSection();
    renderDashboard();
}


// ==================== NETWORK SYNC ====================

function updateNetworkStatus() {
    let el = document.getElementById('api-quiz-network');
    let textEl = document.getElementById('network-text');
    if (!el || !textEl) return;

    if (navigator.onLine) {
        el.className = 'api-quiz__status api-quiz__status--online';
        textEl.textContent = 'Online';
    } else {
        el.className = 'api-quiz__status api-quiz__status--offline';
        textEl.textContent = 'Offline';
    }
}

async function syncPendingData() {
    let pending = LocalStorageService.getPendingSync();
    if (pending.length === 0) return;

    console.log('Синхронизация ' + pending.length + ' записей...');
    showNotification('Синхронизация данных (' + pending.length + ' записей)...', 'info');

    // В реальном приложении здесь были бы POST-запросы к серверу
    // Имитируем отправку с задержкой
    for (let i = 0; i < pending.length; i++) {
        console.log('Synced:', pending[i].type, pending[i]);
    }

    LocalStorageService.clearPendingSync();
    renderDashboard();
    showNotification('Данные успешно синхронизированы!', 'success');
}

function initNetworkSync() {
    updateNetworkStatus();

    window.addEventListener('online', function() {
        updateNetworkStatus();
        showNotification('Подключение восстановлено', 'success');
        syncPendingData();
    });

    window.addEventListener('offline', function() {
        updateNetworkStatus();
        showNotification('Нет подключения к интернету. Данные сохраняются локально.', 'error');
    });
}


// ==================== EXISTING FEATURES ====================

let quizQuestions = [
    { q: 'Что такое DOM в JavaScript?', a: [{ id: 'a', t: 'Язык программирования' }, { id: 'b', t: 'Объектная модель документа' }, { id: 'c', t: 'База данных' }, { id: 'd', t: 'Фреймворк' }], correct: 'b' },
    { q: 'Какой метод выбирает элемент по ID?', a: [{ id: 'a', t: 'querySelector()' }, { id: 'b', t: 'getElementsByClassName()' }, { id: 'c', t: 'getElementById()' }, { id: 'd', t: 'getElement()' }], correct: 'c' },
    { q: 'Как добавить click-обработчик?', a: [{ id: 'a', t: 'element.onClick()' }, { id: 'b', t: 'element.addEventListener("click", fn)' }, { id: 'c', t: 'element.click(fn)' }, { id: 'd', t: 'element.on("click")' }], correct: 'b' },
    { q: 'Что хранит LocalStorage?', a: [{ id: 'a', t: 'Данные до закрытия вкладки' }, { id: 'b', t: 'Данные на сервере' }, { id: 'c', t: 'Данные в браузере постоянно' }, { id: 'd', t: 'Только cookie' }], correct: 'c' },
    { q: 'Что вернёт typeof []?', a: [{ id: 'a', t: 'array' }, { id: 'b', t: 'object' }, { id: 'c', t: 'list' }, { id: 'd', t: 'undefined' }], correct: 'b' }
];
let quizStep = 0;
let quizAnswers = [];
let quizDone = false;

function ensureQuizSection() {
    if (document.getElementById('quiz-section')) return;
    let main = document.querySelector('.main');
    let beforeSection = document.querySelector('.courses--top');
    if (!main || !beforeSection) return;

    let section = document.createElement('section');
    section.id = 'quiz-section';
    section.className = 'quiz-section';
    section.innerHTML =
        '<div class="quiz__container">' +
            '<header class="quiz__header">' +
                '<h2 class="section-title">Тест по JavaScript</h2>' +
                '<div class="quiz__progress-info">Вопрос <span id="quiz-current">1</span> из <span id="quiz-total">' + quizQuestions.length + '</span>' +
                    '<div class="quiz__progress-bar"><div class="quiz__progress-fill" id="quiz-fill"></div></div>' +
                '</div>' +
            '</header>' +
            '<div id="quiz-content" class="quiz__content"></div>' +
            '<div id="quiz-actions" class="quiz__actions"></div>' +
        '</div>';
    main.insertBefore(section, beforeSection);
}

function renderQuiz() {
    let content = document.getElementById('quiz-content');
    let actions = document.getElementById('quiz-actions');
    let current = document.getElementById('quiz-current');
    let fill = document.getElementById('quiz-fill');
    if (!content || !actions || !current || !fill) return;

    if (quizDone) {
        let ok = 0;
        for (let i = 0; i < quizQuestions.length; i++) {
            if (quizAnswers[i] === quizQuestions[i].correct) ok++;
        }
        let percent = Math.round((ok / quizQuestions.length) * 100);
        content.innerHTML =
            '<div class="quiz__results">' +
                '<div class="quiz__score quiz__score--good">' +
                    '<div class="quiz__score-circle"><span class="quiz__score-value">' + percent + '%</span></div>' +
                    '<p class="quiz__score-text">' + ok + ' из ' + quizQuestions.length + ' правильных</p>' +
                '</div>' +
            '</div>';
        actions.innerHTML = '<button class="quiz__btn quiz__btn--restart" id="quiz-restart">Пройти заново</button>';
        current.textContent = quizQuestions.length;
        fill.style.width = '100%';
        save('quizResults', { correct: ok, total: quizQuestions.length, percent: percent });
        return;
    }

    let q = quizQuestions[quizStep];
    let selected = quizAnswers[quizStep];
    let optionsHtml = '';
    for (let j = 0; j < q.a.length; j++) {
        let option = q.a[j];
        let selectedClass = selected === option.id ? 'quiz__option--selected' : '';
        let checked = selected === option.id ? 'checked' : '';
        optionsHtml +=
            '<label class="quiz__option ' + selectedClass + '">' +
                '<input type="radio" name="quiz-answer" value="' + option.id + '" ' + checked + '>' +
                '<span class="quiz__option-marker">' + option.id.toUpperCase() + '</span>' +
                '<span class="quiz__option-text">' + option.t + '</span>' +
            '</label>';
    }

    content.innerHTML = '<h3 class="quiz__question-text">' + q.q + '</h3><div class="quiz__options">' + optionsHtml + '</div>';
    actions.innerHTML =
        '<button class="quiz__btn quiz__btn--prev" id="quiz-prev" ' + (quizStep === 0 ? 'disabled' : '') + '>Назад</button>' +
        '<button class="quiz__btn quiz__btn--next" id="quiz-next">' + (quizStep === quizQuestions.length - 1 ? 'Завершить тест' : 'Следующий вопрос') + '</button>';

    current.textContent = quizStep + 1;
    fill.style.width = ((quizStep + 1) / quizQuestions.length * 100) + '%';
}

function initQuiz() {
    ensureQuizSection();
    renderQuiz();
}

function initTabs() {
    let tabs = document.querySelectorAll('.tabs__button');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {
            for (let j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('tabs__button--active');
                tabs[j].removeAttribute('aria-current');
            }
            this.classList.add('tabs__button--active');
            this.setAttribute('aria-current', 'true');
        });
    }
}

function initSearchForms() {
    let forms = document.querySelectorAll('.search-form');
    for (let i = 0; i < forms.length; i++) {
        forms[i].addEventListener('submit', function(event) {
            event.preventDefault();
            let input = this.querySelector('.search-form__input');
            let text = input.value.trim();
            if (text) {
                showNotification('Поиск: ' + text, 'info');
                searchWiki(text);
            }
        });
    }
}

function initNewsletter() {
    let form = document.querySelector('.newsletter__form');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        let input = form.querySelector('#newsletter-email');
        let email = input.value.trim();

        if (!isEmail(email)) {
            showNotification('Введите корректный email', 'error');
            return;
        }

        let list = load('newsletterSubscribers', []);
        if (list.indexOf(email) !== -1) {
            showNotification('Этот email уже подписан', 'info');
            return;
        }

        list.push(email);
        save('newsletterSubscribers', list);
        input.value = '';
        showNotification('Подписка оформлена', 'success');
    });
}

function initSlider() {
    let slider = document.querySelector('.courses__slider');
    let prev = document.querySelector('.slider-nav__button--prev');
    let next = document.querySelector('.slider-nav__button--next');
    if (!slider || !prev || !next) return;

    let index = 0;
    function visibleCount() {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 768) return 2;
        if (window.innerWidth < 992) return 3;
        return 4;
    }
    function move() {
        let cards = slider.querySelectorAll('.course-card');
        if (!cards.length) return;
        let cardWidth = cards[0].offsetWidth;
        slider.style.transform = 'translateX(-' + (index * (cardWidth + 20)) + 'px)';
    }
    prev.addEventListener('click', function() {
        if (index > 0) index--;
        move();
    });
    next.addEventListener('click', function() {
        let cards = slider.querySelectorAll('.course-card');
        let max = cards.length - visibleCount();
        if (index < max) index++;
        move();
    });
    window.addEventListener('resize', move);
}

function initGlobalEvents() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            let burger = document.getElementById('burger-toggle');
            if (burger && burger.checked) burger.checked = false;
        }
    });

    let bell = document.querySelector('.header__notifications');
    if (bell) {
        bell.addEventListener('click', function() {
            showNotification('У вас нет новых уведомлений', 'info');
        });
    }

    
    document.addEventListener('click', function(event) {
        let addBookmarkBtn = event.target.closest('[data-bookmark]');
        if (addBookmarkBtn) {
            let id = Number(addBookmarkBtn.getAttribute('data-bookmark'));
            if (bookmarks.indexOf(id) === -1) {
                bookmarks.push(id);
            } else {
                bookmarks = bookmarks.filter(function(x) { return x !== id; });
            }
            save('lessonBookmarks', bookmarks);
            renderBookmarks();
            return;
        }

        let removeBookmarkBtn = event.target.closest('[data-remove-bookmark]');
        if (removeBookmarkBtn) {
            let removeId = Number(removeBookmarkBtn.getAttribute('data-remove-bookmark'));
            bookmarks = bookmarks.filter(function(x) { return x !== removeId; });
            save('lessonBookmarks', bookmarks);
            renderBookmarks();
            return;
        }

        if (event.target.closest('#quiz-prev')) {
            if (quizStep > 0) quizStep--;
            renderQuiz();
            return;
        }
        if (event.target.closest('#quiz-next')) {
            if (quizStep < quizQuestions.length - 1) {
                quizStep++;
            } else {
                quizDone = true;
            }
            renderQuiz();
            return;
        }
        if (event.target.closest('#quiz-restart')) {
            quizStep = 0;
            quizAnswers = [];
            quizDone = false;
            renderQuiz();
            return;
        }

        let option = event.target.closest('.quiz__option');
        if (option) {
            let input = option.querySelector('input[name="quiz-answer"]');
            if (input) {
                quizAnswers[quizStep] = input.value;
                renderQuiz();
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
   
    let header = document.querySelector('.header');
    let main = document.getElementById('main');
    let cards = document.querySelectorAll('.course-card');
    console.log('Header найден:', !!header);
    console.log('Main найден:', !!main);
    console.log('Карточек курсов:', cards.length);

    initNotifications();
    initTabs();
    initSearchForms();
    initNewsletter();
    initSlider();
    initProgress();
    initBookmarks();
    initQuiz();
    initGlobalEvents();

    // Lab 5: async + API
    initDashboard();
    initWikiSearch();
    initApiQuiz();
    initNetworkSync();

    console.log('API Config:', API_CONFIG);
    console.log('LocalStorage data:', LocalStorageService.getAll());
});
