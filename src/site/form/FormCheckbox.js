import React, {Component} from "react";
import NavigationButtons from "./NavigationButtons";

export default class FormCheckbox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: props.options,
            values: [],
            enabledForward: false,
        }
        this.options = this.options.bind(this);
        this.goForwardHandler = this.goForwardHandler.bind(this);
    }

    clickHandler(value, index) {
        let values = this.state.values;
        const key = values.indexOf(value);
        if (key > -1) {
            // remove value
            values.splice(key, 1);
        } else {
            // add value
            values.push(value);
        }

        const enabledForward = values.length === this.props.count;
        this.setState({...this.state, values, enabledForward});
    }

    goForwardHandler() {
        this.props.goForwardHandler(this.state.values);
    }

    options() {
        return this.state.options.map((option, i) => {
            return (
                <div key={i} className={'tnc-q-form__option-wrapper'}>
                    {
                        option.img
                            ? <img src={option.img}
                                   style={{maxHeight: 100 + 'px'}}
                                   onClick={() => this.props.selectionHandler(option.value)}
                                   className={'tnc-q-form__option-img ' + + (this.state.values.includes(option.value) ? 'tnc-q-form__option-img_selected' : '')}
                                   alt={'Изображение'}/>
                            : <button
                                disabled={this.props.isLoading}
                                onClick={() => this.props.selectionHandler(option.value)}
                                className={'tnc-btn tnc-q-form__option-btn ' + (this.state.values.includes(option.value) ? 'tnc-q-form__option-btn_selected' : '')}>
                                {option.text}</button>
                    }
                    {/*<button*/}
                    {/*    disabled={this.props.isLoading}*/}
                    {/*    onClick={() => this.clickHandler(option.value, i)}*/}
                    {/*    className={'tnc-btn tnc-q-form__option-btn ' + (this.state.values.includes(option.value) ? 'tnc-q-form__option-btn_selected' : '')}>*/}
                    {/*    {option.text}</button>*/}
                </div>
            )
        })
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
                    enabledForward={this.state.enabledForward} // depend on count of selected options
                    goForwardHandler={this.goForwardHandler} // custom handler
                    goBackHandler={this.props.goBackHandler}/>
            </div>
        )
    }
}