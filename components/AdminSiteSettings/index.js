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
                "settings": action.settings
            }
        }

        case "startSave": {
            return {
                ...state,
                "bSaving": true,
                "saveError": null
            }
        }

        case "savePass": {
            return {
                ...state,
                "settings": action.settings,
                "lastSavedSettings": action.settings,
                "bSaving": false,
                "saveError": null
            }
        }

        case "saveError": {
            return {
                ...state,
                "bSaving": false,
                "saveError": action.errorMessage
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

                const bValue = Boolean(s.value);
                value = <td className={`team-${(bValue) ? "green" : "red"} hover no-select`}>
                    {s.value}
                </td>;
            }


            let actions = null;

            if(s.page_order !== 999999){

                actions = <>
                    <span className={styles.button} onClick={() => changePosition(state, dispatch, s.name, false)}>
                        Move Up
                    </span>
                    <span className={styles.button} onClick={() => changePosition(state, dispatch, s.name, true)}>
                        Move Down
                    </span>
                </>;

            }else{

                actions = <>&nbsp;</>;
            }


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
        "body": JSON.stringify({"mode": "save-changes", "changes": changes})
    });

    const res = await req.json();

    if(res.error !== undefined){

        dispatch({"type": "saveError", "errorMessage": res.error});
        return;
    }
    console.log(res);

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
        return <div key={change.id}><b>{change.name}</b> has been changed.</div>
    });


    return <>
        {renderSaveError(state)}
        <NotificationSmall type="error" title="You have unsaved changes!">
            <div className="search-button" onClick={() => saveChanges(state, dispatch, signal)}>Save Changes</div>
            {elems}
        </NotificationSmall>
    </>


}

const AdminSiteSettings = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "settings": {}, 
        "selectedTab": null,
        "lastSavedSettings": {},
        "bSaving": false,
        "saveError": null
    });

    const controller = new AbortController();

    useEffect(() =>{

        loadSettings(dispatch, controller.signal);

        return () =>{ controller.abort();}

    }, []);

    return <div>
        <div className="default-header">Site Settings</div>
        {renderTabs(state, dispatch)}
        {renderEdit(state, dispatch)}
        {renderUnsavedSettings(state, dispatch, controller.signal)}
        {renderError(state)}
        <Loading value={!state.bLoading}/>
    </div>
}


/*class AdminSiteSettings extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "categories": null, 
            "mode": 0, 
            "settings": null, 
            "validSettings": null, 
            "bUpdateInProgress": false, 
            "error": null,
            "message": null,
            "messageMode": null,
            "displayUntil": 0
        };

        this.changeMode = this.changeMode.bind(this);
        this.changeTrueFalse = this.changeTrueFalse.bind(this);
        this.changeDropDownValue = this.changeDropDownValue.bind(this);
        this.changePosition = this.changePosition.bind(this);
        this.changeHomeTitle = this.changeHomeTitle.bind(this);

    }

    async changeOrder(newOrder){

        try{

            this.setState({
                "bUpdateInProgress": true, 
                "messageMode": "warning", 
                "message": "Updating settings order please wait...",
                "displayUntil": Math.floor(Date.now() * 0.001) + 50
            });

            const idOrder = [];

            for(let i = 0; i < newOrder.length; i++){

                const n = newOrder[i];
                idOrder.push({"id": n.id, "order": n.page_order});
            }

            const req = await fetch("/api/admin", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "settingsUpdateOrder", "data": idOrder})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "bUpdateInProgress": false, 
                    "messageMode": "pass", 
                    "message": res.message,
                    "displayUntil": Math.floor(Date.now() * 0.001) + 3
                });

            }else{
                this.setState({
                    "bUpdateInProgress": false, 
                    "messageMode": "error", 
                    "message": res.error,
                    "displayUntil": Math.floor(Date.now() * 0.001) + 3
                });
            }

        }catch(err){
            console.trace(err);
        }   
    }

    async changePosition(bUp, name){

        const current = JSON.parse(JSON.stringify(this.state.settings));

        let currentPosition = null;
        let target = null;
        let totalOptions = 0;


        for(let i = 0; i < current.length; i++){

            const c = current[i];

            if(c.value === "true" || c.value === "false"){
                totalOptions++;
            }

            if(c.name === name){
                currentPosition = i;
                target = c;
            }
        }

        let newPosition = 0;

        if(bUp){

            newPosition = currentPosition - 1;
            //cant be lower than 0
            if(newPosition < 0) return;

        }else{

            newPosition = currentPosition + 1;
           if(newPosition > totalOptions) newPosition = totalOptions -1;
        }
    
        const newOrder = [];

        for(let i = 0; i < current.length; i++){

            const c = current[i];

            if(c.name === target.name) continue;

            if(!bUp){
                newOrder.push(c);
            }

            if(i === newPosition){
                newOrder.push(target);
            }

            if(bUp){
                newOrder.push(c);
            }
        
        }

        for(let i = 0; i < newOrder.length; i++){

            const n = newOrder[i];
            
            //if(n.value === "true" || n.value === "false"){
                n.page_order = i;
            //}else{
            //    n.page_order = 99999;
           // }

        }

        this.setState({"settings": newOrder});
        await this.changeOrder(newOrder);

    }

    async changeDropDownValue(e){

        const name = e.target.name;
        const value = e.target.value;

        await this.updateCurrentSettings(name, value);
    }

    async updateSetting(type, newValue){

        try{

            this.setState({
                "bUpdateInProgress": true, 
                "error": null, 
                "messageMode": "warning", 
                "message": "Updating setting...",
                "displayUntil": Math.floor(Date.now() * 0.001) + 50
            });

            const req = await fetch("/api/admin", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "changeSetting",
                    "settingCategory": this.state.categories[this.state.mode],
                    "settingType": type, 
                    "value": newValue
                })
            });

            const res = await req.json();

            
            if(res.error === undefined){

                if(res.message === "passed"){
                    this.setState({"messageMode": "pass", "message": "Setting updated successfully","displayUntil": Math.floor(Date.now() * 0.001) + 3});
                    return true;
                }

            }else{
                this.setState({"error": res.error, "messageMode": "error", "message": res.error,"displayUntil": Math.floor(Date.now() * 0.001) + 3});
            }

            this.setState({"bUpdateInProgress": false});

        }catch(err){
            console.trace(err);
        }

        return false;
    }

    async updateCurrentSettings(toEdit, newValue, bSaveChanges){

        if(bSaveChanges === undefined) bSaveChanges = true;

        const oldSettings = JSON.parse(JSON.stringify(this.state.settings));

        const newSettings = [];

        for(let i = 0; i < oldSettings.length; i++){

            const o = oldSettings[i];

            if(o.name === toEdit){

                o.value = newValue;
                newSettings.push(o);

            }else{
                newSettings.push(o);
            }
        }

        if(bSaveChanges){
            await this.updateSetting(toEdit, newValue);
        
        }

        this.setState({"settings": newSettings});

        
    }

    async changeTrueFalse(type, value){

        if(value === "true"){
            value = "false";
        }else{
            value = "true";
        }

        await this.updateCurrentSettings(type, value);
    }

    async changeHomeTitle(e){

        const newValue = e.target.value;

        await this.updateCurrentSettings("Welcome Message Title", newValue, false);


    }

    async changeMode(id){

        this.setState({"mode": id, "displayUntil": 0, "message": null});
    }

    async loadCategoryNames(){

        try{

            const req = await fetch("/api/admin",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "settingCategories"})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"categories": res.data});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadData(){

        try{

            const req = await fetch("/api/admin",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "loadSettingsCategory", "cat": this.state.categories[this.state.mode]})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"settings": res.data, "validSettings": res.valid});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadCategoryNames();
        await this.loadData();
    }

    async componentDidUpdate(prevProps, prevState){

        if(this.state.mode !== prevState.mode){
            await this.loadData();
        }
    }

    renderTabs(){

        if(this.state.categories === null) return null;

        const tabs = [];

        for(let i = 0; i < this.state.categories.length; i++){

            const c = this.state.categories[i];

            tabs.push(<div key={i} 
                className={`tab ${(this.state.mode === i) ? "tab-selected" : ""}`}
                onClick={(() =>{
                    this.changeMode(i);
                })}>
                {c}
            </div>);
        }

        return <div className="tabs">
            {tabs}
        </div>
    }

    getCurrentValue(name){

        for(let i = 0; i < this.state.settings.length; i++){

            const s = this.state.settings[i];

            if(s.name === name){
                return s.value;
            }
        }

        return "";
    }

    renderDropDown(name){

        const options = [];

        if(this.state.validSettings[name] !== undefined){

            for(let i = 0; i < this.state.validSettings[name].length; i++){

                const setting = this.state.validSettings[name][i];

                options.push(<option key={i} value={setting.value}>{setting.name}</option>);
            }
        }

        const currentSetting = this.getCurrentValue(name);
        
        return <select className="default-select" name={name} value={currentSetting} onChange={this.changeDropDownValue}>
            {options}
        </select>
    }

    renderHomeMessageSettings(catName){

        if(catName !== "Home") return null;

        let title = null;
        let textContent = null;
        
        for(let i = 0; i < this.state.settings.length; i++){

            const s = this.state.settings[i];

            if(s.name === "Welcome Message Content"){
                textContent = s.value;
            }else if(s.name === "Welcome Message Title"){
                title = s.value;
            }
        }

        return <div className="form">
            <div className="default-sub-header-alt">Welcome Message Title</div>
            <div>
                <input type="text" className="default-textbox t-width-1" value={title} onChange={this.changeHomeTitle}/>
            </div>
            <div className="default-sub-header-alt m-top-25">Welcome Message Content</div>
            <textarea className="default-textarea t-width-1" value={textContent}></textarea>
        </div>
    }

    renderSettings(){

        if(this.state.settings === null) return null;

        const rows = [];

        const dropDownRows = [];

        let ignoreOrder = [];

        const catName = this.state.categories[this.state.mode];

        if(catName === "Match Pages"){

            ignoreOrder = ["Display Match Report Title", "Display Mutators", "Display Target Score", "Display Time Limit"];
        }else if(catName === "Home"){
            ignoreOrder = ["Display Welcome Message"];
        }

        const special = ["Welcome Message Title", "Welcome Message Content"];

        for(let i = 0; i < this.state.settings.length; i++){

            const s = this.state.settings[i];

            let valueElem = null;
            let bDropDown = false;

            if(catName === "Home"){

                if(special.indexOf(s.name) !== -1){

                    continue;
                }        
            }

            if(s.value === "true" || s.value === "false"){

                let valueText = "";
                let colorClass = "";

                if(s.value === "true"){
                    valueText = "Enabled";
                    colorClass = "team-green";
                }else{
                    valueText = "Disabled";
                    colorClass = "team-red";
                }

                valueElem = <td className={`${colorClass} no-select hover-cursor`} onClick={(async () =>{
                    await this.changeTrueFalse(s.name, s.value);
                })}>
                    {valueText}
                </td>

            }else{
                bDropDown = true;
                valueElem = <td>{this.renderDropDown(s.name)}</td>
            }

            const elems = (bDropDown || ignoreOrder.indexOf(s.name) !== -1) ? dropDownRows : rows;

            elems.push(<tr key={i}>
                <td className="text-left">{s.name}</td>
                {valueElem}
                <td>
                    {(bDropDown || ignoreOrder.indexOf(s.name) !== -1) ? <span className="small-font grey">N/A</span> :
                        <>
                            <Image src="/images/up.png" width={16} height={16} className={styles.button} alt="up" onClick={(() =>{
                                this.changePosition(true, s.name);
                            })}/>
                            <Image src="/images/down.png" width={16} height={16} className={styles.button} alt="down" onClick={(() =>{
                                this.changePosition(false, s.name);
                            })}/>
                        </>
                    }
                </td>
            </tr>);
        }

        return <div className="m-top-25">
            <Table2 width={4} header={catName}>
                <tr>
                    <th>Setting</th>
                    <th>Value</th>
                    <th>Change Position</th>
                </tr>
                {dropDownRows}
                {rows}
                
            </Table2>

            {this.renderHomeMessageSettings(catName)}
        </div>
    }

    renderNotification(){
        if(this.state.messageMode === null) return null;

        return <Notification type={this.state.messageMode} displayUntil={this.state.displayUntil}>
            {this.state.message}
        </Notification>;
    }

    render(){

        return <div>
            <div className="default-header">Site Settings</div>
            {this.renderTabs()}
            {this.renderSettings()}
            {this.renderNotification()}
        </div>
    }
}*/

export default AdminSiteSettings;