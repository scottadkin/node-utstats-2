import styles from './MatchCTFCapSimple.module.css';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Functions from '../../api/functions';
import MatchResultSmall from '../MatchResultSmall';

function createAssistElem(assists, host){

    if(assists.length === 0) return null;


    const elems = [];

    for(let i = 0; i < assists.length; i++){

        const a = assists[i];

        elems.push(<span key={i}><Link href={`/player/${a.id}`}><a><CountryFlag country={a.country} host={host}/>{a.name}{(i < assists.length - 1) ? ", " : ""}</a></Link></span>);
    }

    return <div className={styles.assists}>
        Assisted by {elems}
    </div>

}

const MatchCTFCap = ({covers, drops, selfCovers, carryTime, grabPlayer, capPlayer, host, 
    dropTime, travelTime, grabTime, capTime, assistPlayers, totalTeams, teamScores, flagTeam, 
    team, seals}) =>{


    let coversElem = null;
    let selfCoversElem = null;
    let timesDroppedElem = null;
    let timeDroppedElem = null;

    if(covers > 0){

       coversElem = <div className={styles.box}>
            <div className={styles.title}>Covers</div>
            <div className={styles.image}>
                <img src="/images/flagcover.png" alt="image"/>
            </div>
            <div className={styles.value}>{covers}</div>
        </div>
    }

    if(selfCovers > 0){

        selfCoversElem = <div className={styles.box}>
            <div className={styles.title}>Kills Carrying Flag</div>
            <div className={styles.image}>
                <img src="/images/playerwithflag.png" alt="image"/>
            </div>
            <div className={styles.value}>{selfCovers}</div>
        </div>
     }
     
    if(drops > 0){

        timesDroppedElem = <div className={styles.box}>
            <div className={styles.title}>Times Dropped</div>
            <div className={styles.image}>
                <img src="/images/flagdropped.png" alt="image"/>
            </div>
            <div className={styles.value}>{drops}</div>
        </div>
    }

    if(dropTime > 0){

        timeDroppedElem = <div className={styles.box}>
            <div className={styles.title}>Time Dropped</div>
            <div className={styles.image}>
                <img src="/images/flagdroppedtime.png" alt="image"/>
            </div>
            <div className={styles.value}>{dropTime.toFixed(2)} Seconds</div>
        </div>
    }


    if(seals > 0){

        timeDroppedElem = <div className={styles.box}>
            <div className={styles.title}>Seals</div>
            <div className={styles.image}>
                <img src="/images/flagseal.png" alt="image"/>
            </div>
            <div className={styles.value}>{seals}</div>
        </div>
    }

    return <div className={styles.wrapper}>
        <div className={`${styles.smessage} ${Functions.getTeamColor(team)}`}>
            {Functions.getTeamName(team)} {(totalTeams <= 2) ? "Scored" : <>Capped the {Functions.getTeamColorName(flagTeam)} Flag</>}
        </div>
        <div className={styles.scores}>
            <MatchResultSmall totalTeams={totalTeams} redScore={teamScores[0]} blueScore={teamScores[1]}
            greenScore={teamScores[2]} yellowScore={teamScores[3]} dmWinner="" bMonsterHunt={false}/>
        </div>
        <div className={styles.event}>
            Flag Taken by <Link href={`/player/${grabPlayer.id}`}><a><CountryFlag country={grabPlayer.country} host={host}/>{grabPlayer.name}</a></Link> @ <span className={styles.time}>{Functions.MMSS(grabTime)}</span>
        </div>

        <div className={styles.box}>
            <div className={styles.title}>Travel Time</div>
            <div className={styles.image}>
                <img src="/images/flagtravel.png" alt="image"/>
            </div>
            <div className={styles.value}>{travelTime} Seconds</div>
        </div>


        <div className={styles.box}>
            <div className={styles.title}>Time Carried</div>
            <div className={styles.image}>
                <img src="/images/playerwithflagclock.png" alt="image"/>
            </div>
            <div className={styles.value}>{carryTime} Seconds</div>
        </div>
        {timeDroppedElem}
        {coversElem}
       
        {selfCoversElem}
        {timesDroppedElem}
        <div className={styles.event}>
            Flag Captured by <Link href={`/player/${capPlayer.id}`}><a><CountryFlag country={capPlayer.country} host={host}/>{capPlayer.name}</a></Link> @ <span className={styles.time}>{Functions.MMSS(capTime)}</span>
        </div>
        {createAssistElem(assistPlayers, host)}
    </div>
}

export default MatchCTFCap;