// Definimos primero las clases de las escenas.
// Esto permite que el objeto 'config' las pueda referenciar.

// Máquina de estados para el movimiento del gato
// Se mantiene global para ser accesible desde ambas escenas.
const state = {
  idle: {
    onEnter() {
      if (cat) {
        cat.setVelocity(0, 0);
        cat.anims.stop();
        // Se establece el frame estático basado en la última dirección de movimiento
        switch (lastDirection) {
          case "up":
            cat.setFrame(6);
            break;
          case "down":
            cat.setFrame(0);
            break;
          case "left":
            cat.setFrame(18);
            break;
          case "right":
            cat.setFrame(12);
            break;
          default:
            cat.setFrame(0);
            break;
        }
      }
    },
    onUpdate() {
      if (cursors.shift.isDown) {
        if (cursors.left.isDown) return "run-leftC";
        if (cursors.right.isDown) return "run-rightC";
        if (cursors.up.isDown) return "run-upC";
        if (cursors.down.isDown) return "run-downC";
      } else {
        if (cursors.left.isDown) return "walk-leftC";
        if (cursors.right.isDown) return "walk-rightC";
        if (cursors.up.isDown) return "walk-upC";
        if (cursors.down.isDown) return "walk-downC";
      }
      return "idle";
    },
    onExit() {},
  },
  "walk-leftC": {
    onEnter() {
      cat.anims.play("walk-left-cat", true);
    },
    onUpdate() {
      if (!cursors.left.isDown) return "idle";
      cat.setVelocityX(-speed);
      cat.setVelocityY(0);
      return "walk-leftC";
    },
    onExit() {},
  },
  "walk-rightC": {
    onEnter() {
      cat.anims.play("walk-right-cat", true);
    },
    onUpdate() {
      if (!cursors.right.isDown) return "idle";
      cat.setVelocityX(speed);
      cat.setVelocityY(0);
      return "walk-rightC";
    },
    onExit() {},
  },
  "walk-upC": {
    onEnter() {
      if (!cat) return;
      cat.anims.play("walk-up-cat", true);
    },
    onUpdate() {
      if (!cursors.up.isDown) return "idle";
      cat.setVelocityY(-speed);
      cat.setVelocityX(0);
      return "walk-upC";
    },
    onExit() {},
  },
  "walk-downC": {
    onEnter() {
      cat.anims.play("walk-down-cat", true);
    },
    onUpdate() {
      if (!cursors.down.isDown) return "idle";
      cat.setVelocityY(speed);
      cat.setVelocityX(0);
      return "walk-downC";
    },
    onExit() {},
  },

  "run-leftC": {
    onEnter() {
      cat.anims.play("walk-left-cat", true);
    },
    onUpdate() {
      if (!cursors.left.isDown || !cursors.shift.isDown) return "idle";
      cat.setVelocityX(-runSpeed);
      cat.setVelocityY(0);
      return "run-leftC";
    },
    onExit() {},
  },
  "run-rightC": {
    onEnter() {
      cat.anims.play("walk-right-cat", true);
    },
    onUpdate() {
      if (!cursors.right.isDown || !cursors.shift.isDown) return "idle";
      cat.setVelocityX(runSpeed);
      cat.setVelocityY(0);
      return "run-rightC";
    },
    onExit() {},
  },
  "run-upC": {
    onEnter() {
      cat.anims.play("walk-up-cat", true);
    },
    onUpdate() {
      if (!cursors.up.isDown || !cursors.shift.isDown) return "idle";
      cat.setVelocityY(-runSpeed);
      cat.setVelocityX(0);
      return "run-upC";
    },
    onExit() {},
  },
  "run-downC": {
    onEnter() {
      cat.anims.play("walk-down-cat", true);
    },
    onUpdate() {
      if (!cursors.down.isDown || !cursors.shift.isDown) return "idle";
      cat.setVelocityY(runSpeed);
      cat.setVelocityX(0);
      return "run-downC";
    },
    onExit() {},
  },
};

// Clase para la escena principal (exterior)
class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene",
    });
  }

  preload() {
    this.load.image("background", "img/background.png");
    this.load.spritesheet("cat", "img/cat.png", {
      frameWidth: 120,
      frameHeight: 120,
    });
    this.load.spritesheet("portal", "img/npc/portalsSpriteSheet32x48.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    // Placeholder para los assets del castillo, edita las rutas si es necesario
    this.load.image(
      "castle_floor",
      "https://placehold.co/1000x1000/000000/white?text=Castle+Floor"
    );
    this.load.image(
      "wall",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/A1.png"
    );
    this.load.spritesheet(
      "enemy",
      "img/npc/tiny_skelly-1.1/PNG/32x32/tiny_skelly-SWEN.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 0,
        spacing: 0,
      }
    );
    this.load.audio("door_open", "img/npc/tts/1.mp3");
    this.load.image("coin", "img/coin.gif");
    // Ahora cargamos la imagen del suelo como una sola imagen, no como un spritesheet
    this.load.image(
      "castle_tiles",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/A2.png"
    );
    // Cargamos los nuevos assets para el cofre y la espada
    this.load.image(
      "chest_closed",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/T2.png"
    );
    this.load.image(
      "chest_open",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/T1.png"
    );
    this.load.image(
      "sword_icon",
      "https://placehold.co/32x32/ff4500/white?text=Espada"
    );
  }

  create() {
    const { width, height } = this.sys.game.config;
    const background = this.add.image(width / 2, height / 2, "background");

    const backgroundImageRatio = background.width / background.height;
    const gameRatio = width / height;

    if (gameRatio > backgroundImageRatio) {
      background.displayHeight = height;
      background.displayWidth = height * backgroundImageRatio;
    } else {
      background.displayWidth = width;
      background.displayHeight = width / backgroundImageRatio;
    }

    // Se crea el gato como un sprite de física
    cat = this.physics.add.sprite(27, 550, "cat").setScale(0.5);
    cat.setCollideWorldBounds(true);
    cat.body.setSize(cat.width, cat.height);

    cursors = this.input.keyboard.createCursorKeys();

    // Las animaciones se crean aquí en el método create, una vez que la textura del gato está cargada.
    this.anims.create({
      key: "walk-down-cat",
      frames: this.anims.generateFrameNumbers("cat", {
        start: 0,
        end: 5,
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-left-cat",
      frames: this.anims.generateFrameNumbers("cat", {
        start: 18,
        end: 23,
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-right-cat",
      frames: this.anims.generateFrameNumbers("cat", {
        start: 12,
        end: 17,
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-up-cat",
      frames: this.anims.generateFrameNumbers("cat", {
        start: 6,
        end: 11,
      }),
      frameRate: 5,
      repeat: -1,
    });

    // Se crea el portal como un sprite de física
    let portal = this.physics.add.sprite(700, 550, "portal").setScale(2);
    portal.body.immovable = true;
    portal.body.allowGravity = false;

    // Crea la animación del portal
    this.anims.create({
      key: "portal_active",
      frames: this.anims.generateFrameNumbers("portal", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });
    portal.play("portal_active");

    let castleDoorSound = this.sound.add("door_open");
    // Se configura la colisión que inicia la transición de escena
    this.physics.add.overlap(cat, portal, this.enterCastle, null, this);

    this.input.on(
      "pointerdown",
      function (pointer) {
        this.add.image(pointer.x, pointer.y, "coin").setScale(0.5);
      },
      this
    );

    // Inicializa la máquina de estados
    currentState = "idle";
    state[currentState].onEnter.call(this);
  }

  update() {
    const nextState = state[currentState].onUpdate.call(this);

    if (nextState !== currentState) {
      if (state[currentState].onExit) {
        state[currentState].onExit.call(this);
      }
      state[nextState].onEnter.call(this);
      currentState = nextState;
    }

    // Actualiza la última dirección de movimiento del gato
    if (cursors.left.isDown) lastDirection = "left";
    else if (cursors.right.isDown) lastDirection = "right";
    else if (cursors.up.isDown) lastDirection = "up";
    else if (cursors.down.isDown) lastDirection = "down";
  }

  // Se añade la función de transición a la escena del castillo
  enterCastle() {
    this.sound.play("door_open");
    this.scene.start("CastleScene");
  }
}

// Clase para la escena del castillo
class CastleScene extends Phaser.Scene {
  constructor() {
    super({
      key: "CastleScene",
    });
  }

  // Preload en CastleScene para asegurar que los assets estén disponibles.
  preload() {
    this.load.image(
      "castle_floor",
      "https://placehold.co/1000x1000/000000/white?text=Castle+Floor"
    );
    this.load.image(
      "wall",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/A1.png"
    );
    this.load.spritesheet(
      "enemy",
      "img/npc/tiny_skelly-1.1/PNG/32x32/tiny_skelly-SWEN.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    // Volvemos a cargar la imagen del suelo como una sola imagen
    this.load.image(
      "castle_tiles",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/A2.png"
    );
    // Cargamos los nuevos assets para el cofre y la espada
    this.load.image(
      "chest_closed",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/T2.png"
    );
    this.load.image(
      "chest_open",
      "img/castle-dungeon2_tiles/Castle-Dungeon2_Tiles/Individual_Tiles/T1.png"
    );
    this.load.image(
      "sword_icon",
      "https://placehold.co/32x32/ff4500/white?text=Espada"
    );
    // Cargamos el audio para el ataque con espada
    this.load.audio(
      "sword_slash",
      "img/melee_sounds/melee_sounds/sword_sound.wav"
    );
    this.load.audio(
      "enemy_hit",
      "img/michelbaradari-monsters/monster/paind.wav"
    ); // Ajusta la ruta
    this.load.audio(
      "enemy_death",
      "img/michelbaradari-monsters/monster/deathr.wav"
    ); // Ajusta la ruta
  }

  create() {
    const floorWidth = 1000;
    const floorHeight = 1000;

    // Se crea el piso repetible usando tileSprite sin especificar un frame
    const floorPattern = this.add.tileSprite(
      0,
      0,
      floorWidth,
      floorHeight,
      "castle_tiles"
    );
    floorPattern.setOrigin(0, 0);

    // Configurar la física del mundo
    this.physics.world.setBounds(0, 0, floorWidth, floorHeight);

    // Se crea el grupo de paredes para colisión
    const walls = this.physics.add.staticGroup();
    // Paredes de ejemplo
    walls.create(50, 250, "wall").refreshBody();
    walls.create(950, 750, "wall").refreshBody();
    walls.create(400, 0, "wall").refreshBody();
    walls.create(400, 600, "wall").refreshBody();
    walls.create(0, 300, "wall").refreshBody();
    walls.create(800, 300, "wall").refreshBody();

    // 🔥 CRUCIAL: Redefinir el gato y cursores para ESTA escena
    cat = this.physics.add.sprite(50, 50, "cat").setScale(0.5);
    cat.setCollideWorldBounds(true);
    // Configura la vida del gato y la invencibilidad
    cat.health = 100;
    cat.isInvincible = false;

    // 🔥 CRUCIAL: Redefinir los cursores del teclado
    cursors = this.input.keyboard.createCursorKeys();
    // Añade la tecla de ataque (espacio)
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Colisiones del gato con las paredes
    this.physics.add.collider(cat, walls);

    // La cámara sigue al gato
    this.cameras.main.setBounds(0, 0, floorWidth, floorHeight);
    this.cameras.main.startFollow(cat);

    // Añade el enemigo - usando la variable global
    enemy = this.physics.add.sprite(200, 200, "enemy").setScale(2);
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    enemy.setVelocity(0, 0); // No se mueve hasta que ve al jugador
    enemy.health = 50;
    enemy.isDead = false;

    // Crear animaciones para el enemigo
    this.anims.create({
      key: "enemy-down",
      frames: this.anims.generateFrameNumbers("enemy", {
        frames: [0, 1, 2],
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-left",
      frames: this.anims.generateFrameNumbers("enemy", {
        frames: [3, 4, 5],
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-right",
      frames: this.anims.generateFrameNumbers("enemy", {
        frames: [6, 7, 8],
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-up",
      frames: this.anims.generateFrameNumbers("enemy", {
        frames: [9, 10, 11],
      }),
      frameRate: 5,
      repeat: -1,
    });

    // Creamos el cofre, ya no es estático para poder cambiar su textura.
    // Puedes cambiar las coordenadas (800, 800) para reposicionarlo
    this.chest = this.physics.add
      .sprite(800, 800, "chest_closed")
      .setImmovable(true);
    // Creamos un grupo para la espada y lo hacemos invisible al principio
    this.hasSword = false;

    this.swordAttackZone = this.add.zone(0, 0, 140, 60); // Tamaño inicial para ataques horizontales
    this.physics.add.existing(this.swordAttackZone);
    this.swordAttackZone.body.setAllowGravity(false);
    this.swordAttackZone.body.enable = false;
    // Centro la hitbox correctamente
    this.swordAttackZone.body.setOffset(-70, -30);

    // Colisiones
    this.physics.add.collider(cat, walls);
    this.physics.add.collider(enemy, walls);
    this.physics.add.overlap(cat, enemy, this.playerHit, null, this);
    this.physics.add.overlap(cat, this.chest, this.getSword, null, this);

    // UI
    this.uiContainer = this.add.container(10, 10).setScrollFactor(0);

    // Texto de la ubicación
    this.locationText = this.add.text(0, 0, "Ubicación: Piso 1", {
      fontSize: "16px",
      fill: "#fff",
    });
    this.uiContainer.add(this.locationText);

    // Texto de la vida
    this.healthText = this.add.text(0, 20, "Vida: 100", {
      fontSize: "16px",
      fill: "#fff",
    });
    this.uiContainer.add(this.healthText);

    // Texto del objeto
    this.itemText = this.add.text(0, 40, "Objeto: Ninguno", {
      fontSize: "16px",
      fill: "#fff",
    });
    this.uiContainer.add(this.itemText);

    this.enemyHealthBar = this.add.graphics();
    this.gameOverText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "", {
        fontSize: "40px",
        fill: "#ff0000",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // 🔥 CRUCIAL: Reinicializar la máquina de estados
    currentState = "idle";
    state[currentState].onEnter.call(this);
  }

  update() {
    // La maquina de estados necesita que 'cat' y 'cursors' estén definidos.
    if (!cat || !cursors) {
      return;
    }
    const nextState = state[currentState].onUpdate.call(this);

    if (nextState !== currentState) {
      if (state[currentState].onExit) {
        state[currentState].onExit.call(this);
      }
      state[nextState].onEnter.call(this);
      currentState = nextState;
    }

    // Actualiza la última dirección de movimiento del gato
    if (cursors.left.isDown) lastDirection = "left";
    else if (cursors.right.isDown) lastDirection = "right";
    else if (cursors.up.isDown) lastDirection = "up";
    else if (cursors.down.isDown) lastDirection = "down";

    // Lógica del ataque
    if (this.hasSword) {
      if (this.spaceKey.isDown && !this.isAttacking) {
        this.isAttacking = true;
        this.performAttack();
        this.time.delayedCall(500, () => {
          this.isAttacking = false;
        }); // Cooldown de ataque
      }
    }

    // Lógica de la IA del enemigo
    if (enemy && !enemy.isDead) {
      // Calcula la distancia entre el gato y el enemigo
      const distance = Phaser.Math.Distance.Between(
        cat.x,
        cat.y,
        enemy.x,
        enemy.y
      );
      if (distance < 200) {
        // Radio de detección
        // El enemigo se mueve hacia el gato
        this.physics.moveToObject(enemy, cat, 100);
      } else {
        enemy.setVelocity(0, 0); // Si el gato está lejos, el enemigo se detiene
      }

      // Actualiza la animación del enemigo
      if (enemy.body.velocity.x > 0) {
        enemy.play("enemy-right", true);
      } else if (enemy.body.velocity.x < 0) {
        enemy.play("enemy-left", true);
      } else if (enemy.body.velocity.y > 0) {
        enemy.play("enemy-down", true);
      } else if (enemy.body.velocity.y < 0) {
        enemy.play("enemy-up", true);
      } else {
        enemy.anims.stop();
        enemy.setFrame(0);
      }
    }

    // Dibuja la barra de vida del enemigo
    this.drawEnemyHealthBar();
  }

  // Función para que el gato reciba daño
  playerHit(cat, enemy) {
    if (cat.isInvincible) {
      return;
    }
    cat.health -= 10;
    this.healthText.setText("Vida: " + cat.health);
    cat.isInvincible = true;
    this.time.delayedCall(1000, () => {
      cat.isInvincible = false;
    }); // Invencibilidad de 1 segundo

    // Parpadeo del gato para indicar daño
    this.tweens.add({
      targets: cat,
      alpha: 0.3,
      ease: "Power1",
      duration: 100,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        cat.alpha = 1;
      },
    });

    if (cat.health <= 0) {
      this.physics.pause();
      cat.setTint(0xff0000);
      this.gameOverText.setText("Game Over");
      this.input.keyboard.disableGlobal();
    }
  }

  // Función para obtener la espada del cofre
  getSword(cat, chest) {
    if (!this.hasSword) {
      this.hasSword = true;
      this.chest.setTexture("chest_open"); // Cambia la textura a la del cofre abierto
      this.itemText.setText("Objeto: Espada");
      this.swordMessageText = this.add
        .text(
          this.cameras.main.width / 2,
          this.cameras.main.height - 50,
          "¡Conseguiste la espada! Presiona ESPACIO para atacar.",
          {
            fontSize: "20px",
            fill: "#fff",
          }
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

      // El mensaje se autodestruye después de 5 segundos
      this.time.delayedCall(5000, () => {
        if (this.swordMessageText) {
          this.swordMessageText.destroy();
        }
      });
    }
  }

  // VERSIÓN SIMPLIFICADA sin debug
  performAttack() {
    this.sound.play("sword_slash");

    const spriteCenterX = cat.x;
    const spriteCenterY = cat.y;
    const spriteDisplayWidth = cat.width * cat.scaleX;
    const spriteDisplayHeight = cat.height * cat.scaleY;

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let attackWidth = 120;
    let attackHeight = 60;

    const attackDistance = 35;

    switch (lastDirection) {
      case "left":
        offsetX = -(spriteDisplayWidth / 2 + attackDistance);
        rotation = 180;
        attackWidth = 140;
        attackHeight = 60;
        break;
      case "right":
        offsetX = spriteDisplayWidth / 2 + attackDistance;
        rotation = 0;
        attackWidth = 140;
        attackHeight = 60;
        break;
      case "up":
        offsetY = -(spriteDisplayHeight / 2 + attackDistance);
        rotation = -90;
        attackWidth = 60;
        attackHeight = 140;
        break;
      case "down":
      default:
        offsetY = spriteDisplayHeight / 2 + attackDistance;
        rotation = 90;
        attackWidth = 60;
        attackHeight = 140;
        break;
    }

    const finalX = spriteCenterX + offsetX;
    const finalY = spriteCenterY + offsetY;

    // Reubica y activa la zona de ataque invisible
    this.swordAttackZone.setSize(attackWidth, attackHeight);
    this.swordAttackZone.x = finalX;
    this.swordAttackZone.y = finalY;
    this.swordAttackZone.body.enable = true;

    // Detección de impacto
    this.physics.overlap(
      this.swordAttackZone,
      enemy,
      this.damageEnemy,
      null,
      this
    );

    // Efecto visual del slash
    const swordSlash = this.add.graphics();
    swordSlash.fillStyle(0xffffff, 0.6);
    swordSlash.lineStyle(3, 0xffaa00, 1);

    swordSlash.slice(
      0,
      0,
      45,
      Phaser.Math.DegToRad(-45),
      Phaser.Math.DegToRad(45),
      false
    );
    swordSlash.fillPath();
    swordSlash.strokePath();

    swordSlash.setPosition(finalX, finalY);
    swordSlash.setRotation(Phaser.Math.DegToRad(rotation));

    // Animación del slash y limpieza
    this.tweens.add({
      targets: swordSlash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => {
        swordSlash.destroy();
      },
    });

    // Desactivar hitbox tras un pequeño delay
    this.time.delayedCall(150, () => {
      this.swordAttackZone.body.enable = false;
    });
  }

  // Función para infligir daño al enemigo con knockback
  damageEnemy(attackZone, targetEnemy) {
    if (!targetEnemy.isDead) {
      // Aplicar daño
      targetEnemy.health -= 25;

      // Efecto visual de daño - borde rojo
      targetEnemy.setTint(0xff0000);

      // Sonido de daño (agrega este audio en preload)
      this.sound.play("enemy_hit", { volume: 0.7 });

      // Aplicar knockback (retroceso)
      const knockbackForce = 200;
      const knockbackDuration = 300;

      // Calcular dirección del knockback (opuesta al jugador)
      let knockbackX = targetEnemy.x - cat.x;
      let knockbackY = targetEnemy.y - cat.y;

      // Normalizar la dirección
      const distance = Math.sqrt(
        knockbackX * knockbackX + knockbackY * knockbackY
      );
      if (distance > 0) {
        knockbackX = (knockbackX / distance) * knockbackForce;
        knockbackY = (knockbackY / distance) * knockbackForce;
      }

      // Aplicar fuerza de knockback
      targetEnemy.setVelocity(knockbackX, knockbackY);

      // Detener el knockback después de un tiempo
      this.time.delayedCall(knockbackDuration, () => {
        if (targetEnemy && !targetEnemy.isDead) {
          targetEnemy.setVelocity(0, 0);
        }
      });

      // Quitar el tint después de un breve momento
      this.time.delayedCall(300, () => {
        if (targetEnemy) {
          targetEnemy.clearTint();
        }
      });

      // Efecto de parpadeo
      this.tweens.add({
        targets: targetEnemy,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          if (targetEnemy) {
            targetEnemy.alpha = 1;
          }
        },
      });

      if (targetEnemy.health <= 0) {
        targetEnemy.isDead = true;
        // Sonido de muerte
        this.sound.play("enemy_death", { volume: 0.8 });

        // Animación de muerte
        this.tweens.add({
          targets: targetEnemy,
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          rotation: 360,
          duration: 800,
          ease: "Power2",
          onComplete: () => {
            targetEnemy.disableBody(true, true);
            this.drawEnemyHealthBar();
          },
        });
      }

      // Actualizar barra de vida
      this.drawEnemyHealthBar();
    }
  }

  // Dibuja la barra de vida del enemigo
  drawEnemyHealthBar() {
    if (!enemy || enemy.isDead) {
      this.enemyHealthBar.clear();
      return;
    }

    const maxHealth = 50;
    const healthPercentage = enemy.health / maxHealth;
    const barWidth = 50;
    const barHeight = 8;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - enemy.height / 2 - 10;

    this.enemyHealthBar.clear();
    this.enemyHealthBar.fillStyle(0x000000, 1);
    this.enemyHealthBar.fillRect(barX, barY, barWidth, barHeight);
    this.enemyHealthBar.fillStyle(0xff0000, 1);
    this.enemyHealthBar.fillRect(
      barX,
      barY,
      barWidth * healthPercentage,
      barHeight
    );
  }

  // Se añade la función de transición a la escena del castillo
  enterCastle() {
    this.sound.play("door_open");
    this.scene.start("CastleScene");
  }
}

// Ahora definimos la configuración del juego después de las clases
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
      gravity: {
        y: 0,
      },
    },
  },
  scale: {
    mode: Phaser.Scale.AUTO,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainScene, CastleScene],
};

const game = new Phaser.Game(config);

// 🔥 VARIABLES GLOBALES
let cat;
let cursors;
let enemy;
let speed = 150;
let runSpeed = 300;
let currentState;
let lastDirection = "down"; // Se inicializa la variable global
