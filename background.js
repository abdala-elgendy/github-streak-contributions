// This is the background script for the extension.
// It will handle fetching data from the GitHub API, calculating the streak,
// and creating daily notifications. not working yet

console.log("Background script loaded.");

async function fetchContributionData() {
    const items = await new Promise((resolve) => {
        chrome.storage.sync.get({ githubUsername: "", githubToken: "" }, resolve);
    });

    const { githubUsername, githubToken } = items;

    if (!githubUsername || !githubToken) {
        console.error(
            "GitHub username or token not set. Please set them in the extension options."
        );
        return;
    }

    const query = `
    query($userName: String!) {
        user(login: $userName) {
        contributionsCollection {
            contributionCalendar {
            totalContributions
            weeks {
                contributionDays {
                contributionCount
                date
                }
            }
            }
        }
        }
    }
    `;

    const variables = {
        userName: githubUsername,
    };

    try {
        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${githubToken}`,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            console.error("GitHub API request failed:", response.status);
            return null;
        }

        const data = await response.json();
        console.log("Fetched GitHub data:", data);

        if (data && data.data && data.data.user) {
            const streak = calculateStreak(
                data.data.user.contributionsCollection.contributionCalendar
            );
            console.log("Current streak:", streak);
            chrome.storage.local.set({ streak: streak }, () => {
                console.log("Streak of " + streak + " days saved to storage.");
            });
        }

        return data;
    } catch (error) {
        console.error("Error fetching contribution data:", error);
        return null;
    }
}

function calculateStreak(contributionCalendar) {
    const allDays = contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
    );

    const contributionMap = new Map();
    allDays.forEach((day) => {
        contributionMap.set(day.date, day.contributionCount);
    });

    let currentStreak = 0;
    let date = new Date();

    // If today has no contributions, start checking from yesterday.
    const todayStr = date.toISOString().slice(0, 10);
    if (contributionMap.get(todayStr) === 0 || !contributionMap.has(todayStr)) {
        date.setDate(date.getDate() - 1);
    }

    // Loop backwards day by day to count the streak.
    for (let i = 0; i < 365 * 2; i++) {
        // Check up to 2 years back
        const dateStr = date.toISOString().slice(0, 10);

        if (contributionMap.has(dateStr) && contributionMap.get(dateStr) > 0) {
            currentStreak++;
        } else if (contributionMap.has(dateStr)) {
            // Day with 0 contributions found, end of streak.
            break;
        }
        // If date is not in map, it might be a weekend or holiday before the year data starts, so we continue checking.

        date.setDate(date.getDate() - 1);
    }

    return currentStreak;
}

// When the extension is installed, and daily thereafter, check the streak
// and set a notification if needed.

chrome.runtime.onInstalled.addListener(() => {
    console.log("GitHub Streak Notifier installed.");
    checkStreakAndNotify();

    // Schedule the check to run daily.
    chrome.alarms.create("daily-check", {
        delayInMinutes: 1, // Start check 1 minute after install/update
        periodInMinutes: 1440, // Repeat every 24 hours
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "daily-check") {
        console.log("Running daily streak check...");
        checkStreakAndNotify();
    }
});

async function checkStreakAndNotify() {
    const data = await fetchContributionData();

    if (data && data.data && data.data.user) {
        const calendar =
            data.data.user.contributionsCollection.contributionCalendar;
        const todayStr = new Date().toISOString().slice(0, 10);

        const todayData = calendar.weeks
            .flatMap((week) => week.contributionDays)
            .find((day) => day.date === todayStr);

        const hasContributedToday = todayData && todayData.contributionCount > 0;

        if (!hasContributedToday) {
            // If no contribution today, send a reminder notification.
            chrome.notifications.create({
                type: "basic",
            
                title: "Keep your GitHub streak alive!",
                message:
                    "You haven't made a contribution yet today. Don't lose your streak!",
                priority: 2,
            });
            console.log("Contribution reminder notification sent.");
        } else {
            console.log("Contribution already made today. No notification needed.");
        }
    }
}
