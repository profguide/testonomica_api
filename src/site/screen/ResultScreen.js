import React, {Component} from "react";

export default class ResultScreen extends Component {
    constructor(props) {
        super(props);
        this.api = props.api;
        this.state = {
            error: null,
            isLoading: true,
            result: null
        }
    }

    componentDidMount() {
        this.api.result().then(response => {
            this.setState({...this.state, isLoading: false, result: response.data});
        }).catch(error => {
            console.error(error);
            this.setState({...this.state, isLoading: false, error: 'Произошла ошибка во время загрузки результата.'});
        });
    }

    render() {
        if (this.state.isLoading) {
            return 'Загрузка результата...';
        } else if (this.state.error) {
            return this.state.error;
        }

        const url = 'https://testonomica.com/tests/result/' + this.api.resultKey() + '/';
        return (
            <div className={'tnc-result'}>
                <h1 className={'tnc-result__title'}>{this.props.test.name}</h1>
                <h2 className={'tnc-result__subtitle'}>Ваши результаты:</h2>
                <article className={'tnc-result__text'} dangerouslySetInnerHTML={{__html: this.state.result}}/>
                <p><span style={{fontWeight: 'bold'}}>Постоянная ссылка на результат:</span><br/>
                    <a href={url}>{url}</a></p>
                <button
                    onClick={this.props.restartClickHandler}
                    className={'tnc-btn tnc-result__btn-restart'}>
                    Пройти тест заново
                </button>
            </div>
        )
    }
}
