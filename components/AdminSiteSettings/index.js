import React from 'react';
import Table2 from '../Table2';
import Notification from '../Notification';
import styles from './AdminSiteSettings.module.css';


class AdminSiteSettings extends React.Component{

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
            if(n.value === "true" || n.value === "false"){
                n.page_order = i;
            }else{
                n.page_order = 99999;
            }

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

    async updateCurrentSettings(toEdit, newValue){

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

        if(await this.updateSetting(toEdit, newValue)){

            this.setState({"settings": newSettings});

        }

        
    }

    async changeTrueFalse(type, value){

        if(value === "true"){
            value = "false";
        }else{
            value = "true";
        }

        await this.updateCurrentSettings(type, value);
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

    renderSettings(){

        if(this.state.settings === null) return null;

        const rows = [];

        const dropDownRows = [];

        for(let i = 0; i < this.state.settings.length; i++){

            const s = this.state.settings[i];

            let valueElem = null;
            let bDropDown = false;

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

            const elems = (bDropDown) ? dropDownRows : rows;

            elems.push(<tr key={i}>
                <td className="text-left">{s.name}</td>
                {valueElem}
                <td>
                    {(bDropDown) ? null :
                        <>
                            <img src="/images/up.png" className={styles.button} alt="up" onClick={(() =>{
                                this.changePosition(true, s.name);
                            })}/>
                            <img src="/images/down.png" className={styles.button} alt="down" onClick={(() =>{
                                this.changePosition(false, s.name);
                            })}/>
                        </>
                    }
                </td>
            </tr>);
        }

        return <div>
            <Table2 width={4}>
                <tr>
                    <th>Setting</th>
                    <th>Value</th>
                    <th>Change Position</th>
                </tr>
                {dropDownRows}
                {rows}
                
            </Table2>
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
}

export default AdminSiteSettings;