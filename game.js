// Canvasの取得と設定
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
// 画像の読み込み
var backgroundImage = new Image();
var playerImage = new Image();
var passengerImage = new Image();
backgroundImage.src = "images/train.jpg";
playerImage.src = "images/station_staff.png"; // 駅員画像
passengerImage.src = "images/businessman.png"; // 客画像
// --- 画像のロード完了を待ってゲームを開始 ---
var imagesLoaded = 0;
var totalImages = 3; // 読み込む画像の総数
var onImageLoad = function () {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        // 全ての画像がロードされたらゲームループを開始
        requestAnimationFrame(gameLoop);
    }
};
backgroundImage.onload = onImageLoad;
playerImage.onload = onImageLoad;
passengerImage.onload = onImageLoad;
// 🎯 【4つのドアのX座標（1024x576基準）】
// 画像内の4つのドアの中心位置を配列で定義します
var doorsX = [
    70, // 1番左のドア
    350, // 左から2番目のドア
    640, // 右から2番目のドア（中央右寄りのドア）
    930 // 1番右のドア
];
var targetDoorY = 270; // 実際の電車の床面・ドア入り口の高さ
// --- ゲームオブジェクトの定義 ---
// 駅員（プレイヤー）：ホーム上を自由に横移動して4つのドアを死守する
var player = {
    x: canvas.width / 2 - 30,
    y: targetDoorY, // ドアの少し手前（ホーム上）
    width: 60,
    height: 60,
    color: "rgba(255, 0, 0, 0.9)" // 赤い四角
};
var passengers = [];
var lastSpawnTime = 0;
var spawnInterval = 1000; // ドアが増えたので出現間隔を少し短く（1秒に1人）
// --- イベントリスナー ---
// マウスの動きに合わせて駅員を「横移動」
canvas.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    player.x = mouseX - player.width / 2;
    // 画面外はみ出し防止
    if (player.x < 0)
        player.x = 0;
    if (player.x > canvas.width - player.width)
        player.x = canvas.width - player.width;
});
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}
// 客を生成する関数（ホームのランダムな位置から出現）
function spawnPassenger() {
    var spawnX = Math.random() * (canvas.width - 40) + 20;
    // 🎯 【ドアの選択ロジック】
    // 自分（出現位置）から一番距離が近いドアを自動的に計算してターゲットにします
    var chosenDoorX = doorsX[0];
    var minDistance = Math.abs(spawnX - doorsX[0]);
    for (var i = 1; i < doorsX.length; i++) {
        var dist = Math.abs(spawnX - doorsX[i]);
        if (dist < minDistance) {
            minDistance = dist;
            chosenDoorX = doorsX[i];
        }
    }
    passengers.push({
        x: spawnX,
        y: canvas.height, // 画面の一番下からスタート
        width: 35,
        height: 35,
        speed: Math.random() * 2 + 3, // 走る速さ
        targetX: chosenDoorX, // 狙うドアを記憶
        color: "rgba(0, 100, 255, 0.9)", // 青い四角
        isBounced: false,
        bounceVx: 0,
        bounceVy: 0,
        alpha: 1.0
    });
}
// --- メインゲームループ ---
function gameLoop(timestamp) {
    // 画面クリアと背景描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    // 客の自動生成
    if (timestamp - lastSpawnTime > spawnInterval) {
        spawnPassenger();
        lastSpawnTime = timestamp;
    }
    // 客の処理
    for (var i = passengers.length - 1; i >= 0; i--) {
        var p = passengers[i];
        if (!p.isBounced) {
            // 客は自分が狙うそれぞれのドア（targetX）に向かって走る
            var dx = p.targetX - (p.x + p.width / 2);
            var dy = targetDoorY - (p.y + p.height / 2);
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 5) {
                p.x += (dx / distance) * p.speed;
                p.y += (dy / distance) * p.speed;
            }
            // 【阻止判定】駅員にぶつかったか
            if (checkCollision(p, player)) {
                p.isBounced = true;
                // 駅員に弾かれて手前側の斜め下に吹っ飛ぶ計算
                var pCenterX = p.x + p.width / 2;
                var playerCenterX = player.x + player.width / 2;
                p.bounceVx = (pCenterX - playerCenterX) * 0.4; // ぶつかった角度で左右に散る
                p.bounceVy = 6 + Math.random() * 4; // 手前（下）に勢いよく跳ね返る
                p.color = "rgba(255, 140, 0, 0.9)"; // 弾かれたらオレンジに
            }
            // 【突破判定】駅員をすりぬけて、狙ったドア（ゴール）に到達したか
            if (p.y <= targetDoorY) {
                passengers.splice(i, 1); // ドアの中に吸い込まれて消滅
                continue;
            }
        }
        else {
            // 弾き飛ばされ演出（物理落下）
            p.x += p.bounceVx;
            p.y += p.bounceVy;
            p.bounceVy += 0.3; // 重力加速度
            p.alpha -= 0.02; // フェードアウト
            if (p.alpha <= 0 || p.y > canvas.height || p.x < -p.width || p.x > canvas.width) {
                passengers.splice(i, 1);
                continue;
            }
        }
        // 客の描画
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(passengerImage, p.x, p.y, p.width, p.height);
        ctx.restore();
    }
    // 駅員（プレイヤー）の描画
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    requestAnimationFrame(gameLoop);
}
