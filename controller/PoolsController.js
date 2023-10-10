const GameController = require('("../../../controller/IA_GameController');

function areArraysDifferent(arr1, arr2) {
    // Vérifiez d'abord si les tableaux ont la même longueur
    if (arr1.length !== arr2.length) {
      return true;
    }
  
    // Comparez chaque élément
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return true;
      }
    }
  
    // Si tous les éléments sont identiques, les tableaux sont les mêmes
    return false;
  }

class PoolsController {

    constructor(router) {
        this.PoolList = new Map();
        this.router = router;
    }

    init() {
        
    }

    addPool(poolAddress) {
        const newGame = new GameController();
        this.PoolList.set(poolAddress, newGame);
    }

    addPlayer(playerName, mail, socket, poolAddress){
        let gameController = this.PoolList[poolAddress];
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
    
    defaultAction(controller, address){
        if(controller.gameInProgress){
            let data = controller.dataCurrentPlayer;
            data.address = address;
            PerudoAI.PoolsController = this;
            PerudoAI.decideAction(this.router, controller, data, data.CurrentBet, data.YourDices, data.TotaDices, data.IsSpecialManche);
        }
    }

    

}

const PerudoAI = (() => {

    function estimateProbability(totalDice, myDice, diceValue) {
        // Ceci est une approximation simplifiée pour estimer la probabilité.
        const myCount = myDice.filter(d => d === diceValue).length;
        const otherDice = totalDice - myDice.length;
        const expectedCount = otherDice / 6;  // Supposition : chaque face du dé a une chance égale d'apparaître.
    
        return Math.ceil(myCount + expectedCount);
    }
    
    function decideAction(router, controller, data, previousBet, myDice, totalDice, isSpecialManche) {
        let [prevCount, prevValue] = previousBet;
        let newBet = null;
    
        let probabilities = [];
        for (let value = 1; value <= 6; value++) {
            probabilities[value] = estimateProbability(totalDice, myDice, value);
        }
        
        let NoneContest;
        if (!isSpecialManche) {
            let pacoProbability = probabilities[1];
            NoneContest = pacoProbability + probabilities[prevValue] > prevCount;
        }else{
            NoneContest = probabilities[prevValue] > prevCount;
        }

        if (NoneContest) {
            if (prevValue === 1) {
                // Essayer de surenchérir sur les pacos
                if(probabilities[1]> prevCount && probabilities[1] >= 1) {
                    newBet = [probabilities[1] , 1];
                }else{ // Si impossible de surenchérir sur pacos, essayer de quitter les pacos
                    for (let value = 6; value >= 2; value--) {
                        if (probabilities[value] >= prevCount * 2 + 1) {
                            newBet = [probabilities[value], value];
                            break;
                        }
                    }
                }
    
            } else {
                
                for (let value = 6; value >= prevValue; value--) {
                    if (probabilities[value] >= prevCount && probabilities[value] >= 1) {
                        newBet = [probabilities[value], value];
                        break;
                    }
                }
                if(newBet != null){
                    if(newBet[0] === prevCount && newBet[1] === prevValue){
                        newBet = null;
                    }
                }

                if (!isSpecialManche && newBet != null) {
                    let pacoProbability = probabilities[1];
                    newBet[0] <= pacoProbability + probabilities[newBet[1]];
                }

               
                if (newBet === null) { // Si nous ne pouvons toujours pas parier plus, essayons de passer aux pacos
                    if (probabilities[1] >= Math.ceil(prevCount / 2) && probabilities[1] >= 1) {
                        newBet = [probabilities[1], 1];
                    }
                }
            }
        }

        if (newBet != null && areArraysDifferent(newBet, previousBet)) {

            console.log("bet par défaut = "+newBet[0]+" "+newBet[1]);
            router.betAction({bet: [newBet[0], newBet[1]], address: data.address}, router.socketUsers[data.currentPlayer], true);
            //controller.bet(newBet[0], newBet[1]);
        } else if(JSON.stringify(previousBet) == JSON.stringify([0,1]) || JSON.stringify(previousBet) == JSON.stringify([0,2])) {
            console.log("bet par défaut");
            router.betAction({bet: [prevCount + 1, prevValue], address: data.address}, router.socketUsers[data.currentPlayer], true);
            controller.bet(prevCount + 1, prevValue);
        }else {
            console.log("objection par défaut");
            router.objectionAction(data.address, true);
            //controller.objection();
        }
    }
    

    return {
        estimateProbability: estimateProbability,
        decideAction: decideAction
    };
})();





module.exports = PoolsController;
