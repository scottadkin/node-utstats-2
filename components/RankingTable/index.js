import styles from './RankingTable.module.css';
import MouseHoverBox from '../MouseHoverBox/';
import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import Pagination from '../../components/Pagination/';
import Image from 'next/image';
import Table2 from '../Table2';
import Playtime from '../Playtime';

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
            <td className="place">{position}{Functions.getOrdinal(position)}</td>
            <td className="text-left"><Link href={`/player/${d.player_id}`}><a><CountryFlag country={d.country} host={host}/> {d.name}</a></Link></td>
      
            <td className="playtime"><Playtime timestamp={d.playtime}/></td>
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
                <th>Playtime</th>
                <th>Ranking</th>
            </tr>
            {rows}
        </Table2>
        
        {(bDisplayPagination) ? <Pagination currentPage={page + 1} perPage={perPage} results={results} pages={pages} url={`/rankings/${gametypeId}?page=`}/> : 
        <Link href={`/rankings/${gametypeId}`}><a><div className={`${styles.viewall} center`}>
            View all {results} players
        </div></a></Link>
        }
    </div>
}


export default RankingTable;