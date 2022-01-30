import React, {useEffect, useState} from "react";
import {QUIZ_TASK_RESTORE, QUIZ_TASK_START, STATUS_FINISHED, STATUS_IN_PROGRESS} from "../const";
import ResultScreen from "./screen/ResultScreen";
import WelcomeScreen from "./screen/WelcomeScreen";
import QuizScreen from "./screen/QuizScreen";
import PaymentScreen from "./screen/PaymentScreen";

const SCREEN_WELCOME = 'welcome';
const SCREEN_QUIZ = 'quiz';
const SCREEN_RESULT = 'result';
const SCREEN_PAYMENT = 'payment';

export const EVENT_LOADED = 'loaded';
export const EVENT_RESIZE = 'resize';
export const EVENT_FINISH = 'finish';

export default (props) => {
    const api = props.api;
    const [state, changeState] = useState({
        isLoading: true,
        error: null,
        test: null,
        screen: null,
        quizTask: null,
        mainDivRef: null,
    });

    const trigger = (e) => {
        if (props.dispatcher) {
            props.dispatcher.dispatchEvent(e);
        }
    }

    const wrapRequest = (promise, callback) => {
        promise.then(callback).catch(error => {
            let reason = 'Произошла ошибка во время загрузки.';
            if (error.response.status === 403) {
                reason = 'Отказано в доступе.';
            }
            changeState({...state, isLoading: false, error: reason});
            console.error(error.response.data.detail);
            console.error(error);
        });
    }

    const whenClickRestore = () => {
        changeState({...state, screen: SCREEN_QUIZ, quizTask: QUIZ_TASK_RESTORE});
    }

    const whenClickStart = () => {
        changeState({...state, screen: SCREEN_QUIZ, quizTask: QUIZ_TASK_START});
    }

    const whenQuestionsOver = () => {
        changeState({...state, isLoading: true});
        wrapRequest(api.saveResult(), (key) => {
            trigger(new CustomEvent(EVENT_FINISH, {detail: {key}}));
            changeState({...state, isLoading: false, screen: SCREEN_RESULT});
        });
    }

    const whenAccessed = () => {
        changeState({...state, isLoading: false, screen: SCREEN_WELCOME});
    }

    useEffect(() => {
        (new ResizeObserver(e => {
            trigger(new CustomEvent(EVENT_RESIZE, {detail: e}));
        })).observe(document.body);
        // load the test and check progress
        wrapRequest(api.description(), (test) => {
            // if test was over, but result was not save for some reason
            if (api.progressFull() && api.progressStatus() === STATUS_IN_PROGRESS) {
                // save result and show the conclusion.
                wrapRequest(api.saveResult(), (key) => {
                    trigger(new CustomEvent(EVENT_LOADED));
                    trigger(new CustomEvent(EVENT_FINISH, {detail: {key}}));
                    changeState({...state, isLoading: false, test: test, screen: SCREEN_RESULT});
                })
            } else if (api.progressStatus() === STATUS_FINISHED) {
                trigger(new CustomEvent(EVENT_LOADED));
                changeState({...state, isLoading: false, test: test, screen: SCREEN_RESULT});
            } else {
                trigger(new CustomEvent(EVENT_LOADED));
                if (test.paid) {
                    changeState({...state, isLoading: false, test: test, screen: SCREEN_PAYMENT});
                } else {
                    changeState({...state, isLoading: false, test: test, screen: SCREEN_WELCOME});
                }
            }
        });
    }, []) // ex ComponentDidMount

    if (state.isLoading) {
        return null;
    }
    if (state.error) {
        return state.error;
    }

    if (state.screen === SCREEN_PAYMENT) {
        return <PaymentScreen api={api} onAccessed={whenAccessed} dispatcher={props.dispatcher}/>;
    }

    if (!state.test) {
        return null;
    }

    return (
        <div id={'tnc'} className={'tnc'}>
            <div className={'container'}>
                {state.screen === SCREEN_RESULT ?
                    <ResultScreen api={api} test={state.test} restartClickHandler={whenClickStart}/> : null
                }
                {state.screen === SCREEN_WELCOME ?
                    <WelcomeScreen test={state.test}
                                   status={api.progressStatus()}
                                   startClickHandler={whenClickStart}
                                   restoreClickHandler={whenClickRestore}/> : null
                }
                {state.screen === SCREEN_QUIZ ?
                    <QuizScreen testId={api.testId}
                                api={api}
                                questionsOverHandler={whenQuestionsOver}
                                task={state.quizTask}/> : null
                }
            </div>
        </div>
    )
}