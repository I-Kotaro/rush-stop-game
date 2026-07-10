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
     * 当たり判定（ヒットボックス）を取得する（画像中央の1/3の大きさ）
     */
    public getHitbox() {
        return {
            x: this.x + this.width / 3,
            y: this.y + this.height / 3,
            width: this.width / 3,
            height: this.height / 3
        };
    }
}
