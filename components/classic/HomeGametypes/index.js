import Functions from "../../../api/functions";

const HomeGametypes = ({data}) =>{

    if(data.length === 0) return null;

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let hours = 0;

        if(d.gametime > 0){
            hours = d.gametime / (60 * 60);
        }

        rows.push(<tr key={i}>
            <td>{d.name}</td>
            <td>{Functions.convertTimestamp(Functions.utDate(d.first_match), true)}</td>
            <td>{Functions.convertTimestamp(Functions.utDate(d.last_match), true)}</td>
            <td>{d.total_matches}</td>
            <td>{hours.toFixed(2)} Hours</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">Most Played Gametypes</div>
        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>

}

export default HomeGametypes;