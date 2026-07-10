interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Item {
    public x: number = 0;
    public y: number = 0;
    public width: number;
    public height: number;
    public isActive: boolean = false;
    public speed: number = 0; // アイテムの移動速度を追加

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * アイテムを客と同様に画面下部から出現させ、ランダムなドアのX座標を目標とする
     */
    public spawn(doorsX: number[], canvasHeight: number): void {
        // パラメータを doorsX と canvasHeight に変更
        if (this.isActive) return;
        const randomDoorIndex = Math.floor(Math.random() * doorsX.length);
        const chosenDoorX = doorsX[randomDoorIndex];
        this.x = chosenDoorX - this.width / 2; // ドアの中心にアイテムを配置
        this.y = canvasHeight; // 画面下部から出現
        this.speed = Math.random() * 1.5 + 2; // 客より少し遅めの速度
        this.isActive = true;
    }

    /**
     * アイテムの状態を更新する（移動）
     * @returns {boolean} 画面外に出た場合は true を返し、削除可能であることを示す
     */
    public update(): boolean {
        if (!this.isActive) return false;
        this.y -= this.speed; // 上方向に移動
        // 画面上部外に出たら非アクティブにする
        if (this.y < -this.height) {
            this.isActive = false;
            return true; // 画面外に出たことを通知
        }
        return false; // まだ画面内にある
    }

    /**
     * アイテムを描画する（黄色く光る「A」のメダル）
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) return;

        ctx.save();
        // 外側の光る円
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "#FFD700"; // ゴールド色
        ctx.shadowColor = "#FFF";
        ctx.shadowBlur = 15;
        ctx.fill();

        // 「A」の文字
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("A", this.x + this.width / 2, this.y + this.height / 2);
        ctx.restore();
    }

    /**
     * プレイヤーがアイテムを回収したか判定する
     */
    public checkCollision(playerRect: Rect): boolean {
        if (!this.isActive) return false;

        const isColliding =
            this.x < playerRect.x + playerRect.width &&
            this.x + this.width > playerRect.x &&
            this.y < playerRect.y + playerRect.height &&
            this.y + this.height > playerRect.y;

        if (isColliding) {
            this.isActive = false;
            return true;
        }

        return false;
    }
}
