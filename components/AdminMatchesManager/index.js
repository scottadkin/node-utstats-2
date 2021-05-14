import React from 'react';

class AdminMatchesManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0, "matches": JSON.parse(this.props.duplicates)};

        this.deleteDuplicate = this.deleteDuplicate.bind(this);
    }


    async deleteDuplicate(e){

        try{

            e.preventDefault();


            const req = await fetch("/api/deletematchduplicate", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"delete": true})
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
        for(let i = 0; i < this.state.matches.length; i++){

            m = this.state.matches[i];


            rows.push(<tr key={i}>
                <td className="team-red">{m.name}</td>
                <td className="team-red">{m.found}</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key={"potato"}>
                <td colSpan="2" style={{"textAlign": "center"}}>There are no duplicate matches detected.</td>
            </tr>);
        }

        return <div>
            <div className="default-header">Duplicate Matches</div>
            <table className="t-width-2 td-1-left">
                <tbody>
                    <tr>
                        <th>Log File</th>
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