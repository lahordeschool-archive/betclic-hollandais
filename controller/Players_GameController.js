class Players_GameController {

    constructor() {
        this.address = '';
        this.beginManche = true;

        this.currentRound = 0;
        this.currentManche = 1;

        this.playerList = [];
        this.playerListWithoutDicesValue = [];

        this.allDices = [];
        this.currentBet = [0,2];
        this.winner = null;
        this.currentPlayer = null;
        this.lastPlayer = 0;
        this.mancheLoser = null;    
    }

    init() {
        this.beginManche = true;
        this.currentRound = 0;
        this.currentManche = 0;
        this.playerListWithoutDicesValue = [];
        this.allDices = [];
        this.currentBet = [0,2];
        this.winner = null;
        this.currentPlayer = null;
        this.lastPlayer = 0;
        this.mancheLoser = null;

        this.rollDices();
        this.turn();
    }

    addPlayer(playerName, mail, socketId){
        this.playerList.push({
            socketId: socketId,
            mail: mail,
            name: playerName,
            diceNb: 5,
            dices: [],
            bet: []
        });
    }

    removePlayerByName(playerName) {
        let filterList =  this.playerList.filter(player => player.name !== playerName);
        this.playerList = filterList;
    }

    removePlayer(index){
        this.playerList.splice(index, 1);
    }

    setPlayerBet(playerBet){
        console.log('set player bet = ',playerBet )
        this.playerList[this.currentPlayer].bet = playerBet;
    }

    resetPlayersBets(){
        this.playerList.forEach(player => {
            player.bet = [];
        });
        
    }
    
    getPlayerListWithoutDicesValue(){
        this.playerListWithoutDicesValue = [];
        this.playerList.forEach(player => {
            this.playerListWithoutDicesValue.push({
                name: player.name,
                diceNb: player.diceNb,
                bet: player.bet
            });
        });
        return this.playerListWithoutDicesValue;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    rollDices() {
        this.allDices = [];
        this.playerList.forEach((player) => {
            player.dices = [];
            for (let index = 0; index < player.diceNb; index++) {
                var randNum = this.getRandomInt(1, 6);
                player.dices.push(randNum);
                this.allDices.push(randNum);
            }
        });
    }

    objection() {
        let count = this.allDices.filter(die => die === this.currentBet[1] || die === 1).length;
        this.mancheLoser = count >= this.currentBet[0] ? this.currentPlayer : this.lastPlayer;
        
        // ... [reste du code identique]

        if(this.playerList.length == 1){
            this.winner = this.playerList[0];
        }else{
            this.beginManche = true;
            this.resetPlayersBets();
            this.currentManche++;
            this.currentRound = 0;
            this.rollDices();
            this.turn();
        }
    }

    bet(count, value) {
        this.currentBet = [count, value];
        this.setPlayerBet(this.currentBet);
        this.currentRound++;
        this.turn();
    }

    turn() {
        if(this.currentPlayer != null) {
            if(this.currentPlayer == this.playerList.length - 1) {
                this.lastPlayer = this.currentPlayer;
                this.currentPlayer = 0;
            } else {
                this.lastPlayer = this.currentPlayer;
                this.currentPlayer++;
            }
        } else {
            this.currentPlayer = 0;
        }
    }

    getCurrentBet() {
        return this.currentBet;
    }

    VerifyBet(bet) {
        if(JSON.stringify(this.currentBet) == JSON.stringify(this.newBet)) {
            return false;
        } else {
            return true;
        }
    }
}

module.exports = Players_GameController;
