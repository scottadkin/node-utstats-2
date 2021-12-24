import React from 'react';
import Link from 'next/link';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';


class CTFCapRecordsPlayers extends React.Component{

    constructor(props){

        super(props);

        this.state = {"soloCaps": [], "assistCaps": [], "finishedLoading": false, "players": []};
    }

    async loadData(){

        try{

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "caprecordsplayers"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "soloCaps": res.soloCaps,
                    "assistCaps": res.assistCaps,
                    "players": res.players,
                    "finishedLoading": true
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    componentDidMount(){

        this.loadData();
    }

    renderRecords(){

        const rows = [];

        let data = [];

        if(this.props.mode === 0){
            data = this.state.soloCaps;
        }else{
            data = this.state.assistCaps;
        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            rows.push(<tr key={i}>
                <td>{i + 1}{Functions.getOrdinal(i + 1)}</td>
                <td>
                    <Link href={`/player/${d.player.id}`}>
                        <a>
                            <CountryFlag country={d.player.country} host={this.props.host}/>
                            {d.player.name}
                        </a>
                    </Link>
                </td>
                <td>{d.caps}</td>
            </tr>);
        }

        return <>
            <Table2 width={2}>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Total Records</th>
                </tr>
                {rows}
            </Table2>
        </>
    }

    render(){

        return <div>
            <div className="default-header">Player CTF Cap Records</div>
            <div className="tabs">
                <Link href={`/ctfcaps?mode=2&submode=0`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : ""}`}>Solo Caps</div>
                    </a>
                </Link>
                <Link href={`/ctfcaps?mode=2&submode=1`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : ""}`}>Assisted Caps</div>
                    </a>
                </Link>
            </div>
            {this.renderRecords()}
        </div>
    }
}


export default CTFCapRecordsPlayers;