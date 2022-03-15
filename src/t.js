import {detectLocale} from "./util";

const lines = {}
lines['минут'] = 'minutes';
lines['Начать'] = 'Start';
lines['Продолжить'] = 'Continue';
lines['Продолжить тест'] = 'Continue test';
lines['Начать сначала'] = 'Restart';
lines['Произошла ошибка во время загрузки.'] = 'An error occurred during download.';
lines['Произошла ошибка во время загрузки результата.'] = 'An error occurred while loading the result.';
lines['Отказано в доступе.'] = 'Access denied.';
lines['Задание'] = 'The task';
lines['Загрузка результата...'] = 'Loading result...';
lines['Результат обрабатывается...'] = 'The result is processed...';
lines['Ваши результаты'] = 'Your results';
lines['Постоянная ссылка на результат'] = 'Permanent link to the result';
lines['Пройти тест заново'] = 'Take the test again';
lines['Требуется оплата.'] = 'Payment required.';
lines['Нажмите, чтобы перейти к оплате'] = 'Click to proceed to payment';
lines['Точно описывает меня'] = 'Exactly describes me';
lines['Частично описывает меня'] = 'Partially describes me';
lines['Нейтрально'] = 'Neutral';
lines['Закончилось время, отведённое на вопрос'] = 'Question time expired';
lines['секунд'] = 'seconds';
lines['Нажмите кнопку продолжить, когда будете готовы продолжить тест.'] = 'Click the Continue button when you are ready to continue with the test.';

export function t(str) {
    if (detectLocale() === 'en') {
        const line = lines[str];
        if (line) {
            return line;
        }
    }
    return str;
}