const Catalog = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
    title: 'title',
    creditsBtn: 'credit-btn',
    creditsPanel: 'credit-panel',
    closeBtn: 'close-btn',
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
        scene.load.image(Catalog.creditsBtn, 'assets/credits-btn.png');
        scene.load.image(Catalog.creditsPanel, 'assets/credits.png');
        scene.load.image(Catalog.closeBtn, 'assets/close-btn.png');
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

        this.creditPanel = scene.add.image(600, 350, Catalog.creditsPanel)
            .setVisible(false);
        
        this.creditBtn = scene.add.image(600, 700, Catalog.creditsBtn)
            .setInteractive()
            .on('pointerover', () => {
                this.creditBtn.setScale(this.creditBtn.scale + 0.1);
            })
            .on('pointerout', () => {
                this.creditBtn.setScale(this.creditBtn.scale - 0.1);
            })
            .on('pointerdown', () => {
                if (this.creditPanel.visible) {
                    this.easy.setInteractive();
                    this.medium.setInteractive();
                    this.hard.setInteractive();
                    this.creditBtn.setTexture(Catalog.creditsBtn);
                } else {
                    this.easy.disableInteractive(true);
                    this.medium.disableInteractive(true);
                    this.hard.disableInteractive(true);
                    this.creditBtn.setTexture(Catalog.closeBtn);
                }
                
                this.creditPanel.setVisible(!this.creditPanel.visible);
            });

        this.layer.add([title, this.easy, this.medium, this.hard, this.creditBtn, this.creditPanel]);
    }

    show() {
        this.layer.setVisible(true);
    }

    hide() {
        this.layer.setVisible(false);
    }
}

export default new HomeUI();