"use client"
import { useEffect,useReducer } from "react";
import MessageBox from "../MessageBox";
import Tabs from "../Tabs";
import Checkbox from "../Checkbox";
import styles from "./Admin.module.css";
import { getOrdinal } from "../../../../api/generic.mjs";
import Loading from "../Loading";

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
    "Maps Page": {
        "Default Display Type": [...DEFAULT_DISPLAY_OPTIONS],
        "Default Sort By": [
            {"name": "Name","value": "name" },
            {"name": "First Match","value": "first" },
            {"name": "Last Match","value": "last" },
            {"name": "Matches Played","value": "matches" },
            {"name": "Playtime","value": "playtime" }
        ]
    },
    "Matches Page": {
        "Default Display Type": [...DEFAULT_DISPLAY_OPTIONS]
    },
    "Player Pages": {
        "Default Weapon Display": [{"name": "Table", "value": "table"}],
        "Default Recent Matches Display": [...DEFAULT_DISPLAY_OPTIONS],
    },
    "Players Page": {
        "Default Display Type": [{"name": "Table", "value": "table"}],
        "Default Sort By": [
            {"name": "Name", "value": "name"},
            {"name": "Playtime", "value": "playtime"},
            {"name": "Matches Played", "value": "matches"},
            {"name": "Score", "value": "score"},
            {"name": "Kills", "value": "kills"},
            {"name": "Last Active", "value": "last"}
        ],
        "Default Last Active Range": [
            {"name": "Any Time", "value": 0},
            {"name": "Past 24 Hours", "value": 1},
            {"name": "Past 7 Days", "value": 2},
            {"name": "Past 28 Days", "value": 3},
            {"name": "Past Year", "value": 4},
        ]
    },
    "Rankings": {
        "Default Last Active":[
            {"name": "No Limit", "value": 0},
            {"name": "Past 24 Hours", "value": 1},
            {"name": "Past 7 Days", "value": 7},
            {"name": "Past 28 Days", "value": 28},
            {"name": "Past 90 Days", "value": 90},
            {"name": "Past Year", "value": 365}
        ],
        "Default Min Playtime": [
            {"name": "No Limit", "value": 0},
            {"name": "1 Hour", "value": 1},
            {"name": "2 Hours", "value": 2},
            {"name": "3 Hours", "value": 3},
            {"name": "6 Hours", "value": 6},
            {"name": "12 Hours", "value": 12},
            {"name": "24 Hours", "value": 24},
            {"name": "48 Hours", "value": 48},
        ]
    },
    "Servers Page": {
        "Default Display Type": [...DEFAULT_DISPLAY_OPTIONS],
    }
};


function reducer(state, action){

    switch(action.type){

        case "loaded": {
            
            //const settings = JSON.parse(JSON.stringify(action.settings));
            //const savedSettings = JSON.parse(JSON.stringify(action.settings));
            return {
                ...state,
                "settings": [...action.settings],
                "savedSettings": [...action.settings],
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
                    "content": action.content,
                    "timestamp": performance.now()
                }
            }
        }
        case "set-selected-tab": {
            return {
                ...state,
                "selectedTab": action.value
            }
        }

        case "update-setting": {

            const settings = JSON.parse(JSON.stringify(state.settings));


            for(let i = 0; i < settings.length; i++){

                const s = settings[i];

                if(s.category !== action.category) continue;
                if(s.name !== action.name) continue;
                
                s.value = action.value;
                break;
            }

            return {
                ...state,
                "settings": settings
            }
        }

        case "change-page-order": {

            const settings = JSON.parse(JSON.stringify(state.settings));

            for(let i = 0; i < settings.length; i++){

                const s = settings[i];

                for(let x = 0; x < action.changes.length; x++){

                    const c = action.changes[x];
                    if(c.category !== s.category) continue;
                    if(c.name !== s.name) continue;
                    s.page_order = c.pageIndex;
                }
            }
            return {

                ...state,
                "settings": [...settings],
                "messageBox": {
                    ...state.messageBox,
                    "timestamp": performance.now()
                }
            }
        }

        case "set-loading": {
            return {
                ...state,
                "bLoading": action.value
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


function getSelectionElem(cat, name, value, dispatch){

    if(CUSTOM_OPTIONS[cat] === undefined || CUSTOM_OPTIONS[cat][name] === undefined){
        return <select className="default-select"></select>;
    }


    return <select className="default-select" value={value} onChange={(e) =>{
            dispatch({"type": "update-setting", "category": cat, "name": name, "value": e.target.value});
        }}>
        {CUSTOM_OPTIONS[cat][name].map((o, i) =>{
            return <option key={i} value={o.value}>{o.name}</option>
        })}
    </select>
}


function getPageComponents(category, settings){

    const found = [];

    for(let i = 0; i < settings.length; i++){

        const s = settings[i];
        if(s.category !== category) continue;
        if(!s.moveable) continue;
        found.push(s);
    }

    found.sort(sortByPageOrder);
    return found;
}


function getPageOrderIndex(components, targetName){

    let index = -1;

    for(let i = 0; i < components.length; i++){

        const p = components[i];
        if(p.name === targetName){
            index = i;
            break;
        }
    }

    return index;
}

function sortByPageOrder(a, b){
    a = a.page_order;
    b = b.page_order;

    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

function moveUp(data, settings, dispatch){
    
    settings = JSON.parse(JSON.stringify(settings));

    const pageComponents = getPageComponents(data.category, settings);

    const foundAtIndex = getPageOrderIndex(pageComponents, data.name);

    //already first elem
    if(foundAtIndex === 0) return;

    const changes = [];

    for(let i = 0; i < pageComponents.length; i++){

        const p = pageComponents[i];

        if(i === foundAtIndex - 1){
            p.page_order++;
            changes.push({"category": p.category, "name": p.name, "pageIndex": p.page_order});
        }

        if(i === foundAtIndex){
            p.page_order--;
            changes.push({"category": p.category, "name": p.name, "pageIndex": p.page_order});
        }
    }

    dispatch({"type": "change-page-order", "changes": changes});

}

function moveDown(data, settings, dispatch){
    
    settings = JSON.parse(JSON.stringify(settings));

    const pageComponents = getPageComponents(data.category, settings);

    const foundAtIndex = getPageOrderIndex(pageComponents, data.name);

    //already last elem
    if(foundAtIndex === pageComponents.length - 1) return;

    const changes = [];

    for(let i = 0; i < pageComponents.length; i++){

        const p = pageComponents[i];

        if(i === foundAtIndex){
            p.page_order++;
            changes.push({"category": p.category, "name": p.name, "pageIndex": p.page_order});
        }

        if(i === foundAtIndex + 1){
            p.page_order--;
            changes.push({"category": p.category, "name": p.name, "pageIndex": p.page_order});
        }
    }

    dispatch({"type": "change-page-order", "changes": changes});

}


function renderSettings(selectedTab, settings, bLoading, dispatch){

    if(bLoading) return <Loading></Loading>

    const moveableElems = [];
    const nonMoveableElems = [];


    settings.sort((a, b) =>{
        a = a.page_order;
        b = b.page_order;
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });


    for(let i = 0; i < settings.length; i++){

        const s = settings[i];
        if(s.category !== selectedTab) continue;
     
        let elem = null;

        if(s.value_type === "bool"){

            elem = <Checkbox key={i} value={(s.value === "true") ? true : false} setValue={(v) =>{
                console.log(s.value);
                dispatch({"type": "update-setting", "category": s.category, "name": s.name, "value": v.toString()});
            }}/>;

        }else if(s.value_type === "int"){

            elem = <input type="number" min={0} value={s.value} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-setting", "category": s.category, "name": s.name, "value": e.target.value});
            }}/>;

        }else if(s.value_type === "selection"){

            elem = getSelectionElem(s.category, s.name, s.value, dispatch);

        }else if(s.value_type === "perpage"){

            elem = <select className="default-select" value={s.value} onChange={(e) =>{
                dispatch({"type": "update-setting", "category": s.category, "name": s.name, "value": e.target.value});
            }}>
                {PER_PAGE_OPTIONS.map((p) =>{
                    return <option key={p} value={p}>{p}</option>
                })}
            </select>;

        }else if(s.value_type === "order"){
            elem = <select className="default-select" value={s.value} onChange={(e) =>{
                dispatch({"type": "update-setting", "category": s.category, "name": s.name, "value": e.target.value});
            }}>
                {ORDER_OPTIONS.map((p) =>{
                    return <option key={p.value} value={p.value}>{p.name}</option>
                })}
            </select>;
        }

        if(s.moveable){


            moveableElems.push(<div key={s.name} className={`${styles["page-item"]} ${styles["moveable"]}`}>
                <div className={styles["label"]}>{s.name}</div>
                {elem}
               
                <div className="move-button move-up" onClick={() =>{
                    moveUp(s, settings, dispatch);
                }}>Move Up</div>
                <div className="move-button move-down" onClick={() =>{
                    moveDown(s, settings, dispatch);
                }}>Move Down</div>
               
            </div>);

        }else{
            nonMoveableElems.push(<div key={s.name} className={`${styles["page-item"]} ${styles["non-moveable"]}`}>
                <div className={styles["label"]}>{s.name}</div>
                {elem}
            </div>);
        }
    }


    const elems = [];

    if(moveableElems.length > 0){

        elems.push(<div key="move" className={styles["page-items"]}>
            <div className="default-sub-header-alt">Moveable Items</div>
            {moveableElems}
        </div>);
    }
    
    if(nonMoveableElems.length > 0){
        elems.push(<div key="non-move" className={styles["page-items"]}>
            <div className="default-sub-header-alt">Non Moveable Items</div>
            {nonMoveableElems}
        </div>);
    }

    return <>
        {elems}
    </>
}


function getSavedSetting(cat, name, savedSettings){

    for(let i = 0; i < savedSettings.length; i++){

        const s = savedSettings[i];
        if(s.category === cat && s.name === name) return s;
    }

    return null;
}


async function saveChanges(changes, dispatch){

    try{


        dispatch({"type": "set-loading", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-page-changes", "changes": changes})
        });

        const res = await req.json();
        dispatch({"type": "set-loading", "value": false});

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-message", "messageType": "pass", "title": "Saved Changes", "content": "Changes saved successfully"});

        await loadData(dispatch);
    }catch(err){
        console.trace(err);
    }
}


function getChangedSettings(settings, savedSettings){

    const changes = [];

    for(let i = 0; i < settings.length; i++){

        const newSetting = settings[i];
        const oldSetting = getSavedSetting(newSetting.category, newSetting.name, savedSettings);//savedSettings[i];

        if(oldSetting === null) throw new Error(`Oldsetting not found`);
        
        if(oldSetting.value.toString() != newSetting.value.toString()){

            changes.push({
                "cat": oldSetting.category,
                "name": oldSetting.name,
                "pageOrder": newSetting.page_order,
                "oldValue": oldSetting.value.toString(),
                "newValue": newSetting.value.toString()
            });
        }

        if(oldSetting.page_order !== newSetting.page_order){
            changes.push({
                "cat": oldSetting.category,
                "name": oldSetting.name,
                "pageOrder": newSetting.page_order,
                "oldIndex": oldSetting.page_order,
                "newIndex": newSetting.page_order,
                //pass this for backend
                "newValue": newSetting.value.toString()
            });
        }
    }


    return changes;
}

function renderUnsavedChanges(settings, savedSettings, timestamp, bLoading, dispatch){

    if(bLoading) return null;
    
    const changes = getChangedSettings(settings, savedSettings);

    if(changes.length === 0) return null;

    changes.sort((a, b) =>{

        if(a.cat < b.cat) return -1;
        if(a.cat > b.cat) return 1;

        if(a.name < a.name) return -1;
        if(a.name > b.name) return 1;

        return 0;
    });


    return <MessageBox timestamp={timestamp} type="warn" title="You have unsaved changes">
        {changes.map((c, i) =>{

            let message = <></>;

            if(c.newIndex === undefined){
                message = <span key={i}><b>{c.cat} - {c.name}</b>, was <b>{c.oldValue}</b>, now set to <b>{c.newValue}</b><br/></span>;
            }else{

                let o = c.oldIndex + 1;
                let n = c.newIndex + 1;

                message = <span key={i}><b>{c.cat} - {c.name}</b>, page order was changed from 
                <b> {o}{getOrdinal(o)}</b>, now set to <b>{n}{getOrdinal(n)}</b><br/></span>;
            }

            return message;
        })}
        <br/>
        <button className="search-button" onClick={() =>{
            saveChanges(changes, dispatch);
        }}>Save Changes</button>
    </MessageBox>
    
}

export default function AdminPageSettings(){

    const [state, dispatch] = useReducer(reducer, {
        "selectedTab": null,
        "settings": [],
        "savedSettings": [],
        "bLoading": true,
        "uniquePages": [],
        "messageBox": {
            "type": null,
            "title": null,
            "content": null,
            "timestamp": 0
        }
    });

    useEffect(() =>{

        loadData(dispatch);

    },[]);


    return <>
        <div className="default-header">Site Settings</div>
        {renderTabs(state.uniquePages, state.selectedTab, dispatch)}
        <MessageBox type={state.messageBox.type} title={state.messageBox.title}>{state.messageBox.content}</MessageBox>
        {renderUnsavedChanges(state.settings, state.savedSettings, state.messageBox.timestamp, state.bLoading, dispatch)}
        {renderSettings(state.selectedTab, state.settings, state.bLoading, dispatch)}
    </>
}