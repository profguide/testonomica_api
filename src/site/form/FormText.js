import React, {Component} from "react";
import NavigationButtons from "./NavigationButtons";

export default class FormText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            values: []
        };

        this.options = this.options.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onChange(value, index) {
        const values = this.state.values;
        values[index] = value;
        this.setState({values})
    }

    options() {
        return this.props.options.map((option, index) => {
            return (
                <div key={index} className={'tnc-q-form__option-wrapper'}>
                    <input
                        disabled={this.props.isLoading}
                        onChange={(e) => this.onChange(e.target.value, index)}
                        placeholder={option.text}
                        value={this.state.values[index] ?? ''}
                        className={'tnc-q-form__option-text'}/>
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
                    enabledForward={true}
                    goForwardHandler={() => this.props.selectionHandler(this.state.values)}
                    goBackHandler={this.props.goBackHandler}/>
            </div>
        )
    }
}