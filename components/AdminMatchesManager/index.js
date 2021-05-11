import React from 'react';
import TimeStamp from '../TimeStamp/';

class AdminMatchesManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0, "matches": JSON.parse(this.props.duplicates)};

        this.deleteDuplicate = this.deleteDuplicate.bind(this);
    }


    async deleteDuplicate(e){

        try{

            e.preventDefault();

            console.log(e.target[0].value);


            let ids = e.target[0].value.split(",");

            console.log(ids);

            for(let i = 0; i < ids.length; i++){

                ids[i] = parseInt(ids[i]);
            }

            console.log(ids);

            const req = await fetch("/api/deletematchduplicate", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST"
            });


            console.log(await req.json());

        }catch(err){
            console.trace(err);
        }

    }




    renderDuplicates(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        let m = 0;

        let idsString = "";

        for(let i = 0; i < this.state.matches.length; i++){

            m = this.state.matches[i];

            idsString += `${m.match_id}`;
            if(i < this.state.matches.length - 1){
                idsString += ",";
            }

            rows.push(<tr key={i}>
                <td className="team-red">{m.name}</td>
                <td className="team-red"><TimeStamp timestamp={m.imported}/></td>
                <td className="team-red">{m.found}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">Duplicate Matches</div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Log File</th>
                        <th>Latest Imported</th>
                        <th>Found Duplicates</th>
                    </tr>
                    {rows}
                </tbody>
            </table>

            <div className="default-header">Delete Duplicates</div>
            <form action="/" className="form" onSubmit={this.deleteDuplicate} method="POST">
                <div className="form-info">
                    Performing this action will delete the previous imports of the log and only keep the most recent import.<br/>
                    <b>This action is irreversible!</b>
                </div>
                <input type="hidden" name="masterIds" value={idsString} />
                <input type="submit" className="search-button" name="submit" value="Delete Duplicates" />
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Manage Matches</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : "null"}`}>Duplicates</div>
            </div>
            {this.renderDuplicates()}
        </div>
    }
}

export default AdminMatchesManager;