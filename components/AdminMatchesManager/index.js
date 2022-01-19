import React from 'react';
import Functions from '../../api/functions';
import Link from 'next/link';
import ProgressBar from '../ProgressBar';
import Table2 from '../Table2';
import AdminOrphanedData from '../AdminOrphanedData';

class AdminMatchesManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0, 
            "duplicateMatches": [], 
            "invalidMatches": [], 
            "errors": [], 
            "settings": [],
            "minPlayerMatches": 0,
            "minPlaytimeMatches": 0,
            "bothInvalid": 0,
            "actionInProgress": false,
            "actionProgress": 0,
            "toDelete": 0,
            "duplicateMatches": []
        };

        this.changeMode = this.changeMode.bind(this);
        this.deleteInvalidMatches = this.deleteInvalidMatches.bind(this);
        this.deleteDuplicateMatches = this.deleteDuplicateMatches.bind(this);

    }



    async deleteDuplicateMatches(){

        try{


            this.setState({"actionInProgess": true, "actionProgress": 0, "toDelete": this.state.duplicateMatches.length});

            for(let i = 0; i < this.state.duplicateMatches.length; i++){

                const d = this.state.duplicateMatches[i];

                await this.deleteDuplicate(d.name, d.last_id);
            }

            if(this.state.actionProgress === this.state.duplicateMatches.length){
                this.setState({"actionInProgress": false});
                await this.loadDuplicateMatches();
            }
            

        }catch(err){
            console.trace(err);
        }
    }

    async deleteDuplicate(fileName, latestId){

        try{

            console.log(`Delete matches with log ${fileName}, ignore ${latestId}`);

            const req = await fetch("/api/adminmatches", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "deleteduplicate", "file": fileName, "latest": latestId})
            });

            const res = await req.json();

            if(res.error === undefined){

                const old = this.state.actionProgress;

                this.setState({"actionProgress": old + 1});
            }else{

                throw new Error(req.error);
            }

        }catch(err){
            console.trace(err);
        }

    }

    async loadDuplicateMatches(){

        try{

            const req = await fetch("/api/adminmatches", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "duplicates"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"duplicateMatches": res.data});
            }else{

                throw new Error(res.error);
            }


        }catch(err){
            console.trace(err);
        }
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
            await this.loadDuplicateMatches();
            await this.loadInvalidMatches();

        }catch(err){
            console.trace(err);
        }
    }

    changeMode(id){

        this.setState({"mode": id, "actionInProgress": false});
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
                <td className="team-green" colSpan={6}>There was no matches found.</td>

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
            <Table2 width={1}>
                <tr>
                    <th>Match Id</th>
                    <th>Date</th>
                    <th>Server</th>
                    <th>Map</th>
                    <th>Playtime</th>
                    <th>Players</th>
                </tr>
                {rows}
            </Table2>
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

    renderDuplicateMatches(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        for(let i = 0; i < this.state.duplicateMatches.length; i++){

            const d = this.state.duplicateMatches[i];

            rows.push(<tr key={i}>
                <td>{d.name}</td>
                <td><a href={`/match/${d.first_id}`} rel="noreferrer" target="_blank">{Functions.convertTimestamp(d.first_import, true)}</a></td>
                <td><a href={`/match/${d.last_id}`} rel="noreferrer" target="_blank">{Functions.convertTimestamp(d.last_import, true)}</a></td>
                <td>{d.total_found - 1}</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="i"><td  className="team-green" colSpan={4}>No duplicate matches found.</td></tr>);
        }

        return <div>
            <div className="default-header">Duplicate Matches</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    <div className="default-sub-header-alt">Information</div>
                    Duplicate matches are logs that have been imported more than once, deleting them will remove the earlier imports and only keep the most recent import.
                </div>
                <div className="default-sub-header-alt">Actions</div>

                    <input type="button" className="bigger-button team-red" value="Delete All Matches" onClick={(() =>{
                        this.deleteDuplicateMatches();
                    })}/>

                    {this.renderProgress()}
                
            </div>
            <Table2 width={1}>
                <tr>
                    <th>Log Name</th>
                    <th>First Imported</th>
                    <th>Last Imported</th>
                    <th>Found Duplicates</th>
                </tr>
                {rows}
            </Table2>
        </div>

    }

    renderOrphanedData(){

        if(this.state.mode !== 2) return null;

        return <AdminOrphanedData />;
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
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : "null"}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Delete Failed Imports</div>
            </div>
            {this.renderInvalidMatches()}
            {this.renderDuplicateMatches()}
            {this.renderOrphanedData()}
            
        </div>
    }
}

export default AdminMatchesManager;