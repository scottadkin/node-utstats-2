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

class TeamMates extends React.Component{

    constructor(props){

        super(props);
        this.state = {"selectedPlayers": [-1]};

        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.changeSelected = this.changeSelected.bind(this);

    }

    changeSelected(index, e){

        console.log(e.target.value);

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

        console.log(`DELETE PLAYER ${index}`);

        const newPlayers = [];

        for(let i = 0; i < this.state.selectedPlayers.length; i++){

            if(i !== index) newPlayers.push(this.state.selectedPlayers[i])
        }

        console.log(this.state.selectedPlayers);
        console.log(newPlayers);

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
                            <div className="default-sub-header-alt">Select Players</div>
                            <div className="form-info m-bottom-10">
                                View history of any combination of players when they have been on the same team as each other, see who are the most successful group of players.
                            </div>
                            <div className="m-bottom-25">
                                {this.renderDropDowns(players)}
                            </div>
                           <div className={`${styles.add} team-green`} onClick={this.addPlayer}>Add Player</div>
                           <div className="search-button m-top-25">Load results</div>
                       </div>
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