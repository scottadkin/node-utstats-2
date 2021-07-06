import Functions from "../../api/functions";

const PlayerMatchTeamChanges = ({data, matchStart}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        rows.push(<tr key={i}>
            <td>{Functions.MMSS(data[i].timestamp - matchStart)}</td>
            <td className={Functions.getTeamColor(data[i].team)}>{Functions.getTeamName(data[i].team)}</td>
        </tr>);
    }

    if(data.length === 0) return null;

    return <div className="m-bottom-25">
        <div className="default-header">Team Summary</div>

        <table className="t-width-2">
            <tbody>
                <tr>
                    <th>Timestamp</th>
                    <th>Team Joined</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default PlayerMatchTeamChanges;