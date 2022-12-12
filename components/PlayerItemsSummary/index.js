import React from 'react';
import TimeStamp from '../TimeStamp/';
import Table2 from '../Table2';


class PlayerItemsSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 1, "totalTypes": 6};
        
        this.changeMode = this.changeMode.bind(this);

    }

    componentDidMount(){
        this.setDefaultCategory();
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    getItem(data, id){

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(d.id === id && d.type === this.state.mode){
                return d;
            }
        }
        
        return null;
    }


    setDefaultCategory(){

        const data = this.props.names;

        let start = null;

        for(let i = 1; i < this.state.totalTypes; i++){

            if(this.bAnyCategoryData(data, i)){
                start = i;
                break;
            }
        }

        if(start === null){
            start = 0;
        }


        this.setState({"mode": start});
    }

    bAnyCategoryData(data, category){

        for(let i = 0; i < data.length; i++){

            if(data[i].type === category) return true;
        }

        return false;
    }

    displayType(){

        const data = this.props.data;

        const names = this.props.names;

        const elems = [];

        let currentItem = 0;
        let averageUsage = 0;

        for(let i = 0; i < data.length; i++){

            const d = data[i];
           
            currentItem = this.getItem(names, d.item);
            
            if(currentItem !== null){

                if(d.uses > 0){
                    averageUsage = d.uses / d.matches;
                }else{
                    averageUsage = 0;
                }

                elems.push(
                    <tr key={i}>
                        <td>{currentItem.name}</td>
                        <td><TimeStamp timestamp={d.first} noTime={true} noDayName={true}/></td>
                        <td><TimeStamp timestamp={d.last} noTime={true} noDayName={true}/></td>
                        <td>{d.matches}</td>
                        <td>{d.uses}</td>
                        <td>{averageUsage.toFixed(2)}</td>
                    </tr>
                );
            }
            
        }

        if(elems.length > 0){

            return <Table2 width={1}>
                <tr>
                    <th>Name</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Matches</th>
                    <th>Used</th>
                    <th>Average Usage per Match</th>
                </tr>
                {elems}
            </Table2>
        }

        return null;


    }


    displayTabs(){

        const titles = {
            "Weapons": 1,
            "Ammo": 2,
            "Health": 3,
            "Powerups": 4,
            "Special": 5,
            "Unsorted": 0
        };

        const elems = [];

        for(const [key, value] of Object.entries(titles)){

            if(this.bAnyCategoryData(this.props.names, value)){

                elems.push(
                    <div key={value} className={`tab ${(this.state.mode === value) ? "tab-selected" : "" }`} onClick={(() =>{
                        this.changeMode(value);
                    })}>
                        {key}
                    </div>
                );
            }
        }

        if(elems.length > 0){
            return <div className="tabs">
                {elems}
            </div>
        }

        return null;
    }

    render(){

        if(this.state.mode === null) return null;
        
        return <div>
            <div className="default-header">Pickup History</div>
            {this.displayTabs()}
            {this.displayType()}
        </div>
    }
}


export default PlayerItemsSummary;