import {useEffect, useReducer} from 'react';
import styles from './AdminSiteSettings.module.css';
import Tabs from "../Tabs";
import Loading from '../Loading';
import NotificationSmall from '../NotificationSmall';
import Table2 from '../Table2';

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {

            let selectedTab = 0;
            const keys = Object.keys(action.settings)

            if(keys.length > 0){
                selectedTab = keys[0];
            }

            return {
                ...state,
                "bLoading": false,
                "settings": action.settings,
                "lastSavedSettings": action.settings,
                "error": null,
                "selectedTab": selectedTab
            }
        }

        case "changeSettings": {
            return {
                ...state,
                "settings": action.settings,
                "bSavePass": false
            }
        }

        case "startSave": {
            return {
                ...state,
                "bSaving": true,
                "saveError": null,
                "bSavePass": false
            }
        }

        case "savePass": {
            return {
                ...state,
                "settings": action.settings,
                "lastSavedSettings": action.settings,
                "bSaving": false,
                "saveError": null,
                "bSavePass": true
            }
        }

        case "saveError": {
            return {
                ...state,
                "bSaving": false,
                "saveError": action.errorMessage,
                "bSavePass": false
            }
        }

        case "error": {
            return {
                ...state,
                "bLoading": false,
                "settings": {},
                "lastSavedSettings": {},
                "error": action.errorMessage
            }
        }

        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.selectedTab
            }
        }
    }

    return state;
}

const renderTabs = (state, dispatch) =>{

    if(state.bLoading) return null;

    const keys = Object.keys(state.settings);

    const options = keys.map((key) =>{
        return {"name": key, "value": key}
    });

    return <Tabs options={options} 
        selectedValue={state.selectedTab} 
        changeSelected={(selectedTab) => dispatch({"type": "changeTab", "selectedTab": selectedTab})}
    />
}

const loadSettings = async (dispatch, signal) =>{

    const req = await fetch("/api/admin", {
        "signal": signal,
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "get-current-settings"})
    });

    const res = await req.json();

    if(res.error !== undefined){
        dispatch({"type": "error", "errorMessage": res.error});
        return;
    }

    dispatch({"type": "loaded", "settings": res.settings});
}

const renderError = (state) =>{

    if(state.bLoading || state.error === null) return null;

    return <NotificationSmall type="error">{state.error}</NotificationSmall>
}

const getCategorySettings = (state) =>{
 
    if(state.settings[state.selectedTab] !== undefined){
        return state.settings[state.selectedTab];
    }

    return null;
}

const changePosition = (state, dispatch, settingName, bDown) =>{

    const settings = JSON.parse(JSON.stringify(state.settings));
    
    const currentBlock = settings[state.selectedTab].settings;

    let newIndex = null;
    let targetSetting = null;

    for(let i = 0; i < currentBlock.length; i++){

        const c = currentBlock[i];

        if(c.name === settingName){

            if(c.page_order === 0 && !bDown){
                return;
            }

            if(bDown){

                if(i + 1 >= currentBlock.length) return;
                
                if(currentBlock[i + 1].page_order === 999999) return;
            }

            if(bDown){
                newIndex = i + 1;
            }else{
                newIndex = i - 1;
            }

            targetSetting = c;
            break;
        }
    }

    const newBlock = [];

    let currentIndex = 0;

    let bAdded = false;

    for(let i = 0; i < currentBlock.length; i++){

        const c = currentBlock[i];

        if(c.name === targetSetting.name) continue;

        if(currentIndex === newIndex){

            targetSetting.page_order = currentIndex;
            newBlock.push(targetSetting);
            bAdded = true;
            currentIndex++;

        }

        if(c.page_order !== 999999){
            c.page_order = currentIndex;
        }

        currentIndex++;
        newBlock.push(c);

        if(i === currentBlock.length - 1 && !bAdded){

            targetSetting.page_order = currentIndex;
            newBlock.push(targetSetting); 
        }
    }


    settings[state.selectedTab].settings = newBlock;

    dispatch({"type": "changeSettings", "settings": settings});  
}

const renderChangePositionButtons = (state, dispatch, setting, bLastMoveable) =>{
    
    if(setting.page_order === 999999) return null;

    let moveUp = null;

    if(setting.page_order > 0){
        moveUp = <div className={styles.button} onClick={() => changePosition(state, dispatch, setting.name, false)}>
            Move Up
        </div>;
    }

    let moveDown = null;

    if(!bLastMoveable){

        moveDown = <div className={styles.button} onClick={() => changePosition(state, dispatch, setting.name, true)}>
            Move Down
        </div>;
    }

    return <>
        {moveUp}
        {moveDown}
    </>
}

const changeValue = (state, dispatch, name, value) =>{

    const category = state.selectedTab;

    const newSettings = JSON.parse(JSON.stringify(state.settings));

    const keys = Object.keys(newSettings);

    for(let i = 0; i < keys.length; i++){

        const k = keys[i];

        if(k === category){

            for(let x = 0; x < newSettings[k].settings.length; x++){

                const s = newSettings[k].settings[x];

                if(s.name === name){

                    if(typeof value === "boolean"){
                        value = value.toString();
                    }

                    s.value = value;

                    dispatch({"type": "changeSettings", "settings": newSettings})
                    
                    return;
                }
            }
        }
    }   
}

const renderEnableDisableButton = (state, dispatch, name, value) =>{

    value = (value === "true");

    const elem = (value) ? "Enabled" : "Disabled";

    return <td className={`team-${(value) ? "green" : "red"} hover no-select`} 
        onClick={() => changeValue(state, dispatch, name, !value)}>
        {elem}
    </td>
}

const getValidSettings = (state, type) =>{

    if(state.settings[state.selectedTab] === undefined) return null;
    const settings = state.settings[state.selectedTab].validSettings;

    if(settings[type] !== undefined) return settings[type];

    return null;
}

const getCurrentSetting = (state, type) =>{

    if(state.settings[state.selectedTab] === undefined) return null;
    const settings = state.settings[state.selectedTab].settings;

    for(let i = 0; i < settings.length; i++){

        const s = settings[i];
        if(s.name === type) return s.value;
    }

    return null;

}

const renderDropDown = (state, dispatch, type) =>{

    const validSettings = getValidSettings(state, type);

    if(validSettings === null){
        return <>Oops</>;
    }

    const options = validSettings.map((setting) =>{
        return <option key={setting.value} value={setting.value}>{setting.name}</option>
    });

    return <select className="default-select" value={getCurrentSetting(state, type)}
        onChange={(e) =>{
            changeValue(state, dispatch, type, e.target.value);
        }}
    >
        {options}
    </select>
}

const renderEdit = (state, dispatch) =>{

    if(state.bLoading || state.error !== null) return null;

    const data = getCategorySettings(state);

    const rows = [];

    const settings = data.settings;

    settings.sort((a, bLoading) =>{

        a = a.page_order;
        bLoading = bLoading.page_order;

        if(a < bLoading) return -1;
        if(a > bLoading) return 1;

        return 0;
    });


    if(data !== null){

        for(let i = 0; i < settings.length; i++){

            const s = settings[i];

            let value = <td>{s.value}</td>;

            if(s.value === "false" || s.value === "true"){
                value = renderEnableDisableButton(state, dispatch, s.name, s.value);
            }else{
                value = <td>{renderDropDown(state, dispatch, s.name)}</td>
            }

            let bLastMoveable = false;

            if(s.page_order !== 999999){

                if(i + 1 >= settings.length || settings[i + 1].page_order === 999999) bLastMoveable = true;
            }

            const actions = renderChangePositionButtons(state, dispatch, s, bLastMoveable);

            rows.push(<tr key={s.id}>
                <td className="text-left">{s.name}</td>
                {value}
                <td>
                    {actions}
                </td>
            </tr>);
        }
    }

    return <>
        <div className="form m-top-25">
            <div className="default-sub-header">Edit {state.selectedTab} Settings</div>
            
        </div>
        <Table2 width={1}>
            <tr>
                <th>Setting</th>
                <th>Current Value</th>
                <th>Change Page Position</th>
            </tr>
            {rows}
        </Table2>
    </>
}

const getChangedSettings = (state) =>{

    const current = state.settings;
    const lastSaved = state.lastSavedSettings;

    let found = [];

    const keys = Object.keys(state.settings);

    for(let i = 0; i < keys.length; i++){

        const key = keys[i];

        for(let x = 0; x < current[key].settings.length; x++){

            const currentSetting = current[key].settings[x];
            const lastSavedSetting = lastSaved[key].settings[x];

            if(currentSetting.value !== lastSavedSetting.value || currentSetting.page_order !== lastSavedSetting.page_order ||
                currentSetting.name !== lastSavedSetting.name){
                found.push(currentSetting);
            }
        }
    }

    return found;
}

const saveChanges = async (state, dispatch, signal) =>{

    const settings = state.settings;
    dispatch({"type": "startSave"});

    const changes = getChangedSettings(state);

    const req = await fetch("/api/admin", {
        "signal": signal,
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "save-setting-changes", "changes": changes})
    });

    const res = await req.json();

    if(res.error !== undefined){

        dispatch({"type": "saveError", "errorMessage": res.error});
        return;
    }
    console.log(res);

    dispatch({"type": "savePass", "settings": settings});

    //dispatch({"type": "saveChanges", "settings": settings});
}

const renderSaveError = (state) =>{

    if(state.saveError === null) return null;

    return <NotificationSmall type="error" title="There was a problem saving your changes">
        {state.saveError}
    </NotificationSmall>
}

const renderUnsavedSettings = (state, dispatch, signal) =>{

    if(state.bLoading) return null;

    if(state.bSaving){

        return <NotificationSmall type="warning">     
            <Loading>
                Saving in progress please wait.
            </Loading>
        </NotificationSmall>
    }

    const changes = getChangedSettings(state);

    if(changes.length === 0) return null;

    const elems = changes.map((change) =>{
        return <div key={change.id}><b className="yellow">{change.category}</b> -&gt; <b>{change.name}</b> has been changed.</div>
    });


    return <>
        {renderSaveError(state)}
        <NotificationSmall type="error" title="You have unsaved changes!">
            <div className="search-button" onClick={() => saveChanges(state, dispatch, signal)}>Save Changes</div>
            {elems}
        </NotificationSmall>
    </>
}

const renderPass = (state) =>{

    if(!state.bSavePass) return null;

    return <NotificationSmall type="pass">
        Changes Saved.
    </NotificationSmall>
}

const AdminSiteSettings = () =>{

    const controller = new AbortController();


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "settings": {}, 
        "selectedTab": null,
        "lastSavedSettings": {},
        "bSaving": false,
        "saveError": null,
        "bSavePass": false
    });

    useEffect(() =>{

        const test = new AbortController();

        loadSettings(dispatch, test.signal);

        return () =>{ test.abort();}

    }, []);

    return <div>
        <div className="default-header">Site Settings</div>
        {renderTabs(state, dispatch)}
        {renderEdit(state, dispatch)}
        {renderUnsavedSettings(state, dispatch, controller.signal)}
        {renderError(state)}
        {renderPass(state)}
        <Loading value={!state.bLoading}/>
    </div>
}

export default AdminSiteSettings;