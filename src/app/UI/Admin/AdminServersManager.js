import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";

function reducer(state, action){

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "servers": action.servers
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.mode
            }
        }
        case "set-selected": {
            return {
                ...state,
                "selected": action.value
            }
        }
    }

    return state;
}

async function loadData(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "load-servers"
            })
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "servers": res.servers});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Data", "content": err.toString()});
    }
}

function renderList(state){

    if(state.mode !== "list") return null;

    const headers = [
        "Name",
        "Address:Port",
        "Password",
        "Last Match",
        "Total Matches",
        "Display Name",
        "Display Address:Port"
    ];

    const rows = state.servers.map((s) =>{
        return [
            {"className": "text-left", "value": s.name},
            `${s.ip}:${s.port}`,
            s.password,
            {"className": "date", "value": convertTimestamp(s.last, true)},
            s.matches,
            s.display_name,
            s.display_address
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>;
}


function renderEdit(state, dispatch, mDispatch){

    if(state.mode !== "edit") return null;


    let elems = [];

    console.log(state.selected);

    if(state.selected !== "-1"){

        elems = <>
            <div className="form-row">
                <label htmlFor="display-name">Display Name</label>
                <input name="display-name" type="text" className="default-textbox"/>
            </div>
            <div className="form-row">
                <label htmlFor="display-address">Display Address</label>
                <input name="display-address" type="text" className="default-textbox"/>
            </div>
            <div className="form-row">
                <label htmlFor="display-port">Display Port</label>
                <input name="display-port" type="number" className="default-textbox"/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input name="password" type="number" className="default-textbox"/>
            </div>
            <div className="form-row">
                <label htmlFor="country">Country</label>
                <select className="default-select"></select>
            </div>
            <button className="search-button">Update Server</button>
        </>
    }


    return <>
        <div className="form m-bottom-25">
            <div className="form-info">
                Edit Server
            </div>
            <div className="form-row">
                <label htmlFor="server">Selected Server</label>
                <select name="server" value={state.selected} className="default-select" onChange={(e) =>{
                    dispatch({"type": "set-selected", "value": e.target.value});
                }}>
                    <option value="-1">
                        -- Please Select A Server --
                    </option>
                    {state.servers.map((s) =>{
                        return <option key={s.id} value={s.id}>{s.name}</option>
                    })}
                </select>
            </div>
            {elems}
        </div>
    </>;
}

export default function AdminServersManager(){

    const [state, dispatch] = useReducer(reducer, {
        "servers": [],
        "mode": "edit",
        "selected": "-1"
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadData(dispatch, mDispatch);
    }, []);

    const tabOptions = [
        {"name": "Server List", "value": "list"},
        {"name": "Edit Server", "value": "edit"},
    ];

    return <>
        <div className="default-header">Server Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "mode": v});
        }}/>
        <MessageBox timestamp={mState.timestamp} type={mState.type} title={mState.title}>{mState.content}</MessageBox>
        <div className="form m-bottom-25">
            <div className="form-info">
                Display name overrides what the website displays as the server name on the website.<br/>
                Display address overrides the IP address that is displayed for the server.<br/>
                Display port overrides the port that is displayed for the server.<br/>
                If you don't set a display name and display address, name, ip, and port are updated based on the last log that the improter parased.

            </div>
        </div>
        {renderList(state)}
        {renderEdit(state, dispatch, mDispatch)}
    </>
}