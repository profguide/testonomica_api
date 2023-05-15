import ProgressStorage from "../../src/service/storage/ProgressStorage";
import {STATUS_FINISHED, STATUS_NONE} from "../../src/const";
import Answer from "../../src/service/types/Answer";
import Progress from "../../src/Progress/Progress";

describe("ProgressStorage", () => {
    beforeEach(() => {
        window.localStorage.setItem('testonomica_test_38', '{}');
    });

    test('Initialize with no answers', () => {
        const ps = new ProgressStorage('38');

        ps.getAnswers().then(answers => {
            expect(answers.length).toBe(0)
        });
    });

    test('Add answers and check order', () => {
        const ps = new ProgressStorage('38');

        ps.addAnswer(new Answer('900', ['a']));
        ps.addAnswer(new Answer('100', ['b']));

        ps.getAnswers().then(answers => {
            expect(answers.length).toBe(2)
        });

        // порядок сохранён
        ps.getLastAnswer().then(answer => {
            expect(answer?.questionId).toBe("100")
        });
    });

    test('Import and replace old progress', () => {
        const ps = new ProgressStorage('38');

        // old data
        ps.addAnswer(new Answer('900', ['a']));

        // импортируем новые данные
        ps.import(new Progress((new Map()).set('500', ['a']).set('400', ['b'])));

        ps.getAnswers().then(answers => {
            expect(answers.length).toBe(2)
        });

        // порядок сохранён
        ps.getLastAnswer().then(answer => {
            expect(answer?.questionId).toBe("400")
        });
    });

    test('Status management', () => {
        const ps = new ProgressStorage('38');

        // нет статуса
        ps.getStatus().then(status => {
            expect(status).toBe(STATUS_NONE);
        });

        // меняем статус
        ps.setFinished('some_key');

        // статус установлен
        ps.getStatus().then(status => {
            expect(status).toBe(STATUS_FINISHED);
        });
    });

    test('Старый формат в хранилище приводит к обнулению хранилища.', () => {
        window.localStorage.setItem('testonomica_test_38', '{"answers": {"100": ["a"], "200": ["b"]}}');
        const ps = new ProgressStorage('38');

        ps.getAnswers().then(answers => {
            expect(answers.length).toBe(0)
        });
    });
});