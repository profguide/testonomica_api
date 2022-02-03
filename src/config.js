export default class Config {
    #showResultAfterLoad;

    constructor(props) {
        if (props.hasOwnProperty('showResultAfterLoad')) {
            this.#showResultAfterLoad = Config.isTrue(props.showResultAfterLoad);
        } else {
            this.#showResultAfterLoad = true;
        }
    }

    isShowResultAfterLoad() {
        return this.#showResultAfterLoad;
    }

    static isTrue(str) {
        return str === true || str === 'true' || str === '1' || str === 1;
    }
}