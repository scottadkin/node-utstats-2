import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import Link from "next/link";
import CountryFlag from "../CountryFlag";

const MatchTeleFrags = ({data, matchId}) =>{

    const headers = {
        "player": "Player",
        "kills": "Kills",
        "deaths": "Deaths",
        "bestSpree": "Best Spree",
        "bestMulti": "Best Multi Kill",
        "discKills": "Disc Kills",
        "discDeaths": "Disc Deaths",
        "discSpree": "Disc Best Spree",
        "discMulti": "Disc Best Multi Kill",
    };

    const columns = data.map((d) =>{

        return {
            "player": {
                "value": d.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${d.player_id}`}>
                    <a>
                        <CountryFlag country={d.country}/>
                        {d.name}
                    </a>
                </Link>,
                "className": `text-left ${Functions.getTeamColor(d.team)}`
            },
            "kills": {"value": d.telefrag_kills, "displayValue": Functions.ignore0(d.telefrag_kills)},
            "deaths": {"value": d.telefrag_deaths, "displayValue": Functions.ignore0(d.telefrag_deaths)},
            "bestSpree": {"value": d.telefrag_best_spree, "displayValue": Functions.ignore0(d.telefrag_best_spree)},
            "bestMulti": {"value": d.telefrag_best_multi, "displayValue": Functions.ignore0(d.telefrag_best_multi)},
            "discKills": {"value": d.tele_disc_kills, "displayValue": Functions.ignore0(d.tele_disc_kills)},
            "discDeaths": {"value": d.tele_disc_deaths, "displayValue": Functions.ignore0(d.tele_disc_deaths)},
            "discSpree": {"value": d.tele_disc_best_spree, "displayValue": Functions.ignore0(d.tele_disc_best_spree)},
            "discMulti": {"value": d.tele_disc_best_multi, "displayValue": Functions.ignore0(d.tele_disc_best_multi)},
        }
    });

    return <div>
        <div className="default-header">Telefrags Summary</div>
        <InteractiveTable width={1} headers={headers} data={columns}/>
    </div>
}

export default MatchTeleFrags;