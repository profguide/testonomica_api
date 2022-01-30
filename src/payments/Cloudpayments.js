export default function (
    invoiceId,
    description,
    price,
    count,
    sum,
    onSuccess,
    onFail,
    onComplete,
) {
    if (typeof onComplete !== 'function') {
        onComplete = function () {
        }
    }

    const receipt = {
        "Items": [
            {
                "label": description, //наименование товара
                "price": price, //цена
                "quantity": count, //количество
                "amount": sum, //сумма
                "vat": 0, //ставка НДС
                "method": 1, // предоплата
                "object": 4, // услуга
                "measurementUnit": "шт" //единица измерения
            }
        ],
        "taxationSystem": 1, //система налогообложения; необязательный, если у вас одна система налогообложения
        "isBso": false, //чек является бланком строгой отчётности
        "AgentSign": null, //признак агента, тег ОФД 1057
        "amounts":
            {
                "electronic": sum, // Сумма оплаты электронными деньгами
            }
    }

    const data = {
        "cloudPayments": {
            "CustomerReceipt": receipt, //онлайн-чек
        },
    }

    const widget = new cp.CloudPayments();
    // widget.onclose = onClose;
    widget.pay('charge', // или 'auth'
        {
            publicId: 'pk_4b7104d27e7b85f12bb8524658b16',
            description: description, //назначение
            amount: sum, //сумма
            currency: 'RUB', //валюта
            // accountId: order.getUserId(), //идентификатор плательщика (необязательно)
            invoiceId: invoiceId, //номер заказа  (необязательно)
            skin: "mini", //дизайн виджета (необязательно)
            data: data
        }, {onSuccess, onFail, onComplete}
    )
};