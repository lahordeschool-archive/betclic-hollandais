var socket;
var numInputMax = [9,6];
var numInputMin = [0,0];
var clientName = '';
var playerList = [];
var actualManche = 0;
var actualRound = 0;
var actualBet = [0,2];
var actualtotalDices = 0;
var actualPlayerIndex = 0;
var playerDices = [];

window.addEventListener("load", async ()=>{
    var cubes = null;
    var currentClass = [];

    const customNum = document.querySelectorAll('.custom-num');
    const displayClientName = document.querySelector('.user-name');
    const displayActualPlayer = document.querySelector('.player-name');
   
    const betCount = document.querySelector('.bet-input.bet-count');
    const betValue = document.querySelector('.bet-input.bet-number');
    const playBtn = document.querySelector('.playBtn');
    const refreshBtn = document.querySelector('.refreshBtn');
    const gameButton = document.querySelector('.game-button');
    const betBtn = document.getElementById("betButton");
    const pacoSwitchBtn = document.getElementById("pacoSwitchButton");
    const objectionBtn = document.getElementById("objectionButton");
    var canPlay = false;

    var serveurAdress;

    function SetServeurSession(){
        let storedData = JSON.parse(localStorage.getItem('SessionServerAdress'));
        const data = {
            value: storedData.value,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem('SessionServerAdress', JSON.stringify(data));
    }

    function getServeurSession(){
        if(localStorage.getItem('SessionServerAdress')){
            let storedData = JSON.parse(localStorage.getItem('SessionServerAdress'));
            if (storedData) {
                const timeNow = new Date().getTime();
                const timeLimit =  5 * 60 * 1000;
                if (timeNow - storedData.timestamp > timeLimit) {
                    localStorage.removeItem('SessionServerAdress');
                } else {
                    // Utilisez vos données comme vous le souhaitez
                    console.log(storedData.value);
                    socket.emit('connectPlayer', ({name: localStorage.getItem('UserFirstName'), mail: localStorage.getItem('UserMail'), adress: storedData.value}));
                    return storedData.value;
                }
            }
            return false;
        }
    }

    function redirectTo(newPath) {
        window.location.href = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + newPath;
    }

    if(localStorage.getItem('UserFirstName') == null){
        $.get("/api/getUserInfos", function(data) {
            clientName = data.firstname;
            localStorage.setItem('UserFirstName', clientName);
            localStorage.setItem('UserMail', data.id);
        }).fail(function() {
            console.error("Erreur lors de la récupération des informations de l'utilisateur.");
        });
    }

    clientName = localStorage.getItem('UserFirstName');
    displayClientName.textContent = clientName;

    socket = await io.connect();

    clientName = localStorage.getItem('UserName');


    socket.on('connect', () => {

        serveurAdress = getServeurSession();

        console.log('Connected to the server from client');
        // You can perform actions here when the connection is established
        console.log(socket);
        socket.emit('connected');

        if(serveurAdress === false){
            redirectTo('/hub');
        }else{
            socket.emit('getServer', {serveurAdress: serveurAdress, mail: localStorage.getItem('UserMail')});
        }

        socket.on("ServerNotConnect", () => {
            localStorage.removeItem('SessionServerAdress');
            redirectTo('/hub');
        });

        

        socket.on("messageTestReceived", (message) => {
            console.log(message);
        });

        socket.on("PlayerTurn", (gameInfo) => {

            playerList = gameInfo.listPlayers;
            actualManche = gameInfo.CurrentManche;
            actualRound = gameInfo.CurrentRound;
            actualBet = gameInfo.CurrentBet;
            actualtotalDices = gameInfo.TotaDices;
            actualPlayerIndex = gameInfo.CurrentPlayer;
            playerDices = gameInfo.YourDices;
            GameUI.displayDices();
            canPlay = true;
            numInputMax[0] = actualtotalDices;
            refreshDisplay();
            console.log(actualBet);
        });

        socket.on("finish", (playerName) => {
            alert('Gagnant :'+ playerName);
            redirectTo('/hub');
        });

        socket.on("Maj", (gameInfo) => {
            playerList = gameInfo.listPlayers;
            actualManche = gameInfo.CurrentManche;
            actualRound = gameInfo.CurrentRound;
            actualBet = gameInfo.CurrentBet;
            actualtotalDices = gameInfo.TotaDices;
            actualPlayerIndex = gameInfo.CurrentPlayer;
            playerDices = gameInfo.YourDices;
            console.log(playerDices);
            GameUI.displayDices();
            numInputMax[0] = actualtotalDices;
            refreshDisplay();
            console.log(actualBet);

            SetServeurSession();
        });

    });


// 5. Interface utilisateur
    const GameUI = (() => {
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

        if(actualBet[0] === 0){
            numInputMin[0] = 1;
        }else{
            numInputMin[0] = actualBet[0];
        }

        if(actualBet[0] === 0 && actualBet[1] === 1){
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
                <span>Manche: </span><span>`+ actualManche +`</span>
                <span>Round: </span><span>`+ actualRound +`</span>
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
            let PlayerHTML = `
                <div class="player">
                    <h3>`+ player.name +`</h3>
                    <p class="bet">Bet: <span>`+ player.bet +`</span></p>
                    <p class="dice-count">Dice Count: <span>`+ player.diceNb +`</span></p>
                </div>
            `;

            playersScene.innerHTML += PlayerHTML;
        });

        if(canPlay) {
            // Mettez à jour la visibilité des boutons en fonction de la valeur de 'showButtons'
            gameButton.style.display = "block";
        }
        else{
            gameButton.style.display = "none";
        }

        if (displayActualPlayer) {
            console.log(playerList);
            console.log(actualPlayerIndex);
            displayActualPlayer.textContent = playerList[actualPlayerIndex].name;
        } else {
            console.error("L'élément .text-field.player n'a pas été trouvé.");
        }

        refreshCompteur();

    }

    function VerifyBet(newBet) {
        // Vérifier s'il s'agit d'un nouveau pari
        if (JSON.stringify(actualBet) == JSON.stringify(newBet)) {
            return false;
        }
    
        // Vérifier si nous essayons de passer des dés réguliers aux pacos
        if (newBet[1] === 1 && actualBet[1] !== 1) {
            // Assurez-vous que le nombre de dés pariés pour le paco est supérieur à la moitié du pari précédent
            if (newBet[0] >= Math.ceil(actualBet[0] / 2)) {
                return true;
            }
        }
    
        // Vérifier si nous essayons de passer des pacos aux dés réguliers
        if (newBet[1] !== 1 && actualBet[1] === 1) {
            // Assurez-vous que le nombre de dés pariés est au moins le double de l'ancien pari + 1
            if (newBet[0] >= ((2 * actualBet[0]) + 1) && newBet[1] >= 1) {
                return true;
            }
        }
    
        // Vérifier si le nouveau pari surenchérit sur l'ancien pari
        if ((newBet[0] > actualBet[0] && newBet[1] == actualBet[1]) || (newBet[0] >= actualBet[0] && newBet[1] > actualBet[1])) {
            return true;
        }
    
        // Si le pari précédent était un paco, vous pouvez surenchérir sur la valeur ou le nombre
        if (actualBet[1] === 1 && newBet[1] === 1) {
            if (newBet[0] > actualBet[0]) {
                return true;
            }
        }
    
        // Si aucune des conditions ci-dessus n'est satisfaite, le pari n'est pas valide
        return false;
    }
    
    betBtn.addEventListener('click', () =>{
        let count = parseInt(customNum[0].querySelector('.num-input').value);
        let value = parseInt(customNum[1].querySelector('.num-input').value);

        if(VerifyBet(actualBet, [count,value])){
            socket.emit( 'bet' , {bet: [count,value], adress: serveurAdress});
            console.log("New bet");
            
            canPlay = false;
        }else{
            alert('Paris invalide');
        }
    });

    function VerifyObjection(bet){
        //check is a new bet
        if(JSON.stringify(bet) == JSON.stringify([0,1]) || JSON.stringify(bet) == JSON.stringify([0,2])) {
            return false;
        } else {
            return true;
        }
    }

    objectionBtn.addEventListener('click', () =>{
        if(VerifyObjection(actualBet)){
            socket.emit( 'objection', serveurAdress );
            console.log("Objection");
            
            canPlay = false;
        }else{
            alert('Vous ne pouvez pas contester en début de manche');
        }
    });

    playBtn.addEventListener('click', () =>{
        socket.emit( 'launchBattle', serveurAdress );
        console.log("lancement");

        cubes = null;
    });

    refreshBtn.addEventListener('click', () =>{
        cubes = null;
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
                    numInputMax[1] = 6;
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



