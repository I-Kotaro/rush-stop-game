import { Player } from "./player.js";
import { Passenger } from "./passenger.js";
import { Item } from "./item.js";

// Canvasの取得と設定
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// 画像の読み込み
const backgroundImage = new Image();
const playerImage = new Image();
const passengerImages: HTMLImageElement[] = []; // 複数の客画像を格納する配列

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
    "images/segway.png"
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

backgroundImage.src = "images/train.jpg";
backgroundImage.onload = onImageLoad;

playerImage.src = "images/station_staff.png"; // 駅員画像
playerImage.onload = onImageLoad;

// 全ての客画像をロード
passengerImagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
    img.onload = onImageLoad; // ロード完了コールバックを設定
    passengerImages.push(img);
});

// 🎯 【4つのドアのX座標（1024x576基準）】
const doorsX = [
    70,   // 1番左のドア
    350,  // 左から2番目のドア
    640,  // 右から2番目のドア（中央右寄りのドア）
    930   // 1番右のドア
];
const targetDoorY = 220; // 実際の電車の床面・ドア入り口の高さ

// --- ゲームオブジェクトの初期化 ---
let player: Player;
const passengers: Passenger[] = [];
const itemA = new Item(40, 40);

let lastSpawnTime = 0;
const spawnInterval = 1000; // ドアが増えたので出現間隔を少し短く（1秒に1人）

// 🛡️ ホームドア（バリア）の設定
let isHomeDoorActive = false;
let homeDoorTimeRemaining = 0; // 残り時間（ミリ秒）
let lastTime = 0; // 前フレームのタイムスタンプ
let lastItemSpawnTime = 0;
const itemSpawnInterval = 15000; // 15秒間隔でアイテム出現判定

function initGame() {
    // 画面中央に出現
    player = new Player(canvas.width / 2 - 65, targetDoorY, 130, 130, playerImage);
}

// --- イベントリスナー ---
// マウスの動きに合わせて駅員を「横移動」
// canvas から window に変更し、カーソルがゲーム枠外に出ても操作が途切れないようにする
let mouseX = canvas.width / 2;
window.addEventListener("mousemove", (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
});

// 矩形同士の衝突判定ヘルパー
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
function checkCollision(rect1: Rect, rect2: Rect): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 客を生成する関数（狙うドアの真下から出現し、直進する）
function spawnPassenger() {
    const randomDoorIndex = Math.floor(Math.random() * doorsX.length);
    const chosenDoorX = doorsX[randomDoorIndex];

    // ドアの真下からまっすぐ直進するように、出現位置のX座標をドアのX座標に固定（画像幅230の半分だけずらして中心をドアに合わせる）
    const spawnX = chosenDoorX - 230 / 2;

    // ランダムな客画像を選択
    const randomImageIndex = Math.floor(Math.random() * passengerImages.length);
    const chosenPassengerImage = passengerImages[randomImageIndex];

    const speed = Math.random() * 2 + 3; // 走る速さ
    passengers.push(new Passenger(spawnX, canvas.height, 230, 230, speed, chosenDoorX, chosenPassengerImage));
}

// --- メインゲームループ ---
function gameLoop(timestamp: number) {
    // デルタタイムの計算
    if (lastTime === 0) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 画面クリアと背景描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // バリアタイマーの更新
    if (isHomeDoorActive) {
        homeDoorTimeRemaining -= deltaTime;
        if (homeDoorTimeRemaining <= 0) {
            isHomeDoorActive = false;
            homeDoorTimeRemaining = 0;
        }
    }

    // アイテムの自動出現管理
    if (timestamp - lastItemSpawnTime > itemSpawnInterval) {
        itemA.spawn(canvas.width, targetDoorY);
        lastItemSpawnTime = timestamp;
    }

    // 客の自動生成
    if (timestamp - lastSpawnTime > spawnInterval) {
        spawnPassenger();
        lastSpawnTime = timestamp;
    }

    // 駅員（プレイヤー）の更新と描画
    if (player) {
        player.update(mouseX, canvas.width);
        player.draw(ctx);
    }

    // アイテムAの更新と描画
    if (itemA.isActive) {
        itemA.draw(ctx);
        if (player) {
            const playerBox = { x: player.x, y: player.y, width: player.width, height: player.height };
            if (itemA.checkCollision(playerBox)) {
                isHomeDoorActive = true;
                homeDoorTimeRemaining = 15000; // 15秒間バリア起動
            }
        }
    }

    // 🛡️ バリア（ホームドア）の描画
    if (isHomeDoorActive) {
        ctx.save();
        doorsX.forEach(doorX => {
            // 各ドアの前に半透明の水色のバリアシールドを描画
            const gradient = ctx.createLinearGradient(doorX - 60, targetDoorY - 10, doorX - 60, targetDoorY + 20);
            gradient.addColorStop(0, "rgba(0, 255, 255, 0.6)");
            gradient.addColorStop(1, "rgba(0, 128, 255, 0.1)");
            ctx.fillStyle = gradient;
            ctx.fillRect(doorX - 60, targetDoorY - 15, 120, 30);
            
            // シールドの上の境界線（光る枠）
            ctx.strokeStyle = "rgba(0, 255, 255, 0.9)";
            ctx.lineWidth = 3;
            ctx.strokeRect(doorX - 60, targetDoorY - 15, 120, 30);
        });
        
        // バリア有効時の残り時間を画面上部に表示
        ctx.fillStyle = "#00FFFF";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`ホームドア作動中！ 残り ${(homeDoorTimeRemaining / 1000).toFixed(1)}秒`, canvas.width / 2, 40);
        ctx.restore();
    }

    // 客の処理
    for (let i = passengers.length - 1; i >= 0; i--) {
        const p = passengers[i];

        // 状態更新（移動）と画面外削除チェック
        const shouldRemove = p.update(targetDoorY, canvas.height, canvas.width);
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
                }
            }

            // 【突破判定】駅員をすりぬけて、狙ったドア（ゴール）に到達したか
            if (p.y <= targetDoorY) {
                if (isHomeDoorActive) {
                    // 🛡️ ホームドア作動中は自動で弾き飛ばされる
                    p.bounce(true);
                } else {
                    passengers.splice(i, 1); // ドアの中に吸い込まれて消滅
                    continue;
                }
            }
        }

        // 客の描画
        p.draw(ctx);
    }

    requestAnimationFrame(gameLoop);
}