const gametypeStats = ({data}) =>{

    data = JSON.parse(data);

    console.log(data);

    const elems = [];

    for(let i = 0; i < data.length; i++){

        elems.push(
            <tr>
                <td>{data[i].gametype}</td>
                <td>{data[i].playtime}</td>
                <td>{data[i].matches}</td>
                <td>{data[i].wins}</td>
                <td>{data[i].draws}</td>
                <td>{data[i].losses}</td>
                <td>{}</td>

            </tr>
        );
    }

    return (
        
        <div className="special-table">
                <div className="default-header">
                    Gametype Stats
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Gametype</th>
                            <th>Playtime</th>
                            <th>Matches</th>
                            <th>Wins</th>
                            <th>Draws</th>
                            <th>Losses</th>
                            <th>WinRate</th>
                        </tr>
                        {elems}
                    </tbody>
                </table>
            </div>
    );

}


export default gametypeStats;