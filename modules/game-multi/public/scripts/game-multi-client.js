console.log("test 425");
window.addEventListener("load", ()=>{
    var cubes = null;
    var currentClass = [];

    const customNum = document.querySelectorAll('.custom-num');
    const betCount = document.querySelector('.bet-input.bet-count');
    const betValue = document.querySelector('.bet-input.bet-number');
    const pacoSwitchBtn = document.querySelector('.pacoSwitchBtn');
    const betBtn = document.querySelector('.betBtn');
    const playBtn = document.querySelector('.playBtn');
    const objectionBtn = document.querySelector('.objectionBtn');
    const numInputMax = [9,6];
    const numInputMin = [0,0];

    let clientName = "";
    let playerList = [];
    let actualManche = 0;
    let actualRound = 0;
    let actualBet = [0,2];
    let actualtotalDices = 0;
    let actualPlayerName = "";
    let playerDices = [];

    const socket = io('http://localhost:4000');

    clientName = localStorage.getItem('UserName');
    
    

    console.log("nom du client :", clientName);

    socket.emit('PartyUser', clientName);

    socket.on('currentPlayerName', (currentPlayerName) => {
        actualPlayerName = currentPlayerName;
        refreshCompteur();
        refreshDisplay();
        console.log(currentPlayerName);
    });

    socket.on('playersList', (playersList) => {
        playerList = playersList;
        refreshCompteur();
        refreshDisplay();
        console.log(playersList);
    });

    socket.on('currentBet', (currentBet) => {
        actualBet = currentBet;
        refreshCompteur();
        refreshDisplay();
        console.log(currentBet);
    });

    socket.on('currentManche', (currentManche) => {
        actualManche = currentManche;
        refreshCompteur();
        refreshDisplay();
        console.log(currentManche);
    });

    socket.on('currentRound', (currentRound) => {
        actualRound = currentRound;
        refreshCompteur();
        refreshDisplay();
        console.log(currentRound);
    });

    socket.on('totalDices', (totalDices) => {
        actualtotalDices = totalDices;
        refreshCompteur();
        refreshDisplay();
        console.log(totalDices);
    });

    socket.on(clientName, (dices) => {
        playerDices = dices;
        refreshCompteur();
        refreshDisplay();
        console.log(dices);
    });

    socket.on('BetInvalid', () => {
        if(actualPlayerName === clientName){
            alert("vous devait surencherir ou passer en paco");
        }
    });



// 5. Interface utilisateur
    const GameUI = (() => {
        var currentClass = [];
        

        function displayDices(){

            let userPlayer = null;
            playerList.forEach((player) => {
                if(player.name == clientName){
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


        return {
            displayDices: displayDices
        };
    })();


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
        
        betCount.value = actualBet[0];
        betValue.value = actualBet[1];
    }

    function refreshDisplay(){
        if(actualBet[1] === 1){
            numInputMax[1] = 1;
        }else{
            numInputMax[1] = 6;
        }

        if(actualBet[1] === 1 && actualBet[0] === 0){
            numInputMin[0] = 1;
            
        }
        else{
            numInputMin[0] = actualBet[0];
        }

        numInputMin[1] = actualBet[1];
        customNum[0].querySelector('.num-input').value = numInputMin[0];
        customNum[1].querySelector('.num-input').value = numInputMin[1];

        if(actualBet[0] != 0 && actualBet[1] == 1){
            numInputMax[1] = 1;
        }

        let gameInfoScene = document.querySelector('.game-info');
        let gameInfo = document.querySelector('.round-info')
        if(gameInfo != null){
            gameInfo.remove();
        }
        let gameInfoHTML = `
            <div class="round-info">
                <span>Manche: </span><span>`+ GameConfig.actualManche +`</span>
                <span>Round: </span><span>`+ GameConfig.actualRound +`</span>
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
        

        playerList.forEach(player => {
            if(player != playerList[currentPlayer]){
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
        
        socket.emit( 'newBet' , { newBet: [count,value] });
    });

    objectionBtn.addEventListener('click', () =>{
        socket.emit( 'objection' );
    });

    playBtn.addEventListener('click', () =>{
        socket.emit( 'launch' );
        console.log("lancement")
    });

    pacoSwitchBtn.addEventListener('click', () =>{
        if(JSON.stringify(actualBet) == JSON.stringify([0,2]))
        {
            alert("vous ne pouvez jouer pacos en début de manche que pour les manches spéciale");
        }else{
            if(actualBet[1] >= 2){
                if(numInputMin[1] == 1){
                    refreshDisplay();
                }else{
                    numInputMin[1] = 1;
                    numInputMin[0] = Math.ceil(actualBet[0] / 2);
                    numInputMax[1] = 1;
                    customNum[0].querySelector('.num-input').value = Math.ceil(actualBet[0] / 2);
                    customNum[1].querySelector('.num-input').value = 1;
                }
                
            }else{
                if(numInputMin[1] != 1){
                    refreshDisplay();
                }else{
                    numInputMin[1] = 2;
                    numInputMin[0] = actualBet[0] * 2 + 1;
                    numInputMax[1] = 9;
                    customNum[0].querySelector('.num-input').value = actualBet[0] * 2 + 1;
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



