import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from 'next/link';
import ACE from '../../api/ace';
import Table2 from "../Table2";

const KickTable = ({host, kicks}) =>{

    if(kicks.length === 0) return null;

    const rows = [];

    for(let i = 0; i < kicks.length; i++){

        const k = kicks[i];

        rows.push(<tr key={i}>
            <td>{Functions.convertTimestamp(k.timestamp, true)}</td>
            <td><Link href={`/ace/?mode=player&name=${k.name}`}><CountryFlag host={host} country={k.country}/>{k.name}</Link></td>
            <td>{k.kick_reason}</td>
            <td>{k.package_name}</td>
            <td>{k.package_version}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-sub-header">Recent Kicks</div>
        <Table2 width={1}>
            <tr>
                <th>Date</th>
                <th>Player</th>
                <th>Kick Reason</th>
                <th>Package Name</th>
                <th>Package Version</th>
            </tr>
            {rows}
        </Table2>
    </div>
}

const PlayersTable = ({host, players}) =>{

    if(players.length === 0) return null;

    const rows = [];

    for(let i = 0; i < players.length; i++){

        const p = players[i];

        rows.push(<tr key={i}>
            <td><Link href={`/ace/?mode=player&name=${p.name}`}><CountryFlag host={host} country={p.country}/>{p.name}</Link></td>
            <td><Link href={`/ace?mode=players&hwid=${p.hwid}`}>{p.hwid}</Link></td>
            <td>{Functions.convertTimestamp(p.first, true)}</td>
            <td>{Functions.convertTimestamp(p.last, true)}</td>
            <td>{p.times_connected}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-sub-header">Recent Players</div>
        <Table2 width={1} players={1}>
            <tr>
                <th>Name</th>
                <th>HWID</th>
                <th>First</th>
                <th>Last</th>
                <th>Times Connected</th>
            </tr>
            {rows}
        </Table2>
    </div>
}

const ScreenShotsTable = ({host, data}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        rows.push(<tr key={i}>
            <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
            <td><Link href={`/ace?mode=players&ip=${d.ip}`}><CountryFlag host={host} country={d.country}/>{d.ip}</Link></td>
            <td>
                <Link href={`/ace?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID: </span> {d.hwid}</Link><br/>
                <Link href={`/ace?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1: </span> {d.mac1}</Link><br/>
                <Link href={`/ace?mode=players&mac2=${d.mac2}`}><span className="yellow">MAC2: </span> {d.mac2}</Link>
            </td>
            <td>{d.admin_name}</td>
            <td><a href={ACE.cleanImageURL(d.screenshot_file)} rel="noreferrer" target="_blank">View</a></td>
        </tr>);

    }

    return <div>
        <div className="default-sub-header">Recent Screenshot Requests</div>
        <Table2 width={1}>
            <tr>
                <th>Date</th>
                <th>IP</th>
                <th>Hardware Info</th>
                <th>Requested By</th>
                <th>Screenshot</th>
            </tr>
            {rows}
        </Table2>    
    </div>
}

const ACEHome = ({host, recentKicks, recentPlayers, recentSShots}) =>{

    return <div>
        <div className="default-header">Recent Events</div>
        <KickTable host={host} kicks={recentKicks}/>
        <PlayersTable host={host} players={recentPlayers} />
        <ScreenShotsTable host={host} data={recentSShots}/>
    </div>
}

export default ACEHome;