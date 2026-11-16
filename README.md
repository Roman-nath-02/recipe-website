# Sunday Spoon

A static-first recipe box built with semantic HTML, one stylesheet, and a small amount of browser-native JavaScript. Recipe files and kitchen photos stay local to the site; there is no framework, build step, external image service, or dependency to install. Serve the folder over HTTP (for example, `python -m http.server`) because browsers do not allow `fetch()` to read local JSON files from a `file://` page.

## Adding recipes

The recipe index is `recipes/index.json`. It starts empty because no recipe files or photos were supplied. Add each recipe as a separate JSON text file in `recipes/`, then add its relative path to that index. Keep photos in `assets/recipes/` and use those relative paths in the `images` array. Use real photos supplied by you; image paths outside that folder are not displayed.

Recipe file fields:

```json
{
  "id": "a-short-unique-name",
  "title": "Your recipe title",
  "description": "A short introduction in your own words.",
  "category": "Dinner",
  "featured": false,
  "tags": ["Weeknight"],
  "cookingTime": "35 minutes",
  "images": ["assets/recipes/your-photo.jpg"],
  "ingredients": [
    { "amount": "2 cups", "name": "an ingredient" }
  ],
  "instructions": [
    "Add your own first step.",
    "Add your own next step."
  ],
  "notes": "Optional notes."
}
```

Only add content that belongs to your recipe. `images` can contain multiple photo paths; the detail page turns them into a small gallery. `featured` can be `true` for a recipe that should appear in the favorites section. Categories are generated from the recipe files, and search checks the title, description, category, tags, and ingredient names. If there are no recipe files, the site shows an honest empty state with a link back to these instructions.
