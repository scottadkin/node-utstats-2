import { BasicTable } from "../Tables";

export default function PlayerADSummary({data}){

    const targets = ["assault_objectives", "dom_caps", "dom_caps_best", "dom_caps_best_life"];

    let bFoundData = false;

    for(let i = 0; i < targets.length; i++){

        if(data[targets[i]] > 0){
            bFoundData = true;
            break;
        }
    }

    if(!bFoundData) return null;

    const headers = [
        "Assault Objectives Captured",
        "Dom Control Point Caps",
        "Most Dom Control Point Caps",
        "Most Dom Control Point Caps Life"
    ];

    const rows = [
        data.assault_objectives,
        data.dom_caps,
        data.dom_caps_best,
        data.dom_caps_best_life
    ];


    return <>
        <div className="default-header">Assault &amp; Domination</div>
        <BasicTable headers={headers} rows={[rows]}/>
    </>
}