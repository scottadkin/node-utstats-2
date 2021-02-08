import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import MMSS from '../MMSS/';
import styles from './MatchCTFCaps.module.css';
import Link from 'next/link';

const createPlayerMap = (players) =>{

    const data = new Map();

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        data.set(p.player_id, {"name": p.name, "country": p.country});
    }

    return data;
}

const getPlayer = (players, id) =>{

    id = parseInt(id);

    const current = players.get(id);

    if(current !== undefined){
        return {"name": current.name, "country": current.country};
    }

    return {"name": 'Not Found', "country": 'xx'};
}

const MatchCTFCaps = ({players, caps, matchStart, totalTeams}) =>{

    players = JSON.parse(players);
    caps = JSON.parse(caps);
    matchStart = parseFloat(matchStart);

    const elems = [];
    //console.log(caps);


    const playerNames = createPlayerMap(players);
    //console.log(playerNames);

    let c = 0;

    let grab = '';
    let covers = [];
    let assists = [];
    let cap = '';
    let currentName = '';
    let coverElems = [];
    let assistElems = [];
    let carryElems = [];
    let totalCarryTime = 0;
    let totalDropTime = 0;

    let bgColor = '';
    let currentCoverNames = 0;
    let ccName = 0;

    let events = [];
    let eventElems = [];

    const teamScores = [0,0,0,0];
    let teamScoreString = '';

    for(let i = 0; i < caps.length; i++){

        c = caps[i];

        //console.log(c);

        coverElems = [];
        assistElems = [];
        covers = [];
        assists = [];
        carryElems = [];
        currentCoverNames = new Map();
        totalCarryTime = 0;
        totalDropTime = 0;
        events = [];
        eventElems = [];
        assistElems = [];

        c.covers = c.covers.split(',');
        c.assists = c.assists.split(',');
        c.assist_carry_times = c.assist_carry_times.split(',');
        c.assist_carry_ids = c.assist_carry_ids.split(',');
        c.cover_times = c.cover_times.split(',');
        c.drops = c.drops.split(',');
        c.drop_times = c.drop_times.split(',');
        c.pickups = c.pickups.split(',');
        c.pickup_times = c.pickup_times.split(',');

       // console.log(c.assist_carry_times);
        //console.log(c.assist_carry_ids);

        switch(c.team){
            case 0: {  bgColor = "team-red"; } break;
            case 1: {  bgColor = "team-blue"; } break;
            case 2: {  bgColor = "team-green"; } break;
            case 3: {  bgColor = "team-yellow"; } break;
            default: { bgColor = "team-none";} break;
        }
        
        grab = getPlayer(playerNames, c.grab);
        cap = getPlayer(playerNames, c.cap);

        teamScores[c.team]++;

        for(let x = 0; x < c.covers.length; x++){

            if(c.covers[x] === ''){
                continue;
            }
            currentName = getPlayer(playerNames, c.covers[x]);

            events.push({
                "timestamp": parseFloat(c.cover_times[x]) - matchStart, 
                "elem": <div key={`covers-${x}`} className={styles.cover}>
                    <span className={styles.time}><MMSS timestamp={c.cover_times[x] - matchStart}/></span> {currentName.name} Covered the Flag Carrier
                </div>
            });
        }

        for(let x = 0; x < c.drops.length; x++){

            if(c.drops[x] === ''){
                continue;
            }

            currentName = getPlayer(playerNames, c.drops[x]);

            events.push({
                "timestamp": parseFloat(c.drop_times[x]) - matchStart, 
                "elem": <div key={`drops-${x}`}><div className={styles.dropped}>
                    <span className={styles.time}><MMSS timestamp={c.drop_times[x] - matchStart}/></span> {currentName.name} Dropped the Flag 
                </div>
                    <div className={styles.assist}>
                        Carry time {parseFloat(c.assist_carry_times[x]).toFixed(2)} Seconds
                    </div>
                </div>
            });
        }

        for(let x = 0; x < c.pickups.length; x++){

            if(c.pickups[x] === ''){
                continue;
            }

            currentName = getPlayer(playerNames, c.pickups[x]);

            events.push({
                "timestamp": parseFloat(c.pickup_times[x]) - matchStart, 
                "elem": <div key={`pickups-${x}`} className={styles.pickup}>
                    <span className={styles.time}><MMSS timestamp={c.pickup_times[x] - matchStart}/></span> {currentName.name} Picked up the Flag
                </div>
            });
        }


        for(let x = 0; x < c.assist_carry_times.length; x++){

            if(c.assist_carry_ids[x] !== ''){
                totalCarryTime += parseFloat(c.assist_carry_times[x]);
            }
        }

        teamScoreString = '';

        for(let t = 0; t < totalTeams; t++){

            if(t > 0){
                teamScoreString += ` - ${teamScores[t]}`
            }else{
                teamScoreString += `${teamScores[t]}`;
            }
        }

        if(totalCarryTime > 0){
            totalDropTime = c.travel_time - totalCarryTime
        }

        events.sort((a,b) =>{

            a = a.timestamp;
            b = b.timestamp;

            if(a > b){
                return 1;
            }else if(a < b){
                return -1;
            }
            return 0;
        });


        for(let x = 0; x < events.length; x++){

            eventElems.push(events[x].elem);
        }

        elems.push(<div className={styles.box}>
            <div className={`${styles.score} ${bgColor}`}>{teamScoreString}</div>
            <div className={styles.row}>
                <span className={styles.time}><MMSS timestamp={c.grab_time - matchStart}/></span>
                &nbsp;Grabbed By {grab.name}  
            </div>
            <div className={styles.row}>
                {eventElems}
            </div>
            <div className={styles.row}>
                <span className={styles.time}><MMSS timestamp={c.cap_time - matchStart}/></span>
                &nbsp;Capped By {cap.name}  
                <div className={styles.assist}>
                    Carry time {c.assist_carry_times[c.assist_carry_times.length - 1]} Seconds
                </div>
            </div>
 
            <div className={styles.row}>
                Total Travel Time <span className={styles.time}>{c.travel_time}</span> Seconds<br/>
                Total Time Dropped <span className={styles.time}>{parseFloat(totalDropTime).toFixed(2)}</span> Seconds
            </div>
        </div>);
    }

    return (<div className="special-table m-bottom-25">
        <div className="default-header">
            Flag Captures
        </div>
        
        <div className={styles.wrapper}>
            {elems}
        </div>
    </div>);
}

/*
<table className={styles.table}>
            <tbody>
                <tr>
                    <TipHeader title="Grab" content="The player who took the flag from the enemy base."/>
                    <TipHeader title="Grab Time" content="Time of the match when the flag was taken from the base."/>
                    <TipHeader title="Covers" content="Players who killed enemies after the flag carrier."/>
                    <TipHeader title="Assists" content="Players who carried the flag at some point."/>
                    <TipHeader title="Capture" content="Player who captured the flag."/>
                    <TipHeader title="Capture Time" content="Time of the match when the flag was captured"/>
                    <TipHeader title="Carry Times" content="In seconds how long a player had the flag before capping/dropping it."/>
                    <TipHeader title="Time Dropped" content="How long the flag was dropped." />
                    <TipHeader title="Travel Time" content="How long it took from grab to capture in seconds."/>
                    <TipHeader title="Scores at Cap" content="Team scores at the time of capture."/>
                </tr>
                
            </tbody>

        </table>
*/


export default MatchCTFCaps;