class Players_GameController {

    constructor() {
        this.adress = '';
        this.beginManche = true;

        this.players = [];

        this.currentRound = 0;
        this.currentManche = 0;

        this.playerList = [];
        this.playerListWithoutDicesValue = [];

        this.allDices = [];
        this.currentBet = [1,2];
        this.winner = null;
        this.currentPlayer = null;
        this.lastPlayer = 0;
        this.mancheLoser = null;
    }

    init() {
        users.forEach(user => {
            addPlayer({
                name: user,
                diceNb: 5,
                dices: [],
                bet: []
            });
        });

        rollDices();
        turn();
    }

    addPlayer(player){
        playerList.push(player);
    }

    removePlayerByName(playerName) {
        let filterList =  playerList.filter(player => player.name !== playerName);
        playerList = filterList;
    }

    removePlayer(index){
        playerList.splice(index, 1);
    }

    setPlayerBet(index, playerBet){
        playerList[index].bet = playerBet;
    }

    resetPlayersBets(){
        playerList.forEach(player => {
            player.bet = [];
        });
        
    }
    
    getPlayerListWithoutDicesValue(){
        playerList.forEach(player => {
            playerListWithoutDicesValue.push({
                name: player.name,
                diceNb: player.diceNb,
                bet: player.bet
            });
        });
    }

    getRandomInt(min, max) {
        const randomBuffer = new Uint32Array(1);

        window.crypto.getRandomValues(randomBuffer);

        let randomNumber = randomBuffer[0] / (0xffffffff + 1);

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(randomNumber * (max - min + 1)) + min;
    }

    rollDices() {
        allDices = [];
        playerList.forEach((player) => {
            player.dices = [];
            for (let index = 0; index < player.diceNb; index++) {
                var randNum = getRandomInt(1, 6);
                player.dices.push(randNum);
                allDices.push(randNum);
            }
            numInputMax[0] = allDices.length;
        });
    }

    objection(){
        let count = allDices.filter(die => die === currentBet[1] || die === 1).length;
        mancheLoser = count >= currentBet[0] ? currentPlayer : lastPlayer;
        
        playerList = playerList;
    
        playerList[mancheLoser].diceNb--;
    
        if(playerList[mancheLoser].diceNb === 1){
            currentBet = [0,1];
        }else{
            currentBet = [1,2];
        }

        if(playerList[mancheLoser].diceNb === 0){
            if(mancheLoser == playerList.length-1)
            {
                removePlayer(mancheLoser, 1);
                mancheLoser = 0;
            }else{
                removePlayer(mancheLoser, 1);
            }
        }

        if(mancheLoser == 0){
            currentPlayer = null;
        }else{
            currentPlayer = mancheLoser-1;
        }
        
        currentRound++;

        if(playerList.length == 1){
            winner = playerList[0];
        }else{
            resetPlayersBets();
            currentManche++;
            rollDices();
            turn();
        }
    }

    bet(count, value){
        currentBet = [count, value];
        setPlayerBet(currentPlayer, currentBet);
        currentRound++;
        turn();
    }

    turn(){

        if(currentPlayer != null){
            if(currentPlayer == playerList.length - 1)
            {
                lastPlayer = currentPlayer;
                currentPlayer = 0;
            }
            else{
                lastPlayer = currentPlayer;
                currentPlayer++;
            }
            
        }
        else{
            currentPlayer = 0;
        }   
    }

    getCurrentBet() {
        return currentBet;
    }

    //////////////////////////////    INFO    /////////////////////////////////
    
    VerifyBet(bet) {
        if(JSON.stringify(currentBet) == JSON.stringify(newBet))
        {
            return false;
        }else{
            return true;
        }
    }
}

module.exports = Players_GameController;