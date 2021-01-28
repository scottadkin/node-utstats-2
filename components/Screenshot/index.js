import styles from './Screenshot.module.css'
import {useEffect, useRef} from "react";

//fix screenshot not loading on page back

class MatchScreenshot{

    constructor(canvas, image, map, players, teams, matchData, serverName, gametype){

        console.log(`new match screenshot`);
        
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        this.map = map;
        this.players = JSON.parse(players);
        this.teams = parseInt(teams);

        this.matchData = JSON.parse(matchData);
        this.serverName = serverName;
        this.gametype = gametype;

        console.log(this.matchData);

        this.image = new Image();
        this.image.src = image;

        this.colors = {
            "red": "rgb(226,0,0)",
            "blue": "rgb(62,144,194)",
            "green": "rgb(0,181,0)",
            "yellow": "rgb(255,255,0)",
            "greenFooter": "rgb(0,255,0)"
        };

        this.teamPlayerCount = [0,0,0,0];

        //this.scaleImage();

        this.image.onload = () =>{
         //   console.log(`image loaded`);
            this.render();
        }   


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

    getTeamColor(team){

        switch(team){
            case 0: {   return this.colors.red; }
            case 1: {   return this.colors.blue; } 
            case 2: {   return this.colors.green; } 
            case 3: {   return this.colors.yellow; }
            default: {  return "white; "} 
        }
    }

    renderStandardTeamGamePlayer(c, team, name, score, bFinal){


        c.textAlign = "left";

        const scoreOffset = this.x(30);
        const rowHeight = this.y(3.2);
        const index = this.teamPlayerCount[team];
        const scoreFontSize = this.y(2.5);
        const teamHeaderFontSize = this.y(2.9);
        
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


        c.font = scoreFontSize+"px Arial";
        c.fillText(name, x, y);
        c.fillText(score,x + scoreOffset, y);

        this.teamPlayerCount[team]++;

    }

    renderStandardTeamGame(c){

        let p = 0;

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];
            //console.log(p);
            this.renderStandardTeamGamePlayer(c, p.team, p.name, p.score);
        }

        for(let i = 0; i < this.teams; i++){
            this.renderStandardTeamGamePlayer(c,i,'','',true);
        }

        const footerFontSize = this.y(1.15);
        c.textAlign = "center";
        c.font = footerFontSize+"px Arial";
        c.fillStyle = this.colors.greenFooter;
        c.fillText("The match has ended.", this.x(50), this.y(92));
        c.fillStyle = "white";

        c.fillText(`Playing ${this.gametype} on ${this.map}`, this.x(50), this.y(95));
        c.fillText(`${this.getDate()} Elapsed Time: ${this.MMSS(this.matchData.playtime)}`, this.x(50), this.y(96.75));
        c.fillText(`Server: ${this.serverName}`, this.x(50), this.y(98.50));
    }

    render(){

        const c = this.context;

        c.textBaseline = "top";

        console.log("render");

        c.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        c.fillStyle = "rgba(0,0,0,0.45)";
        c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        

        this.renderStandardTeamGame(c);
    }

}



const Screenshot = ({map, totalTeams, players, image, matchData, serverName, gametype}) =>{

    const test = useRef(null);

    useEffect(() =>{
        new MatchScreenshot(test.current, image, map, players,totalTeams, matchData, serverName, gametype);
    });


    return (<div className={`${styles.wrapper} center`}>
        <div className="default-header">
            Match Screenshot
        </div>
        <div className={`${styles.content} center`}>
            <canvas ref={test} id="m-sshot" className="match-screenshot center" 
                data-match-data={matchData} 
                data-map={map} 
                data-image={image}
                data-teams={totalTeams} 
                data-players={players} 
                width="1920" height="1080">
            </canvas>
                </div>
    </div>);
}

export default Screenshot;