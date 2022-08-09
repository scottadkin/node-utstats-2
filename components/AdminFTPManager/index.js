import React from 'react';
import styles from './AdminFTPManager.module.css';
import AdminFTPManagerList from '../AdminFTPManagerList';
import AdminFTPManagerEdit from '../AdminFTPManagerEdit';


class AdminFTPManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 2, "selectedId": -1, "data": null, "lastSavedData": null};

        this.changeMode = this.changeMode.bind(this);
        this.changeSelected = this.changeSelected.bind(this);
        this.updateServerValue = this.updateServerValue.bind(this);
        this.saveChanges = this.saveChanges.bind(this);

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

    bAnyChangesNotSaved(){

        if(this.state.data === null) return false;

        if(this.state.data.length !== this.state.lastSavedData.length) return true;

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];
            const savedD = this.state.lastSavedData[i];

            for(const key of Object.keys(d)){

                console.log(d[key], savedD[key]);

                if(d[key] !== savedD[key]) return true;
            }
        }

        return false;

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

    changeSelected(e){

        console.log(e.target.value);
        this.setState({"selectedId": e.target.value});
    }

    changeMode(mode){
        this.setState({"mode": mode});
    }

    async componentDidMount(){

        await this.loadList();
    }

    renderList(){

        if(this.state.mode !== 0) return;

        return <AdminFTPManagerList data={this.state.data}/>
    }

    renderEdit(){

        if(this.state.mode !== 2) return;

        const bUnsavedChanges = this.bAnyChangesNotSaved();

        console.log(bUnsavedChanges);

        return <AdminFTPManagerEdit 
            data={this.state.data} 
            selectedId={this.state.selectedId} 
            changeSelected={this.changeSelected}
            updateValue={this.updateServerValue}
            bUnsavedChanges={bUnsavedChanges}
            saveChanges={this.saveChanges}
        />;
    }

    saveChanges(e){
        e.preventDefault();
        this.setState({"lastSavedData": this.state.data});
    }

    render(){

        return <div>
            <div className="default-header">FTP Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Current Servers</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Add Server</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Edit Server</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Delete Server</div>
            </div>
            {this.renderList()}
            {this.renderEdit()}

        </div>
    }
}

export default AdminFTPManager;