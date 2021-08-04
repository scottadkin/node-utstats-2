import Functions from "../../../api/functions";
import CountryFlag from "../../CountryFlag"; 
import Link from 'next/link';

function bAnySprees(data){

    const sprees = ["kill", "rampage", "dom", "uns", "god"];
    
    for(let i = 0; i < sprees.length; i++){

        if(data[`spree_${sprees[i]}`] > 0) return true; 
    }

    return false;
}

function bAnyMultis(data){

    const multis = ["double", "multi", "ultra", "monster"];

    for(let i = 0; i < multis.length; i++){

        if(data[`spree_${multis[i]}`] > 0) return true;
    }

    return false;
}

const TeamTable = ({teamId, players, bSpree}) =>{

    const rows = [];

    let p = 0;

    const teamColor = Functions.getTeamColor(teamId);

    const totals = {
        "double": 0,
        "multi": 0,
        "ultra": 0,
        "monster": 0,
        "spree": 0,
        "rampage": 0,
        "dominating": 0,
        "unstoppable": 0,
        "godlike": 0
    };

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(teamId === -1 || teamId === p.team){

            if(!bSpree){

                if(bAnyMultis(p)){


                    totals.double += p.spree_double;
                    totals.multi += p.spree_multi;
                    totals.ultra += p.spree_ultra;
                    totals.monster += p.spree_monster;

                    rows.push(<tr key={i}>
                        <td className={teamColor}><Link href={`/classic/pmatch/${p.pid}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>
                        <td>{Functions.ignore0(p.spree_double)}</td>
                        <td>{Functions.ignore0(p.spree_multi)}</td>
                        <td>{Functions.ignore0(p.spree_ultra)}</td>
                        <td>{Functions.ignore0(p.spree_monster)}</td>
                    </tr>);  
                }

            }else{

                if(bAnySprees(p)){

                    totals.spree += p.spree_kill;
                    totals.rampage += p.spree_rampage;
                    totals.dominating += p.spree_dom;
                    totals.unstoppable += p.spree_uns;
                    totals.godlike += p.spree_god;

                    rows.push(<tr key={i}>
                        <td className={teamColor}><Link href={`/classic/pmatch/${p.pid}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>
                        <td>{Functions.ignore0(p.spree_kill)}</td>
                        <td>{Functions.ignore0(p.spree_rampage)}</td>
                        <td>{Functions.ignore0(p.spree_dom)}</td>
                        <td>{Functions.ignore0(p.spree_uns)}</td>
                        <td>{Functions.ignore0(p.spree_god)}</td>
                    </tr>);
                }
            }
        }
    }


    if(rows.length > 1){

        if(!bSpree){

            rows.push(<tr key={`totals-multi-${teamId}`}>
                <td>Totals</td>
                <td>{Functions.ignore0(totals.double)}</td>
                <td>{Functions.ignore0(totals.multi)}</td>
                <td>{Functions.ignore0(totals.ultra)}</td>
                <td>{Functions.ignore0(totals.monster)}</td>
            </tr>);

        }else{

            rows.push(<tr key={`totals-spree-${teamId}`}>
                <td>Totals</td>
                <td>{Functions.ignore0(totals.spree)}</td>
                <td>{Functions.ignore0(totals.rampage)}</td>
                <td>{Functions.ignore0(totals.dominating)}</td>
                <td>{Functions.ignore0(totals.unstoppable)}</td>
                <td>{Functions.ignore0(totals.godlike)}</td>
            </tr>);

        }
    }

    let headers = <tr>
        <th>Player</th>
        <th>Double Kill</th>
        <th>Multi Kill</th>
        <th>Ultra Kill</th>
        <th>Monster Kill</th>
    </tr>;

    if(bSpree){
        headers = <tr>
            <th>Player</th>
            <th>Killing Spree</th>
            <th>Rampage</th>
            <th>Dominating</th>
            <th>Unstoppable</th>
            <th>Godlike</th>
        </tr>
    }

    if(rows.length === 0) return null;

    return <table className="t-width-1 td-1-left td-1-150 m-bottom-25">
        <tbody>
            {headers}
            {rows}
        </tbody>
    </table>
}

const MatchSpecialEvents = ({data, teams}) =>{

    const tables = [];

    if(teams < 2){

        tables.push(<TeamTable key={-1} teamId={-1} players={data} bSpree={false}/>);
        tables.push(<TeamTable key={-1} teamId={-1} players={data} bSpree={true}/>);
    }else{

        for(let i = 0; i < teams; i++){
            tables.push(<TeamTable key={`${i}-m`} teamId={i} players={data} bSpree={false}/>);
        }

        for(let i = 0; i < teams; i++){
            tables.push(<TeamTable key={`${i}-m`} teamId={i} players={data} bSpree={true}/>);
        }
    }

    return <div>
        <div className="default-header">Special Events</div>
        {tables}
    </div>

}


export default MatchSpecialEvents;