# FB-Games-Chatbot
An open-source chatbot designed to keep track of overall standings in leaderboard-enabled facebook games.

### A few notes on usage:

The full list of (public) commands is as follows:

* **/standings** - print list of overall scores
* **/detail** - get your numbers of medals
* **/moredetail** - get a list of all the games you have a medal in

You can print this list at any time by typing **/help**.

The bot will send trophies to reward notable achievements. Try it out yourself to see how you can earn them!

**IMPORTANT:** The bot works by pulling the leaderboard out of the messages sent in the chat - you will need to play every game that you want to show up in the standings at least once so the bot can pull the information from it. It's also wise to check the standings after each initial game, as the bot can occasionally miss a message in a high volume chat.

## To add the bot - Easy version

Add https://www.facebook.com/profile.php?id=100015606584874 to your group chat.

## To add the bot - Self setup

I have included a few files to make self-setup and db management easier:

* **del.js** - manually inspect the database and find the user_id you are looking for - input it here and you can remove a user from your standings.
* **db.js** - wrapper for making a manual query to the database.
* **Standings** - this is the sqlite db.
* **script.sh** - this script is setup to automatically restart the bot within a cronjob.
* **config.json** - where you will need to place your configuration information for the bot's facebook account.

The easiest way to start the bot is simply to run `node app.js` in the appropriate directory (a more advanced user might run the script within a tmux instance). The current configuration has the bot running within a cronjob that restarts it every 12 hours. There are certain errors attendant to the chat api and a regular restart was the least painful way to fix them.
You can run the cronjob with script.sh, mine looks something like this:

`0 */12 * * * /usr/bin/sh .../Fb\ games/script.sh >/dev/null 2>&1`

I have also provided a sample config file - you should probably `chmod 700` your own to prevent your dummy account from being hijacked.

The `/genauthcode` functionality only works if you have access to the console log output. Essentially, it acts as an easy way to run commands as an admin. Nothing particularly important uses this, but some fun commands *can* be implemented by taking advantage of it.
