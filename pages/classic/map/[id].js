import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Maps from '../../../api/classic/maps';
import MainMaps from '../../../api/maps';
import styles from '../../../styles/CMap.module.css';
import Image from 'next/image';
import Functions from '../../../api/functions';
import React from 'react';
import MapRecentMatches from '../../../components/classic/MapRecentMatches';


const MapPage = ({session, host, page, perPage, pages, title, image, generalStats, matches, totalMatches}) =>{

    generalStats = JSON.parse(generalStats);

    matches = JSON.parse(matches);

    const rows = [];

    const createRow = (title, value, teamColor) =>{

        const color = (teamColor !== undefined) ? `team-${teamColor}` : null;

        rows.push(<tr key={rows.length}>
            <td className={`${color} yellow`}>{title}</td>
            <td className={color}>{value}</td>
        </tr>);
    }

    createRow("First Match", Functions.convertTimestamp(Functions.utDate(generalStats.first_match)));
    createRow("Last Match", Functions.convertTimestamp(Functions.utDate(generalStats.last_match)));
    createRow("Matches", generalStats.total_matches);
    createRow("Playtime", Functions.toHours(generalStats.gametime).toFixed(2));
    createRow("Longest Match", Functions.MMSS(generalStats.longest_match));
    createRow("Average Length", Functions.MMSS(generalStats.average_gametime));
    createRow("Total Frags", generalStats.total_frags);
    createRow("Total Kills", generalStats.total_kills);
    createRow("Total Suicides", generalStats.total_suicides);
    createRow("Total Team Kills", generalStats.total_teamkills);

    if(generalStats.red_team) createRow("Max Red Score", generalStats.red_max_score, "red");
    if(generalStats.blue_team) createRow("Max Blue Score", generalStats.blue_max_score, "blue");
    if(generalStats.green_team) createRow("Max Green Score", generalStats.green_max_score, "green");
    if(generalStats.yellow_team) createRow("Max Yellow Score", generalStats.yellow_max_score, "yellow");

    return <div>
        <Head host={host} title={`page title`} 
        description={`page desc`} 
        keywords={`,classic`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">{title}</div>
                 
                    <img className="t-width-2" src={image} alt="image" 
                    
                        onClick={(e) =>{
                            e.target.requestFullscreen();
                        }}
                    />
                  
                    <table className="t-width-2 td-1-left m-bottom-25">
                        <tbody>
                            {rows}
                        </tbody>
                    </table>

                    <MapRecentMatches id="matches" data={matches} page={page} perPage={perPage} pages={pages} mapName={title} totalMatches={totalMatches}/>
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>

}


export async function getServerSideProps({req, query}) {

    let page = (query.page !== undefined) ? parseInt(query.page) : 1;
    if(page !== page) page = 1;
    page--;

    const perPage = 25;

    const session = new Session(req);
    await session.load();

    console.log(query);

    const title = decodeURIComponent(query.id);

    const mainMapsManager = new MainMaps();
    const image = await mainMapsManager.getImage(title);

    const mapManager = new Maps();

    const generalStats = await mapManager.getStats(title);

    const matches = await mapManager.getRecentMatches(`${title}.unr`, page, perPage);
    const totalMatches = await mapManager.getTotalMatches(`${title}.unr`);
    

    const pages = (totalMatches > 0 && perPage > 0) ? Math.ceil(totalMatches / perPage) : 1;

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "title": title,
            "image": image,
            "generalStats": JSON.stringify(generalStats),
            "matches": JSON.stringify(matches),
            "page": page,
            "perPage": perPage,
            "totalMatches": totalMatches,
            "pages": pages
        }
    };
}


export default MapPage;