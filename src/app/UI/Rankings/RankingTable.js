import { BasicTable } from "../Tables";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import { getOrdinal, toPlaytime, convertTimestamp } from "../../../../api/generic.mjs";
import Image from "next/image";
import MouseOver from "../MouseOver";
import Pagination from "../Pagination";


export default function RankingTable({title, gametypeId, data, page, perPage, bDisplayViewAll, results, lastActive, minPlaytime}){

    if(page === undefined) page = 1;
    if(perPage === undefined) perPage = 1;
    if(bDisplayViewAll === undefined) bDisplayViewAll = false;

    const rows = data.map((d, i) =>{

        const place = i + 1 + perPage * (page - 1);

        let icon = "nochange.png";

        const change = parseFloat(d.ranking_change);

        if(change > 0){
            icon = "up.png";
        }else if(change < 0){
            icon = "down.png";
        }

        let mouseText = "No change";

        if(change > 0){
            mouseText = `Gained ${change} points in latest match.`;
        }else if(change < 0){
            mouseText = `Lost ${change} points in latest match.`;
        }

        return [
            `${place}${getOrdinal(place)}`,
            <Link href={`/player/${d.player_id}`}><CountryFlag country={d.country}/>{d.playerName}</Link>,
            convertTimestamp(d.last_active, true),
            toPlaytime(d.playtime),
            <MouseOver text={mouseText}>{d.ranking} <Image src={`/images/${icon}`} alt="icon" width={12} height={12}/></MouseOver>
        ];
    });

    const pURL = `/rankings/${gametypeId}?lastActive=${lastActive}&minPlaytime=${minPlaytime}&page=`;

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
        {(bDisplayViewAll) ? <Link href={`/rankings/${gametypeId}?lastActive=${lastActive}&minPlaytime=${minPlaytime}`}><div className="view-all">View All <b>{title}</b> Rankings</div></Link> : null}
        {(!bDisplayViewAll) ? <Pagination currentPage={page} results={results} perPage={perPage} url={pURL} /> : ""}
    </div>
}