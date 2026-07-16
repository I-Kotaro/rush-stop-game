var _a, _b;
import { Player } from "./player.js";
import { Passenger } from "./passenger.js";
// Canvasの取得と設定
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// 画像の読み込み
const backgroundImage = new Image();
const playerImage = new Image();
const passengerImages = []; // 複数の客画像を格納する配列
// 客画像ファイルのパスリスト
const passengerImagePaths = [
    "images/athlete.png",
    "images/businessman.png",
    "images/businessman2.png",
    "images/businessman3.png",
    "images/businessman4.png",
    "images/student.png",
    "images/traveler.png",
    "images/bicycle.png",
    "images/delivery.png",
    "images/green.png",
    "images/people.png",
    "images/red.png",
    "images/segway.png",
];
// --- 画像のロード完了を待ってゲームを開始 ---
let imagesLoaded = 0;
const totalImages = 1 + 1 + passengerImagePaths.length; // 背景1 + 駅員1 + 客画像数
const onImageLoad = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        // 画像ロード完了後にインスタンス化
        initGame();
        // 全ての画像がロードされたらゲームループを開始
        requestAnimationFrame(gameLoop);
    }
};
backgroundImage.src = "images/game-back-train.jpg";
backgroundImage.onload = onImageLoad;
playerImage.src = "images/station_staff.png"; // 駅員画像
playerImage.onload = onImageLoad;
// 全ての客画像をロード
passengerImagePaths.forEach((path) => {
    const img = new Image();
    img.src = path;
    img.onload = onImageLoad; // ロード完了コールバックを設定
    passengerImages.push(img);
});
// 🎯 【4つのドアのX座標（1024x576基準）】
const doorsX = [
    70, // 1番左のドア
    350, // 左から2番目のドア
    640, // 右から2番目のドア（中央右寄りのドア）
    930, // 1番右のドア
];
const targetDoorY = 220; // 実際の電車の床面・ドア入り口の高さ
// --- ゲームオブジェクトの初期化 ---
let player;
const passengers = [];
let lastSpawnTime = 0;
let lastTime = 0; // 前フレームのタイムスタンプ
let lastSpawnedDoorIndex = -1; // 直前に客が出現したドアのインデックスを保持する変数
let gameState = "TITLE";
// ステージごとの難易度調整テーブル
const STAGE_CONFIGS = [
    { num: 1, duration: 30000, spawnInterval: 1500, minSpeed: 2.5, maxSpeed: 4.0 },
    { num: 2, duration: 30000, spawnInterval: 1200, minSpeed: 3.0, maxSpeed: 5.0 },
    { num: 3, duration: 30000, spawnInterval: 900, minSpeed: 4.0, maxSpeed: 7.5 },
    { num: 4, duration: 30000, spawnInterval: 700, minSpeed: 5.0, maxSpeed: 9.0 },
    { num: 5, duration: 30000, spawnInterval: 500, minSpeed: 6.0, maxSpeed: 11.0 },
];
let currentStageIndex = 0;
let stageTimeRemaining = 30000;
// スコアとカウント
let score = 0;
let successCount = 0;
let failedCount = 0;
// ステージ間インターバルのタイマー
let stageClearTimer = 0;
const stageClearDuration = 5000; // 5秒
function initGame() {
    // 画面中央に出現
    player = new Player(canvas.width / 2 - 65, targetDoorY, 130, 130, playerImage);
}
// 🌟 新しいゲームの開始 (外部モジュールから呼び出し可能)
export function startNewGame() {
    score = 0;
    successCount = 0;
    failedCount = 0;
    currentStageIndex = 0;
    // HUDとオーバーレイ of 表示制御
    const hud = document.getElementById("game-hud");
    if (hud)
        hud.style.display = "flex";
    const resultScreen = document.getElementById("result-screen");
    if (resultScreen) {
        resultScreen.classList.remove("active");
        resultScreen.style.display = "none";
    }
    const stageClearOverlay = document.getElementById("stage-clear-overlay");
    if (stageClearOverlay) {
        stageClearOverlay.classList.remove("active");
        stageClearOverlay.style.display = "none";
    }
    startStage(0);
}
// ステージの初期化・開始
function startStage(stageIndex) {
    currentStageIndex = stageIndex;
    const config = STAGE_CONFIGS[currentStageIndex];
    stageTimeRemaining = config.duration;
    // 状態クリア
    passengers.length = 0;
    lastSpawnTime = 0;
    gameState = "PLAYING";
    updateHUD();
}
// HUDの値をDOMに反映
function updateHUD() {
    const stageNumSpan = document.getElementById("hud-stage-num");
    const timeValSpan = document.getElementById("hud-time-val");
    const scoreValSpan = document.getElementById("hud-score-val");
    const successValSpan = document.getElementById("hud-success-val");
    const failedValSpan = document.getElementById("hud-failed-val");
    if (stageNumSpan)
        stageNumSpan.textContent = (currentStageIndex + 1).toString();
    if (timeValSpan)
        timeValSpan.textContent = Math.max(0, stageTimeRemaining / 1000).toFixed(1);
    if (scoreValSpan)
        scoreValSpan.textContent = score.toString();
    if (successValSpan)
        successValSpan.textContent = successCount.toString();
    if (failedValSpan)
        failedValSpan.textContent = failedCount.toString();
}
// ステージクリア演出の開始
function showStageClear() {
    gameState = "STAGE_CLEAR";
    stageClearTimer = stageClearDuration;
    const countdownSpan = document.getElementById("clear-countdown");
    if (countdownSpan) {
        countdownSpan.textContent = "5";
    }
    const stageClearOverlay = document.getElementById("stage-clear-overlay");
    const clearTitle = document.getElementById("clear-title");
    if (clearTitle) {
        clearTitle.textContent = `レベル ${currentStageIndex + 1} 終了`;
    }
    if (stageClearOverlay) {
        stageClearOverlay.style.display = "flex";
        // リフローを起こして transition を発火
        stageClearOverlay.offsetHeight;
        stageClearOverlay.classList.add("active");
    }
}
// 最終リザルト画面の表示
function showResultScreen() {
    gameState = "RESULT";
    // ゲームプレイ中のカーソル非表示を元に戻す
    canvas.style.cursor = "default";
    const hud = document.getElementById("game-hud");
    if (hud)
        hud.style.display = "none";
    const resStage = document.getElementById("res-stage");
    const resSuccess = document.getElementById("res-success");
    const resSuccessPt = document.getElementById("res-success-pt");
    const resFailed = document.getElementById("res-failed");
    const resFailedPt = document.getElementById("res-failed-pt");
    const resScore = document.getElementById("res-score");
    const resEvalText = document.getElementById("res-eval-text");
    if (resStage)
        resStage.textContent = `${currentStageIndex + 1}/5`;
    if (resSuccess)
        resSuccess.textContent = successCount.toString();
    if (resSuccessPt)
        resSuccessPt.textContent = (successCount * 100).toString();
    if (resFailed)
        resFailed.textContent = failedCount.toString();
    if (resFailedPt)
        resFailedPt.textContent = (failedCount * 300).toString();
    if (resScore)
        resScore.textContent = score.toString();
    if (resEvalText)
        resEvalText.innerHTML = getEvaluation(score);
    const resultScreen = document.getElementById("result-screen");
    if (resultScreen) {
        resultScreen.style.display = "flex";
        resultScreen.offsetHeight;
        resultScreen.classList.add("active");
    }
}
// スコアに基づいた評価メッセージの取得
function getEvaluation(finalScore) {
    if (finalScore >= 4500) {
        return "素晴らしい！<br>ダイヤを完璧に守り抜いた伝説の神駅員です！<br>お客様からも感謝の嵐です！";
    }
    else if (finalScore >= 3000) {
        return "優秀な駅員ですね！<br>軽微な遅延のみで運行を支えました。<br>この調子で頑張りましょう！";
    }
    else if (finalScore >= 1000) {
        return "標準的な勤務成績です。<br>駆け込み乗車を阻止できれば、<br>さらにダイヤが安定します。";
    }
    else if (finalScore >= 0) {
        return "お疲れ様でした。<br>少し遅延が目立ちます。<br>確実に駆け込みを阻止しましょう。";
    }
    else {
        return "ダイヤ崩壊！<br>始末書レベルの大遅延が発生しています！<br>安全かつ迅速な乗降誘導を心掛けましょう！";
    }
}
// --- イベントリスナー ---
// マウスとタッチの動きに合わせて駅員を「横移動」
// canvas から window に変更し、カーソルや指がゲーム枠外に出ても操作が途切れないようにする
let mouseX = canvas.width / 2;
function updatePosition(clientX) {
    const rect = canvas.getBoundingClientRect();
    // 💡スマホ等でのCanvas縮小表示を考慮し、DOM上の実ピクセルからCanvas内部の論理幅(1024px)へ変換
    mouseX = ((clientX - rect.left) / rect.width) * canvas.width;
}
document.addEventListener("mousemove", (event) => {
    if (gameState !== "PLAYING")
        return; // プレイ中のみ動くようにする
    updatePosition(event.clientX);
});
// 💡スマホでのタッチ操作（タップ・スワイプ移動）に対応
document.addEventListener("touchstart", (event) => {
    if (gameState !== "PLAYING")
        return;
    const touch = event.touches[0];
    updatePosition(touch.clientX);
    // スワイプによる画面スクロールやバウンスなどのデフォルト動作を防止
    if (event.cancelable)
        event.preventDefault();
}, { passive: false });
document.addEventListener("touchmove", (event) => {
    if (gameState !== "PLAYING")
        return;
    const touch = event.touches[0];
    updatePosition(touch.clientX);
    if (event.cancelable)
        event.preventDefault();
}, { passive: false });
function checkCollision(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y);
}
// 客を生成する関数（狙うドアの真下から出現し、直進する）
function spawnPassenger() {
    const config = STAGE_CONFIGS[currentStageIndex];
    // 直前のドアと被らないようにインデックスを選択する
    let randomDoorIndex = Math.floor(Math.random() * doorsX.length);
    if (lastSpawnedDoorIndex !== -1) {
        // 直前と同じドアが選ばれた場合、残りの3つのドアからランダムに再選択する
        while (randomDoorIndex === lastSpawnedDoorIndex) {
            randomDoorIndex = Math.floor(Math.random() * doorsX.length);
        }
    }
    lastSpawnedDoorIndex = randomDoorIndex; // 今回選ばれたドアを記録
    const chosenDoorX = doorsX[randomDoorIndex];
    // ドアの真下からまっすぐ直進するように、出現位置のX座標をドアのX座標に固定（画像幅230の半分だけずらして中心をドアに合わせる）
    const spawnX = chosenDoorX - 230 / 2;
    // ランダムな客画像を選択
    const randomImageIndex = Math.floor(Math.random() * passengerImages.length);
    const chosenPassengerImage = passengerImages[randomImageIndex];
    // 難易度に応じたスピードに設定
    const speed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
    passengers.push(new Passenger(spawnX, canvas.height, 230, 230, speed, chosenDoorX, chosenPassengerImage));
}
// --- メインゲームループ ---
function gameLoop(timestamp) {
    // デルタタイムの計算
    if (lastTime === 0)
        lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    // 画面クリアと背景描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    if (gameState === "PLAYING") {
        // タイマー更新
        stageTimeRemaining -= deltaTime;
        if (stageTimeRemaining <= 0) {
            stageTimeRemaining = 0;
            updateHUD();
            // ステージ切り替え、またはゲーム終了
            if (currentStageIndex < STAGE_CONFIGS.length - 1) {
                showStageClear();
            }
            else {
                showResultScreen();
            }
            requestAnimationFrame(gameLoop);
            return;
        }
        updateHUD();
        // 客の自動生成
        const config = STAGE_CONFIGS[currentStageIndex];
        if (timestamp - lastSpawnTime > config.spawnInterval) {
            spawnPassenger();
            lastSpawnTime = timestamp;
        }
        // 駅員（プレイヤー）の更新と描画
        if (player) {
            player.update(mouseX, canvas.width);
            player.draw(ctx);
        }
        // 基準FPS(60)に対する比率を計算 (1フレームあたり約16.67msが基準)
        // タブがバックグラウンドにいた場合などの異常に大きなdeltaTimeを避けるため、上限を設ける
        const dtRatio = Math.min(3.0, deltaTime / (1000 / 60));
        // 客の処理
        for (let i = passengers.length - 1; i >= 0; i--) {
            const p = passengers[i];
            const shouldRemove = p.update(targetDoorY, canvas.height, canvas.width, dtRatio);
            if (shouldRemove) {
                passengers.splice(i, 1);
                continue;
            }
            if (!p.isBounced) {
                // 【阻止判定】駅員にぶつかったか
                if (player) {
                    const passengerHitbox = p.getHitbox();
                    const playerHitbox = player.getHitbox();
                    if (checkCollision(passengerHitbox, playerHitbox)) {
                        p.bounce(false, player.x + player.width / 2);
                        successCount++;
                        score += 100;
                        updateHUD();
                    }
                }
                // 【突破判定】駅員をすりぬけて、狙ったドア（ゴール）に到達したか
                if (p.y <= targetDoorY - p.height * 0.3) {
                    // 突破（失敗）
                    passengers.splice(i, 1);
                    failedCount++;
                    score -= 300;
                    updateHUD();
                    continue;
                }
            }
            p.draw(ctx);
        }
    }
    else if (gameState === "STAGE_CLEAR") {
        // ステージクリア演出中の更新
        stageClearTimer -= deltaTime;
        // カウントダウン残り秒数の更新
        const countdownSpan = document.getElementById("clear-countdown");
        if (countdownSpan) {
            countdownSpan.textContent = Math.ceil(Math.max(0, stageClearTimer) / 1000).toString();
        }
        if (stageClearTimer <= 0) {
            const stageClearOverlay = document.getElementById("stage-clear-overlay");
            if (stageClearOverlay) {
                stageClearOverlay.classList.remove("active");
                setTimeout(() => {
                    stageClearOverlay.style.display = "none";
                }, 500);
            }
            startStage(currentStageIndex + 1);
        }
        // クリア中も背後のキャラは静止・描画
        if (player)
            player.draw(ctx);
        passengers.forEach((p) => p.draw(ctx));
    }
    else if (gameState === "RESULT") {
        // 結果画面（動きは止まり、プレイヤーだけ描画）
        if (player)
            player.draw(ctx);
    }
    else if (gameState === "TITLE") {
        // タイトル
    }
    requestAnimationFrame(gameLoop);
}
// --- リザルト画面ボタンイベントリスナーの登録 ---
(_a = document.getElementById("btn-restart")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    // キャンバス上のカーソルを再非表示にする
    canvas.style.cursor = "none";
    startNewGame();
});
(_b = document.getElementById("btn-back-to-menu")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    // タイトルメニューへ戻る（完全に状態を初期化するためにリロード）
    location.reload();
});
// === リザルト画面用 独自スクロールバー制御 ===
const resultScreen = document.getElementById("result-screen");
const resultScrollbarTrack = document.getElementById("result-scrollbar-track");
const resultScrollbarThumb = document.getElementById("result-scrollbar-thumb");
/**
 * 独自スクロールバーのサイズと位置をリザルト画面のスクロール量と同期する
 */
function updateResultScrollbar() {
    if (!resultScreen || !resultScrollbarTrack || !resultScrollbarThumb)
        return;
    const scrollHeight = resultScreen.scrollHeight;
    const clientHeight = resultScreen.clientHeight;
    const scrollTop = resultScreen.scrollTop;
    // コンテンツ量が少なくスクロールが不要な場合は非表示にする
    if (scrollHeight <= clientHeight) {
        resultScrollbarTrack.style.display = "none";
        return;
    }
    resultScrollbarTrack.style.display = "block";
    // つまみの高さをコンテンツの比率に応じて動的に算出（最小20pxを保証）
    const trackHeight = resultScrollbarTrack.clientHeight;
    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 20);
    resultScrollbarThumb.style.height = `${thumbHeight}px`;
    // つまみの縦位置（top）をコンテンツのスクロール位置と同期
    const maxScrollTop = scrollHeight - clientHeight;
    const maxTrackTop = trackHeight - thumbHeight;
    const thumbTop = (scrollTop / maxScrollTop) * maxTrackTop;
    resultScrollbarThumb.style.top = `${thumbTop}px`;
}
if (resultScreen) {
    resultScreen.addEventListener("scroll", updateResultScrollbar);
}
window.addEventListener("resize", updateResultScrollbar);
/**
 * リザルト画面が表示(display: flex)された瞬間を検知してスクロールバーを初期化・更新する
 */
function hookResultScreenOpen() {
    if (!resultScreen)
        return;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === "style") {
                const display = window.getComputedStyle(resultScreen).display;
                if (display === "flex") {
                    updateResultScrollbar();
                    setTimeout(updateResultScrollbar, 50);
                }
            }
        });
    });
    observer.observe(resultScreen, { attributes: true });
}
hookResultScreenOpen();
