"use client"
import RankingsExplained from "./RankingsExplained";
import { useRouter } from "next/navigation";

export default function RankingFilter({settings, lastActive, minPlaytime, gametypeId, activeOptions, playtimeOptions}){

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