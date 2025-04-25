// import Phaser from 'phaser';
import {GameUI} from "../src/GameUI.js";
import SoundManager from "../src/SoundManager.js";
import Settings from "../src/Settings.js";
import HomeUI from "../src/HomeUI.js";

const GAME_NAME = "Stack 'n roll";

document.title = GAME_NAME;

const DEFAULT_GAME_DURATION = 10;
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
        this.blocks = [];
        this.joints = [];
        this.car = null;
        this.magneticRange = 50; // Range at which blocks start attracting
        this.magnetForce = 10; // Force multiplier for attraction
        // this.magnetForce = 0.005; // Force multiplier for attraction
        this.connectionThreshold = 20; // Distance threshold for solid connection
        this.runningCar = undefined;
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
        this.load.image('yellow-square-block', 'assets/yellow-block-64.png');
        this.load.image('red-square-block', 'assets/red-block-64.png');
        this.load.image('blue-square-block', 'assets/blue-block-64.png');
        this.load.image('green-square-block', 'assets/green-block-64.png');
        this.load.image('green-door', 'assets/green-door.png');
        this.load.image('yellow-door', 'assets/yellow-door.png');
        this.load.image('red-door', 'assets/red-door.png');
        this.load.image('blue-door', 'assets/blue-door.png');
        this.load.image('blue-square-triangle-block', 'assets/blue-square-triangle.png');
        this.load.image('red-square-triangle-block', 'assets/red-square-triangle.png');
        this.load.image('yellow-square-triangle-block', 'assets/yellow-square-triangle.png');
        this.load.image('green-square-triangle-block', 'assets/green-square-triangle.png');
        
        this.load.image('build-btn', 'assets/build-btn.png');
        this.load.image('car', 'assets/truck-363-100.png');
        // this.load.image('car', 'assets/truck.png');
        this.load.image('ground', 'assets/road.png');
        this.load.image('r-wall', 'assets/rigth-wall.png');
        //this.blockConnector.init();
        this.gameUI.preload();
        SoundManager.preload(this);
        Settings.preload(this);
        HomeUI.preload(this);
    }

    createBlocs() {
        // this.createBlocks('blue-square-block');
        this.createBlocks('yellow-square-block');
        this.createBlocks("red-square-block");
        this.createBlocks("green-square-block");
        this.createDoor("blue-door");
        this.createDoor('red-door');
        // this.createSquareTriangle('blue-square-triangle-block');
        // this.createSquareTriangle('green-square-triangle-block');
        // this.createSquareTriangle('yellow-square-triangle-block');
        // this.createSquareTriangle('red-square-triangle-block');
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
    
    /**
     * 
     * @param {'blue-square-triangle-block' | 'red-square-triangle-block' | 'yellow-square-triangle-block' | 'green-square-triangle-block'} triangleColor 
     */
    createSquareTriangle(triangleColor) {
        const height = 64;
        const width = 64;
        const vertices = [
            { x: -width/2, y: height/2 },   // Bottom left vertex
            { x: width/2, y: height/2 },    // Bottom right vertex
            { x: -width/2, y: -height/2 }   // Top left vertex (making the right angle)
        ];

        let block = this.matter.add.image(
            Phaser.Math.Between(500, 1100),
            Phaser.Math.Between(200, 400),
            triangleColor,
            null,
            {
            shape: {
                type: 'fromVerts',
                verts: vertices,
                flagInternal: true
            }}
        );
        
        block.setFriction(0.8);
        block.setBounce(0);
        block.setMass(1);
        
        // Add custom properties for magnetism
        block.isMagnetic = true;
        block.color = triangleColor;
        block.connections = []; // Track connections to other blocks
        block.setInteractive();
        block.type = 'right-triangle';
        block.isBlockType = true;

        this.blocks.push(block);
        this.listenToPointerDown(block);

    }

    listenToPointerDown(block) {
        block.on('pointerdown', () => {
            SoundManager.playTake();
            this.selectedBlock = block;
            this.selectedBlock.setTint(0xff0000); 
        });

        block.on('pointerup', () => {
            if (this.selectedBlock) {
                SoundManager.playPop();
                this.selectedBlock.clearTint();
            }
        });

        block.on('pointerover', () => {
            block.setScale(block.scale + 0.1);
        });

        block.on('pointerout', () => {
            block.setScale(block.scale - 0.1);
        })
    }
    
    /**
     * 
     * @param {'green-door' | 'red-door' | 'yellow-door' | 'blue-door'} doorColor 
     */
    createDoor(doorColor) {
        let block = this.matter.add.image(
            Phaser.Math.Between(500, 1100),
            Phaser.Math.Between(200, 400),
            doorColor
        );
        
        block.setFriction(0.8);
        block.setBounce(0);
        block.setMass(1);
        
        // Add custom properties for magnetism
        block.isMagnetic = true;
        block.color = doorColor;
        block.connections = []; // Track connections to other blocks
        block.setInteractive();
        block.isBlockType = true;
        
        this.blocks.push(block);
        this.listenToPointerDown(block);
    }

    /**
     * 
     * @param {'yellow-square-block' | 'blue-square-block' | 'green-square-block' | 'red-square-block'} colorName
     */
    createBlocks(colorName) {
        // Create magnetic blocks
        for (let i = 0; i < 2; i++) {
            let block = this.matter.add.image(
                Phaser.Math.Between(500, 700),
                Phaser.Math.Between(200, 400),
                colorName
            );
            
            block.setFriction(0.8);
            block.setBounce(0);
            block.setMass(1);
            
            // Add custom properties for magnetism
            block.isMagnetic = true;
            block.connections = []; // Track connections to other blocks
            block.setInteractive();
            block.isBlockType = true;
            this.blocks.push(block);
            this.listenToPointerDown(block);
        }
    }

    create() {
        // Reset arrays when scene starts/restarts
        this.blocks = [];
        this.joints = [];
        this.matter.add.mouseSpring();
        this.matter.world.setBounds(0, 0, 1200, 800);

        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // Create ground
        this.ground = this.matter.add.rectangle(
            600,
            780,
            1200,
            100,
            { isStatic: true }
        );
        this.ground.visible = false;

        // this.matter.add.image(800, 300, 'r-wall', null, { 
        //     isStatic: true,
        //     friction: 0.5
        // });

        this.createVehicle();
        
        this.input.on('dragstart', this.onDragStart, this);
        this.input.on('drag', this.onDrag, this);
        this.input.on('dragend', this.onDragEnd, this);
        
        // Make all blocks draggable
        this.input.setDraggable(this.blocks);
        this.createInGameLayer();
        this.createIdleLayer();

        const setBlockFalling = (block) => {
            this.falledBlockCount++;
            block.isFalling = true;
            // TODO GAME OVER OR WIN
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
            if (this.selectedBlock) {
                this.selectedBlock.angle += 90; // Rotate 90 degrees
            }
        });
        this.input.keyboard.on('keydown-E', () => {
            if (this.selectedBlock) {
                this.selectedBlock.angle = 0; // Rotate 0 degrees
            }
        });
    }
    
    handleEndGame() {
        clearInterval(this.textUpdateInterval);
        this.blocks.forEach(block => {
            block.disableInteractive(true);
        });
        this.car.setStatic(false);
        this.runningCar = true;
        this.gameUI.timeout();

        setTimeout(() => {
            this.blocks.forEach(node => node.destroy());
            this.blocks = [];
            this.gameUI.end();
            this.gameUI.hide();
            HomeUI.show();
            //this.launchButton.setVisible(true);
            this.inGame = false;
            this.runningCar = false;
        }, 5000);
    }

    /**
     * @param {number} difficulty 
     */
    start(difficulty) {
        this.selectedLoseDifficulty = difficulty;
        this.car.setPosition(INIT_CAR_POSITION.x, INIT_CAR_POSITION.y);
        this.car.setStatic(true);
        this.car.setRotation(0);
        this.createBlocs();
        this.inGame = true;
        this.timerCount = DEFAULT_GAME_DURATION;
        this.falledBlockCount = 0;
        this.gameUI.newGame({ timeCount: this.timerCount, totalFallBlock: this.selectedLoseDifficulty });
        this.decrementTime();
        this.startEndTimeout();
    }
    
    pause() {
        this.matter.world.pause();
        clearInterval(this.textUpdateInterval);
        clearTimeout(this.endTimeout);
    }
    
    resume() {
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

    renderConnections() {
        // Clear any previous graphics
        if (this.connectionGraphics) {
          this.connectionGraphics.clear();
        } else {
          this.connectionGraphics = this.add.graphics();
        }
        
        this.connectionGraphics.lineStyle(2, 0x00ff00);
        
        // Draw lines between connected blocks
        for (const block of this.blocks) {
          for (const connectedBlock of block.connections) {
            this.connectionGraphics.lineBetween(
              block.x, block.y,
              connectedBlock.x, connectedBlock.y
            );
          }
        }
      }

    applyMagneticForces() {
        // Apply magnetic attraction between blocks
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = i + 1; j < this.blocks.length; j++) {
                const blockA = this.blocks[i];
                const blockB = this.blocks[j];
                
                // Skip if blocks are already connected
                if (this.areBlocksConnected(blockA, blockB)) {
                    continue;
                }
                
                // Skip if either block is being dragged
                if (blockA === this.draggedBlock || blockB === this.draggedBlock) {
                    continue;
                }

                // Calculate distance between blocks
                const dx = blockB.x - blockA.x;
                const dy = blockB.y - blockA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Apply magnetic forces if within range
                if (distance < this.magneticRange && distance > this.connectionThreshold) {
                    // Calculate force based on distance (stronger as they get closer)
                    const force = this.magnetForce * (1 - distance / this.magneticRange);
                    
                    // Apply force toward each other
                    const forceX = (dx / distance) * force;
                    const forceY = (dy / distance) * force;
                    
                    // Apply the forces
                    blockA.applyForce({ x: forceX, y: forceY });
                    blockB.applyForce({ x: -forceX, y: -forceY });
                }
            }
        }
    }
    
    formConnections() {
        // Create physical joints between blocks that get close enough
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = i + 1; j < this.blocks.length; j++) {
                const blockA = this.blocks[i];
                const blockB = this.blocks[j];
                
                // Skip if blocks are already connected
                if (this.areBlocksConnected(blockA, blockB)) {
                    continue;
                }
                
                // Calculate distance between blocks
                const dx = blockB.x - blockA.x;
                const dy = blockB.y - blockA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If blocks are close enough, create a joint
                if (distance <= this.connectionThreshold) {
                    this.connectBlocks(blockA, blockB);
                }
            }
        }
    }
    
    connectBlocks(blockA, blockB) {
        // Create a joint between blocks
        const joint = this.matter.add.constraint(
            blockA.body, 
            blockB.body, 
            0, // Length of 0 means they'll stay at current distance
            1, // Stiffness of 1 means rigid connection
            {
                pointA: { x: 0, y: 0 },
                pointB: { x: 0, y: 0 }
            }
        );
        
        // Record the connection in both blocks
        blockA.connections.push(blockB);
        blockB.connections.push(blockA);
        
        // Add joint to joints array for tracking
        this.joints.push(joint);
        console.log('add joints', joint)

        // Visual feedback of connection (optional)
        blockA.setTint(0x00ff00);
        blockB.setTint(0x00ff00);
        
        // Play a connection sound (in your game)
        // this.sound.play('connectSound');
    }
    
    areBlocksConnected(blockA, blockB) {
        // Check if blockB is in blockA's connections array
        return blockA.connections.includes(blockB);
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