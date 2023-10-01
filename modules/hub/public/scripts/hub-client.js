window.addEventListener("load", ()=>{
    document.addEventListener("DOMContentLoaded", function() {
        const buttons = document.querySelectorAll(".connect-button");
        buttons.forEach((button, index) => {
            button.addEventListener('click', function() {
                // Example logic: Connect to the server
                connectToServer(index); 
            });
        });
    });
    
    function connectToServer(serverIndex) {
        // Your logic to connect to the server
        console.log(`Connecting to server at index ${serverIndex}`);
    }    
});

