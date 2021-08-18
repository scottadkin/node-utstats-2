import Functions from "../../../api/functions";

const PlayerADSummary = ({totals, max}) =>{

    return <div className="m-bottom-25">
        <div className="default-header">Assault and Domination Summary</div>
        <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Total Assault Objectives</th>
                    <th>Total Domination Caps</th>
                    <th>Most Domination Caps in Match</th>
                </tr>
                <tr>
                    <td>{Functions.ignore0(totals.assault)}</td>
                    <td>{Functions.ignore0(totals.dom)}</td>
                    <td>{Functions.ignore0(max.dom)}</td>
                </tr>
            </tbody>
        </table>
    </div>
}

export default PlayerADSummary;