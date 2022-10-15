
import styles from './MapSummary.module.css';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import Image from 'next/image';
import TableHeader from '../TableHeader';


const MapSummary = ({basic, spawns, imageHost, image}) =>{

    const totalSpawns = JSON.parse(spawns).length;

    return <div className={`${styles.wrapper}`}>
        <TableHeader width={2}>{Functions.removeUnr(basic.name)} Summary</TableHeader>
        <div className={`${styles.image} t-width-2 center`}>
            <Image id="main-image" src={`/${image}`} alt="Map image" width={1920} height={1080} onClick={(() =>{
            const elem = document.getElementById("main-image");
            elem.requestFullscreen();
        })}/>
        </div>
        <Table2 width={2}>
            <tr>
                <td>Title</td>
                <td>{basic.title}</td>   
            </tr>
            <tr>
                <td>Author</td>
                <td>{basic.author}</td>   
            </tr>
            <tr>
                <td>Level Enter Text</td>
                <td>{basic.level_enter_text}</td>   
            </tr>
            <tr>
                <td>Ideal Player Count</td>
                <td>{basic.ideal_player_count}</td>   
            </tr>
            <tr>
                <td>First Match</td>
                <td>{Functions.convertTimestamp(basic.first, true)}</td>   
            </tr>
            <tr>
                <td>Lastest Match</td>
                <td>{Functions.convertTimestamp(basic.last, true)}</td>   
            </tr>
            <tr>
                <td>Total Matches</td>
                <td>{basic.matches}</td>   
            </tr>
            <tr>
                <td>Total Playtime</td>
                <td>{Functions.toHours(basic.playtime)} Hours</td>   
            </tr>
            <tr>
                <td>Total Spawns</td>
                <td>{totalSpawns}</td>   
            </tr>
        </Table2>
    </div>
}


export default MapSummary;