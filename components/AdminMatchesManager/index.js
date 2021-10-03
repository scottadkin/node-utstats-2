import React from 'react';
import Functions from '../../api/functions';
import styles from './AdminMatchesManager.module.css';

class AdminMatchesManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 1, "duplicateMatches": [], "invalidMatches": [], "errors": [], "settings": []};

        this.deleteDuplicate = this.deleteDuplicate.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }


    async loadInvalidMatches(){

        const req = await fetch("/api/adminmatches", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "invalidmatches"})
        });

        const res = await req.json();

        if(res.error === undefined){
            this.setState({"invalidMatches": res.data});
        }else{
            this.setState({"errors": [res.error]});
        } 
    }

    async loadSettings(){

        const req = await fetch("/api/adminmatches", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "settings"})
        });

        const res = await req.json();

        if(res.error === undefined){
            this.setState({"settings": res.data});
        }else{
            this.setState({"errors": [res.error]});
        }
    }

    async componentDidMount(){

        try{

            await this.loadSettings();
            await this.loadInvalidMatches();

        }catch(err){
            console.trace(err);
        }
    }

    changeMode(id){

        this.setState({"mode": id});
    }


    async deleteDuplicate(e){

        try{

            e.preventDefault();

            this.setState({"started": true});

            const req = await fetch("/api/deletematchduplicate", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"delete": true})
            });

            

            const result = await req.json();

            if(result.message === "passed"){

                this.setState({"finished": true, "matches": []});
                
            }else{
                this.setState({"finished": true, "failed": true});
            }

        }catch(err){
            console.trace(err);
        }

    }



    renderInvalidMatches(){

        if(this.state.mode !== 1) return null;

        const rows = [];

        for(let i = 0; i < this.state.invalidMatches.length; i++){

            const m = this.state.invalidMatches[i];

            const originalLength = m.server.length;
            const maxServerLength = 40;

            rows.push(<tr key={i}>
                <td>{Functions.convertTimestamp(m.date, true)}</td>
                <td>{m.server.slice(0,maxServerLength)}{(originalLength > maxServerLength) ? "..." : ""}</td>
                <td>{m.map}</td>
                <td>{Functions.MMSS(m.playtime)}</td>
                <td>{m.players}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">Invalid Matches</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    Matches are invalid if they have less then the minimum player count or playtime set in site settings area.<br/>
                    Minimum Players is currently set to <b>{this.state.settings["Minimum Players"]} Players</b><br/>
                    Minimum Playtime is currently set to <b>{this.state.settings["Minimum Playtime"] / 60} Minutes</b>
                </div>
            </div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Date</th>
                        <th>Server</th>
                        <th>Map</th>
                        <th>Playtime</th>
                        <th>Players</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }


    render(){

        return <div>
            <div className="default-header">Manage Matches</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : "null"}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Duplicates</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : "null"}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Under Minimum Players/Playtime</div>
            </div>
            {this.renderInvalidMatches()}
            
        </div>
    }
}

export default AdminMatchesManager;