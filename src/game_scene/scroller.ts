export class Scroller {

    private _onScrollStep: () => void;
    private x = 0;
    private vx = 0;

    constructor(
        private _accPerFrame: number,
        private _maxAcceleration: number,
        private framePeriod: number,
    ) { }

    step(): void {

        const prevX = this.x;
        this.x += this._accPerFrame;
    }

    accelerate(accPerFrame: number): void {
        this._accPerFrame = Math.min(this._maxAcceleration, this._accPerFrame + accPerFrame);
    }

    set onScrollStep(callback: () => void) { this._onScrollStep = callback; }
}