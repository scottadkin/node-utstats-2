import React from 'react';
import Functions from '../../api/functions';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';


class MatchCTFSummaryReturns extends React.Component{

    constructor(props){

        super(props);

    }

    renderTeam(teamId){

        const headers = {
            "player": "Player",
            "flag_return": {
                "title": "Return", 
                "detailedTitle": "Flag Return", 
                "content": "Player returned their flag."
            },
            "flag_return_base": {
                "title": "Base", 
                "detailedTitle": "Flag Return Base", 
                "content": "Player returned their flag that was inside their base."
            },
            "flag_return_mid": {
                "title": "Mid", 
                "detailedTitle": "Flag Return Middle", 
                "content": "Player returned their flag that was in the middle of the map."
            },
            "flag_return_enemy_base": {
                "title": "Enemy Base", 
                "detailedTitle": "Flag Return Enemy Base", 
                "content": "Player returned their flag that was in the enemy's team base."
            },
            "flag_return_save": {
                "title": "Close Return", 
                "detailedTitle": "Close Flag Return", 
                "content": "Player returned their flag that was almost capped by the enemy team."
            },
        };

        const data = [];

        let totals = {
            "flag_return": 0,
            "flag_return_base": 0, 
            "flag_return_mid":  0,
            "flag_return_enemy_base": 0,
            "flag_return_save": 0
        };

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            if(p.team !== teamId) continue;

            const ctf = p.ctfData;

            const playerElem = <Link href={`/pmatch/${this.props.matchId}?player=${p.player_id}`}>
               
                    <CountryFlag country={p.country}/>
                    {p.name}
               
            </Link>;

            totals["flag_return"] += ctf.flag_return;
            totals["flag_return_base"] += ctf.flag_return_base;
            totals["flag_return_mid"] += ctf.flag_return_mid;
            totals["flag_return_enemy_base"] += ctf.flag_return_enemy_base;
            totals["flag_return_save"] += ctf.flag_return_save;

            data.push({
                "player": {
                    "value": p.name.toLowerCase(), 
                    "displayValue": playerElem,
                    "className": `player ${Functions.getTeamColor(p.team)}`
                },
                "flag_return":  {"value": ctf.flag_return , "displayValue": Functions.ignore0(ctf.flag_return)},
                "flag_return_base":  {"value": ctf.flag_return_base , "displayValue": Functions.ignore0(ctf.flag_return_base)},
                "flag_return_mid":  {"value": ctf.flag_return_mid , "displayValue": Functions.ignore0(ctf.flag_return_mid)},
                "flag_return_enemy_base":  {"value": ctf.flag_return_enemy_base , "displayValue": Functions.ignore0(ctf.flag_return_enemy_base)},
                "flag_return_save":  {"value": ctf.flag_return_save , "displayValue": Functions.ignore0(ctf.flag_return_save)},

            });
        }

        if(data.length === 0) return null;

        if(!this.props.single){
            const last = {
                "bAlwaysLast": true,
                "player": {
                    "value": "Totals", 
                    "className": `black`
                },
                "flag_return":  { "value": Functions.ignore0(totals.flag_return)},
                "flag_return_base":  { "value": Functions.ignore0(totals.flag_return_base)},
                "flag_return_mid":  { "value": Functions.ignore0(totals.flag_return_mid)},
                "flag_return_enemy_base":  { "value": Functions.ignore0(totals.flag_return_enemy_base)},
                "flag_return_save":  { "value": Functions.ignore0(totals.flag_return_save)},
            };


            data.push(last);
        }
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
            {tables}
        </div>
    }
}

export default MatchCTFSummaryReturns;
