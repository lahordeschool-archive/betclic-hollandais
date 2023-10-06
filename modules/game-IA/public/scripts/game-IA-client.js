var socket;
let editor;
var serveurAdress;

var clientName = '';

var playerList = [];
var actualManche = 0;
var actualRound = 0;
var actualBet = [0,2];
var actualtotalDices = 0;
var actualPlayerIndex = 0;
var playerDices = [];
var isSpecialManche = false;

var iterration = 0;

window.addEventListener("load", async ()=> {

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

    
    socket = await io.connect();

    socket.on('connect', () => {
        //updateFunction();
        serveurAdress = getServeurSession();

        console.log('Connected to the server from client');
        
        if(localStorage.getItem('UserFirstName') == null){
            $.get("/api/getUserInfos", function(data) {
                localStorage.setItem('UserFirstName', data.firstname);
                localStorage.setItem('UserMail', data.id);
            }).fail(function() {
                console.error("Erreur lors de la récupération des informations de l'utilisateur.");
            });
        }

        console.log(socket);
        socket.emit('connected');
        

        if(serveurAdress === false){
            redirectTo('/game-IDE');
        }else{
            socket.emit('getServer', {serveurAdress: serveurAdress, mail: localStorage.getItem('UserMail')});
        }

        socket.on("ServerNotConnect", () => {
            localStorage.removeItem('SessionServerAdress');
            redirectTo('/game-IDE');
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
            isSpecialManche = gameInfo.IsSpecialManche;

            UI.displayDices();
            UI.refreshDisplay();
            console.log('YOUR TURN');
            console.log(window.yourTurn);
            //window.yourTurn(gameInfo);
            yourTurn(gameInfo);
            //setTimeout(yourTurn(gameInfo), 5000);

            
            SetServeurSession();
        });

        socket.on("Maj", (gameInfo) => {
            playerList = gameInfo.listPlayers;
            actualManche = gameInfo.CurrentManche;
            actualRound = gameInfo.CurrentRound;
            actualBet = gameInfo.CurrentBet;
            actualtotalDices = gameInfo.TotaDices;
            actualPlayerIndex = gameInfo.CurrentPlayer;
            playerDices = gameInfo.YourDices;
            isSpecialManche = gameInfo.IsSpecialManche;

            UI.displayDices();
            UI.refreshDisplay();

            SetServeurSession();
        });

        socket.on("finish", (playerName) => {
            alert('Gagnant :'+ playerName);
            localStorage.removeItem('SessionServerAdress');
            redirectTo('/game-IDE');
        });

        function yourTurn(data){
            PerudoAI.decideAction(actualBet, playerDices, actualtotalDices, isSpecialManche);
        }

    });

    window.objection = function (){
        console.log('ia object');
        if(VerifyObjection()){
            alert('Objection');
            socket.emit('objection', serveurAdress);
            iterration = 0;
            return true;
        }else{
            iterration++;
            if(iterration ===5){
                PerudoAI.decideAction(actualBet, playerDices, actualtotalDices, isSpecialManche);
                iterration = 0;
                return true;
            }else{
                return false;
            }
        }
        
    }
    
    window.bet = function (newBet){
        console.log('ia bet '+ newBet);
        console.log('Verif ia bet = '+VerifyBet(newBet));
        if(VerifyBet(newBet)){
            alert('bet :'+ newBet);
            socket.emit( 'bet' , {bet: newBet, adress: serveurAdress});
            iterration = 0;
            return true;
        }else{
            iterration++;
            if(iterration ===5){
                PerudoAI.decideAction(actualBet, playerDices, actualtotalDices, isSpecialManche);
                iterration = 0;
                return true;
            }else{
                return false;
            }
        }
    }

    const UI = (() => {
        var currentClass = [];
        var cubes = null;

        const displayClientName = document.querySelector('.user-name');
        const displayActualPlayer = document.querySelector('.player-name');
    
        const betCount = document.querySelector('.bet-input.bet-count');
        const betValue = document.querySelector('.bet-input.bet-number');

        function refreshDisplay(){
    
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
    
            if (displayActualPlayer) {
                console.log(playerList);
                console.log(actualPlayerIndex);
                displayActualPlayer.textContent = playerList[actualPlayerIndex].name;
            } else {
                console.error("L'élément .text-field.player n'a pas été trouvé.");
            }
    
            betCount.value = actualBet[0];
            betValue.value = actualBet[1];
        }
    
        function displayDices(){
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
                displayDices: displayDices,
                refreshDisplay: refreshDisplay
            };
    })();
});

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

function VerifyObjection(){
    //check is a new bet
    if(JSON.stringify(actualBet) == JSON.stringify([0,1]) || JSON.stringify(actualBet) == JSON.stringify([0,2])) {
        return false;
    } else {
        return true;
    }
}




function updateFunction(){
    const code = localStorage.getItem("My_AI");
    try {
        const newFunction = new Function('data', code);
        window.yourTurn = newFunction;
        alert('Function updated successfully!');
    } catch (error) {
        console.log(error.message);
        alert('Error in your code: ' + error.message);
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
    
    function decideAction(previousBet, myDice, totalDice, isSpecialManche) {
        let [prevCount, prevValue] = previousBet;
        let newBet = null;
    
        let probabilities = [];
        for (let value = 1; value <= 6; value++) {
            probabilities[value] = estimateProbability(totalDice, myDice, value);
        }
        
        console.log(probabilities);
        let NoneContest;
        if (!isSpecialManche) {
            console.log("Ajout bonus ");
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
                console.log("Essayez d'augmenter la valeur tout en maintenant ou en augmentant le nombre de dés ");
                
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
                    console.log("Ajout bonus ");
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
    
        if (newBet != null) {
            console.log('IA tes bet '+ newBet);
            window.bet(newBet);
        } else {
            window.objection();
        }
    }
    

    return {
        estimateProbability: estimateProbability,
        decideAction: decideAction
    };
})();