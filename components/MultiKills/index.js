const KillingSprees = ({data}) =>{

    return (
        
        <div className="special-table">
                <div className="default-header">
                    Multi Kills
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Double Kill</th>
                            <th>Multi Kill</th>
                            <th>Mega Kill</th>
                            <th>Ultra Kill</th>
                            <th>Monster Kill</th>
                            <th>Ludicrous Kill</th>
                            <th>Holy Shit</th>
                            <th>Best Multi</th>
                        </tr>
                        <tr>
                            <td>{data[0]}</td>
                            <td>{data[1]}</td>
                            <td>{data[2]}</td>
                            <td>{data[3]}</td>
                            <td>{data[4]}</td>
                            <td>{data[5]}</td>
                            <td>{data[6]}</td>
                            <td>{data[7]} Kills</td>
           
                        </tr>
                    </tbody>
                </table>
            </div>
    );

}


export default KillingSprees;