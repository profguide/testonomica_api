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

# Developing

In API package:

    yarn link

In your project:

    yarn link [package...]