const GameController = require('("../../../controller/IA_GameController');

class PoolsController {

    constructor() {
        this.PoolList = new Map();

    }

    init() {
        
    }

    addPool(poolAdress) {
        const newGame = new GameController();
        this.PoolList.set(poolAdress, newGame);
    }

    addPlayer(playerName, mail, socket, poolAdress){
        let gameController = this.PoolList[poolAdress];
        let alreadyLogged = false;
        gameController.playerList.forEach(player => {
            if(player.mail === mail){
            alreadyLogged = true;
            player.socket = socket;
            }
        });
        if(!alreadyLogged){
            gameController.addPlayer(playerName, mail, socket);
        }
    }

    objection() {
        let count;
        
        if(this.specialManche){
            count = this.allDices.filter(die => die === this.currentBet[1]).length;
            this.specialManche = false;
        }else{
            count = this.allDices.filter(die => die === this.currentBet[1] || die === 1).length;
        }


        let finish = false;

        this.mancheLoser = count >= this.currentBet[0] ? this.currentPlayer : this.lastPlayer;
    
        this.playerList[this.mancheLoser].diceNb--;
        console.log("le joueur :" + this.playerList[this.mancheLoser].name + " vient de perdre un des");
        
        if(this.playerList[this.mancheLoser].diceNb === 1){
            this.currentBet = [0,1];
            this.specialManche = true;
        }else{
            this.currentBet = [0,2];
        }
        
        this.playerList.forEach(player => {
            console.log("le joueur :" + player.name);
            console.log("nb des :" + player.diceNb);
            console.log("les des :" + player.dices);
        });

        let countPlayer = 0;
        let win;
        this.playerList.forEach(player => {
            if(player.diceNb > 0){
                countPlayer++;
                win = player.name;
            }
        });

        if(countPlayer === 1){
            finish = true;
        }

        if(!finish){

            this.currentPlayer = this.mancheLoser;

            while(this.playerList[this.currentPlayer].diceNb === 0){
                this.currentPlayer = (this.currentPlayer+1)% this.playerList.length;
            }

            this.currentManche++;
            this.betList = [];
            this.currentRound = 0;
            this.rollDices();
        }else{
            console.log("le gagnant est :" + win);
            this.winner = win;
        }
    }

    bet(count, value) {
        
    }
    
}

module.exports = PoolsController;
