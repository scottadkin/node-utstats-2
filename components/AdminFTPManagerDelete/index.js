import React from "react";
import Notification from "../Notification";
import Loading from "../Loading";

class AdminFTPManagerDelete extends React.Component{

    constructor(props){

        super(props);

        this.state = {"error": null, "bSavingChanges": false, "bPassed": false};

        this.deleteServer = this.deleteServer.bind(this);
    }

    async deleteServer(e){

        e.preventDefault();

        const id = parseInt(e.target[0].value);

        if(id === -1){
            this.setState({"error": "You can't delete a server that doesn't exist.","bSavingChanges": false, "bPassed": false});
            return;
        }

        this.setState({"error": null, "bSavingChanges": true, "bPassed": false});

        const req = await fetch("/api/ftpadmin", {
            "headers":{"Content-Type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete", "id": id})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"bSavingChanges": false, "error": res.error});
            return;
        }

        await this.props.loadList();

        this.setState({"bPassed": true, "bSavingChanges": false});
    }

    renderDropDown(){

        const options = [
            <option value="-1" key="-1">Please select a server</option>
        ];

        if(this.props.data !== null){

            for(let i = 0; i < this.props.data.length; i++){

                const d = this.props.data[i];

                options.push(<option key={d.id} value={d.id}>{d.name} ({d.host}:{d.port})</option>)
            }
        }


        return <select className="default-select" value={this.props.selected} onChange={((e) =>{
            this.props.changeSelected(e);
        })}>
            {options}
        </select>

    }

    renderNotification(){

        if(this.state.error !== null){
            return <Notification type="error">{this.state.error}</Notification>
        }

        if(this.state.bSavingChanges){

            return <Notification type="warning">
                <Loading>Saving changes, please wait...</Loading>
            </Notification>
        }

        if(this.state.bPassed){

            return <Notification type="pass">
                Deleted server successfully
            </Notification>
        }
    }
    

    render(){

        return <div>
            <div className="default-header">Delete FTP Servers</div>
            <div className="form">
                <div className="default-sub-header-alt">Information</div>
                <div className="form-info m-bottom-10">
                    Delete a server from current import list.
                </div>
                <form action="/" method="POST" onSubmit={this.deleteServer}>
                    <div className="select-row">
                        <div className="select-label">Server to Delete</div>
                        {this.renderDropDown()}
                    </div>
                    <input type="submit" className="search-button" value="Delete Server"/>
                </form>
            </div>
            {this.renderNotification()}
        </div>;
    }
}

export default AdminFTPManagerDelete;