import React from 'react';
import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import RankingManager from '../../api/rankings';
import Gametypes from '../../api/gametypes';
import Functions from '../../api/functions';
import RankingTable from '../../components/RankingTable/';
import Players from '../../api/players';
import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';
import RankingsExplained from '../../components/RankingsExplained/';
import Analytics from '../../api/analytics';


class Rankings extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bDisplayExplained": 0};

        this.changeMode = this.changeMode.bind(this);
    }


    changeMode(){

        let current = this.state.bDisplayExplained;

        if(current === 0){
            current = 1;
        }else{
            current = 0;
        }

        this.setState({
            "bDisplayExplained": current
        });

        Functions.setCookie("rankingsDisplayExplained", current);
    }

    displaySettings(){

        const settings = JSON.parse(this.props.rankingValues);

        return <RankingsExplained settings={settings}/>
    }

    getGametypeName(names, id){


        for(const [key, value] of Object.entries(names)){

            if(parseInt(key) === id) return value;
        }

        return "Not Found";
    }

    createElems(){

        const data = JSON.parse(this.props.data);
        const gametypeNames = JSON.parse(this.props.gametypeNames);

        const elems = [];

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            elems.push(<RankingTable gametypeId={d.id} page={this.props.page-1} perPage={this.props.perPage} key={i} 
                title={this.getGametypeName(gametypeNames, d.id)} data={d.data} results={d.results} bDisplayPagination={(data.length > 1) ? false : true}/>);
        }

        return elems;
    }

    render(){

        let titleName = "Rankings";

        const gametypeNames = JSON.parse(this.props.gametypeNames);

        const totalGametypes = Object.keys(gametypeNames).length;

        const data = JSON.parse(this.props.data);

        let keywords = "gametype,rankings";

        let description = "View player rankings for their gametypes played.";

        if(this.props.gametypeId === 0){

            titleName = "Top Rankings";

            keywords += ",top,all";

            description = `View all the top players of each gametype. There are a total of ${totalGametypes} gametypes to choose from, see who's the best of your favourite gametype.`;

        }else{

            const pages = Math.ceil(data[0].results / this.props.perPage);

            titleName = `${gametypeNames[`${this.props.gametypeId}`]} Rankings - Page ${this.props.page} of ${pages}`;

            keywords += `,${gametypeNames[`${this.props.gametypeId}`]}`

            description = `View all the top players of the ${gametypeNames[`${this.props.gametypeId}`]} gametype, there are a total of ${data[0].results} players in the rankings.`;

            
                
        }

        return <div>
            <DefaultHead host={this.props.host} title={titleName}
                description={description} 
                keywords={keywords}
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">
                            Rankings
                        </div>
                        
                        {this.createElems()}

                        <div className="big-tabs m-top-25">
                            <div onClick={this.changeMode} className={`big-tab ${(this.state.bDisplayExplained) ? "tab-selected" : ""}`}>
                                {(this.state.bDisplayExplained) ? "Hide Explain Ranking" : "Explain Rankings"}
                            </div>
                        </div>
                        {(this.state.bDisplayExplained) ? this.displaySettings() : null }
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>   
        </div>;
    }
}




export async function getServerSideProps({req, query}){


    const sSettings = new SiteSettings();
    
    const pageSettings = await sSettings.getCategorySettings("rankings");

    let page = 1;
    let perPage = 25;

    let gametype = parseInt(query.id);

    if(gametype !== 0){

        if(query.page !== undefined){

            page = parseInt(query.page);

            if(page !== page){
                page = 1;
            }else{

                if(page < 1) page = 1;
            }
        }

        perPage = parseInt(pageSettings["Rankings Per Page (Individual)"]);
    }else{
        perPage = parseInt(pageSettings["Rankings Per Gametype (Main)"]);
    }

    const rankingManager = new RankingManager();
    const gametypeManager = new Gametypes();
    const playerManager = new Players();

    const gametypeNames = await gametypeManager.getAllNames();

    const gametypeIds = [];

    for(const [key, value] of Object.entries(gametypeNames)){

        gametypeIds.push(parseInt(key));
    }

    let data = [];

    if(gametype === 0){
        data = await rankingManager.getMultipleGametypesData(gametypeIds, perPage);
    }else{
        data.push({"id": gametype, "data": await rankingManager.getData(gametype, page, perPage)});
    }


    for(let i = 0; i < data.length; i++){

        data[i].results = await rankingManager.getTotalPlayers(data[i].id);
    }

    const playerIds = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        for(let x = 0; x < data[i].data.length; x++){

            d = data[i].data[x];

            if(playerIds.indexOf(d.player_id) === -1){
                playerIds.push(d.player_id);
            }
        }
    }
 

    const playerNames = await playerManager.getNamesByIds(playerIds);

    const playerNamesIdNamePairs = {};
    const playerNamesIdCountryPairs = {};

    for(let i = 0; i < playerNames.length; i++){

        playerNamesIdNamePairs[playerNames[i].id] = playerNames[i].name;
        playerNamesIdCountryPairs[playerNames[i].id] = playerNames[i].country;
    }

    for(let i = 0; i < data.length; i++){

        Functions.setIdNames(data[i].data, playerNamesIdNamePairs, 'player_id', 'name');
        Functions.setIdNames(data[i].data, playerNamesIdCountryPairs, 'player_id', 'country');
    }

    const session = new Session(req);

	await session.load();

    

    const navSettings = await sSettings.getCategorySettings("Navigation");

    const rankingValues = await rankingManager.getSettings();

    await Analytics.insertHit(session.userIp, req.headers.host);

    return {
        props:{
            "host": req.headers.host,
            "data": JSON.stringify(data),
            "gametypeNames": JSON.stringify(gametypeNames),
            "page": page,
            "perPage": perPage,
            "gametypeId": gametype,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "rankingValues": JSON.stringify(rankingValues)
        }
    }
}





export default Rankings;