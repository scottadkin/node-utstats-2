import { BasicTable } from "../Tables";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import { getOrdinal, toPlaytime, convertTimestamp } from "../../../../api/generic.mjs";
import Image from "next/image";


//TODO: Add mouse over info for ranking change icon, display ranking change value from recent match
export default function RankingTable({title, data, page, perPage}){

    if(page === undefined) page = 1;
    if(perPage === undefined) perPage = 1;

    const rows = data.map((d, i) =>{

        const place = i + perPage * page;

        let icon = "nochange.png";

        const change = parseFloat(d.ranking_change);

        if(change > 0){
            icon = "up.png";
        }else if(change < 0){
            icon = "down.png";
        }

        return [
            `${place}${getOrdinal(place)}`,
            <Link href={`/player/${d.player_id}`}><CountryFlag country={d.country}/>{d.playerName}</Link>,
            convertTimestamp(d.last_active, true),
            toPlaytime(d.playtime),
            <>{d.ranking} <Image src={`/images/${icon}`} alt="icon" width={12} height={12}/></>
        ];
    });

    return <div className="default">
        <div className="default-header">{title}</div>
        <BasicTable width={4} headers={[
                "Place", "Player", "Last Active", "Playtime", "Ranking"
            ]}
            rows={rows}
            columnStyles={[
                "place", "text-left", "playtime", "playtime", null
            ]}
        />
    </div>
}