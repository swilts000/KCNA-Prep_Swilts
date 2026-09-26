# Dynamic KCNA Learning App

A single HTML/CSS/JS app that dynamically renders lessons from JSON files.

## How to Use

1. Open `index.html` in a browser (use a local server for best results)
2. Select chapters from the dropdown in the bottom-right corner
3. Navigate between lessons using the top navigation
4. Click card headers to expand/collapse content
5. Launch labs to test your knowledge

## Adding New Chapters

### 1. Create a JSON file

Create a new file in `chapters/` folder (e.g., `chapter3.json`):

```json
{
    "title": "Chapter 3: Your Chapter Title",
    "subtitle": "A brief description",
    "themeColor": "#326ce5",
    "themeColorDark": "#2857b8",
    "lessons": [...],
    "summary": [...]
}
```

### 2. Register in index.json

Add your chapter to `chapters/index.json`:

```json
[
    { "file": "chapter1.json", "title": "Chapter 1: ..." },
    { "file": "chapter2.json", "title": "Chapter 2: ..." },
    { "file": "chapter3.json", "title": "Chapter 3: Your New Chapter" }
]
```

## JSON Structure Reference

### Lesson Structure

```json
{
    "title": "Lesson 1: Full Title",
    "navTitle": "Short Nav Title",
    "cards": [...],
    "lab": {...}
}
```

### Card Structure

```json
{
    "title": "Card Title",
    "content": [
        { "type": "text", "value": "Regular paragraph text" },
        { "type": "highlight", "value": "Highlighted centered text" },
        { "type": "quote", "value": "Blockquote text" },
        { "type": "list", "items": ["Item 1", "Item 2"] },
        { "type": "keypoint", "badge": "Badge Text", "value": "Key point text" },
        { "type": "concept", "title": "Concept Title", "value": "Explanation" },
        { "type": "example", "title": "Example Title", "value": "Example text" },
        { "type": "tags", "items": ["Tag1", "Tag2", { "text": "Primary Tag", "primary": true }] },
        { "type": "stats", "items": [{ "value": "100", "label": "Label" }] },
        { "type": "grid", "columns": 2, "items": [
            { "icon": "🎯", "title": "Title", "text": "Description" }
        ]},
        { "type": "comparison", "leftTitle": "Pros", "rightTitle": "Cons",
            "left": ["Pro 1", "Pro 2"],
            "right": ["Con 1", "Con 2"]
        },
        { "type": "nested", "title": "Expandable Section", "content": [...] }
    ]
}
```

### Lab Types

#### Quiz Lab

```json
{
    "title": "Quiz Title",
    "type": "quiz",
    "questions": [
        {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C"],
            "answer": "0"
        },
        {
            "question": "Multi-select question?",
            "options": [
                { "text": "Option A", "value": "a" },
                { "text": "Option B", "value": "b" }
            ],
            "answer": ["a", "b"],
            "multi": true
        }
    ]
}
```

#### Drag & Drop Lab

```json
{
    "title": "Drag Drop Title",
    "type": "dragdrop",
    "instructions": "Drag items to correct zones:",
    "zones": [
        { "id": "zone1", "title": "Zone 1 Title" },
        { "id": "zone2", "title": "Zone 2 Title" }
    ],
    "items": [
        { "text": "Item text", "zone": "zone1" },
        { "text": "Another item", "zone": "zone2" }
    ]
}
```

### Summary Structure

```json
"summary": [
    { "icon": "🎯", "title": "Topic", "text": "Brief description" }
]
```

## Theme Colors

Set custom colors per chapter:

```json
{
    "themeColor": "#326ce5",
    "themeColorDark": "#2857b8"
}
```

Suggested colors:
- Blue: `#326ce5` / `#2857b8`
- Purple: `#8b5cf6` / `#6d28d9`
- Green: `#00d4aa` / `#00b894`
- Orange: `#f97316` / `#ea580c`
- Red: `#ef4444` / `#dc2626`

## Running Locally

Due to browser security (CORS), you need a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# VS Code
# Use "Live Server" extension
```

Then open `http://localhost:8000`
