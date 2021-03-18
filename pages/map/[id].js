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


    const matches = await mapManager.getRecent(mapId, 1, 50);
    
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
            "page": page
        }
    };
}

export default Map;