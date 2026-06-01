# The Secret Leadership Playbook - Classroom Pages

This folder is the launch base for the first custom classroom page set.

## Current Scope

- `index.html` - redirects to the first class page.
- `class-1-intro.html` - positions what Future Shaping is.
- `class-2-story.html` - presents the manufacturing CEO story, reflection questions, options, and the Control / Influence / No Control lens.
- `class-2-story-embed.html` - Class 2 without the internal classroom navigation, for embedding inside Systeme.io.
- `class-3-results.html` - reveals outcomes, explains the better move, and links worksheets plus flashcard decks.
- `styles.css` - shared visual system for all class pages.
- `lesson.js` - lightweight carousel behavior for the Leadership Blind Spots section.
- `fonts/` - bundled Elms Sans font files and license.
- `previews/` - static preview images for review only.

## Design References

- Early Access page: `https://janinemashigo.systeme.io/slpearlyaccess`
- Visual Identity PDF: `C:\Users\USER\Documents\Janine and Co\VISUAL IDENTITY PRESENTATION.pdf`

## Brand Application

- Premium decision-maker feel.
- Strategic, modern, and visually immersive.
- Typography: Anton for display headings and Elms Sans for body/UI text.
- Dark plum/purple for high-impact lesson moments.
- Cream backgrounds for reflection, resources, and thinking work.
- Use flat brand color fields. Avoid gradients.
- Green for progress, emphasis, downloads, and calls to action.
- Black-and-white or low-saturation imagery so the brand palette stays dominant.
- Structured content blocks with subtle organic line/shape movement.

## Replace Before Launch

Search the HTML files for the word `Replace`.

Update:

- Class 1 video iframe.
- Class 2 story video iframe.
- Leadership Blind Spots carousel copy, if you want to change the six blind spots.
- Class 3 results video iframe.
- CEO b-roll or still image.
- Future Shock Flashcard Deck URL.
- Future Shaping Flashcard Deck URL.
- Future Shaping Worksheet URL.
- Decision Reflection Notes URL.
- Coaching call URL.

## Fast Systeme.io Integration

Use Systeme.io for:

- login and access control
- payment and checkout
- email automation
- course/module container

Use these hosted pages for:

- the premium classroom experience
- embedded videos
- worksheet and flashcard deck links
- coaching call CTA

In Systeme.io, each lesson can contain one simple button/link to the corresponding hosted page:

- Class 1: `/class-1-intro.html`
- Class 2: `/class-2-story.html`
- Class 3: `/class-3-results.html`

For iframe embedding inside a Systeme lecture, add `?embed=1` to reduce top chrome and whitespace:

- Class 2 embed test: `/class-2-story.html?embed=1`

For a more stable Systeme embed, use the dedicated embed page:

- Class 2 dedicated embed: `/class-2-story-embed.html`

## Integration Test Before Building Further

Before designing the navigation, product, and checkout pages, test this small set:

1. Upload only this `classroom-pages` folder to a GitHub repository.
2. Enable GitHub Pages for the repository.
3. Confirm that Class 1, Class 2, and Class 3 open from the live GitHub Pages URL.
4. In Systeme.io, create one test lesson page.
5. Add a button or link from that Systeme lesson page to the GitHub Pages Class 2 URL.
6. Test as a learner: login through Systeme, click into the lesson, open the hosted classroom page, and return to Systeme.
7. If Systeme allows an embed/custom iframe block, test embedding the GitHub Pages Class 2 URL too. If the embed looks constrained, use a button/link instead.

## GitHub Pages Notes

When this folder is uploaded to a GitHub repository and GitHub Pages is enabled, `index.html` will send learners to Class 1 by default.
