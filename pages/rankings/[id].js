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
import { useReducer } from 'react';
import { useRouter } from 'next/router';
import DropDown from '../../components/DropDown';

function reducer(state, action){

    switch(action.type){

        case "toggle-explained":{

            return {
                ...state,
                "bDisplayExplained": !state.bDisplayExplained
            }
        }
    }

    return state;
}

function getGametypeName(names, id){

    for(const [key, value] of Object.entries(names)){

        if(parseInt(key) === id) return value;
    }

    return "Not Found";
}


function createElems(data, gametypeNames, host, gametypeId, page, perPage){

    const bDisplayPagination = data.length === 1;

    const elems = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        
        //if(d.data.length === 0) continue;

        elems.push(<RankingTable host={Functions.getImageHostAndPort(host)} gametypeId={d.id} page={page-1} perPage={perPage} 
            key={i} mode={gametypeId}
            title={getGametypeName(gametypeNames, d.id)} data={d.data} results={d.results} bDisplayPagination={bDisplayPagination}
        />);
    }

    return elems;
}

function displaySettings(rankingValues){

    return <RankingsExplained settings={JSON.parse(rankingValues)}/>
}

export default function Rankings({data, gametypeId, gametypeNames, host, navSettings, page, perPage, rankingValues, session, lastActive, minPlaytime}){

    const [state, dispatch] = useReducer(reducer, {
        "mode": 0, 
        "bDisplayExplained": false
    });

    const router = useRouter();
 
    let titleName = "Rankings";

    const totalGametypes = Object.keys(gametypeNames).length;

    data = JSON.parse(data);

    let keywords = "gametype,rankings";

    let description = "View player rankings for their gametypes played.";

    if(gametypeId === 0){

        titleName = "Top Rankings";

        keywords += ",top,all";

        description = `View all the top players of each gametype. There are a total of ${totalGametypes} gametypes to choose from, see who's the best of your favourite gametype.`;

    }else{

        const pages = Math.ceil(data[0].results / perPage);

        titleName = `${gametypeNames[`${gametypeId}`]} Rankings - Page ${page} of ${pages}`;

        keywords += `,${gametypeNames[`${gametypeId}`]}`

        description = `View all the top players of the ${gametypeNames[`${gametypeId}`]} gametype, there are a total of ${data[0].results} players in the rankings.`;

    }


    const mainTitle = <div className="default-header">Filter Rankings</div>

    return <div>
            <DefaultHead host={host} title={titleName}
                description={description} 
                keywords={keywords}
            />
            <main>
                <Nav settings={navSettings} session={session}/>
                <div id="content">
                    <div className="default">
                        {mainTitle}

                        <div className="form">
                            <DropDown 
                                dName="Active Within" 
                                fName="last-active" 
                                selectedValue={lastActive.toString()} 
                                data={[
                                    {"value": "1", "displayValue": "Past 1 Day"},
                                    {"value": "7", "displayValue": "Past 7 Days"},
                                    {"value": "28", "displayValue": "Past 28 Days"},
                                    {"value": "90", "displayValue": "Past 90 Days"},
                                    {"value": "365", "displayValue": "Past 365 Days"},
                                    {"value": "0", "displayValue": "No Limit"},
                                ]} 
                                changeSelected={(name, value) =>{
                                    router.push(`/rankings/${gametypeId}?lastActive=${value}&minPlaytime=${minPlaytime}`);
                                }}
                            />

                            <DropDown 
                                dName="Min Playtime" 
                                fName="last-active" 
                                selectedValue={minPlaytime.toString()} 
                                data={[
                                    {"value": "1", "displayValue": "1 Hour"},
                                    {"value": "2", "displayValue": "2 Hours"},
                                    {"value": "3", "displayValue": "3 Hours"},
                                    {"value": "6", "displayValue": "6 Hours"},
                                    {"value": "12", "displayValue": "12 Hours"},
                                    {"value": "24", "displayValue": "24 Hours"},
                                    {"value": "48", "displayValue": "48 Hours"},
                                    {"value": "0", "displayValue": "No Limit"},
                                ]} 
                                changeSelected={(name, value) =>{
                                    router.push(`/rankings/${gametypeId}?lastActive=${lastActive}&minPlaytime=${value}`);
                                }}
                            />
                        </div>  

                        {createElems(data, gametypeNames, host, gametypeId, page, perPage)}

                        <div className="big-tabs m-top-25">
                            <div onClick={() =>{ dispatch({"type": "toggle-explained"})}} className={`big-tab ${(state.bDisplayExplained) ? "tab-selected" : ""}`}>
                                {(state.bDisplayExplained) ? "Hide Explain Ranking" : "Explain Rankings"}
                            </div>
                        </div>
                        {(state.bDisplayExplained) ? displaySettings(rankingValues) : null }
                    </div>
                </div>
                <Footer session={session}/>
            </main>   
        </div>;
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

    const DEFAULT_ACTIVE = pageSettings["Default Last Active"];
    const DEFAULT_MIN_PLAYTIME = pageSettings["Default Min Playtime"];

    let lastActive = (query.lastActive !== undefined) ? parseInt(query.lastActive) : DEFAULT_ACTIVE;

    if(lastActive !== lastActive) lastActive = DEFAULT_ACTIVE;
    lastActive = lastActive.toString();

    let minPlaytime = (query.minPlaytime !== undefined) ? parseInt(query.minPlaytime) : DEFAULT_MIN_PLAYTIME;
    if(minPlaytime !== minPlaytime) minPlaytime = DEFAULT_MIN_PLAYTIME;
    minPlaytime = minPlaytime.toString();

    const rankingManager = new RankingManager();
    const gametypeManager = new Gametypes();
    const playerManager = new Players();

    const gametypeNames = await gametypeManager.getAllNames();

    const gametypeIds = [];

    for(const key of Object.keys(gametypeNames)){

        gametypeIds.push(parseInt(key));
    }

    let data = [];

    if(gametype === 0){

        if(gametypeIds.length <= 1){
            perPage = parseInt(pageSettings["Rankings Per Page (Individual)"]);
        }

        data = await rankingManager.getMultipleGametypesData(gametypeIds, perPage, lastActive, minPlaytime);
        
    
    }else{
        data.push({"id": gametype, "data": await rankingManager.getData(gametype, page, perPage, lastActive, minPlaytime)});
    }


    for(let i = 0; i < data.length; i++){

        data[i].results = await rankingManager.getTotalPlayers(data[i].id, lastActive, minPlaytime);
    }

    const playerIds = [];

    for(let i = 0; i < data.length; i++){

        for(let x = 0; x < data[i].data.length; x++){

            const d = data[i].data[x];

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

    const rankingValues = await rankingManager.getDetailedSettings();

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    return {
        props:{
            "host": req.headers.host,
            "data": JSON.stringify(data),
            "gametypeNames": gametypeNames,
            "page": page,
            "perPage": perPage,
            "gametypeId": gametype,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "rankingValues": JSON.stringify(rankingValues),
            "lastActive": lastActive,
            "minPlaytime": minPlaytime,
        }
    }
}
