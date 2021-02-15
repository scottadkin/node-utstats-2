import MapDefaultBox from '../MapDefaultBox/';
import MapTableRow from '../MapTableRow/';
import styles from './MapList.module.css';

class MapList extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const elems = [];

        const maps = JSON.parse(this.props.data);

        for(let i = 0; i < maps.length; i++){
            elems.push(<MapTableRow data={maps[i]}/>);
        }

        return (<div className="special-table">
            <table className={styles.table}>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Playtime</th>
                        <th>Matches</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        </div>);

        /*
        for(let i = 0; i < maps.length; i++){
            elems.push(<MapDefaultBox key={i} data={maps[i]} images={this.props.images}/>);
        }

        return (<div>
            {elems}
        </div>);*/
    }
}


export default MapList;