import TipHeader from '../TipHeader/';

const KillingSprees = ({data}) =>{

    return (
        
        <div className="special-table">
                <div className="default-header">
                    Multi Kills
                </div>
                <table>
                    <tbody>
                        <tr>
                            <TipHeader title={"Double Kill"} content={"Player killed 2 players in a short amount of time."}/>
                            <TipHeader title={"Multi Kill"} content={"Player killed 3 players in a short amount of time."}/>
                            <TipHeader title={"Mega Kill"} content={"Player killed 4 players in a short amount of time."}/>
                            <TipHeader title={"Ultra Kill"} content={"Player killed 5 players in a short amount of time."}/>
                            <TipHeader title={"Monster Kill"} content={"Player killed 6 players in a short amount of time."}/>
                            <TipHeader title={"Ludicrous Kill"} content={"Player killed 7 players in a short amount of time."}/>
                            <TipHeader title={"Holy Shit"} content={"Player killed 8 players or more in a short amount of time."}/>
                            <TipHeader title={"Best Multi"} content={`Player killed ${data[7]} players in a short amount of time.`}/>
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