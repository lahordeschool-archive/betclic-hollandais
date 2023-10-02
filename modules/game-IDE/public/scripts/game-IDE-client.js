var socket;
let editor;

window.addEventListener("load", async ()=> {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    const saveBtn = document.getElementById("saveBtn")

    var clientName = "";
    const serveurAdress = getServeurSession();

    saveBtn.addEventListener('click', () =>{
        saveCode();
    });

    function SetServeurSession(){
        let storedData = JSON.parse(localStorage.getItem('SessionServerAdress'));
        const data = {
            value: storedData.value,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem('SessionServerAdress', JSON.stringify(data));
    }

    function SetServeurSession(adress){
        const data = {
            value: adress,
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
                    console.log('SessionServerAdress remove')
                } else {
                    // Utilisez vos données comme vous le souhaitez
                    return storedData.value;
                }
            }
            return false;
        }
    }


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
        serverListContainer.innerHTML = ''; // Videz le contenu actuel
        console.log(servers);
        servers.forEach((server, key) => {
            // Créez un élément pour chaque serveur
            const serverDiv = document.createElement('div');
            serverDiv.classList.add('server');
    
            const serverName = document.createElement('h2');
            serverName.textContent = key;
            serverDiv.appendChild(serverName);
    
            const playerCount = document.createElement('p');
            playerCount.textContent = `Players: ${server.nbPlayers}`;
            serverDiv.appendChild(playerCount);
    
            const gameStatus = document.createElement('p');
            gameStatus.textContent = `Game Status: ${server.gameInProgress ? "In Progress" : "Not Started"}`;
            serverDiv.appendChild(gameStatus);
    
            if (!server.gameInProgress) {
                const connectButton = document.createElement('button');
                connectButton.classList.add('connect-button');
                connectButton.textContent = 'Connect';
                
                // Attacher un écouteur d'événements au bouton
                connectButton.addEventListener('click', function() {
                    handleServerConnect(key);
                });
                
                serverDiv.appendChild(connectButton);
            }
    
            serverListContainer.appendChild(serverDiv);
        });

        function handleServerConnect(key) {
            if(localStorage.getItem("My_AI")){
                console.log(`L'utilisateur a cliqué sur le bouton de connexion pour le serveur: ${key}`);
                SetServeurSession(key);
                redirectTo('/game-IA');
            }else{
                alert('Veillez à sauvegarder votre IA.');
            }
        }
    }


});

function changeLanguage() {

    let language = $("#languages").val();

    if(language == 'node')editor.session.setMode("ace/mode/javascript");
}

function saveCode() {
    let data = editor.getSession().getValue();
    localStorage.setItem("My_AI", data);
}

function redirectTo(newPath) {
    window.location.href = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + newPath;
}

