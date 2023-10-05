$(document).ready(function() {

    $.get("/api/parrot/register", function(data) {
        animateTypingText("#registerMessage", data);
    });
});