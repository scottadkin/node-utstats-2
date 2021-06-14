import React from 'react';


class AdminFTPManager extends React.Component{

    constructor(props){

        super(props);
    }

    renderTable(){

        const rows = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            rows.push(<tr key={i}>
                <td>{s.host}</td>
                <td>{s.port}</td>
                <td>{s.user}</td>
                <td>{s.target_folder}</td>
                <td>{s.delete_after_import}</td>
                <td>{s.first}</td>
                <td>{s.last}</td>
                <td>{s.total_imports}</td>
            </tr>);
        }


        return <div>
            <div className="default-header">Current Servers</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Host</th>
                        <th>Port</th>
                        <th>User</th>
                        <th>Target Folder</th>
                        <th>Delete After Import</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Total</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    createServersDropDown(){

        const options = [];

        let s = 0;

        for(let i = 0; i < this.props.servers.length; i++){

            s = this.props.servers[i];

            options.push(<option key={i} value={s.id}>
                {s.name} ({s.host}:{s.port}) 
            </option>);
        }

        return <select className="default-select m-bottom-25">
            <option value="-1">Select a server</option>
            {options}
        </select>
    }

    renderEditForm(){

        return <div>
            <div className="default-header">Edit Server</div>
            <form className="form" action="/" method="POST">
                <div className="form-info">
                    Edit an existing server.
                </div>
                {this.createServersDropDown()}
                <div className="select-row">
                    <div className="select-label">Name</div>
                    <div>
                        <input type="text" className="default-textbox" placeholder="Name..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Host</div>
                    <div>
                        <input type="text" className="default-textbox" placeholder="Host..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Port</div>
                    <div>
                        <input type="text" className="default-textbox" placeholder="Port"/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">User</div>
                    <div>
                        <input type="text" className="default-textbox" placeholder="User..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Password</div>
                    <div>
                        <input type="password" className="default-textbox" placeholder="password..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Target Folder</div>
                    <div>
                        <input type="text" className="default-textbox" placeholder="target folder..."/>
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Delete Logs After Import</div>
                    <div>
                        <input type="checkbox" />
                    </div>
                </div>
                <input type="submit" className="search-button" value="Update"/>
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">FTP Manager</div>

            {this.renderTable()}
            {this.renderEditForm()}
        </div>
    }
}

export default AdminFTPManager;