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
import {t} from "../../t";

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
        return this.saveAndForward(value);
    }

    start() {
        this.setState({...this.state, isLoading: true});
        this.api.clear();
        return this.wrapQuestionResponse(this.api.first());
    }

    next() {
        this.setState({...this.state, isLoading: true});
        return this.wrapQuestionResponse(this.api.next());
    }

    prev() {
        this.setState({...this.state, isLoading: true});
        return this.wrapQuestionResponse(this.api.prev());
    }

    // Forward button clicked: save answer and load the next question
    goForwardHandler() {
        return this.saveAndForward(null);
    }

    // Back button clicked: load the previous question
    goBackHandler() {
        this.prev();
    }

    async saveAndForward(value) {
        // save the answer
        this.setState({...this.state, isLoading: true});
        this.api.addAnswer(value).then(() => {
            this.api.progressFull().then((isFull) => {
                if (!isFull) {
                    this.next();
                } else {
                    this.props.questionsOverHandler();
                }
            })
        });
    }

    async wrapQuestionResponse(promise) {
        await this.wrapResponse(promise, (question) => {
            this.setState({...this.state, isLoading: false, question: question})
        });
    }

    async wrapResponse(promise, callback) {
        await promise.then(callback).catch(error => {
            let reason = t('Произошла ошибка во время загрузки.');
            if (error.response) {
                console.error(error.response.data.detail);
                if (error.response.status === 403) {
                    reason = t('Отказано в доступе.');
                }
            }
            console.error(error);
            this.setState({...this.state, isLoading: false, error: reason});

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
                        ? <img className={'tnc-q__img'} src={question.img} alt={t('Задание')}/>
                        : null}
                    <h2 className={'tnc-q__name'}>{question.name}</h2>
                    {question.text
                        ? <div className={'tnc-q__text'} dangerouslySetInnerHTML={{__html: question.text}}/>
                        : null}

                    <Form key={question.id}
                          options={options}
                          count={question.count}
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