# Vellix website

The public website for the Vellix Discord bot: home page, command list, Terms of Service, and Privacy Policy.
It's plain HTML and CSS, so there's nothing to build. Render serves the files as they are.

## Pages
- `/` home
- `/commands/` every slash command
- `/terms/` Terms of Service
- `/privacy/` Privacy Policy

## Things to fill in
Open `assets/site.js` and change the two values at the top:
- `clientId`: your Application ID (Developer Portal → General Information)
- `support`: your support server invite link

Every "Add to Discord" and "Support" link on the site updates from those two lines.
