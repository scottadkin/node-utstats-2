import Functions from '../../../api/functions';

const PlayerCTFSummary = ({totals, max}) =>{

    return <div className="m-bottom-25">
        <div className="default-header">Capture The Flag Summary</div>

        <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Data Type</th>
                    <th>Flag Taken</th>
                    <th>Flag Pickups</th>
                    <th>Flag Drops</th>
                    <th>Flag Assists</th>
                    <th>Covers</th>
                    <th>Seals</th>
                    <th>Flag Captures</th>
                    <th>Flag Kills</th>
                    <th>Flag Returns</th>
                </tr>
                <tr>
                    <td>Totals</td>
                    <td>{Functions.ignore0(totals.taken)}</td>
                    <td>{Functions.ignore0(totals.pickup)}</td>
                    <td>{Functions.ignore0(totals.dropped)}</td>
                    <td>{Functions.ignore0(totals.assist)}</td>
                    <td>{Functions.ignore0(totals.cover)}</td>
                    <td>{Functions.ignore0(totals.seal)}</td>
                    <td>{Functions.ignore0(totals.capture)}</td>
                    <td>{Functions.ignore0(totals.kill)}</td>
                    <td>{Functions.ignore0(totals.return)}</td>
                </tr>
                <tr>
                    <td>Personal Records</td>
                    <td>{Functions.ignore0(max.taken)}</td>
                    <td>{Functions.ignore0(max.pickup)}</td>
                    <td>{Functions.ignore0(max.dropped)}</td>
                    <td>{Functions.ignore0(max.assist)}</td>
                    <td>{Functions.ignore0(max.cover)}</td>
                    <td>{Functions.ignore0(max.seal)}</td>
                    <td>{Functions.ignore0(max.capture)}</td>
                    <td>{Functions.ignore0(max.kill)}</td>
                    <td>{Functions.ignore0(max.return)}</td>
                </tr>
            </tbody>
        </table>
    </div>
}

export default PlayerCTFSummary;