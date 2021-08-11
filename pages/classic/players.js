import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';
import Players from '../../api/classic/players';
import CountryFlag from '../../components/CountryFlag';
import Link from 'next/link';
import Pagination from '../../components/Pagination';
import React from 'react';


class PlayersPage extends React.Component{

    constructor(props){

        super(props);

    }

    getOrder(type){

        type = type.toLowerCase();
        const mode = this.props.mode.toLowerCase();

        if(type === mode){
            if(this.props.order === "a") return "b";
            return "a";
        }

        return "a";
    
    }

    getCleanModeName(){

        const mode = this.props.mode.toLowerCase();

        if(mode === "player"){
            return "Name";
        }else if(mode === "hours"){
            return "Total Playtime";
        }else if(mode === "matches"){
            return "Total Matches";
        }else if(mode === "score"){
            return "Total Score";
        }else if(mode === "frags"){
            return "Total Frags";
        }else if(mode === "deaths"){
            return "Total Deaths";
        }else if(mode === "kills"){
            return "Total Kills";
        }else if(mode === "eff"){
            return "Efficiency";
        }

        return "Not Found";
    }

    getOrderedBy(){

        const order = this.props.order.toLowerCase();

        if(order === "a") return "Ascending";
        return "Descending";
    }

    render(){

        const host = this.props.host;
        const session = this.props.session;
        const data = JSON.parse(this.props.data);
        const totalPlayers = this.props.totalPlayers;
        const perPage = this.props.perPage;
        const pages = this.props.pages;
        const page = this.props.page;
        const mode = this.props.mode;
        const order = this.props.order;

        const rows = [];

        let d = 0;


        for(let i = 0; i < data.length; i++){

            d = data[i];

            rows.push(<tr key={i} >
                <td><Link href={`/classic/player/${d.pid}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
                <td>{d.total_matches}</td>
                <td>{d.gamescore}</td>
                <td>{d.frags}</td>
                <td>{d.kills}</td>
                <td>{d.deaths}</td>
                <td>{d.eff.toFixed(2)}%</td>
                <td>{(d.gametime / (60 * 60)).toFixed(2)}</td>
            </tr>);
        }

        const url = `/classic/players/?mode=${mode}&order=${order}&page=`;

        const orderedBy = this.getOrderedBy();
        const cleanModeName = this.getCleanModeName();


        let tableClassName = `t-width-1 td-1-left td-1-150 m-bottom-25`;

        if(rows.length === 0){

            tableClassName = `t-width-1 text-center td-1-150 m-bottom-25`;

            rows.push(<tr key={1}>
                <td colSpan={8}>No data found.</td>
            </tr>);
        }
        
        return <div>
            <Head host={host} title={`Players sorted by ${cleanModeName} (${orderedBy} order)`} 
            description={`View a list of all players sorted by ${cleanModeName} (${orderedBy} order), see how you compare against the ${totalPlayers} saved players in the database.`} 
            keywords={`players,classic,match,list,${orderedBy},${cleanModeName}`}/>
            <main>
                <Nav />
                <div id="content">

                    <div className="default">
                        <div className="default-header">Players</div>
                        <Pagination currentPage={page} results={totalPlayers} perPage={perPage} pages={pages} url={url}/>
                        <div className="default-sub-header">
                            Players sorted by <span className="yellow">{cleanModeName}</span> {orderedBy} order
                        </div>
                        <table className={tableClassName}>
                            <tbody>
                                <tr>
                                    <th><Link href={`/classic/players/?mode=player&order=${this.getOrder("player")}`}><a>Player</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=matches&order=${this.getOrder("matches")}`}><a>Matches</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=score&order=${this.getOrder("score")}`}><a>Score</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=frags&order=${this.getOrder("frags")}`}><a>Frags</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=kills&order=${this.getOrder("kills")}`}><a>Kills</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=deaths&order=${this.getOrder("deaths")}`}><a>Deaths</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=eff&order=${this.getOrder("eff")}`}><a>Efficiency</a></Link></th>
                                    <th><Link href={`/classic/players/?mode=hours&order=${this.getOrder("hours")}`}><a>Hours</a></Link></th>
                                </tr>
                                {rows}
                            </tbody>
                        </table>
                        <Pagination currentPage={page} results={totalPlayers} perPage={perPage} pages={pages} url={url}/>
                    </div>
                </div>
                
                <Footer session={session}/>
            </main>
        </div>

    }
}


export async function getServerSideProps({req, query}) {

    const session = new Session(req);

    await session.load();

    const defaultPerPage = 25;

    let perPage = 25;
    let page = 1;
    let mode = "player";
    let order = "d";

    if(query.page !== undefined){
        page = query.page;
    }

    if(page !== page) page = 1;

    if(query.mode !== undefined){
        mode = query.mode.toLowerCase();
    }

    if(query.order !== undefined){
        order = query.order.toLowerCase();
    }



    const playerManager = new Players();

    let data = [];

    const validTypes = ["total_matches","gamescore","frags","kills","deaths","eff","gametime","player"];

    let totalPlayers = 0;

    if(validTypes.indexOf(mode) !== -1){
     

        if(mode === "player"){
            data = await playerManager.getDefaultPlayers(page, perPage, (order === "a") ? false : true);
        }else{
            data = await playerManager.getPlayersInOrderOf(mode, order, page, perPage);
        }

        totalPlayers = await playerManager.getTotalPlayers();
    }

    
    
    let pages = 1;

    if(totalPlayers > 0 && perPage > 0){

        pages = Math.ceil(totalPlayers / perPage);
    }



    

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data),
            "totalPlayers": totalPlayers,
            "perPage": perPage,
            "pages": pages,
            "page": page,
            "mode": mode,
            "order": order
        }
    };
}


export default PlayersPage;