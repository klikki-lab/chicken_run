import { Camera2D } from "../common/entity/camera2D";
import { FilledRect2D } from "../common/entity/filledRect2D";

export class Star extends FilledRect2D {

    private _isObtain = false;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            width: 128,
            height: 128,
            cssColor: "white",
            anchor: 0.5,
        });

        this.onUpdate.add(this.updateHandler);
    }

    obtain(): void {
        this._isObtain = true;
        this.hide();
    }

    get isObtain(): boolean { return this._isObtain; }

    private updateHandler = (): void | boolean => {
        const camera = g.game.focusingCamera as Camera2D;
        if (this.getRight() < camera.getLeft()) {
            this.destroy();
            return true;
        }
    };
}