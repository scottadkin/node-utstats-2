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

        console.log(c);

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

        c.covers = c.covers.split(',');
        c.assists = c.assists.split(',');
        c.assist_carry_times = c.assist_carry_times.split(',');
        c.assist_carry_ids = c.assist_carry_ids.split(',');
        c.cover_times = c.cover_times.split(',');

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

            currentName = getPlayer(playerNames, c.covers[x]);

            events.push({
                "timestamp": c.cover_times[x], 
                "elem": <div className={styles.cover}>
                    <span className={styles.time}><MMSS timestamp={c.cover_times[x] - matchStart}/></span> {currentName.name} Covered the Flag Carrier
                </div>
            });
        }

        

        for(let x = 0; x < c.assists.length; x++){

            currentName = getPlayer(playerNames,c.assists[x]);
    
            assistElems.push(
                <span key={`assists_team_${c.team}_${currentName.name}_${x}`}>
                    
                    <a href={`/player/${c.assists[x]}`} >{currentName.name}</a>
                    <br/>
                </span>
            );     
        }

        for(let x = 0; x < c.assist_carry_times.length; x++){

            if(c.assist_carry_ids[x] !== ''){

                totalCarryTime += parseFloat(c.assist_carry_times[x]);
                currentName = getPlayer(playerNames, c.assist_carry_ids[x]);
       
                carryElems.push(<span>
                    {currentName.name} <i className="yellow">{(parseFloat(c.assist_carry_times[x])).toFixed(2)}</i><br/>
                </span>);
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
            }else if(a > b){
                return -1;
            }
            return 0;
        });

        for(let x = 0; x < events.length; x++){
            eventElems.push(events[x].elem);
        }


        /*elems.push(<tr key={`tr_${c.team}_${i}`} className={bgColor}>
            <td className="text-left p-left-5"><a href={`/player/${c.grab}`} >{grab.name}</a></td>
            <td><MMSS timestamp={c.grab_time - matchStart}/> </td>
            <td className="text-left p-left-5">{coverElems}</td>
            <td className="text-left p-left-5">{assistElems}</td>
            <td className="text-left p-left-5"><a href={`/player/${c.cap}`} >{cap.name}</a></td>
            <td><MMSS timestamp={c.cap_time - matchStart}/></td>
            <td className="text-left p-left-5">{carryElems}</td>
            <td>{(totalDropTime == 0) ? '' : `${totalDropTime.toFixed(2)} Seconds`} </td>
            <td>{c.travel_time} Seconds</td>
            <td>{teamScoreString}</td>
        </tr>);*/


        elems.push(<div className={styles.wrapper}>
            <div className={`${styles.score} ${bgColor}`}>{teamScoreString}</div>
            <div className={styles.row}>
                <span className={styles.time}><MMSS timestamp={c.grab_time - matchStart}/></span>
                &nbsp;Grabbed By<CountryFlag country={grab.country}/><Link href={`/player/${c.grab}`}><a>{grab.name}</a></Link>    
            </div>
            <div className={styles.row}>
                {eventElems}
            </div>
            <div className={styles.row}>
                <span className={styles.time}><MMSS timestamp={c.cap_time - matchStart}/></span>
                &nbsp;Captured By <CountryFlag country={cap.country}/><Link href={`/player/${c.cap}`}><a>{cap.name}</a></Link>   
            </div>
            <div className={styles.row}>
                Total Travel Time <span className={styles.time}>{c.travel_time}</span> Seconds
            </div>
        </div>);
    }

    return (<div className="special-table m-bottom-25">
        <div className="default-header">
            Flag Captures
        </div>
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
        {elems}
    </div>);
}


export default MatchCTFCaps;