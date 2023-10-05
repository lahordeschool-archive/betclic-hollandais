$(document).ready(function() {

    $.get("/api/parrot/login", function(data) {
        $("#loginMessage").text(data);
    });
});