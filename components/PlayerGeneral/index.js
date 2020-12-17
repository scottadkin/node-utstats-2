const CTFSummary = ({data}) =>{


    let hours = data[2] / (60 * 60);

    if(hours !== hours) hours = 0;

    let winRate = data[4] / data[3];

    if(winRate !== winRate) winRate = 0;
    //if(){

  //  }

    return (
        <div className="special-table">
                <div className="default-header">
                    General Stats
                </div>       
                <table>
                    <tbody>
                        <tr>
                            <th>Country</th>   
                            <th>Playtime</th>   
                            <th>Matches</th>   
                            <th>Wins</th>   
                            <th>Draws</th>   
                            <th>Losses</th>   
                            <th>WinRate</th>   
                        </tr>
                        <tr>
                            <td><img className="country-flag" src={`../images/flags/${data[1]}.svg`} alt="image"/> {data[0]}</td> 
                            <td>{hours.toFixed(2)} Hours</td> 
                            <td>{data[3]}</td> 
                            <td>{data[4]}</td> 
                            <td>{data[5]}</td> 
                            <td>{data[6]}</td> 
                            <td>{(winRate * 100).toFixed(2)}%</td> 
                        </tr>
                    </tbody>
                </table>
                
            </div>
    );
}


export default CTFSummary;