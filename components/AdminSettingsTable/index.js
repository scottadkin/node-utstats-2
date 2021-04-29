import styles from './AdminSettingsTable.module.css';
import React from 'react';

class AdminSettingsTable extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": this.props.data};

        console.log(this.props.data);

        this.saveSettings = this.saveSettings.bind(this);

        this.updateTrueFalse = this.updateTrueFalse.bind(this);
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


    saveSettings(e){

        e.preventDefault();

        console.log(e);

        console.log(`save ${this.props.title} settings`);
    }


    renderTrueFalse(name, value){


        const valueField= <input type="hidden" name={name} id={name} value={value}/>;

        if(value === 'false'){

            return <td onClick={(() =>{
                this.updateTrueFalse(name);
            })} className={styles.off}>
                OFF{valueField}
            </td>
        }else if(value === 'true'){

            return <td className={styles.on} onClick={(() =>{
                this.updateTrueFalse(name);
            })} >
                ON{valueField}
            </td>
        }
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
                <input type="submit" className="search-button" name="submit" value="Save Changes"/>
            </form>
        </div>
    }
}


export default AdminSettingsTable;