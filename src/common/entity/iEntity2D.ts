export interface IEntity2D {

    /**　
     * @returns スケールを考慮した横幅。
     */
    getWidth(): number;

    /**
     * @returns スケールを考慮した縦幅。
     */
    getHeight(): number;

    /** 
     * @returns スケールとアンカーを考慮した上座標。
     */
    getTop(): number;

    /**
     * @returns スケールとアンカーを考慮した右座標。
     */
    getRight(): number;

    /**
     * @returns スケールとアンカーを考慮した下座標。
     */
    getBottom(): number;

    /**
     * @returns スケールとアンカーを考慮した左座標。
     */
    getLeft(): number;

    /**
     * @return スケールとアンカーを考慮したセンターX座標。
     */
    getCenterX(): number;

    /**
     * @return スケールとアンカーを考慮したセンターY座標。
     */
    getCenterY(): number;

    /**
     * 移動ユーティリティメソッド。内部で`modified()`を呼ぶ。
     * @param x 移動させるX座標。
     * @param y 移動させるY座標。
     */
    translate(x: number, y: number): void;
    /**
     * 移動ユーティリティメソッド。内部で`modified()`を呼ぶ。
     * @param pos 移動させる位置。
     */
    translate(pos: g.CommonOffset): void;

    translate(arg1: number | g.CommonOffset, arg2?: number): void
}