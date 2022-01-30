import React, {Component} from "react";
import NavigationButtons from "./NavigationButtons";

export default class FormRating extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options,
            values: []
        }

        this.options = this.options.bind(this);
    }

    clickHandler(value, index) {
        let values = this.state.values;
        values.push(value);

        let options = this.state.options;
        options.splice(index, 1);

        this.setState({values, options});

        if (options.length === 0) {
            this.props.selectionHandler(values)
        }
    }

    options() {
        return this.state.options.map((option, i) => {
            return (
                <div key={i} className={'tnc-q-form__option-wrapper'}>
                    <button
                        disabled={this.props.isLoading}
                        onClick={() => this.clickHandler(option.value, i)}
                        className={'tnc-btn tnc-q-form__option-btn'}>{option.text}</button>
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
                    enabledForward={this.props.enabledForward}
                    goForwardHandler={this.props.goForwardHandler}
                    goBackHandler={this.props.goBackHandler}/>
            </div>
        )
    }
}