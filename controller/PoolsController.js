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

    getServerList(){
        let servers = new Map();
        this.PoolList.forEach((server, key) => {
            let serverinfo = {
                nbPlayers: server.playerList.length,
                gameInProgress: server.gameInProgress
            }
            servers.set(key, serverinfo);
        });
        return servers;
    }
    
    defaultAction(controller){
        let data = controller.dataCurrentPlayer;
        PerudoAI.makeDecision(controller, data.CurrentBet, data.YourDices, data.TotaDices);
    }

    

}

const PerudoAI = (() => {

    function analyzeSituation(dices, value, totalDiceCount){
        const matchingDice = dices.filter(die => die === value).length;
        const estimatedTotalDice =  Math.ceil(matchingDice + (totalDiceCount - dices.length) * (1 / 6));
        return estimatedTotalDice;
    }

    function makeDecision(controller, currentBet, dices, totalDiceCount) {

        const estimations = [];
        
        // Estimer le count pour chaque valeur possible
        for (let value = 1; value <= 6; value++) {
            estimations[value] = analyzeSituation(dices, value, totalDiceCount);
        }

        if (currentBet[1] === 1) { // Si nous sommes déjà sur Paco
            const nextCount = currentBet[0] * 2 + 1;

            // Trouver la meilleure value pour surenchérir
            let bestValue = 2;
            for (let value = 3; value <= 6; value++) {
                if (estimations[value] > estimations[bestValue]) {
                    bestValue = value;
                }
            }

            if (estimations[bestValue] >= nextCount && estimations[bestValue] > estimations[1]) {
                controller.bet([nextCount, bestValue]);
            }
            else if(estimations[1] > currentBet[0]){
                controller.bet([estimations[1], 1]);
            }
            else {
                controller.objection();
            }
            return;

        } else { // Si nous ne sommes pas sur Paco
            let bestValue = currentBet[1];
            for (let value = currentBet[1] + 1; value <= 6; value++) {
                if (estimations[value] > estimations[bestValue]) {
                    bestValue = value;
                }
            }
            if (estimations[bestValue] > currentBet[0]) {
                controller.bet([estimations[bestValue], bestValue]);
            } else if (estimations[1] >= Math.ceil(currentBet[0] / 2)) {
                controller.bet([estimations[1], 1]);
            } else {
                controller.objection();
            }
            return;
        }
    }

    return {
        analyzeSituation: analyzeSituation,
        makeDecision: makeDecision
    };
})();





module.exports = PoolsController;
