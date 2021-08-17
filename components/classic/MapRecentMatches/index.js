import Functions from "../../../api/functions";
import MatchResult from "../MatchResult";
import Link from 'next/link';
import Pagination from "../../Pagination";

const MapRecentMatches = ({data, mapName, page, perPage, pages, totalMatches}) =>{

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
            <Pagination url={`/classic/map/${encodeURIComponent(mapName)}?page=`}
                currentPage={page + 1} results={totalMatches} pages={pages} perPage={perPage}
                anchor="#matches"
            />
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