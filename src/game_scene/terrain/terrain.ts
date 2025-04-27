import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import { Camera2D } from "../../common/entity/camera2D";
import { TypedEntity2D } from "../../common/entity/typedEntity2D";
import { Random } from "../../common/util/random";
import { Chicken } from "../chicken/chicken";
import { Point } from "./point";

interface TerrainParam {
    period: number;
    rate: number;
}

export class Terrain extends TypedEntity2D<Point> {

    private noise2D: NoiseFunction2D;
    private frame = 0;

    constructor(scene: g.Scene, random: Random, private baseY: number, private _amplitude: number, private params: TerrainParam[]) {
        super({ scene: scene, });

        this.noise2D = createNoise2D(() => random.generate());

        const offset = Chicken.SIZE;
        const step = Point.SIZE - 1;
        const length = g.game.width + offset + step;
        for (let i = -offset; i <= length; i += step) {
            const pos = this.generateNextPointPotision(i + offset);
            const point = new Point(this.scene, pos.x, baseY + pos.y * this._amplitude);
            this.append(point);
        }
    }

    step(camera: Camera2D): void {
        const length = this.children.length;
        for (let i = length - 1; i >= 0; i--) {
            const point = this.children[i];
            if (point.getRight() < camera.getLeft()) {
                this.append(this.createNewPoint(this.children[length - 1].x));
                point.destroy();
            }
        }
    }

    private createNewPoint(endX: number): Point {
        const x = endX + Point.SIZE - 1;
        const pos = this.generateNextPointPotision(x);
        const newPoint = new Point(this.scene, pos.x, this.baseY + pos.y * this._amplitude);
        return newPoint;
    }

    getGroundTop(x: number): number {
        for (const point of this.children) {
            if (point.getLeft() <= x && x <= point.getRight())
                return point.getTop();
        }
        return Number.MAX_VALUE;
    }

    getEndPosition(): g.CommonOffset {
        const point = this.children[this.children.length - 1];
        return { x: point.x, y: point.getTop() };
    }

    visibleAll(): void {
        for (const point of this.children) {
            if (!point.visible()) point.show();
        }
    }

    private generateNextPointPotision(x: number): g.CommonOffset {
        let value = 0;
        for (const param of this.params) {
            const rate = (1 / g.game.fps) / param.period;
            value += this.noise2D(this.frame * rate, 0) * param.rate;
        }
        this.frame++;
        return { x: x, y: value };
    }
}