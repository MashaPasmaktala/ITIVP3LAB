let DataParser = {

    decodeHTML: function (html) {
        let txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    },

    parseQuizData: function (rawQuestions) {
        let parsed = [];
        for (let i = 0; i < rawQuestions.length; i++) {
            let q = rawQuestions[i];
            let answers = [];
            for (let j = 0; j < q.incorrect_answers.length; j++) {
                answers.push({
                    text: DataParser.decodeHTML(q.incorrect_answers[j]),
                    correct: false
                });
            }
            answers.push({
                text: DataParser.decodeHTML(q.correct_answer),
                correct: true
            });

            // Fisher-Yates shuffle
            for (let k = answers.length - 1; k > 0; k--) {
                let r = Math.floor(Math.random() * (k + 1));
                let temp = answers[k];
                answers[k] = answers[r];
                answers[r] = temp;
            }

            parsed.push({
                question: DataParser.decodeHTML(q.question),
                category: DataParser.decodeHTML(q.category),
                difficulty: q.difficulty,
                answers: answers
            });
        }
        return parsed;
    },

    parseWikipediaResults: function (rawResults) {
        let parsed = [];
        for (let i = 0; i < rawResults.length; i++) {
            let r = rawResults[i];
            parsed.push({
                title: r.title,
                snippet: DataParser.stripTags(r.snippet),
                pageId: r.pageid,
                url: 'https://en.wikipedia.org/?curid=' + r.pageid
            });
        }
        return parsed;
    },

    stripTags: function (html) {
        let div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || '';
    },

    formatDate: function (dateStr) {
        let d = new Date(dateStr);
        let day = ('0' + d.getDate()).slice(-2);
        let month = ('0' + (d.getMonth() + 1)).slice(-2);
        let year = d.getFullYear();
        let hours = ('0' + d.getHours()).slice(-2);
        let minutes = ('0' + d.getMinutes()).slice(-2);
        return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
    }
};
