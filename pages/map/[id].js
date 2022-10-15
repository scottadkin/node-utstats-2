import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import Maps from '../../api/maps';
import Functions from '../../api/functions';
import MatchesTableView from '../../components/MatchesTableView/';
import Servers from '../../api/servers';
import Gametypes from '../../api/gametypes';
import React from 'react';
import Pagination from '../../components/Pagination/';
import Graph from '../../components/Graph/';
import Players from '../../api/players';
import CTF from '../../api/ctf';
import Domination from '../../api/domination';
import MapControlPoints from '../../components/MapControlPoints/';
import MapSpawns from '../../components/MapSpawns/';
import Assault from '../../api/assault';
import MapAssaultObjectives from '../../components/MapAssaultObjectives/';
import MapAddictedPlayers from '../../components/MapAddictedPlayers/';
import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';
import Analytics from '../../api/analytics';
import MapCTFCaps from '../../components/MapCTFCaps';
import MapSummary from '../../components/MapSummary';
import CombogibMapRecords from '../../components/CombogibMapRecords';


const PlayedGraph = ({dates}) =>{

    return <div>
        <div className="default-header">
            Games Played
        </div>
        <Graph title={["Last 24 Hours", "Last 7 Days", "Last 28 Days", "Last 365 Days"]} data={JSON.stringify(
            [
                [{"name": "Matches", "data": dates.day.data}],
                [{"name": "Matches", "data": dates.week.data}],
                [{"name": "Matches", "data": dates.month.data}],
                [{"name": "Matches", "data": dates.year.data}],
            ])}
            
            text={
                JSON.stringify([
                    dates.day.text,
                    dates.week.text,
                    dates.month.text,
                    dates.year.text,
                ])
            }
        />
    </div>;
}

class Map extends React.Component{

    constructor(props){

        super(props);

    }


    render(){

        const basic = JSON.parse(this.props.basic);
        let image = this.props.image;

        const imageResult = /^\/(.+)$/i.exec(image);

        if(imageResult !== null){
            image = imageResult[1];
        }   

        const matches = this.props.matches;

        const imageHost = Functions.getImageHostAndPort(this.props.host);

        const pageOrder = JSON.parse(this.props.pageOrder);
        const pageSettings = JSON.parse(this.props.pageSettings);

        const elems = [];



        if(pageSettings["Display Summary"] === "true"){

            elems[pageOrder["Display Summary"]] = <MapSummary 
                key={pageOrder["Display Summary"]} 
                basic={basic} 
                spawns={this.props.spawns} 
                imageHost={imageHost} 
                image={image}
            />; 
        }

        if(pageSettings["Display Games Played"] === "true"){
            elems[pageOrder["Display Games Played"]] = <PlayedGraph key={pageOrder["Display Games Played"]} dates={this.props.dates}/>
        }

        if(pageSettings["Display Spawn Points"] === "true"){

            elems[pageOrder["Display Spawn Points"]] = <MapSpawns 
                key={pageOrder["Display Spawn Points"]} 
                spawns={this.props.spawns} 
                mapPrefix={this.props.mapPrefix} 
                flagLocations={this.props.flagLocations}
            />;
        }

        if(pageSettings["Display CTF Caps"] === "true"){

            elems[pageOrder["Display CTF Caps"]] = <MapCTFCaps
                key={pageOrder["Display CTF Caps"]}
                mapId={basic.id} 
                page={this.props.capPage} 
                mode={this.props.capMode}
                perPage={10} 
                host={Functions.getImageHostAndPort(this.props.host)}
            />;
        }

        if(pageSettings["Display Control Points (Domination)"] === "true"){

            elems[pageOrder["Display Control Points (Domination)"]] = <MapControlPoints 
                key={pageOrder["Display Control Points (Domination)"]} 
                points={this.props.domControlPointLocations} 
                mapPrefix={this.props.mapPrefix}
            />;
        }

        if(pageSettings["Display Map Objectives (Assault)"] === "true"){

            elems[pageOrder["Display Map Objectives (Assault)"]] = <MapAssaultObjectives host={imageHost} 
                key={pageOrder["Display Map Objectives (Assault)"]}
                images={this.props.assaultImages} 
                mapName={Functions.cleanMapName(basic.name)} 
                objects={this.props.assaultObjectives} 
                mapPrefix={this.props.mapPrefix}
            />
        }

        if(pageSettings["Display Addicted Players"] === "true"){

            elems[pageOrder["Display Addicted Players"]] = <MapAddictedPlayers 
                key={pageOrder["Display Addicted Players"]}
                host={imageHost} 
                players={this.props.addictedPlayers} 
                playerNames={this.props.playerNames}
            />;
        }


        if(pageSettings["Display Longest Matches"] === "true"){

            elems[pageOrder["Display Longest Matches"]] = <div key={pageOrder["Display Longest Matches"]}>
                <div className="default-header">
                    Longest Matches
                </div>
                <MatchesTableView data={this.props.longestMatches} image={image}/>
            </div>
        }


        if(pageSettings["Display Recent Matches"] === "true"){

            elems[pageOrder["Display Recent Matches"]] = <div key={pageOrder["Display Recent Matches"]}>
                <div className="default-header" id="recent-matches">Recent Matches</div>
                <Pagination currentPage={this.props.page} results={basic.matches} pages={this.props.pages} perPage={this.props.perPage} url={`/map/${basic.id}?page=`} anchor={"#recent-matches"}/>

                <MatchesTableView data={matches} image={image}/>
            
            </div>
        }

        if(pageSettings["Display Combogib Records"] === "true"){

            elems[pageOrder["Display Combogib Records"]] = <CombogibMapRecords key="combo-records" mapId={basic.id}/>
        }

        return <div>
        <DefaultHead host={this.props.host} 
            title={`View ${Functions.removeUnr(basic.name)} Map Statistics`} 
            description={`${Functions.removeUnr(basic.name)} (${basic.title}) created by ${basic.author},
            total matches played ${basic.matches} since ${Functions.convertTimestamp(basic.first)}, last played ${Functions.convertTimestamp(basic.last)}`} 
            keywords={`map,statistics,${Functions.removeUnr(basic.name)}`}
            image={this.props.ogImage}
        />
        <main>
            <Nav settings={this.props.navSettings} session={this.props.session}/>
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        {Functions.removeUnr(basic.name)}
                    </div>
    
                    
                    {elems}

                </div>
            </div>
            <Footer session={this.props.session}/>
        </main>
    </div>

    }
}

function setTimeFrameValues(data, timeFrame, arrayLength, label){

    const values = [];
    const text = [];
    let total = 0;

    for(let i = 0; i < arrayLength; i++){
        values.push(0);
        text.push(`${i} - ${i + 1} ${label}${(i !== 1) ? "s" : ""} ago.`);
    }

    const now = Math.floor(new Date() * 0.001);

    let diff = 0;
    let d = 0;

    let index = 0;


    for(let i = 0; i < data.length; i++){

        d = data[i];

        diff = now - d;

        for(let x = 0; x < arrayLength; x++){

            index = Math.floor(diff / timeFrame);

            if(index === x){
                values[index]++;
                total++;
                break;
            }
        }
    }

    return {"data": (total === 0) ? [] : values, "total": total, "text": (total === 0) ? [] : text}
}

function createDatesData(data){

    const hourSeconds = 60 * 60;
    const daySeconds = (60 * 60) * 24; 

    const day = setTimeFrameValues(data, hourSeconds, 24, "Hour");
    const week = setTimeFrameValues(data, daySeconds, 7, "Day");
    const month = setTimeFrameValues(data, daySeconds, 28, "Day");
    const year = setTimeFrameValues(data, daySeconds, 365, "Day");

    return {
        "day": day,
        "week": week,
        "month": month,
        "year": year
    };

}

function getNamePrefix(name){

    name = name.toLowerCase();

    const reg = /^(.+?)-.+$/i;

    const result = reg.exec(name);

    if(result !== null){
        return result[1];
    }

    return 'dm';
}



export async function getServerSideProps({req, query}){

    try{

        const session = new Session(req);

        await session.load();

        const settings = new SiteSettings();
        const navSettings = await settings.getCategorySettings("Navigation");
        const pageSettings = await settings.getCategorySettings("Map Pages");
        const pageOrder = await settings.getCategoryOrder("Map Pages");
        const matchesSettings = await SiteSettings.getSettings("Matches Page");

        let mapId = 0;

        if(query.id !== undefined){

            mapId = parseInt(query.id);

            if(mapId !== mapId){
                mapId = 0;
            }
        }

        let perPage = parseInt(pageSettings["Recent Matches Per Page"]);

        let page = 1;

        if(query.page !== undefined){

            page = parseInt(query.page);

            if(page !== page){
                page = 1;
            }
        }


        let capPage = 1;

        if(query.capPage !== undefined){

            capPage = parseInt(query.capPage);

            if(capPage !== capPage) capPage = 1;
        }

        let capMode = 0;

        if(query.capMode !== undefined){

            capMode = parseInt(query.capMode);

            if(capMode !== capMode) capMode = 0;
        }

        
        const mapManager = new Maps(matchesSettings);

        let basicData = [];

        //if(pageSettings["Display Summary"] === "true"){
            basicData = await mapManager.getSingle(mapId);
        //}

        let image = null;

        if(basicData[0] !== undefined){
            image = await mapManager.getImage(mapManager.removeUnr(basicData[0].name));
        }else{
            basicData = [{"name": "Not Found"}];
            image = "/images/temp.jpg";
        }
        


        const longestMatch = await mapManager.getLongestMatch(mapId);


        basicData[0].longest = longestMatch.playtime;
        basicData[0].longestId = longestMatch.match;


        let matches = [];

        
        if(pageSettings["Display Recent Matches"] === "true"){
            matches = await mapManager.getRecent(mapId, page, perPage);
        }

        let longestMatches = [];

        if(pageSettings["Display Longest Matches"] === "true"){
            longestMatches = await mapManager.getLongestMatches(mapId, parseInt(pageSettings["Max Longest Matches"]));
        }
        
        for(let i = 0; i < matches.length; i++){
            matches[i].mapName = Functions.removeUnr(basicData[0].name);
        }

        for(let i = 0; i < longestMatches.length; i++){
            longestMatches[i].mapName = Functions.removeUnr(basicData[0].name);
        }

        

        const serverIds = Functions.getUniqueValues(matches, "server");
        const longestServerIds = Functions.getUniqueValues(longestMatches, "server");
        const gametypeIds = Functions.getUniqueValues(matches, "gametype");
        const longestGametypeIds = Functions.getUniqueValues(longestMatches, "gametype");


        for(let i = 0; i < longestServerIds.length; i++){
            Functions.insertIfNotExists(serverIds, longestServerIds[i]);
        }

        for(let i = 0; i < longestGametypeIds.length; i++){
            Functions.insertIfNotExists(gametypeIds, longestGametypeIds[i]);
        }


        const serverManager = new Servers();

        const serverNames = await serverManager.getNames(serverIds);
        Functions.setIdNames(matches, serverNames, "server", "serverName");
        Functions.setIdNames(longestMatches, serverNames, "server", "serverName");

        const gametypeManager = new Gametypes();
        const gametypeNames = await gametypeManager.getNames(gametypeIds);
        Functions.setIdNames(matches, gametypeNames, "gametype", "gametypeName");
        Functions.setIdNames(longestMatches, gametypeNames, "gametype", "gametypeName");


        let matchDates = [];
        let matchDatesData = [];


        if(pageSettings["Display Games Played"] === "true"){
            matchDates = await mapManager.getMatchDates(mapId);
            matchDatesData = createDatesData(matchDates);
        }

        let addictedPlayers = [];

        if(pageSettings["Display Addicted Players"] === "true"){
            addictedPlayers = await mapManager.getTopPlayersPlaytime(mapId, parseInt(pageSettings["Max Addicted Players"]));
        }

        const playerManager = new Players();

        const playerIds = Functions.getUniqueValues(addictedPlayers, "player");
        

        const playerNames = await playerManager.getNamesByIds(playerIds);

        let spawns = [];

        if(pageSettings["Display Spawn Points"] === "true"){
            spawns = await mapManager.getSpawns(mapId);
        }

        
        const mapPrefix = getNamePrefix(basicData[0].name);
        

        let flagLocations = [];
        let domControlPointLocations = [];
        let assaultObjectives = [];
        let assaultImages = [];

        if(mapPrefix === 'ctf'){

            const CTFManager = new CTF();

            flagLocations = await CTFManager.getFlagLocations(mapId);

        }else if(mapPrefix === 'dom'){

            if(pageSettings["Display Control Points (Domination)"] === "true"){
                const domManager = new Domination();

                domControlPointLocations = await domManager.getMapFullControlPoints(mapId);
            }

        }else if(mapPrefix === 'as'){

            if(pageSettings["Display Map Objectives (Assault)"] === "true"){
                const assaultManager = new Assault();

                assaultObjectives = await assaultManager.getMapObjectives(mapId);

                assaultImages = await assaultManager.getMapImages(Functions.cleanMapName(basicData[0].name));

            }
        }

        let pages = 1;
        
        basicData[0].matches = await mapManager.getTotalMatches(basicData[0].id);

        if(perPage !== 0 && basicData[0].matches !== 0){

            pages = Math.ceil(basicData[0].matches / perPage);
        }

        const ogImageReg = /^.+\/(.+)\.jpg$/i;
        const ogImageResult = ogImageReg.exec(image);

        let ogImage = "maps/default";

        if(ogImageResult !== null){
            ogImage = `maps/${ogImageResult[1]}`;
        }
        
        await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);
        return {
            props: {
                "host": req.headers.host,
                "basic": JSON.stringify(basicData[0]),
                "image": image,
                "matches": JSON.stringify(matches),
                "perPage": perPage,
                "pages": pages,
                "page": page,
                "dates": matchDatesData,
                "addictedPlayers": JSON.stringify(addictedPlayers),
                "playerNames": JSON.stringify(playerNames),
                "longestMatches": JSON.stringify(longestMatches),
                "spawns": JSON.stringify(spawns),
                "flagLocations": JSON.stringify(flagLocations),
                "mapPrefix": mapPrefix,
                "domControlPointLocations": JSON.stringify(domControlPointLocations),
                "assaultObjectives": JSON.stringify(assaultObjectives),
                "assaultImages": JSON.stringify(assaultImages),
                "ogImage": ogImage,
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": JSON.stringify(pageSettings),
                "pageOrder": JSON.stringify(pageOrder),
                "capPage": capPage,
                "capMode": capMode
            }
        };
    }catch(err){
        console.trace(err);
    }
}

export default Map;