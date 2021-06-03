import React from 'react';


class AdminRankingManager extends React.Component{

    constructor(props){

        super(props);
        

        this.state = {
            "gametypes": JSON.parse(this.props.names), 
            "events": this.props.events,
            "previousSavedEvents": this.props.events,
            "mode": 1, 
            "bPassed": false, 
            "errors": [], 
            "inProgress": false,
            "saveInProgress": false,
            "savePassed": null
        };

        this.performAction = this.performAction.bind(this);
        this.changeMode = this.changeMode.bind(this);

        this.updateEventDescription = this.updateEventDescription.bind(this);
        this.updateEventValue = this.updateEventValue.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    updateEventDescription(e){

        console.log(e.target[0]);

        const reg = /(.+?)-(.+)/i;

        const result = reg.exec(e.target.id);

        if(result !== null){

        }
    }

    updateEventValue(e){

        const newEvents = [];

        const reg = /(.+?)-(.+)/i;

        const result = reg.exec(e.target.id);

        if(result !== null){


            const eventId = parseInt(result[2]);

            let d = 0;

            for(let i = 0; i < this.state.events.length; i++){

                d = this.state.events[i];

                if(d.id === eventId){


                    newEvents.push({
                        "id": d.id,
                        "description": d.description,
                        "display_name": d.display_name,
                        "name": d.name,
                        "value": e.target.value

                    });

                }else{
                    newEvents.push(d);
                }

            }


            this.setState({"events": newEvents});
        }
    }

    changeMode(id){
        this.setState({"mode": id});
    }


    async performAction(e){

        try{

            e.preventDefault();

            const errors = [];

            let gametypeId = parseInt(e.target[0].value);
            let action = parseInt(e.target[1].value);

            this.setState({"errors": [], "bPassed": false, "inProgress": true});

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

                console.log(result);

                if(result.message === "passed"){
                    this.setState({"bPassed": true, "inProgress": false});
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

    renderErrors(){


        if(this.state.inProgress){

            return <div className="team-yellow m-bottom-25 p-bottom-25">
                <div className="default-header">Processing</div>
                Action in progress please wait...
            </div>
        }

        const errors = this.state.errors;
        
        if(!this.state.bPassed){

            if(errors.length === 0) return null;

            const errorElems = [];

            for(let i = 0; i < errors.length; i++){

                errorElems.push(<div key={i}>{errors[i]}</div>);
            }

            return <div className="team-red m-bottom-25 p-bottom-25">
                <div className="default-header">Errors</div>
                {errorElems}
            </div>

        }else{

            return <div className="team-green m-bottom-25 p-bottom-25">
                <div className="default-header">Passed</div>
                Action was performed without errors.
            </div>
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
                    Delete all rankings will delete all player rankings for that gametype, effectively starting that gametype's rankings again.
                </div>

                {this.renderErrors()}

                
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
        
        </div>
    }


    bAnyChanges(){


        const newData = this.state.events;
        const oldData = this.state.previousSavedEvents;



        for(let i = 0; i < newData.length; i++){

            if(newData[i].description !== oldData[i].description) return true;
            if(parseFloat(newData[i].value) !== parseFloat(oldData[i].value)) return true;
            
        }

        return false;

    }

    getChangedValues(){


        const changed = [];

        const oldData = this.state.previousSavedEvents;
        const newData = this.state.events;

        let bCurrentChanged = false;

        for(let i = 0; i < newData.length; i++){

            bCurrentChanged = false;

            if(newData[i].description !== oldData[i].description) bCurrentChanged = true;
            if(parseFloat(newData[i].value) !== parseFloat(oldData[i].value)) bCurrentChanged = true;

            if(bCurrentChanged){

                changed.push(
                    {
                        "id": newData[i].id,
                        "description": newData[i].description,
                        "value": newData[i].value
                    }
                );
            }

        }

        return changed;
    }

    async saveChanges(){

        try{

            this.setState({"saveInProgress": true});

     

            const changedData = this.getChangedValues();

            console.table(changedData);
            
            this.setState({"previousSavedEvents": this.state.events, "saveInProgress": false, "savePassed": true});


            const req = await fetch("/api/rankingadmin", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "values", "data": changedData})
            });


            const result = await req.json();
           
            console.log(result);

        }catch(err){
            console.trace(err);
        }
    }

    renderUnsavedChanges(){

        if(!this.bAnyChanges()){

            if(this.state.savePassed){

                return <div className="team-green center t-width-1 p-bottom-25 m-top-25">
                    <div className="default-header">Passed</div>
                    Ranking value changes where updated successfully.
                </div>
            }

            return null;    
        }

        if(this.state.saveInProgress){

            return <div className="team-yellow center t-width-1 p-bottom-25 m-top-25">
                <div className="default-header">Processing</div>
                Save in progress please wait...
            </div>
        }
        

        

        return <div className="team-red center t-width-1 p-bottom-25 m-top-25">
            <div className="default-header">Warning</div>
            You have unsaved changes please save them before going to another page.
            <div className="search-button m-top-25" onClick={this.saveChanges}>Save Changes</div>
        </div>
    }

    renderEvents(){

        if(this.state.mode !== 1) return null;

        const rows = [];

        let e = 0;

        for(let i = 0; i < this.state.events.length; i++){

            e = this.state.events[i];

            rows.push(<tr key={i}>
                <td>{e.display_name}</td>
                <td>
                    <textarea style={{"width": "90%","minHeight": "50px"}} className="default-textarea" id={`desc-${e.id}`} defaultValue={e.description}></textarea>
                </td>
                <td>
                    <input type="number" className="default-textbox" value={e.value} id={`value-${e.id}`} onChange={this.updateEventValue}/>
                </td>
            </tr>);
        }

        return <div>
            <div className="team-red center t-width-1 p-bottom-25 m-top-25">
                <div className="default-header">Important</div>
                If you have already imported matches before making changes to event values you will have to recalculate the rankings using the tab above.
            </div>
            {this.renderUnsavedChanges()}
            <div className="default-header">Change Ranking Event values</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Event</th>
                        <th>Description</th>
                        <th>Points Per Event</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
            {this.renderUnsavedChanges()}
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
        </div>
    }
}


export default AdminRankingManager;