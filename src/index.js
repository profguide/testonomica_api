import ReactDOM from "react-dom";
import React from 'react';
import App from "./site/App";
import ServiceApi from "./service/ServiceApi";
import TncEventDispatcher from "./events/TncEventDispatcher";
import Config from "./config";
import {HOST, INIT_AUTO, START_SCREEN_API} from "./const";
import {
    ANSWER_RECEIVE_EVENT,
    CLICK_ANY_START_EVENT,
    CLICK_RESTART_EVENT,
    CLICK_RESTORE_EVENT,
    CLICK_START_EVENT,
    EVENT_FINISH,
    NO_MORE_QUESTIONS_EVENT,
    QUESTION_LOAD_EVENT,
    STATUS_LOADED_EVENT
} from "./events";
import QuestionManager from "./Question/QuestionManager";
import AnswerManager from "./Progress/AnswerManager";
import './style.scss'

export class Testonomica {
    constructor(storage, testId, host, token) {
        this.api = new ServiceApi(testId, host, token);
        this.am = new AnswerManager(storage);
        this.qm = new QuestionManager(this.api);
        this.dispatcher = new TncEventDispatcher();
        this.setDefaultBehaviour();
    }

    createApp(tag, config) {
        this.api.description().then(test => {
            if (config.progress) {
                this.am.importBase64(config.progress);
            }
            const app = <App test={test}
                             qm={this.qm}
                             am={this.am}
                             config={config}
                             content={tag.innerHTML}
                             dispatcher={this.dispatcher}/>;
            this.app = ReactDOM.render(app, tag);
        });
    }

    // вместо setDefaultBehaviour лучше обернуть Testonomica в TestonomicaDefaultAdapter
    setDefaultBehaviour() {
        const that = this;

        // when no questions left
        this.dispatcher.addEventListener(NO_MORE_QUESTIONS_EVENT, function (e) {
            that.am.getAll()
                .then(answers => that.api.saveResult(answers))
                .then(key => {
                    that.am.clear();
                    that.dispatcher.dispatchEvent(new CustomEvent(EVENT_FINISH, {detail: {result_key: key}}))
                });
        });

        // answer received
        this.dispatcher.addEventListener(ANSWER_RECEIVE_EVENT, function (e) {
            e.target.continueQuiz();
        });

        // the next question is loaded
        this.dispatcher.addEventListener(QUESTION_LOAD_EVENT, function (e) {
            e.target.renderQuiz();
        });

        // status loaded
        this.dispatcher.addEventListener(STATUS_LOADED_EVENT, function (e) {
            that.renderButtons();
        });

        // click start button
        this.dispatcher.addEventListener(CLICK_START_EVENT, function (e) {
            that.start();
        });

        // click restart button
        this.dispatcher.addEventListener(CLICK_RESTART_EVENT, function (e) {
            that.start();
        });

        // click restore button
        this.dispatcher.addEventListener(CLICK_RESTORE_EVENT, function (e) {
            that.restore();
        });
    }

    // render buttons for all selectors (if client site has them anywhere on page).
    // usage: <div class="testonomica_buttons"></div>
    renderButtons() {
        const widgetButtonContainers = document.querySelectorAll('.testonomica_buttons');
        if (widgetButtonContainers.length === 0) {
            return;
        }

        const that = this;

        this.status().then(status => {
            widgetButtonContainers.forEach(function (container) {
                if (status === 0) {
                    const startButton = document.createElement('button');
                    startButton.className = 'tnc-welcome__btn_start';
                    startButton.innerText = 'Начать';
                    startButton.addEventListener('click', function () {
                        that.dispatcher.dispatchEvent(new CustomEvent(CLICK_ANY_START_EVENT));
                        that.dispatcher.dispatchEvent(new CustomEvent(CLICK_START_EVENT));
                    });

                    container.appendChild(startButton);
                } else {
                    const startButton = document.createElement('button');
                    startButton.className = 'tnc-welcome__btn_restore';
                    startButton.innerText = 'Продолжить тест';
                    startButton.addEventListener('click', function () {
                        that.dispatcher.dispatchEvent(new CustomEvent(CLICK_ANY_START_EVENT));
                        that.dispatcher.dispatchEvent(new CustomEvent(CLICK_RESTORE_EVENT));
                    });

                    const restartButton = document.createElement('button');
                    restartButton.className = 'tnc-welcome__btn_restart';
                    restartButton.innerText = 'Начать сначала';
                    restartButton.addEventListener('click', function () {
                        that.dispatcher.dispatchEvent(new CustomEvent(CLICK_ANY_START_EVENT));
                        that.dispatcher.dispatchEvent(new CustomEvent(CLICK_RESTART_EVENT));
                    });

                    // Добавляем кнопки в div
                    container.appendChild(startButton);
                    container.appendChild(restartButton);
                }
            });
        });
    }

    start() {
        this.app.start();
    }

    restore() {
        this.app.restore();
    }

    status() {
        return this.am.status();
    }

    addEventListener(name, callback) {
        this.dispatcher.addEventListener(name, callback);
    }

    clearEventListeners(name) {
        this.dispatcher.clearEventListeners(name);
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