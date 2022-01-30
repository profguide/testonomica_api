import React, {Component} from "react";
import {STATUS_IN_PROGRESS} from "../../const";

export default class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let buttons;
        if (this.props.status === STATUS_IN_PROGRESS) {
            buttons = (
                <div className={'tnc-welcome__btns'}>
                    <button
                        onClick={this.props.restoreClickHandler}
                        className={'tnc-btn tnc-welcome__btn tnc-welcome__btn_restore'}>
                        Продолжить тест
                    </button>
                    <button
                        onClick={this.props.startClickHandler}
                        className={'tnc-btn tnc-welcome__btn tnc-welcome__btn_restart'}>
                        Начать сначала
                    </button>
                </div>
            )
        } else { // STATUS_NONE
            buttons = (
                <div className={'tnc-welcome__btns'}>
                    <button
                        onClick={this.props.startClickHandler}
                        className={'tnc-btn tnc-welcome__btn tnc-welcome__btn_start'}>
                        Начать
                    </button>
                </div>
            )
        }
        return (
            <div className={'tnc-welcome'}>
                <h1 className={'tnc-welcome__title'}>{this.props.test.name}</h1>
                <div className={'tnc-welcome__duration'}>{this.props.test.duration} минут</div>
                <div className={'tnc-welcome__description'} dangerouslySetInnerHTML={{__html: this.props.test.description}}/>
                {buttons}
            </div>
        )
    }
}
