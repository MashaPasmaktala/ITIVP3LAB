let LocalStorageService = {

    save: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('localStorage save error:', error);
            return false;
        }
    },

    load: function (key, defaultValue) {
        try {
            let raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (error) {
            console.error('localStorage load error:', error);
            return defaultValue;
        }
    },

    remove: function (key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('localStorage remove error:', error);
            return false;
        }
    },

    getAll: function () {
        let result = {};
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            result[key] = this.load(key, null);
        }
        return result;
    },

    addToPendingSync: function (action) {
        let pending = this.load('pendingSync', []);
        action.timestamp = new Date().toISOString();
        pending.push(action);
        this.save('pendingSync', pending);
    },

    getPendingSync: function () {
        return this.load('pendingSync', []);
    },

    clearPendingSync: function () {
        this.remove('pendingSync');
    }
};
