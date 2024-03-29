import React from 'react';
import Functions from '../../api/functions';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';


class MatchCTFSummaryCovers extends React.Component{

    constructor(props){

        super(props);

    }

    renderTeam(teamId){

        const headers = {
            "player": "Player",
            "flag_cover": {
                "title": "Cover", 
                "detailedTitle": "Flag Cover", 
                "content": "Player killed an enemy close to their flag carrier."
            },
            "flag_cover_pass": {
                "title": "Cover Pass", 
                "detailedTitle": "Flag Cover Pass", 
                "content": "Player killed an enemy close to their flag carrier, where the team later capped the flag."
            },
            "flag_cover_fail": {
                "title": "Cover Fail", 
                "detailedTitle": "Flag Cover Fail", 
                "content": "Player killed an enemy close to their flag carrier, where the enemy team returned the flag."
            },
            "flag_cover_multi": {
                "title": "Multi Cover", 
                "detailedTitle": "Multi Flag Cover", 
                "content": "Player covered the flag carrier 3 times in a single cap."
            },
            "flag_cover_spree": {
                "title": "Cover Spree", 
                "detailedTitle": "Flag Cover Spree", 
                "content": "Player covered the flag carrier at least 4 times in a single cap."
            },
            "best_single_cover": {
                "title": "Best Cover", 
                "detailedTitle": "Best Flag Cover", 
                "content": "The most covers the player got in a single cap."
            },
            "flag_self_cover": {
                "title": "Self Cover", 
                "detailedTitle": "Flag Self Cover", 
                "content": "The player killed an enemy while carrying the flag."
            },
            "flag_self_cover_pass": {
                "title": "Self Cover Pass", 
                "detailedTitle": "Flag Self Cover Pass", 
                "content": "The player killed an enemy while carrying the flag, and the team capped the flag."
            },
            "flag_self_cover_fail": {
                "title": "Self Cover Fail", 
                "detailedTitle": "Flag Self Cover Fail", 
                "content": "The player killed an enemy while carrying the flag, but the flag was returned."
            },
        };

        const data = [];

        const totalKeys = [
            "flag_cover",
            "flag_cover_pass",
            "flag_cover_fail",
            "flag_cover_multi",
            "flag_cover_spree",
            "flag_self_cover",
            "flag_self_cover_pass",
            "flag_self_cover_fail",
        ];

        const totals = {
            "best_single_cover":  0,
        };

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            if(p.team !== teamId) continue;

            const ctf = p.ctfData;

            const playerElem = <Link href={`/pmatch/${this.props.matchId}?player=${p.player_id}`}>
                
                <CountryFlag country={p.country}/>
                {p.name}
                
            </Link>;

            for(let k = 0; k < totalKeys.length; k++){

                if(totals[totalKeys[k]] === undefined){
                    totals[totalKeys[k]] = 0;
                }

                totals[totalKeys[k]] += ctf[totalKeys[k]];
            }

            if(ctf.best_single_cover > totals.best_single_cover){
                totals.best_single_cover = ctf.best_single_cover;
            }
          

            let bestCoverString = "";

            if(ctf.best_single_cover > 0){
                bestCoverString = `${ctf.best_single_cover} ${Functions.plural(ctf.best_single_cover, "Kill")}`;
            }

            data.push({
                "player": {
                    "value": p.name.toLowerCase(), 
                    "displayValue": playerElem,
                    "className": `player ${Functions.getTeamColor(p.team)}`
                },
                "flag_cover":  {"value": ctf.flag_cover , "displayValue": Functions.ignore0(ctf.flag_cover)},
                "flag_cover_pass":  {"value": ctf.flag_cover_pass , "displayValue": Functions.ignore0(ctf.flag_cover_pass)},
                "flag_cover_fail":  {"value": ctf.flag_cover_fail , "displayValue": Functions.ignore0(ctf.flag_cover_fail)},
                "flag_cover_multi":  {"value": ctf.flag_cover_multi , "displayValue": Functions.ignore0(ctf.flag_cover_multi)},
                "flag_cover_spree":  {"value": ctf.flag_cover_spree , "displayValue": Functions.ignore0(ctf.flag_cover_spree)},
                "best_single_cover":  {"value": ctf.best_single_cover , "displayValue": bestCoverString},
                "flag_self_cover":  {"value": ctf.flag_self_cover , "displayValue": Functions.ignore0(ctf.flag_self_cover)},
                "flag_self_cover_pass":  {"value": ctf.flag_self_cover_pass , "displayValue": Functions.ignore0(ctf.flag_self_cover_pass)},
                "flag_self_cover_fail":  {"value": ctf.flag_self_cover_fail , "displayValue": Functions.ignore0(ctf.flag_self_cover_fail)},

            });
        }

        if(data.length === 0) return null;

        if(!this.props.single){
            data.push({
                "bAlwaysLast": true,
                "player": {
                    "value": "Totals", 
                },
                "flag_cover":  {"value": Functions.ignore0(totals.flag_cover) },
                "flag_cover_pass":  {"value": Functions.ignore0(totals.flag_cover_pass) },
                "flag_cover_fail":  {"value": Functions.ignore0(totals.flag_cover_fail) },
                "flag_cover_multi":  {"value": Functions.ignore0(totals.flag_cover_multi) },
                "flag_cover_spree":  {"value": Functions.ignore0(totals.flag_cover_spree)},
                "best_single_cover":  {"value": `${totals.best_single_cover} ${Functions.plural(totals.best_single_cover, "Kill")}`},
                "flag_self_cover":  {"value": Functions.ignore0(totals.flag_self_cover)},
                "flag_self_cover_pass":  {"value": Functions.ignore0(totals.flag_self_cover_pass)},
                "flag_self_cover_fail":  {"value": Functions.ignore0(totals.flag_self_cover_fail)},

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

export default MatchCTFSummaryCovers;

