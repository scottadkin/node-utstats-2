import styles from '../../styles/Map.module.css';
import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import Maps from '../../api/maps';
import Functions from '../../api/functions';
import Timestamp from '../../components/TimeStamp';
import Link from 'next/link';
import MatchesDefaultView from '../../components/MatchesDefaultView/';
import MatchesTableView from '../../components/MatchesTableView/';
import Servers from '../../api/servers';
import Gametypes from '../../api/gametypes';
import React from 'react';
import Pagination from '../../components/Pagination/';
import Graph from '../../components/Graph/';
import MapAddictedPlayer from '../../components/MapAddictedPlayer/';
import Players from '../../api/players';
import Faces from '../../api/faces';
import CTF from '../../api/ctf';
import Domination from '../../api/domination';
import MapControlPoints from '../../components/MapControlPoints/';
import MapSpawns from '../../components/MapSpawns/';

class Map extends React.Component{

    constructor(props){

        super(props);
        
    }

    getPlayerFace(faces, id){

        for(const [key, value] of Object.entries(faces)){

            if(parseInt(key) === id){
                return value.name;
            }
        }

        return 'faceless';

    }

    createAddicedPlayers(){

        const elems = [];

        let p = 0;

        const faceFiles = JSON.parse(this.props.faceFiles);

        const players = JSON.parse(this.props.addictedPlayers);
        const playerNames = JSON.parse(this.props.playerNames);
        let currentPlayer = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            currentPlayer = Functions.getPlayer(playerNames, p.player);
  
            elems.push(<MapAddictedPlayer key={i} name={currentPlayer.name} matches={p.matches} playtime={p.playtime}
                playerId={p.player} country={currentPlayer.country} longest={p.longest} longestId={p.longest_id} 
                face={this.getPlayerFace(faceFiles, currentPlayer.face)}
            />);
        }

        if(elems.length === 0){

            elems.push(
                <div key={"none"} className="not-found">No Player Data</div>
            );
        }

        return elems;
    }


    render(){

        const basic = JSON.parse(this.props.basic);
        const image = this.props.image;
        const matches = this.props.matches;

        return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        {Functions.removeUnr(basic.name)}
                    </div>
    
                    
                    <div className={`${styles.top} m-bottom-10`}>
                        <img onClick={(() =>{
                            const elem = document.getElementById("main-image");
                            elem.requestFullscreen();
                        })} className={styles.mimage} id="main-image" src={image} alt="image" />
                        <table className={styles.ttop}>
                            <tbody>
                                <tr>
                                    <td>Name</td>
                                    <td>{Functions.removeUnr(basic.name)}</td>
                                </tr>
                                <tr>
                                    <td>Title</td>
                                    <td>{basic.title}</td>
                                </tr>
                                <tr>
                                    <td>Author</td>
                                    <td>{basic.author}</td>
                                </tr>
                                <tr>
                                    <td>Ideal Player Count</td>
                                    <td>{basic.ideal_player_count}</td>
                                </tr>
                                <tr>
                                    <td>Level Enter Text</td>
                                    <td>{basic.level_enter_text}</td>
                                </tr>
                                <tr>
                                    <td>Total Matches</td>
                                    <td>{basic.matches}</td>
                                </tr>
                                <tr>
                                    <td>Total Playtime</td>
                                    <td>{parseFloat(basic.playtime / 60).toFixed(2)} Hours</td>
                                </tr>
                                <tr>
                                    <td>Longest Match</td>
                                    <td><Link href={`/match/${basic.longestId}`}><a>{Functions.MMSS(basic.longest)}</a></Link></td>
                                </tr>
                                <tr>
                                    <td>First Match</td>
                                    <td><Timestamp timestamp={basic.first} /></td>
                                </tr>
                                <tr>
                                    <td>Last Match</td>
                                    <td><Timestamp timestamp={basic.last} /></td>
                                </tr>
                                <tr>
                                    <td>Spawn Points</td>
                                    <td>{JSON.parse(this.props.spawns).length}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <MapSpawns spawns={this.props.spawns} mapPrefix={this.props.mapPrefix} flagLocations={this.props.flagLocations}/>

                    <MapControlPoints points={this.props.domControlPointLocations} mapPrefix={this.props.mapPrefix}/>

                    <div className="default-header">
                        Games Played
                    </div>
                    <Graph title={["Last 24 Hours", "Last 7 Days", "Last 28 Days", "Last 365 Days"]} data={JSON.stringify(
                        [
                            [{"name": "Matches", "data": this.props.dates.day.data}],
                            [{"name": "Matches", "data": this.props.dates.week.data}],
                            [{"name": "Matches", "data": this.props.dates.month.data}],
                            [{"name": "Matches", "data": this.props.dates.year.data}],
                        ])}
                        
                        text={
                            JSON.stringify([
                                this.props.dates.day.text,
                                this.props.dates.week.text,
                                this.props.dates.month.text,
                                this.props.dates.year.text,
                            ])
                        }
                        />

                    <div className="default-header">
                        Addicted Players
                    </div>
                    <div className="m-bottom-10">  
                        {this.createAddicedPlayers()} 
                    </div>

                    <div className="default-header">
                        Longest Matches
                    </div>

                        <MatchesDefaultView data={this.props.longestMatches} image={image}/>


                    <div className="default-header">Recent Matches</div>
                    <Pagination currentPage={this.props.page} results={basic.matches} pages={this.props.pages} perPage={this.props.perPage} url={`/map/${basic.id}?page=`}/>
                    <div className={styles.recent}>
                        <MatchesDefaultView data={matches} image={image}/>
                    </div>
                    
                </div>
            </div>
            <Footer />
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

    return {"data": values, "total": total, "text": text}
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



export async function getServerSideProps({query}){


    let mapId = 0;

    if(query.id !== undefined){

        mapId = parseInt(query.id);

        if(mapId !== mapId){
            mapid = 0;
        }
    }

    let perPage = 25;

    if(query.perPage !== undefined){

        perPage = parseInt(query.perPage);

        if(perPage !== perPage){
            perPage = 25;
        }

        if(perPage < 1 || perPage > 100){

            perPage = 25;
        }
    }

    let page = 1;

    if(query.page !== undefined){

        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }
    }

    const mapManager = new Maps();

    let basicData = await mapManager.getSingle(mapId);

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


    const matches = await mapManager.getRecent(mapId, page, perPage);
    const longestMatches = await mapManager.getLongestMatches(mapId, 5);
    
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


    const matchDates = await mapManager.getMatchDates(mapId);
    const matchDatesData = createDatesData(matchDates);
    const addictedPlayers = await mapManager.getTopPlayersPlaytime(mapId, 5);

    const playerManager = new Players();

    const playerIds = Functions.getUniqueValues(addictedPlayers, "player");
    

    const playerNames = await playerManager.getNamesByIds(playerIds);
    const faceIds = Functions.getUniqueValues(playerNames, "face");

    const faceManager = new Faces();

    const faceFiles = await faceManager.getFacesWithFileStatuses(faceIds);

    const spawns = await mapManager.getSpawns(mapId);

    
    const mapPrefix = getNamePrefix(basicData[0].name);
    

    let flagLocations = [];
    let domControlPointLocations = [];

    if(mapPrefix === 'ctf'){

        const CTFManager = new CTF();

        flagLocations = await CTFManager.getFlagLocations(mapId);

    }else if(mapPrefix === 'dom'){

        const domManager = new Domination();

        domControlPointLocations = await domManager.getMapFullControlPoints(mapId);

    }


    let pages = 1;

    if(perPage !== 0 && basicData[0].matches !== 0){

        pages = Math.ceil(basicData[0].matches / perPage);
    }

    return {
        props: {
            "basic": JSON.stringify(basicData[0]),
            "image": image,
            "matches": JSON.stringify(matches),
            "perPage": perPage,
            "pages": pages,
            "page": page,
            "dates": matchDatesData,
            "addictedPlayers": JSON.stringify(addictedPlayers),
            "playerNames": JSON.stringify(playerNames),
            "faceFiles": JSON.stringify(faceFiles),
            "longestMatches": JSON.stringify(longestMatches),
            "spawns": JSON.stringify(spawns),
            "flagLocations": JSON.stringify(flagLocations),
            "mapPrefix": mapPrefix,
            "domControlPointLocations": JSON.stringify(domControlPointLocations)
        }
    };
}

export default Map;