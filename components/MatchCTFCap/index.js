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

    dropTime = (dropTime > 0) ? `${dropTime.toFixed(2)} Seconds` : "None";

    if(assistElems.length === 0){
        assistElems.push(<div key="an">None</div>);
    }

    if(coverElems.length === 0){
        coverElems.push(<div key="cn">None</div>);
    }

    return <div className={styles.wrapper}>
        <div className={`${styles.title} ${Functions.getTeamColor(team)}`}>{Functions.getTeamName(team)} Scored!</div>
        <div className={styles.scores}>
            <MatchResultSmall totalTeams={totalTeams} redScore={teamScores[0]} blueScore={teamScores[1]}
                greenScore={teamScores[2]} yellowScore={teamScores[3]} dmWinner="" bMonsterHunt={false}
            />
        </div>
        <div className={styles.grab}>
            <div className={styles.label}>Taken By</div> <CountryFlag country={grabPlayer.country}/>{grabPlayer.name} at {Functions.MMSS(grabTime)}
        </div>
        <div className={styles.ca}>
            <div className={styles.p1}>
                <div className={styles.label2}>Covers</div>
                <div className={styles.pwrapper}>
                    {coverElems}
                </div>
            </div>
            <div className={styles.p1}>
                <div className={styles.label2}>Assists</div>
                <div className={styles.pwrapper}>
                    {assistElems}
                </div>
            </div>
        </div>
        <div className={styles.grab}>
            <div className={styles.label}>Capped By </div> <CountryFlag country={capPlayer.country}/>{capPlayer.name} at {Functions.MMSS(capTime)}

        </div>
        <div className={styles.times}>
            <div>
                <div className={styles.label2}>Travel Time</div>
                {travelTime.toFixed(2)} Seconds

            </div>
            <div>
            <div className={styles.label2}>Time Dropped</div>
                {dropTime}
            </div>
        </div>
    </div>


}

export default MatchCTFCap;