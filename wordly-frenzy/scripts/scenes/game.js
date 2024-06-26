import Player from "../player.js"
import { FoodManager } from "../food_manager.js"
import { QuizModule } from "../data/quiz_provider.js"
import { background, foodConfig } from "../config/game_config.js";

export class OceanScene extends Phaser.Scene {

  quizModule = new QuizModule() ;
  player = null

  isAnswering = false ;
  foods = Array() ;

  preload() {
      // this.load.image('background', 'resource/underwater.png');
      // this.load.image('background1', 'resource/Deep Sea.png');
      // this.load.image('background2', 'resource/ocean.gif');
      this.load.image('background', 'resource/ocean1.png');
      this.load.image('background1', 'resource/ocean2.png');
      this.load.image('background2', 'resource/ocean3.png');
      this.load.spritesheet(
        'player', 
        'resource/dragon.png', 
        {
          frameWidth: 96,
          frameHeight: 64
        }
      )
      
      this.load.image('food', 'resource/food.png') ;
      this.load.image('food2', 'resource/food2.png') ;
      this.load.spritesheet(
        'food3', 
        'resource/food3.png', 
        {
          frameWidth: foodConfig["large"].frameWidth,
          frameHeight: foodConfig["large"].frameHeight
        }
      )

      this.load.spritesheet(
        'enemy', 
        'resource/enemy.png', 
        {
          frameWidth: 20 * 16,
          frameHeight: 18 * 16
        }
      )
      this.load.audio('scene-music', [ '../asset/frenzy.mp3']);
    }

  showLoading() {
    let loading = document.getElementById("loading-screen") ;
    loading.style.visibility = "visible"
  }

  dismissLoading() {
    let loading = document.getElementById("loading-screen") ;
    loading.style.visibility = "hidden"
  }

  resetGame() {
    this.quizModule.reset() ;
    this.create() ;
  }

  showEndGameScreen() {
    this.timerText.setText("0");
    let endGame = document.getElementById("end-game") ;
    endGame.style.visibility = "visible" ;
    let answered = document.getElementById("soal_terjawab") ;
    let scoreLayout = document.getElementById("nilai") ;
    let btnReset = document.getElementById("btn-reset") ;
    answered.innerText = `Pertanyaan yang terjawab benar dari sekali ${this.quizModule.soalBenar}` ;
    scoreLayout.innerText = `Nilai anda: ${this.quizModule.score}` ;
    btnReset.onclick = () => { 
      endGame.style.visibility = "hidden" ;
      this.resetGame() 
    } 
  }

  loadQuiz() {
    this.showLoading() ;
    this.quizModule.queryQuiz("")
    .then((quiz) => {
      if (quiz === null || quiz === undefined) {
        //gameover
        this.gameOver() ;
      } else {
        this.onQuizLoaded(quiz) ;
      }
      this.dismissLoading() ;
    })
    // .catch((error) => {
    //   console.log("LOAD QUIZ ERROR " + error)
    // }) ;
  }

  onQuizLoaded(quizModel) {
    this.topBar.clear() ;
    this.paragraphText.setText(quizModel.soal) ;
    this.topBar.fillStyle(0x8B22DE, 0.9); 
    this.topBar.fillRect(0, 0, window.innerWidth, 220); 
    this.restart(quizModel);
  }

  create() {
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNames('player', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    let choosenBackground = Phaser.Math.RND.pick(background)
    this.bg = this.add.image(0, 0, choosenBackground).setOrigin(0)
        .setDisplaySize(document.body.clientWidth, document.body.clientHeight) ;
    this.updateBgSize(this.bg) ;

    this.sound.stopAll();
    this.music = this.sound.play('scene-music', { loop: true, volume: 0.4 });

    const verticalCenter = 0 + 160 - 60;

    const textWidth = window.innerWidth * 0.9 - 120 ; 

    this.topBar = this.add.graphics();
    this.topBar.fillStyle(0x8B22DE, 0.9); 
    this.topBar.fillRect(0, 0, window.innerWidth, 205); 

    let timerTextPosition = window.innerWidth - 60
    let paragraphTextPosition = (window.innerWidth - timerTextPosition)/2

    this.paragraphText = this.add.text(60, verticalCenter, "quizModel.soal", {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Poppins, Arial, sans-serif',
      wordWrap: { width: textWidth },
      align: 'justify',
      fontStyle: 'bold',
      strokeThickness: 2,
      stroke: '#000000'
    });
    this.paragraphText.setOrigin(0, 0.5);
    
    this.timerText = this.add.text(timerTextPosition, verticalCenter, '60', {
      fontSize: '64px',
      fill: '#ffffff',
      fontFamily: 'Poppins, Arial, sans-serif',
      fontStyle: 'bold',
    });
    this.timerText.setOrigin(1, 0.5); 
    
    this.player = new Player(this, this.bg.getCenter().x, this.bg.getCenter().y) ;
    this.player.play('right')
    this.player.start() ;
    
    this.foodManager = new FoodManager(this.physics.world, this) ;
    this.physics.add.collider(this.foodManager, undefined);
    
    this.physics.add.overlap(this.player, this.foodManager, (player, food) => this.eat(food, this.foodManager))
    this.loadQuiz() ;
  }

  update() {
    this.physics.add.collider(this.foodManager);
    this.player.play('right')
  }

  updateBgSize(image) {
    const windowAspectRatio = window.innerWidth / window.innerHeight;
    const imageAspectRatio = image.width / image.height;

    if (windowAspectRatio > imageAspectRatio) {
      image.displayWidth = window.innerWidth;
      image.displayHeight = window.innerWidth / imageAspectRatio;
    } else {
      image.displayHeight = window.innerHeight;
      image.displayWidth = window.innerHeight * imageAspectRatio;
    }

    image.x = (window.innerWidth - image.displayWidth) / 2;
    image.y = (window.innerHeight - image.displayHeight) / 2;
  }

  restart(currentQuiz) {
    let timeInSeconds = 60;

    this.timerInterval = setInterval(() => {
      timeInSeconds--; 

      this.timerText.setText(timeInSeconds.toString());

      if (timeInSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.onRoundFail();
      }
    }, 1000);
    this.foodManager.spawn(currentQuiz.jawaban) ;
    this.isAnswering = false ;
  }

  eat(food, foodManager) {
    console.log("Answer")
    if (!food.isDead && !this.isAnswering) {
      this.isAnswering = true ;
      let answerStatus = this.quizModule.postAnswer(food.label) ;
      if (!answerStatus) {
        food.kill() ;
        //Hint box
      }
      else this.onRoundEnd() ;
      this.isAnswering = false ;
    }
  }

  onRoundFail() {
    this.quizModule.postAnswer("") ;
    this.onRoundEnd() ;
  }
  
  onRoundEnd() {
    this.showLoading() ;
    clearInterval(this.timerInterval);
    this.foodManager.stop();
    this.quizModule.nextQuiz() ;
    this.loadQuiz() ;
  }

  power(power, player) {
    
  }

  gameOver() {
    clearInterval(this.timerInterval);
    this.player.stop() ;
    this.foodManager.stop() ;
    this.showEndGameScreen()
  }

  getPlayerLocation(location) {
    location.x = this.player.x;
    location.y = this.player.y;
    return location ;
  }
}
