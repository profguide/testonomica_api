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

    resultKey() {
        return this._getStorageData().resultKey;
    }

    clear() {
        this._initLocalStorage();
    }

    addAnswer(answer) {
        const answers = this._getStorageData().answers;
        answers[answer.questionId] = answer.value;
        this._updateField('answers', answers);
        // console.log('Storage: answer added', answers);
    }

    getAnswers() {
        return this._getStorageData().answers;
    }

    getLastAnswer() {
        const answers = this._getStorageData().answers;
        const keys = Object.keys(answers);
        const lastId = keys[keys.length - 1];
        const lastValue = answers[lastId];
        return Answer.createImmutable(lastId, lastValue);
    }

    getLength() {
        return Object.keys(this._getStorageData().answers).length;
    }

    getStatus() {
        const data = this._getStorageData();
        if (data.resultKey) {
            return STATUS_FINISHED;
        } else if (Object.keys(data.answers).length > 0) {
            return STATUS_IN_PROGRESS;
        } else {
            return STATUS_NONE;
        }
    }

    setFinished(key) {
        this._updateField('resultKey', key);
    }

    _getStorageData() {
        return JSON.parse(localStorage.getItem(this.storageName));
    }

    _initLocalStorage() {
        const data = JSON.stringify({
            resultKey: null,
            answers: {} // answers
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