import styles from './MatchCTFCap.module.css';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';
import MatchResultSmall from '../MatchResultSmall';

const MatchCTFCap = ({team, grabPlayer, grabTime, capPlayer, capTime, 
    coverPlayers, dropTime, travelTime, carryTime, assistPlayers, totalTeams, 
    teamScores, selfCovers}) =>{

    const coverElems = [];
    const assistElems = [];
    const selfCoverElems = [];

    for(let i = 0; i < coverPlayers.length; i++){

        const c = coverPlayers[i];

        coverElems.push(<tr key={i}>
            <td><CountryFlag country={c.player.country}/>{c.player.name}</td> 
            <td>{c.covers}</td>
        </tr>);
    }

    for(let i = 0; i < assistPlayers.length - 1; i++){

        const c = assistPlayers[i];

        const carryPercent = (c.carryTime > 0) ? (c.carryTime / carryTime) * 100 : 0;
        
        assistElems.push(<tr key={i}>
            <td><CountryFlag country={c.player.country}/>{c.player.name}</td>
            <td>{parseFloat(c.carryTime).toFixed(2)} Secs <span className={styles.carryp}>({carryPercent.toFixed(2)}%)</span></td>
        </tr>);
    }

    for(let i = 0; i < selfCovers.length; i++){

        const s = selfCovers[i];

        selfCoverElems.push(<tr key={i}>
            <td><CountryFlag country={s.player.country}/>{s.player.name}</td>
            <td>{s.kills}</td>
        </tr>);
    }

    dropTime = (dropTime > 0) ? `${dropTime.toFixed(2)} Seconds` : "None";

    if(assistElems.length === 0){
        assistElems.push(<tr key="an"><td colSpan="2">None</td></tr>);
    }

    if(coverElems.length === 0){
        coverElems.push(<tr key="cn"><td colSpan="2">None</td></tr>);
    }

    const capCarryTime = assistPlayers[assistPlayers.length - 1].carryTime;
    const capCarryPercent = (parseFloat(capCarryTime) / carryTime) * 100;



    const coverAssistsElem = <div className={styles.ca}>
            <div className={styles.p1}>
                <div className={styles.label2}>Covers</div>
                <div className={styles.pwrapper}>
                    <table className={styles.table}>
                        <tbody>
                            {coverElems}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={styles.p1}>
                <div className={styles.label2}>Assists</div>
                <div className={styles.pwrapper}>
                    <table className={styles.table}>
                        <tbody>
                            {assistElems}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>;
  
    const selfCoverElem = (selfCoverElems.length === 0) ? null : <div className={styles.scovers}>
        <div className={styles.label2}>Kills While Carrying Flag</div>
        <table className="t-width-2">
            <tbody>
                {selfCoverElems}
            </tbody>
        </table>
    </div>;


    return <div className={styles.wrapper}>
        <div className={`${styles.title} ${Functions.getTeamColor(team)}`}>{Functions.getTeamName(team)} Scored!</div>
        <div className={styles.scores}>
            <MatchResultSmall totalTeams={totalTeams} redScore={teamScores[0]} blueScore={teamScores[1]}
                greenScore={teamScores[2]} yellowScore={teamScores[3]} dmWinner="" bMonsterHunt={false}
            />
        </div>
        <div className={styles.grab}>
            <div className={styles.label}>Taken By</div> <CountryFlag country={grabPlayer.country}/>{grabPlayer.name} at <span className="yellow">
                {Functions.MMSS(grabTime)}</span>
        </div>
        {coverAssistsElem}

        {selfCoverElem}

        <div className={styles.grab}>
            <div className={styles.label}>Capped By </div> <CountryFlag country={capPlayer.country}/>{capPlayer.name} at <span className="yellow">{Functions.MMSS(capTime)}</span>
            <br/><span className="yellow">Carrytime</span> {capCarryTime} Secs <span className={styles.carryp}>({capCarryPercent.toFixed(2)}%)</span>

        </div>
        <div className={styles.times}>
            <div>
                <div className={styles.label2}>Travel Time</div>
                {travelTime.toFixed(2)} Seconds
            </div>
            <div>
                <div className={styles.label2}>Carry Time</div>
                {carryTime.toFixed(2)} Seconds
            </div>
            
            <div>
                <div className={styles.label2}>Time Dropped</div>
                {dropTime}
            </div>
        </div>
    </div>


}

export default MatchCTFCap;