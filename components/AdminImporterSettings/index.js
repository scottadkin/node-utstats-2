import React from "react";
import Loading from "../Loading";
import Table2 from "../Table2";
import Notification from "../Notification";
import Functions from "../../api/functions";
import TrueFalse from "../TrueFalse";

class AdminImporterSettings extends React.Component{

    constructor(props){

        super(props);
    }


    renderLoading(){

        if(this.props.data !== null) return null;

        return <Loading />;
    }

    renderData(){

        if(this.props.data === null) return null;
        if(this.props.data === undefined) return null;


        const d = this.props.data;

        let first = (d.first == 0) ? "Never" : Functions.convertTimestamp(d.first, true);
        let last = (d.last == 0) ? "Never" : Functions.convertTimestamp(d.last, true);

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
            <tr>
                <td>{d.total_imports}</td>
                <td>{d.total_logs_imported}</td>
                <td>{first}</td>
                <td>{last}</td>
                <TrueFalse bTable={true} value={d.ignore_duplicates}/>
                <TrueFalse bTable={true} value={d.ignore_bots}/>
                <TrueFalse bTable={true} value={d.import_ace}/>
            </tr>
        </Table2>

    }

    renderError(){

        if(this.props.error === null) return null;

        return <Notification type="error">
            {this.props.error}
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