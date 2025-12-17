# YDBG Beta Feedback - Levels 2-5

This is the feedback collection site for Levels 2-5 beta testers.

## Setup

The site is configured and ready to use. The following items need to be completed:

### 1. Populate Beta Tester Roster

Edit `script.js` and update the `BETA_TESTER_ROSTER` object with the actual names for each level:

```javascript
const BETA_TESTER_ROSTER = {
    "Level 2": [
        "Name 1",
        "Name 2",
        // Add all Level 2 testers here
    ],
    "Level 3": [
        "Name 3",
        "Name 4",
        // Add all Level 3 testers here
    ],
    "Level 4": [
        "Name 5",
        // Add all Level 4 testers here
    ],
    "Level 5": [
        "Name 6",
        // Add all Level 5 testers here
    ]
};
```

## Features

- **Beta Testing Group Selection**: Users must select their level (2-5) before selecting their name
- **Group-Filtered Names**: The name dropdown is dynamically populated based on the selected group
- **No Admin Panel**: This site does not include admin functionality (separate from Level 1 site)
- **New Google Sheet Integration**: Writes to a separate Google Sheet for Levels 2-5
- **New Drive Folder**: Screenshots are uploaded to a dedicated Drive folder

## Configuration

The site uses `config.prod.js` for API endpoints:
- Slack webhook URL
- Google Sheets/Apps Script URL

## Access

If deployed via GitHub Pages, the site will be available at:
`https://<org-or-user>.github.io/ydbg_beta_feedback/level2-5/`

## Testing

To test locally:
```bash
python3 -m http.server 8000
```
Then open: `http://localhost:8000/level2-5/`

