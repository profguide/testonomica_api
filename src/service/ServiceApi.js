import {HOST} from "../const";
import axios from "axios";
import QuestionResponseHydrator from "./types/QuestionResponseHydrator";
import Order from "./types/Order";
import {detectLocale} from "../util";

export default class ServiceApi {
    constructor(testId, host, token) {
        if (!testId) {
            throw new Error('testId must be defined.');
        }
        this.testId = testId;
        this.host = (host ?? HOST) + (detectLocale() === 'en' ? '/en' : '');
        this.token = token;

        this.test = null; // loaded brief about test
    }

    hasAccess() {
        const data = {
            method: 'get',
            url: this.host + '/access/has/',
            responseType: 'json',
        }
        if (this.token) {
            data['headers'] = {'token': this.token};
        }
        return axios(data).then(response => {
            return response.data.status;
        });
    }

    // issues an access token for the first time after payment.
    grand() {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.host + '/access/grand/',
            responseType: 'json',
        })).then(response => {
            this.token = response.data.token;
            return true;
        });
    }

    getOrder() {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.host + '/access/order/',
            responseType: 'json',
        })).then(response => {
            const data = response.data.order;
            return new Order(
                data.id,
                data.description,
                data.price,
                data.count,
                data.sum
            );
        });
    }

    // brief for welcome page
    description() {
        return axios({
            method: 'get',
            url: this.buildUrl(`/info/${this.testId}/`),
            responseType: 'json',
        }).then(response => {
            this.test = {
                id: this.testId,
                name: response.data.name,
                description: response.data.description,
                instruction: response.data.instruction,
                authors: response.data.authors,
                duration: response.data.duration,
                length: response.data.length,
                paid: response.data.paid
            }
            return this.test;
        })
    }

    // async saveResult() {
    //     return this.storage.getAnswers().then(answers => {
    //         return axios(this.tokenizedRequest({
    //             method: 'post',
    //             url: this.buildUrl(`/save/${this.testId}/`),
    //             data: {
    //                 progress: answers,
    //             }
    //         })).then(response => {
    //             this.token = response.headers['x-token'];
    //             const key = response.data.key;
    //             this.storage.setFinished(key);
    //             return key;
    //         });
    //     })
    // }
    //
    // async result() {
    //     const key = await this.storage.resultKey();
    //     return axios(this.tokenizedRequest({
    //         method: 'get',
    //         url: this.buildUrl(`/result/${this.testId}/?key=${key}`)
    //     })).then(response => {
    //         this.token = response.headers['x-token'];
    //         return response;
    //     });
    // }
    //
    // resultKey() {
    //     return this.storage.resultKey();
    // }

    /**
     * First query should be made throughout this.
     * Если autoRestore=true, отправляет restore
     * Иначе отправляет restart.
     * С другой стороны next может делать то же самое.
     */
    async firstQuestion() {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl('/first/' + this.testId + '/'),
            responseType: 'json',
        })).then(response => {
            this.token = response.headers['x-token'];
            return (new QuestionResponseHydrator()).hydrate(response);
        })
    }

    async nextQuestion(id) {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl('/next/' + this.testId + '/?q=' + id),
            responseType: 'json',
        })).then(response => {
            this.token = response.headers['x-token'];
            return (new QuestionResponseHydrator()).hydrate(response);
        });
    }

    async prevQuestion(id) {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl('/prev/' + this.testId + '/?q=' + id),
            responseType: 'json',
        })).then(response => {
            this.token = response.headers['x-token'];
            return (new QuestionResponseHydrator()).hydrate(response);
        });
    }

    buildUrl(path) {
        return `${this.host}/tests/api/v1${path}`;
    }

    tokenizedRequest(data) {
        if (this.token) {
            data['headers'] = {'token': this.token};
        }
        return data;
    }
}