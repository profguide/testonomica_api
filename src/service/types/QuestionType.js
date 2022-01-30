import {QUESTION_TYPE_CHECKBOX, QUESTION_TYPE_OPTION, QUESTION_TYPE_RATING, QUESTION_TYPE_TEXT, QUESTION_TYPE_GRADIENT} from "../../const";

export default class QuestionType {
    constructor(value) {
        // assert...
        if (![
            QUESTION_TYPE_OPTION,
            QUESTION_TYPE_CHECKBOX,
            QUESTION_TYPE_TEXT,
            QUESTION_TYPE_RATING,
            QUESTION_TYPE_GRADIENT
        ].includes(value)) {
            const msg = 'Unknown question type: ' + value;
            console.error(msg)
            throw new Error(msg);
        }
        this.value = value;
    }

    get() {
        return this.value;
    }
}