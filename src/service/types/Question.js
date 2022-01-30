export default class Question {
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.text = props.text;
        this.img = props.img;
        this.type = props.type;
        this.count = props.count;
        this.timer = props.timer;
        this.enabledBack = props.enabledBack;
        this.enabledForward = props.enabledForward;
        this.number = props.number;
        this.length = props.length;
        this.options = props.options;
    }
}