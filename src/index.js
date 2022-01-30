// High-level API main file: welcome screen, quiz screen, result screen, managing acts user does.

import ReactDOM from "react-dom";
import React from 'react';
import App from "./site/App";
import {HOST} from "./const";
import ServiceApi from "./service/ServiceApi";
import TncEventDispatcher from "./events/TncEventDispatcher";
import './style.scss'

const INIT_AUTO = 'auto';
const INIT_MANUAL = 'manual';

const tag = document.getElementById('testonomica_app');
const testId = tag.getAttribute('data-test');
if (!testId) {
    throw new Error('tag must include attribute: data-test');
}
const host = tag.getAttribute('data-host') ?? HOST;
const token = tag.getAttribute('data-token') ?? null;
const init = tag.getAttribute('data-init') ?? null;

class Testonomica {
    constructor() {
        this.dispatcher = new TncEventDispatcher();
    }

    createApp() {
        const api = new ServiceApi({testId, host, token});
        ReactDOM.render(<App api={api} dispatcher={this.dispatcher}/>, tag);
    }

    addEventListener(name, callback) {
        this.dispatcher.addEventListener(name, callback);
    }
}

window.testonomica = new Testonomica();
if (!init || init === INIT_AUTO) {
    window.testonomica.createApp();
}

// Iframe mode: notify parent about resize
// const resize_ob = new ResizeObserver(function (entries) {
//     let rect = entries[0].contentRect;
//     let height = rect.height;
//     console.log(height);
//     window.parent.postMessage({frameHeight: height}, host);
// });
// resize_ob.observe(tag);
// how to use:
// var api = window.testonomica;
// api.addEventListener('finish', (data) => {alert(data.key)})
// api.createApp();