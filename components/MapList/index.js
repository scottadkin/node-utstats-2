import MapDefaultBox from '../MapDefaultBox/';

class MapList extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const elems = [];

        const maps = JSON.parse(this.props.data);

        for(let i = 0; i < maps.length; i++){
            elems.push(<MapDefaultBox key={i} data={maps[i]}/>);
        }

        return (<div>
            {elems}
        </div>);
    }
}


export default MapList;