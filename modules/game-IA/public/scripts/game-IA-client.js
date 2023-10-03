var socket;
let editor;
var serveurAdress;

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

    //updateFunction();
    socket = await io.connect();

    socket.on('connect', () => {

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
            yourTurn(gameInfo);
            SetServeurSession();
        });

        socket.on("finish", (playerName) => {
            alert('Gagnant :'+ playerName);
            localStorage.removeItem('SessionServerAdress');
        });

        function yourTurn(data){
            console.log(data);
            
            function analyzeSituation(dices, value, totalDiceCount){
                const matchingDice = dices.filter(die => die === value).length;
                const estimatedTotalDice =  Math.ceil(matchingDice + (totalDiceCount - dices.length) * (1 / 6));
                return estimatedTotalDice;
            }

            function makeDecision(currentBet, dices, totalDiceCount) {

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
                        console.log('test 1');
                        bet([nextCount, bestValue]);
                    }
                    else if(estimations[1] > currentBet[0]){
                        console.log('test 2');
                        bet([estimations[1], 1]);
                    }
                    else {
                        console.log('test 3');
                        objection();
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
                        console.log('test 4');
                        bet([estimations[bestValue], bestValue]);
                    } else if (estimations[1] >= Math.ceil(currentBet[0] / 2)) {
                        console.log('test 5');
                        bet([estimations[1], 1]);
                    } else {
                        console.log('test 6');
                        objection();
                    }
                    return;
                }
            }

            makeDecision(data.CurrentBet, data.YourDices, data.TotaDices);
        }

    });

});

function VerifyBet(currentBet, newBet) {
    // Check is a new bet
    if (JSON.stringify(currentBet) == JSON.stringify(newBet)) {
        return false;
    }

    // Check is outbid
    if (newBet[0] > currentBet[0] || (newBet[0] === currentBet[0] && newBet[1] > currentBet[1])) {
        return true;
    }

    // Check for paco switch to a numeric value
    if (currentBet[1] === 1 && newBet[1] !== 1 && newBet[0] > currentBet[0]) {
        return true;
    }

    // If not outbid, check is a paco switch
    if (newBet[1] === 1 && newBet[0] <= currentBet[0] / 2) {
        return true;
    }

    return false;
}

function VerifyObjection(bet){
    //check is a new bet
    if(JSON.stringify(bet) == JSON.stringify([0,1]) || JSON.stringify(bet) == JSON.stringify([0,2])) {
        return false;
    } else {
        return true;
    }
}

function objection(){
    alert('Objection');
    socket.emit('objection', serveurAdress);
}

function bet(newBet){
    if(VerifyBet(newBet[0], newBet[1])){

    }
    alert('bet :'+ newBet);
    socket.emit( 'bet' , {bet: newBet, adress: serveurAdress});socket.emit('bet', bet);
}


function updateFunction(){
    const code = localStorage.getItem("My_AI");
    try {
        const newFunction = new Function('data', code);
        window.yourTurn = newFunction;
        alert('Function updated successfully!');
        yourTurn();
    } catch (error) {
        console.log(error.message);
        alert('Error in your code: ' + error.message);
    }
}


// const PerudoAI = (() => {

//     function analyzeSituation(dices, value, totalDiceCount){
//         const matchingDice = dices.filter(die => die === value).length;
//         const estimatedTotalDice =  Math.ceil(matchingDice + (totalDiceCount - dices.length) * (1 / 6));
//         return estimatedTotalDice;
//     }

//     function makeDecision(currentBet, dices, totalDiceCount) {

//         const estimations = [];
        
//         // Estimer le count pour chaque valeur possible
//         for (let value = 1; value <= 6; value++) {
//             estimations[value] = this.analyzeSituation(dices, value, totalDiceCount);
//         }

//         if (currentBet[1] === 1) { // Si nous sommes déjà sur Paco
//             const nextCount = currentBet[0] * 2 + 1;

//             // Trouver la meilleure value pour surenchérir
//             let bestValue = 2;
//             for (let value = 3; value <= 6; value++) {
//                 if (estimations[value] > estimations[bestValue]) {
//                     bestValue = value;
//                 }
//             }

//             if (estimations[bestValue] >= nextCount && estimations[bestValue] > estimations[1]) {
//                 bet([nextCount, bestValue]);
//             }
//             else if(estimations[1] > currentBet[0]){
//                 bet([estimations[1], 1]);
//             }
//             else {
//                 objection();
//             }
//             return;

//         } else { // Si nous ne sommes pas sur Paco
//             let bestValue = currentBet[1];
//             for (let value = currentBet[1] + 1; value <= 6; value++) {
//                 if (estimations[value] > estimations[bestValue]) {
//                     bestValue = value;
//                 }
//             }
//             if (estimations[bestValue] > currentBet[0]) {
//                 bet([estimations[bestValue], bestValue]);
//             } else if (estimations[1] >= Math.ceil(currentBet[0] / 2)) {
//                 bet([estimations[1], 1]);
//             } else {
//                 objection();
//             }
//             return;
//         }
//     }

//     return {
//         analyzeSituation: analyzeSituation,
//         makeDecision: makeDecision
//     };
// })();