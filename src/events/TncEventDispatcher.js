export default class TncEventDispatcher {
    constructor() {
        this.listeners = {};
    }

    addEventListener(name, callback) {
        if (!(this.listeners[name] && Array.isArray(this.listeners[name]))) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }

    clearEventListeners(name) {
        delete this.listeners[name];
    }

    dispatchEvent(e) {
        if (this.listeners[e.type]) {
            for (const name in this.listeners[e.type]) {
                this.listeners[e.type][name](e.detail);
            }
        }
    }
}