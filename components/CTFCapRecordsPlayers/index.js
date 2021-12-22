import React from 'react';
import Link from 'next/link';


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
        </div>
    }
}


export default CTFCapRecordsPlayers;