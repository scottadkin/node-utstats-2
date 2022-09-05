import React from 'react';
import styles from './AdminNexgenStatsViewer.module.css';
import Table2 from '../Table2';
import Loading from '../Loading';
import Notification from '../Notification';
import FormCheckBox from '../FormCheckBox';
import Image from 'next/image';

class AdminNexgenStatsViewer extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0,
            "data": null,  
            "lastSavedData": null, 
            "validTypes": null, 
            "error": null,
            "createForm":{
                "title": "",
                "type": 0,
                "gametype": 0,
                "players": 0,
                "enabled": true
            }
        };

        this.changeValue = this.changeValue.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.changeCreateValue = this.changeCreateValue.bind(this);
        this.saveNewList = this.saveNewList.bind(this);
        this.deleteList = this.deleteList.bind(this);
        this.moveUp = this.moveUp.bind(this);
        this.moveDown = this.moveDown.bind(this);
    }


    getListCurrentPosition(currentOrder, id){

        for(let i = 0; i < currentOrder.length; i++){

            const c = currentOrder[i];

            if(c.id === id){
                return i;
            }
        }

        return -1;

    }

    moveUp(id){

        const currentOrder = JSON.parse(JSON.stringify(this.state.data));

        const currentPosition = this.getListCurrentPosition(currentOrder, id);

        if(currentPosition === 0) return;

        const previousData = Object.assign({}, currentOrder[currentPosition - 1]);
        const targetData = Object.assign({}, currentOrder[currentPosition]);

        currentOrder.splice(currentPosition - 1, 1, targetData);
        currentOrder.splice(currentPosition, 1, previousData);

        for(let i = 0; i < currentOrder.length; i++){

            const c = currentOrder[i];
            c.position = i;
        }


        this.setState({"data": currentOrder});

    }


    moveDown(id){

        const currentOrder = JSON.parse(JSON.stringify(this.state.data));

        const currentPosition = this.getListCurrentPosition(currentOrder, id);

        if(currentPosition >= currentOrder.length - 1) return;

        const targetData = Object.assign({}, currentOrder[currentPosition]);
        const nextData = Object.assign({}, currentOrder[currentPosition + 1]);

        currentOrder.splice(currentPosition, 1, nextData);
        currentOrder.splice(currentPosition + 1, 1,  targetData);


        for(let i = 0; i < currentOrder.length; i++){

            const c = currentOrder[i];
            c.position = i;
        }

        this.setState({"data": currentOrder});

    }

    async deleteList(id){

        const req = await fetch("/api/admin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "nexgendelete", "id": id})
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error});
            return;
        }

        await this.loadData();
    }

    resetCreateForm(){

        this.setState({
            "createForm": {
                "title": "",
                "type": 0,
                "gametype": 0,
                "players": 0,
                "enabled": true
            }
        });
    }

    changeCreateValue(type, value){

        const data = JSON.parse(JSON.stringify(this.state.createForm));

        data[type] = value;

        this.setState({"createForm": data});
    }

    async saveNewList(e){

        e.preventDefault();

        const req = await fetch("/api/admin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "nexgencreate", "settings": this.state.createForm})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error});
            return;
        }

        this.setState({"error": null});
        this.resetCreateForm();

        await this.loadData();
    }


    async saveChanges(){

        const req = await fetch("/api/admin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "nexgensave", "settings": this.state.data})
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"lastSavedData": this.state.data});
            return;

        }

        this.setState({"error": res.error});
    }


    changeValue(id, type, value){

        if(type === null) return;

        const data = JSON.parse(JSON.stringify(this.state.data));

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(d.id === id){

                d[type] = value;
                break;
            }
        }

        this.setState({"data": data});

    }

    async loadData(){

        const req = await fetch("/api/admin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "nexgensettings"})
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error});
            return;
        }
        

        this.setState({
            "data": res.data, 
            "lastSavedData": res.data, 
            "validTypes": res.validTypes, 
            "error": null
        });

    }

    async componentDidMount(){

        await this.loadData();
    }

    renderLoading(){

        if(this.state.data !== null) return null;

        return <Loading />;
    }


    bAnyChanges(){

        if(this.state.data === null) return false;

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            for(const key of Object.keys(d)){

                if(d[key] !== this.state.lastSavedData[i][key]) return true;
            }
        }

        return false;
    }


    renderNotification(){


        if(this.bAnyChanges()){
            return <Notification type="warning">
                You have unsaved changes!
            </Notification>
        }


        if(this.state.error !== null){
            return <Notification type="error">
                {this.state.error}
            </Notification>
        }
    }


    createTypeDropDown(value, id, bCreateForm){

        if(bCreateForm === undefined) bCreateForm = false;
        
        const options = [];

        for(let i = 0; i < this.state.validTypes.length; i++){

            const t = this.state.validTypes[i];

            options.push(<option key={t.id} value={t.id}>{t.name}</option>);
        }

        return <select value={value} className="default-select" onChange={((e) =>{

            const value = parseInt(e.target.value);

            if(!bCreateForm){
                this.changeValue(id, "type", value);
            }else{
                this.changeCreateValue("type", value);
            }
        })}>
            <option value={"-1"}>Select an option...</option>
            {options}
        </select>
    }

    createGametypesDropDown(value, id, bCreateForm){

        if(bCreateForm === undefined) bCreateForm = false;

        const options = [];

        for(let i = 0; i < this.props.gametypes.length; i++){

            const t = this.props.gametypes[i];

            options.push(<option key={t.id} value={t.id}>{t.name}</option>);
        }

        return <select value={value} className="default-select" onChange={((e) =>{

                const value = parseInt(e.target.value);

                if(!bCreateForm){
                    this.changeValue(id, "gametype", value);
                }else{
                    this.changeCreateValue("gametype", value);
                }

            })}>
            <option value={"-1"}>Select an option...</option>
            <option value={"0"}>All Gametypes</option>
            {options}
        </select>
    }

    renderData(){

        if(this.state.data === null) return null;

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            rows.push(<tr key={d.id}>
                <FormCheckBox bTable={true} valueName={"enabled"} value={d.enabled} updateValue={
                    ((type, value) =>{
                        this.changeValue(d.id, type, value);
                    })
                }/>
                <td>
                    <input type="text" className="default-textbox" value={d.title} onChange={((e) =>{
                        this.changeValue(d.id, "title", e.target.value)
                    })}/>
                </td>
                <td>{this.createTypeDropDown(d.type, d.id)}</td>
                <td>{this.createGametypesDropDown(d.gametype, d.id)}</td>
                <td>
                    <input type="number" className="default-textbox" value={d.players} min={0} max={30} onChange={((e) =>{
                    this.changeValue(d.id, "players", parseInt(e.target.value))
                })}/>
                </td>
                <td>
                    <Image src="/images/up.png" className="pointer" width={24} height={24} onClick={(() =>{
                        this.moveUp(d.id);
                    })}/>
                    
                    <Image src="/images/down.png" className="pointer"  width={24} height={24} onClick={(() =>{
                        this.moveDown(d.id);
                    })}/>
                </td>
                <td>
                    <div className={`red ${styles.delete}`} onClick={(() =>{
                        this.deleteList(d.id);
                    })}>Delete</div>
                </td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="dogfoodfarts">
                <td colSpan="7">No lists have been created.</td>
            </tr>);
        }

        return <div>
                <Table2 width={1}>
                <tr>
                    <th>Enabled</th>
                    <th>Display Title</th>
                    <th>Type</th>
                    <th>Gametype</th>
                    <th>Total Entries</th>
                    <th>Position</th>
                    <th>Delete</th>
                </tr>
                {rows}
            </Table2>
            <input type="button" className="search-button" value="Save Changes" onClick={this.saveChanges}/>
        </div>
    }

    renderCreateForm(){

        if(this.state.validTypes === null) return;

        return <div>
            <div className="default-header">Create New List</div>
            <div className="form">
           
                <form action="/" method="POST" onSubmit={this.saveNewList}>
                <div className="select-row">
                        <div className="select-label">Enabled</div>
                        <FormCheckBox valueName={"enabled"} value={this.state.createForm.enabled} updateValue={this.changeCreateValue}/>
                    </div>
                    <div className="select-row">
                        <div className="select-label">Display Title</div>
                        <input type="text" className="default-textbox" value={this.state.createForm.title} onChange={((e) =>{

                            this.changeCreateValue("title", e.target.value);
                        })}/>
                    </div>
                    <div className="select-row">
                        <div className="select-label">List Type</div>
                        {this.createTypeDropDown(this.state.createForm.type, "", true)}
                    </div>
                    <div className="select-row">
                        <div className="select-label">Gametype</div>
                        {this.createGametypesDropDown(this.state.createForm.gametype, "", true)}
                    </div>
                    <div className="select-row">
                        <div className="select-label">Total Entries</div>
                        <input type="number" className="default-textbox" min={0} max={30} value={this.state.createForm.players} onChange={((e) =>{
               
                            this.changeCreateValue("players", e.target.value);
                        })}/>
                    </div>

                    <input type="submit" className="search-button" value="Create List"/>
                </form>
            </div>
        </div>
    }

    renderManage(){

        if(this.state.mode !== 0) return null;

        return <>
            <div className="default-header">
                Manage Lists
            </div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    NexgenStatsViewer can support up to 5 lists with a combined total of 30 players.
                </div>
            </div>
            {this.renderLoading()}
            {this.renderData()}
            {this.renderCreateForm()}
        </>

    }

    render(){

        return <div>
            <div className="default-header">NexgenStatsViewer</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`}>Manage Lists</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}>Preview Lists</div>
            </div>
            {this.renderManage()}
            {this.renderNotification()}
            
        </div>
    }
}


export default AdminNexgenStatsViewer;