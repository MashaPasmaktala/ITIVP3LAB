let ApiService = {

    async get(url, params) {
        if (!navigator.onLine) {
            throw new Error('Нет подключения к интернету');
        }

        let query = '';
        if (params) {
            let parts = [];
            for (let key in params) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
            query = '?' + parts.join('&');
        }

        let controller = new AbortController();
        let timeoutId = setTimeout(function () {
            controller.abort();
        }, API_CONFIG.REQUEST_TIMEOUT);

        try {
            let response = await fetch(url + query, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('HTTP ошибка: ' + response.status);
            }

            let data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Превышено время ожидания запроса');
            }
            throw error;
        }
    },

    async fetchQuizQuestions(amount, category, difficulty) {
        let params = {
            amount: amount || 5,
            type: 'multiple'
        };
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;

        let data = await this.get(API_CONFIG.TRIVIA_BASE_URL + '/api.php', params);

        if (data.response_code !== 0) {
            throw new Error('API вернул ошибку (код: ' + data.response_code + ')');
        }

        return DataParser.parseQuizData(data.results);
    },

    async searchWikipedia(query) {
        let params = {
            action: 'query',
            list: 'search',
            srsearch: query,
            srlimit: 6,
            format: 'json',
            origin: '*'
        };

        let data = await this.get(API_CONFIG.WIKIPEDIA_BASE_URL, params);
        return DataParser.parseWikipediaResults(data.query.search);
    }
};
