# GitHub Streak Notifier

A Chrome extension that tracks your GitHub contribution streak and notifies you to help keep your streak alive.

You can view all the details here: https://deepwiki.com/abdala-elgendy/github-streak-contributions.

## Features

- Tracks your current GitHub contribution streak.
- Daily notifications if you haven't contributed yet.
- Options page to securely store your GitHub username and personal access token.
- Popup displays your current streak and username.

## Installation

1. Clone or download this repository.
2. Open `chrome://extensions/` in your Chrome browser.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.

## Setup

1. Click the extension icon and open **Options**.
2. Enter your GitHub username and a [personal access token](https://github.com/settings/tokens) (with `read:user` scope).
3. Save your settings.

## Usage

- The popup shows your current streak and username.
- If you haven't contributed today, you'll receive a notification reminder.

## Development

- Background logic is in `background.js`.
- Popup UI is in `popup.html` and `popup.js`.
- Options page is in `options.html` and `options.js`.

## Permissions

- `storage`: To save your username and token.
- `notifications`: To send daily reminders.
- `alarms`: To schedule daily checks.

## License

MIT License
