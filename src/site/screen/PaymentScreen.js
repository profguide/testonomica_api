import React from "react";
import Cloudpayments from "../../payments/Cloudpayments";

export default class PaymentScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isOpened: false,
            error: null,
        }

        this.onSuccess = this.onSuccess.bind(this);
        this.onFail = this.onFail.bind(this);
        this.initPaymentWidget = this.initPaymentWidget.bind(this);
        this.setBodyHeightAuto = this.setBodyHeightAuto.bind(this);
        this.setBodyFixHeight = this.setBodyFixHeight.bind(this);
    }

    componentDidMount() {
        this.wrapRequest(this.props.api.hasAccess(), accessed => {
            this.setState({...this.state, isLoading: false});
            if (accessed) {
                this.props.onAccessed();
            } else {
                this.initPaymentWidget();
            }
        });
    }

    componentWillUnmount() {
        this.setBodyHeightAuto();
    }

    initPaymentWidget() {
        this.setState({...this.state, isLoading: true});
        this.wrapRequest(this.props.api.getOrder(), order => {
            this.setBodyFixHeight();
            new Cloudpayments(
                order.id,
                order.description,
                order.price,
                order.count,
                order.sum,
                this.onSuccess,
                this.onFail
            );
            this.setState({...this.state, isOpened: true, isLoading: false});
        });
    }

    onSuccess() {
        this.setBodyHeightAuto();
        this.setState({...this.state, isOpened: false});
        this.wrapRequest(this.props.api.grand(), () => {
            this.props.onAccessed();
        });
    }

    onFail() {
        this.setBodyHeightAuto();
        this.setState({...this.state, isOpened: false});
    }

    // for iframe
    setBodyFixHeight() {
        document.body.style.height = '600px'; // Cloudpayments widget height + offsets
    }

    // for iframe
    setBodyHeightAuto() {
        document.body.style.height = 'auto';
    }

    wrapRequest(promise, callback) {
        promise.then(callback).catch(error => {
            let reason = 'Произошла ошибка во время загрузки.';
            if (error.response.status === 403) {
                reason = 'Отказано в доступе.';
            }
            this.setState({...this.state, isLoading: false, error: reason});
            console.error(error.response.data.detail);
            console.error(error);
        });
    }

    render() {
        if (this.state.error) {
            return (
                <div className="container">
                    {this.state.error}
                </div>
            )
        }

        if (this.state.isLoading) {
            return null;
            // return (
            //     <div className="container">
            //         Загрузка платёжного виджета
            //     </div>
            // )
        }

        if (!this.state.isOpened) {
            return (
                <div className="container">
                    <div>Требуется оплата.</div>
                    <button className={'btn btn-primary'} onClick={this.initPaymentWidget}>Нажмите, чтобы перейти к
                        оплате
                    </button>
                </div>
            )
        }

        return null;
    }

}