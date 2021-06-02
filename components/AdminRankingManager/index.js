import React from 'react';


class AdminRankingManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "gametypes": JSON.parse(this.props.names), 
            "events": JSON.parse(this.props.events),
            "mode": 1, 
            "bPassed": false, 
            "errors": [], 
            "inProgress": false
        };

        this.performAction = this.performAction.bind(this);
        this.changeMode = this.changeMode.bind(this);
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


    renderEvents(){

        if(this.state.mode !== 1) return null;

        const rows = [];

        let e = 0;

        for(let i = 0; i < this.state.events.length; i++){

            e = this.state.events[i];

            rows.push(<tr key={i}>
                <td>{e.display_name}</td>
                <td>{e.value}</td>
                <td>{e.value}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">Change Ranking Event values</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Event</th>
                        <th>Current Points per Event</th>
                        <th>New Points Per Event</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
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