export class Spawning {

    _onSpawn: (x: number, y: number) => void;

    private count = 0;
    private interval = 0;

    constructor(private period: number) {
        this.interval = period;
    }

    step(x: number, y: number) {

        if (this.count++ > this.interval) {
            this._onSpawn(x, y);
            this.count = 0;
        }
    }

    set onSpawn(callback: (x: number, y: number) => void) { this._onSpawn = callback; }
}