export default class QuestionManager {
    constructor(api) {
        this.api = api;
    }

    async first() {
        return this.api.firstQuestion().then(question => {
            return question;
        });
    }

    async next(id) {
        return this.api.nextQuestion(id).then(question => {
            return question;
        });
    }

    async prev(id) {
        return this.api.prevQuestion(id).then(question => {
            return question;
        });
    }
}