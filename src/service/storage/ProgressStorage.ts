import {STATUS_FINISHED, STATUS_IN_PROGRESS, STATUS_NONE} from "../../const";
import Answer from "../types/Answer";
import Progress from "../../Progress/Progress";

/**
 * План:
 * 1. (Готово) Перевести хранение на Map
 * 2. (Готово) Отправку производить в массиве
 * 3. (ГОТОВО) PHP - решить хранить массив или как есть - в объекте.
 *    Этот вопрос можно отложить, а пока хранить в объекте, создав два конвертера:
 *    "из" и "в" формат виджета - когда массив вида [[900, ['b'], [100, ['a']]]
 * 4. Конвертер старого localstorage в новый (в одном месте каком-то - в конструкторе например
 *
 * {"1":["1"],"2":["0"],"3":["1"],"4":["1"],"5":["0"],"6":["0"],"10":["1"],"11":["1"],"12":["0"],"13":["1"],"20":["1"],"21":["0"],"22":["0"],"23":["1"],"24":["0"],"100":["1"],"101":["0"],"102":["1"],"110":["0"],"111":["0"],"112":["0"],"120":["1"],"121":["0"],"122":["1"],"200":["1"],"201":["1"],"202":["1"],"203":["0"],"204":["1"],"210":["0"],"211":["0"],"212":["1"],"213":["1"],"214":["0"],"215":["0"],"220":["1"],"221":["0"],"222":["0"],"300":["1"],"301":["0"],"310":["0"],"311":["0"],"312":["0"],"313":["0"],"320":["0"],"321":["1"],"400":["1"],"401":["1"],"402":["0"],"410":["1"],"411":["0"],"412":["0"],"420":["0"],"421":["1"],"422":["1"],"500":["0"],"501":["0"],"510":["0"],"511":["0"],"512":["0"],"520":["0"],"521":["1"],"522":["1"],"523":["0"],"600":["0"],"601":["0"],"610":["0"],"611":["1"],"612":["0"],"613":["0"],"620":["1"],"621":["0"],"622":["1"],"700":["1"],"701":["1"],"702":["0"],"710":["1"],"711":["0"],"712":["0"],"720":["0"],"721":["0"],"722":["0"],"723":["1"],"800":["0"],"801":["0"],"802":["1"],"810":["1"],"811":["1"],"812":["1"],"820":["0"],"821":["1"],"822":["1"],"900":["0"],"901":["1"],"902":["0"],"910":["1"],"911":["0"],"912":["0"],"913":["0"],"920":["0"],"921":["1"],"922":["1"],"923":["1"],"1000":["1"],"1001":["1"],"1002":["0"],"1010":["0"],"1011":["1"],"1012":["1"],"1020":["0"],"1021":["0"],"1022":["0"],"1100":["0"],"1101":["0"],"1102":["0"],"1110":["0"],"1111":["1"],"1112":["0"],"1120":["1"],"1121":["0"],"1122":["1"]})
 */

export default class ProgressStorage {
    storageName: string;

    constructor(id: string) {
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

    async import(progress: Progress) {
        console.log(progress)
        this._updateField('answers', Array.from(progress.get().entries()));
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
        return JSON.parse(localStorage.getItem(this.storageName) ?? '');
    }

    _initLocalStorage() {
        const data = JSON.stringify({
            resultKey: null,
            answers: [], // answers, map, e.g. [[900, ['b']], [100, ['a']]]
        });
        localStorage.setItem(this.storageName, data);
    }

    _updateField(key: string, value: any) {
        const data = this._getStorageData();
        data[key] = value;
        this._update(data);
    }

    _update(data: any) {
        localStorage.setItem(this.storageName, JSON.stringify(data));
    }
}