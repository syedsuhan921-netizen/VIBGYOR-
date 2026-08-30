function showMessage() {
    alert("🚀 Welcome to VIBGYOR Technologies!");
}

function openSettings() {
    document.getElementById("settingsPanel").style.display = "flex";
}

function closeSettings() {
    document.getElementById("settingsPanel").style.display = "none";
}

function toggleTheme() {

    document.body.classList.toggle("light");

    alert("Theme setting updated!");
}

function showAbout() {

    alert(
        "VIBGYOR Technologies\n\n" +
        "Technology • AI • Programming • Gadgets\n\n" +
        "Created by SD. Suhan"
    );
}
