import React from 'react';
import Functions from '../../api/functions';
import styles from './AdminMatchesManager.module.css';
import Link from 'next/link';
import ProgressBar from '../ProgressBar';

class AdminMatchesManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 1, 
            "duplicateMatches": [], 
            "invalidMatches": [], 
            "errors": [], 
            "settings": [],
            "minPlayerMatches": 0,
            "minPlaytimeMatches": 0,
            "bothInvalid": 0,
            "actionInProgress": false,
            "actionProgress": 0,
            "toDelete": 0
        };

        this.changeMode = this.changeMode.bind(this);
        this.deleteInvalidMatches = this.deleteInvalidMatches.bind(this);
    }


    async loadInvalidMatches(){

        const req = await fetch("/api/adminmatches", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "invalidmatches"})
        });

        const res = await req.json();

        if(res.error === undefined){

            let minPlayerMatches = 0;
            let minPlaytimeMatches = 0;
            let bothInvalid = 0;

            const minPlayers = this.state.settings["Minimum Players"];
            const minPlaytime = this.state.settings["Minimum Playtime"];

            for(let i = 0; i < res.data.length; i++){

                const d = res.data[i];

                if(d.players < minPlayers){
                    minPlayerMatches++;
                }

                if(d.playtime < minPlaytime){
                    minPlaytimeMatches++;
                }

                if(d.playtime < minPlaytime && d.players < minPlayers){
                    bothInvalid++;
                }
            }

            this.setState({
                "invalidMatches": res.data, 
                "minPlayerMatches": minPlayerMatches, 
                "minPlaytimeMatches": minPlaytimeMatches,
                "bothInvalid": bothInvalid
            });

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

    async deleteMatch(id){

        try{

            const req = await fetch("/api/adminmatches", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "delete", "id": id})
            });

            const res = await req.json();

            if(res.error === undefined){

                if(res.message === "passed"){

                    const old = this.state.actionProgress;

                    this.setState({"actionProgress": old + 1});
                }

            }else{
                throw new Error(res.error);
            }



            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }


    async deleteInvalidMatches(type){

        try{

            type = type.toLowerCase();

            const minPlayers = this.state.settings["Minimum Players"];
            const minPlaytime = this.state.settings["Minimum Playtime"];

            const matchesToDelete = [];

            for(let i = 0; i < this.state.invalidMatches.length; i++){

                const m = this.state.invalidMatches[i];

                if(type === "all"){

                    matchesToDelete.push(m.id);

                }else if(type === "players" && m.players < minPlayers){

                    matchesToDelete.push(m.id);

                }else if(type === "playtime" && m.playtime < minPlaytime){

                    matchesToDelete.push(m.id);

                }
            }

            this.setState({"toDelete": matchesToDelete.length, "actionInProgress": true});

            for(let i = 0; i < matchesToDelete.length; i++){

                await this.deleteMatch(matchesToDelete[i]);
            }

            if(this.state.actionProgress === this.state.toDelete){
                this.setState({"actionInProgress": false});
                await this.loadInvalidMatches();
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

            const playtimeClass = (m.playtime < this.state.settings["Minimum Playtime"]) ? "team-red" : "team-green";
            const playersClass = (m.players < this.state.settings["Minimum Players"]) ? "team-red" : "team-green";

            rows.push(<tr key={i}>
                <td><Link href={`/match/${m.id}`}><a>{m.id}</a></Link></td>
                <td>{Functions.convertTimestamp(m.date, true)}</td>
                <td>{m.server.slice(0,maxServerLength)}{(originalLength > maxServerLength) ? "..." : ""}</td>
                <td>{m.map}</td>
                <td className={playtimeClass}>{Functions.MMSS(m.playtime)}</td>
                <td className={playersClass}>{m.players}</td>
            </tr>);
        }

        if(rows.length === 0){
            rows.push(<tr key="i">
                <td className="team-green" colSpan={6}>There are no matches found.</td>

            </tr>);
        }

        const minPlayers = this.state.settings["Minimum Players"];
        const minPlaytime = this.state.settings["Minimum Playtime"] / 60;

        const totalFound = this.state.invalidMatches.length;

        return <div>
            <div className="default-header">Invalid Matches</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    <div className="default-sub-header-alt">Information</div>
                    Matches are invalid if they have less then the minimum player count or playtime set in site settings area.<br/>
                    Minimum Players is currently set to <b>{minPlayers} Players. </b><br/>
                    Minimum Playtime is currently set to <b>{minPlaytime} Minutes. </b> <br/><br/>
                    <div className="default-sub-header-alt red">Result</div>
                    <span className="red"><b>{totalFound}</b> invalid matches found. </span><br/>
                    <span className="red"><b>{this.state.minPlayerMatches}</b> matches found with less than <b>{minPlayers} Players.</b></span><br/>
                    <span className="red"><b>{this.state.minPlaytimeMatches}</b> matches found with playtime less than <b>{minPlaytime} minutes</b>.</span><br/>
                    <span className="red"><b>{this.state.bothInvalid}</b> matches found with playtime less than <b>{minPlaytime} minutes</b> playtime, and with less than <b>{minPlayers} players</b>.</span>
                    
                </div>
            </div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    <div className="default-sub-header-alt">Actions</div>

                        <input type="button" className="bigger-button team-red" value="Delete All Matches" onClick={(() =>{
                            this.deleteInvalidMatches("all");
                        })}/>
                        <input type="button" className="bigger-button team-red" value="Delete Matches Under Minimum Playtime" onClick={(() =>{
                            this.deleteInvalidMatches("playtime");
                        })}/>
                        <input type="button" className="bigger-button team-red" value="Delete Matches With Less than Minimum Players" onClick={(() =>{
                            this.deleteInvalidMatches("players");
                        })}/>

                        {this.renderProgress()}
                </div>
            </div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Match Id</th>
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

    renderProgress(){

        if(!this.state.actionProgress && this.state.toDelete === 0) return null;

        let percent = 100;

        const toDelete = this.state.toDelete;
        const deleted = this.state.actionProgress;

        if(toDelete > 0){
            if(deleted === 0){
                percent = 0;
            }else{
                percent = (deleted / toDelete) * 100
            }
        }


        return <div>
            <div className="default-sub-header-alt">Action In Progress</div>
            <ProgressBar percent={percent}/>
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