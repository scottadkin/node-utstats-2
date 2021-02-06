import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import MMSS from '../MMSS/';

const createPlayerMap = (players) =>{

    const data = new Map();

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        data.set(p.player_id, {"name": p.name, "country": p.country});
    }

    return data;
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

        c.covers = c.covers.split(',');
        c.assists = c.assists.split(',');
        c.assist_carry_times = c.assist_carry_times.split(',');
        c.assist_carry_ids = c.assist_carry_ids.split(',');

        console.log(c.assist_carry_times);
        console.log(c.assist_carry_ids);

        switch(c.team){
            case 0: {  bgColor = "team-red"; } break;
            case 1: {  bgColor = "team-blue"; } break;
            case 2: {  bgColor = "team-green"; } break;
            case 3: {  bgColor = "team-yellow"; } break;
            default: { bgColor = "team-none";} break;
        }
        
        grab = playerNames.get(c.grab);

        if(grab === undefined){
            grab = {"name": "Not found", "country": "xx"};
        }

        cap = playerNames.get(c.cap);

        if(cap === undefined){
            cap = {"name": "Not found", "country": "xx"};
        }


        teamScores[c.team]++;

        for(let x = 0; x < c.covers.length; x++){

            currentName = playerNames.get(parseInt(c.covers[x]));

            if(currentName !== undefined){

                ccName = currentCoverNames.get(currentName.name);

                if(ccName === undefined){
                    currentCoverNames.set(currentName.name, {"covers": 1, "country": currentName.country})
                }else{
                    currentCoverNames.set(currentName.name, {"covers": ccName.covers + 1, "country": currentName.country});
                }
            }
        }

        for(const [key, value] of currentCoverNames){

            coverElems.push(<span key={`cover_team_${c.team}_${key}`}>
               {key}<i className="yellow"> ({value.covers})</i><br/>
            </span>);
        }

        for(let x = 0; x < c.assists.length; x++){

            currentName = playerNames.get(parseInt(c.assists[x]));

            if(currentName !== undefined){

                assistElems.push(
                    <span key={`assists_team_${c.team}_${currentName.name}_${x}`}>
                        
                        <a href={`/player/${c.assists[x]}`} >{currentName.name}</a>
                        <br/>
                    </span>
                );

            }else{
                /*if(c.assists[x] !== ''){
                    assistElems.push(
                        <span>
                            <CountryFlag country="xx"/>
                            Not Found
                            {(x < c.assists.length - 1) ? ',' : ''}
                        </span>
                    );
                }*/
            }
        }

        for(let x = 0; x < c.assist_carry_times.length; x++){

            if(c.assist_carry_ids[x] !== ''){

                totalCarryTime += parseFloat(c.assist_carry_times[x]);
                currentName = playerNames.get(parseInt(c.assist_carry_ids[x]));
       
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

        elems.push(<tr key={`tr_${c.team}_${i}`} className={bgColor}>
            <td className="text-left"><a href={`/player/${c.grab}`} >{grab.name}</a></td>
            <td><MMSS timestamp={c.grab_time - matchStart}/> </td>
            <td className="text-left">{coverElems}</td>
            <td className="text-left">{assistElems}</td>
            <td className="text-left"><a href={`/player/${c.cap}`} >{cap.name}</a></td>
            <td><MMSS timestamp={c.cap_time - matchStart}/></td>
            <td className="text-left">{carryElems}</td>
            <td>{(totalDropTime == 0) ? '' : `${totalDropTime.toFixed(2)} Seconds`} </td>
            <td>{c.travel_time} Seconds</td>
            <td>{teamScoreString}</td>
        </tr>);
    }

    return (<div className="special-table m-bottom-25">
        <div className="default-header">
            Flag Captures
        </div>
        <table>
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
                {elems}
            </tbody>
        </table>
    </div>);
}


export default MatchCTFCaps;