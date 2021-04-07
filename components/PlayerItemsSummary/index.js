import React from 'react';
import TimeStamp from '../TimeStamp/';


class PlayerItemsSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    getItem(data, id){

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            if(d.id === id && d.type === this.state.mode){
                return d;
            }
        }
        

        return null;
    }

    displayType(){

        const targetType = this.state.mode;

        const data = JSON.parse(this.props.data);

        const names = JSON.parse(this.props.names);

        const elems = [];

        let currentItem = 0;
        let averageUsage = 0;

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];
           
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

            return <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Matches</th>
                        <th>Used</th>
                        <th>Average Usage per Match</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        }

        return null;


    }


    displayTabs(){

        const titles = [
            "Unsorted",
            "Weapons",
            "Ammo",
            "Health",
            "Powerups",
            "Special"
        ];
        const elems = [];

        for(let i = 0; i < 6; i++){

            elems.push(
                <div key={i} className={`tab ${(this.state.mode === i) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(i);
                })}>
                    {titles[i]}
                </div>
            );
        }

        if(elems.length > 0){
            return <div className="tabs">
                {elems}
            </div>
        }

        return null;
    }

    render(){
        return <div className="special-table">
            <div className="default-header">Pickup History</div>
            {this.displayTabs()}
            {this.displayType()}
        </div>
    }
}


export default PlayerItemsSummary;