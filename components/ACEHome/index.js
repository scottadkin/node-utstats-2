import Functions from "../../api/functions";

const KickTable = ({kicks}) =>{

    if(kicks.length === 0) return null;

    const rows = [];

    for(let i = 0; i < kicks.length; i++){

        const k = kicks[i];

        rows.push(<tr key={i}>
            <td>{Functions.convertTimestamp(k.timestamp, true)}</td>
            <td>{k.name}</td>
            <td>{k.kick_reason}</td>
            <td>{k.package_name}</td>
            <td>{k.package_version}</td>
        </tr>);
    }

    return <div>
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

const ACEHome = ({recentKicks}) =>{

    return <div>
        <div className="default-header">Recent Events</div>
        <KickTable kicks={recentKicks}/>
    </div>
}

export default ACEHome;