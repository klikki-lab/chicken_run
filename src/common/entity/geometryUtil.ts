interface Transformable extends g.CommonArea {
    scaleX: number;
    scaleY: number;
    anchorX: number;
    anchorY: number;
}

export function getCenterX(e: Transformable): number { return getLeft(e) + getWidth(e) / 2; }

export function getCenterY(e: Transformable): number { return getTop(e) + getHeight(e) / 2; }

export function getWidth(e: Transformable): number { return e.width * e.scaleX; }

export function getHeight(e: Transformable): number { return e.height * e.scaleY; }

export function getLeft(e: Transformable): number { return e.x - getWidth(e) * e.anchorX; }

export function getTop(e: Transformable): number { return e.y - getHeight(e) * e.anchorY; }

export function getRight(e: Transformable): number { return getLeft(e) + getWidth(e); }

export function getBottom(e: Transformable): number { return getTop(e) + getHeight(e); }