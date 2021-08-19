import MatchResultBox from "../../MatchResultBox";
import Functions from "../../../api/functions";
import Pagination from "../../Pagination";
import Link from 'next/link';
import MatchResult from "../MatchResult";

const PlayerRecentMatches = ({data, images, playerId, page, pages, perPage, mode}) =>{

    let elems = [];

    for(let i = 0; i < data.matches.length; i++){

        const d = data.matches[i];

        const cleanMapName = Functions.cleanMapName(d.mapfile).toLowerCase();
        const index = images.indexOf(cleanMapName);
        const image = (index !== -1) ? images[index] : "default";

        if(mode === "d"){

            elems.push(
                <Link href={`/classic/match/${d.id}`}>
                    <a>
                        <MatchResultBox key={i} serverName={d.servername} gametypeName={d.gamename} mapName={Functions.removeUnr(d.mapfile)}
                            date={Functions.convertTimestamp(Functions.utDate(d.time))} playtime={Functions.MMSS(d.gametime)} players={d.players}
                            totalTeams={d.totalTeams} result={d.result} mapImage={image} classic={true}
                        />
                    </a>
                </Link>
            );

        }else{

            elems.push(<tr key={i}>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.convertTimestamp(Functions.utDate(d.time), true)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{d.gamename}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.removeUnr(d.mapfile)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.MMSS(d.gametime)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{d.players}</a></Link></td>
                <td className="padding-0"><Link href={`/classic/match/${d.id}`}><a><MatchResult data={d.result}/></a></Link></td>
            </tr>);
        }
    }

    if(mode === "t"){

        elems = <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Date</th>
                    <th>Gametype</th>
                    <th>Map</th>
                    <th>Playtime</th>
                    <th>Players</th>
                    <th>Result</th>
                </tr>
                {elems}
            </tbody>
        </table>
    }




    return <div className="m-bottom-25">
        <div className="default-header" id="recent-matches">Recent Matches</div>
        <Pagination currentPage={page + 1} pages={pages} perPage={perPage} results={data.totalMatches} 
            url={`/classic/player/${playerId}?mv=${mode}&matchPage=`} anchor={"#recent-matches"}
        />
        <div className="big-tabs">
            <Link href={`/classic/player/${playerId}?mv=d&matchPage=${page + 1}#recent-matches`}>
                <a>
                <div className={`tab ${(mode === "d") ? "tab-selected" : null}`}>Default View</div>
                </a>
            </Link>
            <Link href={`/classic/player/${playerId}?mv=t&matchPage=${page + 1}#recent-matches`}>
                <a>
                    <div className={`tab ${(mode === "t") ? "tab-selected" : null}`}>Table View</div>
                </a>
            </Link>

        </div>
        {elems}
    </div>
}

export default PlayerRecentMatches;