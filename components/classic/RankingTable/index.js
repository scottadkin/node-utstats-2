import Functions from "../../../api/functions";
import CountryFlag from '../../CountryFlag';
import Link from 'next/link';
import styles from './RankingTable.module.css';
import MouseHoverBox from '../../MouseHoverBox';

const RankingTable = ({title, data, page, perPage, players}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        const place = i + (page * perPage) + 1;

        const player = (players[d.pid] !== undefined) ? players[d.pid] : {"name": "Not Found", "country": "xx"};

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
                <Link href={`/player/${d.pid}`}>
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

    return <div className="m-bottom-25">
        <div className="default-subheader m-bottom-25">{title}</div>
        <table className={`t-width-2 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default RankingTable;