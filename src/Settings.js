import SoundManager from "./SoundManager.js";

const Catalog = {
    Button: 'button',
    Panel: 'panel',
    Mute: 'mute',
    Low: 'low',
    High: 'high'
}

const VolumeLevelsImage = {
    low: Catalog.Low,
    high: Catalog.High,
    mute: Catalog.Mute
};

class Settings {
    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    preload(scene) {
        scene.load.image(Catalog.Button, 'assets/setting-btn.png');
        scene.load.image(Catalog.Panel, 'assets/setting-panel.png');
        scene.load.image(Catalog.Low, 'assets/low.png');
        scene.load.image(Catalog.Mute, 'assets/mute.png');
        scene.load.image(Catalog.High, 'assets/high.png');
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    add(scene) {
        this.button = scene.add.image(60, 100, Catalog.Button)
            .setInteractive()
            .on('pointerdown', () => {
                this.panelLayer.setVisible(!this.panelLayer.visible);
            })
            .on('pointerover', () => {
                this.button.setScale(this.button.scale + 0.05);
                // this.mainVolume.setTint(0xdcdcdc);
            })
            .on('pointerout', () => {
                this.button.setScale(this.button.scale - 0.05);
                // this.mainVolume.clearTint();
            });

        this.panelLayer = scene.add.layer();
        this.panelLayer.setVisible(false);
        this.panel = scene.add.image(145, 205, Catalog.Panel);

        this.mainVolume = scene.add.image(140 + 50, 185, Catalog.High)
            .setInteractive()
            .on('pointerdown', () => {
                const nextVolume = SoundManager.getNextMainVolume();
                this.mainVolume.setTexture(VolumeLevelsImage[nextVolume]);
                SoundManager.changeMainVolume(nextVolume);
                
            })
            .on('pointerover', () => {
                this.mainVolume.setScale(this.mainVolume.scale + 0.1);
                // this.mainVolume.setTint(0xdcdcdc);
            })
            .on('pointerout', () => {
                this.mainVolume.setScale(this.mainVolume.scale - 0.1);
                // this.mainVolume.clearTint();
            });

        this.backVolume = scene.add.image(140, 225, Catalog.High)
            .setInteractive()
            .on('pointerdown', () => {
                const nextVolume = SoundManager.getNextBackgroundVolume();
                this.backVolume.setTexture(VolumeLevelsImage[nextVolume]);
                SoundManager.changeBackgroundVolume(nextVolume);
                
            })
            .on('pointerover', () => {
                this.backVolume.setScale(this.backVolume.scale + 0.1);
                // this.mainVolume.setTint(0xdcdcdc);
            })
            .on('pointerout', () => {
                this.backVolume.setScale(this.backVolume.scale - 0.1);
                // this.mainVolume.clearTint();
            });
        this.panelLayer.add([this.panel, this.mainVolume, this.backVolume]);

    }
}

export default new Settings();