import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Table2 from "../Table2";
import TableHeader from "../TableHeader";
import Functions from "../../api/functions";

class CombogibMapTotals extends React.Component{

    constructor(props){

        super(props);

        this.state = {"loaded": false, "error": null, "data": null};
    }

    async loadData(){

        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "maptotal", "mapId": this.props.mapId})
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

    renderTotals(){

        const d = this.state.data;

        return <div>
            <TableHeader width={1}>General Summary</TableHeader>
            <Table2 width={1}>
                <tr>
                    <th>Total Combo Matches</th>
                    <th>Total Combo Playtime</th>
                    <th>Combo Kills</th>
                    <th>Insane Combo Kills</th>
                    <th>Shock Ball Kills</th>
                    <th>Instagib Kills</th>
                </tr>
                <tr>
                    <td>{d.matches}</td>
                    <td>{Functions.toHours(d.playtime)} Hours</td>
                    <td>{Functions.ignore0(d.combo_kills)}</td>
                    <td>{Functions.ignore0(d.insane_kills)}</td>
                    <td>{Functions.ignore0(d.ball_kills)}</td>
                    <td>{Functions.ignore0(d.primary_kills)}</td>
                </tr>
            </Table2>
        </div>
    }

    renderRecords(){

        const d = this.state.data;

        return <div>
            <TableHeader width={1}>Kill Type Spree Records</TableHeader>
            <Table2 width={1}>
                <tr>
                    <th>Most Combo Kills</th>
                    <th>Most Insane Combo Kills</th>
                    <th>Most ShockBall Kills</th>
                    <th>Most Instagib Kills</th>
                </tr>
                <tr>
                    <td>{Functions.ignore0(d.best_combo_kills)}</td>
                    <td>{Functions.ignore0(d.best_insane_kills)}</td>
                    <td>{Functions.ignore0(d.best_ball_kills)}</td>
                    <td>{Functions.ignore0(d.best_primary_kills)}</td>
                   
                </tr>
            </Table2>
        </div>
    }

    render(){

        if(!this.state.loaded) return <Loading/>;

        if(this.state.error !== null){

            if(this.state.error !== "none"){
                return <ErrorMessage title="CombogibMapTotals" text={this.state.error}/>;
            }

            return null;
        }

        return <div>
            <div className="default-header">Combogib Map Totals</div>
            {this.renderTotals()}
            {this.renderRecords()}
        </div>
    }
}

export default CombogibMapTotals;