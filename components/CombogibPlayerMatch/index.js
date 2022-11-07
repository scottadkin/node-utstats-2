import React from "react";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";
import Table2 from "../Table2";
import Image from "next/image";
import Functions from "../../api/functions";

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
                <td>{d.shockball_kills}</td>
                <td>{d.primary_kills}</td>
            </tr>
        </Table2>
    }

    renderComboStats(){

        if(this.state.mode !== 1 && this.state.mode !== 5) return null;

        const d = this.state.data;

        const titles = ["Kills", "Deaths", "Efficiency", "Best Single Combo", "Most Kills In 1 Life", "Kills Per Minutes"];

        const bestKill = Functions.ignore0(d.best_single_combo);

        const data = [
            Functions.ignore0(d.combo_kills),
            Functions.ignore0(d.combo_deaths),
            `${d.combo_efficiency.toFixed(2)}%`,
            `${bestKill} ${Functions.plural(bestKill, "kill")}`,
            Functions.ignore0(d.best_combo_spree),
            d.combo_kpm.toFixed(2)
        ];

        return this.renderBasicTable(titles, data, "Combo Stats");
    }

    renderInsaneComboStats(){

        if(this.state.mode !== 2 && this.state.mode !== 5) return null;

        const d = this.state.data;

        const titles = ["Kills", "Deaths", "Efficiency", "Best Single Insane Combo", "Most Kills In 1 Life", "Kills Per Minutes"];

        const bestKill = Functions.ignore0(d.best_single_insane);

        const data = [
            Functions.ignore0(d.insane_kills),
            Functions.ignore0(d.insane_deaths),
            `${d.insane_efficiency.toFixed(2)}%`,
            `${bestKill} ${Functions.plural(bestKill, "kill")}`,
            Functions.ignore0(d.best_insane_spree),
            d.insane_kpm.toFixed(2)
        ];

        return this.renderBasicTable(titles, data, "Insane Combo Stats");

    }

    renderShockballStats(){

        if(this.state.mode !== 3 && this.state.mode !== 5) return null;

        const d = this.state.data;

        const titles = ["Kills", "Deaths", "Efficiency", "Best Single Shockball", "Most Kills In 1 Life", "Kills Per Minutes"];

        const bestKill = Functions.ignore0(d.best_single_shockball);

        const data = [
            Functions.ignore0(d.shockball_kills),
            Functions.ignore0(d.shockball_deaths),
            `${d.shockball_efficiency.toFixed(2)}%`,
            `${bestKill} ${Functions.plural(bestKill, "kill")}`,
            Functions.ignore0(d.best_shockball_spree),
            d.shockball_kpm.toFixed(2)
        ];

        return this.renderBasicTable(titles, data, "ShockBall Stats");

    }

    renderPrimaryStats(){

        if(this.state.mode !== 4 && this.state.mode !== 5) return null;

        const d = this.state.data;

        const titles = ["Kills", "Deaths", "Efficiency", "Most Kills In 1 Life", "Kills Per Minutes"];

        const data = [
            Functions.ignore0(d.primary_kills),
            Functions.ignore0(d.primary_deaths),
            `${d.primary_efficiency.toFixed(2)}%`,
            Functions.ignore0(d.best_primary_spree),
            d.primary_kpm.toFixed(2)
        ];

        return this.renderBasicTable(titles, data, "Instagib Stats");

    }

    renderBasicTable(titles, data, subTitle){

        const titleElems = [];
        const dataElems = [];

        for(let i = 0; i < titles.length; i++){

            titleElems.push(<th key={i}>{titles[i]}</th>);
            dataElems.push(<td key={i}>{data[i]}</td>);
        }

        if(this.state.mode === 5){
            return <div>
                <div className="default-sub-header">{subTitle}</div>
                <Table2 width={1}>
                    <tr>
                        {titleElems}
                    </tr>
                    <tr>
                        {dataElems}
                    </tr>
                </Table2>
            </div>;
        }else{
            return <Table2 width={1}>
                <tr>
                    {titleElems}
                </tr>
                <tr>
                    {dataElems}
                </tr>
            </Table2>;
        }
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
                <div className={`tab ${(this.state.mode === 5) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(5);
                })}>Display All</div>
            </div>
            {this.renderGeneral()}
            {this.renderComboStats()}
            {this.renderInsaneComboStats()}
            {this.renderShockballStats()}
            {this.renderPrimaryStats()}
        </div>
    }
}

export default CombogibPlayerMatch;