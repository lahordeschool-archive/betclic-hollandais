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
        PerudoAI.decideAction(controller, data.CurrentBet, data.YourDices, data.TotaDices, data.IsSpecialManche);
    }

    

}

const PerudoAI = (() => {

    function estimateProbability(totalDice, myDice, diceValue) {
        // Ceci est une approximation simplifiée pour estimer la probabilité.
        const myCount = myDice.filter(d => d === diceValue).length;
        const otherDice = totalDice - myDice.length;
        const expectedCount = otherDice / 6;  // Supposition : chaque face du dé a une chance égale d'apparaître.
    
        return myCount + expectedCount;
    }
    
    function decideAction(controller, previousBet, myDice, totalDice, isSpecialManche) {
        let [prevCount, prevValue] = previousBet;
        let newBet = null;
    
        let probabilities = [];
        for (let value = 1; value <= 6; value++) {
            probabilities[value] = estimateProbability(totalDice, myDice, value);
        }
        
        console.log(probabilities);
        let contest;
        if (!isSpecialManche) {
            console.log("Ajout bonus ");
            let pacoProbability = probabilities[1];
            contest = pacoProbability + probabilities[prevValue] > prevCount;
        }else{
            contest = probabilities[prevValue] > prevCount;
        }

        if (contest) {
            if (prevValue === 1) {
                // Essayer de surenchérir sur les pacos
                if(probabilities[1]> prevCount) {
                    newBet = [probabilities[1] , 1];
                }
    
                // Si impossible de surenchérir sur pacos, essayer de quitter les pacos
                if (newBet === null) {
                    for (let value = 6; value >= 2; value--) {
                        if (probabilities[value] >= prevCount * 2 + 1) {
                            newBet = [probabilities[value], value];
                            break;
                        }
                    }
                }
    
            } else {
                console.log("Essayez d'augmenter la valeur tout en maintenant ou en augmentant le nombre de dés ");
                // Essayez d'augmenter la valeur tout en maintenant ou en augmentant le nombre de dés
                for (let value = prevValue + 1; value <= 6; value++) {
                    for (let count = prevCount; count <= totalDice; count++) {
                        console.log(count);
                        console.log(probabilities[value]);
                        console.log(probabilities[value] >= count);

                        if (probabilities[value] >= count) {
                            newBet = [count, value];
                            break;
                        }
                    }
                    if (newBet != null) break;
                }

                // Si nous ne pouvons pas augmenter la valeur, essayons d'augmenter le nombre de dés pariés
                if (newBet === null) {
                    console.log("Essayez d'augmenter le nombre de dés pariés ");
                    for (let count = prevCount + 1; count <= totalDice; count++) {
                        if (probabilities[prevValue] >= count) {
                            newBet = [count, prevValue];
                            break;
                        }
                    }
                }

                if (!isSpecialManche && newBet != null) {
                    console.log("Ajout bonus ");
                    let pacoProbability = probabilities[1];
                    newBet[0] <= pacoProbability + probabilities[newBet[1]];
                }

                // Si nous ne pouvons toujours pas parier plus, essayons de passer aux pacos
                if (newBet === null) {
                    for (let count = Math.ceil(prevCount / 2); count <= totalDice; count++) {
                        if (probabilities[1] >= count) {
                            newBet = [count, 1];
                            break;
                        }
                    }
                }
            }
        }
    
        if (newBet != null) {
            controller.bet(newBet);
        } else {
            controller.objection();
        }
    }
    

    return {
        estimateProbability: estimateProbability,
        decideAction: decideAction
    };
})();





module.exports = PoolsController;
