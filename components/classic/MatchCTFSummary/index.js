import Functions from '../../../api/functions';
import CountryFlag from '../../CountryFlag';
import Link from 'next/link';

const TeamTable = ({teamId, players, matchId}) =>{

    const classColor = Functions.getTeamColor(teamId);

    const rows = [];

    let p = 0;

    const totals = {
        "taken": 0,
        "pickup": 0,
        "dropped": 0,
        "assist": 0,
        "cover": 0,
        "seal": 0,
        "capture": 0,
        "kill": 0,
        "return": 0
    };

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(p.team !== teamId) continue;

        totals.taken += p.flag_taken;
        totals.pickup += p.flag_pickedup;
        totals.dropped += p.flag_dropped;
        totals.assist += p.flag_assist;
        totals.cover += p.flag_cover;
        totals.seal += p.flag_seal;
        totals.capture += p.flag_capture;
        totals.kill += p.flag_kill;
        totals.return += p.flag_return;

        rows.push(<tr key={i}>
            <td className={classColor}>
                <Link href={`/classic/pmatch/${matchId}?p=${p.pid}`}>
                    <a>
                        <CountryFlag country={p.country}/>{p.name}
                    </a>
                </Link>          
            </td>
            <td>{Functions.ignore0(p.flag_taken)}</td>
            <td>{Functions.ignore0(p.flag_pickedup)}</td>
            <td>{Functions.ignore0(p.flag_dropped)}</td>
            <td>{Functions.ignore0(p.flag_assist)}</td>
            <td>{Functions.ignore0(p.flag_cover)}</td>
            <td>{Functions.ignore0(p.flag_seal)}</td>
            <td>{Functions.ignore0(p.flag_capture)}</td>
            <td>{Functions.ignore0(p.flag_kill)}</td>
            <td>{Functions.ignore0(p.flag_return)}</td>
        </tr>);
    }

    if(rows.length > 1){

        rows.push(<tr key={`team-${teamId}`}>
            <td>
                Totals        
            </td>
            <td>{Functions.ignore0(totals.taken)}</td>
            <td>{Functions.ignore0(totals.pickup)}</td>
            <td>{Functions.ignore0(totals.dropped)}</td>
            <td>{Functions.ignore0(totals.assist)}</td>
            <td>{Functions.ignore0(totals.cover)}</td>
            <td>{Functions.ignore0(totals.seal)}</td>
            <td>{Functions.ignore0(totals.capture)}</td>
            <td>{Functions.ignore0(totals.kill)}</td>
            <td>{Functions.ignore0(totals.return)}</td>
        </tr>);
    }

    if(rows.length === 0) return null;

    return <table className="t-width-1 td-1-left td-1-150 m-bottom-25">
        <tbody>
            <tr>
                <th>Player</th>
                <th>Flag<br/>Taken</th>
                <th>Flag<br/>Pickup</th>
                <th>Flag<br/>Drop</th>
                <th>Flag<br/>Assist</th>
                <th>Flag<br/>Cover</th>
                <th>Flag<br/>Seal</th>
                <th>Flag<br/>Capture</th>
                <th>Flag<br/>Kill</th>
                <th>Flag<br/>Return</th>
            </tr>
            {rows}
        </tbody>
    </table>
}

const MatchCTFSummary = ({teams, data, matchId}) =>{

    if(teams < 2) return null;

    const tables = [];

    for(let i = 0; i < teams; i++){

        tables.push(<TeamTable key={i} teamId={i} players={data} matchId={matchId}/>);
    }

    if(tables.length === 0) return null;

    return <div className="m-bottom-25">
        <div className="default-header">Capture The Flag Summary</div>
        {tables}
    </div>
}

export default MatchCTFSummary;