import React from "react";
import Image from "next/image";
import Table2 from "../Table2";
import CountryFlag from "../CountryFlag";
import ErrorMessage from "../ErrorMessage";
import Functions from "../../api/functions";

class CombogibMatchStats extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": null, "error": null};
        
    }

    async loadData(){

        const req = await fetch("/api/combogib",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "match", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"data": res.data});
        }else{
            this.setState({"error": res.error});
        }

        this.setState({"bLoaded": true});

        console.log(res);

    }

    async componentDidMount(){

        await this.loadData();
    }


    renderBasic(){

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const bestKill = d.best_single_combo;

            const bestKillString = (bestKill === 0) ? "" : `${bestKill} Kill${(bestKill === 1) ? "" : "s"}`;

            rows.push(<tr key={i}>
                <td className="team-red"><CountryFlag country="gb"/>Ooper</td>
                <td>{Functions.ignore0(d.combo_kills)}</td>
                <td>{Functions.ignore0(d.ball_kills)}</td>
                <td>{Functions.ignore0(d.primary_kills)}</td>
                <td>{bestKillString}</td>
            </tr>);
        }

        return <Table2 width={4} players={true}>
            <tr>
                <th>&nbsp;</th>
                <th>
                    <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                    <br/>Combo Kills
                </th>
                <th>
                    <Image src="/images/shockball.png" alt="image" width={64} height={64}/>
                    <br/>Shock Ball Kills
                </th>
                <th>
                    <Image src="/images/primary.png" alt="image" width={64} height={64}/>
                    <br/>Instagib Kills
                </th>
                <th>
                    <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                    <br/>Best Single Combo
                </th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        if(this.state.error !== null){

            return <ErrorMessage title="Combogib Stats" text={this.state.error}/>
        }

        if(this.state.data === null) return null;
        
        return <div>
            <div className="default-header">Combogib Stats</div> 
            {this.renderBasic()}
        </div>
    }
}

export default CombogibMatchStats;