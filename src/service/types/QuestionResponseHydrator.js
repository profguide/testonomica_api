import Question from "../../service/types/Question";
import QuestionOption from "../../service/types/QuestionOption";
import QuestionType from "../../service/types/QuestionType";

export default class QuestionResponseHydrator {
    hydrate(response) {
        const type = new QuestionType(response.data.question.type);
        Object.freeze(type);

        const options = response.data.question.items.map(_data => {
            return new QuestionOption({
                value: _data.value,
                text: _data.text,
                img: _data.img
            });
        });

        const question = new Question({
            id: response.data.question.id,
            name: response.data.question.name,
            text: response.data.question.text,
            img: response.data.question.img,
            enabledBack: response.data.question.enabledBack,
            enabledForward: response.data.question.enabledForward,
            count: parseInt(response.data.question.count),
            timer: parseInt(response.data.question.timer),
            number: response.data.number,
            length: response.data.length,
            type,
            options
        });
        Object.freeze(question); // << make it immutable
        return question;
    }
}