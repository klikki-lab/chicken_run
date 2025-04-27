import { Camera2D } from "../../common/entity/camera2D";
import { FilledRect2D } from "../../common/entity/filledRect2D";

export class Point extends FilledRect2D {

    public static readonly SIZE = 10;

    constructor(scene: g.Scene, x: number, y: number);
    constructor(scene: g.Scene, pos: g.CommonOffset);

    constructor(scene: g.Scene, arg1: number | g.CommonOffset, arg2?: number) {
        super({
            scene: scene,
            cssColor: "white",
            width: Point.SIZE,
            height: Point.SIZE,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        if (typeof arg1 === "number") {
            this.moveTo(arg1, arg2);
        } else {
            this.moveTo(arg1);
        }
    }

    override render(renderer: g.Renderer, camera?: g.Camera): void {
        if (camera instanceof Camera2D) {
            if (this.getRight() < camera.getLeft() || this.getLeft() > camera.getRight() ||
                this.getTop() > camera.getBottom() || this.getBottom() < camera.getTop()) {
                return;
            }
        }
        super.render(renderer, camera);
    }
}