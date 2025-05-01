import * as al from "@akashic-extension/akashic-label";
import * as tl from "@akashic-extension/akashic-timeline";
import { Camera2D } from "../common/entity/camera2D";
import { Entity2D } from "../common/entity/entity2D";
import { FilledRect2D } from "../common/entity/filledRect2D";
import { Button } from "../common/gui/button";
import { BaseScene } from "../common/scene/baseScene";
import { CountdownTimer } from "../common/util/countdownTimer";
import { PointEventQueue } from "../common/util/pointEventQueue";
import { Random } from "../common/util/random";
import { WindowUtil } from "../common/util/windowUtil";
import { PlayerChicken } from "../game_scene/chicken/playerChicken";
import { GameScene } from "../game_scene/gameScene";
import { Terrain } from "../game_scene/terrain/terrain";
import { GameMainParameterObject } from "./../parameterObject";

export class TitleScene extends BaseScene<boolean> {

    private timeline: tl.Timeline;
    private eventQueue: PointEventQueue;
    private countdownTimer: CountdownTimer;
    private backLayer: Entity2D;
    private frontLayer: Entity2D;
    private player: PlayerChicken;
    private terrain: Terrain;
    private camera: Camera2D;
    private font: g.Font;
    private timeLabel: g.Label;

    private isTouched = false;
    private isFinish = false;

    constructor(_param: GameMainParameterObject, timeLimit: number) {
        super({
            game: g.game,
            assetIds: ["img_chicken", "img_start_button"],
        });

        this.onLoad.add(() => this.loadHandler(timeLimit));
    }

    private loadHandler = (timeLimit: number): void => {
        this.timeline = new tl.Timeline(this);

        this.backLayer = this.createBackLayer();
        this.frontLayer = this.createLayer();
        this.player = this.createChicken();
        this.terrain = this.createTerrain();
        this.camera = this.createCamera(this.player);
        this.translateCamera();

        this.font = this.createFont();

        this.append(this.backLayer);
        this.append(this.terrain);
        this.append(this.player);
        this.append(this.frontLayer);
        this.createDescriptions(this.frontLayer);

        if (WindowUtil.isNicovideoJpDomain()) {
            this.timeLabel = this.createTimeLabel(timeLimit);
            this.countdownTimer = this.createCountdownTimer(timeLimit);
            this.frontLayer.append(this.timeLabel);
        }
        this.frontLayer.append(this.createStartButton());

        this.eventQueue = new PointEventQueue();
        this.onPointDownCapture.add(this.detectPointDownHandler);
        this.onPointDownCapture.add(this.pointDownHandler);
        this.onPointUpCapture.add(this.pointUpHandler);
        this.onUpdate.add(this.updateHandler);
    };

    private detectPointDownHandler = (ev: g.PointDownEvent): void => {
        this.isTouched = true;
        this.onPointDownCapture.remove(this.detectPointDownHandler);
    };

    private pointDownHandler = (ev: g.PointDownEvent): void => {
        if (ev.target instanceof Button) return;
        this.eventQueue.push(ev);
    };

    private pointUpHandler = (ev: g.PointUpEvent): void => this.eventQueue.push(ev);

    private updateHandler = (): void | boolean => {
        if (this.isFinish) {
            this.player.stop();
            this.finishScene();
            return true;
        }

        if (WindowUtil.isNicovideoJpDomain()) {
            this.countdownTimer.update();
        }
        this.processInputQueue();
        this.player.step(this.terrain);
        this.camera.step();
        this.terrain.step(this.camera);
        this.translateCamera();
    };

    finishScene(): void {
        const bg = new FilledRect2D({
            scene: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: "black",
            opacity: 0,
        });
        this.frontLayer.append(bg);

        this.timeline.create(bg)
            .fadeIn(200, tl.Easing.easeInQuint)
            .call(() => {
                this.camera.translate(g.game.width / 2, g.game.height / 2);
                this._onFinish(this.isTouched);
            });
    }

    private processInputQueue(): void {
        if (this.eventQueue.isEmpty()) return;

        const ev = this.eventQueue.pop();
        if (ev instanceof g.PointDownEvent) {
            this.player.jump();
        } else if (ev instanceof g.PointUpEvent) {
            this.player.fall();
        }
    }

    private translateCamera(): void {
        this.backLayer.x = this.camera.getLeft();
        this.backLayer.y = this.camera.getTop();
        this.backLayer.modified();

        this.frontLayer.x = this.camera.getLeft();
        this.frontLayer.y = this.camera.getTop();
        this.frontLayer.modified();
    }

    private createChicken(): PlayerChicken {
        const chicken = new PlayerChicken(this);
        chicken.x = 0;
        chicken.y = GameScene.START_Y - chicken.height * 5;
        chicken.onFall = _chicken => { /* do nothing */ };
        chicken.onFrameElapsed = (_chicken, _prevX, _prevY) => { /* do nothing*/ };
        chicken.onMove = (_player, _x, _y) => { return true; };
        return chicken;
    }

    private createTerrain(): Terrain {
        const periods = [
            { period: 100, rate: 0.2 },
            { period: 50, rate: 0.3 },
            { period: 10, rate: 0.5 },
        ];
        const amplitude = g.game.height * 0.75;
        const terrain = new Terrain(this, new Random(g.game.random), GameScene.START_Y, amplitude, periods);
        return terrain;
    }

    private createCamera(player: PlayerChicken): Camera2D {
        const camera = new Camera2D({
            width: g.game.width,
            height: g.game.height,
            anchor: 0.5,
        });
        const threshold = {
            left: 0.45 * camera.getWidth(),
            top: 0.5 * camera.getHeight(),
            right: 0.5 * camera.getWidth(),
            bottom: 0.8 * camera.getHeight(),
        };
        camera.x = player.getCenterX() - threshold.left + g.game.width * 0.5;
        camera.onUpdate.add(camera => {
            const cameraLeft = camera.getLeft();
            const leftThreshold = cameraLeft + threshold.left;
            const rightThreshold = cameraLeft + threshold.right;
            const targetX = player.getCenterX();
            let destX = camera.x;
            if (targetX > leftThreshold) {
                destX = targetX - threshold.left + camera.getWidth() * 0.5;
            } else if (targetX < rightThreshold) {
                destX = targetX - threshold.right + camera.getWidth() * 0.5;
            }
            if (destX !== camera.x) {
                camera.x += (destX - camera.x) * 0.5;
                camera.modified();
            }

            const cameraTop = camera.getTop();
            const upThreshold = cameraTop + threshold.top;
            const bottomThreshold = cameraTop + threshold.bottom;
            const targetY = this.terrain.getGroundTop(player.x);
            let easing = 0.1;
            let destY = camera.y;
            if (targetY < upThreshold) {
                destY = targetY - threshold.top + camera.getHeight() * 0.5;
            } else if (targetY > bottomThreshold) {
                destY = targetY - threshold.bottom + camera.getHeight() * 0.5;
            }

            if (destY !== camera.y) {
                camera.y += (destY - camera.y) * easing;
                camera.modified();
            }
        });
        return camera;
    }

    private createDescriptions(layer: g.E) {
        const isNicovideoJpDomain = WindowUtil.isNicovideoJpDomain();
        const clickText = isNicovideoJpDomain ?
            "画面にタッチ\n  ▷ ジャンプ" : "- Tap to jump";
        const click = new al.Label({
            scene: this,
            parent: layer,
            font: this.font,
            text: clickText,
            width: this.font.size * clickText.length,
        });
        click.x = BaseScene.SCREEN_PADDING;
        click.y = BaseScene.SCREEN_PADDING;

        const holdText = isNicovideoJpDomain ?
            "ジャンプ中に長押し\n  ▷ 滑空" : "- Hold during jump to glide";
        const longPress = new al.Label({
            scene: this,
            parent: layer,
            font: this.font,
            text: holdText,
            width: this.font.size * holdText.length,
        });
        longPress.x = BaseScene.SCREEN_PADDING;
        longPress.y = click.y + longPress.height * 1.5;

        const descriptionText = isNicovideoJpDomain ?
            "より速く、より遠くへ...\uFF01\n" + "ナカマを踏むと加速する！" :
            "Go faster, go farther...!\n" + "Bounce off fellow chickens for a speed up!"
        const descriptionFontSize = this.font.size * 0.75;
        const description = new al.Label({
            scene: this,
            parent: layer,
            font: this.font,
            fontSize: descriptionFontSize,
            text: descriptionText,
            width: descriptionFontSize * descriptionText.length / 2,
        });
        description.x = BaseScene.SCREEN_PADDING * 1.5;
        description.y = g.game.height - description.height - BaseScene.SCREEN_PADDING / 2;
    }

    private createTimeLabel(timeLimit: number): g.Label {
        const fontSize = this.font.size * 0.75;
        const timeLabel = new g.Label({
            scene: this,
            font: this.font,
            fontSize: fontSize,
            text: timeLimit.toString(),
            width: fontSize * 2,
            textAlign: "right",
            widthAutoAdjust: false,
        });
        timeLabel.x = g.game.width - fontSize * 2.25;
        timeLabel.y = g.game.height - fontSize * 1.25;
        return timeLabel;
    }

    private createCountdownTimer = (timeLimit: number): CountdownTimer => {
        const countdownTimer = new CountdownTimer(timeLimit);
        countdownTimer.onTick = remainingSec => {
            this.timeLabel.text = remainingSec.toString();
            this.timeLabel.invalidate();
        };
        countdownTimer.onFinish = () => {
            this.timeLabel.text = "0";
            this.timeLabel.invalidate();
            this.isFinish = true;
        };
        return countdownTimer;
    };

    private createStartButton(): Button {
        const button = new Button(this, "img_start_button");
        button.x = g.game.width - button.width - BaseScene.SCREEN_PADDING;
        button.y = g.game.height - button.height - BaseScene.SCREEN_PADDING;
        button.onClick = _button => this.isFinish = true;
        return button;
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
}