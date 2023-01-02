import MatchCTFSummaryDefault from '../MatchCTFSummaryDefault/';
import MatchCTFSummaryCovers from '../MatchCTFSummaryCovers/';
import React from 'react';
import Functions from '../../api/functions';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';


class MatchCTFSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bLoading": true, "error": null};
    }


    renderTeam(teamId){

        const headers = {
            "player": "Player",
            "flag_taken": "Taken",
            "flag_pickup": "Pickup",
            "flag_dropped":	"Dropped",//	Assist	Cover	Seal	Capture	Kill	Return	Close Return
            "flag_suicide":	"Suicide",
            "flag_assist": "Assist",
            "flag_cover": "Cover",
            "flag_seal": "Seal",
            "flag_capture": "Captured",
            "flag_kill": "Kill",
            "flag_return": "Return",
            "flag_return_save": "Close Return",
        };

        const data = [];

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            if(p.team !== teamId) continue;

            const ctf = p.ctfData;

            const playerElem = <Link href={`/pmatch/${this.props.matchId}?player=${p.player_id}`}>
                <a>
                    <CountryFlag country={p.country}/>
                    {p.name}
                </a>
            </Link>;

            data.push({
                "player": {
                    "value": p.name.toLowerCase(), 
                    "displayValue": playerElem,
                    "className": `player ${Functions.getTeamColor(p.team)}`
                },
                "flag_taken": {"value": ctf.flag_taken, "displayValue": Functions.ignore0(ctf.flag_taken)},
                "flag_pickup": {"value": ctf.flag_pickup, "displayValue": Functions.ignore0(ctf.flag_pickup)},
                "flag_dropped": {"value": ctf.flag_dropped, "displayValue": Functions.ignore0(ctf.flag_dropped)},
                "flag_suicide": {"value": ctf.flag_suicide, "displayValue": Functions.ignore0(ctf.flag_suicide)},
                "flag_assist": {"value": ctf.flag_assist , "displayValue": Functions.ignore0(ctf.flag_assist)},
                "flag_cover":  {"value": ctf.flag_cover , "displayValue": Functions.ignore0(ctf.flag_cover)},
                "flag_seal":  {"value": ctf.flag_seal , "displayValue": Functions.ignore0(ctf.flag_seal)},
                "flag_capture":  {"value": ctf.flag_capture , "displayValue": Functions.ignore0(ctf.flag_capture)},
                "flag_kill":  {"value": ctf.flag_kill , "displayValue": Functions.ignore0(ctf.flag_kill)},
                "flag_return":  {"value": ctf.flag_return , "displayValue": Functions.ignore0(ctf.flag_return)},
                "flag_return_save":  {"value": ctf.flag_return_save, "displayValue": Functions.ignore0(ctf.flag_return_save) },

            });
        }

        if(data.length === 0) return null;

        return <InteractiveTable key={teamId} width={1} headers={headers} data={data}/>
    }


    render(){


        const tables = [];

        let bAnyData = false;

        for(let i = 0; i < 4; i++){

            const table = this.renderTeam(i)

            if(table !== null) bAnyData = true;

            tables.push(table);
        }

        if(!bAnyData) return null;

        return <div>
            <div className="default-header">Capture The Flag Summary</div>
            {tables}
        </div>
    }
}

export default MatchCTFSummary;