// === メニューのクリックイベント処理 ===

// HTML要素を取得（型を明示）
const topMenu = document.getElementById("top-menu") as HTMLElement | null;
const btnStart = document.getElementById("btn-start") as HTMLElement | null;
const btnRanking = document.getElementById("btn-ranking") as HTMLElement | null;

// ゲームスタートボタンを押したとき
btnStart?.addEventListener("click", (): void => {
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
btnRanking?.addEventListener("click", (): void => {
    // ここにランキング画面を開く、またはポップアップを表示する処理を書く
    alert("実装までしばらくお待ちください！");
});
