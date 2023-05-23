import styles from './MatchCTFCap.module.css';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';
import MatchResultSmall from '../MatchResultSmall';
import Link from 'next/link';
import Table2 from '../Table2';

function getDisplayText(type){

    const text = {
        "grab": "Grabbed the Flag",
        "cap": "Capped the Flag",
        "cover": "Covered the Flag Carrier",
        "drop": "Dropped the Flag",
        "self_cover": "Killed while carrying the Flag",
        "pickup": "Picked up the Flag",
        "seal": "Sealed off the Base"
    };

    if(text[type] !== undefined) return text[type];

    return "Not Found!";

}

function createEventRows(events, host, playerCovers, matchId){

    const rows = [];

    const lastFlagContact = {};

    for(let i = 0; i < events.length; i++){

        const e = events[i];
        const player = e.player;
        

        if(e.type === "cover"){

            if(playerCovers[player.id] === undefined) playerCovers[player.id] = 0;

            playerCovers[player.id]++;
        }

        let rewardElem = null;

        if(e.type === "cover"){

            if(playerCovers[player.id] === 3){

                rewardElem = <span className="yellow">(Multi Cover)</span>;

            }else if(playerCovers[player.id] === 4){
                rewardElem = <span className="yellow">(Cover Spree)</span>;
            }
        }


        if(e.type === "grab" || e.type === "pickup"){

            if(lastFlagContact[e.player_id] === undefined){
                lastFlagContact[e.player_id] = e.timestamp;
            }else{
                lastFlagContact[e.player_id] = e.timestamp;
            }
        }

        let flagCarryTime = 0;

        let carryPercentElem = null;

        if(e.type === "drop" || e.type === "cap"){

            flagCarryTime = e.timestamp - lastFlagContact[e.player_id];

            carryPercentElem = <span className={styles.carry}>{flagCarryTime.toFixed(2)} seconds carry time.</span>
        }

        
        if(i === 0) continue;

        let playerElem = null;
        

        if(player.id === undefined){

            playerElem = <Link href={`/pmatch/${matchId}?player=${player.id}`}>
                
                <span className="deleted">Deleted Player</span>
                
            </Link>

        }else{

            playerElem = <Link href={`/pmatch/${matchId}?player=${player.id}`}>
                
                <CountryFlag country={player.country} host={host}/><b>{player.name}</b>
                
            </Link>;
        }

        rows.push(<tr key={i}>
            <td className={styles.time}>{Functions.MMSS(e.timestamp)}</td>
            <td>
                {playerElem} {getDisplayText(e.type)}. {rewardElem}{carryPercentElem}
            </td>
        </tr>);
    }

    return rows;
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

const MatchCTFCap = ({matchId, team, carryTime, totalTeams, 
    teamScores, host, events, timeDropped, flagTeam}) =>{


    const grabPlayer = events[0].player;
    const grabTime = events[0].timestamp;
    const capPlayer = events[events.length - 1].player;
    const capTime = events[events.length - 1].timestamp;

    const playerCovers = {};

    const rows = createEventRows(events, host, playerCovers, matchId);

    const travelTime = events[events.length - 1].timestamp - events[0].timestamp;

    let elems = null;

    const flagDroppedTime = null;

    if(timeDropped > 0){

        flagDroppedTime = <div className={styles.event}>
            Flag Was Dropped for <span className={styles.time}>{timeDropped.toFixed(2)} Seconds.</span>
        </div>
    }

    if(events.length === 2){
        elems = <div className={styles.event}>
            Solo Cap by {renderPlayer(capPlayer, matchId, host)}<br/><br/>
            Grabbed at <span className={styles.time}>{Functions.MMSS(grabTime)}</span>, capped at <span className={styles.time}>{Functions.MMSS(capTime)}</span>
        </div>
    }else{

        elems = <>
            <div className={styles.event}>
                Flag Taken by {renderPlayer(grabPlayer, matchId, host)} @ <span className={styles.time}>{Functions.MMSS(grabTime)}</span>
            </div>
            <Table2 width={1}>
                {rows}
            </Table2>
            <div className={styles.event}>
                Flag Capped by {renderPlayer(capPlayer, matchId, host)} @ <span className={styles.time}>{Functions.MMSS(capTime)}</span>
            </div>
        </>
    }

    return <div className={styles.wrapper}>
        <div className={`${styles.smessage} ${Functions.getTeamColor(team)}`}>
            {Functions.getTeamName(team)} {(totalTeams <= 2) ? "Scored" : <>Capped the {Functions.getTeamColorName(flagTeam)} Flag</>}
        </div>
        <div className={styles.scores}>
            <MatchResultSmall totalTeams={totalTeams} redScore={teamScores[0]} blueScore={teamScores[1]}
                greenScore={teamScores[2]} yellowScore={teamScores[3]} dmWinner="" bMonsterHunt={false}/>
        </div>
        

        {elems}
        <div className={styles.event}>
            Flag Travel Time <span className={styles.time}>{travelTime.toFixed(2)} Seconds.</span>
        </div>
        {flagDroppedTime}

    </div>

}

export default MatchCTFCap;