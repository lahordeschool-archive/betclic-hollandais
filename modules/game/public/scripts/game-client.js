console.log("test");

if(localStorage.getItem('UserFirstName') == null){
    $.get("/api/getUserInfos", function(data) {
        localStorage.setItem('UserFirstName', data.firstname);
        localStorage.setItem('UserMail', data.id);
    }).fail(function() {
        console.error("Erreur lors de la récupération des informations de l'utilisateur.");
    });
}