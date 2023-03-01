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
import {ANSWER_RECEIVE_EVENT, NO_MORE_QUESTIONS_EVENT, QUESTION_LOAD_EVENT} from "../../events";

export default class QuizScreen extends Component {
    constructor(props) {
        super(props);

        this.qm = props.qm;
        this.am = props.am;

        this.state = {
            active: false, // to be activated by event handler
            isLoading: true,
            error: null,
            question: null,
            opacity: 0
        }

        const formTypeMap = {};
        formTypeMap[QUESTION_TYPE_OPTION] = FormOption;
        formTypeMap[QUESTION_TYPE_CHECKBOX] = FormCheckbox;
        formTypeMap[QUESTION_TYPE_TEXT] = FormText;
        formTypeMap[QUESTION_TYPE_RATING] = FormRating;
        formTypeMap[QUESTION_TYPE_GRADIENT] = FormGradient;
        this.formTypeMap = formTypeMap;

        this.save = this.save.bind(this);
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

    start() {
        this.setState({...this.state, isLoading: true});
        this.am.clear();
        this.qm.first().then(question => {
            this.afterQuestionLoad(question);
        });
    }

    next() {
        this.setState({...this.state, isLoading: true});
        // некрасиво, что приходится доставать ответ, но что делать -
        // если тест находится в режими "продолжить",
        // то менеджер вопросов ещё не знает какой вопрос был последний.
        // По этой причине менеджер вопросов не имеет состояния.
        // Можно вообще-то ему указать вопрос при инициализации, но
        // во-первых вопрос ему придётся сразу загрузить, что отложит загрузку приложения (ну и пусть).
        // а во-вторых настройка приложения станет более сложной для клиента.
        // let qm = null;
        // am.last().then(answer => {
        //  const q = new QuestionManager(api, answer.questionId);
        //  q.init().then() { // здесь будет загружен вопрос - теперь менеджер вопросов знает какой у него номер
        //      qm = q;
        //      dispatcher.dispatchEvent(new CustomEvent(QUESTION_MANAGER_INIT_EVENT);
        //  }
        // )
        this.am.last().then(answer => {
            this.qm.next(answer.questionId).then(question => {
                this.afterQuestionLoad(question);
            });
        });
    }

    prev() {
        this.setState({...this.state, isLoading: true});
        this.qm.prev(this.state.question.id).then(question => {
            this.afterQuestionLoad(question);
        });
    }

    afterQuestionLoad(question) {
        this.setState({...this.state, isLoading: false, question: question, opacity: 0, active: false});
        this.trigger(new CustomEvent(QUESTION_LOAD_EVENT, {
            detail: {
                number: question.number,
                target: this
            }
        }));
    }

    // Forward button clicked: save answer and load the next question
    goForwardHandler() {
        return this.save(null);
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

    async save(value) {
        this.am.add(this.state.question.id, value); // может быть даже сохранение следует поручить внешнему миру.
        this.trigger(new CustomEvent(ANSWER_RECEIVE_EVENT, {
            detail: {
                target: this,
                number: this.state.question.number
            }
        }));
    }

    // public
    continueQuiz() {
        if (this.state.question.number >= this.props.quizLength) {
            this.trigger(new CustomEvent(NO_MORE_QUESTIONS_EVENT, {detail: {number: this.state.question.number}}));
        } else {
            this.next();
        }
    }

    // public
    renderQuiz() {
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
                                      selectionHandler={this.save}
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