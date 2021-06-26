import React from 'react';
import OnOff from '../OnOff';

class AdminNexgenStatsViewer extends React.Component{

    constructor(props){

        super(props);

        this.changeOnOff = this.changeOnOff.bind(this);
    }


    changeOnOff(id, value){

        console.log(`CHANGE VALUE for ${id} to ${value}`);

        this.props.updateSettings(id, "enabled", value);
    }

    createTypeDropDown(id, defaultValue){

        const options = [];

        options.push(<option key={-1} value="-1">Select an option</option>);

        let t = 0;

        for(let i = 0; i < this.props.validTypes.length; i++){

            t = this.props.validTypes[i];

            options.push(<option key={i} value={t.id}>{t.name}</option>);

        }

        return <select id={`type-${id}`} className="default-select" defaultValue={defaultValue}>
            {options}
        </select>;
    }

    createGametypeDropDown(id, defaultValue){

        const options = [
            <option key={-1} value="-1">Select an option</option>,
            <option key={-2} value="0">All Gametypes</option>
        ];

        let g = 0;

        for(let i = 0; i < this.props.gametypeNames.length; i++){

            g = this.props.gametypeNames[i];

            options.push(<option key={i} value={g.id}>{g.name}</option>);
        }


        return <select id={`gametype-${id}`} className="default-select" defaultValue={defaultValue}>
            {options}
        </select>

    }


    renderTable(){

        const rows = [];

        let s = 0;

        for(let i = 0; i < this.props.settings.length; i++){

            s = this.props.settings[i];

            rows.push(<tr key={i}>
                <td><input type="text" className="default-textbox" defaultValue={s.title} placeholder={"title..."}/></td>
                <td>{this.createTypeDropDown(s.id, s.type)}</td>
                <td>{this.createGametypeDropDown(s.id, s.gametype)}</td>
                <td><input type="number" className="default-number" defaultValue={s.players} min={1} max={30}/></td>
                <td><OnOff id={s.id} value={s.enabled} changeValue={this.changeOnOff}/></td>
                <td></td>
            </tr>);
        }

        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Gametype</th>
                    <th>To Display</th>
                    <th>Enabled</th>
                    <th>Position</th>
                </tr>
                {rows}
            </tbody>
        </table>
    }

    render(){

        return <div>
            <div className="default-header">NexgenStatsViewer Settings</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    NexgenStatsViewer can support up to 5 lists with a combined total of 30 players.
                </div>
            </div>
            {this.renderTable()}
        </div>
    }
}


export default AdminNexgenStatsViewer;