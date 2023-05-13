import React from "react";
import {
    RESTORE_QUIZ_COMMAND,
    START_QUIZ_COMMAND,
    START_SCREEN_RESTORE,
    START_SCREEN_START,
    STATUS_FINISHED
} from "../const";
import {CLICK_RESTART_EVENT, CLICK_START_EVENT, EVENT_LOADED} from "../events";
import ResultScreen from "./screen/ResultScreen";
import WelcomeScreen from "./screen/WelcomeScreen";
import QuizScreen from "./screen/QuizScreen";
import {t} from "../t";

const WELCOME_SCREEN = 'welcome';
const QUIZ_SCREEN = 'quiz';
const RESULT_SCREEN = 'result';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        // конфиг (только значения)
        this.config = props.config;

        // Изначальное содержимое тега
        this.content = props.content;

        this.state = {
            status: null, // affects buttons on welcome screen
            screen: null,
            quizTask: null
        }

        // Event dispatcher
        this.dispatcher = props.dispatcher;

        this.startClickHandler = this.startClickHandler.bind(this);
        this.restartClickHandler = this.restartClickHandler.bind(this);
        this.restoreClickHandler = this.restoreClickHandler.bind(this);
    }

    trigger(e) {
        if (this.dispatcher) {
            this.dispatcher.dispatchEvent(e);
        }
    }

    // public: whether to save on wow or not in responsibility of client
    // todo move to client
    // saveProgress() {
    //     this.setState({...this.state, screen: LOADING_SCREEN});
    //     this.wrapRequest(this.api.saveResult(), (key) => {
    //         this.trigger(new CustomEvent(EVENT_FINISH, {detail: {key}}));
    //         this.setState({...this.state, isLoading: false, screen: RESULT_SCREEN});
    //     });
    // }

    startClickHandler() {
        this.trigger(new CustomEvent(CLICK_START_EVENT));
    }

    restartClickHandler() {
        this.trigger(new CustomEvent(CLICK_RESTART_EVENT));
    }

    restoreClickHandler() {
        this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: RESTORE_QUIZ_COMMAND});
    }

    start() {
        this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: START_QUIZ_COMMAND});
    }

    componentDidMount() {
        this.trigger(new CustomEvent(EVENT_LOADED));

        this.props.am.status().then(async status => {
            if (this.config.startScreen === START_SCREEN_RESTORE) { // продолжить
                this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: RESTORE_QUIZ_COMMAND});
            } else if (this.config.startScreen === START_SCREEN_START) { // начать с начала
                this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: START_QUIZ_COMMAND});
            } else if (status === STATUS_FINISHED && this.config.isShowResultAfterLoad()) { // завершён
                this.setState({...this.state, status, screen: RESULT_SCREEN});
            } else { // не начат
                this.setState({...this.state, status, screen: WELCOME_SCREEN});
            }
        });
    }

    render() {
        const resultScreen = () => {
            if (this.config.isDisplayReport()) {
                return (
                    <ResultScreen api={this.api} test={this.props.test} restartClickHandler={this.restartClickHandler}/>
                );
            }
            return (
                <div className="container"><i>{t('Результат обрабатывается...')}</i></div>
            );
        }

        return (
            <div id={'tnc'} className={'tnc'}>
                {
                    this.state.screen === WELCOME_SCREEN &&
                    <WelcomeScreen
                        test={this.props.test}
                        status={this.state.status}
                        startScreenConfig={this.config.getStartScreen()}
                        content={this.content}
                        startClickHandler={this.startClickHandler}
                        restartClickHandler={this.restartClickHandler}
                        restoreClickHandler={this.restoreClickHandler}/>
                }
                {
                    this.state.screen === QUIZ_SCREEN &&
                    (this.quiz = <QuizScreen
                        testId={this.props.test.id}
                        quizLength={this.props.test.length}
                        qm={this.props.qm}
                        am={this.props.am}
                        dispatcher={this.dispatcher}
                        task={this.state.quizTask}/>)
                }
                {
                    this.state.screen === RESULT_SCREEN && resultScreen()
                }
            </div>
        )
    }
}