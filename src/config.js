export default class Config {
    // #skipWelcome/autoStart/displayWelcome
    #displayReport;
    #showResultAfterLoad;

    constructor(props) {
        if (props.hasOwnProperty('displayReport')) {
            this.#displayReport = Config.isTrue(props.displayReport);
        } else {
            this.#displayReport = true;
        }

        if (props.hasOwnProperty('showResultAfterLoad')) {
            this.#showResultAfterLoad = Config.isTrue(props.showResultAfterLoad);
        } else {
            this.#showResultAfterLoad = true;
        }
    }

    isDisplayReport() {
        return this.#displayReport;
    }

    isShowResultAfterLoad() {
        return this.#showResultAfterLoad;
    }

    static isTrue(str) {
        return str === true || str === 'true' || str === '1' || str === 1;
    }
}