import CountryFlag from "../../CountryFlag";
import Link from 'next/link';
import Functions from "../../../api/functions";

const MatchAssaultSummary = ({data, matchId}) =>{

    const rows = [];
    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.ass_obj === 0) continue;

        rows.push(<tr key={i}>
            <td className={Functions.getTeamColor(d.team)}>
                <Link href={`/classic/pmatch/${matchId}?p=${d.pid}`}>
                    <a>
                        <CountryFlag country={d.country}/>
                        {d.name}
                    </a>
                </Link>
            </td>
            <td>{d.ass_obj}</td>
        </tr>);

    }

    if(rows.length === 0) return null;

    return <div className="m-bottom-25">
        <div className="default-header">Assault Summary</div>
        <table className="t-width-2 td-1-left td-1-150">
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Objectives Captured</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default MatchAssaultSummary;