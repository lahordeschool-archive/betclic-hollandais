function textAnimate(selector, text){
    console.log("textAnimate");
    selector.removeClass("animate__animated");
    selector.text("");
    let words = text.split(" ");

    setTimeout(() => {
      let welcomeText = $(selector).text();
      $(selector).text(welcomeText.slice(0, -2));
    }, 100 * words.length);

    for(let i = 0; i < words.length; i++) {
      setTimeout(() => {
        if (i > 0) {
          let welcomeText = $(selector).text();
          $(selector).text(welcomeText.slice(0, -2)); // Remove the last two characters
        }
        $(selector).append(words[i] + " 🁢");
      }, 100 * i);
    }
}
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$(document).ready(function () {
  $(".header-profile-container").click(function () {
    $(".profile-menu").toggleClass("show");
    $(".profile-menu").toggleClass("hidden");
  });
});