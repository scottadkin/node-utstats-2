const PlayerGeneral = ({totals, gametypes}) =>{

    const rows = [];

    let eff = 0;

    if(totals.kills > 0 && totals.deaths === 0){
        eff = 100;
    }else{

        if(totals.kills === 0){
            eff =0;
        }else{
            eff = (totals.kills / (totals.kills + totals.deaths)) * 100;
        }
    }

    const totalsRow = <tr key={-1}>
        <td>Totals</td>
        <td>{totals.matches}</td>
        <td>{totals.playtime} Hours</td>
        <td>{totals.score}</td>
        <td>{totals.frags}</td>
        <td>{totals.kills}</td>
        <td>{totals.deaths}</td>
        <td>{totals.suicides}</td>
        <td>{eff.toFixed(2)}%</td>
        <td>{totals.teamKills}</td>
    </tr>;

    

    for(let i = 0; i < gametypes.length; i++){

        const g = gametypes[i];

        let playtime = g.playtime;

        if(playtime !== 0){
            playtime = (playtime / (60 * 60)).toFixed(2)
        }

        let eff = 0;

        if(g.kills > 0 && g.deaths === 0) eff = 100;
        if(g.kills > 0 && g.deaths > 0) eff = (g.kills / (g.kills + g.deaths)) * 100;

        rows.push(<tr key={i}>
            <td>{g.name}</td>
            <td>{g.total_matches}</td>
            <td>{playtime} Hours</td>
            <td>{g.gamescore}</td>
            <td>{g.frags}</td>
            <td>{g.kills}</td>
            <td>{g.deaths}</td>
            <td>{g.suicides}</td>
            <td>{eff.toFixed(2)}%</td>
            <td>{g.teamKills}</td>
        </tr>);
    }


    rows.push(totalsRow);

    return <div>
        <table className="t-width-1 m-bottom-25 td-1-left">
            <tbody>
                <tr>
                    <th>Gametype</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                    <th>Score</th>
                    <th>Frags</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>Suicides</th>
                    <th>Efficiency</th>
                    <th>Team Kills</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}


export default PlayerGeneral;