const FragSummary = ({data}) =>{

    return (
        <div className="special-table">
                <div className="default-header">
                    Frag Performance
                </div>       
                <table>
                    <tbody>
                        <tr>
                            <th>Score</th>
                            <th>Frags</th>
                            <th>Kills</th>
                            <th>Deaths</th>
                            <th>Suicides</th>
                            <th>Team Kills</th>
                            <th>Spawn Kills</th>
                            <th>Efficiency</th>
                        </tr>
                        <tr>
                            <td>{data[0]}</td>
                            <td>{data[1]}</td>
                            <td>{data[2]}</td>
                            <td>{data[3]}</td>
                            <td>{data[4]}</td>
                            <td>{data[5]}</td>
                            <td>{data[6]}</td>
                            <td>{data[7].toFixed(2)}%</td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
    );
}

export default FragSummary;