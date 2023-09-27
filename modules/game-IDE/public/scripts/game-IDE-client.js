let editor;

window.addEventListener("load", async ()=> {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    const saveBtn = document.getElementById("saveBtn")

    saveBtn.addEventListener('click', () =>{
        saveCode();
    });

});

function changeLanguage() {

    let language = $("#languages").val();

    if(language == 'node')editor.session.setMode("ace/mode/javascript");
}

function saveCode() {

    let data = editor.getSession().getValue();
    localStorage.setItem("My_AI", data);

    redirectTo('/game-IA');
}

function redirectTo(newPath) {
    window.location.href = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + newPath;
}

