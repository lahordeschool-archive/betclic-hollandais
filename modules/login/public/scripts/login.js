$(document).ready(function() {

    $.get("/api/parrot/login", function(data) {
        animateTypingText("#loginMessage", data);
    });


});