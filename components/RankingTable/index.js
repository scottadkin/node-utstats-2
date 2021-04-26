import styles from './RankingTable.module.css';
import MouseHoverBox from '../MouseHoverBox/';
import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import Pagination from '../../components/Pagination/';

const RankingTable = ({gametypeId, title, data, page, perPage, results, bDisplayPagination}) =>{

    const rows = [];

    let d = 0;

    let currentImage = 0;

    let changeString = "";
    let rChangeS = 0;

    let position = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        rChangeS = parseFloat(d.ranking_change.toFixed(2));

        changeString = (rChangeS > 0) ? `${d.name} gained ${rChangeS} points` : 
        (rChangeS == 0) ? `No change` : `${d.name} lost ${rChangeS} points`

        if(rChangeS > 0){
            currentImage = "/images/up.png";
        }else if(rChangeS < 0){
            currentImage = "/images/down.png";
        }else{
            currentImage = "/images/nochange.png";
        }


        position = (page * perPage) + i + 1;

        rows.push(<tr key={i}>
            <td>{position}{Functions.getOrdinal(position)}</td>
            <td><Link href={`/player/${d.player_id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
            <td>{d.matches}</td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td><img className={styles.icon} src={currentImage} alt="image"/><MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={changeString} 
                    display={d.ranking.toFixed(2)} />
            </td>
        </tr>);
    }

    let pages = Math.ceil(results / perPage);

    return <div>
        <div className="default-header">{title}</div>
        <table className={`${styles.table} m-bottom-25`}>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                    <th>Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
        {(bDisplayPagination) ? <Pagination currentPage={page + 1} perPage={perPage} results={results} pages={pages} url={`/rankings/${gametypeId}?page=`}/> : 
        <Link href={`/rankings/${gametypeId}`}><a><div className={`${styles.viewall} center`}>
            <img className={styles.icon} src="/images/up.png" alt="image"/>View all {results} players<img src="/images/down.png" className={`${styles.icon} ${styles.mleft5}`} alt="image"/>
        </div></a></Link>
        }
    </div>
}


export default RankingTable;