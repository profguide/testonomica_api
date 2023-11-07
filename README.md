# 1.2.0

## Недостатки <1.2.0

1. Все приложения находятся в разном состоянии, включая виджет.
2. Профгид и тестономика и виджет вынуждены иметь зависимости и самостоятельно билдить виджет
3. Серверное API вынуждено соблюдать все варианты, хотя правильно было бы паралельно переключаться на другие версии v2,
   v3 и тп.

## Новая концепция

Все приложения используют testonomica_widget и не зависят от testonomica_api.

## План

- Сохранение результата через v2 должно зафиксировать результат за Провайдером. Для этого передаётся slug компании.
- Демо-приложение использует widget
- Профгид использует widget
- (ГОТОВО) Тестономика использует виджет
- testonomica_widget - это просто сборка для выкладки. А исходник - testonomica_api.
- документация к testonomica_widget, testonomica_api и к бэкенду.

## План выкладки

- Первым выкладывается виджет
- Вторым тестодром
- Третьим Профгид

# Как использовать

1. Включение исходников в проект
2. Подключение внешней собранной библиотеки:

        <script src="https://cdn.jsdelivr.net/gh/davidtema/testonomica_api@1.2.0/build.min.js"></script>

# Answers repository

There are two main ways for storing answers: cookie-based and Firebase. Firebase is paid after a little requests limit,
therefore cookie-based is preferable. Nevertheless, if you include the library via cross-domain request, cookie don't
work because of browsers policy. That's why you may want to use Firebase. Below is the code for both cases, when the
library needed to be connected locally or via cross-domain access.

    let storage = null;
    if (isCookieEnabled()) {
        storage = new ProgressStorage(config.getTestId());
    } else {
        /** sid will be generated and saved in the localStorage and used if there is no sid in the tag */
        const sid = tag.getAttribute('data-sid');
        if (!sid) {
            throw Error('Error: sid has to be specified.');
        }
        storage = new ProgressFirebaseStorage(config.getTestId(), sid);
    }

# Кастомный стартовый экран

todo instruction

# Developing

In API package:

    yarn link

In your project:

    yarn link [package...]