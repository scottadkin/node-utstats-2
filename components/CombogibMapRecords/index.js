import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Table2 from "../Table2";
import Functions from "../../api/functions";
import TablePagination from "../TablePagination";
import TableHeader from "../TableHeader";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import TabsHeader from "../TabsHeader";

class CombogibMapRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "data": null, 
            "players": null,
            "totalResults": 0,
            "error": null, 
            "loaded": false, 
            "page": 0, 
            "perPage": 15,
            "dataType": "combo_kills"
        };

        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.changeDataType = this.changeDataType.bind(this);
    }

    changeDataType(newType){

        this.setState({"dataType": newType, "page": 0});
    }

    getTitle(type){

        const titles = {
            "combo_kills": "Most Combos Kills in a match",
            "insane_kills": "Most Insane Combo Kills in a match",
            "shockball_kills": "Most ShockBall Kills in a match",
            "primary_kills": "Most Instagib Kills in a match",
            "best_single_combo": "Most Kills with one Combo",
            "best_single_insane": "Most Kills with one Insane Combo",
            "best_single_shockball": "Most Kills with one Shock Ball",
            "best_combo_spree": "Most Combos Kills in a Life",
            "best_insane_spree": "Most Insane Combos Kills in a Life",
            "best_shockball_spree": "Most Shockball Kills in a Life",
            "best_primary_spree": "Most Instagib Kills in a Life",
        };

        const tabTitles = {
            "combo_kills": "Combos Kills",
            "insane_kills": "Insane Combo Kills",
            "shockball_kills": "ShockBall Kills",
            "primary_kills": "Instagib Kills",
            "best_single_combo": "Best Combo",
            "best_single_insane": "Best Insane Combo",
            "best_single_shockball": "Best Shock Ball",
            "best_combo_spree": "Best Combo Spree",
            "best_insane_spree": "Best Insane Combo Spree",
            "best_shockball_spree": "Best ShockBall Spree",
            "best_primary_spree": "Best Instagib Spree",
        };

        if(type === "*") return tabTitles;

        if(titles[type] === undefined) return "Title doesn't exist!";

        return titles[type];
    }

    nextPage(){

        this.setState({"page": this.state.page + 1});
    }

    previousPage(){

        if(this.state.page - 1 < 0) return;

        this.setState({"page": this.state.page - 1});
    }

    async componentDidUpdate(prevProps, prevState){

        if(prevState.page !== this.state.page || prevState.dataType !== this.state.dataType){
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
                "perPage": this.state.perPage,
                "dataType": this.state.dataType
            })
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error});
        }else{

            this.setState({"data": res.data, "totalResults": res.totalResults, "players": res.players});
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

            const player = Functions.getPlayer(this.state.players, d.player_id, true);

            rows.push(<tr key={i}>
                <td><span className="place">{place}{Functions.getOrdinal(place)}</span></td>
                <td className="text-left">
                    <Link href={`/player/${d.player_id}`}>
                        <a>
                            <CountryFlag country={player.country}/>
                            {player.name}
                        </a>
                    </Link>
                </td>
                <td>{Functions.MMSS(d.playtime)}</td>
                <td>{d.best_value}</td>
            </tr>);
        }

        if(rows.length === 0){
            rows.push(<tr key="-1"><td colSpan="4">No data found</td></tr>);
        }

        return <div>
            <TableHeader width={4}>{this.getTitle(this.state.dataType)}</TableHeader>
            <Table2 width={4}>
                <tr>
                    <th>&nbsp;</th>
                    <th>Player</th>
                    <th>Playtime</th>
                    <th>Record</th>
                </tr>
                {rows}
            </Table2>
            <TablePagination previous={this.previousPage} next={this.nextPage} width={4} page={this.state.page + 1}
                perPage={this.state.perPage} totalResults={this.state.totalResults}    
            />
       
        </div>
        
    }

    renderTabs(){

        const titles = this.getTitle("*");

        const tabs = [];
        

        const tabsRow1 = [];
        const tabsRow2 = [];
        const tabsRow3 = [];

        const tabRow1Types = ["combo_kills", "insane_kills","shockball_kills","primary_kills"];
        const tabRow2Types = ["best_single_combo", "best_single_insane", "best_single_shockball"];
        const tabRow3Types = ["best_combo_spree","best_insane_spree","best_ball_spree","best_primary_spree",];

        for(const [key, value] of Object.entries(titles)){

            const elem = <div key={key} className={`tab ${(this.state.dataType === key) ? "tab-selected" : ""}`} onClick={(() =>{
                this.changeDataType(key);
            })}>
                {value}
            </div>

            if(tabRow1Types.indexOf(key) !== -1){
                tabsRow1.push(elem);
            }

            if(tabRow2Types.indexOf(key) !== -1){
                tabsRow2.push(elem);
            }

            if(tabRow3Types.indexOf(key) !== -1){
                tabsRow3.push(elem);
            }

           
        }

        return <div>
            <TabsHeader>Kill Types</TabsHeader>
            <div className="tabs">
                {tabsRow1}
            </div>
            <TabsHeader>Best Single Kill Events</TabsHeader>
            <div className="tabs">
                {tabsRow2}
            </div>
            <TabsHeader>Most Kill Types in a Single Life</TabsHeader>
            <div className="tabs">
                {tabsRow3}
            </div>
        </div>
    }

    render(){

        if(!this.state.loaded) return <div><Loading /></div>;
        if(this.state.error !== null){

            if(this.state.error !== "none"){
                return <ErrorMessage title="Combogib Stats" text={this.state.error}/>
            }

            return null;
        }

        return <div>
            <div className="default-header">Combogib Player Records</div>
            {this.renderTabs()}
            {this.renderTable()}
        </div>
    }
}

export default CombogibMapRecords;