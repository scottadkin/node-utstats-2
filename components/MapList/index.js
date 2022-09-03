import MapDefaultBox from '../MapDefaultBox/';
import MapTableRow from '../MapTableRow/';
import React from 'react';
import Table2 from '../Table2';
import styles from "./MapList.module.css";

class MapList extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const elems = [];

        const maps = JSON.parse(this.props.data);

        if(maps.length === 0){
            return (<div></div>);
        }

        if(this.props.displayType === 1){

            for(let i = 0; i < maps.length; i++){
                elems.push(<MapTableRow key={i} data={maps[i]}/>);
            }

            return <div>
                <Table2 width={1} players={true}>
                        <tr>
                            <th>Name</th>
                            <th>First</th>
                            <th>Last</th>
                            <th>Playtime</th>
                            <th>Matches</th>
                        </tr>
                        {elems}
                </Table2>
            </div>;

        }else{
        
            for(let i = 0; i < maps.length; i++){
                elems.push(<MapDefaultBox host={this.props.host} key={i} data={maps[i]} images={this.props.images}/>);
            }

            return <div className={styles.dwrapper}>
                {elems}
            </div>;
        }
    }
}


export default MapList;