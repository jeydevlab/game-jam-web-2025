export class BlockConnection {
    constructor(scene, blocks, matter) {
        this.scene = scene;
        this.blocks = blocks;
        this.matter = matter;
    }
    
    // 1. SNAP EFFECT - Add this to your existing code

    formConnections() {
        // Create physical joints between blocks with edges that get close enough
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = i + 1; j < this.blocks.length; j++) {
                const blockA = this.blocks[i];
                const blockB = this.blocks[j];
                
                // Skip if blocks are already connected
                if (this.areBlocksConnected(blockA, blockB)) {
                    continue;
                }
                
                // Find the closest edges between the two blocks
                const edgeInfo = this.findClosestEdges(blockA, blockB);
                
                // If edges are close enough, create a joint
                if (edgeInfo.distance <= this.connectionThreshold) {
                    // Check if edges are nearly aligned (for snap effect)
                    if (this.shouldSnapEdges(edgeInfo)) {
                        this.alignBlockEdges(blockA, blockB, edgeInfo);
                    }
                    
                    this.connectBlocks(blockA, blockB, edgeInfo);
                    
                    // Provide haptic/visual feedback
                    this.provideMagneticFeedback(blockA, blockB, edgeInfo);
                } else if (edgeInfo.distance <= this.attractionThreshold) {
                    // Show connection preview when blocks are getting close
                    this.showConnectionPreview(blockA, blockB, edgeInfo);
                }
            }
        }
    }

    shouldSnapEdges(edgeInfo) {
        // Check if edges are nearly parallel (for rectangular blocks)
        // edgeA and edgeB are indices (0=top, 1=right, 2=bottom, 3=left)
        
        // If opposite edges (0-2 or 1-3), they should be parallel
        const oppositeEdges = (edgeInfo.edgeA + 2) % 4 === edgeInfo.edgeB ||
                            (edgeInfo.edgeB + 2) % 4 === edgeInfo.edgeA;
                            
        // If adjacent edges, they should be perpendicular
        const adjacentEdges = Math.abs(edgeInfo.edgeA - edgeInfo.edgeB) % 2 === 1;
        
        // Calculate angle between edges
        const angleA = this.getEdgeAngle(edgeInfo.edgeA);
        const angleB = this.getEdgeAngle(edgeInfo.edgeB);
        let angleDiff = Math.abs(angleA - angleB);
        
        // Normalize angle to [0, 90] degrees
        if (angleDiff > 90) angleDiff = 180 - angleDiff;
        if (adjacentEdges) angleDiff = Math.abs(90 - angleDiff);
        
        // If angles are within tolerance, snap them
        return angleDiff < 10; // 10 degrees tolerance
    }

    getEdgeAngle(edgeIndex) {
        // Convert edge index to angle in degrees
        // 0=top (0°), 1=right (90°), 2=bottom (180°), 3=left (270°)
        return edgeIndex * 90;
    }

    alignBlockEdges(blockA, blockB, edgeInfo) {
        // Temporarily disable physics while we align the blocks
        const wasEnabledA = blockA.body.isStatic;
        const wasEnabledB = blockB.body.isStatic;
        
        // Make both blocks static temporarily
        this.matter.body.setStatic(blockA.body, true);
        this.matter.body.setStatic(blockB.body, true);
        
        // Calculate the target rotation and position for perfect alignment
        const alignmentData = this.calculateAlignment(blockA, blockB, edgeInfo);
        
        // Apply the position and rotation changes with animation for a smooth effect
        this.scene.tweens.add({
            targets: blockB,
            x: alignmentData.position.x,
            y: alignmentData.position.y,
            rotation: alignmentData.rotation,
            duration: 100,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Update the physics body position and rotation
                this.matter.body.setPosition(blockB.body, {
                    x: alignmentData.position.x,
                    y: alignmentData.position.y
                });
                this.matter.body.setAngle(blockB.body, alignmentData.rotation);
                
                // Restore original static states
                this.matter.body.setStatic(blockA.body, wasEnabledA);
                this.matter.body.setStatic(blockB.body, wasEnabledB);
            }
        });
    }

    calculateAlignment(blockA, blockB, edgeInfo) {
        // Calculate the perfect alignment position and rotation
        // This is a simplified version - would need geometry calculations based on edge types
        
        // Get edge vectors (direction vectors of the edges)
        const edgeVectorA = this.getEdgeVector(blockA, edgeInfo.edgeA);
        const edgeVectorB = this.getEdgeVector(blockB, edgeInfo.edgeB);
        
        // Calculate target rotation - make edges parallel or perpendicular as needed
        let targetRotation = blockB.rotation;
        
        // For opposite edges, make them parallel but opposite direction
        if ((edgeInfo.edgeA + 2) % 4 === edgeInfo.edgeB) {
            targetRotation = blockA.rotation + Math.PI;
        } 
        // For same edges, make them parallel
        else if (edgeInfo.edgeA === edgeInfo.edgeB) {
            targetRotation = blockA.rotation + Math.PI;
        } 
        // For perpendicular alignment (adjacent edges)
        else {
            targetRotation = blockA.rotation + (Math.PI / 2) * (edgeInfo.edgeB - edgeInfo.edgeA);
        }
        
        // Normalize rotation to [-PI, PI]
        targetRotation = ((targetRotation + Math.PI) % (2 * Math.PI)) - Math.PI;
        
        // Calculate target position
        // This moves blockB so its edge perfectly aligns with blockA's edge
        const edgeMidpointA = this.getEdgeMidpoint(blockA, edgeInfo.edgeA);
        const edgeMidpointB = this.getEdgeMidpoint(blockB, edgeInfo.edgeB);
        
        // Offset based on edge normals
        const normalA = this.getEdgeNormal(edgeInfo.edgeA);
        const normalB = this.getEdgeNormal(edgeInfo.edgeB);
        
        // Calculate block sizes accounting for rotation
        const sizeA = this.getRotatedSize(blockA);
        const sizeB = this.getRotatedSize(blockB);
        
        // Offset distance should account for block dimensions
        const offsetX = (normalA.x * sizeA.width / 2) + (normalB.x * sizeB.width / 2);
        const offsetY = (normalA.y * sizeA.height / 2) + (normalB.y * sizeB.height / 2);
        
        return {
            rotation: targetRotation,
            position: {
                x: edgeMidpointA.x - (edgeMidpointB.x - blockB.x) + offsetX,
                y: edgeMidpointA.y - (edgeMidpointB.y - blockB.y) + offsetY
            }
        };
    }

    getEdgeVector(block, edgeIndex) {
        // Return normalized vector along the edge
        const angle = block.rotation + (edgeIndex * Math.PI / 2);
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    getEdgeNormal(edgeIndex) {
        // Return perpendicular vector to edge
        // 0=top (up), 1=right (right), 2=bottom (down), 3=left (left)
        const normals = [
            { x: 0, y: -1 }, // top - points up
            { x: 1, y: 0 },  // right - points right
            { x: 0, y: 1 },  // bottom - points down
            { x: -1, y: 0 }  // left - points left
        ];
        return normals[edgeIndex];
    }

    getEdgeMidpoint(block, edgeIndex) {
        const corners = this.getBlockCorners(block);
        const edge = [
            [corners[0], corners[1]], // top
            [corners[1], corners[2]], // right
            [corners[2], corners[3]], // bottom
            [corners[3], corners[0]]  // left
        ][edgeIndex];
        
        return {
            x: (edge[0].x + edge[1].x) / 2,
            y: (edge[0].y + edge[1].y) / 2
        };
    }

    getRotatedSize(block) {
        // For simplicity, we'll use the bounding box of the rotated rectangle
        const absCosSin = {
            cos: Math.abs(Math.cos(block.rotation)),
            sin: Math.abs(Math.sin(block.rotation))
        };
        
        return {
            width: block.width * absCosSin.cos + block.height * absCosSin.sin,
            height: block.width * absCosSin.sin + block.height * absCosSin.cos
        };
    }

    // 2. VARIABLE CONNECTION STRENGTHS

    connectBlocks(blockA, blockB, edgeInfo) {
        // Determine connection strength based on edge types
        const strength = this.getConnectionStrength(blockA, blockB, edgeInfo);
        
        // Create a joint at the contact points
        const joint = this.matter.constraint.create({
            bodyA: blockA.body,
            bodyB: blockB.body,
            pointA: {
                x: edgeInfo.contactPointA.x - blockA.x,
                y: edgeInfo.contactPointA.y - blockA.y
            },
            pointB: {
                x: edgeInfo.contactPointB.x - blockB.x,
                y: edgeInfo.contactPointB.y - blockB.y
            },
            stiffness: strength.stiffness,
            damping: strength.damping,
            length: 0
        });
        
        // Add joint to physics world
        this.matter.world.add(joint);
        
        // Store the connection for future reference
        this.connections.push({
            blockA,
            blockB,
            joint,
            edgeA: edgeInfo.edgeA,
            edgeB: edgeInfo.edgeB,
            strength: strength.stiffness
        });
        
        // Draw connection visually with strength indicated
        this.drawConnection(edgeInfo.contactPointA, edgeInfo.contactPointB, strength);
    }

    getConnectionStrength(blockA, blockB, edgeInfo) {
        // In a real implementation, this would check block properties (type, magnetism level)
        // Default values
        let stiffness = 0.8;
        let damping = 0.2;
        
        // Example: Different strengths based on edge types
        // Assuming blocks have types or magnetic strengths stored in their data
        const typeA = blockA.getData('type') || 'normal';
        const typeB = blockB.getData('type') || 'normal';
        const magnetismA = blockA.getData('magnetism') || 1;
        const magnetismB = blockB.getData('magnetism') || 1;
        
        // Example edge-specific strengths
        if (edgeInfo.edgeA === 0 && edgeInfo.edgeB === 2) { // Top to bottom connection
            stiffness = 0.9; // Stronger connection
            damping = 0.1;   // Less oscillation
        } else if (edgeInfo.edgeA === 1 && edgeInfo.edgeB === 3) { // Right to left connection
            stiffness = 0.85;
            damping = 0.15;
        }
        
        // Multiply by block-specific magnetism
        stiffness *= (magnetismA * magnetismB);
        
        // Weaken connection if blocks are different types
        if (typeA !== typeB) {
            stiffness *= 0.7;
        }
        
        return { stiffness, damping };
    }

    // 3. VISUAL FEEDBACK

    provideMagneticFeedback(blockA, blockB, edgeInfo) {
        // Visual feedback
        this.showConnectionEffect(edgeInfo.contactPointA, edgeInfo.contactPointB);
        
        // Sound effect
        //this.playMagneticSound();
        
        // Camera shake (subtle)
        this.scene.cameras.main.shake(50, 0.002);
        
        // Briefly flash the blocks
        this.flashBlocks([blockA, blockB]);
    }

    showConnectionEffect(pointA, pointB) {
        // Create a particle effect at connection point
        const midPoint = {
            x: (pointA.x + pointB.x) / 2,
            y: (pointA.y + pointB.y) / 2
        };
        
        // Create particle emitter if not already created
        if (!this.connectionParticles) {
            this.connectionParticles = this.scene.add.particles('particle');
        }
        
        // Emit particles
        const emitter = this.connectionParticles.createEmitter({
            x: midPoint.x,
            y: midPoint.y,
            speed: { min: 20, max: 40 },
            scale: { start: 0.6, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            quantity: 10
        });
        
        // Stop emission after a short time
        this.scene.time.delayedCall(100, () => {
            emitter.stop();
            // Clean up after particles are done
            this.scene.time.delayedCall(300, () => {
                emitter.remove();
            });
        });
    }

    playMagneticSound() {
        // Play sound effect
        if (this.scene.sound && this.scene.sound.add) {
            const sound = this.scene.sound.add('magnetic_snap');
            sound.play({
                volume: 0.5
            });
        }
    }

    flashBlocks(blocks) {
        // Flash blocks briefly to indicate connection
        blocks.forEach(block => {
            // Store original tint
            const originalTint = block.tint;
            
            // Flash white
            block.setTint(0xffffff);
            
            // Restore original tint after a moment
            this.scene.time.delayedCall(100, () => {
                block.setTint(originalTint);
            });
        });
    }

    showConnectionPreview(blockA, blockB, edgeInfo) {
        // Show a preview line when blocks are close but not yet connected
        if (!this.previewGraphics) {
            this.previewGraphics = this.scene.add.graphics();
        }
        
        // Clear previous preview
        this.previewGraphics.clear();
        
        // Calculate strength based on how close the blocks are
        // Map distance from connectionThreshold to attractionThreshold to 0-1 range
        const distanceRange = this.attractionThreshold - this.connectionThreshold;
        const normalizedDistance = (edgeInfo.distance - this.connectionThreshold) / distanceRange;
        const previewStrength = 1 - Math.max(0, Math.min(1, normalizedDistance));
        
        // Draw preview with alpha based on strength
        this.previewGraphics.lineStyle(
            2, 
            0x00ffff, 
            previewStrength * 0.7
        );
        this.previewGraphics.lineBetween(
            edgeInfo.contactPointA.x,
            edgeInfo.contactPointA.y,
            edgeInfo.contactPointB.x,
            edgeInfo.contactPointB.y
        );
        
        // Add glow effect
        this.previewGraphics.lineStyle(
            4, 
            0x00ffff, 
            previewStrength * 0.3
        );
        this.previewGraphics.lineBetween(
            edgeInfo.contactPointA.x,
            edgeInfo.contactPointA.y,
            edgeInfo.contactPointB.x,
            edgeInfo.contactPointB.y
        );
        
        // Fade out preview after 100ms if not called again
        if (this.previewFadeTimer) {
            this.previewFadeTimer.remove();
        }
        
        this.previewFadeTimer = this.scene.time.delayedCall(100, () => {
            if (this.previewGraphics) {
                this.previewGraphics.clear();
            }
        });
    }

    drawConnection(pointA, pointB, strength) {
        // Create or get graphics object for connections
        if (!this.connectionGraphics) {
            this.connectionGraphics = this.scene.add.graphics();
        }
        
        // Calculate color based on connection strength
        const strengthColor = Phaser.Display.Color.HSLToColor(
            0.6 - (strength.stiffness * 0.6), // Hue (blue to red)
            1,                                // Saturation
            0.5                               // Lightness
        ).color;
        
        // Draw connection line
        this.connectionGraphics.lineStyle(3, strengthColor, 0.8);
        this.connectionGraphics.lineBetween(
            pointA.x, pointA.y,
            pointB.x, pointB.y
        );
        
        // Add joint indicator
        this.connectionGraphics.fillStyle(strengthColor, 1);
        this.connectionGraphics.fillCircle(
            (pointA.x + pointB.x) / 2,
            (pointA.y + pointB.y) / 2,
            4
        );
    }

// Add these properties to your game class initialization:
    init() {
        // ... your existing init code ...
        
        // Thresholds
        this.connectionThreshold = 10;   // Distance at which blocks connect
        this.attractionThreshold = 30;   // Distance at which attraction preview starts
        
        // Collections
        this.connections = [];
        this.previewFadeTimer = null;
    }

    // Make sure to preload necessary assets
    preload() {
        // ... your existing preload code ...
        
        // Load particle texture for connection effect
        this.load.image('particle', 'assets/particle.png');
        
        // Load sound for magnetic snap
        this.load.audio('magnetic_snap', 'assets/sounds/snap.mp3');
    }

// Clean up in your update method to remove previews when no edges are close
    update() {
        // ... your existing update code ...
        
        // Check if any blocks are close enough for preview
        let previewActive = false;
        
        // Loop through block pairs
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = i + 1; j < this.blocks.length; j++) {
                const blockA = this.blocks[i];
                const blockB = this.blocks[j];
                
                // Skip if already connected
                if (this.areBlocksConnected(blockA, blockB)) {
                    continue;
                }
                
                // Check distance
                const edgeInfo = this.findClosestEdges(blockA, blockB);
                if (edgeInfo.distance <= this.attractionThreshold) {
                    previewActive = true;
                    break;
                }
            }
            if (previewActive) break;
        }
        
        // If no preview is active, clear preview graphics
        if (!previewActive && this.previewGraphics) {
            this.previewGraphics.clear();
        }
    }
}