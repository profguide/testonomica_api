import {STATUS_FINISHED, STATUS_IN_PROGRESS, STATUS_NONE} from "../../const";
import Answer from "../types/Answer";
import Progress from "../../Progress/Progress";

export default class ProgressStorage {
    storageName: string;

    constructor(id: string) {
        this.storageName = 'testonomica_test_' + id;
        if (!window.localStorage.getItem(this.storageName)) {
            this._initLocalStorage();
        } else {
            // новый формат хранилища Map был выложен 13 мая 2023.
            // Думаю, лучше подождать минимум год, прежде чем удалить нижележащую проверку.
            // старый формат прогресса - удалим, потому что он старый и беспорядочный.
            if (!Array.isArray(this._getStorageData().answers)) {
                console.log('Формат хранилища изменился в новой версии, поэтому прогресс был обнулён.');
                this._initLocalStorage();
            }
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

    async import(progress: Progress) {
        this._updateField('answers', Array.from(progress.get().entries())); // todo может тут что-то не так?
    }

    async addAnswer(answer: Answer) {
        const storage = this._getStorageData();
        const answers = new Map(storage.answers);
        answers.set(answer.questionId, answer.value);
        this._updateField('answers', Array.from(answers.entries()));
    }

    async getAnswers() {
        return this._getStorageData().answers;
    }

    async getLastAnswer() {
        const storage = this._getStorageData();
        const answers = new Map(storage.answers);
        const last = Array.from(answers.entries()).pop();
        if (!last) {
            return null;
        }
        return Answer.createImmutable(<string>last[0], <Array<any>>last[1]);
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

    async setFinished(key: string) {
        this._updateField('resultKey', key);
    }

    _getStorageData() {
        return JSON.parse(window.localStorage.getItem(this.storageName) ?? '');
    }

    _initLocalStorage() {
        const data = JSON.stringify({
            resultKey: null,
            answers: [], // answers, map, e.g. [[900, ['b']], [100, ['a']]]
        });
        window.localStorage.setItem(this.storageName, data);
    }

    _updateField(key: string, value: any) {
        const data = this._getStorageData();
        data[key] = value;
        this._update(data);
    }

    _update(data: any) {
        window.localStorage.setItem(this.storageName, JSON.stringify(data));
    }
}