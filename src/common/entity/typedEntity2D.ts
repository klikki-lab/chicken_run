import { Entity2DParameterObject, Entity2D } from "./entity2D";

export interface TypedEntity2DParameterObject<T extends g.E> extends Omit<Entity2DParameterObject, "children"> {
    children?: T[];
}

/**
 * 子エンティティの型を定義できる`E`の拡張クラス。
 */
export class TypedEntity2D<T extends g.E> extends Entity2D {

    override children: T[];

    constructor(param: TypedEntity2DParameterObject<T>) {
        super({
            ...param,
            anchorX: param.anchor ?? param.anchorX,
            anchorY: param.anchor ?? param.anchorY,
            scaleX: param.scale ?? param.scaleX,
            scaleY: param.scale ?? param.scaleY,
            children: param.children,
        });
        this.children = [];
    }

    override append(e: T): void {
        super.append(e);
    }
}