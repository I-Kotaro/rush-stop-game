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

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * アイテムをホーム上のランダムな位置に出現させる
     */
    public spawn(canvasWidth: number, targetDoorY: number): void {
        if (this.isActive) return;
        this.x = Math.random() * (canvasWidth - this.width - 40) + 20;
        this.y = targetDoorY + 100 + Math.random() * 100; // ホーム上の適当な高さ
        this.isActive = true;
    }

    /**
     * アイテムを描画する（黄色く光る「A」のメダル）
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) return;

        ctx.save();
        // 外側の光る円
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
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

        const isColliding = this.x < playerRect.x + playerRect.width &&
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
