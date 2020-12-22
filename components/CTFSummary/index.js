import TipHeader from '../TipHeader'

const CTFSummary = ({data}) =>{

    return (
        <div className="special-table">
                <div className="default-header">
                    Capture The Flag Performance
                </div>       
                <table>
                    <tbody>
                        <tr>
                            <TipHeader title="Flag Grab" content="Player grabbed the enemy flag from the enemy base."/>
                            <TipHeader title="Flag Pickup" content="Player picked up the enemy flag that was dropped by a team mate."/>
                            <TipHeader title="Flag Dropped" content="Player dropped the enemy flag."/>
                            <TipHeader title="Flag Capture" content="Player captured the enemy flag and scored a point for their team."/>
                            <TipHeader title="Flag Assist" content="Player had contact with a flag that was later captured without being returned."/>
                            <TipHeader title="Flag Cover" content="Player killed an enemy that was close to their team mate that had the enemy flag."/>
                            <TipHeader title="Flag Kill" content="Player killed the enemy flag carrier."/>
                            <TipHeader title="Flag Return" content="Player returned their flag that was dropped by an enemy."/>
                            <TipHeader title="Flag Close Save" content="Player return their flag that was close to the enemy flag base."/>
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