export default class TncEventDispatcher {
    constructor() {
        this.listeners = {};
    }

    addEventListener(name, callback) {
        this.listeners[name] = callback
    }

    clearEventListeners(name) {
        delete this.listeners[name];
    }

    dispatchEvent(e) {
        if (this.listeners[e.type]) {
            this.listeners[e.type](e.detail);
        }
    }
}