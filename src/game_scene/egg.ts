import { FilledRect2D } from "../common/entity/filledRect2D";
import { Camera2D } from "../common/entity/camera2D";

export class Egg extends FilledRect2D {

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            width: 32,
            height: 32,
            cssColor: "white",
            anchorX: 0.5,
            anchorY: 0.5,
        });

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        const camera = g.game.focusingCamera as Camera2D;
        if (this.getRight() < camera.getLeft()) {
            this.destroy();
            return true;
        }
    };
}