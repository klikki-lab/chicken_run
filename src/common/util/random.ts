export class Random {

    constructor(private random: g.RandomGenerator) { }

    /** 
     * @returns 0 以上 1 未満のランダム値を返す。
     */
    generate(): number {
        return this.random.generate();
    }

    /**
     * @param min 最小値
     * @param max 最大値
     * @returns min 以上 max 未満のランダム値を返す。
     */
    range(min: number, max: number): number {
        return this.generate() * (max - min) + min;
    }

    /**
     * @param min 最小値
     * @param max 最大値
     * @returns min 以上 max 未満の整数のランダム値を返す。
     */
    rangeInt(min: number, max: number): number {
        return Math.floor(this.range(min, max));
    }
}