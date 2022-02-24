import ReactDOM from "react-dom";
import React from 'react';
import App from "./site/App";
import ServiceApi from "./service/ServiceApi";
import TncEventDispatcher from "./events/TncEventDispatcher";
import './style.scss'

export default class Testonomica {
    constructor(storage, testId, host, token) {
        this.api = new ServiceApi(storage, testId, host, token);
        this.dispatcher = new TncEventDispatcher();
    }

    createApp(tag, config) {
        ReactDOM.render(<App api={this.api} config={config} dispatcher={this.dispatcher}/>, tag);
    }

    addEventListener(name, callback) {
        this.dispatcher.addEventListener(name, callback);
    }
}