import { UtilityParameterObject } from "./entity2D";
import * as GeometryUtil from "./geometryUtil";
import { IEntity2D } from "./iEntity2D";


export interface FilledRect2DParameterObject extends g.FilledRectParameterObject, UtilityParameterObject { }

export class FilledRect2D extends g.FilledRect implements IEntity2D {

    constructor(param: FilledRect2DParameterObject) {
        super({
            ...param,
            anchorX: param.anchor ?? param.anchorX,
            anchorY: param.anchor ?? param.anchorY,
            scaleX: param.scale ?? param.scaleX,
            scaleY: param.scale ?? param.scaleY,
        });
    }

    getWidth(): number { return GeometryUtil.getWidth(this); }

    getHeight(): number { return GeometryUtil.getHeight(this); }

    getTop(): number { return GeometryUtil.getTop(this); }

    getRight(): number { return GeometryUtil.getRight(this); }

    getBottom(): number { return GeometryUtil.getBottom(this); }

    getLeft(): number { return GeometryUtil.getLeft(this); }

    getCenterX(): number { return GeometryUtil.getCenterX(this); }

    getCenterY(): number { return GeometryUtil.getCenterY(this); }

    translate(x: number, y: number): void;
    translate(pos: g.CommonOffset): void;

    translate(arg1: number | g.CommonOffset, arg2?: number): void {
        if (typeof arg1 === "number") {
            this.moveTo(arg1, arg2);
        } else {
            this.moveTo(arg1);
        }
        this.modified();
    }
}