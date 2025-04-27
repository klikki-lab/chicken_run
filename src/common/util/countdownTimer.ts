export class CountdownTimer {

    private _onTick?: (remainingSec: number) => void;
    private _onFinish?: () => void;

    private _totalTime: number;
    private _remainingTime: number;
    private prevSec: number;
    private isStopped: boolean = false;

    constructor(_remainingSec: number) {
        this._totalTime = _remainingSec;
        this._remainingTime = _remainingSec;
        this.prevSec = _remainingSec;
    }

    /**
     * 毎フレーム呼び出すアップデートメソッド。
     */
    update(): void {
        if (this.isStopped) return;

        this._remainingTime -= 1 / g.game.fps;
        const sec = this.getRemainingSec();
        if (sec !== this.prevSec) {
            this.prevSec = sec;
            if (sec > 0) {
                this._onTick?.(Math.max(0, sec));
            } else if (sec >= 0) {
                this._onFinish?.();
            }
        }
    }

    /**
     * カウントダウンを停止する。
     * @returns カウントダウン中であれば `true`、そうでなければ `false`
     */
    stop(): boolean {
        if (!this.isStopped) {
            this.isStopped = true;
            return true;
        }
        return false;
    }

    /**
     * @returns カウントダウンが終了していれば`true`、そうでなければ`false`。
     */
    isFinished(): boolean { return this._remainingTime <= 0; }

    /** 
     * @returns 残り時間を切り上げた残り秒数を取得する。
     */
    getRemainingSec(): number { return Math.ceil(this._remainingTime); }

    /**
     * @returns 残り時間を取得する。
     */
    get remainingTime(): number { return this._remainingTime; }

    /**
     * @returns トータルの制限時間を取得する。
     */
    get totalTime(): number { return this._totalTime; }

    /**
     * 一秒ごとに発火するコールバックをセットする。
     * @param callback 残り秒数を引数として受け取るコールバック関数。
     */
    set onTick(callback: (remainingSec: number) => void) { this._onTick = callback; };

    /**
     * カウントダウン終了時のコールバックをセットする。
     * @param callback コールバック関数。
     */
    set onFinish(callback: () => void) { this._onFinish = callback; };
}