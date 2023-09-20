window.addEventListener("load", ()=>{
    var cubes = null;
    var rollBtn = document.querySelector('.rollBtn');
    var currentClass = [];
    
    var allDices = [];

    var winner = null;
    var currentPlayer = null;
    var lastPlayer = 0;
    var mancheLoser = null;

    const customNum = document.querySelectorAll('.custom-num');
    const betCount = document.querySelector('.bet-input.bet-count');
    const betValue = document.querySelector('.bet-input.bet-number');
    const pacoSwitchBtn = document.querySelector('.pacoSwitchBtn');
    const betBtn = document.querySelector('.betBtn');
    const objectionBtn = document.querySelector('.objectionBtn');
    const numInputMax = [9,6];
    const numInputMin = [0,0];

    

    console.log("test 425");
/////////////////////////////////////////////////////////////////

// 1. Initialisation et configuration
const GameConfig = (() => {
    var currentRound = 0;
    var currentManche = 0;


    function init(){
        if(cubes != null){
            for (let index = 0; index < cubes.length; index++) {
                currentClass[index] = '';
            }
        }
        
        PlayerManager.addPlayer(
            player = {
            name: "player",
            diceNb: 5,
            dices: [],
            bet: []
          });

        for (let index = 0; index < 3; index++) {
            player = {
            name: "bot_"+index,
            diceNb: 5,
            dices: [],
            bet: []
          };
          PlayerManager.addPlayer(player);
        }
        GameEngine.rollDices();
        GameEngine.turn();
    }

    return {
        init: init,
        currentManche: currentManche,
        currentRound: currentRound
    };
})();

// 2. Gestion des joueurs
const PlayerManager = (() => {
    var playerList = [];

    function addPlayer(player){
        playerList.push(player);
    }

    function removePlayer(index){
        playerList.splice(index, 1);
    }

    function setPlayerBet(index, playerBet){
        playerList[index].bet = playerBet;
    }

    function resetPlayersBets(){
        playerList.forEach(player => {
            player.bet = [];
        });
        
    }

    return {
        addPlayer: addPlayer,
        removePlayer: removePlayer,
        playerList: playerList,
        setPlayerBet: setPlayerBet,
        resetPlayersBets: resetPlayersBets
    };
})();

// 3. Moteur de jeu
const GameEngine = (() => {
    var allDices = [];
    var currentBet = [0,2];
    var winner = null;
    var currentPlayer = null;
    var lastPlayer = 0;
    var mancheLoser = null;

    function getRandomInt(min, max) {
        const randomBuffer = new Uint32Array(1);

        window.crypto.getRandomValues(randomBuffer);

        let randomNumber = randomBuffer[0] / (0xffffffff + 1);

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(randomNumber * (max - min + 1)) + min;
    }

    function rollDices() {
        allDices = [];
        PlayerManager.playerList.forEach((player) => {
            player.dices = [];
            for (let index = 0; index < player.diceNb; index++) {
                var randNum = getRandomInt(1, 6);
                player.dices.push(randNum);
                allDices.push(randNum);
            }
            numInputMax[0] = allDices.length;
        });


        console.log("ROLL dices :",allDices);
        if(JSON.stringify(currentBet) == JSON.stringify([0,1])){
            console.log("%c+++++++++++++++++++++++++++++++++++++++++++++++++++++\n+++++++++++++   MANCHE SPECIAL    +++++++++++++++++++\n+++++++++++++++++++++++++++++++++++++++++++++++++++++","color:red;");
            alert("manche spéciale");
        }else{
            console.log("/////////////////////////////////////////////////////\n/////////////////////////////////////////////////////");
        }
        
        GameUI.displayDices();
    }

    function objection(){
        let count = allDices.filter(die => die === currentBet[1]).length;
        mancheLoser = count >= currentBet[0] ? currentPlayer : lastPlayer;
        
        playerList = PlayerManager.playerList;
    
        playerList[mancheLoser].diceNb--;
    
        console.log(playerList[currentPlayer].name," Object : ", currentBet);
        console.log(playerList[mancheLoser].name," a perdu la manche nb dices: ", playerList[mancheLoser].diceNb);
        alert(playerList[currentPlayer].name + " Object : " + currentBet + "\n" + playerList[mancheLoser].name + " a perdu la manche nb dices: " + playerList[mancheLoser].diceNb);
    
        if(playerList[mancheLoser].diceNb === 1){
            currentBet = [0,1];
        }else{
            currentBet = [0,2];
        }
    
        if(playerList[mancheLoser].diceNb === 0){
            if(mancheLoser == playerList.length-1)
            {
                PlayerManager.removePlayer(mancheLoser, 1);
                mancheLoser = 0;
            }else{
                PlayerManager.removePlayer(mancheLoser, 1);
            }
        }
        
        if(mancheLoser == 0){
            currentPlayer = null;
        }else{
            currentPlayer = mancheLoser-1;
        }
        
        GameConfig.currentRound++;

        if(playerList.length == 1){
            winner = playerList[0];
            console.log("********************************************************************");
            console.log(playerList[0].name," a gagner la partie");
            console.log("********************************************************************");
        }else{
            PlayerManager.resetPlayersBets();
            GameConfig.currentManche++;
            rollDices();
            turn();
        }
    }

    function bet(count, value){
        currentBet = [count, value];
        if(currentBet[1] == 1){
            console.log("%c" + PlayerManager.playerList[currentPlayer].name +" Bet : "+ currentBet,"color:green;");
        }else{
            console.log(PlayerManager.playerList[currentPlayer].name," Bet : ", currentBet);
        }
        PlayerManager.setPlayerBet(currentPlayer, currentBet);
        GameConfig.currentRound++;
        turn();
    }

    function turn(){
        
        if(currentPlayer != null){
            if(currentPlayer == PlayerManager.playerList.length - 1)
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
        console.log("********************************************************************");
        console.log("Starting turn for player", PlayerManager.playerList[currentPlayer].name);
        // Lancez la décision de l'IA et affichez le résultat.
        if(PlayerManager.playerList[currentPlayer].name.substr(0, 3) == "bot"){
            PerudoAI.makeDecision(
                currentBet,
                currentPlayer,
                PlayerManager.playerList,
                allDices,
                (count, value) => console.log(),
                () => console.log()
            );
        }else{
            refreshDisplay();
        }
        
    }

    function getCurrentBet() {
        return currentBet;
    }

    return {
        rollDices: rollDices,
        objection: objection,
        bet: bet,
        turn: turn,
        allDices: allDices,
        getCurrentBet: getCurrentBet
    };

})();

// 4. IA du jeu
const PerudoAI = (() => {

    function analyzeSituation(dices, value, totalDiceCount){
        const matchingDice = dices.filter(die => die === value).length;
        const estimatedTotalDice =  Math.ceil(matchingDice + (totalDiceCount - dices.length) * (1 / 6));
        return estimatedTotalDice;
    }

    function makeDecision(currentBet, currentPlayer, playerList, allDices, makeBet, makeObjection) {
        const dices = PlayerManager.playerList[currentPlayer].dices;
        const totalDiceCount = allDices.length;

        const estimations = [];
        
        // console.log("###########################################################");
        // console.log("allDices :", allDices.length);
        // console.log("PlayerList :", playerList);
        // console.log("Current Player :", currentPlayer);
        // console.log("Current Player Dices:", dices);  // Pour vérifier les dés de l'IA
        // console.log("Total Dices Count:", totalDiceCount);  // Pour vérifier le nombre total de dés
        // console.log("###########################################################");

        // Estimer le count pour chaque valeur possible
        for (let value = 1; value <= 6; value++) {
            estimations[value] = this.analyzeSituation(dices, value, totalDiceCount);
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
                GameEngine.bet(nextCount, bestValue);
                makeBet(nextCount, bestValue);
            }
            else if(estimations[1] > currentBet[0]){
                GameEngine.bet(estimations[1], 1);
                makeBet(estimations[1], 1);
            }
            else {
                GameEngine.objection();
                makeObjection();
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
                GameEngine.bet(estimations[bestValue], bestValue);
                makeBet(estimations[bestValue], bestValue);
            } else if (estimations[1] >= Math.ceil(currentBet[0] / 2)) {
                GameEngine.bet(estimations[1], 1);
                makeBet(estimations[1], 1);
            } else {
                GameEngine.objection();
                makeObjection();
            }
            return;
        }
    }

    return {
        analyzeSituation: analyzeSituation,
        makeDecision: makeDecision
    };
})();

// 5. Interface utilisateur
const GameUI = (() => {
    var rollBtn = document.querySelector('.rollBtn');
    var currentClass = [];
    

    function displayDices(){

        let userPlayer = null;
        PlayerManager.playerList.forEach((player) => {
            if(player.name == "player"){
                userPlayer = player; 
            }
        });

        //console.log(" nb dices :", cubes.length);

        if(userPlayer == null || (cubes != null  && cubes.length > userPlayer.diceNb)  ){
            
            if(cubes.length == 0){
                cubes = 0;
            }else if(cubes != 0){
                cubes[cubes.length-1].remove();
                cubes = document.querySelectorAll('.cube');
            }
            
        }

        if(cubes == null){
            let dicesScene = document.querySelector('.dices-scene');

            // Définissez le contenu de chaque cube
            let cubeHTML = `
                <div class = "scene">
                    <div class="cube">
                        <div class="cube__face cube__face--1">1</div>
                        <div class="cube__face cube__face--2">2</div>
                        <div class="cube__face cube__face--3">3</div>
                        <div class="cube__face cube__face--4">4</div>
                        <div class="cube__face cube__face--5">5</div>
                        <div class="cube__face cube__face--6">6</div>
                    </div>
                </div>
            `;

            // Définissez n (le nombre de fois que vous voulez répéter le bloc)
            let n = userPlayer.diceNb; 

            // Utilisez une boucle pour ajouter le cube n fois
            for (let i = 0; i < n; i++) {
                dicesScene.innerHTML += cubeHTML;
                console.log("add cube");
            }
            cubes = document.querySelectorAll('.cube');
        }
        if(cubes != 0){
            cubes.forEach((cube, index) => {
                var showClass = 'show-' + userPlayer.dices[index];
                    
                if ( currentClass[index] ) {
                    cube.classList.remove( currentClass[index] );
                }
                cube.classList.add( showClass );
                currentClass[index] = showClass;
            });
        }
       
    }

    rollBtn.addEventListener("click", GameEngine.rollDices);

    return {
        displayDices: displayDices
    };
})();

window.addEventListener("load", () => {
    GameConfig.init();
    // Autres fonctions d'initialisation
});

GameConfig.init();

//launch########################################################################

// init();
// console.log("Hello world!");
// // set initial side
// rollDices();

// rollBtn.addEventListener("click", rollDices);
// turn();

//########################################################################
//number input

    function refreshCompteur(){
        customNum.forEach((num, index) => {
            const numInput = num.querySelector('.num-input');
            const arrUp = num.querySelector('.arr-up');
            const arrDown = num.querySelector('.arr-down');
            const numInputValue = parseInt(numInput.value);

            
            if(numInputValue == 1 && index == 1){
                num.style.padding = "0.6em";
                num.style.height = "3em";
                arrUp.style.display = "none";
                arrDown.style.display = "none";
            }else if(numInputValue === numInputMax[index]){
                num.style.paddingTop = "0.8em";
                num.style.height = "5em";
                arrUp.style.display = "none";

                num.style.paddingBottom = "0";
                arrDown.style.display = "block";
            }else if(numInputValue === numInputMin[index]){
                num.style.paddingBottom = "0.8em";
                num.style.height = "5em";
                arrDown.style.display = "none";

                num.style.paddingTop = "0";
                arrUp.style.display = "block";
            }else{
                num.style.padding = "0";
                num.style.height = "7em";
                arrUp.style.display = "block";
                arrDown.style.display = "block";
            }

        });
        
        betCount.value = GameEngine.getCurrentBet()[0];
        betValue.value = GameEngine.getCurrentBet()[1];
    }

    function refreshDisplay(){
        if(GameEngine.getCurrentBet()[1] === 1){
            numInputMax[1] = 1;
        }else{
            numInputMax[1] = 6;
        }

        if(GameEngine.getCurrentBet()[1] === 1 && GameEngine.getCurrentBet()[0] === 0){
            numInputMin[0] = 1;
            
        }
        else{
            numInputMin[0] = GameEngine.getCurrentBet()[0];
        }

        numInputMin[1] = GameEngine.getCurrentBet()[1];
        customNum[0].querySelector('.num-input').value = numInputMin[0];
        customNum[1].querySelector('.num-input').value = numInputMin[1];

        if(GameEngine.getCurrentBet()[0] != 0 && GameEngine.getCurrentBet()[1] == 1){
            numInputMax[1] = 1;
        }

        let gameInfoScene = document.querySelector('.game-info');
        let gameInfo = document.querySelector('.round-info')
        if(gameInfo != null){
            gameInfo.remove();
        }
        let gameInfoHTML = `
            <div class="round-info">
                <span>Manche: </span><span>`+ GameConfig.currentManche +`</span>
                <span>Round: </span><span>`+ GameConfig.currentRound +`</span>
            </div>
        `;

        gameInfoScene.insertAdjacentHTML('afterbegin', gameInfoHTML);

        let playersScene = document.querySelector('.players');
        let players = document.querySelectorAll('.player')
        if( players != null){
            players.forEach(player => {
                player.remove();
            });
        }
        

        PlayerManager.playerList.forEach(player => {
            if(player != PlayerManager.playerList[currentPlayer]){
                let PlayerHTML = `
                    <div class="player">
                        <h3>`+ player.name +`</h3>
                        <p class="bet">Bet: <span>`+ player.bet +`</span></p>
                        <p class="dice-count">Dice Count: <span>`+ player.diceNb +`</span></p>
                    </div>
                `;

                playersScene.innerHTML += PlayerHTML;

            }
            
        });
        


        refreshCompteur();

    }

    betBtn.addEventListener('click', () =>{
        let count = parseInt(customNum[0].querySelector('.num-input').value);
        let value = parseInt(customNum[1].querySelector('.num-input').value);

        if(JSON.stringify(GameEngine.getCurrentBet()) == JSON.stringify([count,value]))
        {
            alert("vous devait surencherir ou passer en paco");
        }else{
            GameEngine.bet(count, value);
        }
        
        
    });

    objectionBtn.addEventListener('click', () =>{
        GameEngine.objection();
    });

    pacoSwitchBtn.addEventListener('click', () =>{
        if(JSON.stringify(GameEngine.getCurrentBet()) == JSON.stringify([0,2]))
        {
            alert("vous ne pouvez jouer pacos en début de manche que pour les manches spéciale");
        }else{
            if(GameEngine.getCurrentBet()[1] >= 2){
                if(numInputMin[1] == 1){
                    refreshDisplay();
                }else{
                    numInputMin[1] = 1;
                    numInputMin[0] = Math.ceil(GameEngine.getCurrentBet()[0] / 2);
                    numInputMax[1] = 1;
                    customNum[0].querySelector('.num-input').value = Math.ceil(GameEngine.getCurrentBet()[0] / 2);
                    customNum[1].querySelector('.num-input').value = 1;
                }
                
            }else{
                if(numInputMin[1] != 1){
                    refreshDisplay();
                }else{
                    numInputMin[1] = 2;
                    numInputMin[0] = GameEngine.getCurrentBet()[0] * 2 + 1;
                    numInputMax[1] = 9;
                    customNum[0].querySelector('.num-input').value = GameEngine.getCurrentBet()[0] * 2 + 1;
                    customNum[1].querySelector('.num-input').value = 2;
                }
            }
            refreshCompteur();
        }
    });

    customNum.forEach((num, index) => {
        const numInput = num.querySelector('.num-input');
        const arrUp = num.querySelector('.arr-up');
        const arrDown = num.querySelector('.arr-down');
        
        
        
        numInput.style.color = numInput.dataset.color;
        
        arrUp.addEventListener('click', () =>{
            numInput.value++;
            checkMaxMin();
        });
        
        arrDown.addEventListener('click', () =>{
            numInput.value--;
            checkMaxMin();
        });

        numInput.addEventListener('input', checkMaxMin);

        function checkMaxMin(){
            const numInputValue = parseInt(numInput.value);
            if(numInputValue == 1 && index == 1){
                num.style.padding = "0.6em";
                num.style.height = "3em";
                arrUp.style.display = "none";
                arrDown.style.display = "none";
            }else if(numInputValue === numInputMax[index]){
                num.style.paddingTop = "0.8em";
                num.style.height = "5em";
                arrUp.style.display = "none";

                num.style.paddingBottom = "0";
                arrDown.style.display = "block";
            }else if(numInputValue === numInputMin[index]){
                num.style.paddingBottom = "0.8em";
                num.style.height = "5em";
                arrDown.style.display = "none";

                num.style.paddingTop = "0";
                arrUp.style.display = "block";
            }else{
                num.style.padding = "0";
                num.style.height = "7em";
                arrUp.style.display = "block";
                arrDown.style.display = "block";
            }

        }
    });
});



