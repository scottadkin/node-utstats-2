import React from "react";
import FormCheckBox from "../FormCheckBox";

class AdminFTPManagerEdit extends React.Component{

    constructor(props){

        super(props);

        this.updateValue = this.updateValue.bind(this);

    }

    updateValue(type, value){

        this.props.updateValue(type, value);

    }

    update(e){

        e.preventDefault();
    }

    renderSelectList(){

        const options = [];

        if(this.props.data !== null){

            for(let i = 0; i < this.props.data.length; i++){

                const d = this.props.data[i];
                options.push(<option key={d.id} value={d.id}>{d.name} - {d.host}:{d.port}</option>)
            }
        }

        return <select className="default-select" onChange={this.props.changeSelected}>
            <option value="-1">Please select a server to edit</option>
            {options}
        </select>
    }

    getSelectedData(){

        const selectedId = parseInt(this.props.selectedId);

        if(selectedId === -1) return null;

        for(let i = 0; i < this.props.data.length; i++){

            const d = this.props.data[i];

            if(d.id === selectedId){
                return d;
            }
        }

        return null;
    }

    renderFormElems(data){

        if(data === null) return;

        return <>
            <div className="select-row">
                <div className="select-label">Name</div>
                <div>
                    <input className="default-textbox" type="text" name="server-name" value={data.name} onChange={(e) =>{
                        this.props.updateValue("name", e.target.value);
                    }}/>
                </div>
            </div>
            <div className="select-row">
                <div className="select-label">Secure FTP</div>
                <div>
                    <FormCheckBox inputName={"bSecure"} valueName="sftp" value={data.sftp} updateValue={this.updateValue}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Host</div>
                <div>
                    <input className="default-textbox" type="text" value={data.host} name="server-host" onChange={(e) =>{
                        this.props.updateValue("host", e.target.value);
                    }}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Port</div>
                <div>
                    <input className="default-textbox" type="number" value={data.port} name="server-port" min={0} max={65535} onChange={(e) =>{
                        this.props.updateValue("port", e.target.value);
                    }}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">User</div>
                <div>
                    <input className="default-textbox" type="text" value={data.user} name="server-user" onChange={(e) =>{
                        this.props.updateValue("user", e.target.value);
                    }}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Password</div>
                <div>
                    <input className="default-textbox" type="password" value={data.password} name="server-password" onChange={(e) =>{
                        this.props.updateValue("password", e.target.value);
                    }}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Target Folder</div>
                <div>
                    <input className="default-textbox" type="text" value={data.target_folder} name="server-folder" onChange={(e) =>{
                        this.props.updateValue("target_folder", e.target.value);
                    }}/>
                </div>
            </div>


            <div className="select-row">
                <div className="select-label">Delete Files From FTP Server After Import</div>
                <div>
                    <FormCheckBox inputName={"bDeleteAfter"} valueName="delete_after_import"  value={data.delete_after_import} updateValue={this.updateValue}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Delete .TMP Files From FTP Server</div>
                <div>
                    <FormCheckBox inputName={"bDeleteTMP"} valueName="delete_tmp_files"  value={data.delete_tmp_files} updateValue={this.updateValue}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Ignore Bots</div>
                <div>
                    <FormCheckBox inputName={"bIgnoreBots"} valueName="ignore_bots" value={data.ignore_bots} updateValue={this.updateValue}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Ignore Duplicate Logs</div>
                <div>
                    <FormCheckBox inputName={"bIgnoreDuplicates"} valueName="ignore_duplicates" value={data.ignore_duplicates} updateValue={this.updateValue}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Minimum Players</div>
                <div>
                    <input className="default-textbox" type="number" value={data.min_players} name="server-players" min={0} onChange={(e) =>{
                        this.props.updateValue("min_players", e.target.value);
                    }}/>
                </div>
            </div>

            <div className="select-row">
                <div className="select-label">Minimum Playtime(in seconds)</div>
                <div>
                    <input className="default-textbox" type="number" value={data.min_playtime} name="server-playtime" min={0} onChange={(e) =>{
                        this.props.updateValue("min_playtime", e.target.value);
                    }}/>
                </div>
            </div>
            

            <input type="submit" className="search-button" value="Update Server"/>
        </>;

    }

    render(){

        const currentData = this.getSelectedData();

        console.log(currentData);

        return <div>          
            <div className="default-header">Edit Servers</div>
            <div className="form">
                <div className="form-info m-bottom-10">
                    Edit FTP settings of servers currently added to the import list.<br/>
                    Default port for ftp is 21, default port for sftp is 22.
                </div>
                <form action="/" method="POST" onSubmit={this.update}>
                    <div className="select-row">
                        <div className="select-label">Selected Server</div>
                        <div>
                            {this.renderSelectList()}
                        </div>
                    </div>

                    {this.renderFormElems(currentData)}
                </form>
            </div>
        </div>
    }
}

export default AdminFTPManagerEdit;