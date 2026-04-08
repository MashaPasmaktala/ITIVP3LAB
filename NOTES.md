# Шпаргалка к защите лабораторной №5

## 1. Что такое асинхронность в JavaScript?

JavaScript — однопоточный язык. Асинхронность позволяет выполнять долгие операции (запросы к серверу, таймеры) **не блокируя** основной поток.

**Event Loop (цикл событий)** — механизм, который:
1. Выполняет синхронный код из Call Stack
2. Когда стек пуст — берёт задачи из очереди (callback queue)
3. Микрозадачи (Promise) приоритетнее макрозадач (setTimeout)

```
Синхронный код → Call Stack → Event Loop → Callback Queue
                                         → Microtask Queue (Promise)
```

---

## 2. Promise

Promise — объект, представляющий результат асинхронной операции.

Три состояния:
- **pending** — ещё выполняется
- **fulfilled** — успешно завершился
- **rejected** — завершился с ошибкой

```javascript
let promise = new Promise(function(resolve, reject) {
    // асинхронная операция
    resolve('ok');   // успех
    reject('error'); // ошибка
});

promise
    .then(function(result) { /* обработка успеха */ })
    .catch(function(error) { /* обработка ошибки */ });
```

---

## 3. async/await

Синтаксический сахар над Promise. Делает асинхронный код похожим на синхронный.

- `async` перед функцией — функция всегда возвращает Promise
- `await` — приостанавливает выполнение до завершения Promise

```javascript
async function loadData() {
    try {
        let response = await fetch(url);  // ждём ответ
        let data = await response.json(); // ждём парсинг JSON
        return data;
    } catch (error) {
        console.error(error);
    }
}
```

**В проекте:** `apiService.js` — метод `get()`, `fetchQuizQuestions()`, `searchWikipedia()` — все async.

---

## 4. Fetch API

Встроенный API браузера для HTTP-запросов. Возвращает Promise.

```javascript
let response = await fetch(url, {
    method: 'GET',        // метод HTTP
    signal: controller.signal  // для отмены запроса
});

if (!response.ok) {
    throw new Error('HTTP ошибка: ' + response.status);
}

let data = await response.json(); // парсим JSON
```

**Ключевые моменты в проекте:**
- `fetch()` возвращает Promise с объектом Response
- `response.ok` — true если статус 200-299
- `response.json()` — тоже возвращает Promise (поэтому нужен await)
- `AbortController` — для отмены запроса по таймауту

### AbortController (таймаут запроса)

```javascript
let controller = new AbortController();
let timeoutId = setTimeout(function() {
    controller.abort(); // отменяет запрос через 10 сек
}, 10000);

fetch(url, { signal: controller.signal });
```

---

## 5. JSON

**JSON (JavaScript Object Notation)** — текстовый формат обмена данными.

```javascript
// Объект → строка JSON
JSON.stringify({ name: 'test', score: 95 })
// '{"name":"test","score":95}'

// Строка JSON → объект
JSON.parse('{"name":"test","score":95}')
// { name: 'test', score: 95 }
```

**Где используем:**
- `localStorage.setItem(key, JSON.stringify(value))` — сохраняем
- `JSON.parse(localStorage.getItem(key))` — читаем
- `response.json()` — парсим ответ от API

---

## 6. LocalStorage vs SessionStorage

| | LocalStorage | SessionStorage |
|---|---|---|
| Время жизни | Навсегда (пока не очистят) | До закрытия вкладки |
| Объём | ~5-10 МБ | ~5-10 МБ |
| Область | Все вкладки домена | Только текущая вкладка |

**Методы (одинаковые у обоих):**
```javascript
localStorage.setItem('key', 'value');  // сохранить
localStorage.getItem('key');           // прочитать
localStorage.removeItem('key');        // удалить
localStorage.clear();                  // очистить всё
localStorage.length;                   // кол-во записей
localStorage.key(0);                   // ключ по индексу
```

**В проекте:**
- `LocalStorageService` — хранит quizHistory, courseProgress, searchHistory, bookmarks, pendingSync
- `SessionStorageService` — хранит currentQuiz (текущая сессия квиза), lastSearch

---

## 7. Какие API используются

### Open Trivia Database (opentdb.com)
- **Бесплатный**, ключ не нужен
- Образовательные вопросы по категориям
- Endpoint: `https://opentdb.com/api.php?amount=5&category=18&difficulty=medium&type=multiple`
- Возвращает JSON с массивом вопросов

### Wikipedia API
- **Бесплатный**, ключ не нужен
- Поиск статей
- Endpoint: `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=...&format=json&origin=*`
- `origin=*` — нужен для CORS (кросс-доменных запросов)

---

## 8. Обработка ошибок

```javascript
try {
    let data = await ApiService.fetchQuizQuestions(5, 18, 'medium');
} catch (error) {
    // error.message — текст ошибки
    showNotification(error.message, 'error');
}
```

**Какие ошибки обрабатываем:**
- Нет интернета → `navigator.onLine === false`
- Таймаут запроса → `AbortController` + проверка `error.name === 'AbortError'`
- HTTP ошибка → `response.ok === false`
- Ошибка API → `data.response_code !== 0`
- Ошибка парсинга JSON → try/catch в localStorage
- Переполнение storage → try/catch в setItem

---

## 9. Синхронизация при появлении сети

```javascript
// Слушаем события online/offline
window.addEventListener('online', function() {
    syncPendingData(); // отправляем накопленные данные
});
window.addEventListener('offline', function() {
    showNotification('Offline');
});

// navigator.onLine — текущий статус (true/false)
```

**Логика:**
1. Если действие произошло без сети → добавляем в `pendingSync` массив в localStorage
2. Когда сеть появляется → событие `online` → читаем pendingSync → "отправляем" → очищаем очередь

---

## 10. Структура файлов проекта

```
js/
├── api/
│   ├── config.js          — URL-ы API, категории, таймаут
│   └── apiService.js      — Fetch-обёртка (get, fetchQuizQuestions, searchWikipedia)
├── storage/
│   ├── localStorage.js    — save/load/remove/getAll/pendingSync
│   └── sessionStorage.js  — save/load/remove/clear
├── utils/
│   └── dataParser.js      — parseQuizData, parseWikipediaResults, decodeHTML
└── script.js              — главный файл, инициализация всего
.env                       — переменные окружения (API ключи)
```

---

## 11. Безопасность

- **API-ключи в .env** — не хранить в коде напрямую. Но на клиенте всё равно видны пользователю — это ограничение фронтенда.
- **HTTPS** — все запросы через защищённый протокол
- **CORS** — Cross-Origin Resource Sharing. Wikipedia API требует `origin=*` в параметрах для кросс-доменных запросов
- **Только GET** — для публичных данных не используем POST/PUT/DELETE
- Ограничения: по IP, по домену, по rate-limit (лимит запросов)

---

## 12. Что показать на защите

1. **Поиск Wikipedia** — ввести запрос, показать что данные загружаются через fetch
2. **API Quiz** — выбрать категорию, пройти тест, показать сохранение результата
3. **Прогресс обучения** — дашборд обновляется после каждого теста
4. **DevTools → Network** — показать запросы к API (opentdb.com, wikipedia)
5. **DevTools → Application → LocalStorage** — показать сохранённые данные
6. **DevTools → Application → SessionStorage** — показать данные сессии
7. **Offline режим** — DevTools → Network → Offline → показать обработку ошибки и pendingSync
8. **Обратно Online** — снять Offline → показать уведомление о синхронизации

---

## 13. Возможные вопросы преподавателя

**В: Чем отличается Promise от callback?**
О: Promise — это объект с состояниями (pending/fulfilled/rejected). Callback — просто функция. Promise решает проблему "callback hell" (вложенности), поддерживает цепочки (.then().then()) и единую обработку ошибок (.catch()).

**В: Зачем await, если есть .then()?**
О: async/await — синтаксический сахар над Promise. Код выглядит синхронным, легче читать и отлаживать. Под капотом работает так же.

**В: Зачем AbortController?**
О: Чтобы отменить запрос, если сервер не отвечает слишком долго. Без него fetch будет ждать бесконечно.

**В: Почему localStorage хранит только строки?**
О: Это ограничение Web Storage API. Поэтому используем JSON.stringify() при записи и JSON.parse() при чтении.

**В: Чем localStorage отличается от cookie?**
О: localStorage — только на клиенте (5-10 МБ), не отправляется на сервер. Cookie — отправляется с каждым запросом (4 КБ макс), можно задать срок жизни.

**В: Что такое CORS?**
О: Cross-Origin Resource Sharing — механизм, позволяющий серверу указать, каким доменам разрешён доступ. Без CORS браузер блокирует кросс-доменные запросы. Wikipedia API принимает `origin=*` чтобы разрешить запросы с любого домена.

**В: Что будет если localStorage переполнится?**
О: Вызов setItem() выбросит исключение (QuotaExceededError). Мы оборачиваем его в try/catch.

**В: Как работает синхронизация оффлайн-данных?**
О: Действия без сети складываем в массив `pendingSync` в localStorage. Событие `window.online` срабатывает при появлении сети — читаем очередь, "отправляем", очищаем. В реальном приложении отправляли бы POST-запросы на сервер.
