const MatchDominationSummaryTable = ({team, players, controlPointNames, capData}) =>{

    players = JSON.parse(players);
    controlPointNames = JSON.parse(controlPointNames);
    const pointNames = [];

    for(let i = 0; i < controlPointNames.length; i++){

        pointNames.push(
            <th>
                {controlPointNames[i].name}
            </th>
        );
    }

    const elems = [];


    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i]
        elems.push(<tr>

        </tr>);
    }

    return (<div>
        <table>
            <tbody>
                <tr>
                    <th>Player</th>
                    {pointNames}
                    <th>Total Captures</th>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}

export default MatchDominationSummaryTable;