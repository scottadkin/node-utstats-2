## Node UTStats 2

# Requirements
- Node.js 14.17 or greater.
- Mysql

# Install
- Extract the contents of the archive into a folder.
- Open command prompt in the folder.
- Run the command **npm install** to install all the dependencies.
- Once that has been completed run the command **node install** this will create the database and all the tables needed by node utstats 2.

# Starting the website
- You have two options of running the website, development mode(slow, but easier for debugging) or production mode.
- To run in development mode open command prompt in the installed folder and run the command **npm run dev**
- To run in production mode run the following commands in this order, **npm run buld** this will create the production version of the website(will take a few seconds), once that has finished run the command **npm run start** to run the production website. 
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Creating an admin account
- If there are no users in the database, create an account by going to the site's login page, then press the "Not a member? Register now!" button, the next created account will automatically set to admin, and will be activated.



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
- QueryServerHost 127.0.0.1(The ip you host node utstats on)
- QueryServerFilePath /api/iptocountry
- QueryServerPort 3000(The port node ustats site uses)

# Admin Tools
The site contains many tools to allow you to change what is displayed and what users can do.

## User account tools
- De/Activate user.
- Give user admin permissions, or just allow them to upload map images.
- Ban user accounts.
- View all(shows generic information about user accounts)

## Match tools
- On every match page there is a block at the bottom of the page that will allow you to delete the map, and or delete players from the match.
- Delete duplicate match imports, deletes all duplicate matches in one click.

## Player tools
- Rename player.
- Merge two players.
- Delete player.

## Gametype tools
- Rename gametype.
- Merge two gametypes.
- Delete gametype.


## Ranking tools
- Recalculate gametype rankings.
- Delete gametype rankings.
- Change ranking event values.

## Map image uploader
- On map pages admins and users with the correct permissions can upload a new image to be show in screenshots for that map.
- Bulk map image uploader, upload many at once file names must be manually set.
- Individual map image uploader, select the fi,le uploader next to the map name to upload an image that is automatically named.

## Face image uploader
- Bulk face image uploader, upload many at once, file names must be manually set.
- Individual face image uploader, select the file uploader next to the face name to upload an image that is automatically named.

## Home Settings
- Display Addicted Players
- Display Most Played Gametypes
- Display Most Played Maps
- Display Most Popular Countries
- Display Most Used Faces
- Display Recent Matches
- Display Recent Matches & Player Stats
- Display Recent Players
- Recent Matches Display Type
- Recent Matches To Display

## Individual Map Pages settings
- Display Addicted Players
- Display Control Points (Domination)
- Display Games Played
- Display Longest Matches
- Display Map Objectives (Assault)
- Display Recent Matches
- Display Spawn Points
- Display Summary
- Max Addicted Players
- Max Longest Matches
- Recent Matches Per Page

## Map seach page settings
- Default Display Per Page
- Default Display Type

## Match pages settings
- Display Assault Summary
- Display Capture The Flag Caps
- Display Capture The Flag Graphs
- Display Capture The Flag Summary
- Display Domination Graphs
- Display Domination Summary
- Display Frag Summary
- Display Frags Graphs
- Display Kills Match Up
- Display Match Report Title
- Display Pickup Summary
- Display Player Ping Graph
- Display Players Connected to Server Graph
- Display Powerup Control
- Display Rankings
- Display Screenshot
- Display Server Settings
- Display Special Events
- Display Summary
- Display Team Changes
- Display Weapon Statistics

## Match search page settings
- Default Display Per Page
- Default Display Type
- Default Gametype

## Navigation settings
- Display Admin
- Display Home
- Display Login/Logout
- Display Maps
- Display Matches
- Display Players
- Display Rankings
- Display Records

## Player profile page settings
- Default Recent Matches Display
- Default Weapon Display
- Display Assault & Domination
- Display Capture The Flag Summary
- Display Frag Summary
- Display Gametype Stats
- Display Pickup History
- Display Ping History Graph
- Display Rankings
- Display Recent Activity Graph
- Display Recent Matches
- Display Special Events
- Display Summary
- Display Weapon Stats
- Recent Matches Per Page

## Player search page settings
- Default Display Per Page
- Default Display Type
- Default Order
- Default Sort Type

## Ranking page settings
- Rankings Per Gametype (Main)
- Rankings Per Page (Individual)

## Records page settings
- Default Per Page
- Default Record Type