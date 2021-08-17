import Functions from "../../../api/functions";
import MatchResult from "../MatchResult";
import Link from 'next/link';

const MapRecentMatches = ({data}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        const url = `/classic/match/${d.id}`;

        rows.push(<tr key={i}>
            <td><Link href={url}><a>{Functions.convertTimestamp(Functions.utDate(d.time))}</a></Link></td>
            <td><Link href={url}><a>{d.gamename}</a></Link></td>
            <td><Link href={url}><a>{Functions.MMSS(d.gametime)}</a></Link></td>
            <td><Link href={url}><a>{d.players}</a></Link></td>
            <td><Link href={url}><a><MatchResult data={d.result}/></a></Link></td>
        </tr>);
    }

    return <div>
            <div className="default-header">Recent Matches</div>
            <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Date</th>
                    <th>Gametype</th>
                    <th>Playtime</th>
                    <th>Players</th>
                    <th>Result</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default MapRecentMatches;