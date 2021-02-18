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


function display(event, killer, victim, total, total2){

    const box = document.getElementById("mouse-over");
    const title = document.getElementById("mouse-over-title");
    const content = document.getElementById("mouse-over-content");

    box.style.cssText = `display:block;background-color:black;margin-left:${event.pageX + 25}px;margin-top:${event.pageY + 25}px`;

    let titleString = "";
    let contentString = "";

    if(total === '') total = 0;
    if(total2 === '') total2 = 0;

    if(killer === victim){

        titleString = `${killer} Suicides`;

        if(total !== 0){
            contentString = `${killer} suicided ${total} times.`;
        }else{
            contentString = `${killer} did not suicide.`;
        }

    }else{

        titleString = `${killer} vs ${victim}`;

        if(total !== 0){

            let eff = 0;

            if(total > 0 && total2 === 0){

                eff = 100;

            }else if(total !== 0 && total2 !== 0){

                eff = (total / (total + total2)) * 100;
            }

            contentString = `${killer} killed ${victim} ${total} times.<br/>${victim} killed ${killer} ${total2} times. Efficiency ${eff.toFixed(2)}%`;

        }else{
            contentString = `None`;
        }
    }


    title.innerHTML = titleString;
    content.innerHTML = contentString;
}

function hide(){
    const box = document.getElementById("mouse-over");
    box.style.cssText = `display:none;`;
}

const MatchKillsMatchup = ({data, playerNames}) =>{

    data = JSON.parse(data);
    playerNames = JSON.parse(playerNames);
    playerNames.reverse()



    const elems = [];
    let subElems = [];

    const headerElems = [];


    headerElems.push(<th key={`kills-header--1`}>&nbsp;</th>);

    for(let i = 0; i < playerNames.length; i++){

        headerElems.push(<th key={`kills-header-${i}`}><div className={`${styles.key}`}><div className={`${styles.color} ${Functions.getTeamColor(playerNames[i].team)}`}></div>{playerNames[i].name}</div></th>);
    }

    const rowElems = [];
    let columnElems = [];

    let currentKills = 0;

    for(let i = 0; i < playerNames.length; i++){

        columnElems = [];

        for(let x = 0; x < playerNames.length; x++){

            currentKills = getKills(data, playerNames[i].id, playerNames[x].id);

            console.log(currentKills);

            if(i !== x){

                columnElems.push(
                <td key={`km-${i}-${x}`}
                
                onMouseEnter={((e) =>{
                    display(e, playerNames[i].name, playerNames[x].name, getKills(data, playerNames[i].id, playerNames[x].id), getKills(data, playerNames[x].id, playerNames[i].id));
                })}

                onMouseLeave={(() =>{
                    hide();
                })}>

                    {currentKills}

                </td>);

            }else{
                columnElems.push(
                <td key={`km-${i}-${x}`} 
                
                    onMouseEnter={((e) =>{
                        display(e, playerNames[i].name, playerNames[i].name, getKills(data, playerNames[i].id, playerNames[x].id));
                    })}

                    onMouseLeave={(() =>{
                        hide();
                    })}

                className={styles.suicides} key={`kills-row-${i}-${x}`}>

                    {currentKills}
                </td>);

            }
        }

        rowElems.push(<tr key={`kills-row-${i}`}>
            <td><div className={`${styles.color} ${Functions.getTeamColor(playerNames[i].team)}`}></div>{playerNames[i].name}</td>
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