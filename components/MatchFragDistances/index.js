import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


//parse kills here and the categorise the distancesesses
const MatchFragDistances = ({players, team}) =>{

    const elems = [];

    let p = 0;

    let bgColor = Functions.getTeamColor(team);

    for(let i = 0; i < players.length; i++){

        p = players[i];

        elems.push(<tr className={bgColor}>
            <td className="text-left"><Link href={`/player/${p.player_id}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>
            <td>{p.shortest_kill_distance}</td>
            <td>{p.average_kill_distance}</td>
            <td>{p.longest_kill_distance}</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>);
    }

    if(elems.length > 0){

        elems.unshift(<tr>
            <th>Player</th>
            <th>Shortest Distance</th>
            <th>Average Distance</th>
            <th>Longest Distance</th>
            <th>Close Range Kills</th>
            <th>Long Range Kills</th>
            <th>Uber Long Range Kills</th>
        </tr>);

        return <table className="m-bottom-25">
            <tbody>
                {elems}
            </tbody>
        </table>
    }
    return <div>Dick butt</div>
}


export default MatchFragDistances;