import React from 'react';
import Functions from '../../api/functions';
import Table2 from '../Table2';


class PlayerMatchPowerUps extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const rows = [];

        if(this.props.amp > 0){

            rows.push(
                <tr key="0">
                    <td>UDamage</td>
                    <td>{this.props.amp}</td>
                    <td>{Functions.MMSS(this.props.ampTime)}</td>
                </tr>
            );
        }

        if(this.props.invisibility > 0){

            rows.push(<tr key="1">
                <td>Invisibility</td>
                <td>{this.props.invisibility}</td>
                <td>{Functions.MMSS(this.props.invisibilityTime)}</td>
            </tr>);
        }

        if(this.props.superHealth > 0){

            rows.push(<tr key="2">
                <td>Super Health</td>
                <td>{this.props.superHealth}</td>
                <td>N/A</td>
            </tr>);
        }

        if(this.props.armor > 0){

            rows.push(<tr key="3">
                <td>Body Armor</td>
                <td>{this.props.armor}</td>
                <td>N/A</td>
            </tr>);

        }

        if(this.props.pads > 0){

            rows.push(<tr key="4">
                <td>Thigh Pads</td>
                <td>{this.props.pads}</td>
                <td>N/A</td>
            </tr>);
        }

        
        if(this.props.boots > 0){

            rows.push(<tr key="5">
                <td>Jump Boots</td>
                <td>{this.props.boots}</td>
                <td>N/A</td>
            </tr>);
        }

        if(rows.length === 0) return null;


        return <div className="m-bottom-25">
            <div className="default-header">Power Ups Summary</div>
            <Table2 width={2}>
                <tr>
                    <th>Item</th>
                    <th>Times Used</th>
                    <th>Total Time</th>
                </tr>
                {rows}
            </Table2>
            
        </div>
    }
}


export default PlayerMatchPowerUps;