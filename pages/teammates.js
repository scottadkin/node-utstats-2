import SiteSettings from "../api/sitesettings";
import Session from "../api/session";
import React from "react";
import Analytics from "../api/analytics";
import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Players from '../api/players';
import PlayersDropDown from "../components/PlayersDropDown";

class TeamMates extends React.Component{

    constructor(props){

        super(props);
        this.state = {"selectedPlayers": [5280, -1, -1]};
    }


    renderDropDowns(players){

        const elems = [];

        for(let i = 0; i < this.state.selectedPlayers.length; i++){

            const s = this.state.selectedPlayers[i];

            elems.push(<PlayersDropDown key={i} selected={s.id} players={players} id={i + 1}/>);
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

                           {this.renderDropDowns(players)}
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