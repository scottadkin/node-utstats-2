import React from 'react';
import Table2 from '../Table2';
import Notification from '../Notification';
import Loading from '../Loading';


class AdminRankingManager extends React.Component{

    constructor(props){

        super(props);
        

        this.state = {
            "gametypes": this.props.names, 
            "events": null,
            "previousEvents": null,
            "mode": 0, 
            "bPassed": false, 
            "errors": [], 
            "inProgress": false,
            "saveInProgress": false,
            "initialLoad": true,
            "savePassed": null,
            "result": null,
            "saveMessages": []
        };

        this.performAction = this.performAction.bind(this);
        this.changeMode = this.changeMode.bind(this);

        this.saveChanges = this.saveChanges.bind(this);
        this.update = this.update.bind(this);
    }


    updateEvent(updateType, eventName, value){

        const newStateValues = [];

        for(let i = 0; i < this.state.events.length; i++){

            const v = this.state.events[i];

            if(v.name === eventName){

                if(updateType === "name"){
                    v.display_name = value;
                }

                if(updateType === "desc"){
                    v.description = value;
                }

                if(updateType === "value"){
                    v.value = value;
                }        
            }

            newStateValues.push(v);
        }

        this.setState({"events": newStateValues});
    }
  

    update(e){

        const reg = /^(.+?)-(.+)$/i;
        const result = reg.exec(e.target.id);

        if(result !== null){

            const type = result[1].toLowerCase();
            const eventName = result[2].toLowerCase();

            this.updateEvent(type, eventName, e.target.value);
        }
    }

    async loadValues(){

        const req = await fetch("/api/rankingadmin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "values"})
        });

        const res = await req.json();

        if(res.error === undefined){
            this.setState({"initialLoad": true, "events": res.values, "previousEvents": JSON.parse(JSON.stringify(res.values))});
        }else{
            this.setState({"errors": [res.error]});
        }
    }

    async componentDidMount(){

        await this.loadValues();
    }


    changeMode(id){

        this.setState({
            "mode": id,
            "bPassed": false, 
            "errors": [], 
            "inProgress": false,
            "saveInProgress": false,
            "initialLoad": true,
            "savePassed": null,
            "result": null,
            "saveMessages": []
        });
    
    }


    async performAction(e){

        try{

            e.preventDefault();

            const errors = [];

            let gametypeId = parseInt(e.target[0].value);
            let action = parseInt(e.target[1].value);

            this.setState({"errors": [], "bPassed": false, "inProgress": true, "result": null});

            if(gametypeId !== gametypeId){
                errors.push("GametypeId must be a valid integer.");
            }else{

                if(gametypeId < 1){
                    errors.push("You have not selected a gametype.");
                }
            }

            if(action !== action){
                errors.push("Action must be a valid integer.");
            }else{
                if(action < 0){
                    errors.push("You have not selected an action.");
                }
            }

            console.log(`perform action ${action} on gametype ${gametypeId}`);

            if(errors.length === 0){

                const req = await fetch("/api/rankingadmin", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"gametypeId": gametypeId, "mode": action})
                });

                const result = await req.json();

                if(result.message === "passed"){
                    this.setState({"bPassed": true, "inProgress": false, "result": result.result});
                }else{
                    errors.push(result.message);
                }
            }

            if(errors.length > 0){

                this.setState({"bPassed": false, "errors": errors, "inProgress": false});
            }

        }catch(err){
            console.trace(err);
        }

    }

    createDropDown(name){

        const options = [];

        let g = 0;

        for(let i = 0; i < this.state.gametypes.length; i++){

            g = this.state.gametypes[i];

            options.push(<option key={i} value={g.id}>{g.name}</option>);
        }

        return <select name={name} className="default-select">
            <option value="-1">Select a gametype</option>
            {options}
        </select>
    }

    renderNotification(){


        if(this.state.inProgress){

            return <Notification hideClose={1} type="warning">
                <Loading />
            </Notification>
        }


        const errors = this.state.errors;
        
        if(!this.state.bPassed){

            if(errors.length === 0) return null;

            const errorElems = [];

            for(let i = 0; i < errors.length; i++){

                errorElems.push(<div key={i}><b>Error {i + 1} - </b>{errors[i]}</div>);
            }

            return <Notification hideClose={1} type="error">
                <b>There was a problem performing you're request.</b><br/>
                {errorElems}
            </Notification>

        }else{

            const passElems = [];

            if(this.state.result !== null){

                const r = this.state.result;

                if(r.deletedCurrentCount !== undefined){

                    passElems.push(<div key={"del-current"}>Deleted {r.deletedCurrentCount} rows from current rankings table.</div>);
                }

                if(r.deletedHistoryCount !== undefined){

                    passElems.push(<div key={"del-history"}>Deleted {r.deletedHistoryCount} rows from history rankings table.</div>);
                }

                if(r.insertedCurrentCount !== undefined){

                    passElems.push(<div key={"in-current"}>Inserted {r.insertedCurrentCount} rows into current rankings table.</div>);
                }

                if(r.insertedHistoryCount !== undefined){

                    passElems.push(<div key={"in-history"}>Inserted {r.insertedHistoryCount} rows into history rankings table.</div>);
                }
            }

            return <Notification hideClose={1} type="pass">
                Action completed without errors.
                {passElems}
            </Notification>
        }
    }

    renderActions(){

        if(this.state.mode !== 0) return;

        return <div>
            <div className="default-header">
                    Select a gametype to update
                </div>

            <form className="form" action="/" method="POST" onSubmit={this.performAction}>
                <div className="form-info">
                    Recalculate rankings will set all player rankings for that gametype to 0 then go through all match data for players of that gametype and set them to their correct values.<br/>
                    Delete all rankings will delete all player rankings for that gametype, effectively starting that gametype&apos;s rankings again.
                </div>

                
                <div className="select-row">
                    <div className="select-label">
                        Gametype
                    </div>
                    <div>
                        {this.createDropDown("g1")}
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">
                        Action
                    </div>
                    <div>
                        <select name="action" className="default-select">
                            <option value="-1">Select an action</option>
                            <option value="0">Recalculate Rankings</option>
                            <option value="1">Delete Rankings</option>
                        </select>
                    </div>
                </div>
                <input type="submit" className="search-button" value="Perform Action"/>
            </form>
            {this.renderNotification()}
        </div>
    }


    getChangedValues(){

        const found = [];

        for(let i = 0; i < this.state.events.length; i++){

            const old = this.state.previousEvents[i];
            const current = this.state.events[i];

            if(old.display_name !== current.display_name || old.description !== current.description || old.value !== current.value){
                found.push(current);
            }
        }

        return found;
    }


    async saveChanges(){

        try{
                
            if(!this.bAnyChanges()){
                console.log(`No changes detected!`);
                return;
            }

            this.setState({"saveInProgress": true, "saveMessages": []});


            const changedData = this.getChangedValues();

            const req = await fetch("/api/rankingadmin", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "change", "data": changedData})
            });


            const res = await req.json();

            if(res.error === undefined){

                const events = JSON.parse(JSON.stringify(this.state.events));

                this.setState({"saveInProgress": false, "saveMessages": res.messages, "previousEvents": events});

            }else{
                this.setState({"errors": [res.error]});
            }
           

        }catch(err){
            console.trace(err);
        }
    }

    bAnyChanges(){

        if(JSON.stringify(this.state.events) === JSON.stringify(this.state.previousEvents)) return false;

        return true;
    }

    renderUnsavedChanges(){

        if(this.bAnyChanges()){

            return <Notification type="warning" hideClose={1}>
                You have unsaved changes!
            </Notification>
        }

        return null;
   
    }

    renderEvents(){

        if(this.state.mode !== 1) return null;

        if(!this.state.initialLoad) return <Loading />;

        const rows = [];

        for(let i = 0; i < this.state.events.length; i++){

            const e = this.state.events[i];

            rows.push(<tr key={e.name}>
                <td>
                    <input type="text" id={`name-${e.name}`} className="default-textbox" placeholder="display name..." value={e.display_name} 
                    onChange={this.update} />
                </td>
                <td>
                    <input type="text" id={`desc-${e.name}`} className="default-textbox" placeholder="event description..." value={e.description} 
                    onChange={this.update} />
                </td>
                <td>
                    <input type="number" id={`value-${e.name}`} className="default-textbox" placeholder="Event Value" value={e.value} 
                    onChange={this.update} />
                </td>
            </tr>);
        }

        const saveElem = <div>
            <div className="search-button" onClick={this.saveChanges}>Save Changes</div>
        </div>

        return <div>
            <div className="default-header">
                Change Event Values
            </div>
            <div className="form">
                <div className="form-info">
                    On this page you can modify the values for each event type that is used to calculate a player's ranking score.
                    <div className="team-red">
                        <b>If you make changes to event values after importing you must recalculate player rankings with the tab above for the changes to take effect.</b>
                    </div>
                </div>
                {saveElem}
                
                <Table2>
                    <tr>
                        <th>Event Name</th>
                        <th>Description</th>
                        <th>Value</th>
                    </tr>
                    {rows}
                </Table2>
                {saveElem}
            </div>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Manage Rankings</div>
            <div className="tabs m-bottom-25">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Recalculate/Delete</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}  onClick={(() =>{
                    this.changeMode(1);
                })}>Change Event Values</div>
            </div>
            {this.renderActions()}
            {this.renderEvents()}
            {this.renderUnsavedChanges()}

        </div>
    }
}


export default AdminRankingManager;