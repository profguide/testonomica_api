import {initializeApp} from "firebase/app";
import {doc, getDoc, getFirestore, setDoc, updateDoc} from "firebase/firestore/lite";
import {STATUS_FINISHED, STATUS_IN_PROGRESS, STATUS_NONE} from "../../const";
import Answer from "../types/Answer";

const firebaseApp = initializeApp({
    apiKey: 'AIzaSyAxhWpbBwpTvc2V6LzaUJA1P_TOen32Eck',
    authDomain: 'testonomica.firebaseapp.com',
    projectId: 'testonomica',
    storageBucket: "testonomica.appspot.com",
    messagingSenderId: "284531372526",
    appId: "1:284531372526:web:034f85dfbf4449db4edeff",
    measurementId: "G-6MZ0WZNF88"
});

const db = getFirestore();

/**
 * Структура данных в Firebase
 * Firebase требует, чтобы структура была чётной.
 * users: {
 *     sid_aKa8lzpBn: {
 *         test_167: {
 *             status: {
 *                 value: {}
 *             }
 *             answers: {
 *                  1: [19]
 *             }
 *         }
 *     }
 * }
 */

/**
 * Кеш. Самый простой способ - делать флаг "старый" в момент, когда происходит запись.
 * Тогда
 */
let answersCache = null;
let stateCache = null;

export default class ProgressFirebaseStorage {
    constructor(testId, sid) {
        this.answersRef = doc(db, `users/sid_${sid}/test_${testId}`, 'answers');
        this.statusRef = doc(db, `users/sid_${sid}/test_${testId}`, 'state');
    }

    async resultKey() {
        if (stateCache) {
            console.log('resultKey: from cache')
            return stateCache;
        }
        const docSnap = await getDoc(this.statusRef);
        if (docSnap.exists() && docSnap.data().resultKey) {
            stateCache = docSnap.data().resultKey
            return stateCache;
        }
        return null;
    }

    clear() {
        console.log('clear')
        // in the beginning there is no reason for clearing data.
        // if (answersCache ...)
        return setDoc(this.answersRef, {}).then(() => {
            return setDoc(this.statusRef, {});
        });
    }

    addAnswer(answer) {
        const a = {};
        a[answer.questionId] = answer.value;
        return updateDoc(this.answersRef, a).then(() => {
            answersCache = null;
        });
    }

    async getAnswers() {
        if (answersCache) {
            console.log('answers: from cache')
            return answersCache;
        }
        const docSnap = await getDoc(this.answersRef);
        if (docSnap.exists()) {
            answersCache = docSnap.data();
            return answersCache;
        } else {
            return {};
        }
    }

    async getLastAnswer() {
        const answers = await this.getAnswers();
        const keys = Object.keys(answers);
        const lastId = keys[keys.length - 1];
        const lastValue = answers[lastId];
        return Answer.createImmutable(lastId, lastValue);
    }

    async getLength() {
        const answers = await this.getAnswers();
        return Object.keys(answers).length;
    }

    async getStatus() {
        const resultKey = await this.resultKey();
        if (resultKey) {
            return STATUS_FINISHED;
        }
        const length = await this.getLength();
        if (length > 0) {
            return STATUS_IN_PROGRESS;
        } else {
            return STATUS_NONE;
        }
    }

    setFinished(key) {
        return updateDoc(this.statusRef, {resultKey: key});
    }
}