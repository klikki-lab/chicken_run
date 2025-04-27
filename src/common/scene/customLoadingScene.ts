// import * as tl from "@akashic-extension/akashic-timeline";

export class CustomLoadingScene extends g.LoadingScene {

    // private timeline: tl.Timeline;
    private waitingAssetCount = 0;

    constructor() {
        super({
            game: g.game,
            assetIds: [],
            explicitEnd: false,
        });

        this.onLoad.add(this.loadHandler);
    }

    private loadHandler = (): void => {
        new g.FilledRect({
            scene: this,
            parent: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: "black",
            opacity: 1,
        });

        // this.onTargetReset.add(this.targetResetHandler);
        // this.onTargetAssetLoad.add(this.targetAssetLoadHandler);
        // this.onTargetReady.add(this.targetReadyHandler);
    };

    private targetResetHandler = (scene: g.Scene): void => {
        this.waitingAssetCount = this.getTargetWaitingAssetsCount();

    };

    private targetAssetLoadHandler = (asset: g.Asset): void => {
        this.progress();
    };

    private targetReadyHandler = (scene: g.Scene): void => {
        this.progress();

        this.end();
    };

    private progress = (): void => {

    };
}