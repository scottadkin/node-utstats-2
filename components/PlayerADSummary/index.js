const PlayerADSummary = ({dom, domBest, assault}) =>{

    if(dom === 0 && assault === 0) return null;

    return <div className="special-table">
            <div className="default-header">Assault & Domination</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Assault Objectives Captured</th>
                        <th>Domination Control Point Caps</th>
                        <th>Most Domination Control Point Caps</th>
                    </tr>
                    <tr>
                        <td>{assault}</td>
                        <td>{dom}</td>
                        <td>{domBest}</td>
                    </tr>
                </tbody>
            </table>
        </div>
}

export default PlayerADSummary;