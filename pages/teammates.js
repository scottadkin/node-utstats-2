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

class TeamMates extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "selectedPlayers": [5981, 6039], 
            "selectedAliases": [[],[]], 
            "loadingInProgress": false, 
            "data": [], 
            "bLoadedData": false, 
            "minimumMatches": 5
        };

        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.changeSelected = this.changeSelected.bind(this);

        this.loadData = this.loadData.bind(this);

        this.addAlias = this.addAlias.bind(this);
        this.deleteAlias = this.deleteAlias.bind(this);
        this.changeMinMatches = this.changeMinMatches.bind(this);

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

            this.setState({
                "data": 
                {
                    "matches": res.matches, 
                    "servers": res.servers,
                    "gametypes": res.gametypes,
                    "maps": res.maps
                }
            });

            console.log(res);

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

    renderGeneralStats(){

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
            <div className="default-header">General Statistics</div>
            <table className="t-width-2 m-bottom-25">
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

            <table className="t-width-2 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Longest Win Streak</th>
                        <th>Longest Draw Streak</th>
                        <th>Longest Loss Streak</th>
                    </tr>

                    <tr>
                        <td>{maxWinStreak}</td>
                        <td>{maxDrawStreak}</td>
                        <td>{maxLoseStreak}</td>
                    </tr>
                </tbody>
            </table>

            <table className="t-width-2">
                <tbody>
                    <tr>
                        <th>Current Streak</th>
                    </tr>

                    <tr>
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

    renderMapStats(){

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

            rows.push(<tr key={i}>
                <td>{m.name}</td>
                <td>{totalMatches}</td>
                <td>{m.draws}</td>
                <td>{m.losses}</td>
                <td>{m.wins}</td>
                <td>{m.maxWinStreak}</td>
                <td>{m.currentStreak}</td>
                <td>{winrate.toFixed(2)}%</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="-1">
                <td colSpan="8" style={{"textAlign": "center"}}>No Data Matching Requirements</td>
            </tr>);
        }

        return <div>
            <div className="default-header">Map Statistics</div>
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

    renderGametypeStats(){

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

            rows.push(<tr key={i}>
                <td>{g.name}</td>
                <td>{g.matches}</td>
                <td>{g.draws}</td>
                <td>{g.losses}</td>
                <td>{g.wins}</td>
                <td>{g.bestWinSteak}</td>
                <td>{g.currentStreak}</td>
                <td>{g.winRate.toFixed(2)}%</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="-1">
                <td colSpan="8" style={{"textAlign": "center"}}>No Data Matching Requirements</td>
            </tr>);
        }

        return <div>
            <div className="default-header">Gametype Statistics</div>
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
                        {this.renderGametypeStats()}
                        {this.renderMapStats()}
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
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "players": JSON.stringify(playerList)
            
        }
    }
}

export default TeamMates;