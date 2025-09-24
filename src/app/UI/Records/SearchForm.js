"use client"
import { removeUnr } from "../../../../api/generic.mjs";
import { useRouter } from "next/navigation";
import Tabs from "../Tabs";

export default function SearchForm({cat, perPageTypes, types, gametypeNames, 
    mapNames, selectedType, selectedGametype, selectedMap, selectedPerPage}){

    const typeOptions = types.map((t, i) =>{
        return <option key={i} value={t.value}>{t.displayValue}</option>
    });

    const ppOptions = perPageTypes.map((p, i) =>{
        return <option key={i} value={p.value}>{p.displayValue}</option>
    });

    const gOptions = gametypeNames.map((g) =>{
        const {id, name} = g;
        return <option key={id} value={id}>{name}</option>;
    });

    const mOptions = mapNames.map((m) =>{
        const {id, name} = m;
        return <option key={id} value={id}>{removeUnr(name)}</option>;
    });


    const tabOptions = [
        {"name": "Player Totals Records", "value": "player-totals"},
        {"name": "Player Match Records", "value": "player-match"},
        //{"name": "CTF Caps", "value": "ctf-caps"},
    ];
    const router = useRouter();


    return <>
        <Tabs options={tabOptions} selectedValue={cat} changeSelected={(v) =>{
            router.push(`/records/${v}/`);
        }}/>
        <div className="form m-bottom-25">
            <div className="form-row">
                <label htmlFor="type">Record Type</label>
                <select id="type" defaultValue={selectedType} className="default-select" onChange={(e) =>{
                    router.push(`/records/${cat}/?type=${e.target.value}&g=${selectedGametype}&m=${selectedMap}&pp=${selectedPerPage}`);
                }}>
                    {typeOptions}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="gametype">Gametype</label>
                <select id="gametype" defaultValue={selectedGametype} className="default-select" onChange={(e) =>{
                    router.push(`/records/${cat}/?type=${selectedType}&g=${e.target.value}&m=${selectedMap}&pp=${selectedPerPage}`);
                }}>
                    <option value="0">Any Gametype</option>
                    {gOptions}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="map">Map</label>
                <select id="map" defaultValue={selectedMap} className="default-select" onChange={(e) =>{
                    router.push(`/records/${cat}/?type=${selectedType}&g=${selectedGametype}&m=${e.target.value}&pp=${selectedPerPage}`);
                }}>
                    <option value="0">Any Map</option>
                    {mOptions}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="pp">Per Page</label>
                <select id="pp" defaultValue={selectedPerPage} className="default-select"  onChange={(e) =>{
                    router.push(`/records/${cat}/?type=${selectedType}&g=${selectedGametype}&m=${selectedMap}&pp=${e.target.value}`);
                }}>
                    {ppOptions}
                </select>
            </div>
        </div>
    </>
}