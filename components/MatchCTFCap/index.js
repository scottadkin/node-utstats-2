import styles from './MatchCTFCap.module.css';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';
import MatchResultSmall from '../MatchResultSmall';

const MatchCTFCap = ({team, grabPlayer, grabTime, capPlayer, capTime, 
    coverPlayers, dropTime, travelTime, assistPlayers, totalTeams, teamScores}) =>{

    const coverElems = [];
    const assistElems = [];

    const teamColor = Functions.getTeamColor(team);

    for(let i = 0; i < coverPlayers.length; i++){

        const c = coverPlayers[i];

        coverElems.push(<div key={i} className={styles.player}>
            <CountryFlag country={c.player.country}/>{c.player.name} <span className="yellow">x<b>{c.covers}</b></span>
        </div>);
    }

    for(let i = 0; i < assistPlayers.length; i++){

        const c = assistPlayers[i];

        assistElems.push(<div key={i} className={styles.player}>
            <CountryFlag country={c.country}/>{c.name}
        </div>);
    }

    dropTime = (dropTime > 0) ? `${dropTime.toFixed(2)} Secs` : "None";

    return <div className={styles.wrapper}>
        <div className={`${styles.title} ${Functions.getTeamColor(team)}`}>{Functions.getTeamName(team)} Scored!</div>
        <div className={styles.scores}>
            <MatchResultSmall totalTeams={totalTeams} redScore={teamScores[0]} blueScore={teamScores[1]}
                greenScore={teamScores[2]} yellowScore={teamScores[3]} dmWinner="" bMonsterHunt={false}
            />
        </div>
        <div className={styles.grab}><div className={styles.label}>Taken By</div> <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}</div>
        <div className={styles.ca}>
            <div className={styles.p1}>
                <div className={styles.label}>Covers</div>
                <div className={styles.pwrapper}>
                    {coverElems}
                </div>
            </div>
            <div className={styles.p1}>
                <div className={styles.label}>Assists</div>
                <div className={styles.pwrapper}>
                    {assistElems}
                </div>
            </div>
        </div>
        <div className={styles.grab}><div className={styles.label}>Capped By</div> <CountryFlag country={capPlayer.country}/>{capPlayer.name}</div>
        <div className={styles.times}>
            <div>
                <div className={styles.label}>Travel Time</div><br/>
                {travelTime}

            </div>
            <div>
            <div className={styles.label}>Time Dropped</div><br/>
                {dropTime}
            </div>
        </div>
    </div>

   /* return <tr>
        <td className={`${teamColor} text-left`}><span className={styles.timestamp}>{Functions.MMSS(grabTime)}</span><CountryFlag country={grabPlayer.country}/>{grabPlayer.name}</td>
        <td className="text-left">{coverElems}</td>
        <td className="text-left">{assistElems}</td>
        <td className={`${teamColor} text-left`}><span className={styles.timestamp}>{Functions.MMSS(capTime)}</span><CountryFlag country={capPlayer.country}/>{capPlayer.name}</td>
        <td>{travelTime.toFixed(2)} Secs</td>
        <td>{dropTime}</td>
    </tr>*/

}

export default MatchCTFCap;