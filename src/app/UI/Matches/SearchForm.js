"use client"
import { removeUnr } from "../../../../api/generic.mjs";
import { useRouter } from "next/navigation";


function getPerPageOptions(){

    return [
        <option key="0" value="5">5</option>,
        <option key="1"value="10">10</option>,
        <option key="2" value="25">25</option>,
        <option key="3" value="50">50</option>,
        <option key="4" value="75">75</option>,
        <option key="5" value="100">100</option>,
    ];
}

export default function SearchForm({selectedServer, selectedGametype, 
    selectedMap, displayMode, serverNames, gametypeNames, mapNames,
    perPage
}){

    const router = useRouter();


    const serverOptions = [
        <option key="0" value="0">Any</option>
    ];

    for(const [id, name] of Object.entries(serverNames)){
        serverOptions.push(<option key={id} value={id}>{name}</option>);
    }

    const gametypeOptions = [
        <option key="0" value="0">Any</option>
    ];

    for(const [id, name] of Object.entries(gametypeNames)){
        gametypeOptions.push(<option key={id} value={id}>{name}</option>);
    }

    const mapOptions = [
        <option key="0" value="0">Any</option>
    ];

    for(const [id, name] of Object.entries(mapNames)){
        mapOptions.push(<option key={id} value={id}>{removeUnr(name)}</option>);
    }
   
    
    return <div className="form m-bottom-25">
        <div className="form-row">
            <label htmlFor="server">Server</label>
            <select className="default-select" value={selectedServer} onChange={(e) =>{
                router.push(`/matches/?server=${e.target.value}&gametype=${selectedGametype}&map=${selectedMap}&displayMode=${displayMode}&pp=${perPage}`);
            }}>
               {serverOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="gametype">Gametype</label>
            <select className="default-select" value={selectedGametype} onChange={(e) =>{
                router.push(`/matches/?server=${selectedServer}&gametype=${e.target.value}&map=${selectedMap}&displayMode=${displayMode}&pp=${perPage}`);
            }}>
               {gametypeOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="map">Map</label>
            <select className="default-select" value={selectedMap} onChange={(e) =>{
                router.push(`/matches/?server=${selectedServer}&gametype=${selectedGametype}&map=${e.target.value}&displayMode=${displayMode}&pp=${perPage}`);
            }}>
               {mapOptions}
            </select>
        </div>

        <div className="form-row">
            <label htmlFor="map">Results Per Page</label>
            <select className="default-select" value={perPage} onChange={(e) =>{
                router.push(`/matches/?server=${selectedServer}&gametype=${selectedGametype}&map=${selectedMap}&displayMode=${displayMode}&pp=${e.target.value}`);
            }}>
               {getPerPageOptions()}
            </select>
        </div>

        <div className="form-row">
            <label htmlFor="map">Display Mode</label>
            <select className="default-select" value={displayMode} onChange={(e) =>{
                router.push(`/matches/?server=${selectedServer}&gametype=${selectedGametype}&map=${selectedMap}&displayMode=${e.target.value}&pp=${perPage}`);
            }}>
               <option value="default">Default</option>
               <option value="table">Table</option>
            </select>
        </div>
        
    </div>
}