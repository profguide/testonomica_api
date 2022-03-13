import React, {Component} from "react";
import NavigationButtons from "./NavigationButtons";
import {t} from "../../t";

/**
 * Первый и последний варианты ответа - это крайности,
 * между которыми находятся промежуточные значения
 */
export default class FormGradient extends Component {
    constructor(props) {
        super(props);
        this.options = this.options.bind(this);
    }

    name(n) {
        if (n === 1 || n === 3) {
            return t('Частично описывает меня');
        }
        return t('Нейтрально');
    }

    options() {
        return this.props.options.map((option, i) => {
                return (
                    <div key={i} className={'tnc-q-form__option-wrapper'}
                         onClick={() => this.props.selectionHandler(option.value)}>
                        <button
                            disabled={this.props.isLoading}
                            className={'tnc-btn tnc-q-form__option-btn'}>
                        </button>
                        {/* если 2 и 4, то Точно описывает меня, если 3, то Нейтрально */}
                        <span className="tnc-q-form__option-name">{i === 0 || i === 4 ? option.text : this.name(i)}</span>
                    </div>
                )
            }
        )
    }

    render() {
        return (
            <div className="tnc-q__form tnc-q-form tnc-form-gradient">
                <div className="tnc-form-gradient__compared">
                    <div className="tnc-form-gradient__compared-item">{this.props.options[0].text}</div>
                    <div
                        className="tnc-form-gradient__compared-item">{this.props.options[this.props.options.length - 1].text}</div>
                </div>
                <div className="tnc-q-form__options">
                    {this.options()}
                </div>
                <div className="tnc-form-gradient__values">
                    <div className="tnc-form-gradient__values-item">{t('Точно описывает меня')}</div>
                    <div className="tnc-form-gradient__values-item">{t('Нейтрально')}</div>
                    <div className="tnc-form-gradient__values-item">{t('Точно описывает меня')}</div>
                </div>
                <NavigationButtons
                    isLoading={this.props.isLoading}
                    enabledBack={this.props.enabledBack}
                    enabledForward={this.props.enabledForward}
                    goForwardHandler={this.props.goForwardHandler}
                    goBackHandler={this.props.goBackHandler}/>
            </div>
        )
    }
}