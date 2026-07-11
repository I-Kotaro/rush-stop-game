export class Passenger {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public speed: number;
    public targetX: number;
    public image: HTMLImageElement;

    public isBounced: boolean = false;
    public bounceVx: number = 0;
    public bounceVy: number = 0;
    public alpha: number = 1.0;
    public color: string = "rgba(0, 100, 255, 0.9)"; // 初期は青系統

    constructor(x: number, y: number, width: number, height: number, speed: number, targetX: number, image: HTMLImageElement) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.targetX = targetX;
        this.image = image;
    }

    /**
     * 客の状態を更新する
     * @returns {boolean} 画面外に出た、またはフェードアウトが完了した場合は true を返し、削除可能であることを示す
     */
    public update(targetDoorY: number, canvasHeight: number, canvasWidth: number): boolean {
        if (!this.isBounced) {
            // ドアに向かって走る (Y軸の目的地は客の上端 p.y)
            const dx = this.targetX - (this.x + this.width / 2);
            const dy = targetDoorY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                if (distance <= this.speed) {
                    // 残り距離がスピード以下の場合は、直接目的地（ドア）にピッタリ合わせる
                    this.x = this.targetX - this.width / 2;
                    this.y = targetDoorY;
                } else {
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;
                }
            }
        } else {
            // 弾き飛ばされ演出（物理落下）
            this.x += this.bounceVx;
            this.y += this.bounceVy;
            this.bounceVy += 0.3; // 重力加速度
            this.alpha -= 0.02;   // フェードアウト

            // 完全に消えたか、画面外に落ちたら削除対象にする
            if (this.alpha <= 0 || this.y > canvasHeight || this.x < -this.width || this.x > canvasWidth) {
                return true;
            }
        }

        return false;
    }

    /**
     * 客をキャンバスに描画する
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    /**
     * 弾き飛ばし状態にする
     * @param isBarrier バリアによって弾かれた場合は true、駅員による場合は false
     * @param sourceCenterX 弾いた対象（駅員）の中心X座標（バリアの場合はランダムに散らすために使用しないかダミー）
     */
    public bounce(isBarrier: boolean, sourceCenterX?: number): void {
        this.isBounced = true;
        
        const pCenterX = this.x + this.width / 2;
        if (isBarrier) {
            // バリア（ホームドア）で弾かれた場合は、シアン色になり、左右にランダムに散る
            this.bounceVx = (Math.random() - 0.5) * 4;
            this.bounceVy = 6 + Math.random() * 4;
            this.color = "rgba(0, 255, 255, 0.9)";
        } else {
            // 駅員に弾かれた場合は、オレンジ色になり、ぶつかった角度で左右に散る
            const playerCenterX = sourceCenterX ?? (pCenterX - 10);
            this.bounceVx = (pCenterX - playerCenterX) * 0.4;
            this.bounceVy = 6 + Math.random() * 4;
            this.color = "rgba(255, 140, 0, 0.9)";
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
