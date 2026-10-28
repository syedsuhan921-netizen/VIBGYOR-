function showPage(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    window.scrollTo(0, 0);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function showMessage() {
    alert("Welcome to VIBGYOR Technologies! Click any category card to open its dedicated full page.");
}
