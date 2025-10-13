import { BasicTable } from "../Tables";

export default function PlayerADSummary({data}){

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