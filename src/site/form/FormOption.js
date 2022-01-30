import React, {Component} from "react";
import NavigationButtons from "./NavigationButtons";

export default class FormOption extends Component {
    constructor(props) {
        super(props);
        this.options = this.options.bind(this);
    }

    options() {
        return this.props.options.map((option, i) => {
                return (
                    <div key={i} className={'tnc-q-form__option-wrapper'}>
                        {
                            option.img
                                ? <img src={option.img}
                                       style={{maxHeight: 100 + 'px'}}
                                       onClick={!this.props.isLoading ? () => this.props.selectionHandler(option.value) : null}
                                       className={'tnc-q-form__option-img'}
                                       alt={'Изображение'}/>
                                : <button
                                    disabled={this.props.isLoading}
                                    onClick={() => this.props.selectionHandler(option.value)}
                                    className={'tnc-btn tnc-q-form__option-btn'}>{option.text}</button>
                        }

                    </div>
                )
            }
        )
    }

    render() {
        return (
            <div className={'tnc-q__form tnc-q-form'}>
                <div className={'tnc-q-form__options'}>
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