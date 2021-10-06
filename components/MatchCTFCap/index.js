import styles from './MatchCTFCap.module.css';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';

const MatchCTFCap = ({team, grabPlayer, grabTime, capPlayer, capTime, coverPlayers, dropTime, travelTime, assistPlayers}) =>{

    const coverElems = [];
    const assistElems = [];

    const teamColor = Functions.getTeamColor(team);

    for(let i = 0; i < coverPlayers.length; i++){

        const c = coverPlayers[i];

        coverElems.push(<div>
            <CountryFlag country={c.player.country}/>{c.player.name} <span className="yellow">x<b>{c.covers}</b></span>
        </div>);
    }

    for(let i = 0; i < assistPlayers.length; i++){

        const c = assistPlayers[i];

        assistElems.push(<div>
            <CountryFlag country={c.country}/>{c.name}
        </div>);
    }

    dropTime = (dropTime > 0) ? `${dropTime.toFixed(2)} Secs` : "";

    return <tr>
        <td className={`${teamColor} text-left`}><span className={styles.timestamp}>{Functions.MMSS(grabTime)}</span><CountryFlag country={grabPlayer.country}/>{grabPlayer.name}</td>
        <td className="text-left">{coverElems}</td>
        <td className="text-left">{assistElems}</td>
        <td className={`${teamColor} text-left`}><span className={styles.timestamp}>{Functions.MMSS(capTime)}</span><CountryFlag country={capPlayer.country}/>{capPlayer.name}</td>
        <td>{travelTime.toFixed(2)} Secs</td>
        <td>{dropTime}</td>
    </tr>

}

export default MatchCTFCap;