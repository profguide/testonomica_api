import {STATUS_FINISHED, STATUS_IN_PROGRESS, STATUS_NONE} from "../../const";
import Answer from "../types/Answer";

export default class ProgressStorage {
    constructor(id) {
        this.storageName = 'testonomica_test_' + id;
        if (!localStorage.getItem(this.storageName)) {
            this._initLocalStorage();
        }
        // this.clear();
        // console.log('Storage', localStorage.getItem(this.storageName))
    }

    async resultKey() {
        return this._getStorageData().resultKey;
    }

    async clear() {
        this._initLocalStorage();
    }

    async addAnswer(answer) {
        const storage = this._getStorageData();
        const answers = storage.answers;
        answers[answer.questionId] = answer.value;
        this._updateField('answers', answers);
        this._updateField('last', answer.questionId);
    }

    async getAnswers() {
        return this._getStorageData().answers;
    }

    async getLastAnswer() {
        const storage = this._getStorageData();
        const answers = storage.answers;
        let lastId = storage.last;
        // for the back compatibility, when there was no 'last' (added on Feb 27, so in a 3 days might be removed this check)
        if (!lastId) {
            const keys = Object.keys(answers);
            lastId = keys[keys.length - 1];
        }
        return Answer.createImmutable(lastId, answers[lastId]);
    }

    async getLength() {
        return Object.keys(this._getStorageData().answers).length;
    }

    async getStatus() {
        const data = this._getStorageData();
        if (data.resultKey) {
            return STATUS_FINISHED;
        } else if (Object.keys(data.answers).length > 0) {
            return STATUS_IN_PROGRESS;
        } else {
            return STATUS_NONE;
        }
    }

    async setFinished(key) {
        this._updateField('resultKey', key);
    }

    _getStorageData() {
        return JSON.parse(localStorage.getItem(this.storageName));
    }

    _initLocalStorage() {
        const data = JSON.stringify({
            resultKey: null,
            answers: {}, // answers
            last: null // last answer id for restoring
        });
        localStorage.setItem(this.storageName, data);
    }

    _updateField(key, value) {
        const data = this._getStorageData();
        data[key] = value;
        this._update(data);
    }

    _update(data) {
        localStorage.setItem(this.storageName, JSON.stringify(data));
    }
}