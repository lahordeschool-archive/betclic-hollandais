var socket;


$(document).ready(async function(){


    $.get("/api/parrot/hub", function(data) {
        animateTypingText("#hubMessage", data);
    });

    $.get("/api/parrot/skull", function(data) {
        animateTypingText("#skullMessage", data);
    });


    var clientName = "";

    const serveurAddress = getServeurSession();


    function SetServeurSession(){
        let storedData = JSON.parse(localStorage.getItem('SessionServerAddress'));
        const data = {
            value: storedData.value,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem('SessionServerAddress', JSON.stringify(data));
    }

    function SetServeurSession(address){
        const data = {
            value: address,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem('SessionServerAddress', JSON.stringify(data));
    }

    function getServeurSession(){
        if(localStorage.getItem('SessionServerAddress')){
            let storedData = JSON.parse(localStorage.getItem('SessionServerAddress'));
            if (storedData) {
                const timeNow = new Date().getTime();
                const timeLimit =  5 * 60 * 1000;
                if (timeNow - storedData.timestamp > timeLimit) {
                    localStorage.removeItem('SessionServerAddress');
                    console.log('SessionServerAddress remove')
                } else {
                    // Utilisez vos données comme vous le souhaitez
                    return storedData.value;
                }
            }
            return false;
        }
    }

    function redirectTo(newPath) {
        window.location.href = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + newPath;
    }  

    $.get("/api/getUserInfos", function(data) {
        clientName = data.firstname;
        localStorage.setItem('UserFirstName', clientName);
        localStorage.setItem('UserMail', data.id);
    }).fail(function() {
        console.error("Erreur lors de la récupération des informations de l'utilisateur.");
    });

    clientName = localStorage.getItem('UserFirstName');

    socket = await io.connect();

    clientName = localStorage.getItem('UserName');


    socket.on('connect', () => {
    console.log('Connected to the server from client');
        // You can perform actions here when the connection is established
        socket.emit('connected');

        

        socket.on("messageTestReceived", (message) => {
            console.log(message);
        });

        socket.emit('HubMajRequest');

        socket.on('HubMaj', (updatedServers) => {
            const myMap = new Map(updatedServers);
            updateServerList(myMap);
        });    

    });

    function updateServerList(servers) {
        const serverListContainer = document.querySelector('.server-list');


        var iconsList = ["🏴‍☠️", "🦑", "🐚", "🦴", "🍺", "🎲", "🪕", "⚓️"]

        serverListContainer.innerHTML = ''; // Videz le contenu actuel
        console.log(servers);
        servers.forEach((server, key) => {
            // Créez un élément pour chaque serveur
            const serverDiv = document.createElement('div');
            serverDiv.classList.add('server');
    
            const serverName = document.createElement('h2');

            serverName.textContent = iconsList[Math.floor(Math.random() * iconsList.length)]+" Table de jeu : "+ key;
            serverDiv.appendChild(serverName);
    
            const playerCount = document.createElement('p');
            playerCount.textContent = `Joueurs connectés : ${server.nbPlayers}`;
    
            const gameStatus = document.createElement('span');
            gameStatus.textContent = `État de le partie : ${server.gameInProgress ? "⚔️ En cours" : "⏱ En attente"}`;
            playerCount.appendChild(document.createElement('br'));
            playerCount.appendChild(gameStatus);
            serverDiv.appendChild(playerCount);
    
            if (!server.gameInProgress) {

                const connectButtonIa = document.createElement('button');
                connectButtonIa.classList.add('btn');
                connectButtonIa.classList.add('btn-primary');
                connectButtonIa.textContent = '⚔️ Rejoindre en mode IA';
                
                // Attacher un écouteur d'événements au bouton
                connectButtonIa.addEventListener('click', function() {
                    handleServerConnectIA(key);
                });
                
                serverDiv.appendChild(connectButtonIa);


                const connectButton = document.createElement('button');
                connectButton.classList.add('btn');
                connectButton.classList.add('btn-secondary');
                connectButton.textContent = '⌨️ Entrainement';
                
                // Attacher un écouteur d'événements au bouton
                connectButton.addEventListener('click', function() {
                    handleServerConnect(key);
                });
                
                serverDiv.appendChild(document.createElement('br'));
                serverDiv.appendChild(connectButton);
            }
    
            serverListContainer.appendChild(serverDiv);
        });

        function handleServerConnect(key) {
            console.log(`L'utilisateur a cliqué sur le bouton de connexion pour le serveur: ${key}`);
            SetServeurSession(key);
            redirectTo('/game-ia/training');
        }

        function handleServerConnectIA(key) {
            console.log(`L'utilisateur a cliqué sur le bouton de connexion pour le serveur avec IA: ${key}`);
            SetServeurSession(key);
            redirectTo('/game-ia');
        }
    }
    
});
