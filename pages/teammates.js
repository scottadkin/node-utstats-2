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
        this.state = {"selectedPlayers": [5995, 6039], "selectedAliases": [[],[]], "loadingInProgress": false, "data": [], "bLoadedData": false};

        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.changeSelected = this.changeSelected.bind(this);

        this.loadData = this.loadData.bind(this);

        this.addAlias = this.addAlias.bind(this);
        this.deleteAlias = this.deleteAlias.bind(this);

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

            for(let i = 0; i < e.target.length - 1; i++){

                const value = e.target[i].value;

                if(playerIds.indexOf(value) === -1){
                    playerIds.push(value);
                }
            }

            const req = await fetch("/api/teammates", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"players": playerIds})
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