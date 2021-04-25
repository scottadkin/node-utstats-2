import styles from './RankingTable.module.css';
import MouseHoverBox from '../MouseHoverBox/';
import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';

const RankingTable = ({title, data}) =>{

    const rows = [];

    let d = 0;

    let currentImage = 0;

    let changeString = "";
    let rChangeS = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.ranking_change > 0){
            currentImage = "/images/up.png";
        }else if(d.ranking_change < 0){
            currentImage = "/images/down.png";
        }else{
            currentImage = "/images/nochange.png";
        }


        rChangeS = d.ranking_change.toFixed(2);

        changeString = (d.ranking_change > 0) ? `Player gained ${rChangeS} points` : 
        (d.ranking_change == 0) ? `No change` : `Player lost ${rChangeS} points`

        rows.push(<tr key={i}>
            <td>{i+1}{Functions.getOrdinal(i + 1)}</td>
            <td><Link href={`/player/${d.player_id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
            <td>{d.matches}</td>
            <td><img className={styles.icon} src={currentImage} alt="image"/><MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={changeString} 
                    display={d.ranking.toFixed(2)} />
            </td>
        </tr>);
    }

    return <div>
        <div className="default-header">{title}</div>
        <table className={styles.table}>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Matches</th>
                    <th>Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}


export default RankingTable;