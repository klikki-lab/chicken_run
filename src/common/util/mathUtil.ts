export namespace MathUtil {

    export function toRadian(angle: number): number {
        return Math.PI / (180 / angle);
    }

    export function toDegrees(angrad: number): number {
        return 180 * angrad / Math.PI;
    }

    export function getAngle(x1: number, y1: number, x2: number = 0, y2: number = 0): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const radians = Math.atan2(dy, dx);
        return radians * (180 / Math.PI);
    }

    export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}