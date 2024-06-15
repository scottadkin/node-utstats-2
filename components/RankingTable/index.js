import styles from './RankingTable.module.css';
import MouseHoverBox from '../MouseHoverBox/';
import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Pagination from '../../components/Pagination/';
import Image from 'next/image';
import Table2 from '../Table2';
import { convertTimestamp, toPlaytime, getOrdinal } from '../../api/generic.mjs';

const RankingTable = ({host, gametypeId, title, data, page, perPage, results, bDisplayPagination, mode}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const rChangeS = parseFloat(d.ranking_change.toFixed(2));

        const changeString = (rChangeS > 0) ? `${d.name} gained ${rChangeS} points` : 
        (rChangeS == 0) ? `No change` : `${d.name} lost ${rChangeS} points`

        let currentImage = 0;
        if(rChangeS > 0){
            currentImage = "/images/up.png";
        }else if(rChangeS < 0){
            currentImage = "/images/down.png";
        }else{
            currentImage = "/images/nochange.png";
        }


        const position = (page * perPage) + i + 1;

        rows.push(<tr key={i}>
            <td className="place">{position}{getOrdinal(position)}</td>
            <td className="text-left"><Link href={`/player/${d.player_id}`}><CountryFlag country={d.country} host={host}/> {d.name}</Link></td>
            <td className="playtime">{convertTimestamp(d.last_active, true, true)}</td>
            <td className="playtime">{toPlaytime(d.playtime)}</td>
            <td><Image className={styles.icon} src={currentImage} width={12} height={12} alt="image"/> <MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={changeString} 
                    display={d.ranking.toFixed(2)} />
            </td>
        </tr>);
    }

    if(rows.length === 0){
        rows.push(<tr key="0">
            <td colSpan="4" className="small-font grey">No Data</td>     
        </tr>);
    }

    let pages = Math.ceil(results / perPage);

    return <div>
        <div className="default-header">{title} {(mode === 0) ? "" : "Rankings"}</div>
        <Table2 width={4}>
            <tr>
                <th>Place</th>
                <th>Player</th>
                <th>Last Active</th>
                <th>Playtime</th>
                <th>Ranking</th>
            </tr>
            {rows}
        </Table2>
        
        {(bDisplayPagination) ? <Pagination currentPage={page + 1} perPage={perPage} results={results} pages={pages} url={`/rankings/${gametypeId}?page=`}/> : 
        <Link href={`/rankings/${gametypeId}`}><div className={`${styles.viewall} center`}>
            View all {results} players
        </div></Link>
        }
    </div>
}


export default RankingTable;