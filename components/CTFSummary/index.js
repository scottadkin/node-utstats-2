const CTFSummary = ({data}) =>{

    return (
        <div className="special-table">
                <div className="default-header">
                    Capture The Flag Performance
                </div>       
                <table>
                    <tbody>
                        <tr>
                            <th>Flag Grab</th>
                            <th>Flag Pickup</th>
                            <th>Flag Dropped</th>
                            <th>Flag Capture</th>
                            <th>Flag Assist</th>
                            <th>Flag Cover</th>
                            <th>Flag Kill</th>
                            <th>Flag Return</th>
                            <th>Flag Close Save</th>
           
                        </tr>
                        <tr>
                            <td>{data[0]}</td>
                            <td>{data[1]}</td>
                            <td>{data[2]}</td>
                            <td>{data[3]}</td>
                            <td>{data[4]}</td>
                            <td>{data[5]}</td>
                            <td>{data[6]}</td>
                            <td>{data[7]}</td>
                            <td>{data[8]}</td>
                      
                        </tr>
                    </tbody>
                </table>
                
            </div>
    );
}


export default CTFSummary;