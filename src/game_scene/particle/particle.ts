import { FilledRect2D } from "../../common/entity/filledRect2D";

export class Particle extends FilledRect2D {

    private life = g.game.fps * 0.1;

    constructor(scene: g.Scene, x: number, y: number, private vx: number, private vy: number) {
        super({
            scene: scene,
            width: 4,
            height: 4,
            x: x,
            y: y,
            cssColor: "white",
            anchorX: 0.5,
            anchorY: 0.5,
        });

        this.onUpdate.add(this.updateHandler);
    }


    private updateHandler = (): void | boolean => {
        this.x += this.vx + (g.game.random.generate() - 0.5) * this.width;
        this.y += this.vy + (g.game.random.generate() - 0.5) * this.height;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.opacity = this.life / (g.game.fps * 0.1);
        this.modified();

        this.life--;
        if (this.life <= 0) {
            this.destroy();
        }
    };
}