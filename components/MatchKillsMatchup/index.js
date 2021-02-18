import styles from './MatchKillsMatchup.module.css';
import Functions from '../../api/functions';


function getKills(kills, killer, victim){

    let k = 0;
    let total = 0;

    for(let i = 0; i < kills.length; i++){

        k = kills[i];


        if(k.killer == killer && k.victim == victim){
            total++;
        }
    }

    if(total === 0) return '';
    return total;
}

const MatchKillsMatchup = ({data, playerNames}) =>{

    data = JSON.parse(data);
    playerNames = JSON.parse(playerNames);
    playerNames.reverse()
    console.log(data);


    const elems = [];
    let subElems = [];

    /*

    let styleClass = "";
    let currentKills = 0;

    for(let i = -1; i < playerNames.length; i++){

        subElems = [];

        if(i >= 0){

            subElems.push(<div className={styles.tuna}>{playerNames[i].name}</div>);

            for(let x = 0; x < playerNames.length; x++){

                if(x !== i){
                    styleClass = Functions.getTeamColor((playerNames[x] !== undefined) ? playerNames[x].team : -1);
                }else{
                    styleClass = "team-none";
                }

                currentKills = getKills(data, playerNames[i].id, playerNames[x].id);
                subElems.push(<div className={`${styles.data} ${styleClass}`}>{(currentKills > 0) ? currentKills : '.'}</div>);
            }
        }else{
            subElems.push(<div>&nbsp;</div>);
            for(let x = 0; x < playerNames.length; x++){
                subElems.push(<div className={Functions.getTeamColor((playerNames[x] !== undefined) ? playerNames[x].team : -1)}>{playerNames[x].name}</div>);
            }
        }

        elems.push(<div className={`${(i >= 0) ? styles.potato : styles.first} `}>
            <div className={`${styles.values} ${Functions.getTeamColor((playerNames[i] !== undefined) ? playerNames[i].team : -1)}`}>{subElems}</div>
        </div>);
    }



    return (<div className={styles.wrapper}>
        <div className="default-header">Kill Match Up</div>
        {elems}
    </div>);

    */
    const headerElems = [];


    headerElems.push(<th key={`kills-header--1`}>&nbsp;</th>);

    for(let i = 0; i < playerNames.length; i++){

        headerElems.push(<th key={`kills-header-${i}`}><div className={`${styles.key} ${Functions.getTeamColor(playerNames[i].team)}`}>{playerNames[i].name}</div></th>);
    }

    const rowElems = [];
    let columnElems = [];

    for(let i = 0; i < playerNames.length; i++){

        columnElems = [];

        for(let x = 0; x < playerNames.length; x++){

            if(i !== x){
                columnElems.push(<td className={Functions.getTeamColor(playerNames[i].team)} key={`kills-row-${i}-${x}`}>{getKills(data, playerNames[i].id, playerNames[x].id)}</td>);
            }else{
                columnElems.push(<td className={styles.suicides} key={`kills-row-${i}-${x}`}>{getKills(data, playerNames[i].id, playerNames[x].id)}</td>);
            }
        }

        rowElems.push(<tr key={`kills-row-${i}`}>
            <td className={Functions.getTeamColor(playerNames[i].team)}>{playerNames[i].name}</td>
            {columnElems}
        </tr>);
    }

    return (<div className={styles.table}>
        <div className="default-header">
            Kills Match Up
        </div>
        <table>
            <tbody>
                <tr>
                    {headerElems}
                </tr>
                {rowElems}
            </tbody>
        </table>
    </div>);
}

export default MatchKillsMatchup