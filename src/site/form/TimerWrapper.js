import React, {Component} from "react";

export default class TimerWrapper extends Component {
    constructor(props) {
        super(props);

        this.interval = null;

        this.state = {
            timer: props.timer > 0 ? props.timer : null,
            timeOut: false
        }

        this.timeOut = this.timeOut.bind(this);
    }

    componentDidMount() {
        if (!this.state.timer) {
            return;
        }
        console.log('timer', this.state.timer)
        const context = this;
        this.interval = setInterval(function () {
            if (context.state.timer > 1) {
                context.setState({...context.state, timer: context.state.timer - 1})
            } else {
                clearInterval(context.interval);
                context.timeOut();
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    timeOut() {
        console.log('timeout')
        this.setState({...this.state, timeOut: true})
    }

    render() {
        if (this.state.timeOut) {
            return (
                <div>
                    <p>Закончилось время, отведённое на вопрос ({this.props.timer} секунд).
                        Нажмите кнопку продолжить, когда будете готовы продолжить тест.</p>
                    <button onClick={this.props.goForwardHandler} className="btn btn-primary">Продолжить</button>
                </div>
            )
        } else {
            return this.props.children;
        }
    }
}