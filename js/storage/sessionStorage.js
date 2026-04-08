let SessionStorageService = {

    save: function (key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('sessionStorage save error:', error);
            return false;
        }
    },

    load: function (key, defaultValue) {
        try {
            let raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (error) {
            console.error('sessionStorage load error:', error);
            return defaultValue;
        }
    },

    remove: function (key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('sessionStorage remove error:', error);
            return false;
        }
    },

    clear: function () {
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error('sessionStorage clear error:', error);
        }
    }
};
