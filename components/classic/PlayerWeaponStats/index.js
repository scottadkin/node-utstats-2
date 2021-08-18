import Functions from '../../../api/functions';

const PlayerWeaponStats = ({data}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        let accuracy = 0;

        if(d.shots === 0 && d.hits > 0) accuracy = 100;
        if(d.shots > 0 && d.hits > 0) accuracy = (d.hits / d.shots) * 100;

        rows.push(<tr key={i}>
            <td>{d.name}</td>
            <td>{Functions.ignore0(d.kills)}</td>
            <td>{Functions.ignore0(d.shots)}</td>
            <td>{Functions.ignore0(d.hits)}</td>
            <td>{accuracy.toFixed(2)}%</td>
            <td>{Functions.ignore0(Functions.cleanDamage(d.damage))}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">Weapon Stats</div>
        <table className="t-width-1 td-1-left">
            <tr>
                <th>Name</th>
                <th>Kills</th>
                <th>Shots</th>
                <th>Hits</th>
                <th>Accuracy</th>
                <th>Damage</th>
            </tr>
            {rows}
        </table>
    </div>
}

export default PlayerWeaponStats;