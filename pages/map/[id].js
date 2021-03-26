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

class Map extends React.Component{

    constructor(props){

        super(props);
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
    
                    
                    <div className={`${styles.top} m-bottom-25`}>
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
                            </tbody>
                        </table>
                    </div>

                    <Graph title="Matches" data={
                        JSON.stringify([{"name": "Matches", "data": this.props.dates}])
                        }/>

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

function setTimeFrameValues(data, timeFrame, arrayLength){

    const values = [];
    let total = 0;

    for(let i = 0; i < arrayLength; i++){
        values.push(0);
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

    return {"data": values, "total": total}
}

function createDatesData(data){
    
    const allTime = [];

    const hourSeconds = 60 * 60;
    const daySeconds = (60 * 60) * 24;  
    const weekSeconds = daySeconds * 7;
    const monthSeconds = weekSeconds * 4;
    const yearSeconds = daySeconds * 365;

    const day = setTimeFrameValues(data, hourSeconds, 24);
    const week = setTimeFrameValues(data, daySeconds, 7);
    const month = setTimeFrameValues(data, daySeconds, 28);
    const year = setTimeFrameValues(data, daySeconds, 365);

    console.log(`day = ${daySeconds}, week = ${weekSeconds}, month = ${monthSeconds}, year = ${yearSeconds}`);

    const now = Math.floor(new Date() * 0.001);

    console.log(`now = ${now}`);

    console.log(`TotalDay = ${day.total}, totalWeek = ${week.total}, totalMonth = ${month.total}, totalYear = ${year.total}, allTime = $`);

    console.log(day);
    console.log(week);
    console.log(month);
    console.log(year);

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
    
    for(let i = 0; i < matches.length; i++){

        matches[i].mapName = Functions.removeUnr(basicData[0].name);
    }

    const serverIds = Functions.getUniqueValues(matches, "server");
    const gametypeIds = Functions.getUniqueValues(matches, "gametype");

    const serverManager = new Servers();

    const serverNames = await serverManager.getNames(serverIds);
    Functions.setIdNames(matches, serverNames, "server", "serverName");

    const gametypeManager = new Gametypes();
    const gametypeNames = await gametypeManager.getNames(gametypeIds);
    Functions.setIdNames(matches, gametypeNames, "gametype", "gametypeName");
    //console.log(matches);


   // console.log(await mapManager.getMatchDates(mapId));

    let matchDates = await mapManager.getMatchDates(mapId);

    createDatesData(matchDates);

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
            "dates": matchDates
        }
    };
}

export default Map;