// import Phaser from 'phaser';

const IMAGE_CONSTANTS = {
    'fall-block': 'fall-block',
    'start-btn': 'start-btn',
    'pause-btn': 'pause-btn',
    'keyboard': 'keyboard',
    'build-btn': 'build-btn',
    'timer-box': 'timer-box',
    'goal': 'goal'
};

export class GameUI {
    constructor(
        scene
    ) {
        this.scene = scene;
    }

    newGame({timeCount, totalFallBlock}) {
        this.pauseButton.setVisible(true);
        this.goalSection.setVisible(true);
        this.inGameLayer.setVisible(true);
        this.updateTimerCount(timeCount);
        this.updateFallTotalBlock(totalFallBlock);
    }
    
    hide() {
        this.inGameLayer.setVisible(false);
        this.fallBlockLayer.setVisible(false);
    }
    
    timeout() {
        this.pauseButton.setVisible(false);
        this.goalSection.setVisible(false);
        this.fallBlockLayer.setVisible(true);
    }
    
    createInGameButton({ onStart, onPause, initTimerCount, initFallCount }) {
        this.inGameLayer = this.scene.add.layer();
        const keyboard = this.scene.add.image(150, 100, IMAGE_CONSTANTS.keyboard);
        const timerBox = this.scene.add.image(1080, 100, IMAGE_CONSTANTS["timer-box"]);
        this.timerCountText = this.scene.add.text(1080, 65, `${initTimerCount}`, {
            fontSize: '75px',
            fontStyle: 'bold',
            align: 'right'
        });
        
        this.goalSection = this.scene.add.image(170, 210, IMAGE_CONSTANTS.goal);
        
        this.startButton = this.scene.add.image(600, 100, IMAGE_CONSTANTS["start-btn"])
            .setInteractive()
            .setVisible(false);

        this.startButton.on('pointerdown', () => {
            onStart();
            this.pauseButton.setVisible(true);
            this.startButton.setVisible(false);
        });


        this.pauseButton = this.scene.add.image(600, 100, IMAGE_CONSTANTS["pause-btn"])
            .setInteractive()
            .setVisible(true)
            .on('pointerdown', () => {
                onPause();
                this.pauseButton.setVisible(false);
                this.startButton.setVisible(true);
            });
        
        this.createFallBlockSection(initFallCount);
        this.inGameLayer.add([
            this.startButton, this.pauseButton, this.goalSection,
            this.fallBlockLayer,
            keyboard,
            timerBox, this.timerCountText]);
    }
    
    createFallBlockSection(initCount, totalCount) {
        this.fallBlockBackground = this.scene.add.image(1025, 200, IMAGE_CONSTANTS["fall-block"]);
        this.fallBlockCountValue = this.scene.add.text(1050, 175, `${initCount}`, {
            fontSize: '60px',
            fontStyle: 'bold',
            align: 'right'
        });
        this.fallBlockTotalCountValue = this.scene.add.text(1125, 165, `${totalCount}`, {
            fontSize: '60px',
            fontStyle: 'bold',
            align: 'right'
        });
        this.fallBlockLayer = this.scene.add.layer();
        this.fallBlockLayer.add([
            this.fallBlockBackground, this.fallBlockCountValue, this.fallBlockTotalCountValue,
        ]);
        this.fallBlockLayer.setVisible(true);
    }
    
    preload() {
        this.scene.load.image(IMAGE_CONSTANTS.keyboard, 'assets/keyboard-template-2.png');
        this.scene.load.image(IMAGE_CONSTANTS["timer-box"], 'assets/timer-box.png');
        this.scene.load.image(IMAGE_CONSTANTS["start-btn"], 'assets/start-btn.png');
        this.scene.load.image(IMAGE_CONSTANTS["pause-btn"], 'assets/pause-btn.png');
        this.scene.load.image(IMAGE_CONSTANTS["fall-block"], 'assets/fall-block3.png');
        this.scene.load.image(IMAGE_CONSTANTS.goal, 'assets/place-block.png');
    }
    
    updateTimerCount(value) {
        this.timerCountText.setText(`${value}`);
    }
    
    updateFallBlock(value) {
        this.fallBlockCountValue.setText(`${value}`);
    }

    updateFallTotalBlock(value) {
        this.fallBlockTotalCountValue.setText(`${value}`);
    }
}