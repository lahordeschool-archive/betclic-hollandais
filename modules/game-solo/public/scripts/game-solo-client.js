window.addEventListener("load", ()=>{
    var cubes = null;
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

    


/////////////////////////////////////////////////////////////////

    const GameEngine = (() => {
        var currentRound = 1;
        var currentManche = 1;
        var playerList = [];
        var specialManche = false;
        var allDices = [];
        var currentBet = [0,2];
        var winner = null;
        var currentPlayer = null;
        var lastPlayer = 0;
        var mancheLoser = null;    
        var minPaco ;
        var minNumber;

        function init() {
            currentRound = 1;
            currentManche = 1;
            playerList = [];
            specialManche = false;
            allDices = [];
            currentBet = [0,2];
            winner = null;
            currentPlayer = null;
            lastPlayer = 0;
            mancheLoser = null;    
            minPaco ;
            minNumber;

            if(cubes != null){
                for (let index = 0; index < cubes.length; index++) {
                    currentClass[index] = '';
                }
            }
            
            addPlayer(
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
                addPlayer(player);
            } 
            rollDices();
            turn();
            
        }

        function addPlayer(player){
            playerList.push(player);
        }

        function setPlayerBet(playerBet){
            console.log('set player bet = ',playerBet )
            playerList[currentPlayer].bet = playerBet;
        }

        function resetPlayersBets(){
            playerList.forEach(player => {
                player.bet = [];
            });
            
        }

        function resetPlayersNbDices(){
            playerList.forEach(player => {
                player.diceNb = 5;
            });
            
        }


        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function rollDices(){
            allDices = [];
            console.log(playerList);
            playerList.forEach((player) => {
                player.dices = [];
                for (let index = 0; index < player.diceNb; index++) {
                    var randNum = getRandomInt(1, 6);
                    player.dices.push(randNum);
                    allDices.push(randNum);
                    console.log(player);
                }
            });
            console.log(GameEngine.playerList);
            GameUI.displayDices();
        }

        function objection() {
            let count;
            
            if(specialManche){
                count = allDices.filter(die => die === currentBet[1]).length;
                specialManche = false;
            }else{
                count = allDices.filter(die => die === currentBet[1] || die === 1).length;
            }


            let finish = false;

            mancheLoser = count >= currentBet[0] ? currentPlayer : lastPlayer;
        
            playerList[mancheLoser].diceNb--;
            console.log("le joueur :" + playerList[mancheLoser].name + " vient de perdre un des");
            
            if(playerList[mancheLoser].diceNb === 1){
                currentBet = [0,1];
                specialManche = true;
            }else{
                currentBet = [0,2];
            }
            
            playerList.forEach(player => {
                console.log("le joueur :" + player.name);
                console.log("nb des :" + player.diceNb);
                console.log("les des :" + player.dices);
            });

            let countPlayer = 0;
            let win;
            playerList.forEach(player => {
                if(player.diceNb > 0){
                    countPlayer++;
                    win = player.name;
                }
            });

            if(countPlayer === 1){
                finish = true;
            }

            if(!finish){

                currentPlayer = mancheLoser;

                while(playerList[currentPlayer].diceNb === 0){
                    currentPlayer = (currentPlayer+1)% playerList.length;
                }
                resetPlayersBets();
                currentManche++;
                betList = [];
                currentRound = 0;
                rollDices();
            }else{
                console.log("le gagnant est :" + win);
                winner = win;
                gameInProgress = false;
            }
        }

        function bet(count, value) {
            setPlayerBet([count, value]);
            currentBet = [count, value];
            betList.push(currentBet);
            currentRound++;

            lastPlayer = currentPlayer;

            currentPlayer = (currentPlayer+1)% playerList.length;

            while(playerList[currentPlayer].diceNb === 0){
                currentPlayer = (currentPlayer+1)% playerList.length;
            }
        }

        function turn(){
            if(GameEngine.playerList[currentPlayer].name.substr(0, 3) == "bot"){
                PerudoAI.makeDecision(
                    currentBet,
                    currentPlayer,
                    GameEngine.playerList,
                    allDices
                );
            }
            console.log("c'est un tour de " + GameEngine.playerList[currentPlayer].name);
            refreshDisplay();
            refreshCompteur();
        }


        return {
            rollDices: rollDices,
            objection: objection,
            bet: bet,
            turn: turn,
            init: init,
            currentRound: currentRound,
            currentManche: currentManche,
            playerList: playerList,
            specialManche: specialManche,
            allDices: allDices,
            currentBet: currentBet,
            winner: winner,
            currentPlayer: currentPlayer,
            lastPlayer: lastPlayer,
            mancheLoser: mancheLoser,  
            minPaco: minPaco,
            minNumber: minNumber
        };

    })();

    // 4. IA du jeu
    const PerudoAI = (() => {

        function analyzeSituation(dices, value, totalDiceCount){
            const matchingDice = dices.filter(die => die === value).length;
            const estimatedTotalDice =  Math.ceil(matchingDice + (totalDiceCount - dices.length) * (1 / 6));
            return estimatedTotalDice;
        }

        function makeDecision(currentBet, currentPlayer, playerList, allDices) {
            const dices = GameEngine.playerList[currentPlayer].dices;
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
                    GameEngine.bet(nextCount, bestValue);
                }
                else if(estimations[1] > currentBet[0]){
                    GameEngine.bet(estimations[1], 1);
                }
                else {
                    GameEngine.objection();
                }
            } else { // Si nous ne sommes pas sur Paco
                let bestValue = currentBet[1];
                for (let value = currentBet[1] + 1; value <= 6; value++) {
                    if (estimations[value] > estimations[bestValue]) {
                        bestValue = value;
                    }
                }
                if (estimations[bestValue] > currentBet[0]) {
                    GameEngine.bet(estimations[bestValue], bestValue);
                } else if (estimations[1] >= Math.ceil(currentBet[0] / 2)) {
                    GameEngine.bet(estimations[1], 1);
                } else {
                    GameEngine.objection();
                }
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
            // if((cubes != null  && cubes.length > playerDices.length)  ){
            //     if(cubes.length == 0){
            //         cubes = 0;
            //     }else if(cubes != 0){
            //         cubes[cubes.length-1].remove();
            //         cubes = document.querySelectorAll('.cube');
            //     }
                
            // }
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
                console.log(GameEngine.playerList);
                let playerDices = GameEngine.playerList[0].dices;
                
                // Utilisez une boucle pour ajouter le cube n fois
                for (let i = 0; i < playerDices.length; i++) {
                    dicesScene.innerHTML += cubeHTML;
                }
                cubes = document.querySelectorAll('.cube');
            }

            if(cubes != 0){
                cubes.forEach((cube, index) => {
                    if(index < playerDices.length){
                        var showClass = 'show-' + playerDices[index];
                        
                        if ( currentClass[index] ) {
                            cube.classList.remove( currentClass[index] );
                        }
                        cube.classList.add( showClass );
                        currentClass[index] = showClass;
                        cube.style.display = "block"
                    }else{
                        cube.style.display = "none"
                    }
        if(cubes == null){
            let dicesScene = document.querySelector('.dices-scene');

            // Définissez le contenu de chaque cube
            let cubeHTML = `
                <div class = "scene">
                    <div class="cube">
                        <div class="cube__face cube__face--1"><img src='../img/1.jpg'></div>
                        <div class="cube__face cube__face--2"><img src='../img/2.jpg'><a>2</a></div>
                        <div class="cube__face cube__face--3"><img src='../img/3.jpg'><a>3</a></div>
                        <div class="cube__face cube__face--4"><img src='../img/4.jpg'><a>4</a></div>
                        <div class="cube__face cube__face--5"><img src='../img/5.jpg'><a>5</a></div>
                        <div class="cube__face cube__face--6"><img src='../img/6.jpg'><a>6</a></div>
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

        return {
            displayDices: displayDices
        };
    })();

    //launch########################################################################

    GameEngine.init();
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
        
        betCount.value = GameEngine.currentBet[0];
        betValue.value = GameEngine.currentBet[1];
    }

    function refreshDisplay(){
        if(GameEngine.currentBet[1] === 1){
            numInputMax[1] = 1;
        }else{
            numInputMax[1] = 6;
        }

        if(GameEngine.currentBet[1] === 1 && GameEngine.currentBet[0] === 0){
            numInputMin[0] = 1;
            currentBet
        }
        else{
            numInputMin[0] = GameEngine.currentBet[0];
        }

        numInputMin[1] = GameEngine.currentBet[1];
        customNum[0].querySelector('.num-input').value = numInputMin[0];
        customNum[1].querySelector('.num-input').value = numInputMin[1];

        if(GameEngine.currentBet[0] != 0 && GameEngine.currentBet[1] == 1){
            numInputMax[1] = 1;
        }

        let gameInfoScene = document.querySelector('.game-info');
        let gameInfo = document.querySelector('.round-info')
        if(gameInfo != null){
            gameInfo.remove();
        }
        let gameInfoHTML = `
            <div class="round-info">
                <span>Manche: </span><span>`+ GameEngine.currentManche +`</span>
                <span>Round: </span><span>`+ GameEngine.currentRound +`</span>
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
        

        GameEngine.playerList.forEach(player => {
            if(player != GameEngine.playerList[currentPlayer]){
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

        if(JSON.stringify(GameEngine.currentBet) == JSON.stringify([count,value]))
        {
            alert("vous devait surencherir ou passer en paco");
        }else{
            GameEngine.bet(count, value);
        }
        
        
    });

    objectionBtn.addEventListener('click', () =>{
        if(JSON.stringify(GameEngine.currentBet) == JSON.stringify([0,2]))
        {
            alert("vous ne pouvez pas constester en debut de manche");
        }else{
            GameEngine.objection();
        }
    });

    pacoSwitchBtn.addEventListener('click', () =>{
        if(JSON.stringify(GameEngine.currentBet) == JSON.stringify([0,2]))
        {
            alert("vous ne pouvez jouer pacos en début de manche que pour les manches spéciale");
        }else{
            if(GameEngine.currentBet[1] >= 2){
                if(numInputMin[1] == 1){
                    refreshDisplay();
                }else{
                    numInputMin[1] = 1;
                    numInputMin[0] = Math.ceil(GameEngine.currentBet[0] / 2);
                    numInputMax[1] = 1;
                    customNum[0].querySelector('.num-input').value = Math.ceil(GameEngine.currentBet[0] / 2);
                    customNum[1].querySelector('.num-input').value = 1;
                }
                
            }else{
                if(numInputMin[1] != 1){
                    refreshDisplay();
                }else{
                    numInputMin[1] = 2;
                    numInputMin[0] = GameEngine.currentBet[0] * 2 + 1;
                    numInputMax[1] = 9;
                    customNum[0].querySelector('.num-input').value = GameEngine.currentBet[0] * 2 + 1;
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



