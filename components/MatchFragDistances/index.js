import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import TipHeader from '../TipHeader/';
import styles from '../MatchFragTable/MatchFragTable.module.css';

const bAnyData = (data) =>{
    
    const types = [
        "shortest_kill_distance",
        "average_kill_distance",
        "longest_kill_distance",
        "k_distance_normal",
        "k_distance_long",
        "k_distance_uber"
    ];

    for(let i = 0; i < types.length; i++){

        if(data[types[i]] != 0) return true;
    }

    return false;
}

const MatchFragDistances = ({players, team, toDisplay, single, matchId}) =>{

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

        if(p.team !== team && team !== -1) continue;
        
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

        if(bAnyData(p)){

            elems.push(<tr key={i}>
                {(single) ? null :
                <td className={`text-left name-td ${bgColor}`}>
                    <Link href={`/pmatch/${matchId}?player=${p.player_id}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link>
                </td>}
                <td>{Functions.ignore0(p.shortest_kill_distance.toFixed(2))}</td>
                <td>{Functions.ignore0(p.average_kill_distance.toFixed(2))}</td>
                <td>{Functions.ignore0(p.longest_kill_distance.toFixed(2))}</td>
                {(toDisplay.indexOf("k_distance_normal") !== -1) ?  <td>{Functions.ignore0(p.k_distance_normal)}</td> : null }
                {(toDisplay.indexOf("k_distance_long") !== -1) ?  <td>{Functions.ignore0(p.k_distance_long)}</td> : null }
                {(toDisplay.indexOf("k_distance_uber") !== -1) ?  <td>{Functions.ignore0(p.k_distance_uber)}</td> : null }
            </tr>);
        }

        index++;
    }

    if(totalAverage > 0 && index > 0){

        totalAverage = totalAverage / index;
    }

    if(elems.length > 0 && !single){
        elems.push(<tr key={"end"}>
            {(single) ? null :<td className="text-left">Best/Totals</td>}
            <td>{parseFloat(Functions.ignore0(shortestKillTotal)).toFixed(2)}</td>
            <td>{parseFloat(Functions.ignore0(totalAverage)).toFixed(2)}</td>
            <td>{parseFloat(Functions.ignore0(longestKillTotal)).toFixed(2)}</td>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ? <td>{Functions.ignore0(totalCloseRange)}</td> : null}
            {(toDisplay.indexOf("k_distance_long") !== -1) ?  <td>{Functions.ignore0(totalLongRange)}</td> : null}
            {(toDisplay.indexOf("k_distance_uber") !== -1) ? <td>{Functions.ignore0(totalUberRange)}</td> : null}
        </tr>);
    }

    if(elems.length > 0){

        elems.unshift(<tr key={"start"}>
            {(single) ? null :<th>Player</th>}
            <th>Shortest Distance</th>
            <th>Average Distance</th>
            <th>Longest Distance</th>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ? <TipHeader title="Close Range Kills" content="Kills with a distance of less than 1536uu." /> : null}
            {(toDisplay.indexOf("k_distance_long") !== -1) ? <TipHeader title="Long Range Kills" content="Kills with a distance of 1536uu to 3071uu." /> : null}
            {(toDisplay.indexOf("k_distance_uber") !== -1) ? <TipHeader title="Uber Long Range Kills" content="Kills with a distance of 3072 and greater." /> : null}
        </tr>);

        return <table className={`${styles.table} m-bottom-25 t-width-1`}>
            <tbody>
                {elems}
            </tbody>
        </table>
    }

    return null;

}


export default MatchFragDistances;