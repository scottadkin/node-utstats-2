import React from "react";
import FormCheckBox from "../FormCheckBox";

class AdminFTPManagerCreate extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "server": "",
            "ip": "",
            "port": 21,
            "user": "",
            "password": "",
            "folder": "",
            "deleteLogs": false,
            "deleteTmp": false,
            "ignoreBots": false,
            "ignoreDuplicates": false,
            "minPlayers": 0,
            "minPlaytime": 0,
            "bSecure": false,
        };

        this.updateValue = this.updateValue.bind(this);
    }

    updateValue(name, value){

        this.setState({[name]: value});   
    }

    async createServer(e){

        e.preventDefault();

        console.log(e.target);
    }

    render(){

        return <div>
            <div className="default-header">Add FTP Server</div>
            
            <form className="form" action="/" method="POST" onSubmit={this.createServer}>
                <div className="default-sub-header-alt">Information</div>
                <div className="form-info m-bottom-10">Default port for ftp is 21, default port for sftp is 22.</div>
                <div className="select-row">
                    <div className="select-label">Name</div>
                    <div>
                        <input className="default-textbox" type="text" name="server-name" />
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Secure FTP</div>
                    <div>
                        <FormCheckBox inputName={"bSecure"} valueName="bSecure" updateValue={this.updateValue} value={this.state.bSecure}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Host</div>
                    <div>
                        <input className="default-textbox" type="text"  name="server-host" onChange={(e) =>{
                            this.updateValue("server", e.target.value);
                        }}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Port</div>
                    <div>
                        <input className="default-textbox" type="number"  name="server-port" min={0} max={65535} value={this.state.port} onChange={(e) =>{
                            this.updateValue("port", e.target.value);
                        }}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">User</div>
                    <div>
                        <input className="default-textbox" type="text"  name="server-user" onChange={(e) =>{
                            this.updateValue("user", e.target.value);
                        }} />
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Password</div>
                    <div>
                        <input className="default-textbox" type="password"  name="server-password"  onChange={(e) =>{
                            this.updateValue("password", e.target.value);
                        }}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Target Folder</div>
                    <div>
                        <input className="default-textbox" type="text" name="server-folder"  onChange={(e) =>{
                            this.updateValue("folder", e.target.value);
                        }}/>
                    </div>
                </div>


                <div className="select-row">
                    <div className="select-label">Delete Files From FTP Server After Import</div>
                    <div>
                        <FormCheckBox inputName={"bDeleteAfter"} valueName="deleteLogs" updateValue={this.updateValue} value={this.state.deleteLogs}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Delete .TMP Files From FTP Server</div>
                    <div>
                        <FormCheckBox inputName={"bDeleteTMP"} valueName="deleteTmp"  updateValue={this.updateValue} value={this.state.deleteTmp}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Ignore Bots</div>
                    <div>
                        <FormCheckBox inputName={"bIgnoreBots"} valueName="ignoreBots"  updateValue={this.updateValue} value={this.state.ignoreBots}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Ignore Duplicate Logs</div>
                    <div>
                        <FormCheckBox inputName={"bIgnoreDuplicates"} valueName="ignoreDuplicates" updateValue={this.updateValue} 
                        value={this.state.ignoreDuplicates}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Minimum Players</div>
                    <div>
                        <input className="default-textbox" type="number" name="server-players" min={0} value={this.state.minPlayers}  onChange={(e) =>{
                            this.updateValue("minPlayers", e.target.value);
                        }}/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">Minimum Playtime(in seconds)</div>
                    <div>
                        <input className="default-textbox" type="number" name="server-playtime" min={0} value={this.state.minPlaytime}  onChange={(e) =>{
                            this.updateValue("minPlaytime", e.target.value);
                        }}/>
                    </div>
                </div>
                <input type="submit" className="search-button" value="Add FTP Server"/>
            </form>
        </div>;
    }
}

export default AdminFTPManagerCreate;