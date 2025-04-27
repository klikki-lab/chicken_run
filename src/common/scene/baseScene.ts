import * as al from "@akashic-extension/akashic-label";

export abstract class BaseScene<T> extends g.Scene {

    public static readonly SCREEN_PADDING = 48;

    protected _onFinish?: (param: T) => void;

    /**
     * シーン終了のイベントコールバックをセットする。
     */
    set onFinish(callback: (param: T) => void) { this._onFinish = callback; }

    createDebugLabel(): al.Label {
        const font = new g.DynamicFont({
            game: g.game,
            fontFamily: "monospace",
            size: 16,
            fontColor: "white",
            strokeColor: "black",
            strokeWidth: 1,
        });
        return new al.Label({
            scene: this,
            font: font,
            text: "",
            width: 256,
        });
    }

    /**
    * 開発中に右クリックでスクリーンショットできるようにする。この処理を有効にするにはtsconfigにdomを追加すること。
    */
    enableRightClickScreenshot(): void {
        this.onPointDownCapture.add(ev => {
            if (ev.button === 2) {
                const link = document.getElementsByClassName("pure-button")[2];
                (link as HTMLAnchorElement).click();
                return;
            }
        });
    };
}