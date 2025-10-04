import CustomGraph from "../CustomGraph";
import { scalePlaytime, MMSS } from "../../../../api/generic.mjs";

function createLabels(labels, startTimestamp, bHardcore){

    return labels.map((d) =>{
        return MMSS(scalePlaytime(d - startTimestamp, bHardcore));
    });
}

export default function MatchFragsGraph({matchId, players, teams, bHardcore, startTimestamp, data}){

    if(data === null) return null;

    const tabs = [
        {"name": "Kills", "title": "Kills"},
        {"name": "Deaths", "title": "Deaths"},
        {"name": "Suicides", "title": "Suicides"},
        {"name": "Team Kills", "title": "Team Kills"},
        {"name": "Efficiency", "title": "Efficiency"},
    ];

    const labels = [
        createLabels(data.kills.labels, startTimestamp, bHardcore), 
        createLabels(data.deaths.labels, startTimestamp, bHardcore), 
        createLabels(data.suicides.labels, startTimestamp, bHardcore), 
        createLabels(data.teammateKills.labels, startTimestamp, bHardcore), 
        createLabels(data.efficiency.labels, startTimestamp, bHardcore), 
    ];

    const labelsPrefix = [
        "Kills at ",
        "Deaths at ",
        "Suicides at ",
        "Teammate Kills at ",
        "Efficiency at ",
    ]

    const graphData = [
        data.kills.data, 
        data.deaths.data, 
        data.suicides.data, 
        data.teammateKills.data, 
        data.efficiency.data
    ];


    if(teams > 1){

        tabs.push({"name": "Team Kills", "title": "Team Total Kills"},
        {"name": "Team Deaths", "title": "Team Total Deaths"},
        {"name": "Team Suicides", "title": "Team Total Suicides"},
        {"name": "Teammate Kills", "title": "Total Teammate Kills"},
        {"name": "Team Efficiency", "title": "Team Efficiency"});

        const teamsData = [
            data.teamKills.data, 
            data.teamDeaths.data, 
            data.teamSuicides.data, 
            data.teamsTeammateKills.data,
            data.teamEfficiency.data
        ];

        const teamsLabels = [
            createLabels(data.teamKills.labels),
            createLabels(data.teamDeaths.labels),
            createLabels(data.teamSuicides.labels),
            createLabels(data.teamsTeammateKills.labels),
            createLabels(data.teamEfficiency.labels),
        ];

        labelsPrefix.push("Team Total Kills ");
        labelsPrefix.push("Team Total Deaths ");
        labelsPrefix.push("Team Total Suicides ");
        labelsPrefix.push("Team Total TeamKills ");
        labelsPrefix.push("Team Total Efficiency ");

        graphData.push(...teamsData);
        labels.push(...teamsLabels);
    }

    const testData = {
        "data": graphData,
        "labels": labels,
        "labelsPrefix": labelsPrefix
    };


    return <div>
        <div className="default-header">Frags Graph</div>
        <CustomGraph data={testData.data} tabs={tabs} labels={testData.labels} labelsPrefix={testData.labelsPrefix}/>     
    </div>

}
