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

function createEventRows(events, host, playerCovers){

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

        console.log(e);


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

            carryPercentElem = <span className={styles.carry}>{flagCarryTime.toFixed(2)} Second Assist.</span>
        }

        

        rows.push(<tr key={i}>
            <td className={styles.time}>{Functions.MMSS(e.timestamp)}</td>
            <td>
                <Link href={`/player/${player.id}`}><a><CountryFlag country={player.country} host={host}/><b>{player.name}</b></a></Link> {getDisplayText(e.type)}. {rewardElem}{carryPercentElem}
            </td>
        </tr>);
    }

    return rows;
}

const MatchCTFCap = ({matchId, team, carryTime, totalTeams, 
    teamScores, host, events, timeDropped, flagTeam}) =>{


    const grabPlayer = events[0].player;
    const grabTime = events[0].timestamp;
    const capPlayer = events[events.length - 1].player;
    const capTime = events[events.length - 1].timestamp;

    const playerCovers = {};

    const rows = createEventRows(events, host, playerCovers);

    console.log(playerCovers);

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
            Solo Cap by <CountryFlag country={capPlayer.country} host={host}/><Link href={`/player/${capPlayer.id}`}><a>{capPlayer.name}</a></Link><br/><br/>
            Grabbed at <span className={styles.time}>{Functions.MMSS(grabTime)}</span>, capped at <span className={styles.time}>{Functions.MMSS(capTime)}</span>
        </div>
    }else{

        elems = <>
            <div className={styles.event}>
                Flag Taken by <CountryFlag country={grabPlayer.country} host={host}/><Link href={`/player/${grabPlayer.id}`}><a>{grabPlayer.name}</a></Link> @ <span className={styles.time}>{Functions.MMSS(grabTime)}</span>
            </div>
            <Table2 width={1}>
                {rows}
            </Table2>
            <div className={styles.event}>
                Flag Capped by <CountryFlag country={capPlayer.country} host={host}/><Link href={`/player/${capPlayer.id}`}><a>{capPlayer.name}</a></Link> @ <span className={styles.time}>{Functions.MMSS(capTime)}</span>
            </div>
        </>
    }

    return <div className={styles.wrapper}>
        <div className={`${styles.smessage} ${Functions.getTeamColor(team)}`}>
            {Functions.getTeamName(team)} {(totalTeams <= 2) ? "Scored" : <>Capped the {Functions.getTeamColorName(flagTeam)} Flag</>}
        </div>
        <div className={styles.scores}>
            <MatchResultSmall totalTeams={totalTeams} totalTeams={totalTeams} redScore={teamScores[0]} blueScore={teamScores[1]}
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