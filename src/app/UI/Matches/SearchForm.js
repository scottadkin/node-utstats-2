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


function toOrderedArray(data){

    const options = [];

    for(const [id, name] of Object.entries(data)){
        options.push({id, name});
    }

    options.sort((a,b) =>{
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    return options;
}


function getURL(server, gametype, map, displayMode, perPage, sortBy, order){
    return `/matches/?server=${server}&gametype=${gametype}&map=${map}&displayMode=${displayMode}&pp=${perPage}&sortBy=${sortBy}&order=${order}`;
}

export default function SearchForm({selectedServer, selectedGametype, 
    selectedMap, displayMode, serverNames, gametypeNames, mapNames,
    perPage, sortBy, order
}){

    const router = useRouter();


    const serverOptions = [
        <option key="0" value="0">Any</option>
    ];

    const sOptions = toOrderedArray(serverNames);

    for(let i = 0; i < sOptions.length; i++){
        const {id, name} = sOptions[i]; 
        serverOptions.push(<option key={id} value={id}>{name}</option>);
    }

    const gametypeOptions = [
        <option key="0" value="0">Any</option>
    ];


    const gOptions = toOrderedArray(gametypeNames);

    for(let i = 0; i < gOptions.length; i++){
        const {id, name} = gOptions[i]; 
        gametypeOptions.push(<option key={id} value={id}>{name}</option>);
    }

    const mapOptions = [
        <option key="0" value="0">Any</option>
    ];

    const mOptions = toOrderedArray(mapNames);

    for(let i = 0; i < mOptions.length; i++){
        const {id, name} = mOptions[i]; 
        mapOptions.push(<option key={id} value={id}>{removeUnr(name)}</option>);
    }


    const sortByOptions = [
        {"name": "Date","value": "date"},
        {"name": "Server","value": "server"},
        {"name": "Gametype","value": "gametype"},
        {"name": "Map","value": "map"},
        {"name": "Players","value": "players"},
        {"name": "Playtime","value": "playtime"},
    ];
   
    
    return <div className="form m-bottom-25">
        <div className="form-row">
            <label htmlFor="server">Server</label>
            <select id="server" className="default-select" value={selectedServer} onChange={(e) =>{
                router.push(getURL(e.target.value, selectedGametype, selectedMap, displayMode, perPage, sortBy, order));
            }}>
               {serverOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="gametype">Gametype</label>
            <select id="gametype" className="default-select" value={selectedGametype} onChange={(e) =>{
                router.push(getURL(selectedServer, e.target.value, selectedMap, displayMode, perPage, sortBy, order));
            }}>
               {gametypeOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="map">Map</label>
            <select id="map" className="default-select" value={selectedMap} onChange={(e) =>{
                router.push(getURL(selectedServer, selectedGametype, e.target.value, displayMode, perPage, sortBy, order));
            }}>
               {mapOptions}
            </select>
        </div>

        <div className="form-row">
            <label htmlFor="pp">Results Per Page</label>
            <select id="pp" className="default-select" value={perPage} onChange={(e) =>{
                router.push(getURL(selectedServer, selectedGametype, selectedMap, displayMode, e.target.value, sortBy, order));
            }}>
               {getPerPageOptions()}
            </select>
        </div>


        <div className="form-row">
            <label htmlFor="sb">Sort By</label>
            <select id="sb" className="default-select" value={sortBy} onChange={(e) =>{
               router.push(getURL(selectedServer, selectedGametype, selectedMap, displayMode, perPage, e.target.value, order));
            }}>
                {sortByOptions.map((s, i) =>{
                    return <option key={i} value={s.value}>{s.name}</option>
                })}
            </select>
        </div>

         <div className="form-row">
            <label htmlFor="order">Order</label>
            <select id="order" className="default-select" value={order} onChange={(e) =>{
                router.push(getURL(selectedServer, selectedGametype, selectedMap, displayMode, perPage, sortBy, e.target.value));
            }}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>

        <div className="form-row">
            <label htmlFor="display">Display Mode</label>
            <select id="display" className="default-select" value={displayMode} onChange={(e) =>{
                router.push(getURL(selectedServer, selectedGametype, selectedMap, e.target.value, perPage, sortBy, order));}}>
               <option value="default">Default</option>
               <option value="table">Table</option>
            </select>
        </div>    
    </div>
}