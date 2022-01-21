
import styles from './MapSummary.module.css';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import Link from 'next/link';

const MapSummary = ({basic, spawns, imageHost, image}) =>{

    return <div className={`${styles.top} m-bottom-10`}>
        <img onClick={(() =>{
            const elem = document.getElementById("main-image");
            elem.requestFullscreen();
        })} className={styles.mimage} id="main-image" src={`${imageHost}${image}`} alt="image" />
        <Table2 width={1}>
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
                <td>{parseFloat(basic.playtime / (60 * 60)).toFixed(2)} Hours</td>
            </tr>
            <tr>
                <td>Longest Match</td>
                <td><Link href={`/match/${basic.longestId}`}><a>{Functions.MMSS(basic.longest)}</a></Link></td>
            </tr>
            <tr>
                <td>First Match</td>
                <td>{Functions.convertTimestamp(basic.first, true)}</td>
            </tr>
            <tr>
                <td>Last Match</td>
                <td>{Functions.convertTimestamp(basic.last, true)}</td>
            </tr>
            <tr>
                <td>Spawn Points</td>
                <td>{JSON.parse(spawns).length}</td>
            </tr>
        </Table2>
    </div>
}

export default MapSummary;