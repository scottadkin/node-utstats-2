import React from 'react';

class AdminOrphanedData extends React.Component{

    constructor(props){

        super(props);
    }

    async loadData(){

        try{

            const req = await fetch("/api/adminmatches", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "orphanedIds"})
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

        return <div>
            <div className="default-header">Orphaned Data</div>
        </div>
    }
}


export default AdminOrphanedData;