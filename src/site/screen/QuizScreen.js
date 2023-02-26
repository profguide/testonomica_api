import React, {Component} from "react";
import {
    QUESTION_TYPE_CHECKBOX,
    QUESTION_TYPE_GRADIENT,
    QUESTION_TYPE_OPTION,
    QUESTION_TYPE_RATING,
    QUESTION_TYPE_TEXT,
    RESTORE_QUIZ_COMMAND
} from "../../const";
import FormOption from "../form/FormOption";
import FormCheckbox from "../form/FormCheckbox";
import FormText from "../form/FormText";
import FormRating from "../form/FormRating";
import FormGradient from "../form/FormGradient";
import ProgressBar from "../form/ProgressBar";
import TimerWrapper from "../form/TimerWrapper";
import {t} from "../../t";
import {EVENT_QUESTION_LOAD} from "../../events";

/**
 * TODO auto
 * 1. check url (it should be ?auto)
 * 2. init Form with argument auto="true"
 *
 * or plugin-like:
 * 1. load library on page
 * 2. this script subscribes on question change, analize form and do action (press button)
 *
 * I choose the last, beacause it easier to make.
 */
export default class QuizScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false, // to be active by event handler
            isLoading: true,
            error: null,
            question: null,
            opacity: 0
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
        this.trigger = this.trigger.bind(this);

        this.animateInterval = null;
    }

    componentDidMount() {
        if (this.props.task === RESTORE_QUIZ_COMMAND) {
            this.next();
        } else {
            this.start();
        }
    }

    trigger(e) {
        this.props.dispatcher.dispatchEvent(e);
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

    fadeIn() {
        if (this.animateInterval) {
            clearInterval(this.animateInterval);
        }

        const that = this;
        this.animateInterval = setInterval(function () {
            if (that.state.opacity >= 1) {
                clearInterval(that.animateInterval);
            }
            that.setState({...that.state, opacity: that.state.opacity + 0.05});
        }, 10);
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
            this.setState({...this.state, isLoading: false, question: question, opacity: 0, active: false});
            this.trigger(new CustomEvent(EVENT_QUESTION_LOAD, {detail: {number: question.number, target: this}}));
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

    renderQuestion() {
        this.setState({...this.state, active: true})
        this.fadeIn();
    }

    render() {
        if (!this.state.active) {
            return null;
        }
        if (this.state.error) {
            return this.state.error;
        }
        if (this.state.question === null) {
            return null;
            // return <div className="container"><Loading/></div>;
        }
        const question = this.state.question;
        const options = question.options;
        const type = question.type.get();
        const enabledForward = question.enabledForward && question.number < question.length;
        const enabledBack = question.enabledBack && question.number > 1;

        const Form = this.formTypeMap[type];

        return (
            <section className='tnc-q-wrapper'>
                <article className={'tnc-q tnc-q__' + this.props.testId + '-' + question.id}>
                    <div className="container">
                        <div className="tnc-q-inner" style={{opacity: this.state.opacity}}>
                            <TimerWrapper timer={question.timer} goForwardHandler={this.goForwardHandler}
                                          key={question.id}>
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
                        </div>
                    </div>
                </article>
            </section>
        );
    }
}