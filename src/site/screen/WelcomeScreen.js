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
                        <Authors authors={this.props.test.authors} />
                        {buttons}
                    </div>
                </div>
            )
        }
    }
}

class Authors extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.authors) {
            return null;
        }
        if (this.props.authors.length === 0) {
            return null;
        }

        // let output = null;

        // if (this.props.authors.length === 1) {
        //     output = t('Автор теста:')
        // } else {
        //     output = t('Авторы теста:')
        // }

        // output += this.props.authors.map((author, i) => {
        //     const str = <a href="/">{author}</a>;
        //     // if (i+1 < this.props.test.authors.length) {
        //     //     output += ',';
        //     // }
        //     return str;
        // });

        // output += '.';

        return <div className={'tnc-welcome__description'}>
            {this.props.authors.length > 1 ? t('Авторы теста:') : t('Автор теста:')}
            {' '}
            {this.props.authors.map((author, key) => {
                return <span key={key}>
                    <a href={author.url}>{author.name}</a>
                    {key + 1 < this.props.authors.length ? ', ' : '.'}
                </span>
            })}
        </div>;
    }
}