import React from 'react';


class PlayerCapRecords extends React.Component{

    constructor(props){

        super(props);
    }

    async loadData(){

        try{

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "singleplayercaprecords", "playerId": this.props.playerId})
            });

            const res = await req.json();

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    componentDidMount(){

        this.loadData();
    }


    render(){

        return <div>
            <div className="default-header">Capture the Flag Cap Records</div>
        </div>
    }

}

export default PlayerCapRecords;