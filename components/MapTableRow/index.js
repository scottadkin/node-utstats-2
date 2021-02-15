import TimeStamp from '../TimeStamp';
import Functions from '../../api/functions';

class MapTableRow extends React.Component{

    constructor(props){
        super(props);
    }

    render(){

        return (<tr>
            <td>{Functions.removeUnr(this.props.data.name)}</td>
            <td><TimeStamp timestamp={this.props.data.first} /></td>
            <td><TimeStamp timestamp={this.props.data.last} /></td>
            <td>{parseFloat(this.props.data.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td>{this.props.data.matches}</td>
        </tr>);
    }
}

export default MapTableRow;