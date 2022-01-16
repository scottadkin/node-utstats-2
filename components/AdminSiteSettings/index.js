import React from 'react';
import Table2 from '../Table2';


class AdminSiteSettings extends React.Component{

    constructor(props){

        super(props);
        this.state = {"categories": null, "mode": 0, "settings": null, "validSettings": null};
        this.changeMode = this.changeMode.bind(this);
        this.changeTrueFalse = this.changeTrueFalse.bind(this);
    }

    async updateSetting(type, newValue){

        try{

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

            console.log(res);

            
            if(res.error === undefined){
                if(res.message === "passed"){
                    return true;
                }
            }

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

        this.setState({"mode": id});
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

            console.log(this.state.categories[this.state.mode]);

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"settings": res.data, "validSettings": res.valid});
            }
            console.log(res);

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

    renderDropDown(name){

        const options = [];

        if(this.state.validSettings[name] !== undefined){

            for(let i = 0; i < this.state.validSettings[name].length; i++){

                const setting = this.state.validSettings[name][i];

                options.push(<option key={i} value={setting.value}>{setting.name}</option>);
            }
        }
        
        return <select className="default-select">
            {options}
        </select>
    }

    renderSettings(){

        if(this.state.settings === null) return null;

        const rows = [];

        for(let i = 0; i < this.state.settings.length; i++){

            const s = this.state.settings[i];

            let valueElem = null;

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

                valueElem = <td>{this.renderDropDown(s.name)}</td>
            }

            rows.push(<tr key={i}>
                <td className="text-left">{s.name}</td>
                {valueElem}
                <td></td>
            </tr>);
        }

        return <div>
            <Table2 width={4}>
                <tr>
                    <th>Setting</th>
                    <th>Value</th>
                    <th>Change Position</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Site Settings</div>
            {this.renderTabs()}
            {this.renderSettings()}
        </div>
    }
}

export default AdminSiteSettings;