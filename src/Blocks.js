import SoundManager from "./SoundManager.js";

const BLOCK_FRICTION = 0.3;
const BLOCK_MASS = 1;

const Catalog = {
    yellow: {
        squareBlock: 'yellow-block',
        door: 'yellow-door',
        triangle: 'yellow-triangle',
    },
    red: {
        squareBlock: 'red-block',
        door: 'red-door',
        triangle: 'red-triangle',
    },
    green: {
        squareBlock: 'green-block',
        door: 'green-door',
        triangle: 'green-triangle',
    },
    blue: {
        squareBlock: 'blue-block',
        door: 'blue-door',
        triangle: 'blue-triangle',
    }
};

class Blocks {
    constructor() {
        this.blocks = [];
    }

    /**
     * @param {Phaser.Scene} scene
     */
    preload(scene) {
        scene.load.image(Catalog.yellow.squareBlock, 'assets/yellow-block-64.png');
        scene.load.image(Catalog.yellow.door, 'assets/yellow-door.png');
        scene.load.image(Catalog.yellow.triangle, 'assets/yellow-square-triangle.png');
        scene.load.image(Catalog.blue.squareBlock, 'assets/blue-block-64.png');
        scene.load.image(Catalog.blue.door, 'assets/blue-door.png');
        scene.load.image(Catalog.blue.triangle, 'assets/blue-square-triangle.png');
        scene.load.image(Catalog.red.squareBlock, 'assets/red-block-64.png');
        scene.load.image(Catalog.red.door, 'assets/red-door.png');
        scene.load.image(Catalog.red.triangle, 'assets/red-square-triangle.png');
        scene.load.image(Catalog.green.squareBlock, 'assets/green-block-64.png');
        scene.load.image(Catalog.green.door, 'assets/green-door.png');
        scene.load.image(Catalog.green.triangle, 'assets/green-square-triangle.png');
    }
    
    add(scene) {
        this.createBlocks(scene, Catalog.blue.squareBlock);
        this.createBlocks(scene, Catalog.yellow.squareBlock);
        this.createBlocks(scene, Catalog.red.squareBlock);
        this.createBlocks(scene, Catalog.green.squareBlock);
        this.createDoor(scene, Catalog.red.door);
        this.createDoor(scene, Catalog.blue.door);
        this.createSquareTriangle(scene, Catalog.blue.triangle);
        this.createSquareTriangle(scene, Catalog.yellow.triangle);
        this.createSquareTriangle(scene, Catalog.red.triangle);
        this.createSquareTriangle(scene, Catalog.green.triangle);
    }
    
    clear() {
        this.blocks.forEach(node => node.destroy());
        this.blocks = [];
    }
    
    disableBlocks() {
        this.blocks.forEach(block => {
            block.disableInteractive(true);
        });
    }

    /**
     * @param {Phaser.Scene} scene
     */
    setDraggable(scene) {
        scene.input.setDraggable(this.blocks);
    }
    
    /**
     *
     * @param {Phaser.Scene} scene
     * @param {'yellow-block' | 'blue-block' | 'green-block' | 'red-block'} colorName
     */
    createBlocks(scene, colorName) {
        // Create magnetic blocks
        for (let i = 0; i < 3; i++) {
            let block = scene.matter.add.image(
                Phaser.Math.Between(500, 700),
                Phaser.Math.Between(200, 400),
                colorName
            );

            block.setFriction(BLOCK_FRICTION);
            block.setBounce(0);
            block.setMass(BLOCK_MASS);

            // Add custom properties for magnetism
            block.isMagnetic = true;
            block.connections = []; // Track connections to other blocks
            block.setInteractive();
            block.isBlockType = true;
            this.blocks.push(block);
            this.listenToPointerDown(block);
        }
    }

    /**
     * @param {Phaser.Scene} scene
     * @param {'green-door' | 'red-door' | 'yellow-door' | 'blue-door'} doorColor
     */
    createDoor(scene, doorColor) {
        let block = scene.matter.add.image(
            Phaser.Math.Between(500, 1100),
            Phaser.Math.Between(200, 400),
            doorColor
        );

        block.setFriction(BLOCK_FRICTION);
        block.setBounce(0);
        block.setMass(BLOCK_MASS);

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
     * @param {Phaser.Scene} scene
     * @param {'blue-triangle' | 'red-triangle' | 'yellow-triangle' | 'green-triangle'} triangleColor
     */
    createSquareTriangle(scene, triangleColor) {
        const height = 64;
        const width = 64;
        const vertices = [
            { x: -width/2, y: height/2 },   // Bottom left vertex
            { x: width/2, y: height/2 },    // Bottom right vertex
            { x: -width/2, y: -height/2 }   // Top left vertex (making the right angle)
        ];

        let block = scene.matter.add.image(
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

        block.setFriction(BLOCK_FRICTION);
        block.setBounce(0);
        block.setMass(BLOCK_MASS);

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
     * @param {'keydown-R' | 'keydown-E'} keyboardKey
     */
    handleKeyboardEvents(keyboardKey) {
        if (!this.selectedBlock) {
            return;
        }
        if (keyboardKey === 'keydown-E') {
            this.selectedBlock.angle += 90; // Rotate 90 degrees
            return;
        }
        
        if (keyboardKey === 'keydown-R') {
            this.selectedBlock.angle = 0;
        }
    }
}

export default new Blocks();