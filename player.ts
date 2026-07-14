export class Player {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    private image: HTMLImageElement;

    constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }

    /**
     * 駅員をキャンバスに描画する
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    /**
     * マウスの位置に合わせて駅員を横移動させる
     */
    public update(mouseX: number, canvasWidth: number): void {
        this.x = mouseX - this.width / 2;

        // 画面外はみ出し防止
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > canvasWidth - this.width) {
            this.x = canvasWidth - this.width;
        }
    }

    /**
     * 当たり判定（ヒットボックス）を取得する（画像中央の1/4の大きさ）
     */
    public getHitbox() {
        return {
            x: this.x + this.width * 0.375, // 左右に 37.5% の余白
            y: this.y + this.height * 0.375, // 上下に 37.5% の余白
            width: this.width * 0.25,        // 中央の 25% (1/4)
            height: this.height * 0.25
        };
    }
}
