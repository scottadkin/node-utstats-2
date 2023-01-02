import React from 'react';
import Functions from '../../api/functions';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';


class MatchCTFSummaryDefault extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 1};
    }

    /**
     * 
     *           <TipHeader title="Pickup" content="Player picked up the flag that was dropped by a team mate." />
                <TipHeader title="Dropped" content="Player dropped the enemy flag." />
                <TipHeader title="Assist" content="Player had carried the flag that was later capped." />
                <TipHeader title="Cover" content="Player covered their team mate that had the enemy flag." />
                <TipHeader title="Seal" content="Player sealed off the base while flag was taken." />
                <TipHeader title="Capture" content="Player capped the enemy flag scoring a point for their team." />
                <TipHeader title="Kill" content="Player killed an enemy that was carrying their team's flag." />
                <TipHeader title="Return" content="Player returned their flag that was dropped by an enemy." />
                <TipHeader title="Close Return" content="Player returned their flag that was dropped by an enemy, that was close to being capped." />} teamId 
     *
     */

    renderTeam(teamId){

        const headers = {
            "player": "Player",
            "flag_taken": {"title": "Taken", "content": "Player took the flag from the enemy team's flag stand."},
            "flag_pickup": {"title": "Pickup", "content":"Player picked up the flag that was dropped by a team mate."},
            "flag_dropped":	{"title":"Dropped", "content": "Player dropped the enemy flag."},//	Assist	Cover	Seal	Capture	Kill	Return	Close Return
            "flag_suicide":	{"title": "Suicide", "content": "Player killed themself while carrying the flag."},
            "flag_assist": {"title":"Assist", "content": "Player had carried the flag that was later capped."},
            "flag_cover": {"title":"Cover", "content": "Player covered their team mate that had the enemy flag."},
            "flag_seal": {"title": "Seal", "content": "Player sealed off the base while flag was taken."},
            "flag_capture": {"title": "Capture", "content": "Player capped the enemy flag scoring a point for their team."},
            "flag_kill": {"title":"Kill", "content": "Player killed an enemy that was carrying their team's flag."},
            "flag_return": {"title": "Return", "content":"Player returned their flag that was dropped by an enemy."},
            "flag_return_save": {"title": "Close Return", "content": "Player returned their flag that was dropped by an enemy, that was close to being capped."},
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
            {tables}
        </div>
    }
}

export default MatchCTFSummaryDefault;

/*

const MatchCTFSummaryDefault = ({host, players, team, matchId}) =>{


    const elems = [];

    let p = 0;

    let totals = {
        "taken": 0,
        "pickup": 0,
        "dropped": 0,
        "assist": 0,
        "cover": 0,
        "capture": 0,
        "kill": 0,
        "return": 0,
        "save": 0,
        "seal": 0
    };

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(!bAnyData(p)) continue;

        totals.taken += p.flag_taken;
        totals.pickup += p.flag_pickup;
        totals.dropped += p.flag_dropped;
        totals.assist += p.flag_assist;
        totals.capture += p.flag_capture;
        totals.cover += p.flag_cover;
        totals.kill += p.flag_kill;
        totals.return += p.flag_return;
        totals.save += p.flag_save;
        totals.seal += p.flag_seal;

        elems.push(<tr  key={i}>
            <td className={`text-left name-td ${Functions.getTeamColor(team)}`}><CountryFlag host={host} country={p.country}/>
            <Link href={`/pmatch/${matchId}?player=${p.player_id}`}><a>{p.name}</a></Link>
            </td>
            <td>{Functions.ignore0(p.flag_taken)}</td>
            <td>{Functions.ignore0(p.flag_pickup)}</td>
            <td>{Functions.ignore0(p.flag_dropped)}</td>
            <td>{Functions.ignore0(p.flag_assist)}</td>
            <td>{Functions.ignore0(p.flag_cover)}</td>
            <td>{Functions.ignore0(p.flag_seal)}</td>
            <td>{Functions.ignore0(p.flag_capture)}</td>
            <td>{Functions.ignore0(p.flag_kill)}</td>
            <td>{Functions.ignore0(p.flag_return)}</td>
            <td>{Functions.ignore0(p.flag_save)}</td>
    
        </tr>);
    }

    if(elems.length === 0){
        return <div></div>;
    }

    elems.push(<tr key={`totals`}>
            <td className="text-left">Totals</td>
            <td>{totals.taken}</td>
            <td>{totals.pickup}</td>
            <td>{totals.dropped}</td>
            <td>{totals.assist}</td>
            <td>{totals.cover}</td>
            <td>{totals.seal}</td>
            <td>{totals.capture}</td>
            <td>{totals.kill}</td>
            <td>{totals.return}</td>
            <td>{totals.save}</td>

    
        </tr>);
    
    
    

    return <Table2 width={1} players={1}>
            <tr>
                <th>Player</th>
                <TipHeader title="Taken" content="Player took the flag from the enemy team's flag stand." />
                <TipHeader title="Pickup" content="Player picked up the flag that was dropped by a team mate." />
                <TipHeader title="Dropped" content="Player dropped the enemy flag." />
                <TipHeader title="Assist" content="Player had carried the flag that was later capped." />
                <TipHeader title="Cover" content="Player covered their team mate that had the enemy flag." />
                <TipHeader title="Seal" content="Player sealed off the base while flag was taken." />
                <TipHeader title="Capture" content="Player capped the enemy flag scoring a point for their team." />
                <TipHeader title="Kill" content="Player killed an enemy that was carrying their team's flag." />
                <TipHeader title="Return" content="Player returned their flag that was dropped by an enemy." />
                <TipHeader title="Close Return" content="Player returned their flag that was dropped by an enemy, that was close to being capped." />
            </tr>
            {elems}
    </Table2>
}

export default MatchCTFSummaryDefault;*/