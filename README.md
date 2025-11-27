# Node UTStats 2
Unreal Tournament stats tracking website using node.js and mysql.

# Requirements
- Node.js 20.9.0 or greater.
- Mysql

# Upgrading Ranges
- Version 2.15.0+ is only compatable with 2.15.0 or higher.
- Version 2.8.0 to 2.14.2 are compatable with each other. 
- Version 2.0.0 to 2.7.X are compatable with each other.

# Current Features
- Match Reports
- Match Screenshots
 ![ddddddddd](https://github.com/user-attachments/assets/0e648855-6797-4b52-9c85-9ba78de06b75)
- Player Match Reports
- Player Profiles
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1820d1b7-b306-4d72-9d2a-90a9db9ac31b" />
- Player Ranking System
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/612b594b-9945-47f5-b5ee-a1344bc0280e" />
- Records System, see who has the most kills on a map/gametype and many more.
  <img width="1901" height="1080" alt="adfffffffff" src="https://github.com/user-attachments/assets/0fa44120-c24b-4cae-bc77-779bd51fc51a" />
- Capture The Flag Records, this includes flag capture records for all ctf maps, solo caps and assisted caps are split into two different categories.
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fb2f1948-d0ee-4ff2-9048-310c45512390" />

- Map Stats
- Admin management system, change what the site displays and how it's displayed. You can also give a user permission to upload map images
- ACE support
- SFTP Support
- Basic ACE HWID

# Current Supported Gametypes
- Deathmatch
- Team Deathmatch
- Capture The Flag
- Domination 
- Assault
- Last Man Standing
- MonsterHunt
- CTF4


# Install
- Extract the contents of the archive into a folder.
- Open command prompt in the folder.
- Run the command **npm install** to install all the dependencies.
- Open config.json, and change the mysql settings to match your mysql setup.
- Also in config.json you will see the variable called **importInterval**, this will tell the importer how long to wait(in seconds) between looking for new logs to import. IF you set this to 0 the import will run once only.
- 
![alt text](https://i.imgur.com/qcVGOvd.png "config.json image")
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
- To run in production mode run the following commands in this order, **npm run build** this will create the production version of the website(will take a few seconds), once that has finished run the command **npm run start** to run the production website. 
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Creating an admin account
- If there are no users in the database, create an account by going to the site's login page, then press the "Not a member? Register now!" button, the next created account will automatically set to admin, and will be activated.

# Adding S/FTP servers
- FTP accounts require read, write, and delete privileges. 
- To add FTP servers to node utstats 2, go to the admin area of the website, then "Importer Manager", then finally "Add Server", there is no limit in the amount of servers you can add.
- Target Folder must link to your UnrealTournament main folder(CASE SENSITIVE), e.g /Servers/UnrealTournament/ for an FTP user with entry point of C:/
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d3ed4c4a-39ed-4139-9228-aec5db17071f" />
- You can later edit settings if required.

# Running the importer
- Go to the folder you installed node utstats 2
- Open command prompt, type **node importer** to start the import process(you can put stat logs in the /Logs folder to skip the ftp download).
- Once completed you should see on your website new matches & players being displayed in their respected pages.


# Setting up ACE

- By default ACE doesn't save player information to log files, to get the most out of this module you will have to change a few lines in UnrealTournament.ini so ACE will save player information that will help admins ban trouble makers.
- Find the ACE section in UnrealTournament.ini [ACEvXXX_S.ACEActor].
- Now find the following lines and change them to the following
```
bExternalLog=true
bExternalLogJoins=true
JoinLogPath=../Logs/
JoinLogPrefix=ACE_JOIN
```

## Thanks to
- Many thanks to the original creators of the UTStats mutators **azazel, )°DoE°(-AnthraX and toa**
- Thanks to **Krull0r** for the Monster Icons.