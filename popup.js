// We will add code here to update the streak count in popup.html
document.addEventListener("DOMContentLoaded", () => {
    //get the streak from storage and disply it.
    const streakCountElement = document.getElementById("streak-count");

    chrome.storage.local.get(["streak"], (result) => {
        streakCountElement.textContent = result.streak || 0;
    });
});

document.getElementById('open-options').addEventListener('click', function(e) {
  e.preventDefault();
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

chrome.storage.sync.get(['githubUsername'], (result) => {
    const username = result.githubUsername || 'Not set';
    document.getElementById('username').textContent = username;
});
