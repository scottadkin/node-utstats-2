import Functions from '../../../api/functions';
import MouseHoverBox from '../../MouseHoverBox';
import Image from 'next/image';

const PlayerRankingSummary = ({data, playerName}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const playtime = (d.time > 0) ? (d.time / 60).toFixed(2) : 0;
        const diff = d.rank - d.prevrank;
        const icon = (diff === 0) ? "nc" : (diff > 0) ? "up" : "down";

        let hoverContent = `No change of points in the last match.`;

        if(diff > 0){
            hoverContent = `${playerName} gained ${diff.toFixed(2)} points in the last match.`;
        }else{
            hoverContent = `${playerName} lost ${Math.abs(diff).toFixed(2)} points in the last match.`;
        }

        let percentile = 0;

        if(d.totalPlayers > 0 && d.position > 0){
            const percent = 100 / d.totalPlayers;
            percentile = Math.floor(100 - (percent * d.position));
            //percentile = Math.floor((d.position / d.totalPlayers) * 100);
        }

        rows.push(<tr key={i}>
            <td>{d.name}</td>
            <td>{playtime} Hours</td>
            <td>{d.matches}</td>
            <td>
                <span className="ranking-position"><i>({d.position}{Functions.getOrdinal(d.position)}) </i></span>
                <Image width={16} height={16} className="ranking-icon" src={`/images/${icon}.png`} alt="icon"/>
                <MouseHoverBox title={"Ranking change in latest match"} content={hoverContent} display={d.rank.toFixed(2)}/>
            </td>
            <td>
      
                <MouseHoverBox title={"Percentile"} 
                content={`${playerName} is in the ${(percentile >= 50) ? "Top" : "Bottom"} ${percentile}%`} 
                display={`${d.position}${Functions.getOrdinal(d.position)} out of ${d.totalPlayers}`}/> 

                 
            </td>
        </tr>);
    }


    return <div className="m-bottom-25">
        <div className="default-header">Ranking Summary</div>

        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>Gametype</th>
                    <th>Playtime</th>
                    <th>Matches</th>
                    <th>Points</th>
                    <th>Position</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default PlayerRankingSummary;