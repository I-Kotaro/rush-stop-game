"use strict";
// === メニューのクリックイベント処理 ===
// HTML要素を取得（型を明示）
const topMenu = document.getElementById("top-menu");
const btnStart = document.getElementById("btn-start");
const btnRanking = document.getElementById("btn-ranking");
// ゲームスタートボタンを押したとき
btnStart === null || btnStart === void 0 ? void 0 : btnStart.addEventListener("click", () => {
    // トップメニューを非表示にする
    if (topMenu) {
        topMenu.style.display = "none";
    }
    // ここに既存のゲームを開始する関数があれば呼び出す（例: gameStart(); など）
    // 現在のgame.tsの構造では、画像ロード完了後に自動でゲームループが開始されるため、
    // ここで明示的にゲームを開始する処理は不要です。メニューを非表示にするだけでゲームが見えるようになります。
    console.log("ゲームが開始されました");
});
// ランキングボタンを押したとき
btnRanking === null || btnRanking === void 0 ? void 0 : btnRanking.addEventListener("click", () => {
    // ここにランキング画面を開く、またはポップアップを表示する処理を書く
    alert("ランキング機能は現在準備中です！");
});
