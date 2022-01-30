export default class Answer {
    constructor(questionId, value) {
        this.questionId = questionId;
        this.value = value;
    }

    static createImmutable(questionId, value) {
        const answer = new Answer(questionId, value);
        Object.freeze(this);
        return answer;
    }
}