import React from "react";
import InteractiveTable from "../InteractiveTable";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Functions from "../../api/functions";

class ServerRecentPings extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true,
            "data": null,
            "error": null
        };
    }

    async loadPingData(){

        const req = await fetch("/api/servers",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "recent-pings", "id": this.props.serverId})
        });

        const res = await req.json();

        console.log(res);

        if(res.error === undefined){

            this.setState({"data": res.data, "bLoading": false});

        }else{
            this.setState({"error": res.error, "bLoading": false});
        }
    }

    async componentDidMount(){

        await this.loadPingData();
    }


    getColorClass(value){

        if(value <= 40) return "team-green";
        if(value <= 100) return "team-yellow";
        return "team-red";
        
    }

    renderData(){

        if(this.state.bLoading) return null;
        if(this.state.error !== null) return <ErrorMessage title="Recent Ping Data" text={this.state.error}/>;

        const headers = {
            "date": "Date",
            "ping_min_average": "Average Minimum Ping",
            "ping_average_average": "Average Ping",
            "ping_max_average":"Average Maximum Ping"
        };

        const data = [];


        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const minClassName = this.getColorClass(d.ping_min_average);
            const averageClassName = this.getColorClass(d.ping_average_average);
            const maxClassName = this.getColorClass(d.ping_max_average);

            

            data.push({
                "date": {"value": d.date, "displayValue": Functions.convertTimestamp(d.date, true)},
                "ping_min_average": {"value": d.ping_min_average, "displayValue": d.ping_min_average, "className": minClassName}, 
                "ping_average_average": {"value": d.ping_average_average, "displayValue": d.ping_average_average, "className": averageClassName}, 
                "ping_max_average": {"value": d.ping_max_average, "displayValue": d.ping_max_average, "className": maxClassName}, 
            });
        }


        console.log(data);


        return <InteractiveTable width={1} headers={headers} data={data}/>
        
    }

    render(){

        return <div>
            <div className="default-header">Recent Ping Data</div>
            <Loading value={!this.state.bLoading}/>
            {this.renderData()}
        </div>
    }
}

export default ServerRecentPings;