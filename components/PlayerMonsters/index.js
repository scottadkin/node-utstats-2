import React from 'react';
import Loading from '../Loading';

class PlayerMonsters extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true,
            "data": null
        };
    }

    async loadData(){

        try{

            const req = await fetch("/api/monsterhunt", {
                "method": "POST",
                "headers": {"Content-type": "application/json"},
                "body": JSON.stringify({"mode": "playerTotals","playerId": this.props.playerId})
            });

            const res = await req.json();


        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
    }

    render(){

        const elems = [];

        if(this.state.bLoading){

            elems.push(<Loading />);

        }else{

        }

        return <>
            <div className="default-header">Monster Stats</div>
            {elems}
        </>
    }
}

export default PlayerMonsters;