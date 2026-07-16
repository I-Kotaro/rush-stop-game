// === メニューのクリックイベント処理 & 背景フェード制御 ===
import { startNewGame } from "./game.js";
// 背景画像のリスト (追加・削除はこの配列を編集するだけで完了)
const bgImages = [
    "images/top-back1.jpg",
    "images/top-back2.jpg",
    "images/top-back3.jpg",
    "images/top-back4.jpg"
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
const btnRules = document.getElementById("btn-rules");
const rulesModal = document.getElementById("rules-modal");
const btnCloseRules = document.getElementById("btn-close-rules");
const chkSkipRules = document.getElementById("chk-skip-rules");
const modalFooterLabel = document.querySelector(".modal-footer label");
let isOpenedFromStart = false; // 呼び出し元判定フラグ
// ルールモーダルを開く処理
function showRules(fromStart) {
    if (!rulesModal || !btnCloseRules)
        return;
    isOpenedFromStart = fromStart;
    if (fromStart) {
        btnCloseRules.textContent = "ゲーム開始";
        if (modalFooterLabel)
            modalFooterLabel.style.display = "flex"; // スキップチェックを表示
    }
    else {
        btnCloseRules.textContent = "閉じる";
        if (modalFooterLabel)
            modalFooterLabel.style.display = "none"; // スキップチェックを非表示
    }
    rulesModal.style.display = "flex";
}
// ページ全体をフルスクリーンにする処理（モバイル端末などのアドレスバー非表示化用）
function requestFullscreen(element) {
    const el = element;
    try {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        }
        else if (el.webkitRequestFullscreen) { /* Safari (iOS/macOS) */
            el.webkitRequestFullscreen();
        }
        else if (el.mozRequestFullScreen) { /* Firefox */
            el.mozRequestFullScreen();
        }
        else if (el.msRequestFullscreen) { /* IE/Edge */
            el.msRequestFullscreen();
        }
    }
    catch (err) {
        console.warn("フルスクリーン化の要求に失敗しました:", err);
    }
}
// ゲームスタート処理
function startGame() {
    if (topMenu) {
        topMenu.style.display = "none";
    }
    // ゲーム開始時は背景アニメーションタイマーを停止して負荷を低減
    if (bgTimer !== null) {
        clearInterval(bgTimer);
        bgTimer = null;
    }
    console.log("ゲームが開始されました");
    // ページ全体をフルスクリーン化
    requestFullscreen(document.documentElement);
    // ゲームの初期化と第一ステージの開始を実行
    startNewGame();
}
// ゲームスタートボタンを押したとき
btnStart === null || btnStart === void 0 ? void 0 : btnStart.addEventListener("click", () => {
    const shouldSkip = localStorage.getItem("skipRules");
    if (shouldSkip === "true") {
        startGame(); // スキップ設定がされていれば即ゲーム開始
    }
    else {
        showRules(true); // スキップされていなければルール説明を表示
    }
});
// ランキングボタンを押したとき
btnRanking === null || btnRanking === void 0 ? void 0 : btnRanking.addEventListener("click", () => {
    alert("実装までしばらくお待ちください！");
});
// 遊び方ボタンを押したとき
btnRules === null || btnRules === void 0 ? void 0 : btnRules.addEventListener("click", () => {
    showRules(false); // タイトル画面から明示的にルールを再確認
});
// モーダルの外側（背景）をクリックしたときにタイトル画面に戻る（キャンセル）
rulesModal === null || rulesModal === void 0 ? void 0 : rulesModal.addEventListener("click", (event) => {
    if (event.target === rulesModal) {
        rulesModal.style.display = "none";
        isOpenedFromStart = false; // ゲーム開始フラグをクリアしてキャンセル
    }
});
// モーダル内のボタン（ゲーム開始 / 閉じる）を押したとき
btnCloseRules === null || btnCloseRules === void 0 ? void 0 : btnCloseRules.addEventListener("click", () => {
    if (rulesModal) {
        rulesModal.style.display = "none";
    }
    if (isOpenedFromStart) {
        // スタートボタン経由からゲームを開始する場合、チェック状態を保存
        if (chkSkipRules === null || chkSkipRules === void 0 ? void 0 : chkSkipRules.checked) {
            localStorage.setItem("skipRules", "true");
        }
        startGame();
    }
});
