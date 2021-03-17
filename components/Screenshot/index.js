import styles from './Screenshot.module.css'
import {useEffect, useRef} from "react";

//fix screenshot not loading on page back

class MatchScreenshot{

    constructor(canvas, download, downloadJPG, downloadBMP, image, map, players, teams, matchData, serverName, gametype, faces){

   
        console.log(`new match screenshot`);
        
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.download = download;
        this.downloadJPG = downloadJPG;
        this.downloadBMP = downloadBMP;

        this.map = map;
        this.players = JSON.parse(players);
        console.log(this.players);
        this.teams = parseInt(teams);

        this.matchData = JSON.parse(matchData);
        this.serverName = serverName;
        this.gametype = gametype;
        this.faces = JSON.parse(faces);

        console.log(this.matchData);

        this.players.sort((a,b) =>{

            a = a.score;
            b = b.score;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }
            return 0;
        });

        this.image = new Image();
        this.image.src = image;

        this.colors = {
            "red": "rgb(226,0,0)",
            "blue": "rgb(62,144,194)",
            "green": "rgb(0,181,0)",
            "yellow": "rgb(255,255,0)",
            "greenFooter": "rgb(0,255,0)",
            "dmName": "rgb(45,174,241)",
            "dmScore": "rgb(181,255,255)"
        };

        this.teamPlayerCount = [0,0,0,0];

        //this.scaleImage();

        this.flags = {};
        this.flagWidth = this.x(1.4);
        this.flagHeight = this.y(1.3);

        this.createFullscreenEvents();

        this.image.onload = async () =>{
         //   console.log(`image loaded`);
            await this.loadPlayerFlags();
            await this.loadPlayerIcons();
            await this.loadIcons();
            this.render();
            this.setupDownload();
        }   
    }


    createFullscreenEvents(){

        this.canvas.addEventListener("click", () =>{

            this.canvas.requestFullscreen();
        });
    }

    setupDownload(){

        const imagePNG = this.canvas.toDataURL("image/png");
        const imageJPG = this.canvas.toDataURL("image/jpeg");
        const imageBMP = this.canvas.toDataURL("image/bmp");
        //console.log(image);

        const map = this.map.replace(/\W/i,'');
        const gametype = this.gametype.replace(/\W/i,'');
        const date = this.matchData.date;

        const fileName = `sshot${map}-${gametype}-${date}.`;

        this.download.href = imagePNG;
        this.download.download = `${fileName}png`;
        this.downloadJPG.href = imageJPG;
        this.downloadJPG.download = `${fileName}jpeg`;
        this.downloadBMP.href = imageBMP;
        this.downloadBMP.download = `${fileName}bmp`;
    }

    getPlayerIconName(id){


        if(this.faces[id] !== undefined){
            
            if(this.faces[id] !== null){
                if(this.faces[id].imageExists){
                    return this.faces[id].name;
                }     
            }
        }

        return 'faceless';
    }

    loadPlayerIcons(){

        return new Promise((resolve, reject) =>{

            const uniqueIcons = [];

            this.playerIcons = {};

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                if(uniqueIcons.indexOf(p.face) === -1){
                    uniqueIcons.push(p.face);
                }
            }

            this.playerIconsToLoad = uniqueIcons.length;
            this.playerIconsLoaded = 0;

            for(let i = 0; i < uniqueIcons.length; i++){

                this.playerIcons[uniqueIcons[i]] = new Image();
                this.playerIcons[uniqueIcons[i]].src = `/images/faces/${this.getPlayerIconName(uniqueIcons[i])}.png`;

                this.playerIcons[uniqueIcons[i]].onload = () =>{

                    this.playerIconsLoaded++;

                    if(this.playerIconsLoaded >= this.playerIconsToLoad){
                        resolve();
                    }
                }
            }

            console.log(this.playerIcons);

        });     

    }

    loadPlayerFlags(){

        return new Promise((resolve, reject) =>{

            let p = 0;

            let uniqueFlags = ["XX"];

            this.loadedFlags = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                if(uniqueFlags.indexOf(p.country.toUpperCase()) === -1){
                    uniqueFlags.push(p.country.toUpperCase());
                }
            }

            this.flagsToLoad = uniqueFlags.length;

            for(let i = 0; i < this.flagsToLoad; i++){

                this.flags[uniqueFlags[i]] = new Image();
                this.flags[uniqueFlags[i]].src = `/images/flags/${uniqueFlags[i].toLowerCase()}.svg`;

                this.flags[uniqueFlags[i]].onload = () =>{
                    this.loadedFlags++;
                    if(this.loadedFlags >= this.flagsToLoad){
                        //console.log(`Loaded flag ${this.loadedFlags} out of ${this.flagsToLoad}`);
                        //this.loadIcons();
                        resolve();
                    }
                }
            }

        });
        
    }

    loadIcons(){

        return new Promise((resolve, reject) =>{

            const files = ["red", "blue", "green", "yellow", "smartctfbg"];

            this.iconsToLoad = files.length;
            this.iconsLoaded = 0;

            this.icons = {};

            for(let i = 0; i < files.length; i++){

                this.icons[files[i]] = new Image();
                this.icons[files[i]].src = `/images/${files[i]}.png`;
                this.icons[files[i]].onload = () =>{

                    this.iconsLoaded++;

                    if(this.iconsLoaded >= this.iconsToLoad){
        
                        resolve();
                    }
                }
            }
        });    
    }

    x(input){
        return (this.canvas.width * 0.01) * input;
    }

    y(input){
        return (this.canvas.height * 0.01) * input
    }

    MMSS(input){

        let seconds = Math.floor(input % 60);
        let minutes = Math.floor(input / 60);

        if(seconds < 10){
            seconds = `0${seconds}`;
        }

        if(minutes < 10){
            minutes = `0${minutes}`;
        }

        return `${minutes}:${seconds}`;
    }

    bLMS(){

        const reg = /last man standing/i;
        return reg.test(this.gametype);
    }

    bCTF(){
        const reg = /capture the flag/i;
        const reg2 = /ctf/i;

         if(reg.test(this.gametype) || reg2.test(this.gametype)){
             return true;
         }

         return false;
    }

    getDate(){

        let date = this.matchData.date * 1000;

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novemeber", "December"];

        const now = new Date(date);

        const day = now.getDate();
        const dayIndex = now.getDay();
        const monthIndex = now.getMonth();
        const year = now.getFullYear();

        let hours = now.getHours();
        let minutes = now.getMinutes();

        if(minutes < 10){
            minutes = `0${minutes}`;
        }


        return `Played ${days[dayIndex]} ${day} ${months[monthIndex]} ${year} ${hours}:${minutes}`;
    }

    getFlag(code){

        code = code.toUpperCase();

        for(const [key, value] of Object.entries(this.flags)){
      
            if(key === code){
                return value;
            }
        }

        return this.getFlag("XX");
    }

    getTeamColor(team){

        switch(team){
            case 0: {   return this.colors.red; }
            case 1: {   return this.colors.blue; } 
            case 2: {   return this.colors.green; } 
            case 3: {   return this.colors.yellow; }
            default: {  return "white; "} 
        }
    }

    renderStandardTeamGamePlayer(c, team, name, score, time, ping, country, bFinal){

        c.textAlign = "left";

        const scoreOffset = this.x(30);
        const rowHeight = this.y(3.2);
        const index = this.teamPlayerCount[team];
        const scoreFontSize = this.y(2.5);
        const teamHeaderFontSize = this.y(2.9);
        const pingSize = this.y(0.8);
        
        let maxPlayersPerTeam = 0;
        
        if(this.teams < 3){
            maxPlayersPerTeam = 18;
        }else{
            maxPlayersPerTeam = 9;
        }

        let startY = 0;
        let startX = 0;
        
        switch(team){
            case 0: {   startY = 20; startX = 10;} break;
            case 1: {   startY = 20; startX = 55;} break;
            case 2: {   startY = 60; startX = 10;} break;
            case 3: {   startY = 60; startX = 55;} break;
        }

        const x = this.x(startX);
        const y = this.y(startY) + (rowHeight * index);

        c.fillStyle = this.getTeamColor(team);

        if(bFinal !== undefined){

            if(index <= maxPlayersPerTeam){
                return;    
            }

            c.fillStyle = "white";

            c.font = this.y(1.8)+"px Arial";
            c.fillText(`${index - maxPlayersPerTeam} Player[s] not shown`,x , this.y(startY) + (rowHeight * maxPlayersPerTeam));
            return;
        }

        if(index >= maxPlayersPerTeam){
            this.teamPlayerCount[team]++;
            return;
        }

        //draw team headers
        if(index === 0){

            let teamTitle = "";

            switch(team){
                case 0: {  teamTitle = `Red Team`; } break;
                case 1: {  teamTitle = `Blue Team`; } break;
                case 2: {  teamTitle = `Green Team`; } break;
                case 3: {  teamTitle = `Yellow Team`; } break;
            }

            c.font = teamHeaderFontSize+"px Arial";
            c.fillText(teamTitle, x, y - this.y(3.5));
            c.fillText(this.matchData[`team_score_${team}`], x + scoreOffset, y - this.y(3.5));

        }

        c.drawImage(this.getFlag(country), x - this.flagWidth - this.x(0.25) , y, this.flagWidth, this.flagHeight);
        c.fillStyle = "white";
        c.font = pingSize+"px Arial";
        c.fillText(`TIME: ${Math.floor(time / 60)}`, x - this.x(4), y);
        c.fillText(`PING: ${ping}`, x - this.x(4), y + pingSize + this.y(0.2));


        c.fillStyle = this.getTeamColor(team);

        c.font = scoreFontSize+"px Arial";
        c.fillText(name, x, y);
        c.fillText(score,x + scoreOffset, y);

        this.teamPlayerCount[team]++;

    }

    getTeamWinner(){

        let d = this.matchData;

        const scores = [
            {"name": "Red Team", "score": d.team_score_0},
            {"name": "Blue Team", "score": d.team_score_1},
            {"name": "Green Team", "score": d.team_score_2},
            {"name": "Yellow Team", "score": d.team_score_3}
        ];

        scores.sort((a, b) =>{

            a = a.score;
            b = b.score;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }

            return 0;
        });

        return `${scores[0].name} Wins the match!`
    }

    getSoloWinner(){

        return `${this.matchData.dm_winner} Wins the match!`
    }


    renderHeader(c){

        const headerFontSize = this.y(2.2);
        c.font = headerFontSize+"px Arial";

        c.textAlign = "center";

        let offsetY = this.y(0.75)
        
        c.fillStyle = "white";
        c.fillText(this.gametype, this.x(50), offsetY);

        if(this.matchData.time_limit > 0){
            offsetY += this.y(2.9);
            c.fillText(`Time Limit: ${this.matchData.time_limit}`, this.x(50), offsetY);
        }
       
        if(this.matchData.target_score > 0){
            offsetY += this.y(2.6);
            c.fillText(`${(this.bLMS()) ? "Lives" : "Target Score"}: ${this.matchData.target_score}`, this.x(50), offsetY);
        }

        offsetY += this.y(2.9);

        c.fillStyle = "yellow";
        c.fillText((this.matchData.team_game) ? this.getTeamWinner() : this.getSoloWinner(), this.x(50), offsetY);

        c.textAlign = "left";
    }

    renderFooter(c){

        const footerFontSize = this.y(1.15);
        c.textAlign = "center";
        c.font = footerFontSize+"px Arial";
        c.fillStyle = this.colors.greenFooter;
        c.fillText("The match has ended.", this.x(50), this.y(92));
        c.fillStyle = "white";

        c.fillText(`Playing ${this.gametype} on ${this.map}`, this.x(50), this.y(95));
        c.fillText(`${this.getDate()} Elapsed Time: ${this.MMSS(this.matchData.playtime)}`, this.x(50), this.y(96.75));
        c.fillText(`Server: ${this.serverName}`, this.x(50), this.y(98.50));

        c.textAlign = "left";
    }

    renderStandardTeamGame(c){

        this.renderHeader(c);

        c.textAlign = "left";

        let p = 0;

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];
            //console.log(p);
            this.renderStandardTeamGamePlayer(c, p.team, p.name, p.score, p.playtime, Math.floor(p.ping_average), p.country);
        }

        for(let i = 0; i < this.teams; i++){
            this.renderStandardTeamGamePlayer(c,i,'','','','','',true);
        }

        this.renderFooter(c);
    }


    renderStandardPlayer(c, index, name, score, deaths, ping, time, country){

        const row1X = this.x(25);
        const row2X = this.x(60) + c.measureText((this.bLMS() ? "Lives" : "Frags" )).width;
        const row3X = this.x(75) + c.measureText("Deaths").width;;

        const defaultSize = this.y(2);
        const pingSize = this.y(0.8);

        const rowHeight = this.y(2.2);

        const y = this.y(20) + (rowHeight * index);

        c.textAlign = "left";

        c.fillStyle = "white";
        c.font = pingSize+"px Arial";

        c.fillText(`TIME: ${(Math.floor(time / 60))}`, row1X - this.x(2) - this.flagWidth, y);
        c.fillText(`PING: ${ping}`, row1X - this.x(2) - this.flagWidth, y + this.y(0.9));

        c.drawImage(this.getFlag(country), row1X - this.x(2), y, this.flagWidth, this.flagHeight);

        c.font = defaultSize+"px Arial";
        c.fillStyle = this.colors.dmName;
        c.fillText(name, row1X, y);

        c.textAlign = "right";
        c.fillStyle = this.colors.dmScore;
        c.fillText(score, row2X, y);
        c.fillText(deaths, row3X, y);

    }
    
    renderStandard(c){

        this.renderHeader(c);

        const row1X = this.x(25);
        const row2X = this.x(60);
        const row3X = this.x(75);

        const titleY = this.y(16);

        c.fillStyle = "white";

        c.font = this.y(2)+"px Arial";

        c.fillText("Player", row1X, titleY);
        c.fillText((this.bLMS()) ? "Lives" : "Frags", row2X, titleY);
        c.fillText("Deaths", row3X, titleY);

        let p = 0;

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];
            c.font = this.y(2)+"px Arial";
            this.renderStandardPlayer(c, i, p.name, p.score, p.deaths, p.ping_average, p.playtime, p.country);
        }

        this.renderFooter(c);
    }



    renderSmartCTFBar(c, x, y, type, value){

        const max = this.maxCTF[type];
        const total = this.totalCTF[type];
        const maxWidth = this.x(13);

        let bit = 0;
        if(max > 0){
            bit = maxWidth / max;
        }


        const color = Math.floor((255 / total) * value);

        c.fillStyle = `rgb(${255 - color},255,${255 - color})`;

        c.fillRect(x + this.x(0.5),y + this.y(0.1),bit * value,5);

        c.fillStyle = "white";
    }


    renderSmartCTFPlayer(c, team, x, y, width, height, player){

        //const height = this.y(6);
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fillRect(x, y, width, height);

        c.fillStyle = this.getTeamColor(team);

        const pingSize = this.y(1);
        const nameSize = this.y(2);
        const nameOffset = this.x(5);
        const scoreOffset = this.x(39);

        c.font = nameSize+"px Arial";
        c.textAlign = "left";
        c.fillText(player.name, x + nameOffset, y + this.y(0.75));
        c.textAlign = "right";
        c.fillText(`${player.kills} / ${player.score}`, x + scoreOffset, y + this.y(0.75));

        c.textAlign = "left";

        const timeOffset = c.measureText(player.name).width + 5;

        c.font = pingSize+"px Arial";
        c.fillStyle = "rgb(150,150,150)";
        c.fillText(`TM:${Math.floor(player.playtime / 60)} EFF:${Math.floor(player.efficiency)}%`, x + nameOffset + timeOffset, y + this.y(1.5));

        c.fillStyle = "black";
        c.strokeStyle = "rgb(100,100,100)";
        c.lineWidth = this.y(0.1);
        c.fillRect(x + this.y(1.25), y, this.x(2.5), this.x(2.5));
        c.drawImage(this.playerIcons[player.face], x + this.y(1.25), y, this.x(2.5), this.x(2.5));
        c.strokeRect(x + this.y(1.25), y, this.x(2.5), this.x(2.5));

        c.fillStyle = "white";

        const pingOffsetX = this.x(0.7);
        const pingOffsetY = this.y(5);
        c.font = pingSize+"px Arial";

        c.drawImage(this.getFlag(player.country), x + pingOffsetX + this.x(0.5), y + pingOffsetY, this.flagWidth, this.flagHeight);

        c.fillText(`PING:${player.ping_average}`, x + pingOffsetX , y + pingOffsetY + this.flagHeight + this.y(0.5));
        //c.fillText("PL:0%", x + pingOffsetX, y + pingOffsetY + this.y(1.3) + this.flagHeight + this.y(0.5));

        const row1Offset = this.y(3.2);
        const row2Offset = this.y(4.8);
        const row3Offset = this.y(6.4);
        const valueOffset = this.x(3);
        const col1Offset = this.x(5);
        const col2Offset = this.x(22.5);

        c.fillText(`Caps:`, x + col1Offset, y + row1Offset);
        c.fillText(`Grabs:`, x + col1Offset, y + row2Offset);
        c.fillText(`Assists:`, x + col1Offset, y + row3Offset);

        c.textAlign = "right";

        c.fillText(player.flag_capture, x + valueOffset + col1Offset, y + row1Offset);
        this.renderSmartCTFBar(c, x + valueOffset + col1Offset, y + row1Offset, "caps", player.flag_capture);
        c.fillText(player.flag_taken, x + valueOffset + col1Offset, y + row2Offset);
        this.renderSmartCTFBar(c, x + valueOffset + col1Offset, y + row2Offset, "grabs", player.flag_taken);
        c.fillText(player.flag_assist, x + valueOffset + col1Offset, y + row3Offset);
        this.renderSmartCTFBar(c, x + valueOffset + col1Offset, y + row3Offset, "assists", player.flag_assist);


        c.textAlign = "left";

        c.fillText(`Covers:`, x + col2Offset, y + row1Offset);
        c.fillText(`Deaths:`, x + col2Offset, y + row2Offset);
        c.fillText(`FlagKills:`, x + col2Offset, y + row3Offset);

        c.textAlign = "right";

        c.fillText(player.flag_cover, x + valueOffset + col2Offset, y + row1Offset);
        this.renderSmartCTFBar(c, x + valueOffset + col2Offset, y + row1Offset, "covers", player.flag_cover);
        c.fillText(player.deaths, x + valueOffset + col2Offset, y + row2Offset);
        this.renderSmartCTFBar(c, x + valueOffset + col2Offset, y + row2Offset, "deaths", player.deaths);
        c.fillText(player.flag_kill, x + valueOffset + col2Offset, y + row3Offset);
        this.renderSmartCTFBar(c, x + valueOffset + col2Offset, y + row3Offset, "flagKills", player.flag_kill);

        c.textAlign = "left";
    }


    getTeamPingAverage(team){

        let totalPlayers = 0;
        let totalPing = 0;

        let p = 0;

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];

            if(p.team === team){
                totalPlayers++;
                totalPing += p.ping_average;
            }
        }

        if(totalPlayers === 0) return 0;
        if(totalPing === 0) return 0;

        return Math.floor(totalPing / totalPlayers);
    }

    renderSmartCTFTeam(c, team){

        const teamWidth = this.x(40);

        const headerHeight = this.y(5);

        let startX = 0;
        let startY = 0;

        let color = 0;
        let image = 0;

        const iconWidth = this.y(4.5);
        const iconHeight = this.y(4.5);
        const headerFont = this.y(4);

        switch(team){

            case 0: {
                startX = this.x(5);
                startY = this.y(12);    
                color = "rgba(200,0,0,0.3)";
                image = this.icons.red;
            }

            break;
            case 1: {   
                startX = this.x(55);    
                startY = this.y(12);    
                color = "rgba(0,0,200,0.3)";
                image = this.icons.blue;
            } 
            break;
            case 2: {   
                startX = this.x(5);    
                startY = this.y(52);    
                color = "rgba(0,200,0,0.3)";
                image = this.icons.green;
            } break;
            case 3: {   
                startX = this.x(55);    
                startY = this.y(52);    
                color = "rgba(200,200,0,0.3)";
                image = this.icons.yellow;
            } break;
        }

        c.fillStyle = color;

        c.drawImage(this.icons.smartctfbg, startX, startY, teamWidth, headerHeight);
        c.fillRect(startX, startY, teamWidth, headerHeight);
        c.drawImage(image, startX + this.y(0.25), startY + this.y(0.25), iconWidth, iconHeight);

        c.fillStyle = this.getTeamColor(team);
        c.font = headerFont+"px Arial";
        c.fillText(this.matchData[`team_score_${team}`], startX + this.x(3), startY + this.y(0.6));
        const pingOffsetX = c.measureText(`${this.matchData[`team_score_${team}`]}_`).width;
        c.font = `bold ${this.y(2.1)}px Arial`;
        c.fillText("Frags / PTS", startX + this.x(32.5), startY + this.y(1));

        c.fillStyle = "rgb(150,150,150)";

        c.font = `${this.y(1)}px Arial`;

        c.fillText(`PING: ${this.getTeamPingAverage(team)} PL:0%`, startX + this.x(3) + pingOffsetX, startY + this.y(1.5));
        c.fillText(`TM: ${Math.ceil((this.matchData.end - this.matchData.start) / 60)}`, startX + this.x(3) + pingOffsetX, startY + this.y(2.5));

        const playerHeight = this.y(8);

        let totalPlayers = 0;

        let maxPlayers = 8;

        if(this.teams > 2){
            maxPlayers = 4;
        }

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].team === team){

                if(totalPlayers < maxPlayers){
                    this.renderSmartCTFPlayer(c, team, startX, headerHeight + startY + (playerHeight * totalPlayers), teamWidth, playerHeight, this.players[i]);
                }
                totalPlayers++;
            }
        }

        if(totalPlayers - maxPlayers > 0){
            c.font = this.y(1.25)+"px Arial";
            c.fillStyle = this.getTeamColor(team);
            c.fillText(`${totalPlayers - maxPlayers} Player[s] not shown.`, startX, startY + headerHeight + (playerHeight * maxPlayers) + this.y(0.5));
        }
        

    }

    setMaxCTFValues(){

        let p = 0;

        this.maxCTF = {
            "grabs": 0,
            "caps": 0,
            "assists": 0,
            "covers": 0,
            "deaths": 0,
            "flagKills": 0
        };

        this.totalCTF = {
            "grabs": 0,
            "caps": 0,
            "assists": 0,
            "covers": 0,
            "deaths": 0,
            "flagKills": 0
        };

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];

            if(p.flag_taken > this.maxCTF.grabs){
                this.maxCTF.grabs = p.flag_taken;
            }

            if(p.flag_capture > this.maxCTF.caps){
                this.maxCTF.caps = p.flag_capture;
            }

            if(p.flag_assist > this.maxCTF.assists){
                this.maxCTF.assists = p.flag_assist;
            }

            if(p.flag_covers > this.maxCTF.covers){
                this.maxCTF.covers = p.flag_covers;
            }

            if(p.deaths > this.maxCTF.deaths){
                this.maxCTF.deaths = p.deaths;
            }

            if(p.flag_kill > this.maxCTF.flagKills){
                this.maxCTF.flagKills = p.flag_kill;
            }

            this.totalCTF.grabs += p.flag_taken;
            this.totalCTF.caps += p.flag_capture;
            this.totalCTF.assists += p.flag_assist;
            this.totalCTF.covers += p.flag_cover;
            this.totalCTF.deaths += p.deaths;
            this.totalCTF.flagKills += p.flag_kill;
        }
    }

    renderSmartCTFFooter(c){

        c.font = this.y(1.3)+"px Arial";

        c.textAlign = "center";
        c.fillStyle = "white";

        c.fillText("There is currently no one spectating this match.", this.x(50), this.y(91));
        c.fillStyle = "yellow";
        c.fillText("[SmartCTF 4E {PiN}Kev | {DnF2}SiNiSTeR | [es]Rush | adminthis & The_Cowboy & Sp0ngeb0b]", this.x(50), this.y(94));
        c.fillStyle = "white";
        c.fillText(`${this.getDate()} | Elapsed Time: ${this.MMSS(this.matchData.playtime)}`, this.x(50), this.y(96));
        c.fillText(`Playing ${this.map} on ${this.serverName}`, this.x(50), this.y(98));

        c.textAlign = "left";
    }

    renderSmartCTF(c){

        this.renderHeader(c);

        this.setMaxCTFValues();

        for(let i = 0; i < this.teams; i++){

            this.renderSmartCTFTeam(c, i);
        }

        this.renderSmartCTFFooter(c);
    }

    render(){

        const c = this.context;

        c.textBaseline = "top";

        c.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        c.fillStyle = "rgba(0,0,0,0.45)";
        c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if(this.matchData.team_game){
            if(!this.bCTF()){
                this.renderStandardTeamGame(c);
            }else{
                this.renderSmartCTF(c);
            }
        }else{
            this.renderStandard(c);
        }
    }

}



const Screenshot = ({map, totalTeams, players, image, matchData, serverName, gametype, faces}) =>{

    const sshot = useRef(null);
    const sshotDownload = useRef(null);
    const sshotDownload2 = useRef(null);
    const sshotDownload3 = useRef(null);

    useEffect(() =>{
        new MatchScreenshot(sshot.current, sshotDownload.current, sshotDownload2.current, sshotDownload3.current, image, map, players,totalTeams, matchData, serverName, gametype, faces);
    });


    return (<div className={`${styles.wrapper} center`}>
        <div className="default-header">
            Match Screenshot
        </div>
        <div className={`${styles.content} center`}>
            <canvas ref={sshot} id="m-sshot" className="match-screenshot center m-bottom-25" 
                data-match-data={matchData} 
                data-map={map} 
                data-image={image}
                data-teams={totalTeams} 
                data-players={players} 
                width="1920" height="1080">
            </canvas>
            <div id={styles.downloads} className="m-bottom-25">
                <a id="sshot-download" href="#" ref={sshotDownload} download="testests.png">Download as PNG</a>
                <a id="sshot-download2" href="#" ref={sshotDownload2} download="testests.jpg">Download as JPG</a>
                <a id="sshot-download3" href="#" ref={sshotDownload3} download="testests.bmp">Download as BMP</a>
            </div>
        </div>
    </div>);
}

export default Screenshot;