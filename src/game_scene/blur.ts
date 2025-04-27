import { Camera2D } from "../common/entity/camera2D";
import { Sprite2D } from "../common/entity/sprite2D";
import { PlayerChicken } from "./chicken/playerChicken";

export class Blur extends Sprite2D {

    constructor(scene: g.Scene, chicken: PlayerChicken) {
        super({
            scene: scene,
            src: chicken.src,
            width: chicken.width,
            height: chicken.height,
            srcWidth: chicken.width,
            srcX: chicken.width * chicken.frames[chicken.frameNumber],
            anchorX: 0.5,
            anchorY: 0.5,
            angle: chicken.angle,
        });

        this.onUpdate.add(() => {
            this.opacity *= 0.6;
            this.modified();

            if (this.opacity <= 0.01) {
                this.destroy();
                return true;
            }

            const camera = g.game.focusingCamera;
            if (camera instanceof Camera2D) {
                if (this.getRight() < camera.getLeft()) {
                    this.destroy();
                }
            }
        });
    }
}