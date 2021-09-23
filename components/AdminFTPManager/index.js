import React from 'react';
import Functions from '../../api/functions';
import TrueFalse from '../TrueFalse';
import styles from './AdminFTPManager.module.css';


class AdminFTPManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 2,
            "servers": [],
            "error": null
        };

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    async loadServers(){

        try{

            const req = await fetch("/api/ftpadmin",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "load"})
            });

            const result = await req.json();

            if(result.error === undefined){
                this.setState({"servers": result.data});
            }else{
                this.setState({"error": [result.error]});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadServers();
    }
    
    renderServers(){

        if(this.state.mode !== 0) return null;

        const elems = [];

        for(let i = 0; i < this.state.servers.length; i++){

            const s = this.state.servers[i];

            elems.push(<div key={i} className={styles.server}>
                <div className={styles.name}>
                    {s.name}
                </div>
                <div className={styles.host}>
                    {s.host}:{s.port}
                </div>
                <div className={styles.target}>
                    <span className="yellow">Target:</span> {s.target_folder}
                </div>
                <div className={styles.default}>
                    <div className="text-right p-right-5">
                        Delete Logs from FTP
                    </div>
                    <div>
                        <TrueFalse bTable={false} value={s.delete_after_import} />
                    </div>
                </div>
                <div className={styles.default}>
                    <div className="text-right p-right-5">
                        Delete TMP files from FTP
                    </div>
                    <div>
                        <TrueFalse bTable={false} value={s.delete_tmp_files} />
                    </div>
                </div>
                <div className={styles.default}>
                    <div className="text-right p-right-5">
                        Ignore Bots
                    </div>
                    <div>
                        <TrueFalse bTable={false} value={s.ignore_bots} />
                    </div>
                </div>
                <div className={styles.default}>
                    <div className="text-right p-right-5">
                        Ignore Duplicate Logs
                    </div>
                    <div>
                        <TrueFalse bTable={false} value={s.ignore_duplicates} />
                    </div>
                </div>
                <div className={styles.ff}>
                    <div>First Import </div>
                    <div>{(s.first !== 0) ? Functions.convertTimestamp(s.first, true): "Never"}</div>
                </div>
                <div className={styles.ff}>
                    <div>Last Import </div>
                    <div>{(s.last !== 0) ? Functions.convertTimestamp(s.last, true): "Never"}</div>
                </div>
                <div className={styles.ff}>
                    <div>Logs Imported</div>
                    <div>{s.total_imports}</div>
                </div>
                <div className={styles.ff}>
                    <div>Min Players</div>
                    <div>{s.min_players}</div>
                </div>
                <div className={styles.ff}>
                    <div>Min Playtime(Seconds)</div>
                    <div>{s.min_playtime}</div>
                </div>
     
            </div>);

        }


        return <div>
            <div className="default-header">Current Servers</div>
            {elems}
        </div>
    }


    async addServer(e){

        try{

            e.preventDefault();

            console.log(e);

            const errors = [];

            const target = e.target;

            const server = target[0].value;
            const ip = target[1].value;
            let port = parseInt(target[2].value);
            const user = target[3].value;
            const password = target[4].value;
            const folder = target[5].value;
            const deleteLogs = target[6].checked;
            const deleteTMP = target[7].checked;
            const ignoreBots = target[8].checked;
            const ignoreDuplicates = target[9].checked;
            let minPlayers = parseInt(target[10].value);
            let minPlaytime = parseInt(target[11].value);

            if(server.length === 0) errors.push("Server name must be at least 1 characters long.");
            if(ip.length === 0) errors.push("You have not specified a ip.");
            if(user.length === 0) errors.push("You have not specified a user.");
            if(password.length === 0) errors.push("You have not specified a password.");
       
            if(port !== port){
                errors.push("Server Port must be a valid integer between 1 and 65535.");
            }

            if(minPlayers !== minPlayers){
                errors.push("Minimum players must be a valid integer.");
            }

            if(minPlaytime !== minPlaytime){
                errors.push("Minimum playtime must be a valid integer.");
            }

            if(errors.length > 0){
                console.trace(errors);
            }else{

                const json = {
                    "mode": "create",
                    "server": server,
                    "ip": ip,
                    "port": port,
                    "user": user,
                    "password": password,
                    "folder": folder,
                    "deleteLogs": deleteLogs,
                    "deleteTmp": deleteTMP,
                    "ignoreBots": ignoreBots,
                    "ignoreDuplicates": ignoreDuplicates,
                    "minPlayers": minPlayers,
                    "minPlaytime": minPlaytime
                };

                const req = await fetch("/api/ftpadmin", {
                    "method": "POST",
                    "headers": {"Content-type": "application/json"},
                    "body": JSON.stringify(json)
                });

                const res = await req.json();

                console.log(res);
            }

        }catch(err){
            console.trace(err);
        }
    }

    renderCreateForm(){

        return <div>
            <div className="default-header">Add New FTP Server</div>
            <form className="form" method="POST" action="" onSubmit={this.addServer}>
                <div className="select-row">
                    <div className="select-label">Server Name</div>
                    <div><input type="text" className="default-textbox" placeholder="Server name"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Server IP</div>
                    <div><input type="text" className="default-textbox" placeholder="Server IP"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Server Port</div>
                    <div><input type="number" className="default-textbox" placeholder="Server Port" min="1" max="65535"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">FTP User</div>
                    <div><input type="text" className="default-textbox" placeholder="FTP User"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">FTP Password</div>
                    <div><input type="password" className="default-textbox" placeholder="FTP Password"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Source Folder</div>
                    <div><input type="text" className="default-textbox" placeholder="Source Folder"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete Logs From FTP</div>
                    <div><input type="checkbox" className="default-textbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete TMP Files</div>
                    <div><input type="checkbox" className="default-textbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Ignore Bots</div>
                    <div><input type="checkbox" className="default-textbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Ignore Duplicate Log Files</div>
                    <div><input type="checkbox" className="default-textbox"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Minimum Players</div>
                    <div><input type="number" className="default-textbox" placeholder="Minimum Players"/></div>
                </div>
                <div className="select-row">
                    <div className="select-label">Minimum Playtime(Seconds)</div>
                    <div><input type="number" className="default-textbox" placeholder="Minimum Playtime"/></div>
                </div>
                <input type="submit" className="search-button" value="Add Server"/>
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">FTP Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Server List</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Edit Server</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Add Server</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Delete Server</div>
            </div>

            {this.renderServers()}
            {this.renderCreateForm()}

        </div>
    }
}

export default AdminFTPManager;