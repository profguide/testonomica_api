import React from "react";
import {
    RESTORE_QUIZ_COMMAND,
    START_QUIZ_COMMAND,
    START_SCREEN_RESTORE,
    START_SCREEN_START,
    STATUS_FINISHED
} from "../const";
import {EVENT_FINISH, EVENT_LOADED, QUESTIONS_OVER_EVENT} from "../events";
import ResultScreen from "./screen/ResultScreen";
import WelcomeScreen from "./screen/WelcomeScreen";
import QuizScreen from "./screen/QuizScreen";
import PaymentScreen from "./screen/PaymentScreen";
import {t} from "../t";

const WELCOME_SCREEN = 'welcome';
const QUIZ_SCREEN = 'quiz';
const RESULT_SCREEN = 'result';
const PAYMENT_SCREEN = 'payment';

/**
 * Нужно много переделать.
 * Причина:
 * 1. сильная связанность компонентов - API, storage (это можно зарефакторить)
 * 2. единоразовая загрузка вопросов (это можно зарефакторить)
 * 3. нужно передать управление клиенту - чтобы был конструктор (сделано много)
 *
 * Можно всё рефакторить постепенно. К счастью App обёрнут.
 */
export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.api = props.api;

        // конфиг (только значения)
        this.config = props.config;

        // Изначальное содержимое тега
        this.content = props.content;

        this.state = {
            isLoading: true, // меня бесит эта штука. лучше её заменить на экран LOADING_SCREEN
            error: null,
            test: null,
            status: null,
            screen: null,
            quizTask: null,
            mainDivRef: null,
        }

        // Event dispatcher
        this.dispatcher = props.dispatcher;

        this.whenClickStart = this.whenClickStart.bind(this);
        this.whenClickRestore = this.whenClickRestore.bind(this);
        this.whenQuestionsOver = this.whenQuestionsOver.bind(this);
    }

    trigger(e) {
        if (this.dispatcher) {
            this.dispatcher.dispatchEvent(e);
        }
    }

    // public
    loading(isLoading = true) {
        this.setState({...this.state, isLoading});
    }

    savingScreen() {
        this.setState(state => {
            return {...state, isLoading: true}
        });
        // this.setState({...this.state, isLoading: true, screen: SAVING_SCREEN});
    }

    // public: whether to save on wow or not in responsibility of client
    saveProgress() {
        this.setState({...this.state, isLoading: true});
        this.wrapRequest(this.api.saveResult(), (key) => {
            this.trigger(new CustomEvent(EVENT_FINISH, {detail: {key}}));
            this.setState({...this.state, isLoading: false, screen: RESULT_SCREEN});
        });
    }

    wrapRequest(promise, callback) {
        promise.then(callback).catch(error => {
            let reason = t('Произошла ошибка во время загрузки.');
            console.error(error);
            if (error.response) {
                console.error(error.response.data.detail);
                if (error.response.status === 403) {
                    reason = t('Отказано в доступе.');
                }
            }
            this.setState({...this.state, isLoading: false, error: reason});
        });
    }

    whenClickStart() {
        this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: START_QUIZ_COMMAND});
    }

    whenClickRestore() {
        this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: RESTORE_QUIZ_COMMAND});
    }

    whenQuestionsOver() {
        this.trigger(new CustomEvent(QUESTIONS_OVER_EVENT));
    }

    whenAccessed() {
        this.setState({...this.state, isLoading: false, screen: WELCOME_SCREEN});
    }

    componentDidMount() {
        this.wrapRequest(this.api.description(), (test) => {
            // это не срабатывает при загрузке страницы. видимо это надо загружать раньше.
            // check version: if test.version !== this.api.answersVersion() {
            //  alert('Версия теста поменялась.');
            // }

            if (this.config.startScreen === START_SCREEN_RESTORE) {
                this.trigger(new CustomEvent(EVENT_LOADED));
                this.setState({
                    ...this.state,
                    test,
                    screen: QUIZ_SCREEN,
                    isLoading: false,
                    quizTask: RESTORE_QUIZ_COMMAND
                });
            } else if (this.config.startScreen === START_SCREEN_START) {
                this.trigger(new CustomEvent(EVENT_LOADED));
                this.setState({
                    ...this.state,
                    test,
                    screen: QUIZ_SCREEN,
                    isLoading: false,
                    quizTask: START_QUIZ_COMMAND
                });
            } else { // welcome-screen включен
                this.api.progressStatus().then(async (status) => {
                    if (status === STATUS_FINISHED && this.config.isShowResultAfterLoad()) {
                        // закончен: показываем результат
                        this.trigger(new CustomEvent(EVENT_LOADED));
                        this.setState({...this.state, status, isLoading: false, test, screen: RESULT_SCREEN});
                    } else {
                        // не начат
                        this.trigger(new CustomEvent(EVENT_LOADED));
                        this.setState({...this.state, status, isLoading: false, test, screen: WELCOME_SCREEN});
                    }
                });
            }
        });
    }

    render() {
        if (this.state.isLoading) {
            return null;
        }

        if (this.state.error) {
            return this.state.error;
        }

        if (!this.state.test) {
            return null;
        }

        const resultScreen = () => {
            if (this.config.isDisplayReport()) {
                return <ResultScreen api={this.api} test={this.state.test} restartClickHandler={this.whenClickStart}/>
            }
            return <div className="container">{t('Результат обрабатывается...')}</div>;
        }

        return (
            <div id={'tnc'} className={'tnc'}>
                {
                    this.state.screen === PAYMENT_SCREEN &&
                    <PaymentScreen api={this.api} onAccessed={this.whenAccessed} dispatcher={this.dispatcher}/>
                }

                {
                    this.state.screen === WELCOME_SCREEN &&
                    <WelcomeScreen test={this.state.test}
                                   status={this.state.status}
                                   startScreenConfig={this.config.getStartScreen()}
                                   content={this.content}
                                   startClickHandler={this.whenClickStart}
                                   restoreClickHandler={this.whenClickRestore}/>
                }

                {
                    this.state.screen === QUIZ_SCREEN &&
                    (this.quiz = <QuizScreen testId={this.api.testId}
                                             api={this.api}
                                             dispatcher={this.dispatcher}
                                             questionsOverHandler={this.whenQuestionsOver}
                                             task={this.state.quizTask}/>)
                }

                {
                    this.state.screen === RESULT_SCREEN && resultScreen()
                }
            </div>
        )
    }
}