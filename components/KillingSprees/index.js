const KillingSprees = ({data}) =>{

    return (
        
        <div className="special-table">
                <div className="default-header">
                    Killing Sprees
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Killing Spree</th>
                            <th>Rampage</th>
                            <th>Dominating</th>
                            <th>Unstoppable</th>
                            <th>Godlike</th>
                            <th>Massacre</th>
                            <th>Brutalizing</th>
                            <th>Best Spree</th>
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