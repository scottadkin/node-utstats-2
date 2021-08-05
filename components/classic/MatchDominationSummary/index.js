import Functions from "../../../api/functions";
import CountryFlag from "../../CountryFlag";
import Link from "next/link";

function bAnyDomData(players){

    for(let i = 0; i < players.length; i++){

        if(players[i].dom_cp > 0) return true;
    }

    return false;
}

const TeamTable = ({teamId, players, matchId}) =>{

    const rows = [];
    const colorClass = Functions.getTeamColor(teamId);

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(p.team !== teamId) continue;

        if(p.dom_cp < 0) return null;

        rows.push(<tr key={i}>
            <td className={colorClass}>
                <Link href={`/classic/pmatch/${matchId}?p=${p.pid}`}>
                    <a>
                        <CountryFlag country={p.country}/>{p.name}
                    </a>
                </Link>
            </td>
            <td>{p.dom_cp}</td>
        </tr>);
    }

    return <table className="t-width-2 td-1-left td-1-150 m-bottom-25">
        <tbody>
            <tr>
                <th>Player</th>
                <th>Control Point Captures</th>
            </tr>
            {rows}
        </tbody>
    </table>
}

const MatchDominationSummary = ({data, teams, matchId}) =>{

    if(!bAnyDomData(data)) return null;

    const tables = [];

    for(let i = 0; i < teams; i++){

        tables.push(<TeamTable teamId={i} players={data} matchId={matchId}/>);
    }

    return <div>
        <div className="default-header">Domination Summary</div>
        {tables}
    </div>
}

export default MatchDominationSummary;