import TipHeader from '../TipHeader'

const KillingSprees = ({data}) =>{

    return (
        
        <div className="special-table">
                <div className="default-header">
                    Killing Sprees
                </div>
                <table>
                    <tbody>
                        <tr>
                            <TipHeader title="Killing Spree" content="Player killed 5 to 9 players in one life." />
                            <TipHeader title="Rampage" content="Player killed 10 to 14 players in one life." />
                            <TipHeader title="Dominating" content="Player killed 15 to 19 players in one life." />
                            <TipHeader title="Unstoppable" content="Player killed 20 to 24 players in one life." />
                            <TipHeader title="Godlike" content="Player killed 25 to 29 players in one life." />
                            <TipHeader title="Massacre" content="Player killed 30 to 34 players in one life." />
                            <TipHeader title="Brutalizing" content="Player killed 35 or more players in one life." />
                            <TipHeader title="Best Spree" content={`Player killed ${data[7]} players in one life.`} />
   
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