import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";

const renderData = (gametypeNames, totals, best, bestLife, selectedTab) =>{

    let headers = {   
        "cover": "Cover",
        "multi": {"title": "Multi Cover", "detailedTitle": "Flag Multi Cover", "content": "Player covered the flag carrier 3 times when the flag was taken."},
        "spree": {"title": "Cover Spree", "detailedTitle": "Flag Cover Spree", "content": "Player covered the flag carrier 4 or more times when the flag was taken."},
        "bestCover": {"title": "Best Cover", "detailedTitle": "Best Single Cover", "content": "The most covers the player got when the flag was taken."},
        "goodCovers": {"title": "Good Covers", "detailedTitle": "Good Flag Covers", "content": "Covers where the flag was captured."},
        "badCovers": {"title": "Bad Covers", "detailedTitle": "Bad Flag Covers", "content": "Covers where the flag was returned."},
        "seal": {"title": "Seals", "detailedTitle": "Flag Seals", "content": "Player sealed off their base when their team had the enemy flag."},
        "bestSeal": {"title": "Best Seals", "detailedTitle": "Best Single Flag Seal", "content": "The most seals the player got in a single go."},
        "goodSeal": {"title": "Good Seals", "detailedTitle": "Good Flag Seals", "content": "Flag seals where the player's team capped the flag."},
        "badSeal": {"title": "Bad Seals", "detailedTitle": "Bad Flag Seals", "content": "Flag seals where the flag was returned by the enemy team."},

    };


    if(selectedTab !== 0){
        headers = Object.assign({"gametype": "Gametype"}, headers);
    }

    const rows = [];

    let data = [];

    if(selectedTab < 2) data = totals;
    if(selectedTab === 2) data = best;
    if(selectedTab === 3) data = bestLife;

    
    for(let i = 0; i < data.length; i++){

        const d = data[i];
        
        const gametypeName = gametypeNames[d.gametype_id] ?? "Not Found";

        const current = {
            "gametype": {"value": gametypeName.toLowerCase(), "displayValue": gametypeName, "className": "text-left"},
            "cover": {"value": d.flag_cover, "displayValue": Functions.ignore0(d.flag_cover)},
            "multi": {"value": d.flag_cover_multi, "displayValue": Functions.ignore0(d.flag_cover_multi)},
            "spree": {"value": d.flag_cover_spree, "displayValue": Functions.ignore0(d.flag_cover_spree)},
            "bestCover": {"value": d.best_single_cover, "displayValue": Functions.ignore0(d.best_single_cover)},
            "goodCovers": {"value": d.flag_cover_pass, "displayValue": Functions.ignore0(d.flag_cover_pass)},
            "badCovers": {"value": d.flag_cover_fail, "displayValue": Functions.ignore0(d.flag_cover_fail)},
            "seal": {"value": d.flag_seal, "displayValue": Functions.ignore0(d.flag_seal)},
            "bestSeal": {"value": d.best_single_seal, "displayValue": Functions.ignore0(d.best_single_seal)},
            "goodSeal": {"value": d.flag_seal_pass, "displayValue": Functions.ignore0(d.flag_seal_pass)},
            "badSeal": {"value": d.flag_seal_fail, "displayValue": Functions.ignore0(d.flag_seal_fail)},
        };

        if(d.gametype_id !== 0){
            rows.push(current);
        }
    }

    
    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

const PlayerCTFSummaryCovers = ({gametypeNames, totals, best, bestLife, recordType}) =>{

    return <div>   
        {renderData(gametypeNames, totals, best, bestLife, recordType)}
    </div>
}

export default PlayerCTFSummaryCovers;