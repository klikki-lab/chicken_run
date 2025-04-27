import { Sprite2D } from "../entity/sprite2D";

/**
 * 最低限の機能を提供するイメージボタンクラス。画像は通常時と押下時の画像を横並びにしておく。
 * {@link onPress}、{@link onPressCancelled}、{@link onClick} 、3つのイベントリスナーがある。
 */
export class Button extends Sprite2D {

    private _onPress?: (button: Button) => void;
    private _onPressCancelled?: (button: Button) => void;
    private _onClick?: (button: Button) => void;

    private isPressed: boolean = false;

    constructor(scene: g.Scene, assetId: string) {
        const asset = scene.asset.getImageById(assetId);
        super({
            scene: scene,
            src: asset,
            srcWidth: asset.width / 2,
            width: asset.width / 2,
            touchable: true,
        });

        this.onPointDown.add(this.pointDownHandler);
        this.onPointMove.add(this.pointMoveHandler);
        this.onPointUp.add(this.pointUpHandler);
    }

    removeAllListener(): void {
        if (this.isPressed) {
            this.switchPressedState(false);
        }
        this.onPointDown.remove(this.pointDownHandler);
        this.onPointMove.remove(this.pointMoveHandler);
        this.onPointUp.remove(this.pointUpHandler);
    }

    /**
     * ボタンが押された時のイベントリスナーをセットする。
     * この時点ではまだクリックしたことにはならない。
     * @param listener 押下イベントリスナー。
     */
    set onPress(listener: (button: Button) => void) { this._onPress = listener; };

    /**
     * ボタン押下状態を維持したままボタンの領域からポインタが離れた時のイベントリスナーをセットする。
     * このイベントリスナーが呼び出されるとクリック判定は行われない。
     * @param listener キャンセルイベントリスナー。
     */
    set onPressCancelled(listener: (button: Button) => void) { this._onPressCancelled = listener; };

    /**
     * ボタンがクリックされた時のイベントリスナーをセットする。
     * @param listener クリックイベントリスナー。
     */
    set onClick(listener: (button: Button) => void) { this._onClick = listener; };

    private pointDownHandler = (_ev: g.PointDownEvent): void => {
        if (this.isPressed) return;

        this.switchPressedState(true);
        this._onPress?.(this);
    }

    private pointMoveHandler = (ev: g.PointMoveEvent): void => {
        if (!this.isPressed) return;

        const ex = ev.point.x + ev.startDelta.x;
        const ey = ev.point.y + ev.startDelta.y;
        if (ex < 0 || ex > this.getWidth() || ey < 0 || ey > this.getHeight()) {
            this.switchPressedState(false);
            this._onPressCancelled?.(this);
        }
    }

    private pointUpHandler = (_ev: g.PointUpEvent): void => {
        if (!this.isPressed) return;

        this.switchPressedState(false);
        this._onClick?.(this);
    }

    private switchPressedState(isPressed: boolean): void {
        this.isPressed = isPressed;
        this.srcX = isPressed ? this.width : 0;
        this.invalidate();
    }
}