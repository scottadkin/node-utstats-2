"use client"
import RankingsExplained from "./RankingsExplained";
import { useRouter } from "next/navigation";

const activeOptions = [
    {"value": "0", "name": "No Limit"},
    {"value": "1", "name": "Past 1 Day"},
    {"value": "7", "name": "Past 7 Days"},
    {"value": "28", "name": "Past 28 Days"},
    {"value": "90", "name": "Past 90 Days"},
    {"value": "365", "name": "Past 365 Days"}
];

const playtimeOptions = [
    {"value": "0", "name": "No Limit"},
    {"value": "1", "name": "1 Hour"},
    {"value": "2", "name": "2 Hours"},
    {"value": "3", "name": "3 Hours"},
    {"value": "6", "name": "6 Hours"},
    {"value": "12", "name": "12 Hours"},
    {"value": "24", "name": "24 Hours"},
    {"value": "48", "name": "48 Hours"}
];

export default function RankingFilter({settings, lastActive, minPlaytime, gametypeId}){

    const router = useRouter();

    return <>
        <div className="form m-bottom-25">
            <div className="form-row">
                <label htmlFor="active">Active Within</label>
                <select id="active" defaultValue={lastActive} className="default-select" onChange={(e) =>{
                    router.push(`/rankings/${gametypeId}?lastActive=${e.target.value}&minPlaytime=${minPlaytime}`);
                }}>
                    {activeOptions.map((a, i) =>{
                        return <option key={i} value={a.value}>{a.name}</option>;
                    })}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="playtime">Min Playtime</label>
                <select id="playtime" className="default-select" defaultValue={minPlaytime} onChange={(e) =>{
                    router.push(`/rankings/${gametypeId}?lastActive=${lastActive}&minPlaytime=${e.target.value}`);
                }}>
                    {playtimeOptions.map((p, i) =>{
                        return <option key={i} value={p.value}>{p.name}</option>;
                    })}
                </select>
            </div>
        </div>
        <RankingsExplained settings={settings}/>
    </>
}