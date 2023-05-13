export default class Progress {
    data: Map<number, Array<any>>;

    constructor(data: Map<number, Array<any>>) {
        this.data = data;
    }

    get(): Map<number, Array<any>> {
        return this.data;
    }
}