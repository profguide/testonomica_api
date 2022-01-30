import React, {Component} from "react";

export default class Loading extends Component {
    render() {
        return (
            <article className={'tnc-q-loading'}>
                <h2 className={'tnc-q-loading__name tnc-stage'}/>
                <div className={'tnc-q-loading__form'}>
                    <div className={'tnc-q-loading__form-q tnc-q-loading__form-q_1 tnc-stage'}/>
                    <div className={'tnc-q-loading__form-q tnc-q-loading__form-q_2 tnc-stage'}/>
                </div>
                <div className={'tnc-q-loading__progress-bar tnc-stage'}/>
            </article>
        )
    }
}