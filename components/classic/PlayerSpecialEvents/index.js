import Functions from '../../../api/functions';

const PlayerSpecialEvents = ({data}) =>{

    return <div className="m-bottom-25">
        <div className="default-header">Special Events</div>

        <table className="t-width-2 m-bottom-25">
            <tbody>
                <tr>
                    <th>Double Kill</th>
                    <th>Multi Kill</th>
                    <th>Ultra Kill</th>
                    <th>Monster Kill</th>
                </tr>
                <tr>
                    <td>{Functions.ignore0(data.multis.double)}</td>
                    <td>{Functions.ignore0(data.multis.multi)}</td>
                    <td>{Functions.ignore0(data.multis.ultra)}</td>
                    <td>{Functions.ignore0(data.multis.monster)}</td>
                </tr>
            </tbody>
        </table>

        <table className="t-width-2">
            <tbody>
                <tr>
                    <th>Killing Spree</th>
                    <th>Rampage</th>
                    <th>Dominating</th>
                    <th>Unstoppable</th>
                    <th>Godlike</th>
                </tr>
                <tr>
                    <td>{Functions.ignore0(data.sprees.spree)}</td>
                    <td>{Functions.ignore0(data.sprees.rampage)}</td>
                    <td>{Functions.ignore0(data.sprees.dominating)}</td>
                    <td>{Functions.ignore0(data.sprees.unstoppable)}</td>
                    <td>{Functions.ignore0(data.sprees.godlike)}</td>
                </tr>
            </tbody>
        </table>

    </div>
}

export default PlayerSpecialEvents;