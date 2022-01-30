import React, {Component} from "react";
import NavigationButtons from "./NavigationButtons";

/**
 * Первый и последний варианты ответа - это крайности,
 * между которыми находятся промежуточные значения
 */
export default class FormGradient extends Component {
    constructor(props) {
        super(props);
        this.options = this.options.bind(this);
    }

    options() {
        return this.props.options.map((option, i) => {
                return (
                    <div key={i} className={'tnc-q-form__option-wrapper'}>
                        <button
                            disabled={this.props.isLoading}
                            onClick={() => this.props.selectionHandler(option.value)}
                            className={'tnc-btn tnc-q-form__option-btn'}>{option.text}</button>
                    </div>
                )
            }
        )
    }

    render() {
        return (
            <div className={'tnc-q__form tnc-q-form'}>
                <div className={'tnc-q-form__options tnc-q-form__options_gradient'}>
                    {this.options()}
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