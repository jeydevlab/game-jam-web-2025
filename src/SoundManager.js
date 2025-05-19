const Catalog = {
    TakeBlock: 'take-pop',
    PopBlock: 'pup-pop',
    Background: 'background',
    Truck: 'truck',
    Lose: 'lose',
    Win: 'win',
};

export const VolumeLevels = {
    'mute': 0,
    'low': 0.5,
    'high': 1,
};

const SoundVolumes = {
    Background: -0.4,
    Truck: -0.1,
    PopBlock: +0,
    TakeBlock: +0,
    LoseBlock: -0.3,
}

class SoundManager {
    constructor() {
        this.volume = VolumeLevels.high;
        this.backgroundVolume = VolumeLevels.high;
    }

    /**
     * Load sounds
     * @param {Phaser.Scene} scene
     */
    preload(scene) {
        scene.load.audio(Catalog.Background, 'assets/sound/background.mp3');
        scene.load.audio(Catalog.TakeBlock, 'assets/sound/take-pop.mp3');
        scene.load.audio(Catalog.PopBlock, 'assets/sound/drop-pop.flac');
        scene.load.audio(Catalog.Truck, 'assets/sound/accelerates.mp3');
        scene.load.audio(Catalog.Lose, 'assets/sound/lose_song.wav');
        scene.load.audio(Catalog.Win, 'assets/sound/win_song.mp3');
    }

    /**
     * Add sounds
     * @param {Phaser.Scene} scene
     */
    add(scene) {
        this.background = scene.sound.add(Catalog.Background, {
            loop: true,
            volume: this.volume - SoundVolumes.Background,
        });
        console.log('back', this.background.volume);

        this.background.volumeLevel = SoundVolumes.Background;
        this.background.play();

        this.truck = scene.sound.add(Catalog.Truck, {
            volume: this.volume - SoundVolumes.Truck,
        });

        this.truck.volumeLevel = SoundVolumes.Truck;

        this.take = scene.sound.add(Catalog.TakeBlock, {
            volume: this.volume + SoundVolumes.TakeBlock
        });

        this.take.volumeLevel = SoundVolumes.TakeBlock;

        this.pop = scene.sound.add(Catalog.PopBlock, {
            volume: this.volume + SoundVolumes.PopBlock,
        });

        this.pop.volumeLevel = SoundVolumes.PopBlock;

        this.lose = scene.sound.add(Catalog.Lose, {
            volume: this.volume + SoundVolumes.LoseBlock,
        });
        this.lose.volumeLevel = SoundVolumes.LoseBlock;

        this.win = scene.sound.add(Catalog.Win, {
            volume: this.volume + SoundVolumes.LoseBlock,
        });
        this.win.volumeLevel = SoundVolumes.LoseBlock;
    }

    playTruck() {
        this.truck.play();
    }

    pauseTruck() {
        if (this.truck.isPlaying) {
            this.truck.pause();
        }
    }
    
    resumeTruck() {
        if (this.truck.isPaused) {
            this.truck.resume();
        }
    }
    
    playTake() {
        this.take.play();
    }

    playPop() {
        this.pop.play();
    }

    playLose() {
        this.lose.play();
    }
    
    playWin() {
        this.win.play();
    }

    toggleBackground() {
        this.background.isPlaying ? this.background.pause() : this.background.play();
    }

    /**
     * @param {'low' | 'high' | 'mute'} volumeLevel 
     */
    changeMainVolume(volumeLevel) {
        this.volume = VolumeLevels[volumeLevel];

        if (this.volume === VolumeLevels.mute) {
            for (const sound of this.getSounds()) {
                sound.setMute(true);
            }

            this.background.setMute(this.volume === VolumeLevels.mute || this.backgroundVolume === VolumeLevels.mute);
            return;
        }

        for (const sound of this.getSounds()) {
            sound.setVolume(this.volume + sound.volumeLevel).setMute(false);
        }
        this.background.setMute(this.volume === VolumeLevels.mute || this.backgroundVolume === VolumeLevels.mute);
    }

    /**
     * @param {'low' | 'high' | 'mute'} volumeLevel 
     */
    changeBackgroundVolume(volumeLevel) {
        this.backgroundVolume = VolumeLevels[volumeLevel];
        this.background.setVolume(this.backgroundVolume + this.background.volumeLevel);

        this.background.setMute(this.volume === VolumeLevels.mute || this.backgroundVolume === VolumeLevels.mute);
    }

    getSounds() {
        return [this.pop, this.take, this.truck, this.lose, this.win];
    }

    getNextMainVolume() {
        if (this.volume === VolumeLevels.low) {
            return 'high';
        } else if (this.volume === VolumeLevels.high) {
            return 'mute';
        } else {
            return 'low';
        }
    }

    getNextBackgroundVolume() {
        if (this.backgroundVolume === VolumeLevels.low) {
            return 'high';
        } else if (this.backgroundVolume === VolumeLevels.high) {
            return 'mute';
        } else {
            return 'low';
        }
    }
}

export default new SoundManager();