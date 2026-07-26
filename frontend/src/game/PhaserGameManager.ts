import Phaser from 'phaser';
import { BalloonGameScene } from './scenes/BalloonGameScene';
import { FishRescueScene } from './scenes/FishRescueScene';
import { BikeRaceScene } from './scenes/BikeRaceScene';
import { MatchLineGameScene } from './scenes/MatchLineGameScene';
import { NumberGardenScene } from './scenes/NumberGardenScene';
import { ColorCityScene } from './scenes/ColorCityScene';
import { CastlePuzzleScene } from './scenes/CastlePuzzleScene';
import { AnimalIslandScene } from './scenes/AnimalIslandScene';
import { SpaceScienceScene } from './scenes/SpaceScienceScene';
import { MountainClimbScene } from './scenes/MountainClimbScene';

export class PhaserGameManager {
  private static instance: Phaser.Game | null = null;

  public static launch(containerId: string, sceneKey: string, sceneData: any): Phaser.Game {
    if (this.instance) {
      this.instance.destroy(true);
      this.instance = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerId,
      width: 900,
      height: 600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      backgroundColor: '#f8fafc',
      render: {
        antialias: true,
        roundPixels: true,
        powerPreference: 'high-performance'
      },
      scene: [MountainClimbScene, SpaceScienceScene, AnimalIslandScene, CastlePuzzleScene, ColorCityScene, NumberGardenScene, MatchLineGameScene, BalloonGameScene, FishRescueScene, BikeRaceScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      }
    };

    this.instance = new Phaser.Game(config);

    this.instance.events.once('ready', () => {
      this.instance?.scene.start(sceneKey, sceneData);
    });

    return this.instance;
  }

  public static stop() {
    if (this.instance) {
      this.instance.destroy(true);
      this.instance = null;
    }
  }
}
