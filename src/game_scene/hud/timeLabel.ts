export class TimeLabel extends g.Label {

    constructor(scene: g.Scene, font: g.Font, remainingSec: number) {
        super({
            scene: scene,
            font: font,
            text: `TIME ${remainingSec.toString()}`,
        });
    }

    setTime(remainingSec: number): void {
        this.text = `TIME ${remainingSec.toString()}`;
        this.invalidate();
    }
}