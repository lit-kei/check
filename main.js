// Firebase SDKのインポート
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBI46V7YuKP26jSUM-bRRyjJaL25aCAp00",
    authDomain: "checker-66685.firebaseapp.com",
    projectId: "checker-66685",
    storageBucket: "checker-66685.firebasestorage.app",
    messagingSenderId: "923399101961",
    appId: "1:923399101961:web:b97c75e669fbcaae9a62d8",
    measurementId: "G-SWXY8CJC3Q"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let total = 0;
let result = 0;

const varieties = [
    {lank: "最高", exqlain: "あなたたちは最高の相性です。何があっても成功するでしょう！", p: 1},
    {lank: "友達", exqlain: "上手くいくこともあれば失敗することもあるでしょう。状況に応じて最善手を考えてください。", p: 4}
];
let probability = 0;
varieties.forEach(e => {
    probability += e.p;
    e.cum = probability;
});
const modal = document.getElementById('modal');
const spinner = document.getElementById('spinner');

let flag = localStorage.getItem('flag') || false;
let userName = localStorage.getItem('name') || undefined;

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    if (!flag) {
        modal.style.display = 'block';
        return;
    }
    check();
});

document.getElementById('cancel').addEventListener('click', () => {
    modal.style.display = 'none';
});

document.getElementById('nameForm').addEventListener('submit', e => {
    e.preventDefault();
    flag = document.getElementById('checkbox').checked;
    userName = document.getElementById('name').value;
    localStorage.setItem('name', userName);
    localStorage.setItem('flag', flag);
    modal.style.display = 'none';
    check();
});

async function check() {
    document.getElementById('result').querySelectorAll('*:not(type)').forEach(e => {
        e.style.opacity = 0;
    });
    total = 0;
    result = 0;
    const [p1, p2] = [document.getElementById('p1').value, document.getElementById('p2').value];
    [...p1].map(char => {
        total += char.codePointAt(0);
        return char.codePointAt(0);
    });
    [...p2].map(char => {
        total += char.codePointAt(0);
        return char.codePointAt(0);
    });
    result = find(total % probability);
    document.getElementById('result').style.display = 'block';
    spinner.style.opacity = 1;
    try {
        await addDoc(collection(db, "users"), {
            writer: userName,
            p1: p1,
            p2: p2,
            time: serverTimestamp(),
            result: varieties[result].lank,
            lank: result
        });
    } catch (error) {
        console.error(error);
    }
    spinner.style.opacity = 0;

}

function find(i) {
    let min = 0;
    let max = varieties.length;
    let result = -1;
    while (min <= max) {
        let mid = Math.floor((min + max) / 2);
        
        if (i < varieties[mid].cum) {
            result = mid;
            max = mid - 1;
        } else {
            min = mid + 1;
        }
    }
    return result;
}