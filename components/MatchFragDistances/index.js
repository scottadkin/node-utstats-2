import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import TipHeader from '../TipHeader/';


//parse kills here and the categorise the distancesesses
const MatchFragDistances = ({players, team, toDisplay}) =>{

    const elems = [];

    let p = 0;

    let bgColor = Functions.getTeamColor(team);

    let shortestKillTotal = 0;
    let totalAverage = 0;
    let longestKillTotal = 0;

    let totalCloseRange = 0;
    let totalLongRange = 0;
    let totalUberRange = 0;

    let index = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(p.team !== team) continue;
        
        if(index === 0){

            shortestKillTotal = p.shortest_kill_distance;
            longestKillTotal = p.longest_kill_distance;

        }else{

            if(p.shortest_kill_distance < shortestKillTotal && p.shortest_kill_distance !== 0) shortestKillTotal = p.shortest_kill_distance;
            if(p.longest_kill_distance > longestKillTotal) longestKillTotal = p.longest_kill_distance;
        }

        totalCloseRange += p.k_distance_normal;
        totalLongRange += p.k_distance_long;
        totalUberRange += p.k_distance_uber;

        totalAverage += p.average_kill_distance;

        console.log(`p`);
        console.log(p);

        elems.push(<tr className={bgColor}>
            <td className="text-left"><Link href={`/player/${p.player_id}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>
            <td>{Functions.ignore0(p.shortest_kill_distance)}</td>
            <td>{Functions.ignore0(p.average_kill_distance)}</td>
            <td>{Functions.ignore0(p.longest_kill_distance)}</td>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ?  <td>{Functions.ignore0(p.k_distance_normal)}</td> : null }
            {(toDisplay.indexOf("k_distance_long") !== -1) ?  <td>{Functions.ignore0(p.k_distance_long)}</td> : null }
            {(toDisplay.indexOf("k_distance_uber") !== -1) ?  <td>{Functions.ignore0(p.k_distance_uber)}</td> : null }
        </tr>);

        index++;
    }

    if(totalAverage > 0 && index > 0){

        totalAverage = totalAverage / index;
    }

    if(elems.length > 0){
        elems.push(<tr>
            <td className="text-left"></td>
            <td>{Functions.ignore0(shortestKillTotal)}</td>
            <td>{Functions.ignore0(totalAverage)}</td>
            <td>{Functions.ignore0(longestKillTotal)}</td>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ? <td>{Functions.ignore0(totalCloseRange)}</td> : null}
            {(toDisplay.indexOf("k_distance_long") !== -1) ?  <td>{Functions.ignore0(totalLongRange)}</td> : null}
            {(toDisplay.indexOf("k_distance_uber") !== -1) ? <td>{Functions.ignore0(totalUberRange)}</td> : null}
        </tr>);
    }

    if(elems.length > 0){

        elems.unshift(<tr>
            <th>Player</th>
            <th>Shortest Distance</th>
            <th>Average Distance</th>
            <th>Longest Distance</th>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ? <TipHeader title="Close Range Kills" content="Kills with a distance of less than 1536uu." /> : null}
            {(toDisplay.indexOf("k_distance_long") !== -1) ? <TipHeader title="Long Range Kills" content="Kills with a distance of 1536uu to 3071uu." /> : null}
            {(toDisplay.indexOf("k_distance_uber") !== -1) ? <TipHeader title="Uber Long Range Kills" content="Kills with a distance of 3072 and greater." /> : null}
        </tr>);

        return <table className="m-bottom-25">
            <tbody>
                {elems}
            </tbody>
        </table>
    }

    return null;

}


export default MatchFragDistances;