import Table2 from "../Table2";

const PlayerADSummary = ({dom, domBest, domBestLife, assault}) =>{

    if(dom === 0 && assault === 0) return null;

    return <div className="special-table">
            <div className="default-header">Assault &amp; Domination</div>
            <Table2 width={1}>
                <tr>
                    <th>Assault Objectives Captured</th>
                    <th>Dom Control Point Caps</th>
                    <th>Most Dom Control Point Caps</th>
                    <th>Most Dom Control Point Caps Life</th>
                </tr>
                <tr>
                    <td>{assault}</td>
                    <td>{dom}</td>
                    <td>{domBest}</td>
                    <td>{domBestLife}</td>
                </tr>
            </Table2>
        </div>
}

export default PlayerADSummary;