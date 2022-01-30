import React, {Component} from "react";

export default class NavigationButtons extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let back = null;
        let forward = null;

        if (this.props.enabledBack) {
            back = (
                <button
                    disabled={this.props.isLoading}
                    onClick={this.props.goBackHandler}
                    className={'tnc-btn tnc-q-nav__btn tnc-q-nav__btn_back'}>
                    &larr;
                </button>
            )
        }
        if (this.props.enabledForward) {
            forward = (
                <button
                    disabled={this.props.isLoading}
                    onClick={this.props.goForwardHandler}
                    className={'tnc-btn tnc-q-nav__btn tnc-q-nav__btn_forward'}>
                    &rarr;
                </button>
            )
        }

        return (
            <div className={'tnc-q-form__nav tnc-q-nav'}>
                {back} {forward}
            </div>
        )
    }
}