import React, {Component} from "react";
import parse from 'html-react-parser';
import {START_SCREEN_LIVE, STATUS_IN_PROGRESS} from "../../const";
import {t} from "../../t";

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
                        {t('Продолжить тест')}
                    </button>
                    <button
                        onClick={this.props.restartClickHandler}
                        className={'tnc-btn tnc-welcome__btn tnc-welcome__btn_restart'}>
                        {t('Начать сначала')}
                    </button>
                </div>
            )
        } else { // STATUS_NONE
            buttons = (
                <div className={'tnc-welcome__btns'}>
                    <button
                        onClick={this.props.startClickHandler}
                        className={'tnc-btn tnc-welcome__btn tnc-welcome__btn_start'}>
                        {t('Начать')}
                    </button>
                </div>
            )
        }

        // Использовать текст из тега с подстановкой кнопок
        if (this.props.startScreenConfig === START_SCREEN_LIVE) {
            let content = this.props.content;
            return (
                <div className={'tnc-welcome'}>
                    {parse(content, {
                        replace: domNode => {
                            // <div id="testonomica_buttons"></div> will be replaced with real buttons
                            if (domNode.attribs && domNode.attribs.id === 'testonomica_buttons') {
                                return buttons;
                            }
                        }
                    })}
                </div>
            )

        } else {
            return (
                <div className={'tnc-welcome'}>
                    <div className="container">
                        <h1 className={'tnc-welcome__title'}>{this.props.test.name}</h1>
                        <div className={'tnc-welcome__duration'}>{this.props.test.duration} {t('минут')}</div>
                        <div className={'tnc-welcome__description'}
                             dangerouslySetInnerHTML={{__html: this.props.test.description}}/>
                        {buttons}
                    </div>
                </div>
            )
        }
    }
}
