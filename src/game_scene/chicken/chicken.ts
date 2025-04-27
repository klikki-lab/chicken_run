import { FrameSprite2D } from "../../common/entity/frameSprite2D";

export class Chicken extends FrameSprite2D {

    public static readonly SIZE = 80;
    protected static readonly VELOCITY_PER_FRAME = Chicken.SIZE / g.game.fps;
    protected static readonly MIN_VX = Chicken.VELOCITY_PER_FRAME * 10;
    protected static readonly MAX_VX = Chicken.VELOCITY_PER_FRAME * 30;
    protected static readonly MIN_VY = Chicken.VELOCITY_PER_FRAME * 2;

    protected velocity: g.CommonOffset;

    constructor(scene: g.Scene) {
        const src = scene.asset.getImageById("img_chicken");
        const width = Math.floor(src.width / 5);
        super({
            scene: scene,
            src: src,
            width: width,
            height: src.height,
            anchor: 0.5,
            srcWidth: width,
            srcHeight: src.height,
            frames: [0, 1, 2],
            frameNumber: 0,
            interval: 50,
        });
        this.start();

        this.velocity = { x: Chicken.MIN_VX, y: Chicken.MIN_VY };
    }

    get vx(): number { return this.velocity.x; }

    get vy(): number { return this.velocity.y; }
}