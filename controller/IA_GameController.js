class IA_GameController {

    constructor() {
        this.address = '';

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

        this.betList = [];
        this.minPaco ;
        this.minNumber;
        this.dataCurrentPlayer;
        this.dataOtherPlayer;
    }

    init() {
        this.currentRound = 0;
        this.currentManche = 0;
        this.allDices = [];
        this.currentBet = [0,2];
        this.winner = null;
        this.currentPlayer = 0;
        this.lastPlayer = 0;
        this.mancheLoser = null;
        this.betList = [];

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
                mail: player.mail,
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
        let finish = false;

        this.mancheLoser = count >= this.currentBet[0] ? this.currentPlayer : this.lastPlayer;
    
        this.playerList[this.mancheLoser].diceNb--;
        console.log("le joueur :" + this.playerList[this.mancheLoser].name + " vient de perdre un des");
        
        if(this.playerList[this.mancheLoser].diceNb === 1){
            this.currentBet = [0,1];
        }else{
            this.currentBet = [0,2];
        }
    
        if(this.playerList[this.mancheLoser].diceNb === 0){
            if(this.mancheLoser == this.playerList.length-1)
            {
                this.mancheLoser = 0;
            }else{
                this.mancheLoser++;
            }
        }

        this.currentRound++;
        
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
            if(this.mancheLoser == 0){
                this.currentPlayer = 0;
            }else{
                this.currentPlayer = this.mancheLoser-1;
            }
    
            while(this.playerList[this.currentPlayer].diceNb === 0){
                if(this.mancheLoser == 0){
                    this.currentPlayer = 0;
                }else{
                    this.currentPlayer = this.mancheLoser-1;
                }
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
        this.currentBet = [count, value];
        this.betList.push(this.currentBet);
        this.currentRound++;

        this.lastPlayer = this.currentPlayer;

        if(this.currentPlayer == this.playerList.length - 1) {
            this.currentPlayer = 0;
        } else {
            this.currentPlayer++;
        }
    }

    

    dataSet() {

        this.minNumber = this.currentBet[0];
        this.minPaco = this.currentBet[0];

        if(this.currentBet[1] >= 2){
            this.minPaco = Math.ceil(this.currentBet[0] / 2);
        }else if(this.currentBet[1] == 1){
            this.minNumber = Math.ceil(this.currentBet[0] * 2 + 1);
        }

        //bloquer le passage en valeur numérique si c'est plus grand que le nombre de dés présent 
        if(this.minNumber > this.allDices.length){
            this.minNumber = null;
        }

        this.dataCurrentPlayer = {
            listPlayers : this.getPlayerListWithoutDicesValue(),
            MinPaco : this.minPaco,
            MinNumber : this.minNumber,
            CurrentBet : this.currentBet,
            CurrentManche : this.currentManche,
            CurrentRound : this.currentRound,
            CurrentPlayer : this.CurrentPlayer,
            BetList : this.BetList,
            YourDices : this.playerList[this.currentPlayer].dices,
            TotaDices : this.allDices.length
        };

        this.dataOtherPlayer = {
            listPlayers : this.getPlayerListWithoutDicesValue(),
            MinPaco : this.minPaco,
            MinNumber : this.minNumber,
            CurrentBet : this.currentBet,
            CurrentManche : this.currentManche,
            CurrentRound : this.currentRound,
            CurrentPlayer : this.CurrentPlayer,
            BetList : this.BetList,
            TotaDices : this.allDices.length
        };
    }

    
}

module.exports = IA_GameController;
