export class ScoreLabel extends g.Label {

    constructor(scene: g.Scene, font: g.Font, initScore: number) {
        super({
            scene: scene,
            font: font,
            text: `${initScore}m`,
            textAlign: "right",
            widthAutoAdjust: false,
            width: font.size * 8,
        });

        g.game.vars.gameState.score = initScore;
    }

    addScore(score: number): void {
        g.game.vars.gameState.score += score;
        this.setText();
    }

    setScore(score: number): void {
        g.game.vars.gameState.score = score;
        this.setText();
    }

    private setText() {
        this.text = `${g.game.vars.gameState.score}m`;
        this.invalidate();
    }
}