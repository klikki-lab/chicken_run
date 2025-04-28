import * as tl from "@akashic-extension/akashic-timeline";
import { Camera2D } from "../common/entity/camera2D";
import { Entity2D } from "../common/entity/entity2D";
import { FilledRect2D } from "../common/entity/filledRect2D";
import { TypedEntity2D } from "../common/entity/typedEntity2D";
import { BaseScene } from "../common/scene/baseScene";
import { AudioController, SoundParam } from "../common/util/audioController";
import { CountdownTimer } from "../common/util/countdownTimer";
import { PointEventQueue } from "../common/util/pointEventQueue";
import { Random } from "../common/util/random";
import { GameMainParameterObject } from "./../parameterObject";
import { Blur } from "./blur";
import { OpponentChicken } from "./chicken/opponentChicken";
import { PlayerChicken } from "./chicken/playerChicken";
import { ScoreLabel } from "./hud/scoreLabel";
import { TimeLabel } from "./hud/timeLabel";
import { Particle } from "./particle/particle";
import { Terrain } from "./terrain/terrain";

const MusicId = {
    BGM: "nc182381",
} as const;
const SoundId = {
    JUMP: "se_swing1",
    TRAMPLE_1: "se_hiyoko2",
    TRAMPLE_2: "se_chicken01",
    CRUSH: "se_hit_arrow",
} as const;

export class GameScene extends BaseScene<void> {

    public static readonly START_Y = g.game.height * 0.5;

    private timeline: tl.Timeline;
    private audioController: AudioController;
    private eventQueue: PointEventQueue;
    private countdownTimer: CountdownTimer;
    private random: Random;
    private backLayer: Entity2D;
    private opponentLayer: TypedEntity2D<OpponentChicken>;
    private effectLayer: Entity2D;
    private frontLayer: Entity2D;
    private hudLayer: Entity2D;
    private font: g.Font;
    private timeLabel: TimeLabel;
    private scoreLabel: ScoreLabel;
    private camera: Camera2D;
    private player: PlayerChicken;
    private terrain: Terrain;
    private totalTimeLimit: number;
    // private debug: al.Label = this.createDebugLabel();  

    constructor(param: GameMainParameterObject, isTouched: boolean, timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_chicken", MusicId.BGM,
                SoundId.JUMP, SoundId.TRAMPLE_1, SoundId.TRAMPLE_2, SoundId.CRUSH,
            ],
        });

        this.totalTimeLimit = param.sessionParameter?.totalTimeLimit ?? 80;
        this.random = new Random(param.random || g.game.random);
        this.onLoad.add(() => this.loadHandler(isTouched, timeLimit, this.random));
    }

    private loadHandler = (isTouched: boolean, timeLimit: number, random: Random): void => {
        this.font = this.createFont();

        this.backLayer = this.createBackLayer();
        this.opponentLayer = new TypedEntity2D({ scene: this, parent: this });
        this.effectLayer = this.createLayer();
        this.frontLayer = this.createLayer();
        this.hudLayer = this.createHudLayer(timeLimit);

        this.player = this.createChicken();
        this.terrain = this.createTerrain(random);
        this.camera = this.createCamera(this.player);
        this.translateCamera();
        this.frontLayer.append(this.terrain);
        this.frontLayer.append(this.player);

        this.timeline = new tl.Timeline(this);
        this.audioController = this.createAudioController(0.175, 0.2, !isTouched);
        this.eventQueue = new PointEventQueue();

        if (!isTouched) {
            this.onPointDownCapture.add(this.detectPointDownHandler);
        }

        this.startGame();
        // this.debug.y = 100;
        // this.hudLayer.append(this.debug);
    };

    private startGame(): void {
        const bg = new FilledRect2D({
            scene: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: "black",
        });
        this.hudLayer.append(bg);

        const start = this.createLabel("START");
        start.opacity = 0;
        this.hudLayer.append(start);

        this.timeline.create(start)
            .fadeIn(100, tl.Easing.easeInQuint)
            .wait(500)
            .fadeOut(100, tl.Easing.easeInQuint)
            .call(() => start.destroy());
        this.timeline.create(bg)
            .wait(700)
            .fadeOut(200, tl.Easing.easeInQuint)
            .call(() => {
                bg.destroy();

                this.audioController.playMusic(MusicId.BGM);
                this.onPointDownCapture.add(this.pointDownHandler);
                this.onPointUpCapture.add(this.pointUpHandler);
                this.onUpdate.add(this.updateHandler);
            });
    }

    private finishGame(): void {
        const margin = 2; // 念のために余裕を設けておく 
        const elapsed = Math.floor(g.game.age / g.game.fps);
        const duration = (this.totalTimeLimit - elapsed - margin) * 1000;
        this.audioController.fadeOutMusic(MusicId.BGM, Math.max(1000, duration));

        const finish = this.createLabel("FINISH");
        finish.opacity = 0;
        this.hudLayer.append(finish);

        this.timeline.create(finish)
            .fadeIn(100, tl.Easing.easeInQuint);
        this.timeline.create(finish, { loop: true })
            .scaleTo(1.05, 1.05, 500, tl.Easing.easeOutSine)
            .scaleTo(1.0, 1.0, 500, tl.Easing.easeInSine);
    }

    private detectPointDownHandler = (_ev: g.PointDownEvent): void => {
        this.audioController.enablePlaySound();
        this.onPointDownCapture.remove(this.detectPointDownHandler);
    };

    private pointDownHandler = (ev: g.PointDownEvent): void => this.eventQueue.push(ev);

    private pointUpHandler = (ev: g.PointUpEvent): void => this.eventQueue.push(ev);


    private updateHandler = (): void | boolean => {
        this.countdownTimer.update();

        //this.printDebug();
        if (this.player.isFailed) {
            return;
        }

        this.processInputQueue();

        this.player.step(this.terrain);
        this.camera.step();
        this.terrain.step(this.camera);
        this.translateCamera();

        if (g.game.age % g.game.fps === 0 &&
            this.opponentLayer.children.length <= 2 &&
            this.player.getVelocityXRate() >= 0.1) {
            this.addOpponent();
        }

        const rate = this.player.getVelocityXRate();
        if (g.game.age % (2 * Math.round(2 - rate)) === 0) {
            this.addBackgroundEffect(rate);
        }

        if (!this.countdownTimer.isFinished()) {
            const distance = Math.round(this.player.x)
            this.scoreLabel.setScore(distance);
        }
    };

    private processInputQueue(): void {
        if (this.eventQueue.isEmpty()) return;

        const ev = this.eventQueue.pop();
        if (ev instanceof g.PointDownEvent) {
            if (this.player.canJump()) {
                this.audioController.playSound(SoundId.JUMP);
            }
            this.player.jump();
        } else if (ev instanceof g.PointUpEvent) {
            this.player.fall();
        }
    }

    private translateCamera(): void {
        this.backLayer.x = this.camera.getLeft();
        this.backLayer.y = this.camera.getTop();
        this.backLayer.modified();

        this.hudLayer.x = this.camera.getLeft();
        this.hudLayer.y = this.camera.getTop();
        this.hudLayer.modified();
    }

    private addOpponent(): void {
        const opponent = new OpponentChicken(this);
        opponent.x = this.camera.getRight();
        opponent.y = this.terrain.getEndPosition().y;
        const max = 0.95;
        const min = 0.65;
        const rate = g.game.random.generate() * (max - min) + min;
        opponent.setVelocityX(rate * this.player.getVelocityX());
        opponent.onUpdate.add(() => { return opponent.run(this.terrain) });
        this.opponentLayer.append(opponent);
    }

    addBackgroundEffect(rate: number): void {
        const rect = new FilledRect2D({
            scene: this,
            width: 64 * rate + g.game.random.generate() * 128,
            height: 2 + rate * 64,
            cssColor: "white",
            opacity: 0.1 * rate,
        });
        rect.x = this.camera.getRight();
        rect.y = this.camera.getTop() + g.game.random.generate() * (g.game.height - rect.height);
        rect.onUpdate.add(() => {
            rect.x -= rate * rect.width * 0.2;
            rect.modified();
            if (rect.getRight() < this.camera.getLeft()) {
                rect.destroy();
                return true;
            }
        })
        this.effectLayer.append(rect);
    }

    private createChicken(): PlayerChicken {
        const chicken = new PlayerChicken(this);
        chicken.x = 0;
        chicken.y = GameScene.START_Y - chicken.height * 5;
        chicken.onFall = chicken => this.failed(chicken);
        chicken.onFrameElapsed = (chicken, prevX, prevY) => {
            this.emitBlur(chicken, prevX, prevY);
            if (chicken.canJump())
                this.emitParticles(chicken, 2);
        };
        chicken.onMove = (player, x, y) => {
            let isCollide = false;
            const trampledOpponents: OpponentChicken[] = [];
            const distance = player.canJump() ? player.getWidth() * 0.5 : player.getWidth() * 1.2;
            for (const opponent of this.opponentLayer.children) {
                if (g.Collision.within(x, y, opponent.x, opponent.getCenterY(), distance)) {
                    if (player.canJump()) {
                        if (player.x < opponent.x) { // 相手が前方
                            player.collideFront(opponent, 0.7);
                            opponent.collideBack(player, 0.2);
                        } else { // 相手が後方
                            player.collideBack(opponent, 1.1);
                            opponent.collideFront(player, 0.5);
                        }
                        this.audioController.playSound(SoundId.CRUSH);
                        isCollide = true;
                    } else {
                        if (player.isFalling()) {
                            opponent.trampled(0.8);
                            this.emitTrampleParticles(opponent, 8);
                            trampledOpponents.push(opponent);
                        }

                    }
                }
            }
            const tlanpleCount = trampledOpponents.length;
            if (tlanpleCount > 0) {
                const soundId = g.game.random.generate() > 0.1 ? SoundId.TRAMPLE_1 : SoundId.TRAMPLE_2;
                this.audioController.playSound(soundId);
                const minYOpponent = trampledOpponents.reduce((prev, current) => (current.y < prev.y ? current : prev));
                player.hop(minYOpponent, 1.03, tlanpleCount);
                return true;
            }
            return isCollide;
        };
        return chicken;
    }

    private emitBlur(chicken: PlayerChicken, x: number, y: number): void {
        const blur = new Blur(this, chicken);
        blur.moveTo(x, y);
        blur.opacity = chicken.getVelocityXRate() * 0.5;
        this.effectLayer.append(blur);
    }

    private emitParticles(chicken: PlayerChicken, count: number): void {
        for (let i = 0; i < count; i++) {
            const x = chicken.getLeft() + g.game.random.generate() * 8;
            const y = chicken.getBottom() - g.game.random.generate() * 8;
            const vx = (g.game.random.generate() - 0.5) * chicken.getWidth() * 0.5;
            const vy = -(g.game.random.generate() - 0.5) * 8;
            const p = new Particle(this, x, y, vx, vy);
            this.effectLayer.append(p);
        }
    }

    private emitTrampleParticles(chicken: OpponentChicken, count: number): void {
        for (let i = 0; i < count; i++) {
            const x = chicken.getCenterX() + (g.game.random.generate() - 0.5) * 4;
            const y = chicken.getTop() + (g.game.random.generate() - 0.5) * 4;
            const vx = g.game.random.generate() * chicken.getWidth() * 0.5;
            const vy = (g.game.random.generate() - 0.5) * chicken.getHeight() * 0.5;
            const p = new Particle(this, x, y, vx, vy);
            this.effectLayer.append(p);
        }
    }

    private failed(chicken: PlayerChicken): void {
        this.setTimeout(() => {
            this.terrain.visibleAll();
            const gorundTop = this.terrain.getGroundTop(chicken.x);
            chicken.y = gorundTop - chicken.getHeight() * 5;
            chicken.modified();
            chicken.init();

            this.eventQueue.clear();
        }, 1000);
    }

    private createTerrain(random: Random): Terrain {
        const periods = [
            { period: 100, rate: 0.1 },
            { period: 50, rate: 0.3 },
            { period: 10, rate: 0.6 },
        ];
        const amplitude = g.game.height * 0.25;
        const terrain = new Terrain(this, random, GameScene.START_Y, amplitude, periods);
        return terrain;
    }

    private createCamera(player: PlayerChicken): Camera2D {
        const camera = new Camera2D({
            width: g.game.width,
            height: g.game.height,
            anchor: 0.5,
        });
        const threshold = {
            left: 0.2 * camera.getWidth(),
            top: 0.6 * camera.getHeight(),
            right: 0.8 * camera.getWidth(),
            bottom: 0.8 * camera.getHeight(),
        };
        camera.x = player.getCenterX() - threshold.left + g.game.width * 0.5;
        camera.y = g.game.height * 0.2;
        camera.onUpdate.add(camera => {
            const cameraLeft = camera.getLeft();
            const leftThreshold = cameraLeft + threshold.left;
            const rightThreshold = cameraLeft + threshold.right;
            const targetX = player.getCenterX();
            let easingX = 0.5;
            let destX = camera.x;
            if (targetX > leftThreshold) {
                destX = targetX - threshold.left + camera.getWidth() * 0.5;
            } else if (targetX < rightThreshold) {
                destX = targetX - threshold.right + camera.getWidth() * 0.5;
            }
            if (destX !== camera.x) {
                camera.x += (destX - camera.x) * easingX;
                camera.modified();
            }
            // const cameraTop = camera.getTop();
            // const upThreshold = cameraTop + threshold.top;
            // const bottomThreshold = cameraTop + threshold.bottom;
            // const targetY = g.game.height * 0.52;// this.terrain.getGroundTop(player.x);
            // let easingY = 0.1;
            // let destY = camera.y;
            // if (targetY < upThreshold) {
            //     destY = targetY - threshold.top + camera.getHeight() * 0.5;
            // } else if (targetY > bottomThreshold) {
            //     destY = targetY - threshold.bottom + camera.getHeight() * 0.5;
            // }

            // if (destY !== camera.y) {
            //     camera.y += (destY - camera.y) * easingY;
            //     camera.modified();
            // }
        });
        return camera;
    }

    private createAudioController(musicVolume: number, soundVolume: number, disable: boolean): AudioController {
        const audioController = new AudioController(musicVolume, soundVolume, disable);
        audioController.addMusic(this.asset, { assetId: MusicId.BGM });
        const sounds: SoundParam[] = [
            { assetId: SoundId.JUMP },
            { assetId: SoundId.TRAMPLE_1 },
            { assetId: SoundId.TRAMPLE_2 },
            { assetId: SoundId.CRUSH },
        ];
        audioController.addSound(this.asset, ...sounds);
        return audioController;
    }

    private createHudLayer(timeLimit: number): Entity2D {
        const layer = this.createLayer();

        const margin = this.font.size * 0.25;
        this.timeLabel = new TimeLabel(this, this.font, timeLimit);
        this.timeLabel.x = margin;
        this.timeLabel.y = margin;

        this.countdownTimer = this.createCountdownTimer(timeLimit);

        this.scoreLabel = new ScoreLabel(this, this.font, 0);
        this.scoreLabel.x = g.game.width - this.scoreLabel.width - margin * 2;
        this.scoreLabel.y = margin;

        layer.append(this.timeLabel);
        layer.append(this.scoreLabel);
        return layer;
    }

    private createCountdownTimer(timeLimit: number): CountdownTimer {
        const countdownTimer = new CountdownTimer(timeLimit);
        countdownTimer.onTick = remainingSec => {
            this.timeLabel.setTime(remainingSec);
        };
        countdownTimer.onFinish = () => {
            this.timeLabel.setTime(0);
            this.finishGame();
        };
        return countdownTimer;
    }

    private createBackLayer(): Entity2D {
        const layer = this.createLayer();
        new FilledRect2D({
            scene: this,
            parent: layer,
            width: g.game.width,
            height: g.game.height,
            cssColor: "black",
            opacity: 0.8,
        });
        return layer;
    }

    private createLayer(): Entity2D { return new Entity2D({ scene: this, parent: this }); }

    private createLabel(text: string): g.Label {
        return new g.Label({
            scene: this,
            font: this.font,
            text: text,
            anchorX: 0.5,
            anchorY: 0.5,
            x: g.game.width / 2,
            y: g.game.height / 2,
        });
    }

    private createFont(): g.Font {
        return new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 48,
            fontColor: "white",
            fontWeight: "bold",
            strokeColor: "black",
            strokeWidth: 1,
            hint: {
                presetChars: "0123456789mABCDEFGHIJKLMNOPQRSTUVWXYZ",
            },
        })
    }

    // private printDebug(): void {
    //     this.debug.text =
    //         "CAMERA\n" +
    //         `top   : ${this.camera.getTop().toFixed(1)}\n` +
    //         `left  : ${this.camera.getLeft().toFixed(1)}\n` +
    //         `bottom: ${this.camera.getBottom().toFixed(1)}\n` +
    //         `right : ${this.camera.getRight().toFixed(1)}\n` +
    //         "\nCHICKEN\n" +
    //         `x     : ${this.player.x.toFixed(1)}\n` +
    //         `y     : ${this.player.y.toFixed(1)}\n` +
    //         `vx    : ${this.player.getVelocityX().toFixed(1)}\n` +
    //         ``;
    //     this.debug.invalidate();
    // }
}