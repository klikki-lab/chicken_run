import { Camera2D } from "../../common/entity/camera2D";
import { Terrain } from "../terrain/terrain";
import { Chicken } from "./chicken";

export class PlayerChicken extends Chicken {

    private static readonly MAX_VY = Chicken.VELOCITY_PER_FRAME * Chicken.SIZE * 2;
    private static readonly JUMP_ACC = PlayerChicken.MAX_VY * 0.2;

    private _onFrameElapsed: (player: PlayerChicken, prevX: number, prevY: number) => void;
    private _onMove: (player: PlayerChicken, x: number, y: number) => boolean;
    private _onFall: (player: PlayerChicken) => void;

    private prevDiffY = 0;
    private startGlidingY = 0;
    private glidingStep = 0;
    private _canJump = false
    private isGliding = false;
    private _isFailed = false;
    private _combo = 0;

    constructor(scene: g.Scene) {
        super(scene);
    }

    step(terrain: Terrain): void {
        const prevX = this.x;
        this.x += this.velocity.x;

        if (this._canJump) {
            if (this.velocity.x > Chicken.MAX_VX) {
                this.velocity.x = this.velocity.x * 0.998;
            } else {
                this.velocity.x = Math.min(this.velocity.x * 1.01, Chicken.MAX_VX)
            }
        }

        const prevY = this.y;
        this.y += this.velocity.y;

        if (this.velocity.y < PlayerChicken.MAX_VY) {
            if (this.canGliding()) {
                if (this.glidingStep === 0 && this.isGliding) {
                    this.glidingAnimation();
                    this.startGlidingY = this.y;
                }
                this.velocity.y = Chicken.MIN_VY;
                let y = Math.sin(2 * Math.PI * (this.glidingStep / g.game.fps));
                this.glidingStep++;
                this.y = this.startGlidingY + y * Chicken.MIN_VY * 3;
                this.startGlidingY += Chicken.MIN_VY;
                if (this.angle !== 0) this.angle = 0;
            } else {
                this.velocity.y += Chicken.MIN_VY;
                if (!this._canJump) {
                    this.angle += 20;
                    this.angle %= 360;
                }
            }
            this.velocity.y = Math.min(this.velocity.y, PlayerChicken.MAX_VY);
        }

        const thresholdW = this.getWidth() * 0.5;
        const thresholdH = this.getHeight() * 0.5;
        const moveX = this.velocity.x;
        const moveY = this.velocity.y;
        const stepX = Math.ceil(Math.abs(moveX) / thresholdW);
        const stepY = Math.ceil(Math.abs(moveY) / thresholdH);
        const step = Math.max(stepX, stepY);
        let groundTop = Number.MAX_VALUE;
        for (let i = 0; i <= step; i++) {
            const x = prevX + (moveX * i) / step;
            const y = prevY + (moveY * i) / step;
            groundTop = Math.min(terrain.getGroundTop(x), groundTop);

            if (this._onMove(this, x, y)) break;
        }

        if (groundTop >= Number.MAX_VALUE) {
            this._isFailed = true;
            this._onFall(this);
            return;
        } else if (groundTop < Number.MAX_VALUE) {
            if (this.getBottom() > groundTop && this.velocity.y >= 0) {
                if (!this._canJump) {
                    this._combo = 0;
                    this.runAnimation();
                }
                this.y = groundTop - this.getHeight() / 2;
                this.velocity.y = Chicken.MIN_VY;
                this._canJump = true;
                this.glidingStep = 0;
                this.isGliding = false;
                this.angle = 0;
            } else {
                if (this._canJump) {
                    this.y = groundTop - this.height / 2;
                }
            }
        }

        const diffY = this.y - prevY;
        if (this._canJump && this.prevDiffY !== diffY) {
            const rate = diffY < 0 ? 0.02 : 3;
            this.velocity.x += diffY * (1 / g.game.fps) * rate;
            if (this.velocity.x < Chicken.MIN_VX) {
                this.velocity.x = Chicken.MIN_VX;
            }
            this.prevDiffY = prevY;
        }

        this.modified();

        if (g.game.age % 2 === 0)
            this._onFrameElapsed(this, prevX, prevY);

        const camera = g.game.focusingCamera;
        if (camera instanceof Camera2D &&
            groundTop < this.getTop() &&
            this.getTop() - this.getHeight() * 2 > camera.getBottom()) {
            this._isFailed = true;
            this._onFall(this);
        }
    }

    jump(): void {
        if (this._canJump) {
            this._canJump = false;
            this.velocity.y = -PlayerChicken.JUMP_ACC;
        }
        this.glidingStep = 0;
        this.isGliding = true;
    }

    hop(opponent: Chicken, accRate: number): void {
        this._combo++;
        this.y = opponent.getTop() - this.getHeight() / 2;
        this.modified();
        this.setVelocityX(accRate + (accRate * 0.002));

        this._canJump = false;
        this.velocity.y = -PlayerChicken.JUMP_ACC;
        this.glidingStep = 0;
        // this.isGliding = true;
    }

    collideFront(opponent: Chicken, accRate: number): void {
        this.setVelocityX(accRate);
        this.x = opponent.getLeft() - this.getWidth() * 0.5;
        this.modified();
    }

    collideBack(opponent: Chicken, accRate: number): void {
        this.setVelocityX(accRate);
        this.x = opponent.getRight() + this.getWidth() * 0.5;
        this.modified();
    }

    private setVelocityX(accRate: number): void {
        this.velocity.x = Math.min(this.velocity.x * accRate, g.game.width * 0.1);
    }

    canJump(): boolean { return this._canJump; }

    fall(): void {
        if (this.isGliding) {
            this.glidingStep = 0;
            this.isGliding = false;
        }
    }

    init(): void {
        this.velocity = { x: Chicken.MIN_VX, y: Chicken.MIN_VY };
        this.glidingStep = 0;
        this._canJump = false
        this.isGliding = false;
        this._isFailed = false;
    }

    getVelocityX(): number { return this.velocity.x; }

    getVelocityXRate(): number { return this.velocity.x / (g.game.width * 0.1); }

    isFalling(): boolean { return this.velocity.y > 0; }

    get isFailed(): boolean { return this._isFailed; }

    set onFrameElapsed(callback: (chiken: PlayerChicken, x: number, y: number) => void) { this._onFrameElapsed = callback; }

    set onMove(callback: (chicken: PlayerChicken, x: number, y: number) => boolean) { this._onMove = callback; }

    set onFall(callback: (chicken: PlayerChicken) => void) { this._onFall = callback; }

    private canGliding(): boolean {
        return !this._isFailed && this.isGliding && this.isFalling();
    }

    private runAnimation(): void {
        this.frames = [0, 1, 2];
        this.frameNumber = 0;
        this.modified();
    }

    private glidingAnimation(): void {
        this.frames = [3, 4];
        this.frameNumber = 0;
        this.modified();
    }
}