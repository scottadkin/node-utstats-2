import React from "react";

class AdminServersManager extends React.Component{

    constructor(props){

        super(props);
    }

    async loadData(){

       // const req = await 
    }

    async componentDidMount(){

        await this.loadData();
    }

    render(){

        return <div>
            <div className="default-header">Servers Manager</div>
        </div>
    }
}

export default AdminServersManager;