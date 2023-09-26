class IA_GameController {

    constructor() {
        this.address = '';

        this.beginManche = true;
        this.playerCall = false;

        this.currentRound = 0;
        this.currentManche = 1;

        this.playerList = [];

        this.allDices = [];
        this.currentBet = [0,2];
        this.winner = null;
        this.currentPlayer = null;
        this.lastPlayer = 0;
        this.mancheLoser = null;    

        this.BetList = [];
    }

    init() {
        this.beginManche = true;
        this.currentRound = 0;
        this.currentManche = 0;
        this.allDices = [];
        this.currentBet = [0,2];
        this.winner = null;
        this.currentPlayer = 0;
        this.lastPlayer = 0;
        this.mancheLoser = null;
        this.BetList = [];

        this.rollDices();
    }

    addPlayer(playerName, mail, socket){
        this.playerList.push({
            socket: socket,
            mail: mail,
            name: playerName,
            diceNb: 5,
            dices: []
        });
    }

    removePlayerByName(playerName) {
        let filterList =  this.playerList.filter(player => player.name !== playerName);
        this.playerList = filterList;
    }

    removePlayer(index){
        this.playerList.splice(index, 1);
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
    
        this.playerList[this.mancheLoser].diceNb--;
        
        if(playerList[mancheLoser].diceNb === 1){
            currentBet = [0,1];
        }else{
            currentBet = [0,2];
        }
    
        if(this.playerList[this.mancheLoser].diceNb === 0){
            if(this.mancheLoser == this.playerList.length-1)
            {
                this.removePlayer(this.mancheLoser, 1);
                this.mancheLoser = 0;
            }else{
                this.removePlayer(this.mancheLoser, 1);
            }
        }
        
        if(mancheLoser == 0){
            this.currentPlayer = 0;
        }else{
            this.currentPlayer = this.mancheLoser-1;
        }
        
        this.currentRound++;

        if(this.playerList.length == 1){
            this.winner = this.playerList[0];
        }else{
            this.beginManche = true;
            this.currentManche++;
            this.BetList = [];
            this.currentRound = 0;
            this.rollDices();
            return this.playerList[this.mancheLoser].name;
        }
    }

    bet(count, value) {
        this.currentBet = [count, value];
        this.BetList.push(currentBet);
        this.currentRound++;

        this.lastPlayer = currentPlayer;

        if(this.currentPlayer == this.playerList.length - 1) {
            this.currentPlayer = 0;
        } else {
            this.currentPlayer++;
        }
    }

    turn() {
        let data = {
            CurrentBet : this.currentBet,
            BetList : this.BetList,
            YourDices : this.playerList[this.currentPlayer].dices,
            TotaDices : this.allDices.length
        };
        return data;
    }

    
}

module.exports = IA_GameController;
