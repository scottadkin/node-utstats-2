import React from 'react';
import Loading from '../Loading';
import Table2 from '../Table2';
import TrueFalse from '../TrueFalse';
import Functions from '../../api/functions';


class AdminFTPManagerList extends React.Component{

    constructor(props){

        super(props);

    }

    renderList(){

        if(this.props.data === null){
            return <Loading />;
        }

        const rows = [];

        for(let i = 0; i < this.props.data.length; i++){

            const d = this.props.data[i];

            rows.push(<tr key={i}>
                <TrueFalse bTable={true} value={d.enabled}/>
                <TrueFalse bTable={true} value={d.sftp}/>
                <td>{d.name}</td>
                <td>{d.host}:{d.port}</td>
                <td>{d.total_imports}</td>
                <td>{(d.first === 0) ? "N/A" : Functions.convertTimestamp(d.first, true)}</td>
                <td>{(d.last === 0) ? "N/A" : Functions.convertTimestamp(d.last, true)}</td>
                <td>
                    <input type="button" className="button" value="Edit" onClick={(() => {
                        this.props.changeSelected(d.id, false);
                        this.props.changeMode(2);
                    })} />
                    <input type="button" className="button" value="Delete" onClick={(() => {
                        this.props.changeSelected(d.id, false);
                        this.props.changeMode(3);
                    })} />
                </td>
            </tr>);

        }

        return <Table2 width={1}>
            <tr>
                <th>Enabled</th>
                <th>Secure FTP</th>
                <th>Name</th>
                <th>Host</th>
                <th>Total Imports</th>
                <th>First Import</th>
                <th>Last Import</th>
                <th>Actions</th>
            </tr>
            {rows}
        </Table2>

    }

    render(){

        return <div>
            <div className="default-header">Current FTP Servers</div>
            {this.renderList()}
        </div>
    }
}

export default AdminFTPManagerList;