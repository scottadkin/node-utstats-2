import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Table2 from "../Table2";
import Functions from "../../api/functions";

class CombogibMapRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "data": null, 
            "error": null, 
            "loaded": false, 
            "page": 0, 
            "perPage": 5
        };

        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
    }


    nextPage(){

        this.setState({"page": this.state.page + 1});
    }

    previousPage(){

        if(this.state.page - 1 < 0) return;

        this.setState({"page": this.state.page - 1});
    }

    async componentDidUpdate(prevProps, prevState){

        if(prevState.page !== this.state.page){
            await this.loadData();
        }
    }

    async loadData(){

        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "maprecord", 
                "mapId": this.props.mapId,
                "page": this.state.page,
                "perPage": this.state.perPage
            })
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error});
        }else{

            this.setState({"data": res.data});
        }

        
        this.setState({"loaded": true});
    }

    async componentDidMount(){

        await this.loadData();
    }


    renderTable(){

        if(this.state.data === null) return null;

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const place = (this.state.page * this.state.perPage) + i + 1;

            rows.push(<tr key={i}>
                <td><span className="place">{place}{Functions.getOrdinal(place)}</span></td>
                <td></td>
                <td>{d.best_value}</td>
            </tr>);
        }

        return <div>
            <div className="default-sub-header">Fart</div>
            <Table2 width={4}>
                <tr>
                    <th>Player</th>
                    <th>Date</th>
                    <th>Record</th>
                </tr>
                {rows}
            </Table2>
            <span onClick={this.previousPage}>PREVIOUS</span>
            <span onClick={this.nextPage}>NEXT</span>
        </div>
        
    }

    render(){

        if(!this.state.loaded) return <div><Loading /></div>;
        if(this.state.error !== null) return <ErrorMessage title="Combogib Stats" text={this.state.error}/>

        return <div>
            <div className="default-header">Combogib Records</div>
            {this.renderTable()}
        </div>
    }
}

export default CombogibMapRecords;