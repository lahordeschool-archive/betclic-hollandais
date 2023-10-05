$(document).ready(function() {

    $.get("/api/parrot/register", function(data) {
        $("#registerMessage").text(data);
    });
});