import React from "react";
import DefaultHead from "../../components/defaulthead";
import Nav from '../../components/Nav/';
import Footer from "../../components/Footer/";
import Session from '../../api/session';
import Sitesettings from '../../api/sitesettings';
import Match from '../../api/match';
import Gametypes from '../../api/gametypes';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import MatchSummary from "../../components/MatchSummary";

class PlayerMatch extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div>
            <DefaultHead 
                host={this.props.host} 
                title={`Player Match Report`} 
                description={`Player Match report ) .`} 
                keywords={`match,report,player`}
                /*image={ogImage}    */
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                
                <div className="default">
                    <div className="default-header">Player Match Report</div>
                    <MatchSummary 
                        info={this.props.info} 
                        server={this.props.server} 
                        gametype={this.props.gametype}
                        map={this.props.map} 
                        image={this.props.image}
                     />
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){


    let matchId = -1;
    let playerId = -1;

    if(query.match !== undefined){

        matchId = parseInt(query.match);

        if(matchId !== matchId) matchId = -1;
    }

    

    console.log(query);

    const session = new Session(req);

    await session.load();

    const settings = new Sitesettings();

    const navSettings = await settings.getCategorySettings("Navigation");

    const matchManager = new Match();

    const info = await matchManager.get(matchId);

    const gametypeManager = new Gametypes();
    const gametypeName = await gametypeManager.getName(info.gametype);
    const serverManager = new Servers();
    const serverName = await serverManager.getName(info.server);
    const mapManager = new Maps();
    const mapName = await mapManager.getName(info.map);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "info": JSON.stringify(info),
            "server": serverName,
            "gametype": gametypeName,
            "map": mapName
        }
    }
}

export default PlayerMatch;