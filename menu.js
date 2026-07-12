"use strict";
// === メニューのクリックイベント処理 & 背景フェード制御 ===
// 背景画像のリスト (追加・削除はこの配列を編集するだけで完了)
const bgImages = [
    "images/top-back1.jpg",
    "images/top-back2.jpg",
    "images/top-back3.jpg"
];
let currentBgIndex = 0;
let bgTimer = null;
// HTML要素を取得（型を明示）
const topMenu = document.getElementById("top-menu");
const btnStart = document.getElementById("btn-start");
const btnRanking = document.getElementById("btn-ranking");
// 背景切り替え処理の初期化
function initBackgroundFade() {
    const bg1 = document.getElementById("menu-bg-1");
    const bg2 = document.getElementById("menu-bg-2");
    if (!bg1 || !bg2 || bgImages.length === 0)
        return;
    // 初期画像をセット
    bg1.style.backgroundImage = `url("${bgImages[0]}")`;
    bg1.classList.add("active");
    if (bgImages.length <= 1)
        return; // 画像が1枚だけの場合はフェード不要
    let activeBg = bg1;
    let inactiveBg = bg2;
    // 5秒ごとに背景画像を切り替える
    bgTimer = window.setInterval(() => {
        currentBgIndex = (currentBgIndex + 1) % bgImages.length;
        const nextImageSrc = bgImages[currentBgIndex];
        // 非アクティブな方の背景を次の画像に変更
        inactiveBg.style.backgroundImage = `url("${nextImageSrc}")`;
        // クラスを切り替えてCSS transitionを発火
        inactiveBg.classList.add("active");
        activeBg.classList.remove("active");
        // アクティブ要素を交代
        const temp = activeBg;
        activeBg = inactiveBg;
        inactiveBg = temp;
    }, 5000);
}
// 初期化実行
initBackgroundFade();
// ゲームスタートボタンを押したとき
btnStart === null || btnStart === void 0 ? void 0 : btnStart.addEventListener("click", () => {
    // トップメニューを非表示にする
    if (topMenu) {
        topMenu.style.display = "none";
    }
    // ゲーム開始時は背景アニメーションタイマーを停止して負荷を低減
    if (bgTimer !== null) {
        clearInterval(bgTimer);
        bgTimer = null;
    }
    console.log("ゲームが開始されました");
});
// ランキングボタンを押したとき
btnRanking === null || btnRanking === void 0 ? void 0 : btnRanking.addEventListener("click", () => {
    alert("実装までしばらくお待ちください！");
});
