import React from "react";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";
import Table2 from "../Table2";
import Image from "next/image";

class CombogibPlayerMatch extends React.Component{

    constructor(props){

        super(props);

        this.state = {"error": null, "bLoading": true, "mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    async loadData(){

        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "pmatch", "matchId": this.props.matchId, "playerId": this.props.playerId})
        });

        const res = await req.json();

        console.log(res.data);

        if(res.error !== undefined){
            this.setState({"error": res.error});
        }else{
            this.setState({"data": res.data});
        }

        this.setState({"bLoading": false});

    }

    async componentDidMount(){

        await this.loadData();
    }

    renderGeneral(){

        if(this.state.mode !== 0) return null;

        const d = this.state.data;

        return <Table2 width={4}>
            <tr>
                <th>
                    <Image src={`/images/combo.png`} width={46} height={46} alt="Image"/><br/>
                    Combo Kills
                </th>
                <th>
                    <Image src={`/images/combo.png`} width={46} height={46} alt="Image"/><br/>
                    Insane Combo Kills
                </th>
                <th>
                    <Image src={`/images/shockball.png`} width={46} height={46} alt="Image"/><br/>
                    ShockBall Kills
                </th>
                <th>
                    <Image src={`/images/primary.png`} width={46} height={46} alt="Image"/><br/>
                    Instagib Kills
                </th>
            </tr>
            <tr>
                <td>{d.combo_kills}</td>
                <td>{d.insane_kills}</td>
                <td>{d.ball_kills}</td>
                <td>{d.primary_kills}</td>
            </tr>
        </Table2>
    }

    renderComboStats(){

        return <Table2 width={1}>
            <tr>
                <th>Kills</th>
                <th>Deaths</th>
                <th>Efficiency</th>
                <th>Best Single Combo</th>
                <th>Most Kills In 1 Life</th>
                <th>Kills Per Minute</th>
            </tr>
        </Table2>
    }

    render(){

        if(this.state.error !== null) return <ErrorMessage title="Combogib Stats" text={this.state.error}/>;
        if(this.state.bLoading) return <Loading />;
        if(this.state.data === null) return null;

        return <div>
            <div className="default-header">Combogib Stats</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(0);
                })}>General Stats</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(1);
                })}>Combo Stats</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(2);
                })}>Insane Combo Stats</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(3);
                })}>Shockball Kills</div>
                <div className={`tab ${(this.state.mode === 4) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(4);
                })}>Instagib Kills</div>
            </div>
            {this.renderGeneral()}
            {this.renderComboStats()}
        </div>
    }
}

export default CombogibPlayerMatch;