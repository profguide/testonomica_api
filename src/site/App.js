import React from "react";
import {RESTORE_QUIZ_COMMAND, START_QUIZ_COMMAND, START_SCREEN_RESTORE, START_SCREEN_START} from "../const";
import {
    CLICK_ANY_START_EVENT,
    CLICK_RESTART_EVENT,
    CLICK_RESTORE_EVENT,
    CLICK_START_EVENT,
    EVENT_LOADED,
    STATUS_LOADED_EVENT
} from "../events";
import WelcomeScreen from "./screen/WelcomeScreen";
import InstructionScreen from "./screen/InstructionScreen";
import QuizScreen from "./screen/QuizScreen";

const WELCOME_SCREEN = 'welcome';
const INSTRUCTION_SCREEN = 'instruction';
const QUIZ_SCREEN = 'quiz';

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
        this.instructionDoneClickHandler = this.instructionDoneClickHandler.bind(this);
        this.start = this.start.bind(this);
    }

    trigger(e) {
        if (this.dispatcher) {
            this.dispatcher.dispatchEvent(e);
        }
    }

    startClickHandler() {
        this.trigger(new CustomEvent(CLICK_ANY_START_EVENT));
        this.trigger(new CustomEvent(CLICK_START_EVENT));
    }

    restartClickHandler() {
        this.trigger(new CustomEvent(CLICK_ANY_START_EVENT));
        this.trigger(new CustomEvent(CLICK_RESTART_EVENT));
    }

    restoreClickHandler() {
        this.trigger(new CustomEvent(CLICK_ANY_START_EVENT));
        this.trigger(new CustomEvent(CLICK_RESTORE_EVENT));
    }

    start() {
        // the instruction screen runs only if start/restart buttons where clicked,
        // this is because restoreClickHandler starts test directly,
        // this logic seems to me appropriate for now,
        // however, if you want to run the instruction in every case then consider doing,
        // some changes in the restoreClickHandler in a way,
        // it checked test.instruction before running the quiz.
        if (this.props.test.instruction) {
            this.setState({...this.state, screen: INSTRUCTION_SCREEN});
        } else {
            this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: START_QUIZ_COMMAND});
        }
    }

    restore() {
        this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: RESTORE_QUIZ_COMMAND});
    }

    instructionDoneClickHandler() {
        this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: START_QUIZ_COMMAND});
    }

    componentDidMount() {
        this.trigger(new CustomEvent(EVENT_LOADED));

        this.props.am.status().then(async status => {
            this.trigger(new CustomEvent(STATUS_LOADED_EVENT, {detail: {status}}));
            if (this.config.startScreen === START_SCREEN_RESTORE) { // продолжить
                this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: RESTORE_QUIZ_COMMAND});
            } else if (this.config.startScreen === START_SCREEN_START) { // начать сначала
                this.setState({...this.state, screen: QUIZ_SCREEN, quizTask: START_QUIZ_COMMAND});
            } else { // не начат
                this.setState({...this.state, status, screen: WELCOME_SCREEN});
            }
        });
    }

    render() {
        return (
            <div id={'tnc'} className={'tnc'}>
                {
                    this.state.screen === WELCOME_SCREEN &&
                    <WelcomeScreen
                        test={this.props.test}
                        status={this.state.status}
                        startScreenConfig={this.config.startScreen}
                        content={this.content}
                        startClickHandler={this.startClickHandler}
                        restartClickHandler={this.restartClickHandler}
                        restoreClickHandler={this.restoreClickHandler}/>
                }
                {
                    this.state.screen === INSTRUCTION_SCREEN &&
                    <InstructionScreen
                        test={this.props.test}
                        startClickHandler={this.instructionDoneClickHandler}/>
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
            </div>
        )
    }
}