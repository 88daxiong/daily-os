# Daily OS

> A minimal personal daily operating system for macOS — built entirely with vibe coding.

<p align="center">
  <img src="screenshots/today.png" width="800" alt="Daily OS Today View">
</p>

## What is this?

Daily OS is a lightweight Electron app that helps you manage your daily routine. No cloud, no account, no complexity — just a single-file local app that keeps your day on track.

**This project was 100% vibe-coded** — designed and implemented through natural language conversations with Claude (Anthropic), from architecture to pixel-level UI polish. Zero lines were written by hand.

## Features

- **Today View** — task list with time tracking, overdue detection, and completion progress
- **Smart Time Picker** — 4 input modes: time period, start-end range, start+duration, offset from now
- **Draft Box** — quick capture ideas, schedule them to today or future dates
- **Data Insights** — 30-day heatmap, tag-based stats, 14-day trend chart, streak tracking
- **Template System** — define your daily routine, auto-populate each morning
- **Mood & Thoughts** — daily mood tracker + freeform thought journal
- **Dark Mode** — follows system preference or manual toggle
- **100% Local** — all data stored in `~/Library/Application Support/DailyOS/`
- **Auto Archive** — monthly auto-archive keeps things fast

## Screenshots

| Today | Insights | Drafts | Templates |
|:-----:|:--------:|:------:|:---------:|
| ![](screenshots/today.png) | ![](screenshots/insights.png) | ![](screenshots/drafts.png) | ![](screenshots/templates.png) |

> Add your own screenshots to the `screenshots/` folder.

## Quick Start

### Prerequisites

- macOS 12+
- Node.js 18+

### Run in development

```bash
git clone https://github.com/daxiong/daily-os.git
cd daily-os
npm install
npm start
```

### Build .dmg installer

```bash
bash build.sh
```

The DMG will open automatically — drag Daily OS into Applications.

## Tech Stack

- **Electron** — native macOS app shell
- **Vanilla JS** — single `index.html` with everything inlined (no framework, no build step)
- **GitHub-style Design** — clean, minimal UI with CSS variables for theming

## Project Structure

```
daily-os/
├── main.js          # Electron main process
├── preload.js       # Context bridge (IPC)
├── index.html       # All UI, CSS, and JS in one file
├── package.json     # Dependencies & build config
├── build.sh         # One-click macOS build script
└── build/
    └── icon.icns    # App icon
```

## Data & Privacy

All data is stored locally at:

```
~/Library/Application Support/DailyOS/
├── data.json        # Tasks, templates, thoughts, mood
├── settings.json    # User preferences
└── archive/         # Monthly auto-archived data
```

Nothing leaves your machine. No analytics, no telemetry, no network requests.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+Space` | Toggle window (global) |
| `Cmd+1~5` | Switch tabs |
| `N` | Quick jump to draft box |
| `Escape` | Close modal / blur |

## Customization

### Templates

Go to **Template Management** to add/edit/remove your daily routine items. Each template has a title, note, time, tag, and a toggle for whether it auto-populates each day.

### Tags

Create custom tags with any color to categorize your tasks (e.g., Health, Work, Life).

## Vibe Coding

This project is a demonstration of **vibe coding** — building software through natural language conversation with AI. The entire app, from architecture decisions to CSS animations, was created by describing intentions in Chinese to Claude and iterating on the results.

If you're interested in this approach, feel free to fork and vibe-code your own features!

## License

[MIT](LICENSE) — do whatever you want with it.
