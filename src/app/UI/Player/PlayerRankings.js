import MouseOver from "../MouseOver";
import Image from "next/image";
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, getOrdinal } from "../../../../api/generic.mjs";

export default function PlayerRankings({data}){

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let icon = "/images/nochange.png";
        let rankingString = `No change in the previous match.`;

        if(d.ranking_change > 0){
            icon = "/images/up.png";
            rankingString = `Gained ${parseFloat(d.ranking_change).toFixed(2)} in the previous match.`;
        }else if(d.ranking_change < 0){
            icon = "/images/down.png";
            rankingString = `Lost ${parseFloat(d.ranking_change).toFixed(2)} in the previous match.`;
        }

        rows.push({
            "gametype": {"value": d.gametypeName.toLowerCase(), "displayValue": d.gametypeName, "className": "text-left"},
            "matches": {"value": d.matches},
            "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.playtime), "className": "playtime"},
            "ranking": {"value": d.ranking, "displayValue": <>
                <MouseOver title={`Previous Match Ranking Change`} 
                    text={rankingString}>
                    <span className="ranking-position">({d.position}{getOrdinal(d.position)})</span>
                    <Image width={14} height={14} className="ranking-icon" src={icon} alt="image"/>
                    &nbsp;
                    {parseFloat(d.ranking).toFixed(2)}
                </MouseOver>
            </>}
        });
    }

    const headers = {
        "gametype": "Gametype",
        "matches": "Matches",
        "playtime": "Playtime",
        "ranking": "Ranking"
    };

    return <>
        <div className="default-header">Rankings</div>
        <InteractiveTable width={1} headers={headers} data={rows} />
    </>
}