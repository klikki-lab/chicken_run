import { Camera2D } from "../../common/entity/camera2D";
import { Terrain } from "../terrain/terrain";
import { Chicken } from "./chicken";

export class OpponentChicken extends Chicken {

    private maxVelocityX = 0;

    constructor(scene: g.Scene) {
        super(scene);

        this.anchorY = 1;
    }

    run(terrain: Terrain): void | boolean {
        this.x += this.velocity.x;
        const groundTop = terrain.getGroundTop(this.x);
        if (groundTop < Number.MAX_VALUE) {
            this.y = groundTop;
        }

        if (this.scaleX > 1) {
            this.scaleX = Math.max(this.scaleX * 0.99, 1.0);
        }
        if (this.scaleY < 1) {
            this.scaleY = Math.min(this.scaleY * 1.01, 1.0);
        }
        this.modified();

        if (this.velocity.x > this.maxVelocityX) {
            this.velocity.x = Math.max(this.velocity.x * 0.98, this.maxVelocityX);
        }

        const camera = g.game.focusingCamera;
        if (camera instanceof Camera2D &&
            (this.getRight() < camera.getLeft() ||
                this.getLeft() + this.getWidth() * 0.5 > camera.getRight())) {
            this.destroy();
        }
    }

    setVelocityX(velocityX: number): void {
        this.velocity.x = Math.min(velocityX, g.game.width / 10);
        this.maxVelocityX = velocityX;
    }

    trampled(accRate: number): void {
        this.velocity.x *= accRate;
        this.scaleX = 1.2;
        this.scaleY = 0.8;
        this.modified();
    }

    isTranpled(): boolean {
        return this.scaleX > 1 && this.scaleY < 1;
    }

    collideFront(player: Chicken, accRate: number): void {
        this.velocity.x *= accRate;
        this.x = player.getLeft() - this.getWidth() * 0.5;
        this.modified();
    }

    collideBack(player: Chicken, accRate: number): void {
        this.setVelocityX(this.velocity.x + player.vx * accRate);
        this.x = player.getRight() + this.getWidth() * 0.5;
        this.modified();
    }
} 