# Notes for Claude

This repo is the Jayastra studio website (jayastra.com), deployed by Vercel from the `Jayastra/` folder on the `main` branch.

- Edit only `source/src/app.jsx` (content, components, routes) and `source/src/shell.html` (CSS). Never hand-edit `Jayastra/`.
- After any change run `cd source && python build.py`, which regenerates `Jayastra/` (46 pre-rendered routes + 404, sitemap.xml, robots.txt, vercel.json). It must print "built preview ... deploy pages 46".
- Then `git add -A`, commit with a clear message, and `git push origin main`.
- Brand: orange #D24E01, ink #0E0E10, white. Fonts Inter Tight / Inter.
- The owner's rule: don't change the wording of existing text unless asked; avoid decorative elements that look AI-generated.
- Case studies are concept projects and stay labelled "Concept project" until replaced with real client work.
- The booking form sends by email for now; Cal.com will be connected later.
