import { BasicTable } from "../Tables"

export default function PlayerMonsterHuntStats({data}){

    const headers = [
        "Total Kills", "Most Kills In A Match", "Most Kills In A Single Life",
        "Total Deaths To Monsters", "Most Deaths In A Match", "Kill:Death Ratio"
    ];

    let kd = 0;

    if(data.mh_kills > 0){

        if(data.mh_deaths === 0){
            kd = "∞";
        }else{
            kd = data.mh_kills / data.mh_deaths;
        }
    }

    const row = [
        data.mh_kills,
        data.mh_kills_best,
        data.mh_kills_best_life,
        data.mh_deaths,
        data.mh_deaths_worst,
        kd
    ];


    return <>
        <div className="default-header">Monsterhunt Stats</div>
        <BasicTable width={1} headers={headers} rows={[row]} />
    </>
}
