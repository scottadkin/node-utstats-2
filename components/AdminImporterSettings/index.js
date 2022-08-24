import React from "react";
import Loading from "../Loading";
import Table2 from "../Table2";
import Notification from "../Notification";

class AdminImporterSettings extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": null, "error": null};
    }

    async loadData(){

        const req = await fetch("/api/ftpadmin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "logsfolder"})
        });

        const response = await req.json();

        if(response.error === undefined){

            this.setState({"data": response.data});

        }else{

            this.setState({"error": response.error});
        }

        console.log(response);
    }

    async componentDidMount(){

        await this.loadData();
    }

    renderLoading(){

        if(this.state.data !== null) return null;

        return <Loading />;
    }

    renderData(){

        //if(this.state.data === null) return null;

        return <Table2 width={1}>
            <tr>
                <th>Total Imports</th>
                <th>Total Logs Imported</th>
                <th>First Import</th>
                <th>Last Import</th>
                <th>Ignore Duplicates</th>
                <th>Ignore Bots</th>
                <th>Import ACE</th>
            </tr>
        </Table2>

    }

    renderError(){

        if(this.state.error === null) return null;

        return <Notification type="error">
            {this.state.error}
        </Notification>
    }

    render(){

        return <div>
            <div className="default-header">Logs Folder Settings</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    These are the current settings that are used if you place files in the websites /Logs folder, instead of using ftp or sftp.
                </div>
            </div>

            {this.renderLoading()}
            {this.renderData()}
            {this.renderError()}
        </div>
    }
}

export default AdminImporterSettings;