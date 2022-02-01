import ReactDOM from "react-dom";
import React from 'react';
import App from "./site/App";
import ServiceApi from "./service/ServiceApi";
import TncEventDispatcher from "./events/TncEventDispatcher";
import './style.scss'

export default class Testonomica {
    constructor() {
        this.dispatcher = new TncEventDispatcher();
    }

    createApp(tag, testId, host, token) {
        const api = new ServiceApi({testId, host, token});
        ReactDOM.render(<App api={api} dispatcher={this.dispatcher}/>, tag);
    }

    addEventListener(name, callback) {
        this.dispatcher.addEventListener(name, callback);
    }
}