import SiteSettings from "../api/sitesettings";
import Session from "../api/session";
import React from "react";
import Analytics from "../api/analytics";
import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Players from '../api/players';
import PlayersDropDown from "../components/PlayersDropDown";
import styles from '../styles/TeamMates.module.css';
import MatchesTableView from "../components/MatchesTableView";
import Functions from "../api/functions";
import CountryFlag from '../components/CountryFlag';
import Link from 'next/link';
import Gametypes from '../api/gametypes';

class TeamMates extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "selectedPlayers": [5981, 6039], 
            "selectedAliases": [[],[]], 
            "loadingInProgress": false, 
            "data": [], 
            "bLoadedData": false, 
            "minimumMatches": 5,
            "players": JSON.parse(this.props.players),
            "generalMode": 0,
            "winrateMode": 0,
            "ctfMode": 0,
            "ctfSubMode": 0,
            "gametypes": {},
            "maps": {}
        };

        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.changeSelected = this.changeSelected.bind(this);

        this.loadData = this.loadData.bind(this);

        this.addAlias = this.addAlias.bind(this);
        this.deleteAlias = this.deleteAlias.bind(this);
        this.changeMinMatches = this.changeMinMatches.bind(this);
        this.changeGeneralMode = this.changeGeneralMode.bind(this);
        this.changeWinrateMode = this.changeWinrateMode.bind(this);
        this.changeCTFMode = this.changeCTFMode.bind(this);
        this.changeCTFSubMode = this.changeCTFSubMode.bind(this);

    }
    
    changeCTFMode(id){
        this.setState({"ctfMode": id});
    }

    changeCTFSubMode(id){
        this.setState({"ctfSubMode": id});
    }

    changeWinrateMode(id){

        this.setState({"winrateMode": id});
    }

    changeGeneralMode(id){

        this.setState({"generalMode": id});
    }

    getGametype(id){

        id = parseInt(id);

        for(const [key, value] of Object.entries(this.state.data.gametypes)){

            if(parseInt(key) === id){
                return value;
            }
        }

        return "Not Found";
    }

    getMap(id){

        id = parseInt(id);

        for(const [key, value] of Object.entries(this.state.data.maps)){

            if(parseInt(key) === id){
                return value;
            }
        }

        return "Not Found";
    }

    getPlayer(id){

        for(let i = 0; i < this.state.players.length; i++){

            const p = this.state.players[i];

            if(p.id === id) return p;
        }

        return {"id": -1, "name": "Not Found", "country": "xx"};
    }

    changeMinMatches(e){

        this.setState({"minimumMatches": parseInt(e.target.value)});
    }

    deleteAlias(playerIndex, aliasId){

        if(playerIndex !== -1){

            if(this.state.selectedAliases[playerIndex] !== undefined){

                const newList = [];

                for(let i = 0; i < this.state.selectedAliases[playerIndex].length; i++){

                    const a = this.state.selectedAliases[playerIndex][i];

                    if(a !== aliasId) newList.push(a);
                }


                const newData = [];

                for(let i = 0; i < this.state.selectedAliases.length; i++){

                    const a = this.state.selectedAliases[i];

                    if(i !== playerIndex){
                        newData.push(a);
                    }else{

                        newData.push(newList);
                    }
                }

                this.setState({"selectedAliases": newData});

            }else{
                console.trace(`this.state.selectedAliases[playerIndex] is undefined`);
            }

        }else{
            console.log(`PlayerIndex is not valid`);
        }
    }

    addAlias(playerIndex, aliasId){

        if(playerIndex !== -1){

            if(aliasId === this.state.selectedPlayers[playerIndex]){
                console.log(`Player can not be an alias.`);
                return;
            }

            const aliasesList = this.state.selectedAliases[playerIndex];

            if(aliasesList !== undefined){

                const newList = [...this.state.selectedAliases[playerIndex]];

                if(newList.indexOf(aliasId) === -1){

                    newList.push(aliasId);

                    const newData = [];

                    for(let i = 0; i < this.state.selectedAliases.length; i++){

                        const a = this.state.selectedAliases[i];

                        if(i !== playerIndex){
                            newData.push(a);
                        }else{
                            newData.push(newList);
                        }
                    }

                    this.setState({"selectedAliases": newData});

                    
                }else{
                    console.log(`Already in alias list`);
                }

            }else{
                console.trace(`AliasList is undefined`);
            }

        }else{
            console.trace(`PlayerId is not in selected players.`);
        }
    }

    async loadData(e){

        try{

            e.preventDefault();

            const playerIds = [];

            for(let i = 0; i < this.state.selectedPlayers.length; i++){

                const p = this.state.selectedPlayers[i];
                playerIds.push(p);
            }

            const playerAliases = [];

            for(let i = 0; i < this.state.selectedAliases.length; i++){

                const a = this.state.selectedAliases[i];
                playerAliases.push(a);
            }


            const req = await fetch("/api/teammates", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"players": playerIds, "aliases": playerAliases})
            });

            const res = await req.json();

            console.log(res);

            this.setState({
                "data": 
                {
                    "matches": res.matches, 
                    "servers": res.servers,
                    "gametypes": res.gametypes,
                    "maps": res.mapNames,
                    "totals": res.totals
                }
            });


        }catch(err){
            console.trace(err);
        }
    }

    changeSelected(index, e){

        const newValue = parseInt(e.target.value);

        const newData = [];

        for(let i = 0; i < this.state.selectedPlayers.length; i++){

            const s = this.state.selectedPlayers[i];

            if(i !== index){
                newData.push(s);
            }else{
                newData.push(newValue);
            }
        }

        this.setState({"selectedPlayers": newData});
    }

    deletePlayer(index){

        const newPlayers = [];

        for(let i = 0; i < this.state.selectedPlayers.length; i++){

            if(i !== index) newPlayers.push(this.state.selectedPlayers[i])
        }

        const newAliases = [];

        for(let i = 0; i < this.state.selectedAliases.length; i++){

            if(i !== index) newAliases.push(this.state.selectedAliases[i]);
        }


        this.setState({"selectedPlayers": newPlayers, "selectedAliases": newAliases});
    }

    addPlayer(){

        const previous = Object.assign(this.state.selectedPlayers);
        const previousAliases = [...this.state.selectedAliases];

        previous.push(-1);
        previousAliases.push([]);

        this.setState({"selectedPlayers": previous, "selectedAliases": previousAliases});
    }


    renderDropDowns(players){

        const elems = [];

        for(let i = 0; i < this.state.selectedPlayers.length; i++){

            const s = this.state.selectedPlayers[i];

            elems.push(<PlayersDropDown delete={this.deletePlayer} key={i} selected={s} players={players} id={i}
                changeSelected={this.changeSelected} addAlias={this.addAlias} aliases={this.state.selectedAliases[i]}
                deleteAlias={this.deleteAlias}
            />);
        }

        return elems;
    }

    renderMatches(){

        if(this.state.data.matches === undefined) return null;

        return <div>
            <div className="default-header">Recent Matches</div>
            <MatchesTableView data={JSON.stringify(this.state.data.matches)}/>
        </div>
    }

    getTeamResult(myTeamScore, red, blue, green, yellow){


        const scores = [red, blue, green, yellow];
        
        scores.sort();

        scores.reverse();
        //draw
        if(scores[0] === scores[1]){
            if(myTeamScore === scores[0]){
                return -1;
            }
        }

        if(scores[0] === myTeamScore){
            return 1;
        }else{
            return 0;
        }
    }

    renderTotalWinRateStats(){

        if(this.state.winrateMode !== 0) return null;
        if(this.state.data.matches === undefined) return null;


        let wins = 0;
        let draws = 0;
        let losses = 0;

        let currentWinStreak = 0;
        let currentDrawStreak = 0;
        let currentLoseStreak = 0;

        let maxWinStreak = 0;
        let maxDrawStreak = 0;
        let maxLoseStreak = 0;


        const matches = [...this.state.data.matches];

        matches.reverse();

        for(let i = 0; i < matches.length; i++){

            const m = matches[i];

            const team = m.playersTeam;

            const teamScore = (m[`team_score_${team}`] !== undefined) ? m[`team_score_${team}`] : -1

            const teamResult = this.getTeamResult(teamScore, m.team_score_0, m.team_score_1, m.team_score_2, m.team_score_3);
            
            if(teamResult === 1){

                currentWinStreak++;
                currentDrawStreak = 0;
                currentLoseStreak = 0;
                wins++;

            }else if(teamResult === 0){

                currentWinStreak = 0;
                currentDrawStreak = 0;
                currentLoseStreak++;
                losses++;


            }else if(teamResult === -1){

                currentWinStreak = 0;
                currentDrawStreak++;
                currentLoseStreak = 0;
                draws++;
            }
            
            if(currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
            if(currentLoseStreak > maxLoseStreak) maxLoseStreak = currentLoseStreak;
            if(currentDrawStreak > maxDrawStreak) maxDrawStreak = currentDrawStreak;

        }

        let winRate = 0;

        if(wins > 0){
            winRate = (wins / this.state.data.matches.length) * 100;
        }

        const colorClass = (winRate >= 50) ? "team-green" : "team-red";

        let currentStreak = "None";

        if(currentWinStreak > 0){
            currentStreak = `${currentWinStreak} Wins`;
        }

        if(currentDrawStreak > 0){
            currentStreak = `${currentDrawStreak} Draws`;
        }

        if(currentLoseStreak > 0){
            currentStreak = `${currentLoseStreak} Losses`;
        }

        return <div>
            <table className="t-width-1 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Total Matches</th>
                        <th>Total Wins</th>
                        <th>Total Draws</th>
                        <th>Total Losses</th>
                        <th>Win Rate</th>
                    </tr>

                    <tr>
                        <td>{wins + draws + losses}</td>
                        <td>{wins}</td>
                        <td>{draws}</td>
                        <td>{losses}</td>
                        <td className={colorClass}>{winRate.toFixed(2)}%</td>
                    </tr>
                </tbody>
            </table>

            <table className="t-width-1 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Longest Win Streak</th>
                        <th>Longest Draw Streak</th>
                        <th>Longest Loss Streak</th>
                        <th>Current Streak</th>
                    </tr>

                    <tr>
                        <td>{maxWinStreak}</td>
                        <td>{maxDrawStreak}</td>
                        <td>{maxLoseStreak}</td>
                        <td>{currentStreak}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    }

    getMatchResult(matchData){

        const myTeamId = matchData.playersTeam;
        const myTeamScore = matchData[`team_score_${myTeamId}`]

        const scores = [];

        for(let i = 0; i < matchData.total_teams; i++){

            scores.push(matchData[`team_score_${i}`]);
        }

        scores.sort((a, b) =>{

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }

            return 0;
        });

        if(scores[0] === myTeamScore){

            //-1 for draw
            if(scores[1] === myTeamScore) return -1;
            return 1;
        }

        return 0;
      
    }

    sortByWinRate(a, b){


        if(a.winRate < b.winRate){
            
            return 1;

        }else if(a.winRate > b.winRate){

            return -1;

        }else{

            if(a.wins > b.wins){
                return -1;
            }else if(a.wins < b.wins){
                return 1;
            }else{
                if(a.draws < b.draws){
                    return 1;
                }else if(a.draws > b.draws){
                    return -1;
                }else{

                    if(a.losses > b.losses){
                        return 1;
                    }else if(a.losses < b.losses){
                        return -1;
                    }
                }
            }
        }

        return 0;
        
    }

    renderMinimumMatches(){

        return <div className="form m-bottom-10">
            <div className="select-row">
                <div className="select-label">
                    Minimum Matches
                </div>
                <div>
                    <select className="default-select" value={this.state.minimumMatches} onChange={this.changeMinMatches}>
                        <option value="0">0</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>
        </div>
    }

    renderMapWinRates(){

        if(this.state.winrateMode !== 2) return null;
        if(this.state.data.matches === undefined) return null;

        const mapsObject = {};

        for(let i = 0; i < this.state.data.matches.length; i++){

            const m = this.state.data.matches[i];

            if(mapsObject[m.mapName] === undefined){

                mapsObject[m.mapName] = {
                    "wins": 0, 
                    "draws": 0, 
                    "losses": 0, 
                    "currentWinStreak": 0, 
                    "currentDrawStreak": 0,
                    "currentLoseStreak": 0,
                    "maxWinStreak": 0,
                    "maxDrawStreak": 0,
                    "maxLoseStreak": 0
                };
            }

            const current = mapsObject[m.mapName];
            const matchResult = this.getMatchResult(m);

            if(matchResult === 1){

                current.wins++;
                current.currentWinStreak++;
                current.currentDrawStreak = 0;
                current.currentLoseStreak = 0;

            }else if(matchResult === 0){

                current.losses++;
                current.currentWinStreak = 0
                current.currentDrawStreak = 0;
                current.currentLoseStreak++;

            }else if(matchResult === -1){

                current.draws++;
                current.currentWinStreak = 0;
                current.currentDrawStreak++;
                current.currentLoseStreak = 0;
            }   

            if(current.currentWinStreak > current.maxWinStreak){
                current.maxWinStreak = current.currentWinStreak;
            }

            if(current.currentDrawStreak > current.maxDrawStreak){
                current.maxDrawStreak = current.currentDrawStreak;
            }

            if(current.currentLoseStreak > current.maxLoseStreak){
                current.maxLoseStreak = current.currentLoseStreak;
            }
        }

        const maps = [];

        for(const [key, value] of Object.entries(mapsObject)){
            
            const totalMatches = value.wins + value.draws + value.losses;

            if(totalMatches < this.state.minimumMatches) continue;

            let currentStreak = "None";

            if(value.currentWinStreak > 0) currentStreak = `${value.currentWinStreak} Wins`;
            if(value.currentDrawStreak > 0) currentStreak = `${value.currentDrawStreak} Draws`;
            if(value.currentLoseStreak > 0) currentStreak = `${value.currentLoseStreak} Losses`;

            maps.push({
                "name": key,
                "wins": value.wins,
                "draws": value.draws,
                "losses": value.losses,
                "winRate": (value.wins > 0) ? (value.wins /  totalMatches) * 100 : 0,
                "maxWinStreak": value.maxWinStreak,
                "currentStreak": currentStreak
            });
        }
        

        maps.sort(this.sortByWinRate);

        const rows = [];

        for(let i = 0; i < maps.length; i++){

            const m = maps[i];

            const totalMatches = m.wins + m.losses + m.draws;

            let winrate = 0;

            if(m.wins > 0){

                winrate = (m.wins / totalMatches) * 100;
            }

            const colorClass = (winrate >= 50) ? "team-green" : "team-red";

            rows.push(<tr key={i}>
                <td>{m.name}</td>
                <td>{totalMatches}</td>
                <td>{m.draws}</td>
                <td>{m.losses}</td>
                <td>{m.wins}</td>
                <td>{m.maxWinStreak}</td>
                <td>{m.currentStreak}</td>
                <td className={colorClass}>{winrate.toFixed(2)}%</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="-1">
                <td colSpan="8" style={{"textAlign": "center"}}>No Data Matching Requirements</td>
            </tr>);
        }

        return <div>
            {this.renderMinimumMatches()}
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Map</th>
                        <th>Matches</th>
                        <th>Draws</th>
                        <th>Losses</th>
                        <th>Wins</th>
                        <th>Best Win Streak</th>
                        <th>Current Streak</th>
                        <th>Win Rate</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    renderGametypeWinRates(){

        if(this.state.winrateMode !== 1) return null;
        if(this.state.data.length === 0) return null;

        const gametypesObject = {};

        for(let i = 0; i < this.state.data.matches.length; i++){

            const d = this.state.data.matches[i];
            
            if(gametypesObject[d.gametypeName] === undefined){

                gametypesObject[d.gametypeName] = {
                    "matches": 0,
                    "wins": 0,
                    "draws": 0,
                    "losses": 0,
                    "maxWinStreak": 0,
                    "maxDrawStreak": 0,
                    "maxLoseStreak": 0,
                    "currentWinStreak": 0,
                    "currentLoseStreak": 0,
                    "currentDrawStreak": 0
                };
            }

            const matchResult = this.getMatchResult(d);

            const current = gametypesObject[d.gametypeName];

            current.matches++;
            
            if(matchResult === 0){

                current.losses++;
                current.currentLoseStreak++;
                current.currentWinStreak = 0;
                current.currentDrawStreak = 0;

            }else if(matchResult === 1){

                current.wins++
                current.currentLoseStreak = 0;
                current.currentWinStreak++;
                current.currentDrawStreak = 0;

            }else if(matchResult === -1){

                current.draws++;
                current.currentLoseStreak = 0;
                current.currentWinStreak = 0;
                current.currentDrawStreak++;
            }

            if(current.currentWinStreak > current.maxWinStreak) current.maxWinStreak = current.currentWinStreak;
            if(current.currentDrawStreak > current.maxDrawStreak) current.maxDrawStreak = current.currentDrawStreak;
            if(current.currentLoseStreak > current.maxLoseStreak) current.maxLoseStreak = current.currentLoseStreak;
        }

        const gametypes = [];

        for(const [key, value] of Object.entries(gametypesObject)){

            let currentStreak = "None";

            if(value.currentWinStreak > 0) currentStreak = `${value.currentWinStreak} Wins`;
            if(value.currentDrawStreak > 0) currentStreak = `${value.currentDrawStreak} Draws`;
            if(value.currentLoseStreak > 0) currentStreak = `${value.currentLoseStreak} Losses`;

            gametypes.push({
                "name": key,
                "matches": value.matches,
                "wins": value.wins,
                "draws": value.draws,
                "losses": value.losses,
                "bestWinSteak": value.maxWinStreak,
                "currentStreak": currentStreak,
                "winRate": (value.wins > 0) ? (value.wins / value.matches) * 100 : 0
            });
        }

        gametypes.sort(this.sortByWinRate);

        const rows = [];

        for(let i = 0; i < gametypes.length; i++){

            const g = gametypes[i];

            if(g.matches < this.state.minimumMatches) continue;

            const colorClass = (g.winRate >= 50) ? "team-green" : "team-red";

            rows.push(<tr key={i}>
                <td>{g.name}</td>
                <td>{g.matches}</td>
                <td>{g.draws}</td>
                <td>{g.losses}</td>
                <td>{g.wins}</td>
                <td>{g.bestWinSteak}</td>
                <td>{g.currentStreak}</td>
                <td className={colorClass}>{g.winRate.toFixed(2)}%</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="-1">
                <td colSpan="8" style={{"textAlign": "center"}}>No Data Matching Requirements</td>
            </tr>);
        }

        return <div>
            {this.renderMinimumMatches()}
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Gametype</th>
                        <th>Matches</th>
                        <th>Draws</th>
                        <th>Losses</th>
                        <th>Wins</th>
                        <th>Best Win Streak</th>
                        <th>Current Streak</th>
                        <th>Win Rate</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    renderGeneralStats(){
        
        if(this.state.data.length === 0) return null;

        const playerRows = [];

        const tn = "team-none";

        const mode = this.state.generalMode;

        let totalScore = 0;
        let totalFrags = 0;
        let totalKills = 0;
        let totalDeaths = 0;
        let totalSuicides = 0;
        let totalTeamKills = 0;
        let totalSpawnKills = 0;

        for(const [id, data] of Object.entries(this.state.data.totals.players)){

            let eff = 0;

            if(data.kills > 0){

                if(data.deaths === 0){
                    eff = 100;
                }else{
                    eff = data.kills / (data.kills + data.deaths);
                    eff = (eff * 100).toFixed(2);
                }
            }

            const player = this.getPlayer(parseInt(id));

            let score, frags, kills, deaths, suicides, teamKills, spawnKills = 0;
            const matches = data.matches;
            const playtime = data.playtime / 600;

            score = data.score;
            frags = data.frags;
            kills = data.kills;
            deaths = data.deaths;
            suicides = data.suicides;
            teamKills = data.teamKills;
            spawnKills = data.spawnKills;

            if(mode === 1){

                score = (score > 0) ? (score / matches).toFixed(2) : 0;
                frags = (frags > 0) ? (frags / matches).toFixed(2) : 0;
                kills = (kills > 0) ? (kills / matches).toFixed(2) : 0;
                deaths = (deaths > 0) ? (deaths / matches).toFixed(2) : 0;
                suicides = (suicides > 0) ? (suicides / matches).toFixed(2) : 0;
                teamKills = (teamKills > 0) ? (teamKills / matches).toFixed(2) : 0;
                spawnKills = (spawnKills > 0) ? (spawnKills / matches).toFixed(2) : 0;

            }else if(mode === 2){

                score = (score > 0 && playtime > 0) ? (score / playtime).toFixed(2) : 0;
                frags = (frags > 0 && playtime > 0) ? (frags / playtime).toFixed(2) : 0;
                kills = (kills > 0 && playtime > 0) ? (kills / playtime).toFixed(2) : 0;
                deaths = (deaths > 0 && playtime > 0) ? (deaths / playtime).toFixed(2) : 0;
                suicides = (suicides > 0 && playtime > 0) ? (suicides / playtime).toFixed(2) : 0;
                teamKills = (teamKills > 0 && playtime > 0) ? (teamKills / playtime).toFixed(2) : 0;
                spawnKills = (spawnKills > 0 && playtime > 0) ? (spawnKills / playtime).toFixed(2) : 0;

            }


            totalScore += parseFloat(score);
            totalFrags += parseFloat(frags);
            totalKills += parseFloat(kills);
            totalDeaths += parseFloat(deaths);
            totalSuicides += parseFloat(suicides);
            totalTeamKills += parseFloat(teamKills);
            totalSpawnKills += parseFloat(spawnKills);

            const effElem = (mode === 0) ? <td>{eff}%</td> : null;

            playerRows.push(<tr key={id}>
                <td><Link href={`/player/${player.id}`}><a><CountryFlag host={this.props.host} country={player.country}/>{player.name}</a></Link></td>
                <td>{score}</td>
                <td>{frags}</td>
                <td>{kills}</td>
                <td>{deaths}</td>
                <td>{suicides}</td>
                <td>{teamKills}</td>
                <td>{spawnKills}</td>
                {effElem}
            </tr>);
        }

        const totals = this.state.data.totals.totals;

        let totalEff = 0;
        if(totals.kills > 0){

            if(totals.deaths === 0){
                totalEff = 100;
            }else{
                totalEff = totals.kills / (totals.kills + totals.deaths);
                totalEff = (totalEff * 100).toFixed(2);
            }
        }

        const totalEffElem = (mode === 0) ? <td className={tn}>{totalEff}%</td> : null; 

        playerRows.push(<tr key={"totals"}>
            <td className={tn}>Totals</td>
            <td className={tn}>{totalScore}</td>
            <td className={tn}>{totalFrags}</td>
            <td className={tn}>{totalKills}</td>
            <td className={tn}>{totalDeaths}</td>
            <td className={tn}>{totalSuicides}</td>
            <td className={tn}>{totalTeamKills}</td>
            <td className={tn}>{totalSpawnKills}</td>
            {totalEffElem}
        </tr>);
        

        const effHeader = (mode === 0) ? <th>Efficiency</th> : null;

        return <div>
            <div className="default-header">General Statistics</div>
            <div className="tabs">
                <div className={`tab ${(this.state.generalMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeGeneralMode(0);
                })}>
                    Totals
                </div>
                <div className={`tab ${(this.state.generalMode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeGeneralMode(1);
                })}>
                    Per Match Average
                </div>
                <div className={`tab ${(this.state.generalMode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeGeneralMode(2);
                })}>
                    Average per 10 Minutes
                </div>
            </div>
            <table className="t-width-1 player-td-1">
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Frags</th>
                        <th>Kills</th>
                        <th>Deaths</th>
                        <th>Suicides</th>
                        <th>Team Kills</th>
                        <th>Spawn Kills</th>
                        {effHeader}
           
                    </tr>
                    {playerRows}
                </tbody>
            </table>
        </div>
    }

    renderWinRates(){

        if(this.state.data.length === 0) return null;

        return <div>
            <div className="default-header">Winrate Statistics</div>
            <div className="tabs">
                <div className={`tab ${(this.state.winrateMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeWinrateMode(0);
                })}>Combined</div>
                <div className={`tab ${(this.state.winrateMode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeWinrateMode(1);
                })}>Gametypes</div>
                <div className={`tab ${(this.state.winrateMode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeWinrateMode(2);
                })}>Maps</div>
            </div>
            {this.renderTotalWinRateStats()}
            {this.renderGametypeWinRates()}
            {this.renderMapWinRates()}
        </div>
    }

    bAnyCTFEvents(data){


        const reg = /flag/i;

        for(const [key, value] of Object.entries(data)){

            if(reg.test(key)){

                if(value > 0) return true;
            }

        }

        return false;
    }

    renderCTFGeneral(){

        if(this.state.data.length === 0) return null;
        if(this.state.ctfSubMode !== 0) return null;
        const rows = [];

        let data = [];

        const ctfMode = this.state.ctfMode;

        if(ctfMode === 0){

            data = this.state.data.totals.players;
            data = this.orderByMatches(data);

        }else if(ctfMode === 1){

            data = this.state.data.totals.gametypes;
            data = this.orderByMatches(data);

        }else if(ctfMode === 2){

            data = this.state.data.totals.maps;
            data = this.orderByMatches(data);
        }


        let totalMatches = 0;

        for(let i = 0; i < data.length; i++){

            const value = data[i];

            let player = null;
            let nameElem = null;

            let matchesElem = null;

            if(ctfMode === 0){

                player = this.getPlayer(parseInt(value.key));

                nameElem = <Link href={`/player/${player.id}`}>
                    <a>
                        <CountryFlag country={player.country} host={this.props.host}/>{player.name}
                    </a>
                </Link>;

            }else if(ctfMode === 1){

                if(!this.bAnyCTFEvents(value)) continue;

                const gametypeName = this.getGametype(value.key);

                totalMatches += value.matches;
                matchesElem = <td>{value.matches}</td>;

                nameElem = <>
                    {gametypeName}
                </>

            }else if(ctfMode === 2){

                if(!this.bAnyCTFEvents(value)) continue;

                const mapName = this.getMap(value.key);

                nameElem = <>{mapName}</>;
                matchesElem = <td>{value.matches}</td>;

                totalMatches += value.matches;
            }

            let flagTaken = value.flagTaken;
            let flagPickup = value.flagPickup;
            let flagDropped = value.flagDropped;
            let flagAssist = value.flagAssist;
            let flagCover = value.flagCover;
            let flagSeal = value.flagSeal;
            let flagCapture = value.flagCapture;
            let flagKill = value.flagKill;
            let flagReturn = value.flagReturn;
            let flagSave = value.flagSave;

            rows.push(<tr key={value.key}>
                <td>
                    {nameElem}
                </td>
                {matchesElem}
                <td>{flagTaken}</td>
                <td>{flagPickup}</td>
                <td>{flagDropped}</td>
                <td>{flagAssist}</td>
                <td>{flagCover}</td>
                <td>{flagSeal}</td>
                <td>{flagCapture}</td>
                <td>{flagKill}</td>
                <td>{flagReturn}</td>
                <td>{flagSave}</td>
            </tr>);
        }

        if(rows.length > 1){

            const totals = this.state.data.totals.totals;
            const tc = "team-none";

            rows.push(<tr key={-1}>
                <td className={tc}>
                    Totals
                </td>
                {(ctfMode !== 0) ? <td className={tc}>{totalMatches}</td>: null}
                <td className={tc}>{totals.flagTaken}</td>
                <td className={tc}>{totals.flagPickup}</td>
                <td className={tc}>{totals.flagDropped}</td>
                <td className={tc}>{totals.flagAssist}</td>
                <td className={tc}>{totals.flagCover}</td>
                <td className={tc}>{totals.flagSeal}</td>
                <td className={tc}>{totals.flagCapture}</td>
                <td className={tc}>{totals.flagKill}</td>
                <td className={tc}>{totals.flagReturn}</td>
                <td className={tc}>{totals.flagSave}</td>
            </tr>);
        }

        let title = "Player";

        if(ctfMode === 1) title = "Gametype";
        if(ctfMode === 2) title = "Map";

        return <table className="t-width-1 player-td-1">
            <tbody>
                <tr>
                    <th>{title}</th>
                    {(ctfMode !== 0) ? <th>Matches</th> : null}
                    <th>Taken</th>
                    <th>Pickup</th>
                    <th>Dropped</th>
                    <th>Assist</th>
                    <th>Cover</th>
                    <th>Seal</th>
                    <th>Capture</th>
                    <th>Kill</th>
                    <th>Return</th>
                    <th>Close Return</th>
                </tr>
                {rows}
            </tbody>
        </table>
    }

    orderByMatches(data){

        const objects = [];

        for(const [key, value] of Object.entries(data)){

            value.key = key;
            objects.push(value);
        }

        objects.sort((a, b) =>{

            a = a.matches;
            b = b.matches;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        return objects;
    }

    renderCTFCovers(){

        if(this.state.data.length === 0) return null;
        if(this.state.ctfSubMode !== 1) return null;

        const rows = [];

        const ctfMode = this.state.ctfMode;

        let data = [];

        if(ctfMode === 0){

            data = this.state.data.totals.players;
            data = this.orderByMatches(data);

        }else if(ctfMode === 1){

            data = this.state.data.totals.gametypes;
            data = this.orderByMatches(data);

        }else if(ctfMode === 2){
            data = this.state.data.totals.maps;
            data = this.orderByMatches(data);
        }

        let totalMatches = 0;

        for(let i = 0; i < data.length; i++){

            const value = data[i];
      
            let covers = value.flagCover;
            let coversPass = value.flagCoverPass;
            let coversFail = value.flagCoverFail;
            let coversEff = (covers > 0 && coversPass > 0) ? (coversPass / covers) * 100 : 0;
            let multiCover = value.flagMultiCover;
            let spreeCover = value.flagSpreeCover;
            let bestCovers = value.flagCoverBest;
            let selfCovers = value.flagSelfCover;
            let selfCoversPass = value.flagSelfCoverPass;
            let selfCoversFail = value.flagSelfCoverFail;

            let nameElem = null;

            if(ctfMode === 0){

                const player = this.getPlayer(parseInt(value.key));

                nameElem = <Link href={`/player/${player.id}`}>
                    <a>
                        <CountryFlag country={player.country} host={this.props.host}/>{player.name}
                    </a>
                </Link>;

            }else if(ctfMode === 1){

                if(!this.bAnyCTFEvents(value)) continue;

                const gametypeName = this.getGametype(value.key);

                totalMatches += value.matches;

                nameElem = <>
                    {gametypeName}
                </>;

            }else if(ctfMode === 2){

                if(!this.bAnyCTFEvents(value)) continue;

                const mapName = this.getMap(value.key);
                totalMatches += value.matches;

                nameElem = <>{mapName}</>;

            }

            rows.push(<tr key={value.key}>
                <td>
                    {nameElem}
                </td>
                {(ctfMode > 0) ? <td>{value.matches}</td> : null}
                <td>{covers}</td>
                <td>{coversPass}</td>
                <td>{coversFail}</td>
                <td>{coversEff.toFixed(2)}%</td>
                <td>{multiCover}</td>
                <td>{spreeCover}</td>
                <td>{bestCovers}</td>
                <td>{selfCovers}</td>
                <td>{selfCoversPass}</td>
                <td>{selfCoversFail}</td>
       
            </tr>);
        }

        if(rows.length > 1){

            const totals = this.state.data.totals.totals;
            
            const totalCoversEff = (totals.flagCover > 0 && totals.flagCoverPass > 0) ? (totals.flagCoverPass / totals.flagCover) * 100 : 0;
            const tc = "team-none";

            rows.push(<tr key={-1}>
                <td className={tc}>
                    Totals
                </td>
                {(ctfMode > 0) ? <td className={tc}>{totalMatches}</td> : null}
                <td className={tc}>{totals.flagCover}</td>
                <td className={tc}>{totals.flagCoverPass}</td>
                <td className={tc}>{totals.flagCoverFail}</td>
                <td className={tc}>{totalCoversEff.toFixed(2)}%</td>
                <td className={tc}>{totals.flagMultiCover}</td>
                <td className={tc}>{totals.flagSpreeCover}</td>
                <td className={tc}>{totals.flagCoverBest}</td>
                <td className={tc}>{totals.flagSelfCover}</td>
                <td className={tc}>{totals.flagSelfCoverPass}</td>
                <td className={tc}>{totals.flagSelfCoverFail}</td>
            </tr>);
        }

        let title = "Player";

        if(ctfMode === 1) title = "Gametype";
        if(ctfMode === 2) title = "Map";

        return <table className="t-width-1 player-td-1">
            <tbody>
                <tr>
                    <th>{title}</th>
                    {(ctfMode > 0) ? <th>Matches</th> : null}
                    <th>Cover</th>
                    <th>Cover Pass</th>
                    <th>Cover Fail</th>
                    <th>Cover Eff</th>
                    <th>Multi Cover</th>
                    <th>Cover Spree</th>
                    <th>Best Covers</th>
                    <th>Self Covers</th>
                    <th>Self Covers Pass</th>
                    <th>Self Covers Fail</th>
                </tr>
                {rows}
            </tbody>
        </table>
    }

    renderCTF(){

        if(this.state.data.length === 0) return null;

        return <div>
            <div className="default-header">Capture The Flag Statistics</div>
            <div className="tabs">
                <div className={`tab ${(this.state.ctfMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeCTFMode(0);
                })}>Combined</div>
                <div className={`tab ${(this.state.ctfMode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeCTFMode(1);
                })}>Gametypes</div>
                <div className={`tab ${(this.state.ctfMode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeCTFMode(2);
                })}>Maps</div>
            </div>
            <div className="tabs">
                <div className={`tab ${(this.state.ctfSubMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeCTFSubMode(0);
                })}>General</div>
                <div className={`tab ${(this.state.ctfSubMode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeCTFSubMode(1);
                })}>Covers</div>
            </div>
            {this.renderCTFGeneral()}
            {this.renderCTFCovers()}
        </div>
    }

    render(){

        const players = JSON.parse(this.props.players);

        return <div>
            <DefaultHead 
            title={`team mates`} 
            description={`.`} 
            host={this.props.host}
            keywords={`teammates`}/>
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                       <div className="default-header">Team Mates</div>

                        <div className="form">
                            <form action="/" method="POST" onSubmit={this.loadData}>
                                <div className="default-sub-header-alt">Select Players</div>
                                <div className="form-info m-bottom-10">
                                    View history of any combination of players when they have been on the same team as each other, see who are the most successful group of players.
                                </div>
                                <div className="m-bottom-25">
                                    {this.renderDropDowns(players)}
                                </div>
                                <div className={`${styles.add} team-green`} onClick={this.addPlayer}>Add Player</div>
                                <input type="submit" className={"search-button m-top-25"} value="Load Data"/>
                            </form>
                        </div>
                        {this.renderGeneralStats()}
                        {this.renderWinRates()}
                        {this.renderCTF()}
                        {this.renderMatches()}
                    </div>

                    
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, res}){

    const session = new Session(req);
    await session.load();

    const navSettings = await SiteSettings.getSettings("Navigation");
    //const pageSettings = await SiteSettings.getSettings("Records Page");

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    const playerManager = new Players();

    const playerList = await playerManager.getAllNames();


    return {
        "props":{
            "host": Functions.getImageHostAndPort(req.headers.host),
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "players": JSON.stringify(playerList),
            
        }
    }
}

export default TeamMates;