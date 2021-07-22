# Node UTStats 2
Unreal Tournament stats tracking website using node.js and mysql.

# Current Features
- Match reports
- Player Match reports
- Player profiles
- Ranking system
- Records system
- Maps system
- User Accounts (in future builds you will be able to save matches, players to your favourites for easy tracking)
- Admin management system, change what the site displays and how it's displayed. You can also give a user permission to upload map images.

# Current Supported Gametypes
- Deathmatch
- Team Deathmatch
- Capture The Flag
- Domination 
- Assault
- Last Man Standing
- MonsterHunt

## Thanks to
- Many thanks to the original creators of the UTStats mutators **azazel, )°DoE°(-AnthraX and toa**
- Thanks to **Krull0r** for the Monster Icons.

# Requirements
- Node.js 14.17 or greater.
- Mysql

# Install
- Extract the contents of the archive into a folder.
- Open command prompt in the folder.
- Run the command **npm install** to install all the dependencies.
- Open config.json, and change the mysql settings to match your mysql setup and then save the file.
![alt text](https://i.imgur.com/nwuVLkp.png "config.json image")
- Now run the command **node install** this will create the database and all the tables needed by node utstats 2.

# Install Unreal Tournament mutators
- Go to the Mutators folder of the nodeutstats2 archive.
- Copy the contents to your UnrealTournament system's folder.
- Now open your UnrealTournament server's UnrealTournament.ini and find the block **[Engine.GameEngine]**.
- Now add the following line at the bottom of the block:
```
ServerPackages=UTSAccuBeta4_2
ServerActors=UTStatsBeta4_2.UTStatsSA
ServerActors=NodeUTStats2.NodeUTStatsServerActor
```
- In the same file under the block **[Engine.GameInfo]**, make sure bLocalLog is set to **false** like this **bLocalLog=False**.
- If you are running UT469A, or UT469B on your server, check the block **[Engine.StatLog]** and make sure **WorldLogDir** is set to **../Logs**(There was a bug where it was set to blank making the logs being written to the root directory of the drive)
- Restart your UnrealTournament server if it's running

# Starting the website
- You have two options of running the website, development mode(slow, but easier for debugging) or production mode.
- To run in development mode open command prompt in the installed folder and run the command **npm run dev**
- To run in production mode run the following commands in this order, **npm run buld** this will create the production version of the website(will take a few seconds), once that has finished run the command **npm run start** to run the production website. 
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Creating an admin account
- If there are no users in the database, create an account by going to the site's login page, then press the "Not a member? Register now!" button, the next created account will automatically set to admin, and will be activated.

# Adding FTP servers
- FTP accounts require read, write, and delete privileges. 
- To add FTP servers to node utstats 2, go to the admin area of the website, then "FTP manager", then finally "Add Server", there is no limit in the amount of servers you can add.
- Target Folder must link to your UnrealTournament main folder(CASE SENSITIVE), e.g /Servers/UnrealTournament/ for an FTP user with entry point of C:/
![alt text](https://i.imgur.com/aMJUxCm.png "ftp image")
- You can later edit settings if required.

# Running the importer
- Go to the folder you installed node utstats 2
- Open command prompt, type **node importer** to start the import process(you can put stat logs in the /Logs folder to skip the ftp download).
- Once completed you should see on your website new matches & players being displayed in their respected pages.


# NexgenStatsViewer Support
- There are many more data types to be displayed instead of the standard top player rankings for each gametype, you can create lists in the admin control panel.
- To setup nexgenstatsviewer to work with Node UTstats 2 you must edit/add the following to Nexgen.ini in your UnrealTournament/System folder
```
[NexgenStatsViewer105.NSVConfigExt]
lastInstalledVersion=105
enableUTStatsClient=True
utStatsHost=localhost
utStatsPort=3000
utStatsPath=/api/nexgenstatsviewer
```

# Experimental IPToCountry Support
To add this feature to your server add the following entries in IpToCountry.ini in your UnrealTournament system folder.
- QueryServerHost **127.0.0.1**(The ip you host node utstats on)
- QueryServerFilePath **/api/iptocountry**
- QueryServerPort **3000**(The port node ustats site uses)

