import React from "react";
import Option2 from "../Option2";
import Table2 from "../Table2";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

class CTFCapRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};
        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }


    renderSoloCaps(){


        const rows = [];

        console.log(this.props.players);

        for(const [mapId, mapName] of Object.entries(this.props.mapNames)){

            const data = this.props.data[mapId] ?? null;

            if(data.solo === null) break;

            const player = Functions.getPlayer(this.props.players, data.solo.cap, true);

            rows.push(<tr key={mapId}>
                <td className="text-left">{mapName}</td>
                <td className="small-font grey">{Functions.convertTimestamp(data.solo.match_date, true, false)}</td>
                <td>
                    <Link href={`/pmatch/${data.solo.match_id}/?player=${player.id}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>
                </td>
                <td className="purple">{Functions.MMSS(data.solo.travel_time)}</td>
            </tr>);
        }


        return <Table2 width={1} header="Solo Cap Records">
            <tr>
                <th>Map</th>
                <th>Date of Record</th>
                <th>Player</th>
                <th>Record Time</th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        return <div>
            <div className="default-sub-header">Select Record Type</div>
            <div className="form">
                <div className="select-row">
                    <div className="select-label">
                        Capture Type
                    </div>
                    <Option2 title1="Solo Caps" title2="Assisted Caps" value={this.state.mode} changeEvent={this.changeMode}/>
                </div>
            </div>
            <div className="m-top-25">
                {this.renderSoloCaps()}
            </div>
        </div>
    }
}

export default CTFCapRecords;