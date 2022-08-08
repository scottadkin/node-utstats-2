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
                <TrueFalse bTable={true} value={d.sftp}/>
                <td>{d.host}:{d.port}</td>
                <td>{d.user}</td>
                <td>{d.target_folder}</td>
                <td>{d.total_imports}</td>
                <td>{Functions.convertTimestamp(d.first, true)}</td>
                <td>{Functions.convertTimestamp(d.last, true)}</td>
            </tr>);

        }

        return <Table2 width={1}>
            <tr>
                <th>Secure FTP</th>
                <th>Host</th>
                <th>User</th>
                <th>Entry Point</th>
                <th>Total Imports</th>
                <th>First Import</th>
                <th>Last Import</th>
            </tr>
            {rows}
        </Table2>

    }

    render(){

        return <div>
            {this.renderList()}
        </div>
    }
}

export default AdminFTPManagerList;