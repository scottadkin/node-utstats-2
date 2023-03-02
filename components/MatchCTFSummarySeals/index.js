import React from 'react';
import Functions from '../../api/functions';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';


class MatchCTFSummarySeals extends React.Component{

    constructor(props){

        super(props);

    }

    renderTeam(teamId){

        const headers = {
            "player": "Player",
            "flag_seal": {
                "title": "Seal", 
                "detailedTitle": "Flag Seal", 
                "content": "Player sealed off their base while a teammate had the flag."
            },
            "flag_seal_pass": {
                "title": "Seal Pass", 
                "detailedTitle": "Flag Seal Pass",
                "content":"Player sealed off their base while a teammate had the flag, and the team capped the flag."
            },
            "flag_seal_fail": {
                "title": "Seal Fail", 
                "detailedTitle": "Flag Seal Fail",
                "content":"Player sealed off their base while a teammate had the flag, but the enemy returned the flag."
            },
            "best_single_seal": {
                "title": "Best Single Seal", 
                "detailedTitle": "Best Single Flag Seal",
                "content":"The most amount of flag seals the player got in a single cap/return."
            },
            "flag_seal_best": {
                "title": "Best Seal Spree", 
                "detailedTitle": "Best Seal Spree", 
                "content": "The most flag seals the player got in a single life."
            }
        };

        const data = [];

        const totals = {
            "flag_seal": 0,
            "flag_seal_pass": 0,
            "flag_seal_fail": 0,
            "best_single_seal":0,
            "flag_seal_best": 0,
        }

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

            let sealString = "";

            if(ctf.best_single_seal > 0){
                sealString = `${ctf.best_single_seal} ${Functions.plural(ctf.best_single_seal, "Kill")}`;
            }

            let bestSealString = "";

            if(ctf.flag_seal_best > 0){
                bestSealString = `${ctf.flag_seal_best} ${Functions.plural(ctf.flag_seal_best, "Kill")}`;
            }


            totals["flag_seal"] += ctf.flag_seal;
            totals["flag_seal_pass"] += ctf.flag_seal_pass;
            totals["flag_seal_fail"] += ctf.flag_seal_fail;

            if(ctf.best_single_seal > totals.best_single_seal){
                totals["best_single_seal"] = ctf.best_single_seal;
            }

            if(ctf.flag_seal_best > totals.flag_seal_best){
                totals["flag_seal_best"] = ctf.flag_seal_best;
            }
          
            data.push({
                "player": {
                    "value": p.name.toLowerCase(), 
                    "displayValue": playerElem,
                    "className": `player ${Functions.getTeamColor(p.team)}`
                },
                "flag_seal": {"value": ctf.flag_seal, "displayValue": Functions.ignore0(ctf.flag_seal)},
                "flag_seal_pass": {"value": ctf.flag_seal_pass, "displayValue": Functions.ignore0(ctf.flag_seal_pass)},
                "flag_seal_fail": {"value": ctf.flag_seal_fail, "displayValue": Functions.ignore0(ctf.flag_seal_fail)},
                "best_single_seal": {"value": ctf.best_single_seal, "displayValue": sealString},
                "flag_seal_best": {"value": ctf.flag_seal_best, "displayValue": bestSealString},


            });
        }

        if(data.length === 0) return null;

        if(!this.props.single){

            data.push({
                "bAlwaysLast": true,
                "player": {
                    "value": "Totals", 
                },
                "flag_seal": {"value": Functions.ignore0(totals.flag_seal)},
                "flag_seal_pass": {"value": Functions.ignore0(totals.flag_seal_pass)},
                "flag_seal_fail": {"value": Functions.ignore0(totals.flag_seal_fail)},
                "best_single_seal": {"value": `${totals.best_single_seal} ${Functions.plural(totals.best_single_seal, "Kill")}`},
                "flag_seal_best": {"value": `${totals.flag_seal_best} ${Functions.plural(totals.flag_seal_best, "Kill")}`},
            });
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

export default MatchCTFSummarySeals;
