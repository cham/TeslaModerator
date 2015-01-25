# TeslaModerator
a small app that allows basic moderation of Tesla forums

To run
------
- git clone this repo
- npm install
- `node moderator-app.js --moderators=youraccountname`
- you can have more than one moderator, use commas to separate the account names
- `npm start` will start the app with the 'cham' and 'nicko' accounts as moderators

Features
--------
- [x] login restricted to whitelist passed at app initialisation
- [ ] switch registrations on and off
- [x] ban users
- [x] change passwords
- [ ] close threads
- [ ] delete threads
- [ ] edit posts
- [x] edit user details
- [x] search users

