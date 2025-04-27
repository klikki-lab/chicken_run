import { Camera2D } from "../common/entity/camera2D";
import { Entity2D } from "../common/entity/entity2D";
import { FilledRect2D } from "../common/entity/filledRect2D";

export class StarGate extends Entity2D {

    private _isPassing = false;

    constructor(scene: g.Scene, x: number, y: number) {
        const width = g.game.height * 0.1;
        const height = g.game.height * 0.2;
        super({
            scene: scene,
            width: width,
            height: height,
            anchorX: 0.5,
            anchorY: 0.5,
            x: x,
            y: y,
        });

        this.onUpdate.add(() => {
            const camera = g.game.focusingCamera as Camera2D;
            if (this.getRight() < camera.getLeft()) {
                this.destroy();
                return true;
            }
        });

        const count = 12;
        const div = count / 2;
        for (let i = 0; i < count; i++) {
            const angle = (2 * Math.PI / count) * i;
            const vx = Math.cos(angle);
            const vy = Math.sin(angle);
            const x = this.width / 2 + width * vx;
            const y = this.height / 2 + height * vy;
            const scale = 0.5 + 0.5 * Math.abs(1 - (i / div));
            const star = new Star(scene, x, y, scale, vx, vy);
            this.append(star);
        }
    }

    passing(): void {
        this._isPassing = true;
        this.children.forEach(star => {
            if (star instanceof Star) star.obtain();
        });
    }

    get isPassing(): boolean { return this._isPassing; }
}

class Star extends FilledRect2D {


    constructor(scene: g.Scene, x: number, y: number, scale: number, private vx: number, private vy: number) {
        super({
            scene: scene,
            width: 16,
            height: 16,
            cssColor: "white",
            anchor: 0.5,
            x: x,
            y: y,
            scale: scale,
        });

        this.onUpdate.add(() => {
            const camera = g.game.focusingCamera as Camera2D;
            if (this.localToGlobal(this).x + this.width / 2 < camera.getLeft()) {
                if (!this.destroyed()) {
                    this.destroy();
                }
            }
        });
    }

    obtain(): void {
        this.onUpdate.add(() => {
            this.x += this.vx * this.width;
            this.y += this.vy * this.height;
            this.modified();
            this.vx *= 0.8;
            this.vy *= 0.8;
            this.opacity *= 0.7;

            if (this.opacity < 0.01) {
                if (!this.destroyed()) {
                    this.destroy();
                }
            }
        });
    }
}