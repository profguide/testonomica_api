import Answer from "../service/types/Answer";
import Progress from "./Progress";

export default class AnswerManager {
    constructor(storage) {
        this.storage = storage;
    }

    add(id, value) {
        this.storage.addAnswer(Answer.createImmutable(id, value));
    }

    last() {
        return this.storage.getLastAnswer();
    }

    getAll() {
        return this.storage.getAnswers();
    }

    async getHash() {
        return this.storage.getAnswers().then(answers => {
            return btoa(JSON.stringify(answers));
        })
    }

    clear() {
        this.storage.clear();
    }

    status() {
        return this.storage.getStatus();
    }

    importBase64(base64) {
        const json = atob(base64);
        const array = JSON.parse(json);
        const progress = new Progress(new Map(array));
        return this.storage.import(progress);
    }
}