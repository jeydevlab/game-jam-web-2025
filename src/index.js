import Phaser from 'phaser';
import {GameUI} from "./GameUI.js";
import SoundManager from "./SoundManager.js";
import Settings from "./Settings.js";
import HomeUI from "./HomeUI.js";
import Blocks from "./Blocks.js";

const GAME_NAME = "Stack 'n roll";

document.title = GAME_NAME;

const DEFAULT_GAME_DURATION = 60;
const LOSE_BLOCK_COUNT_LEVEL = {
    EASY: 7,
    NORMAL: 5,
    HARD: 3
};

const INIT_CAR_POSITION = { x: 250, y: 700 };

// Phaser 3 game with magnetic blocks - fixed version
class MagneticBlocksGame extends Phaser.Scene {
    constructor() {
        super('MagneticBlocksScene');
        this.selectedLoseDifficulty = LOSE_BLOCK_COUNT_LEVEL.EASY;
        this.car = null;
        this.connectionThreshold = 20; // Distance threshold for solid connection
        this.runningCar = false;
        this.draggedBlock = null; // Track which block is being dragged
        this.selectedBlock = null;
        this.timerCount = DEFAULT_GAME_DURATION;
        this.inGame = false;
        this.falledBlockCount = 0;
        this.gameUI = new GameUI(this);
    }
    
    preload() {
        this.load.image('background', 'assets/background1200-900.png');
        this.load.image('block', 'assets/block.png');

        this.load.image('car', 'assets/truck-363-100.png');
        // this.load.image('car', 'assets/truck.png');
        this.load.image('ground', 'assets/road.png');
        this.load.image('r-wall', 'assets/rigth-wall.png');
        //this.blockConnector.init();
        this.gameUI.preload();
        SoundManager.preload(this);
        Settings.preload(this);
        HomeUI.preload(this);
        Blocks.preload(this);
    }
    
    createVehicle() {
        const vertices = [
            { x: 0, y: 100 },   // Bottom left vertex
            { x: 363, y: 100 },    // Bottom right vertex
            { x: 363, y: 0 },
            { x: 363 - 70, y: 0},
            { x: 363 - 70, y: 100-40},
            { x: 363 - 70 - 20, y: 100-40 },
            { x: 363 - 70 - 20, y: 100 - 55},
            { x: 363 - 70 - 100, y: 100 - 55},
            { x: 363 - 70 - 100, y: 100 - 40},
            { x: 363 - 349, y: 100 - 40},
            { x: 363 - 349, y: 100 - 90},
            { x: 363 - 360, y: 100 - 90},
            { x: 0, y: 100 - 40},
            // Top left vertex (making the right angle)
        ];

        // Create a car that will crash into our structure
        this.car = this.matter.add.image(INIT_CAR_POSITION.x, INIT_CAR_POSITION.y, 'car', null, { ignorePointer: false,
        shape: {
            type: 'fromVerts',
            verts: vertices,
            flagInternal: true
        }});
        this.car.setFriction(0.2);
        this.car.setBounce(0);
        this.car.setMass(500);
        this.car.setStatic(true);
    }

    create() {
        this.matter.add.mouseSpring();
        this.matter.world.setBounds(0, 0, 1200, 800);

        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // Create ground
        this.ground = this.matter.add.rectangle(
            600,
            780,
            1200,
            100,
            { isStatic: true, friction: 0.01 },
        );
        this.ground.visible = false;

        this.createVehicle();
        
        this.input.on('dragstart', this.onDragStart, this);
        this.input.on('drag', this.onDrag, this);
        this.input.on('dragend', this.onDragEnd, this);
        
        // Make all blocks draggable
        Blocks.setDraggable(this);
        this.createInGameLayer();
        this.createIdleLayer();

        const setBlockFalling = (block) => {
            this.falledBlockCount++;
            block.isFalling = true;
        };

        const handleCollisionStart = (event) => {
            // Check each collision pair
            event.pairs.forEach(({bodyA, bodyB}) => {
                if (!this.runningCar) {
                    return;
                }
                // Check if our object is involved in the collision
                if (bodyA.gameObject && bodyA.gameObject.isBlockType && bodyB === this.ground && !bodyA.gameObject.isFalling) {
                    setBlockFalling(bodyA.gameObject);
                } else if (bodyA === this.ground && bodyB.gameObject && bodyB.gameObject.isBlockType && !bodyB.gameObject.isFalling) {
                    setBlockFalling(bodyB.gameObject);
                }
            });
        }

        this.matter.world.on('collisionstart', handleCollisionStart);
        SoundManager.add(this);
        Settings.add(this);
    }

    createIdleLayer() {
        HomeUI.add(this, (value) => {
            switch (value) {
                case "easy":
                    this.start(LOSE_BLOCK_COUNT_LEVEL.EASY);
                    return;
                case "medium":
                    this.start(LOSE_BLOCK_COUNT_LEVEL.NORMAL);
                    return;
                case "hard":
                    this.start(LOSE_BLOCK_COUNT_LEVEL.HARD);
                    return;
            }
        });
    }

    createInGameLayer() {
        this.gameUI.createInGameButton({
            onStart: () => { this.resume() },
            onPause: () => { this.pause(); },
            initTimerCount: this.timerCount,
            initFallCount: this.falledBlockCount,
        });
        this.gameUI.hide();

        // Example: Add a key to rotate the currently selected block
        this.input.keyboard.on('keydown-R', () => {
            Blocks.handleKeyboardEvents('keydown-R');
        });
        this.input.keyboard.on('keydown-E', () => {
            Blocks.handleKeyboardEvents('keydown-E');
        });
    }
    
    handleEndGame() {
        clearInterval(this.textUpdateInterval);
        Blocks.disableBlocks();
        this.car.setStatic(false);
        this.runningCar = true;
        this.gameUI.timeout();

        setTimeout(async () => {
            this.runningCar = false;
            SoundManager.toggleBackground();
            if (this.falledBlockCount > this.selectedLoseDifficulty) {
                await this.loseRound();
            } else {
                await this.winRound();
            }
            this.backToLevelSelection();
            SoundManager.toggleBackground();
        }, 3000);
    }

    async loseRound() {
        SoundManager.playLose();
        await this.gameUI.lose()
    }

    async winRound() {
        SoundManager.playWin();
        await this.gameUI.win();
    }
    
    backToLevelSelection() {
        Blocks.clear();
        this.gameUI.end();
        this.gameUI.hide();
        HomeUI.show();
        this.inGame = false;
    }

    /**
     * @param {number} difficulty 
     */
    start(difficulty) {
        SoundManager.playPop();
        this.selectedLoseDifficulty = difficulty;
        this.car.setPosition(INIT_CAR_POSITION.x, INIT_CAR_POSITION.y);
        this.car.setStatic(true);
        this.car.setRotation(0);
        Blocks.add(this);
        this.inGame = true;
        this.timerCount = DEFAULT_GAME_DURATION;
        this.falledBlockCount = 0;
        this.gameUI.newGame({ timeCount: this.timerCount, totalFallBlock: this.selectedLoseDifficulty });
        this.decrementTime();
        this.startEndTimeout();
    }
    
    pause() {
        this.matter.world.pause();
        SoundManager.pauseTruck();
        clearInterval(this.textUpdateInterval);
        clearTimeout(this.endTimeout);
    }
    
    resume() {
        SoundManager.resumeTruck();
        this.matter.world.resume();
        this.timerCount--;
        this.decrementTime();
        this.startEndTimeout();
    }

    decrementTime() {
        this.textUpdateInterval = setInterval(() => {
            this.timerCount--;
            if (this.timerCount === 5) {
                SoundManager.playTruck();
            }
        }, 1000);
    }

    startEndTimeout() {
        this.endTimeout = setTimeout(() => {
            this.handleEndGame();
        }, this.timerCount * 1000);
    }
    
    update() {
        if (this.inGame) {
            this.gameUI.updateTimerCount(this.timerCount);
        }

        if (this.runningCar) {
            this.gameUI.updateFallBlock(this.falledBlockCount);
            this.launchCar();
        }

    }
    
    onDragStart(pointer, gameObject) {
        // Store reference to the dragged block
        this.draggedBlock = gameObject;
        
        // Temporarily disable gravity for the dragged object
        gameObject.setStatic(true);
    }
    
    onDrag(pointer, gameObject, dragX, dragY) {
        // Move the block to the pointer position
        gameObject.x = dragX;
        gameObject.y = dragY;
        
        // Update physics body position
        gameObject.body.position.x = dragX;
        gameObject.body.position.y = dragY;
    }
    
    onDragEnd(pointer, gameObject) {
        SoundManager.playPop();
        // Re-enable physics for the dragged object
        gameObject.setStatic(false);
    }

    launchCar() {
        // Apply force to the car to make it crash into the structure
        const force = { x: 0.5, y: -0.05 };
        this.car.applyForce(force);
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: [MagneticBlocksGame]
};

document.body.style = `
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #98E;
    cursor: pointer;
`
;

// Initialize the game
const game = new Phaser.Game(config);