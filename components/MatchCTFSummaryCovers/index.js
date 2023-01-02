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

        /*
        <th>Player</th>
                <TipHeader title="Cover" content="Player killed an enemy close to their flag carrier."/>
                <TipHeader title="Cover Pass" content="Player killed an enemy close to their flag carrier, where the team later capped the flag."/>
                <TipHeader title="Cover Fail" content="Player killed an enemy close to their flag carrier, where the enemy team returned the flag."/>
                <TipHeader title="Cover Efficiency" content="The efficiency of the player's covers."/>
                <TipHeader title="Multi Cover" content="Player covered 3 people while their team had the enemy flag."/>
                <TipHeader title="Cover Spree" content="Player covered 4 or more people while their team had the enemy flag."/>
                <TipHeader title="Best Covers" content="The most people the player covered while their team had the enemy flag."/>
                <TipHeader title="Self Covers" content="How many people the player killed while carrying the flag."/>
                <TipHeader title="Self Covers Pass" content="How many people the player killed while carrying the flag, where the team capped the flag."/>
                <TipHeader title="Self Covers Fail" content="How many people the player killed while carrying the flag, where the enemy team returned the flag."/> */

        const headers = {
            "player": "Player",
            "flag_cover": {"title": "Cover", "content": "Player killed an enemy close to their flag carrier."},
            "flag_cover_pass": {"title": "Cover Pass", "content": "Player killed an enemy close to their flag carrier, where the team later capped the flag."},
            "flag_cover_fail": {"title": "Cover Fail", "content": "Player killed an enemy close to their flag carrier, where the enemy team returned the flag."},
            "flag_seal": {"title": "Seal", "content": "Player Sealed off their base."},
            "flag_seal_pass": {"title": "Seal Pass", "content": "Player Sealed off their base and the flag was capped"},
            "flag_seal_fail": {"title": "Seal Fail", "content": "Player Sealed off their base, but the flag was returned."},
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
                "flag_cover":  {"value": ctf.flag_cover , "displayValue": Functions.ignore0(ctf.flag_cover)},
                "flag_cover_pass":  {"value": ctf.flag_cover_pass , "displayValue": Functions.ignore0(ctf.flag_cover_pass)},
                "flag_cover_fail":  {"value": ctf.flag_cover_fail , "displayValue": Functions.ignore0(ctf.flag_cover_fail)},
                "flag_seal":  {"value": ctf.flag_seal , "displayValue": Functions.ignore0(ctf.flag_seal)},
                "flag_seal_pass":  {"value": ctf.flag_seal_pass , "displayValue": Functions.ignore0(ctf.flag_seal_pass)},
                "flag_seal_fail":  {"value": ctf.flag_seal_fail , "displayValue": Functions.ignore0(ctf.flag_seal_fail)},

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
            {tables}
        </div>
    }
}

export default MatchCTFSummaryCovers;

/*
const MatchCTFSummaryCovers = ({host, players, team, matchId}) =>{


    const elems = [];
    let p = 0;
    let coverEff = 0;

    const totals = {
        "cover": 0,
        "coverPass": 0,
        "coverFail": 0,
        "multiCover": 0,
        "spreeCover": 0,
        "coverBest": 0,
        "selfCover": 0,
        "selfCoverPass": 0,
        "selfCoverFail": 0,
    };

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(!bAnyData(p)) continue;

        if(p.flag_cover_pass != 0){

            if(p.flag_cover_fail === 0){
                coverEff = 100;
            }else{
                coverEff = ((p.flag_cover_pass / p.flag_cover) * 100).toFixed(2);
            }
        }else{
            coverEff = 0;
        }


        totals.cover += p.flag_cover;
        totals.coverPass += p.flag_cover_pass;
        totals.coverFail += p.flag_cover_fail;
        totals.multiCover += p.flag_multi_cover;
        totals.spreeCover += p.flag_spree_cover;
        totals.selfCover += p.flag_self_cover;
        totals.selfCoverPass += p.flag_self_cover_pass;
        totals.selfCoverFail += p.flag_self_cover_fail;

        if(p.flag_cover_best > totals.coverBest) totals.coverBest = p.flag_cover_best

        elems.push(<tr key={i}>
            <td className={`text-left name-td ${Functions.getTeamColor(team)}`}>
                <CountryFlag host={host} country={p.country} /><Link href={`/pmatch/${matchId}?player=${p.player_id}`}><a>{p.name}</a></Link></td>
            <td>{Functions.ignore0(p.flag_cover)}</td>
            <td>{Functions.ignore0(p.flag_cover_pass)}</td>
            <td>{Functions.ignore0(p.flag_cover_fail)}</td>
            <td>{coverEff}%</td>
            <td>{Functions.ignore0(p.flag_multi_cover)}</td>
            <td>{Functions.ignore0(p.flag_spree_cover)}</td>
            <td>{Functions.ignore0(p.flag_cover_best)}</td>
            <td>{Functions.ignore0(p.flag_self_cover)}</td>
            <td>{Functions.ignore0(p.flag_self_cover_pass)}</td>
            <td>{Functions.ignore0(p.flag_self_cover_fail)}</td>
        </tr>);
    }


    coverEff = 0;

    if(totals.coverPass !== 0){

        if(totals.coverFail === 0){
            coverEff = 100;
        }else{
            coverEff = ((totals.coverPass / totals.cover) * 100).toFixed(2);
        }
    }

    if(elems.length === 0) return <div></div>

    elems.push(<tr key="total">
            <td className="text-left">Totals</td>
            <td>{Functions.ignore0(totals.cover)}</td>
            <td>{Functions.ignore0(totals.coverPass)}</td>
            <td>{Functions.ignore0(totals.coverFail)}</td>
            <td>{coverEff}%</td>
            <td>{Functions.ignore0(totals.multiCover)}</td>
            <td>{Functions.ignore0(totals.spreeCover)}</td>
            <td>{Functions.ignore0(totals.coverBest)}</td>
            <td>{Functions.ignore0(totals.selfCover)}</td>
            <td>{Functions.ignore0(totals.selfCoverPass)}</td>
            <td>{Functions.ignore0(totals.selfCoverFail)}</td>
        </tr>);


    return <Table2 width={1} players={true}>
                <tr>
                <th>Player</th>
                <TipHeader title="Cover" content="Player killed an enemy close to their flag carrier."/>
                <TipHeader title="Cover Pass" content="Player killed an enemy close to their flag carrier, where the team later capped the flag."/>
                <TipHeader title="Cover Fail" content="Player killed an enemy close to their flag carrier, where the enemy team returned the flag."/>
                <TipHeader title="Cover Efficiency" content="The efficiency of the player's covers."/>
                <TipHeader title="Multi Cover" content="Player covered 3 people while their team had the enemy flag."/>
                <TipHeader title="Cover Spree" content="Player covered 4 or more people while their team had the enemy flag."/>
                <TipHeader title="Best Covers" content="The most people the player covered while their team had the enemy flag."/>
                <TipHeader title="Self Covers" content="How many people the player killed while carrying the flag."/>
                <TipHeader title="Self Covers Pass" content="How many people the player killed while carrying the flag, where the team capped the flag."/>
                <TipHeader title="Self Covers Fail" content="How many people the player killed while carrying the flag, where the enemy team returned the flag."/>
            </tr>
        {elems}
    </Table2>
}*/
