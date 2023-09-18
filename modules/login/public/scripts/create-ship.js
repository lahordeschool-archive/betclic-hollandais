$(document).ready(function () {
    const classesDescription = {
        cruiser: "A Cruiser-class spaceship is a versatile and heavily armed starship, combining firepower, defensive capabilities, and exploration features. It serves as a formidable asset in combat scenarios while offering the agility and range for exploration missions.",
        destroyer: "A Destroyer-class spaceship is a powerful and agile starship, specializing in offensive capabilities and rapid response. With its advanced weaponry and maneuverability, it is designed to engage and neutralize enemy vessels swiftly, making it a formidable force in combat situations.",
        cargo: "Cargo ships are reliable and capacious vessels designed for efficient transportation of goods and resources across vast distances. With their expansive cargo holds and sturdy construction, these ships prioritize cargo capacity and practicality, making them indispensable in interstellar trade and logistics.",
        "science-vessel": "Science vessels are advanced and specialized starships equipped with state-of-the-art scientific instruments and research facilities. They are dedicated to conducting in-depth exploration, data collection, and analysis of celestial phenomena, making groundbreaking discoveries. With their cutting-edge sensors and laboratories, science vessels contribute significantly to expanding our knowledge of the universe and advancing scientific understanding."
    };
    function setClassDescription(){
        const selectedClass = $("#starshipClass").val();
        $("#shipClassDescription").html(classesDescription[selectedClass]);
    }
    $("#starshipClass").change(function () {
        setClassDescription();
    });
    setClassDescription();
});