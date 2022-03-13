import React, {useEffect, useState} from "react";
import {QUIZ_TASK_RESTORE, QUIZ_TASK_START, STATUS_FINISHED, STATUS_IN_PROGRESS} from "../const";
import {EVENT_FINISH, EVENT_LOADED, EVENT_RESIZE} from "../events";
import ResultScreen from "./screen/ResultScreen";
import WelcomeScreen from "./screen/WelcomeScreen";
import QuizScreen from "./screen/QuizScreen";
import PaymentScreen from "./screen/PaymentScreen";
import {t} from "../t";

const SCREEN_WELCOME = 'welcome';
const SCREEN_QUIZ = 'quiz';
const SCREEN_RESULT = 'result';
const SCREEN_PAYMENT = 'payment';

export default (props) => {
    const api = props.api;
    const config = props.config;
    const [state, changeState] = useState({
        isLoading: true,
        error: null,
        test: null,
        status: null,
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
            let reason = t('Произошла ошибка во время загрузки.');
            console.error(error);
            if (error.response) {
                console.error(error.response.data.detail);
                if (error.response.status === 403) {
                    reason = t('Отказано в доступе.');
                }
            }
            changeState({...state, isLoading: false, error: reason});
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

    // ComponentDidMount
    useEffect(() => {
        (new ResizeObserver(e => {
            trigger(new CustomEvent(EVENT_RESIZE, {detail: e}));
        })).observe(document.body);
        // load the test and check progress
        wrapRequest(api.description(), (test) => {
            api.progressStatus().then(async (status) => {
                // if test was over, but result was not save for some reason
                const isFull = await api.progressFull();
                if (isFull && status === STATUS_IN_PROGRESS) {
                    // save result and show the conclusion.
                    wrapRequest(api.saveResult(), (key) => {
                        trigger(new CustomEvent(EVENT_LOADED));
                        trigger(new CustomEvent(EVENT_FINISH, {detail: {key}}));
                        changeState({...state, status, isLoading: false, test, screen: SCREEN_RESULT});
                    })
                } else if (status === STATUS_FINISHED && config.isShowResultAfterLoad()) {
                    trigger(new CustomEvent(EVENT_LOADED));
                    changeState({...state, status, isLoading: false, test, screen: SCREEN_RESULT});
                } else {
                    trigger(new CustomEvent(EVENT_LOADED));
                    if (test.paid) {
                        changeState({...state, status, isLoading: false, test, screen: SCREEN_PAYMENT});
                    } else {
                        changeState({...state, status, isLoading: false, test, screen: SCREEN_WELCOME});
                    }
                }
            });
        });
    }, [])

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
                                   status={state.status}
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