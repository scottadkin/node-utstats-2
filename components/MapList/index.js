import MapDefaultBox from '../MapDefaultBox/';
import MapTableRow from '../MapTableRow/';
import {useEffect} from 'react';
import InteractiveTable from '../InteractiveTable';
import styles from "./MapList.module.css";
import { removeUnr, convertTimestamp, toPlaytime } from '../../api/generic.mjs';

const MapList = ({displayType, maps, images}) =>{

    useEffect(() =>{

    }, [displayType]);

    console.log(maps);

    const headers = {
        "name": "Name",
        //"author": "Author"
        "first": "First",
        "last": "Last",
        "playtime": "Playtime",
        "matches": "Matches"
        
    };

    const tableData = maps.map((map) =>{

        return {
            "name": {
                "value": map.name.toLowerCase(), 
                "displayValue": removeUnr(map.name), 
                "className": "text-left"
            },
            /*"author": {
                "value": map.author.toLowerCase(),
                "displayValue": map.author
            }*/
            "first": {
                "value": map.first,
                "displayValue": convertTimestamp(map.first, true),
                "className": "playtime"
            },
            "last": {
                "value": map.last,
                "displayValue": convertTimestamp(map.last, true),
                "className": "playtime"
            },
            "matches": {
                "value": map.matches
            },
            "playtime": {
                "value": map.playtime,
                "displayValue": toPlaytime(map.playtime),
                "className": "playtime"
            }
        }
    });

    return <div>
        <InteractiveTable bDisableSorting={true} width={1} headers={headers} data={tableData}/>
    </div>
}
/*
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

            const images = JSON.parse(this.props.images);
        
            for(let i = 0; i < maps.length; i++){
                elems.push(<MapDefaultBox host={this.props.host} key={i} data={maps[i]} images={images}/>);
            }

            return <div className={styles.dwrapper}>
                {elems}
            </div>;
        }
    }
}*/


export default MapList;