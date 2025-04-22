import { BlockConnection } from '../src/blockConnection.js'
import Phaser from 'phaser';
const GAME_NAME = "Stack 'n roll";

document.title = GAME_NAME;

const DEFAULT_GAME_DURATION = 60;
const INIT_CAR_POSITION = { x: 250, y: 700 };

// Phaser 3 game with magnetic blocks - fixed version
class MagneticBlocksGame extends Phaser.Scene {
    constructor() {
        super('MagneticBlocksScene');
        
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
        this.blockConnector = new BlockConnection(this, this.blocks, this.matter);
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
        this.load.image('keyboard', 'assets/keyboard-template-2.png');
        this.load.image('start-btn', 'assets/start-btn.png');
        this.load.image('pause-btn', 'assets/pause-btn.png');
        this.load.image('build-btn', 'assets/build-btn.png');
        this.load.image('timer-box', 'assets/timer-box.png');
        
        this.load.image('car', 'assets/truck-363-100.png');
        // this.load.image('car', 'assets/truck.png');
        this.load.image('ground', 'assets/road.png');
        this.load.image('r-wall', 'assets/rigth-wall.png');
        //this.blockConnector.init();
    }

    createBlocs() {
        this.createBlocks('blue-square-block');
        this.createBlocks('yellow-square-block');
        this.createBlocks("red-square-block");
        this.createBlocks("green-square-block");
        this.createDoor("blue-door");
        this.createDoor('red-door');
        this.createSquareTriangle('blue-square-triangle-block');
        this.createSquareTriangle('green-square-triangle-block');
        this.createSquareTriangle('yellow-square-triangle-block');
        this.createSquareTriangle('red-square-triangle-block');
    }
    
    createVehicle() {
        // const vertices = [
        //     { x: 0, y: 150 },   // Bottom left vertex
        //     { x: 545, y: 150 },    // Bottom right vertex
        //     { x: 545, y: 0 },
        //     { x: 440, y: 0},
        //     { x: 440, y: 150-60},
        //     { x: 440 - 20, y: 150-60 },
        //     { x: 440 - 20, y: 150 - 90},
        //     { x: 440 - 150, y: 150 - 90},
        //     { x: 440 - 150, y: 150 - 60},
        //     { x: 0, y: 150 - 60},
        //     // Top left vertex (making the right angle)
        // ];
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

        this.blocks.push(block);
        this.listenToPointerDown(block);

    }

    listenToPointerDown(block) {
        block.on('pointerdown', () => {

            this.selectedBlock = block;

            this.selectedBlock.setTint(0xff0000); 
        });

        block.on('pointerup', () => {
            if (this.selectedBlock) {
                this.selectedBlock.clearTint();
            }
        });
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
            
            this.blocks.push(block);
            this.listenToPointerDown(block);
        }
    }

    create() {
        // Reset arrays when scene starts/restarts
        this.blocks = [];
        this.joints = [];
        this.matter.add.mouseSpring();
        this.matter.world.setBounds(0, 0, 1200, 745);

        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // Create ground
        // this.ground = this.matter.add.image(400, 875, 'ground', null, { 
        //     isStatic: true,
        //     friction: 0.5
        // });

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
    }

    createIdleLayer() {
        this.launchButton = this.add.image(600, 100, 'build-btn')
        .setInteractive()
        .on('pointerdown', () => this.start());
        
        this.idleLayer = this.add.layer();
        this.idleLayer.add(this.launchButton);
        this.idleLayer.setVisible(true);
    }
    
    createInGameButton() {
        this.startButton = this.add.image(600, 100, 'start-btn')
            .setInteractive()
            .setVisible(false);

        this.startButton.on('pointerdown', () => {
            this.resume();
            this.pauseButton.setVisible(true);
            this.startButton.setVisible(false);
        });


        this.pauseButton = this.add.image(600, 100, 'pause-btn')
            .setInteractive()
            .setVisible(true)
            .on('pointerdown', () => {
                this.pause();
                this.pauseButton.setVisible(false);
                this.startButton.setVisible(true);
            });
    }
    
    createInGameLayer() {
        const keyboard = this.add.image(150, 100, 'keyboard');
        const timerBox = this.add.image(1080, 100, 'timer-box');
        this.timerCountText = this.add.text(1060, 65, `${this.timerCount}`, {
            fontSize: '75px',
            fontStyle: 'bold',
            align: 'right'
        });

        this.createInGameButton();
        this.inGameLayer = this.add.layer();
        this.inGameLayer.add([keyboard, timerBox, this.timerCountText, this.pauseButton, this.startButton]);
        this.inGameLayer.setVisible(false);

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
        this.input.keyboard.on('keydown-D', () => {
            if (this.selectedBlock) {
                this.selectedBlock.destroy();
            }
        });
    }
    
    gameOver() {
        clearInterval(this.textUpdateInterval);
        this.car.setStatic(false);
        this.runningCar = true;
        this.pauseButton.setVisible(false);
        setTimeout(() => {
            this.blocks.forEach(node => node.destroy());
            this.inGameLayer.setVisible(false);
            this.pauseButton.setVisible(true);
            this.launchButton.setVisible(true);
            this.inGame = false;
            this.runningCar = false;
        }, 4000);
    }

    start() {
        this.car.setPosition(INIT_CAR_POSITION.x, INIT_CAR_POSITION.y);
        this.createBlocs();
        this.inGame = true;
        this.timerCount = DEFAULT_GAME_DURATION;
        this.launchButton.setVisible(false);
        this.inGameLayer.setVisible(true);
        this.timerCountText.setText(`${this.timerCount}s`);
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
        }, 1000);
    }

    startEndTimeout() {
        this.endTimeout = setTimeout(() => {
            this.gameOver();
        }, this.timerCount * 1000);
    }
    
    update() {
        if (this.inGame) {
            this.timerCountText.setText(`${this.timerCount}`);
        }

        if (this.runningCar) {
            this.launchCar();
        }

        // Handle magnetic attractions between blocks
        //this.applyMagneticForces();
        
        // Form solid connections when blocks are close enough
        //this.formConnections();
        // this.blockConnector.formConnections();
        // this.blockConnector.update();

        //this.renderConnections();

        if (this.joints.length) {

            console.log(this.joints);
        }
    }
    
    onDragStart(pointer, gameObject) {
        // Store reference to the dragged block
        this.draggedBlock = gameObject;
        
        // Temporarily disable gravity for the dragged object
        gameObject.setStatic(true);
        gameObject.setSensor(false);
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
        // Re-enable physics for the dragged object
        gameObject.setStatic(false);
        gameObject.setSensor(true);
        this.draggedBlock = null;
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
            debug: true
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
`
;

// Initialize the game
const game = new Phaser.Game(config);