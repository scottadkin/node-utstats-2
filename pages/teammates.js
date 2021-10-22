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
        this.state = {"selectedPlayers": [5280, 5447], "loadingInProgress": false, "data": [], "bLoadedData": false};

        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.changeSelected = this.changeSelected.bind(this);

        this.loadData = this.loadData.bind(this);

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


        this.setState({"selectedPlayers": newPlayers});
    }

    addPlayer(){

        const previous = Object.assign(this.state.selectedPlayers);

        previous.push(-1);

        this.setState({"selectedPlayers": previous});
    }


    renderDropDowns(players){

        const elems = [];

        for(let i = 0; i < this.state.selectedPlayers.length; i++){

            const s = this.state.selectedPlayers[i];

            elems.push(<PlayersDropDown delete={this.deletePlayer} key={i} selected={s} players={players} id={i}
                changeSelected={this.changeSelected}
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