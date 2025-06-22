// Saves options to chrome.storage
function save_options() {
  const username = document.getElementById('username').value;
  const token = document.getElementById('token').value;
  
  chrome.storage.sync.set({
    githubUsername: username,
    githubToken: token
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores options from chrome.storage
function restore_options() {
  chrome.storage.sync.get({
    githubUsername: '',
    githubToken: ''
  }, function(items) {
    document.getElementById('username').value = items.githubUsername;
    document.getElementById('token').value = items.githubToken;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('options-form').addEventListener('submit', function(e) {
  e.preventDefault();
  save_options();
}); 