$(document).ready(function() {
    $("button, input").on('click', function() {
        $('#audioClick')[0].play();
    });



});

function animateTypingText(selector, data){
    $(selector).removeClass("animate__animated");
    $(selector).text("");
    let words = data.split(" ");

    setTimeout(() => {
      let welcomeText = $(selector).text();
      $(selector).text(welcomeText.slice(0, -2));
    }, 100 * words.length);

    for (let i = 0; i < words.length; i++) {
      setTimeout(() => {
        if (i > 0) {
          let welcomeText = $(selector).text();
          $(selector).text(welcomeText.slice(0, -2)); // Remove the last two characters
        }
        $(selector).append(words[i] + " 🁢");
      }, 100 * i);
    }
}