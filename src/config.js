import {
    INIT_AUTO,
    INIT_MANUAL,
    START_SCREEN_API,
    START_SCREEN_LIVE,
    START_SCREEN_RESTORE,
    START_SCREEN_START
} from "./const";

export default class Config {
    testId;
    host;
    token;
    init;

    /**
     * Start screen parameter
     * none - skip start screen
     * api - show screen from API
     * live - use inner content of tag and replace substrings by regular expressions, e.g. <buttons></buttons>
     */
    startScreen;

    /**
     * Whether to show result in the end
     */
    displayReport;

    /**
     * Whether to show result on page reload
     */
    showResultAfterLoad;

    constructor(props) {
        this.testId = Config.confTestId(props);
        this.host = Config.confHost(props);
        this.token = Config.confToken(props);
        this.init = Config.confInit(props);
        this.startScreen = Config.confStartScreen(props);
        this.displayReport = Config.confDisplayReport(props);
        this.showResultAfterLoad = Config.confShowResultAfterLoad(props);
    }

    getTestId() {
        return this.testId;
    }

    getHost() {
        return this.host;
    }

    getInit() {
        return this.init;
    }

    getToken() {
        return this.token;
    }

    isDisplayReport() {
        return this.displayReport;
    }

    isShowResultAfterLoad() {
        return this.showResultAfterLoad;
    }

    getStartScreen() {
        return this.startScreen;
    }

    static confTestId(props) {
        return Config.textValue('testId', props['testId']);
    }

    static confHost(props) {
        return Config.textValue('host', props['host']);
    }

    static confToken(props) {
        return props['token'];
    }

    static confInit(props) {
        return Config.textValue('init', props['init'], [INIT_AUTO, INIT_MANUAL]);
    }

    static confStartScreen(props) {
        return Config.textValue(
            'startScreen',
            props['startScreen'],
            [START_SCREEN_API, START_SCREEN_LIVE, START_SCREEN_START, START_SCREEN_RESTORE],
            START_SCREEN_API);
    }

    static confDisplayReport(props) {
        if (props.hasOwnProperty('displayReport')) {
            return Config.isTrue(props.displayReport);
        } else {
            return true;
        }
    }

    static confShowResultAfterLoad(props) {
        if (props.hasOwnProperty('showResultAfterLoad')) {
            return Config.isTrue(props.showResultAfterLoad);
        } else {
            return true;
        }
    }

    static isTrue(str) {
        return str === true || str === 'true' || str === '1' || str === 1;
    }

    static textValue(paramName, value, availableValues, defaultValue) {
        if (!value) {
            if (defaultValue) {
                return defaultValue;
            }
            throw new Error(`InvalidArgumentException: missing config property ${paramName}.`);
        }
        if (availableValues) {
            if (availableValues.includes(value)) {
                return value;
            }
            throw new Error(`InvalidArgumentException: config param ${paramName} contains unsupported value "${value}".`);
        }
        return value;
    }
}