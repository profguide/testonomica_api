import React, {Component} from "react";
import parse from 'html-react-parser';
import {START_SCREEN_LIVE, STATUS_IN_PROGRESS} from "../../const";
import {t} from "../../t";

export default class InstructionScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={'tnc-instruction'}>
                <div className="container">
                    <h1 className={'tnc-instruction__title'}>{this.props.test.name}</h1>
                    <p className={'tnc-instruction__subtitle'}>{t('Инструкция')}</p>
                    <div className={'tnc-instruction__text'}
                         dangerouslySetInnerHTML={{__html: this.props.test.instruction}}/>
                    <button className={'tnc-instruction__btn tnc-btn'} onClick={this.props.startClickHandler}>{t('Начать тест')}</button>
                </div>
            </div>
        )
    }
}