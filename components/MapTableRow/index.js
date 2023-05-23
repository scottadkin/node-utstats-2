import TimeStamp from '../TimeStamp';
import Functions from '../../api/functions';
import Link from 'next/link';
import React from 'react';
import Playtime from '../Playtime';

class MapTableRow extends React.Component{

    constructor(props){
        super(props);
    }

    render(){

        return (<tr>
            <td><Link href={`/map/${this.props.data.id}`}>{Functions.removeUnr(this.props.data.name)}</Link></td>
            <td>{Functions.convertTimestamp(this.props.data.first, true)} </td>
            <td>{Functions.convertTimestamp(this.props.data.last, true)}</td>
            <td className="playtime"><Playtime timestamp={this.props.data.playtime}/></td>
            <td>{this.props.data.matches}</td>
        </tr>);
    }
}

export default MapTableRow;