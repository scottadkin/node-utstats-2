import Functions from "../../../api/functions";
import CountryFlag from '../../CountryFlag';
import Link from 'next/link';
import styles from './RankingTable.module.css';
import MouseHoverBox from '../../MouseHoverBox';
import Pagination from '../../Pagination';

const RankingTable = ({gametypeId, title, data, page, perPage, players, showAllButton, totalResults, pages}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        

        const place = i + (page * perPage) + 1;

        const defaultPlayer = {"name": "Not Found", "country": "xx"};

        let player = {};

        if(d.name !== undefined){
            player = {"name": d.name, "country": d.country};
        }else{
            player = (players[d.pid] !== undefined) ? players[d.pid] : defaultPlayer;
        }

       // const player = (players[d.pid] !== undefined) ? players[d.pid] : {"name": "Not Found", "country": "xx"};

        const icon = (d.prevrank < d.rank) ? "up" : (d.prevrank === d.rank) ? "nc" : "down";

        let rankingString = `No change in previous match.`;

        const rankDiff = Math.abs(d.prevrank - d.rank).toFixed(2);

        if(icon === "up"){
            rankingString = `${player.name} gained ${rankDiff} points in their last match.`;
        }else{
            rankingString = `${player.name} lost ${rankDiff} points in their last match.`;
        }

        rows.push(<tr key={i}>
            <td className="yellow">{place}{Functions.getOrdinal(place)}</td>
            <td>
                <Link href={`/classic/player/${d.pid}`}>
                    <a>
                        <CountryFlag country={player.country}/>{player.name}
                    </a>
                </Link>
            </td>
            <td>
                <img className="ranking-icon" src={`/images/${icon}.png`} alt="icon"/> 
                <MouseHoverBox title="Ranking Change" content={rankingString} display={d.rank.toFixed(2)}/>
            </td>
        </tr>);
    }

    let showAllElem = null;

    if(!showAllButton){

        showAllElem = <Pagination currentPage={page + 1} perPage={perPage} pages={pages} results={totalResults} url={`/classic/rankings/${gametypeId}?page=`}/>

    }else{

        showAllElem = <Link href={`/classic/rankings/${gametypeId}`}>
            <a>
                <div className={styles.viewall}>
                    <img className="ranking-icon" src="/images/up.png" alt="image"/>
                    Show all {totalResults} Results <img className="ranking-icon" src="/images/down.png" alt="image"/>
                </div>
            </a>
        </Link>;

    }

   

    return <div className="m-bottom-25">

        {(!showAllButton) ? null : <div className="default-subheader m-bottom-25">{title}</div>}

        {(!showAllButton) ? showAllElem : null}
        <table className={`t-width-2 ${styles.table} m-bottom-25`}>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
        {showAllElem}
    </div>
}

export default RankingTable;