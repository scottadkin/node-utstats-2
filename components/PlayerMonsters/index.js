import React from 'react';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

class PlayerMonsters extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true,
            "data": null,
            "error": null
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

            console.log(res);

            if(res.error === undefined){

                this.setState({"data": res});

            }else{

                this.setState({"error": res.error});
            }

            this.setState({"bLoading": false});

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

            elems.push(<Loading key="loading"/>);

        }else{

            if(this.state.error !== null){

                const errorText = this.state.error;
                elems.push(<ErrorMessage key="error" title={"Monster Stats"} text={errorText}/>);
            }

        }

       

        return <>
            <div className="default-header">Monster Stats</div>
            {elems}
        </>
    }
}

export default PlayerMonsters;