import CountryFlag from '../CountryFlag/'

const setPlayerPointCaps = (data) =>{

    const caps = new Map();


    let current = 0;
    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        current = caps.get(d.player);

        if(current === undefined){
            caps.set(d.player, {})
            current = caps.get(d.player);
        }

        if(current[`p_${d.point}`] === undefined){
            current[`p_${d.point}`] = 1;
        }else{
            current[`p_${d.point}`]++;
        }

        caps.set(d.player, current);
    }

    return caps;
}



const MatchDominationSummaryTable = ({team, players, controlPointNames, capData, matchId}) =>{

    players = JSON.parse(players);
    controlPointNames = JSON.parse(controlPointNames);

    const pointNames = [];

    for(let i = 0; i < controlPointNames.length; i++){

        pointNames.push(
            <th key={`point_name_${team}_${i}`}>
                {controlPointNames[i].name}
            </th>
        );
    }

    let bgColor = '';


    switch(team){
        case 0: {  bgColor = "team-red"; } break;
        case 1: {  bgColor = "team-blue"; } break;
        case 2: {  bgColor = "team-green"; } break;
        case 3: {  bgColor = "team-yellow"; } break;
        default: { bgColor = "team-none";} break;
    }

    const elems = [];

    capData = JSON.parse(capData);


    const playerPointData = setPlayerPointCaps(capData);

    let p = 0;

    let playerElems = [];
    let currentTotal = 0;

    let currentPointCaps = 0;

    const totals = [];
    let allTotals = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];
        currentTotal = 0;
     
        playerElems = [];

        playerElems.push(<td key={`players_name_${team}_${i}`} className={`text-left ${bgColor}`}>
            <CountryFlag key={p.id} country={p.country}/><a href={`/pmatch/${matchId}?player=${p.player_id}`}>{p.name}</a>
            </td>);

        for(let c = 0; c < controlPointNames.length; c++){


            currentPointCaps = playerPointData.get(p.player_id)

            if(currentPointCaps !== undefined){
                playerElems.push(<td key={`player_elems_${team}_${i}_${c}`}>
                    {
                        (currentPointCaps[`p_${controlPointNames[c].id}`] !== undefined) ? currentPointCaps[`p_${controlPointNames[c].id}`] : ''
                    }
                </td>);

                if(currentPointCaps[`p_${controlPointNames[c].id}`] !== undefined){

                    if(totals[c] === undefined){
                        totals[c] = 0;
                    }

                    totals[c]+= currentPointCaps[`p_${controlPointNames[c].id}`];
                    currentTotal += currentPointCaps[`p_${controlPointNames[c].id}`];

                    allTotals += currentPointCaps[`p_${controlPointNames[c].id}`];
                   // console.log(allTotals,p.id);

                }
            }
        }

        if(currentTotal > 0){
            playerElems.push(<td key={`player_elems_${team}_totals`}>{currentTotal}</td>);

            elems.push(<tr key={`player_elems_${team}_${i}`}>
                {playerElems}
            </tr>);
        }
       
    }

    playerElems = [];

    for(let i = 0; i < controlPointNames.length; i++){
        
        playerElems.push(<td key={`control_point_names_${team}_${i}`}>
            {totals[i]}
        </td>);
    }
    
    elems.push(<tr key={`control_point_names_${team}_totals`}>
        <td>Team Totals</td>
        {playerElems}
        <td>{allTotals}</td>
    </tr>);
    

    return (<div className={`m-bottom-25 center`}>
        <table className="t-width-1 player-td-1">
            <tbody>
                <tr>
                    <th>Player</th>
                    {pointNames}
                    <th>Total Captures</th>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}

export default MatchDominationSummaryTable;