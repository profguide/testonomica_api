import {HOST} from "../const";
import axios from "axios";
import ProgressStorage from "./storage/ProgressStorage";
import QuestionResponseHydrator from "./types/QuestionResponseHydrator";
import Answer from "./types/Answer";
import Order from "./types/Order";

/**
 * Low-level API: requests, storing data
 *
 * todo split:
 *  accessApi - payment, check access etc.
 *  testApi - progress, result etc.
 *  token state вынести в синглтон. или лучше Redux
 */
export default class ServiceApi {
    constructor(config = {}) {
        if (!config['testId']) {
            throw new Error('testId must be defined.');
        }
        this.testId = config['testId'];
        this.host = config['host'] ?? HOST;
        this.token = config['token'];
        this.storage = new ProgressStorage(config.testId);
        this.test = null; // loaded brief about test
        this.question = null; // loaded question (current question)
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
            url: this.buildUrl('/info/' + this.testId + '/'),
            responseType: 'json',
        }).then(response => {
            this.test = {
                name: response.data.name,
                description: response.data.description,
                duration: response.data.duration,
                length: response.data.length,
                paid: response.data.paid
            }
            return this.test;
        })
    }

    progressStatus() {
        return this.storage.getStatus();
    }

    progressFull() {
        return this.test.length === this.storage.getLength();
    }

    saveResult() {
        console.log('Saving...');
        return axios.post(this.buildUrl('/save/' + this.testId + '/'), {
            progress: this.storage.getAnswers(),
        }, {
            headers: {'token': this.token}
        }).then(response => {
            this.token = response.headers['x-token'];
            const key = response.data.key;
            this.storage.setFinished(key);
            return key;
        });
    }

    result() {
        console.log(this.token)
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl(`/result/${this.testId}/?key=${this.storage.resultKey()}`)
        })).then(response => {
            this.token = response.headers['x-token'];
            return response;
        });
    }

    resultKey() {
        return this.storage.resultKey();
    }

    clear() {
        this.storage.clear();
    }

    /**
     * First query should be made throughout this.
     * Если autoRestore=true, отправляет restore
     * Иначе отправляет restart.
     * С другой стороны next может делать то же самое.
     */
    first() {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl('/first/' + this.testId + '/'),
            responseType: 'json',
        })).then(response => {
            this.token = response.headers['x-token'];
            this.question = (new QuestionResponseHydrator()).hydrate(response);
            return this.question;
        })
    }

    next() {
        let id;
        if (this.question) {
            id = this.question.id;
        } else {
            const answer = this.storage.getLastAnswer();
            id = answer.questionId;
        }
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl('/next/' + this.testId + '/?q=' + id),
            responseType: 'json',
        })).then(response => {
            this.token = response.headers['x-token'];
            this.question = (new QuestionResponseHydrator()).hydrate(response);
            return this.question;
        });
    }

    prev() {
        return axios(this.tokenizedRequest({
            method: 'get',
            url: this.buildUrl('/prev/' + this.testId + '/?q=' + this.question.id),
            responseType: 'json',
        })).then(response => {
            this.token = response.headers['x-token'];
            this.question = (new QuestionResponseHydrator()).hydrate(response);
            return this.question;
        });
    }

    addAnswer(value) {
        this.storage.addAnswer(Answer.createImmutable(this.question.id, value))
    }

    buildUrl(path) {
        return this.host + '/tests/api/v1' + path;
    }

    getToken() {
        return this.token;
    }

    tokenizedRequest(data) {
        if (this.token) {
            data['headers'] = {'token': this.token};
        }
        return data;
    }
}