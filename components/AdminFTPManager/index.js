import React from 'react';
import AdminFTPManagerList from '../AdminFTPManagerList';
import AdminFTPManagerEdit from '../AdminFTPManagerEdit';
import Notification from "../Notification";
import AdminFTPManagerCreate from '../AdminFTPManagerCreate';
import AdminFTPManagerDelete from '../AdminFTPManagerDelete';
import AdminImporterSettings from '../AdminImporterSettings';
import AdminLogsFolderEdit from '../AdminLogsFolderEdit';


class AdminFTPManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0, 
            "selectedId": -1, 
            "data": null, 
            "lastSavedData": null, 
            "logsFolder": null, 
            "lastSavedLogsFolder": null, 
            "logsError": null
        };

        this.changeMode = this.changeMode.bind(this);
        this.changeSelected = this.changeSelected.bind(this);
        this.updateServerValue = this.updateServerValue.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.saveAllChanges = this.saveAllChanges.bind(this);
        this.loadList = this.loadList.bind(this);
        this.updateLogsFolder = this.updateLogsFolder.bind(this);
        this.saveLogsFolder = this.saveLogsFolder.bind(this);

    }

    async saveLogsFolder(){

        const req = await fetch("/api/ftpadmin", {
            "method": "POST",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify({
                "mode": "savelogsfolder",
                "bIgnoreDuplicates": this.state.logsFolder.ignore_duplicates,
                "bIgnoreBots": this.state.logsFolder.ignore_bots,
                "minPlayers": this.state.logsFolder.min_players,
                "minPlaytime": this.state.logsFolder.min_playtime,
                "bImportAce": this.state.logsFolder.import_ace,
                "bUseACEPlayerHWID": this.state.logsFolder.use_ace_player_hwid
            })
        });

        const response = await req.json();

        if(response.error === undefined){

            await this.loadLogsFolderSettings();
        }
    }

    async updateLogsFolder(name, value){

        const newData = JSON.parse(JSON.stringify(this.state.logsFolder));

        newData[name] = value;

        this.setState({"logsFolder": newData});
    }

    async loadLogsFolderSettings(){

        const req = await fetch("/api/ftpadmin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "logsfolder"})
        });

        const response = await req.json();

        if(response.error === undefined){

            this.setState({"logsFolder": response.data[0], "lastSavedLogsFolder": response.data[0]});

        }else{

            this.setState({"logsError": response.error});
        }

    }

    async loadList(){

        const req = await fetch("/api/ftpadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "load"})
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"data": res.data, "lastSavedData": JSON.parse(JSON.stringify(res.data))});
        }
    }

    bAndLogsFolderChanges(){

        if(this.state.logsFolder == null) return false;

        for(const key of Object.keys(this.state.logsFolder)){

            if(this.state.logsFolder[key] !== this.state.lastSavedLogsFolder[key]) return true;
        }

        return false;
    }

    bAnyChangesNotSaved(){

        if(this.state.data == null) return false;

        if(this.state.data.length !== this.state.lastSavedData.length) return true;

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];
            const savedD = this.state.lastSavedData[i];

            for(const key of Object.keys(d)){

                if(d[key] !== savedD[key]) return true;
            }
        }

        return this.bAndLogsFolderChanges();

    }

    getServerData(id){

        id = parseInt(id);

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            if(d.id === id) return d;
        }

        return null;
    }

    updateServerValue(type, value){


        const data = this.getServerData(this.state.selectedId);

        if(data === null){
            console.trace("data is null");
            return;
        }

        data[type] = value;

        const updatedData = [];

        for(let i = 0; i < this.state.data.length; i++){
            
            const d = this.state.data[i];

            if(d.id !== data.id){
                updatedData.push(d);
            }else{
                updatedData.push(data);
            }
        }

        this.setState({"data": updatedData});
    }

    changeSelected(e, bFormEvent){

        bFormEvent = (bFormEvent === undefined) ? true : bFormEvent;

        if(bFormEvent){
            this.setState({"selectedId": e.target.value});
        }else{
            this.setState({"selectedId": e});
        }
       
    }

    changeMode(mode){
        this.setState({"mode": mode});
    }

    async componentDidMount(){

        await this.loadLogsFolderSettings();
        await this.loadList();
    }

    renderList(){

        if(this.state.mode !== 0) return;

        const elems = [
            <AdminImporterSettings key="folders" error={this.state.logsError} data={this.state.lastSavedLogsFolder}/>,
            <AdminFTPManagerList key="list" data={this.state.data} changeSelected={this.changeSelected} changeMode={this.changeMode}/>
        ];

        return elems;
    }

    renderEdit(){

        if(this.state.mode !== 2) return;

        return <AdminFTPManagerEdit 
            data={this.state.data} 
            selectedId={this.state.selectedId} 
            changeSelected={this.changeSelected}
            updateValue={this.updateServerValue}
            saveChanges={this.saveChanges}
        />;
    }

    getChangedSettings(){

        if(this.state.data === null) return [];

        const changed = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];
            const savedD = this.state.lastSavedData[i];

            for(const key of Object.keys(d)){

                if(d[key] !== savedD[key]){
                    changed.push(d.id);
                    break;
                }
            }
        }

        return changed;
    }

    async saveAllChanges(e){

        await this.saveChanges(e, true);
        await this.saveLogsFolder();
    }

    async replaceServerItem(data){

        const newData = [];

        for(let i = 0; i < this.state.lastSavedData.length; i++){

            const d = this.state.lastSavedData[i];

            if(d.id === data.id){
                newData.push(data);
            }else{
                newData.push(d);
            }
        }
        

        this.setState({
            "lastSavedData": newData,
            "lastSavedData": JSON.parse(JSON.stringify(newData))
        });
    }

    async saveChange(data){

        const req = await fetch("/api/ftpadmin", {
            "headers": {"Content-Type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "edit",
                "id": data.id,
                "server": data.name,
                "ip": data.host,
                "port": data.port,
                "user": data.user,
                "password": data.password,
                "folder": data.target_folder,
                "deleteLogs": data.delete_after_import,
                "deleteTmp": data.delete_tmp_files,
                "ignoreBots": data.ignore_bots,
                "ignoreDuplicates": data.ignore_duplicates,
                "minPlayers": data.min_players,
                "minPlaytime": data.min_playtime,
                "bSecure": data.sftp,
                "importAce": data.import_ace,
                "deleteAceLogs": data.delete_ace_logs,
                "deleteAceScreenshots": data.delete_ace_screenshots,
                "enabled": data.enabled,
                "bUseACEPlayerHWID": data.use_ace_player_hwid
            })
        });

        const res = await req.json();
        
        if(res.error === undefined){

            this.replaceServerItem(data);

        }
    }

    async saveChanges(e, bSaveAll){

        try{

            if(bSaveAll === undefined) bSaveAll = false;

            e.preventDefault();

            const changes = this.getChangedSettings();

            if(changes.length === 0) return;

            if(bSaveAll){

                for(let i = 0; i < changes.length; i++){

                    const data = this.getServerData(changes[i]);
                    await this.saveChange(data);
                    
                }

            }else{

                const targetId = this.state.selectedId;

                const data = this.getServerData(targetId);

                if(data !== null){

                    await this.saveChange(data);
                }

            }

        }catch(err){
            console.trace(err);
        }
    }

    renderNotifcation(){

        if(this.bAnyChangesNotSaved()){

            const messages = [];

            const changedSettingIds = this.getChangedSettings();

            if(changedSettingIds.length > 0){

                for(let i = 0; i < changedSettingIds.length; i++){

                    const c = changedSettingIds[i];
                    const data = this.getServerData(c);

                    messages.push(<div key={i}>You have unsaved changes to server <span className="yellow"><b>{data.name}</b> {data.host}:{data.port}</span></div>);
                }
            }

            if(this.bAndLogsFolderChanges()){

                messages.push(<div key={"logs-folder"}>
                    You have unsaved changes to the <span className="yellow"><b>website&#39;s Logs folder settings!</b></span>
                </div>);
            }

            return <Notification type="warning">
                {messages}
                <div className="search-button m-top-25" onClick={this.saveAllChanges}>Save all changes</div>
            </Notification>
        }
    }

    renderCreate(){

        if(this.state.mode !== 1) return null;

        return <AdminFTPManagerCreate loadList={this.loadList}/>;
    }

    renderDelete(){

        if(this.state.mode !== 3) return null;

        return <AdminFTPManagerDelete 
            data={this.state.data} 
            loadList={this.loadList} 
            changeSelected={this.changeSelected}
            selected={this.state.selectedId}
        />;
    }

    renderLogsFolderEdit(){

        if(this.state.mode !== 4) return null;

        return <AdminLogsFolderEdit 
            error={this.state.logsError} 
            data={this.state.logsFolder} 
            savedData={this.state.lastSavedLogsFolder}
            updateValue={this.updateLogsFolder}
            saveChanges={this.saveLogsFolder}
        />;
    }

    render(){

        return <div>
            <div className="default-header">Importer Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Current Servers</div>
                <div className={`tab ${(this.state.mode === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(4);
                })}>Logs Folder</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Add FTP Server</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Edit FTP Servers</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Delete FTP Servers</div>
            </div>
            {this.renderList()}
            {this.renderEdit()}
            {this.renderCreate()}
            {this.renderDelete()}
            {this.renderLogsFolderEdit()}
            {this.renderNotifcation()}

        </div>
    }
}

export default AdminFTPManager;