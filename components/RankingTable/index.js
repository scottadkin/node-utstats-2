import styles from './RankingTable.module.css';
import MouseHoverBox from '../MouseHoverBox/';
import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import Pagination from '../../components/Pagination/';
import Image from 'next/image';

const RankingTable = ({host, gametypeId, title, data, page, perPage, results, bDisplayPagination, mode}) =>{

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
            <td><Link href={`/player/${d.player_id}`}><a><CountryFlag country={d.country} host={host}/> {d.name}</a></Link></td>
            <td>{d.matches}</td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td><Image className={styles.icon} src={currentImage} width={12} height={12} alt="image"/> <MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={changeString} 
                    display={d.ranking.toFixed(2)} />
            </td>
        </tr>);
    }

    let pages = Math.ceil(results / perPage);

    return <div>
        <div className="default-header">{title} {(mode === 0) ? "" : "Rankings"}</div>
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
            <Image className={styles.icon} src="/images/up.png" width={16} height={16} alt="image"/> View all {results} players <Image src="/images/down.png" width={16} height={16} className={`${styles.icon} ${styles.mleft5}`} alt="image"/>
        </div></a></Link>
        }
    </div>
}


export default RankingTable;