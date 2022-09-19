import ReactDOM from "react-dom";
import React from 'react';
import App from "./site/App";
import ServiceApi from "./service/ServiceApi";
import TncEventDispatcher from "./events/TncEventDispatcher";
import Config from "./config";
import {HOST, INIT_AUTO, START_SCREEN_API} from "./const";

import './style.scss'

export class Testonomica {
    constructor(storage, testId, host, token) {
        this.api = new ServiceApi(storage, testId, host, token);
        this.dispatcher = new TncEventDispatcher();
    }

    status() {
        return this.api.progressStatus();
    }

    createApp(tag, config) {
        const content = tag.innerHTML;
        ReactDOM.render(<App api={this.api} config={config} content={content} dispatcher={this.dispatcher}/>, tag);
    }

    addEventListener(name, callback) {
        this.dispatcher.addEventListener(name, callback);
    }
}

/***
 * @param tag
 * @returns {Config}
 */
export function parseConfigFromTag(tag) {
    const testId = tag.getAttribute('data-test');
    if (!testId) {
        throw new Error('tag must include attribute: data-test');
    }

    return new Config({
        testId,
        host: tag.getAttribute('data-host') ?? HOST,
        token: tag.getAttribute('data-token') ?? null,
        init: tag.getAttribute('data-init') ?? INIT_AUTO,
        startScreen: tag.getAttribute('data-start-screen') ?? START_SCREEN_API,
        displayReport: tag.getAttribute('data-display-report') ?? true,
        showResultAfterLoad: tag.getAttribute('data-show-result-after-load') ?? true
    });
}

export function randString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Checks if cookie are enabled
 * @returns {boolean}
 */
export function isCookieEnabled() {
    let cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled) {
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
    }
    return cookieEnabled
}

/**
 * Creates constant session id, which may be used for storing in the FireBase or on the server.
 * For now in not used because if localStorage disabled, then the other technology will be used.
 * @returns {string}
 */
export function session() {
    const STORAGE_NAME = 'tnc_sid';

    function init() {
        if (!get()) {
            set();
        }
        return get();
    }

    function get() {
        return localStorage.getItem(STORAGE_NAME);
    }

    function set() {
        return localStorage.setItem(STORAGE_NAME, randString(12));
    }

    return init();
}