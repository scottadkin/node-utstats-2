import React from 'react';
import Functions from '../../api/functions';


class ACEManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0, "recentKickLogs": []};
        this.changeMode = this.changeMode.bind(this);
        this.playerSearch = this.playerSearch.bind(this);
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    async componentDidMount(){

        await this.getLatestKickLogs();

    }

    async getLatestKickLogs(){

        try{

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "home-kicks"})
            });

            const result = await req.json();

            if(result.data !== undefined){
                
                this.setState({"recentKickLogs": result.data});
                return;
            }

            console.trace("Something went wrong getting latestkicklogs");
     

        }catch(err){
            console.trace(err);
        }
    }

    async playerSearch(e){

        try{

            e.preventDefault();

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"name": "meow"})
            });

            const result = await req.json();

            console.log(result);
        }catch(err){
            console.trace(err);
        }

    }

    renderPlayers(){

        if(this.state.mode !== 1) return null;

        return <div>
            <div className="default-header">Players</div>

            <div className="form">
                <form action="/" method="POST" onSubmit={this.playerSearch}>
                    <div className="select-row">
                        <div className="select-label">Name</div>
                        <div><input type="text" className="default-textbox" placeholder="search for a player"/></div>
                    </div>
                    <input type="submit" value="Search" className="search-button"/>
                </form>
                
            </div>
        </div>
    }

    recentKicks(){

        if(this.state.recentKickLogs.length > 0){

            const rows = [];

            for(let i = 0; i < this.state.recentKickLogs.length; i++){

                const d = this.state.recentKickLogs[i];

                rows.push(<tr key={i}>
                    <td>{d.name}</td>
                    <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                    <td>{d.ip}</td>
            

                    <td>{d.kick_reason}</td>
                    <td>{d.package_name}</td>
                    <td>{d.package_version}</td>
                </tr>);
            }

            return <div>
                <div className="default-sub-header">Recent Kicks</div>
                <table className="t-width-1">
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Timestamp</th>
                            <th>IP</th>
    
                            <th>Kick Reason</th>
                            <th>Package Name</th>
                            <th>Package Version</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        }

        return null;
    }

    renderRecent(){

        if(this.state.mode !== 0) return null;

        return <div>
            <div className="default-header">Recent Events</div>
            
            {this.recentKicks()}
        </div>
    }


    render(){

        return <div>
            <div className="default-header">ACE Manager</div>
            <div className="tabs">
            <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={() =>{
                    this.changeMode(0);
                }}>Recent Events</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={() =>{
                    this.changeMode(1);
                }}>Players</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`}  onClick={() =>{
                    this.changeMode(2);
                }}>Kicks</div>
            </div>
            {this.renderRecent()}
            {this.renderPlayers()}
        </div>
    }
}

export default ACEManager;