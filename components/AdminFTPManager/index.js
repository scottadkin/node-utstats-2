import React from 'react';


class AdminFTPManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "selectedServer": -1,
            "currentName": "",
            "currentHost": 0,
            "currentPort": 0,
            "currentUser": "",
            "currentPassword": "",
            "currentFolder": "",
            "currentLogs": ""
        };

        this.updateSelected = this.updateSelected.bind(this);

        this.changeDeleteValue = this.changeDeleteValue.bind(this);
    }


    setDeleteValue(id, value){


        const oldServers = this.props.servers;


        const newServers = [];


        for(let i = 0; i < oldServers.length; i++){

            if(oldServers[i].id === id){
                console.log("found id");
                newServers.push({
                    "id": id,
                    "name": oldServers[i].name,
                    "host": oldServers[i].host,
                    "port": oldServers[i].port,
                    "user": oldServers[i].user,
                    "password": oldServers[i].password,
                    "target_folder": oldServers[i].target_folder,
                    "delete_after_import": value
                });

            }else{
                newServers.push(oldServers[i]);
            }
        }

        console.log(newServers);

        this.props.updateParent(newServers);
    }

    changeDeleteValue(e){


        const id = e.target.id;

        console.log(id);

        const reg = /delete_(.+)/ig;

        const result = reg.exec(id);

        console.log(result);

        if(result !== null){

            const parsedId = parseInt(result[1]);

            if(parsedId === parsedId){

                let value = 0;

                if(e.target.checked){
                    value = 1;
                }else{
                    value = 0;
                }

                this.setDeleteValue(parsedId, value);

            }else{
                console.log(`id is NaN`);
            }

        }
    }


    updateSelected(e){

        const value = parseInt(e.target.value);

        console.log(`selected ${value}`);

        this.setState({"selectedServer": value});

        //this.setEditForm();

    }
    

    renderTable(){

        const rows = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            rows.push(<tr key={i}>
                <td>{s.host}</td>
                <td>{s.port}</td>
                <td>{s.user}</td>
                <td>{s.target_folder}</td>
                <td>{s.delete_after_import}</td>
                <td>{s.first}</td>
                <td>{s.last}</td>
                <td>{s.total_imports}</td>
            </tr>);
        }


        return <div>
            <div className="default-header">Current Servers</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Host</th>
                        <th>Port</th>
                        <th>User</th>
                        <th>Target Folder</th>
                        <th>Delete After Import</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Total</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }


    createServersDropDown(){

        const options = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            options.push(<option key={i} value={s.id}>
                {s.name} ({s.host}:{s.port}) 
            </option>);
        }

        return <select className="default-select m-bottom-25" value={this.state.selectedServer} onChange={this.updateSelected}>
            <option value="-1">Select a server</option>
            {options}
        </select>
    }

    getServerSettings(){


        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            if(s.id === this.state.selectedServer){
                return s;
            }
        }


        return {
            "id": -1,
            "name": "",
            "host": "",
            "port": "",
            "user": "",
            "password": "",
            "target_folder": "",
            "delete_after_import": ""
        };
    }

    renderEditForm(){

        let selected = 0;

        if(this.state.selectedServer !== -1){
            selected = this.getServerSettings();
        }


        console.log(selected);


        return <div>
            <div className="default-header">Edit Server</div>
            <form className="form" action="/" method="POST">
                <div className="form-info">
                    Edit an existing server.
                </div>
                {this.createServersDropDown()}
                <div className="select-row">
                    <div className="select-label">Name</div>
                    <div>
                        <input type="text" defaultValue={selected.name} id="name" className="default-textbox" placeholder="Name..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Host</div>
                    <div>
                        <input type="text" defaultValue={selected.host} id="host" className="default-textbox" placeholder="Host..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Port</div>
                    <div>
                        <input type="text" defaultValue={selected.port} id="port" className="default-textbox" placeholder="Port"/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">User</div>
                    <div>
                        <input type="text" defaultValue={selected.user} id="user" className="default-textbox" placeholder="User..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Password</div>
                    <div>
                        <input type="password" defaultValue={selected.password} id="password" className="default-textbox" placeholder="password..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Target Folder</div>
                    <div>
                        <input type="text" defaultValue={selected.target_folder} id="folder" className="default-textbox" placeholder="target folder..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete Logs After Import</div>
                    <div>
                        <input id="logs" defaultChecked={selected.delete_after_import} id={`delete_${selected.id}`} type="checkbox" onChange={this.changeDeleteValue}/>
                    </div>
                </div>
                <input type="submit" className="search-button" value="Update"/>
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">FTP Manager</div>

            {this.renderTable()}
            {this.renderEditForm()}
        </div>
    }
}

export default AdminFTPManager;