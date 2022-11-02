import React from "react";
import Option2 from "../Option2";
import Table2 from "../Table2";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";

class CTFCapRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = { "loaded": false, "error": null, "data": null, "players": null};
        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.props.changeMode(id);
    }

    async loadData(){

        const req = await fetch("/api/ctf", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "maprecords", "mapIds": "*"})
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"loaded": true, "error": res.error});

        }else{

            this.setState({
                "loaded": true, 
                "data": res.data, 
                "players": res.playerNames
            });
        }
        
    }

    async componentDidMount(){

        await this.loadData();
    }



    toArrayData(){

        const arrayData = [];

        for(const data of Object.values(this.state.data)){

            arrayData.push({"name": data.name, "data": data});
        }


        arrayData.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;

            return 0;
        });

        return arrayData;
    }
    

    renderSoloCaps(){

        const rows = [];

        if(!this.state.loaded || this.props.mode === 1) return null;

        const arrayData = this.toArrayData();

        for(let i = 0; i < arrayData.length; i++){

            const d = arrayData[i].data;

            if(d.solo === null) break;

            const player = Functions.getPlayer(this.state.players, d.solo.cap, true);

            rows.push(<tr key={i}>
                <td className="text-left">
                    <Link href={`/map/${d.solo.map_id}`}>
                        <a>
                            {arrayData[i].name}
                        </a>
                    </Link>
                </td>
                <td className="small-font grey">
                    <Link href={`/match/${d.solo.match_id}`}>
                        <a>
                            {Functions.convertTimestamp(d.solo.match_date, true, false)}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={`/pmatch/${d.solo.match_id}/?player=${player.id}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>
                </td>
                <td className="purple">{Functions.MMSS(d.solo.travel_time)}</td>
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

    createAssistedPlayers(matchId, capPlayer, grabPlayer, assistedIds){

        const elems = [];
        const usedIds = [];

        usedIds.push(grabPlayer.id, capPlayer.id);

        for(let i = 0; i < assistedIds.length; i++){

            const id = assistedIds[i];

            if(usedIds.indexOf(id) === -1){

                const player = Functions.getPlayer(this.state.players, id, true);

                elems.push(
                    <Link key={`${id}-${i}`} href={`/pmatch/${matchId}/?player=${id}`}>
                        <a className="small-font grey">
                            <CountryFlag country={player.country}/>{player.name}&nbsp;
                        </a>
                    </Link>
                );

                usedIds.push(id);
            }
        }

        return elems;
    }

    renderAssistedCaps(){

        const rows = [];

        if(!this.state.loaded || this.props.mode === 0) return null;

        const arrayData = this.toArrayData();

        for(let i = 0; i < arrayData.length; i++){

            const d = arrayData[i].data;

            if(d.assisted === null) break;

            const capPlayer = Functions.getPlayer(this.state.players, d.assisted.cap, true);
            const grabPlayer = Functions.getPlayer(this.state.players, d.assisted.grab, true);

            const assistedPlayerIds = d.assisted.assists;

            const assistedPlayersElems = this.createAssistedPlayers(d.assisted.match_id, capPlayer, grabPlayer, assistedPlayerIds);


            rows.push(<tr key={i}>
                <td className="text-left">
                    <Link href={`/map/${d.assisted.map_id}`}>
                        <a>
                            {arrayData[i].name}
                        </a>
                    </Link>
                </td>
                <td className="small-font grey">
                    <Link href={`/match/${d.assisted.match_id}`}>
                        <a>
                            {Functions.convertTimestamp(d.assisted.match_date, true, false)}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={`/pmatch/${d.assisted.match_id}/?player=${grabPlayer.id}`}>
                        <a>
                            <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}
                        </a>
                    </Link>
                </td>
                <td>
                    {assistedPlayersElems}
                </td>
                <td>
                    <Link href={`/pmatch/${d.assisted.match_id}/?player=${capPlayer.id}`}>
                        <a>
                            <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                        </a>
                    </Link>
                </td>
                <td className="purple">{Functions.MMSS(d.assisted.travel_time)}</td>
            </tr>);
        }


        return <Table2 width={1} header="Assisted Cap Records">
            <tr>
                <th>Map</th>
                <th>Date of Record</th>
                <th>Grabbed By</th>
                <th>Assisted</th>
                <th>Capped By</th>
                <th>Record Time</th>
            </tr>
            {rows}
        </Table2>
    }

    renderLoading(){

        if(this.state.loaded) return null;

        return <Loading />;
    }

    renderError(){

        if(this.state.error === null) return null;

        return <ErrorMessage title="CTFCapRecords" text={this.state.error}/>
    }

    render(){

        return <div>
            <div className="default-sub-header">Select Record Type</div>
            <div className="form">
                <div className="select-row">
                    <div className="select-label">
                        Capture Type
                    </div>
                    <Option2 title1="Solo Caps" title2="Assisted Caps" value={this.props.mode} changeEvent={this.changeMode}/>
                </div>
            </div>
            <div className="m-top-25">
                {this.renderLoading()}
                {this.renderError()}
                {this.renderSoloCaps()}
                {this.renderAssistedCaps()}
            </div>
        </div>
    }
}

export default CTFCapRecords;