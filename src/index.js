import ReactDOM from "react-dom";
import React from 'react';
import App from "./site/App";
import ServiceApi from "./service/ServiceApi";
import TncEventDispatcher from "./events/TncEventDispatcher";
import './style.scss'

export default class Testonomica {
    constructor(testId, host, token) {
        this.api = new ServiceApi(testId, host, token);
        this.dispatcher = new TncEventDispatcher();
    }

    createApp(tag, config) {
        ReactDOM.render(<App api={this.api} config={config} dispatcher={this.dispatcher}/>, tag);
    }

    status() {
        this.api.progressStatus();
    }

    addEventListener(name, callback) {
        this.dispatcher.addEventListener(name, callback);
    }
}