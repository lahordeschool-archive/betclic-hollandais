var socket;
let editor;

$(document).ready(async function(){
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    const saveBtn = document.getElementById("saveBtn")

    var clientName = "";
    const serveurAdress = getServeurSession();

    DisplayCode();

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



});


function saveCode() {
    let data = editor.getSession().getValue();
    localStorage.setItem("My_AI", data);
    alert('save code');
}

function DisplayCode() {
    if(localStorage.getItem('My_AI')){
        let content = localStorage.getItem('My_AI');
        editor.setValue(content);

    }else{
        let content = `
        /*
         * Modèle pour créer une IA pour le jeu Perudo.
         *
         * Fonctions disponibles:
         * - window.bet(newbet) : pour parier. 'newbet' est un tableau de la forme [count, value]. 
         *   Renvoie 'true' si le pari est valide et envoyé, sinon 'false'.
         * - window.objection() : pour objecter. 
         *   Renvoie 'true' si l'action est valide et envoyé, sinon 'false'.
         *
         * Données disponibles:
         * - playerList : la liste des joueurs.
         * - actualManche : manche actuelle.
         * - actualRound : round actuel.
         * - actualBet : dernier pari fait.
         * - actualTotalDices : nombre total de dés actuels.
         * - actualPlayerIndex : index du joueur actuel.
         * - playerDices : les dés du joueur.
         * - isSpecialManche : indique si la manche actuelle est spéciale.
         */
        
        // Exemple d'une fonction pour décider d'une action en fonction des données disponibles.
        function decideAction() {
            // Si le pari actuel est [0, 1] ou [0, 2], ce qui signifie le début de la partie.
            if (actualBet[0] === 0 && (actualBet[1] === 1 || actualBet[1] === 2)) {
                // Placer un pari initial
                window.bet([1, 3]);  // Par exemple, parier qu'il y a au moins un dé avec la valeur 3.
            } else {
                // Si vous avez une stratégie pour surenchérir ou contester, ajoutez-la ici.
                // Par exemple, si le pari actuel est que 4 dés sont des 3, et que vous avez 3 dés avec la valeur 3,
                // vous pouvez décider de surenchérir ou de contester.
        
                // Ceci est un exemple simpliste. Une véritable IA nécessiterait une stratégie plus élaborée.
                if (actualBet[0] >= 4 && actualBet[1] === 3 && playerDices.filter(dice => dice === 3).length >= 3) {
                    window.bet([5, 3]);  // Surenchérir en disant qu'il y a au moins 5 dés avec la valeur 3.
                } else {
                    window.objection();  // Sinon, contester le pari.
                }
            }
        }
        
        // Appelons la fonction pour décider de l'action à entreprendre.
        decideAction();
        `;
        
        editor.setValue(content);
    }
}

function redirectTo(newPath) {
    window.location.href = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + newPath;
}

