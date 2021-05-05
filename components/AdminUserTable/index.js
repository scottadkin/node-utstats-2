import React from 'react';
import TimeStamp from '../TimeStamp/';

class AdminUserTable extends React.Component{

    constructor(props){

        super(props);

        this.state = {"accounts": JSON.parse(this.props.accounts)};
    }

    displayAll(){

        console.log("display all");

        const rows = [];

        let a = 0;
        let adminClassName = "";
        let adminDisplay = "";
        let activatedClassName = "";
        let activatedDisplay = "";

        for(let i = 0; i < this.state.accounts.length; i++){

            a = this.state.accounts[i];

            activatedClassName = (a.activated) ? "team-green" : "team-red";
            adminClassName = (a.admin) ? "team-green" : "team-red";

            activatedDisplay = (a.activated) ? "Yes" : "No";
            adminDisplay = (a.admin) ? "Yes" : "No";

            rows.push(<tr key={i}>
                <td>{a.name}</td>
                <td><TimeStamp timestamp={a.joined} /></td>
                <td className={activatedClassName}>{activatedDisplay}</td>
                <td className={adminClassName}>{adminDisplay}</td>
                <td>{a.logins}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">All Users</div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Joined</th>
                        <th>Activated</th>
                        <th>Admin</th>
                        <th>Times Logged In</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">
                Manage User Accounts
            </div>
            {this.displayAll()}
        </div>
    }
}

export default AdminUserTable;