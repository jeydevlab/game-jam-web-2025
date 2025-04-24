const Catalog = {
    TakeBlock: 'take-pop',
    PopBlock: 'pup-pop',
    Background: 'background',
    Truck: 'truck'
};

export const VolumeLevels = {
    'mute': 0,
    'low': 0.5,
    'high': 1,
};

const SoundVolumes = {
    Background: -0.3,
    Truck: -0.1,
    PopBlock: +0,
    TakeBlock: +0,
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

        console.log(this.background.volume);
    }

    playTruck() {
        this.truck.play();
    }

    playTake() {
        this.take.play();
    }

    playPop() {
        this.pop.play();
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
        this.background.setVolume(this.backgroundVolume);

        this.background.setMute(this.volume === VolumeLevels.mute || this.backgroundVolume === VolumeLevels.mute);
    }

    getSounds() {
        return [this.pop, this.take, this.truck];
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