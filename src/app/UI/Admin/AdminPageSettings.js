"use client"
import { useEffect,useReducer } from "react";
import MessageBox from "../MessageBox";
import Tabs from "../Tabs";
import { BasicTable } from "../Tables";
import Checkbox from "../Checkbox";

const PER_PAGE_OPTIONS = [5,10,20,25,50,75,100];

const ORDER_OPTIONS = [
    {"name": "Ascending", "value": "ASC"},
    {"name": "Descending", "value": "DESC"},
];

const DEFAULT_DISPLAY_OPTIONS = [
    {"name": "Default", "value": "default"},
    {"name": "Table", "value": "table"},
]

const CUSTOM_OPTIONS = {
    "Home": {
        "Recent Matches Display Type": [...DEFAULT_DISPLAY_OPTIONS],
        "Popular Countries Display Type": [...DEFAULT_DISPLAY_OPTIONS]
    },
    "Matches Page": {
        "Default Display Type": [...DEFAULT_DISPLAY_OPTIONS]
    },
    "Player Pages": {
        "Default Weapon Display": [...DEFAULT_DISPLAY_OPTIONS]
    },
    "Players Page": {
        "Default Display Type": [...DEFAULT_DISPLAY_OPTIONS],
        "Default Sort Type": [
            {"name": "Name", "value": "name"},
            {"name": "Playtime", "value": "playtime"},
            {"name": "Matches Played", "value": "matches"},
            {"name": "Score", "value": "score"},
            {"name": "Kills", "value": "kills"},
            {"name": "Last Active", "value": "last"}
        ]
    },
    "Servers Page": {
        "Default Display Type": [...DEFAULT_DISPLAY_OPTIONS],
    }
};


function reducer(state, action){

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "settings": action.settings,
                "uniquePages": action.uniquePages,
                "bLoading": false
            }
        }
        case "set-message": {
            return {
                ...state,
                "messageBox": {
                    "type": action.messageType,
                    "title": action.title,
                    "content": action.content
                }
            }
        }
        case "set-selected-tab": {
            return {
                ...state,
                "selectedTab": action.value
            }
        }
    }

    return state;
}


async function loadData(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "load-page-settings"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        let uniquePages = new Set();
        for(let i = 0; i < res.settings.length; i++){

            const s = res.settings[i];
            uniquePages.add(s.category);    
        }

        uniquePages = [...uniquePages];

        uniquePages.sort((a, b) =>{

            a = a.toLowerCase();
            b = b.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        dispatch({"type": "loaded","uniquePages": uniquePages, "settings": res.settings});

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed to load page settings", "content": err.toString()});
    }
}


function renderTabs(uniquePages, selectedTab, dispatch){

    const tabOptions = uniquePages.map((u) =>{
        return {"name": u, "value": u};
    });

    if(uniquePages.length > 0 && selectedTab === null){
        dispatch({"type": "set-selected-tab", "value": uniquePages[0]});
    }

    return <Tabs options={tabOptions} selectedValue={selectedTab} changeSelected={(v) => {
        dispatch({"type": "set-selected-tab", "value": v});
    }}/>
}


function getSelectionElem(cat, name){

    if(CUSTOM_OPTIONS[cat] === undefined || CUSTOM_OPTIONS[cat][name] === undefined){
        return <select className="default-select"></select>;
    }


    return <select className="default-select">
        {CUSTOM_OPTIONS[cat][name].map((o, i) =>{
            return <option key={i} value={o.value}>{o.name}</option>
        })}
    </select>
}

function renderSettings(selectedTab, settings){

    const movableRows = [];
    const nonMovableRows = [];

    const moveableHeaders = ["Name", "Value", "Change Position"];
    const nonMoveableHeaders = ["Name", "Value"];

    for(let i = 0; i < settings.length; i++){

        const s = settings[i];
        if(s.category !== selectedTab) continue;
     
        let elem = null;

        if(s.value_type === "bool"){

            elem = <Checkbox key={i} bTableElem={true} value={s.value} changeSelected={() =>{}}/>;

        }else if(s.value_type === "int"){

            elem = <input type="number" className="default-textbox"/>;

        }else if(s.value_type === "selection"){

            elem = getSelectionElem(s.category, s.name);

        }else if(s.value_type === "perpage"){

            elem = <select className="default-select">
                {PER_PAGE_OPTIONS.map((p) =>{
                    return <option key={p} value={p}>{p}</option>
                })}
            </select>;

        }else if(s.value_type === "order"){
            elem = <select className="default-select">
                {ORDER_OPTIONS.map((p) =>{
                    return <option key={p.value} value={p.value}>{p.name}</option>
                })}
            </select>;
        }

        const current = [
            {"className": "text-left", "value": s.name},
            {"className": "", "bSkipTd": (s.value_type === "bool") ? true : false, "value": elem}
        ];

        if(s.moveable){

            current.push(<>
                <div className="move-button move-up">Move Up</div>
                <div className="move-button move-down">Move Down</div>
            </>);
            movableRows.push(current);
        }else{
            nonMovableRows.push(current);
        }
    }

    return <>
        <BasicTable title="Moveable Components" width={4} headers={moveableHeaders} rows={movableRows}/>
        <br/>
        <BasicTable title="Non Moveable Components" width={4} headers={nonMoveableHeaders} rows={nonMovableRows}/>
    </>
}


export default function AdminPageSettings(){

    const [state, dispatch] = useReducer(reducer, {
        "selectedTab": null,
        "settings": [],
        "bLoading": true,
        "uniquePages": [],
        "messageBox": {
            "type": null,
            "title": null,
            "content": null
        }
    });

    useEffect(() =>{

        loadData(dispatch);

    },[]);


    return <>
        <div className="default-header">Site Settings</div>
        {renderTabs(state.uniquePages, state.selectedTab, dispatch)}
        <MessageBox type={state.messageBox.type} title={state.messageBox.title}>{state.messageBox.content}</MessageBox>
        {renderSettings(state.selectedTab, state.settings)}
    </>
}