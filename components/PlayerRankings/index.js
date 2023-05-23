import MouseHoverBox from '../MouseHoverBox/';
import Image from 'next/image';
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, getOrdinal } from '../../api/generic.mjs';

const PlayerRankings = ({data, gametypeNames, positions}) =>{

    data = JSON.parse(data);
    gametypeNames = JSON.parse(gametypeNames);
    positions = JSON.parse(positions);

    const rows = [];

    let icon = "";
    let rankingString = "";

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.ranking_change > 0){
            icon = "/images/up.png";
            rankingString = `Gained ${d.ranking_change.toFixed(2)} in the previous match.`;
        }else if(d.ranking_change < 0){
            icon = "/images/down.png";
            rankingString = `Lost ${d.ranking_change.toFixed(2)} in the previous match.`;
        }else{
            icon = "/images/nochange.png";
            rankingString = `No change in the previous match.`;
        }

        const currentName = (gametypeNames[d.gametype] !== undefined) ? gametypeNames[d.gametype] : "Not Found";
        const position = (positions[d.gametype] !== undefined) ? positions[d.gametype]  : "-1" ;

        rows.push({
            "gametype": {"value": currentName.toLowerCase(), "displayValue": currentName, "className": "text-left"},
            "matches": {"value": d.matches},
            "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.playtime), "className": "playtime"},
            "ranking": {"value": d.ranking, "displayValue": <>
                <span className="ranking-position">({position}{getOrdinal(position)})</span>
                <Image width={14} height={14} className="ranking-icon" src={icon} alt="image"/>
                &nbsp;
                <MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={rankingString} 
                    display={d.ranking.toFixed(2)} 
                />
            </>}
        });
    }


    const headers = {
        "gametype": "Gametype",
        "matches": "Matches",
        "playtime": "Playtime",
        "ranking": "Ranking"
    };

    return <div>
        <div className="default-header">Rankings</div>
        <InteractiveTable width={1} headers={headers} data={rows} />
 
    </div>
}

export default PlayerRankings;