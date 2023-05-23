import styles from './MatchCTFCapSimple.module.css';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Functions from '../../api/functions';
import MatchResultSmall from '../MatchResultSmall';
import MatchCTFCapBox from '../MatchCTFCapBox';

function createAssistElem(assists, host, matchId){

    if(assists.length === 0) return null;


    const elems = [];

    for(let i = 0; i < assists.length; i++){

        const a = assists[i];

        if(a.id === undefined){
            elems.push(<span key={i} className="deleted">Deleted Player{(i < assists.length - 1) ? ", " : ""}</span>);
        }else{
            elems.push(<span key={i}>
                <Link href={`/pmatch/${matchId}?player=${a.id}`}><CountryFlag country={a.country} host={host}/>{a.name}{(i < assists.length - 1) ? ", " : ""}</Link>
            </span>);
        }
    }

    return <div className={styles.assists}>
        Assisted by {elems}
    </div>

}

function renderPlayer(player, matchId, host){

    if(player.id === undefined){

        return <span className="deleted">Deleted Player</span>
    }

    return <Link href={`/pmatch/${matchId}?player=${player.id}`}>
        
            <CountryFlag country={player.country} host={host}/>
            {player.name}
        
        </Link>;

}

const MatchCTFCap = ({covers, drops, selfCovers, carryTime, grabPlayer, capPlayer, host, 
    dropTime, travelTime, grabTime, capTime, assistPlayers, totalTeams, teamScores, flagTeam, 
    team, seals, matchId}) =>{


    let coversElem = null;
    let selfCoversElem = null;
    let timesDroppedElem = null;
    let timeDroppedElem = null;

    if(covers > 0){

       coversElem = <MatchCTFCapBox title="Covers" image="flagcover.png" value={covers}/>;
    }

    if(selfCovers > 0){

        selfCoversElem = <MatchCTFCapBox title="Kills Carrying Flag" image="playerwithflag.png" value={selfCovers}/>;       
     }
     
    if(drops > 0){

        timesDroppedElem = <MatchCTFCapBox title="Times Dropped" image="flagdropped.png" value={drops}/>;
    }

    if(dropTime > 0){

        timeDroppedElem = <MatchCTFCapBox title="Time Dropped" image="flagdroppedtime.png" value={`${dropTime.toFixed(2)} Seconds`}/>; 
    }


    if(seals > 0){

        timeDroppedElem = <MatchCTFCapBox title="Seals" image="flagseal.png" value={seals}/>;
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
            Flag Taken by {renderPlayer(grabPlayer, matchId, host)} @ <span className={styles.time}>{Functions.MMSS(grabTime)}</span>
        </div>

        <MatchCTFCapBox title="Travel Time" image="flagtravel.png" value={`${travelTime} Seconds`}/>
        <MatchCTFCapBox title="Time Carried" image="playerwithflagclock.png" value={`${carryTime} Seconds`}/>

        {timeDroppedElem}
        {coversElem}
       
        {selfCoversElem}
        {timesDroppedElem}
        <div className={styles.event}>
            Flag Captured by {renderPlayer(capPlayer, matchId, host)} @ <span className={styles.time}>{Functions.MMSS(capTime)}</span>
        </div>
        {createAssistElem(assistPlayers, host, matchId)}
    </div>
}

export default MatchCTFCap;