import { Camera2D } from "../common/entity/camera2D";
import { FilledRect2D } from "../common/entity/filledRect2D";

export class Background extends FilledRect2D {

    constructor(scene: g.Scene, y: number, height: number, cssColor: string) {
        super({
            scene: scene,
            width: g.game.width,
            height: height,
            x: 0,
            y: y,
            cssColor: cssColor,
            opacity: 0.8,
        });
    }

    override render(renderer: g.Renderer, camera?: g.Camera): void {
        if (camera instanceof Camera2D) {
            if (this.getTop() > camera.getBottom() ||
                this.getBottom() < camera.getTop()) {
                return;
            }
        }
        super.render(renderer, camera);
    }
}