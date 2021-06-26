import React from 'react';
import OnOff from '../OnOff';
import styles from './AdminNexgenStatsViewer.module.css';

class AdminNexgenStatsViewer extends React.Component{

    constructor(props){

        super(props);

        this.changeOnOff = this.changeOnOff.bind(this);
        this.changePlayerCount = this.changePlayerCount.bind(this);
        this.changeGametype = this.changeGametype.bind(this);
        this.changeType = this.changeType.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.moveUp = this.moveUp.bind(this);
        this.moveDown = this.moveDown.bind(this);
    }

    getListCurrentPosition(id){

        let s = 0;

        for(let i = 0; i < this.props.settings.length; i++){

            s = this.props.settings[i];

            if(s.id === id) return {"position": i, "data": s}
        }

        return null;
    }

    moveUp(e){

        const reg = /^up-(.+)$/i;
        const result = reg.exec(e.target.id);

        if(result !== null){

            const id = parseInt(result[1]);

            const currentIndex = this.getListCurrentPosition(id);

            //can't move list down from last
            if(currentIndex.position - 1 < 0) return;

            if(currentIndex === null){
                console.trace(`currentIndex is null`);
                return;
            }

            const newList = Object.assign(this.props.settings);

            const first = {
                "id": this.props.settings[currentIndex.position].id,
                "title": this.props.settings[currentIndex.position].title,
                "type": this.props.settings[currentIndex.position].type,
                "gametype": this.props.settings[currentIndex.position].gametype,
                "players": this.props.settings[currentIndex.position].players,
                "position": this.props.settings[currentIndex.position - 1].position,
                "enabled": this.props.settings[currentIndex.position].enabled,
            };

            const second = {
                "id": this.props.settings[currentIndex.position - 1].id,
                "title": this.props.settings[currentIndex.position - 1].title,
                "type": this.props.settings[currentIndex.position - 1].type,
                "gametype": this.props.settings[currentIndex.position - 1].gametype,
                "players": this.props.settings[currentIndex.position - 1].players,
                "position": this.props.settings[currentIndex.position].position,
                "enabled": this.props.settings[currentIndex.position - 1].enabled,
            };

            newList[currentIndex.position] = second;
            newList[currentIndex.position - 1] = first;

            this.props.setFullList(newList);
        }
    }

    moveDown(e){


        const reg = /^down-(.+)$/i;
        const result = reg.exec(e.target.id);

        if(result !== null){

            const id = parseInt(result[1]);

            const currentIndex = this.getListCurrentPosition(id);

            //can't move list down from last
            if(currentIndex.position + 1 >= this.props.settings.length) return;

            if(currentIndex === null){
                console.trace(`currentIndex is null`);
                return;
            }

            const newList = Object.assign(this.props.settings);

            const first = {
                "id": this.props.settings[currentIndex.position].id,
                "title": this.props.settings[currentIndex.position].title,
                "type": this.props.settings[currentIndex.position].type,
                "gametype": this.props.settings[currentIndex.position].gametype,
                "players": this.props.settings[currentIndex.position].players,
                "position": this.props.settings[currentIndex.position + 1].position,
                "enabled": this.props.settings[currentIndex.position].enabled,
            };

            const second = {
                "id": this.props.settings[currentIndex.position + 1].id,
                "title": this.props.settings[currentIndex.position + 1].title,
                "type": this.props.settings[currentIndex.position + 1].type,
                "gametype": this.props.settings[currentIndex.position + 1].gametype,
                "players": this.props.settings[currentIndex.position + 1].players,
                "position": this.props.settings[currentIndex.position].position,
                "enabled": this.props.settings[currentIndex.position + 1].enabled,
            };

            newList[currentIndex.position] = second;
            newList[currentIndex.position + 1] = first;

            this.props.setFullList(newList);
        }
    }

    changeTitle(e){

        const reg = /^title-(.+)$/i;
        const result = reg.exec(e.target.id);

        if(result !== null){

            this.props.updateSettings(parseInt(result[1]), "title", e.target.value);
        }

    }

    changeType(e){

        const reg = /^type-(.+)$/i;
        const result = reg.exec(e.target.id);

        if(result !== null){

            this.props.updateSettings(parseInt(result[1]), "type", e.target.value);
        }
    }

    changeGametype(e){

        const reg = /^gametype-(.+)$/i;
        const result = reg.exec(e.target.id);

        if(result !== null){

            this.props.updateSettings(parseInt(result[1]), "gametype", e.target.value);
        }
    }

    changePlayerCount(e){

        const reg = /^number-(.+)$/i;

        const result = reg.exec(e.target.id);

        if(result !== null){

            this.props.updateSettings(parseInt(result[1]), "players", e.target.value);
        }

    }


    changeOnOff(id, value){

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

        return <select id={`type-${id}`} className="default-select" value={defaultValue} onChange={this.changeType}>
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


        return <select id={`gametype-${id}`} className="default-select" value={defaultValue} onChange={this.changeGametype}>
            {options}
        </select>

    }


    renderTable(){

        const rows = [];

        let s = 0;

        for(let i = 0; i < this.props.settings.length; i++){

            s = this.props.settings[i];

            rows.push(<tr key={i}>
                <td><input type="text" id={`title-${s.id}`} className="default-textbox" defaultValue={s.title} placeholder={"title..."} onChange={this.changeTitle}/></td>
                <td>{this.createTypeDropDown(s.id, s.type)}</td>
                <td>{this.createGametypeDropDown(s.id, s.gametype)}</td>
                <td><input type="number" id={`number-${s.id}`} className="default-number" defaultValue={s.players} min={1} max={30} onChange={this.changePlayerCount}/></td>
                <td><OnOff id={s.id} value={s.enabled} changeValue={this.changeOnOff}/></td>
                <td>
                    <div id={`down-${s.id}`} className={`${styles.button} team-red`} onClick={this.moveDown}>Down</div>
                    <div id={`up-${s.id}`} className={`${styles.button} team-green`} onClick={this.moveUp}>Up</div>
                </td>
            </tr>);
        }

        return <table className="t-width-1 m-bottom-25">
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

    renderUnsavedChanges(){

        if(this.props.saveInProgress) return null;
        
        let current = this.props.settings;
        let old = this.props.lastSavedSettings;

        const elem = <div className="team-red center m-bottom-25 t-width-1 p-top-25 p-bottom-25">
            You have unsaved changes
        </div>

        if(current.length !== old.length) return elem;

        for(let i = 0; i < current.length; i++){


            for(const [key, value] of Object.entries(current[i])){

                if(current[i][key] != old[i][key]){

                    return elem;
                }
            }
        }

        
        return null;
    }

    renderSaveInProgress(){

        if(!this.props.saveInProgress) return null;

        return <div className="team-yellow center m-bottom-25 t-width-1 p-top-25 p-bottom-25">
            Save in progress please wait...
        </div>
    }

    renderSavePassed(){

        if(this.props.savePassed !== true) return null;
        if(this.props.saveInProgress) return null;

        return <div className="team-green center m-bottom-25 t-width-1 p-top-25 p-bottom-25">
            Settings where updated successfully.
        </div>
    }

    renderErrors(){

        if(this.props.errors.length === 0) return null;

        const errors = [];

        let e = 0;

        for(let i = 0; i < this.props.errors.length; i++){

            e = this.props.errors[i];
            
            errors.push(<div>{e}</div>);
        }

        return <div className="team-red center m-bottom-25 t-width-1 p-top-25 p-bottom-25">
            There was a problem updating nexgen stats viewer settings.<br/><br/>
            {errors}
        </div>
    }

    render(){

        return <div>
            <div className="default-header">NexgenStatsViewer Settings</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    NexgenStatsViewer can support up to 5 lists with a combined total of 30 players.
                </div>
            </div>
            {this.renderSaveInProgress()}
            {this.renderUnsavedChanges()}
            {this.renderSavePassed()}
            {this.renderErrors()}
            {this.renderTable()}
            <div className="search-button" onClick={this.props.save}>Save Changes</div>
        </div>
    }
}


export default AdminNexgenStatsViewer;