import React, {Component} from "react";

export default class ProgressBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const percentage = (this.props.number - 1) * 100 / this.props.length

        return (
            <div className={'tnc-q__progress-bar tnc-q-progress-bar'}>
                <div className="tnc-q-progress-bar__counters">
                    <span>{this.props.number}</span>/<span>{this.props.length}</span>
                </div>
                <div className="tnc-q-progress-bar__line-wrapper">
                    <div
                        className="tnc-q-progress-bar__line"
                        role="progressbar"
                        style={{width: percentage + '%'}}
                        aria-valuenow={percentage}
                        aria-valuemin={percentage}
                        aria-valuemax="100"/>
                </div>
            </div>
        )
    }
}