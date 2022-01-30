import React, {Component} from "react";
import {
    QUESTION_TYPE_CHECKBOX,
    QUESTION_TYPE_GRADIENT,
    QUESTION_TYPE_OPTION,
    QUESTION_TYPE_RATING,
    QUESTION_TYPE_TEXT,
    QUIZ_TASK_RESTORE
} from "../../const";
import FormOption from "../form/FormOption";
import FormCheckbox from "../form/FormCheckbox";
import FormText from "../form/FormText";
import FormRating from "../form/FormRating";
import FormGradient from "../form/FormGradient";
import ProgressBar from "../form/ProgressBar";
import Loading from "../form/Loading";
import TimerWrapper from "../form/TimerWrapper";

export default class QuizScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            error: null,
            question: null
        }

        this.api = props.api;

        const formTypeMap = {};
        formTypeMap[QUESTION_TYPE_OPTION] = FormOption;
        formTypeMap[QUESTION_TYPE_CHECKBOX] = FormCheckbox;
        formTypeMap[QUESTION_TYPE_TEXT] = FormText;
        formTypeMap[QUESTION_TYPE_RATING] = FormRating;
        formTypeMap[QUESTION_TYPE_GRADIENT] = FormGradient;
        this.formTypeMap = formTypeMap;

        this.selectionHandler = this.selectionHandler.bind(this);
        this.goForwardHandler = this.goForwardHandler.bind(this);
        this.goBackHandler = this.goBackHandler.bind(this);
    }

    componentDidMount() {
        if (this.props.task === QUIZ_TASK_RESTORE) {
            this.next();
        } else {
            this.start();
        }
    }

    // The user made his choice
    selectionHandler(value) {
        this.saveAndForward(value);
    }

    start() {
        this.setState({...this.state, isLoading: true});
        this.api.clear();
        this.wrapQuestionResponse(this.api.first());
    }

    next() {
        this.setState({...this.state, isLoading: true});
        this.wrapQuestionResponse(this.api.next());
    }

    prev() {
        this.setState({...this.state, isLoading: true});
        this.wrapQuestionResponse(this.api.prev());
    }

    // Forward button clicked: save answer and load the next question
    goForwardHandler() {
        this.saveAndForward(null);
    }

    // Back button clicked: load the previous question
    goBackHandler() {
        this.prev();
    }

    saveAndForward(value) {
        // save the answer
        this.api.addAnswer(value);
        if (!this.api.progressFull()) {
            this.next();
        } else {
            this.props.questionsOverHandler();
        }
    }

    wrapQuestionResponse(promise) {
        this.wrapResponse(promise, (question) => {
            this.setState({...this.state, isLoading: false, question: question})
        });
    }

    wrapResponse(promise, callback) {
        promise.then(callback).catch(error => {
            let reason = 'Произошла ошибка во время загрузки.';
            if (error.response.status === 403) {
                reason = 'Отказано в доступе.';
            }
            this.setState({...this.state, isLoading: false, error: reason});
            console.error(error.response.data.detail);
            console.error(error);
        });
    }

    render() {
        if (this.state.error) {
            return this.state.error;
        }
        if (this.state.question === null) {
            return <Loading/>;
        }
        const question = this.state.question;
        const options = question.options;
        const type = question.type.get();
        const enabledForward = question.enabledForward && question.number < question.length;
        const enabledBack = question.enabledBack && question.number > 1;

        const Form = this.formTypeMap[type];

        return (
            <article className={'tnc-q tnc-q__' + this.props.testId + '-' + question.id}>
                <TimerWrapper timer={question.timer} goForwardHandler={this.goForwardHandler} key={question.id}>
                    {question.img
                        ? <img className={'tnc-q__img'} src={question.img} alt={'Задание'}/>
                        : null}
                    <h2 className={'tnc-q__name'}>{question.name}</h2>
                    {question.text
                        ? <div className={'tnc-q__text'} dangerouslySetInnerHTML={{__html: question.text}}/>
                        : null}

                    <Form key={question.id}
                          options={options}
                          isLoading={this.state.isLoading}
                          enabledBack={enabledBack}
                          enabledForward={enabledForward}
                          selectionHandler={this.selectionHandler}
                          goForwardHandler={this.goForwardHandler}
                          goBackHandler={this.goBackHandler}/>

                    <ProgressBar length={question.length} number={question.number}/>
                </TimerWrapper>
            </article>
        );
    }
}