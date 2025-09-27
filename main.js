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
    {lank: "友達", explain: "上手くいくこともあれば失敗することもあるでしょう。状況に応じて最善手を考えてください。", p: 3},
    {lank: "最高", explain: "あなたたちは最高の相性です！素晴らしすぎて素晴らしいです！", p: 1},
    {lank: "友達", explain: "上手くいくこともあれば失敗することもあるでしょう。状況に応じて最善手を考えてください。", p: 7},
    {lank: "普通", explain: "何の変哲もないペアです。気にせずに過ごしましょう。", p: 10},
    {lank: "微妙", explain: "努力を要します。もっと仲良くなってください。", p: 2}
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
let kanaName = localStorage.getItem('kana') || undefined;

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
    const input = document.getElementById('name-kari');
    const value = input.value;
    // 全角カタカナのみの正規表現
    const isKatakana = /^[\u30A0-\u30FF]+$/.test(value);
    
    if (isKatakana) {
      modal.style.display = 'none';
      userName = document.getElementById('name').value;
      kanaName = value;
      localStorage.setItem('name', userName);
      localStorage.setItem('flag', true);
      localStorage.setItem('kana', value);
      flag = true;
      check();
    } else {
      document.getElementById('alert').style.display = 'block';
      input.focus();
    }
});

async function check() {
    total = 0;
    result = 0;
    document.querySelectorAll('#result-box *').forEach(e => {
      e.style.opacity = 0;
    });
    document.getElementById('result-box').style.opacity = 0;
    document.getElementById('share-button').style.opacity = 0;
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
    const explain = varieties[result].explain;
    try {
        await addDoc(collection(db, "users"), {
            writer: userName,
            kana: kanaName,
            p1: p1,
            p2: p2,
            time: serverTimestamp(),
            result: varieties[result].lank,
            lank: result
        });
        document.getElementById('share-button').addEventListener('click', () => {
            window.open(`https://line.me/R/msg/text/?${p1}と${p2}は${varieties[result].lank}https://lit-kei.github.io/checker`);
        });
    } catch (error) {
        console.error(error);
    }
    setTimeout(() => {
        spinner.style.opacity = 0;
        document.getElementById('result-box').style.opacity  = 1;
        document.getElementById('display').textContent = varieties[result].lank;
        document.getElementById('result-label').innerHTML = `<strong>${p1}</strong> と <strong>${p2}</strong> の結果`
        setTimeout(() => document.getElementById('result-label').style.opacity = 1, 500);
        setTimeout(() => document.getElementById('1').style.opacity = 1, 1500);
        setTimeout(() => document.getElementById('2').style.opacity = 1, 2500);
        setTimeout(() => document.getElementById('3').style.opacity = 1, 3500);
        setTimeout(() => {
            document.getElementById('display').style.opacity = 1;
            document.getElementById('share-button').style.opacity = 1;
            startTyping(explain);
        }, 4500);
    }, 2000);
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

  const container = document.getElementById('typewriter');
  let index = 0;
  let isTyping = false;

  function startTyping(text) {
    if (isTyping) return; // すでに動作中なら何もしない
    isTyping = true;
    container.style.opacity = 1;
    container.textContent = ''; // クリア
    index = 0;

    const chars = [...text];

    function type() {
      if (index < chars.length) {
        container.textContent += chars[index];
        index++;
        setTimeout(type, 100);
      } else {
        container.classList.remove('typing');
        isTyping = false;
      }
    }

    container.classList.add('typing');
    type();
    
  }

