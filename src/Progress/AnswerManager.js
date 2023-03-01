import Answer from "../service/types/Answer";

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

    clear() {
        this.storage.clear();
    }

    status() {
        return this.storage.getStatus();
    }
}