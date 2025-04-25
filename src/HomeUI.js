const Catalog = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
    title: 'title',
};

class HomeUI {
    constructor() {}

    /**
     * @param {Phaser.Scene} scene 
     */
    preload(scene) {
        scene.load.image(Catalog.title, 'assets/title.png');
        scene.load.image(Catalog.easy, 'assets/easy-green.png');
        scene.load.image(Catalog.medium, 'assets/medium-yellow.png');
        scene.load.image(Catalog.hard, 'assets/hard.png');
    }

    /**
     * @param {Phaser.Scene} scene
     * @param {(value: 'easy' | 'medium' | 'hard') => void} onClick 
     */
    add(scene, onClick) {
        this.layer = scene.add.layer();
        const title = scene.add.image(600, 100, Catalog.title);

        this.easy = scene.add.image(600 - 225, 400, Catalog.easy)
            .setInteractive()
            .on('pointerover', () => {
                this.easy.setScale(this.easy.scale + 0.1);
            })
            .on('pointerout', () => {
                this.easy.setScale(this.easy.scale - 0.1);
            })
            .on('pointerdown', () => {
                onClick("easy");
                this.hide();
            });

        this.medium = scene.add.image(600, 400, Catalog.medium)
            .setInteractive()
            .on('pointerover', () => {
                this.medium.setScale(this.medium.scale + 0.1);
            })
            .on('pointerout', () => {
                this.medium.setScale(this.medium.scale - 0.1);
            })
            .on('pointerdown', () => {
                onClick("medium");
                this.hide();
            });

        this.hard = scene.add.image(600 + 225, 400, Catalog.hard)
            .setInteractive()
            .on('pointerover', () => {
                this.hard.setScale(this.hard.scale + 0.1);
            })
            .on('pointerout', () => {
                this.hard.setScale(this.hard.scale - 0.1);
            })
            .on('pointerdown', () => {
                onClick("hard");
                this.hide();
            });
        
        this.layer.add([title, this.easy, this.medium, this.hard]);
    }

    show() {
        this.layer.setVisible(true);
    }

    hide() {
        this.layer.setVisible(false);
    }
}

export default new HomeUI();