import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from 'next/link';

const KickTable = ({kicks}) =>{

    if(kicks.length === 0) return null;

    const rows = [];

    for(let i = 0; i < kicks.length; i++){

        const k = kicks[i];

        rows.push(<tr key={i}>
            <td>{Functions.convertTimestamp(k.timestamp, true)}</td>
            <td><Link href={`/ace/?mode=player&name=${k.name}`}><a><CountryFlag country={k.country}/>{k.name}</a></Link></td>
            <td>{k.kick_reason}</td>
            <td>{k.package_name}</td>
            <td>{k.package_version}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-sub-header">Recent Kicks</div>
        <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Date</th>
                    <th>Player</th>
                    <th>Kick Reason</th>
                    <th>Package Name</th>
                    <th>Package Version</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

const PlayersTable = ({players}) =>{

    if(players.length === 0) return null;

    const rows = [];

    for(let i = 0; i < players.length; i++){

        const p = players[i];

        rows.push(<tr key={i}>
            <td><Link href={`/ace/?mode=player&name=${p.name}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>
            <td>{p.hwid}</td>
            <td>{Functions.convertTimestamp(p.first, true)}</td>
            <td>{Functions.convertTimestamp(p.last, true)}</td>
            <td>{p.times_connected}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-sub-header">Recent Players</div>
        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>HWID</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Times Connected</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

const ACEHome = ({recentKicks, recentPlayers}) =>{

    return <div>
        <div className="default-header">Recent Events</div>
        <KickTable kicks={recentKicks}/>
        <PlayersTable players={recentPlayers} />
    </div>
}

export default ACEHome;