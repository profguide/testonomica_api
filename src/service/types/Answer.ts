export default class Answer {
    questionId: string;
    value: Array<any>;

    constructor(questionId: string, value: Array<any>) {
        this.questionId = questionId;
        this.value = value;
    }

    static createImmutable(questionId: string, value: Array<any>) {
        const answer = new Answer(questionId, value);
        Object.freeze(this);
        return answer;
    }
}