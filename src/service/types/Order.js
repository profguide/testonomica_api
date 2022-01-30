export default class Order {
    constructor(id, description, price, count, sum) {
        this.id = id;
        this.description = description;
        this.price = price;
        this.count = count;
        this.sum = sum;
    }

    static createImmutable(id, description, price, count, sum) {
        const order = new Order(id, description, price, count, sum);
        Object.freeze(this);
        return order;
    }
}