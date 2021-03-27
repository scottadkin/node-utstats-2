import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import styles from './MapAddictedPlayer.module.css';
import Functions from '../../api/functions';

const MapAddictedPlayer = ({name, playerId, matches, playtime, country, longest, longestId}) =>{

    return <tr>
        <td className="text-left"><CountryFlag country={country}/> <Link href={`/player/${playerId}`}><a>{name}</a></Link></td>
        <td>{matches}</td>
        <td><Link href={`/match/${longestId}`}><a>{Functions.MMSS(longest)}</a></Link></td>
        <td>{(playtime / (60 * 60)).toFixed(2)} Hours</td>
    </tr>

}


export default MapAddictedPlayer;