import Functions from '../../api/functions';
import Table2 from '../Table2';
import CountryFlag from '../CountryFlag';
import Image from 'next/image';
import Playtime from '../Playtime';


const PlayerGeneral = ({host,flag, country, face, first, last, matches, playtime, wins, losses, winRate, draws}) =>{

    if(flag === "") flag = "xx";

    return <div>
        <Table2 width={1}>
            <tr>
                <th>Face</th>
                <th>Country</th>
                <th>First Seen</th>
                <th>Last Seen</th>
                <th>Matches</th>
                <th>Wins</th>
                <th>Draws</th>
                <th>Losses</th>
                <th>Win Rate</th>
                <th>Playtime</th>
            </tr>
            <tr>
                <td><Image src={`/images/faces/${face}.png`} alt="face" width={46} height={46}/></td>
                <td><CountryFlag country={flag}/>{country}</td>
                <td>{Functions.convertTimestamp(first,true)}</td>
                <td>{Functions.convertTimestamp(last,true)}</td>
                <td>{matches}</td>
                <td>{wins}</td>
                <td>{draws}</td>
                <td>{losses}</td>
                <td>{winRate}%</td>
                <td className="playtime"><Playtime timestamp={playtime}/></td>
            </tr>
        </Table2>
    
    </div>
}


export default PlayerGeneral;