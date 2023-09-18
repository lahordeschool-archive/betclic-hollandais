$(document).ready(function () {
  $("#join-team-form").submit(function (event) {
    var teamId = $("#teamId").val();
    if (teamId !== "") {
      $(this).attr("action", "/login/join-team/" + teamId);
      $('#teamId').remove();
    } else {
      event.preventDefault();
    }
  });
});
