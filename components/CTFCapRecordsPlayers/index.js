import React from 'react';


class CTFCapRecordsPlayers extends React.Component{

    constructor(props){

        super(props);
    }

    async loadData(){

        try{

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "caprecordsplayers"})
            });

            const res = await req.json();

            
        }catch(err){
            console.trace(err);
        }
    }

    componentDidMount(){

        this.loadData();
    }

    render(){

        return <div>
            <div className="default-header">Player CTF Cap Records</div>
        </div>
    }
}


export default CTFCapRecordsPlayers;