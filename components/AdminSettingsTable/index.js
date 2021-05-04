import styles from './AdminSettingsTable.module.css';
import React from 'react';

class AdminSettingsTable extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": this.props.data, "previousSavedData": this.props.data};

       // console.log(this.props.data);

       // console.log(this.props.validSettings);

        this.saveSettings = this.saveSettings.bind(this);

        this.updateTrueFalse = this.updateTrueFalse.bind(this);

        this.saveSettings = this.saveSettings.bind(this);

        this.updateDropDown = this.updateDropDown.bind(this);
    }


    updateDropDown(name, value){


        let d = 0;

        const updatedData = [];

        for(let i = 0; i < this.state.data.length; i++){

            d = this.state.data[i];

            if(d.name === name){
                updatedData.push({"name": name, "value": value});
            }else{
                updatedData.push(d);
            }
        }

        //console.log(updatedData);

        this.setState({"data": updatedData});
    }

    async saveSettings(e){

        try{

            if(process.browser){

                e.preventDefault();

                const req = await fetch("/api/sitesettings", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({"data": this.state.data, "category": this.props.title})
                });

                const result = await req.json();

                if(result.bPassed !== undefined){

                    if(result.bPassed){
                        this.setState({"previousSavedData": this.state.data});
                    }
                }
            }

        }catch(err){
            console.trace(err);
        }
    }
    

    updateTrueFalse(name){

        const data = [];

        let d = 0;

        let value = 0;

        for(let i = 0; i < this.state.data.length; i++){

            d = this.state.data[i];

            if(d.name === name){

                if(d.value === "true"){
                    value = "false";
                }else if(d.value === "false"){
                    value = "true";
                }

                data.push({
                    "name": d.name,
                    "value": value
                });

            }else{
                data.push({
                    "name": d.name,
                    "value": d.value
                });
            }
        }


        this.setState({"data": data});

    }

    renderTrueFalse(name, value){

        if(value === 'false'){

            return <td onClick={(() =>{
                this.updateTrueFalse(name);
            })} className={styles.off}>
                OFF
            </td>
        }else if(value === 'true'){

            return <td className={styles.on} onClick={(() =>{
                this.updateTrueFalse(name);
            })} >
                ON
            </td>
        }


        return this.renderDropDown(name, value);
    }



    renderDropDown(name, value){

       // console.log(name);

        const validSettings = this.props.validSettings;

        const options = [];

        if(validSettings[name] !== undefined){

            let d = 0;

            for(let i = 0; i < validSettings[name].length; i++){

                d = validSettings[name][i];

                options.push(<option key={i} value={d.value}>{d.name}</option>);
            }

        }else{
            console.trace(`validSettings.${name} is undefined. Can't create drop down data.`);
        }

        return <td><select className={styles.select} name={name} value={value} onChange={((e) =>{
            this.updateDropDown(name, e.target.value);
        })}>
            {options}
        </select></td>;
    }

    renderRows(){

        const rows = [];

        const settings = this.state.data;

        let s = 0;

        for(let i = 0; i < settings.length; i++){

            s = settings[i];

            rows.push(<tr key={i}>
                <td>{s.name}</td>
                {this.renderTrueFalse(s.name, s.value)}
            
            </tr>);
            //<input type="hidden" name={s.name} id={s.name} value={s.value}/>
        }

        return rows;

    }

    bAnySettingsChanged(){

        const previousSettings = this.state.previousSavedData;
        const currentSettings = this.state.data;

        let c = 0;
        let p = 0;

        for(let i = 0; i < previousSettings.length; i++){

            if(previousSettings[i].name === currentSettings[i].name){

                p = previousSettings[i].value;
                c = currentSettings[i].value;

                if(p !== c){
                    return true;
                }
            }else{
                throw new Error("Setting names do not match");
            }
        }
        

        return false;
    }


    renderUnsavedSettings(){

        if(this.bAnySettingsChanged()){

            return <div className={`${styles.unsaved} center`}>
                You have unsaved changes!
            </div>
        }

        return null;
    }

    render(){

        

        return <div>
            <div className="default-header">
                {this.props.title} Settings
            </div>
            <form action="/" onSubmit={this.saveSettings} method="POST">
                <table className={`t-width-1 ${styles.table}`}>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        {this.renderRows()}
                    </tbody>
                </table>
                {this.renderUnsavedSettings()}
                <input type="submit" className="search-button" name="submit" value="Save Changes"/>
            </form>
        </div>
    }
}


export default AdminSettingsTable;