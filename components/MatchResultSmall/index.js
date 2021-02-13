import Functions from '../../api/functions';
import styles from './MatchResultSmall.module.css'

const MatchResultSmall = ({totalTeams, dmWinner, dmScore, redScore, blueScore, greenScore, yellowScore}) =>{


    if(dmWinner !== ''){
        return (<div className={`${styles.wrapper} solo`}><div className="team-none">{dmWinner}({dmScore})</div></div>);
    }

    let wrapperClass = "solo";


    switch(totalTeams){
        case 2: {   wrapperClass = "duo"; } break;
        case 3: {   wrapperClass = "trio"; } break;
        case 4: {   wrapperClass = "quad"; } break;
    }

    const elems = [];

    elems.push(<div key={"red"}>{redScore}</div>);
    elems.push(<div key={"blue"}>{blueScore}</div>);

    if(totalTeams > 2){
        elems.push(<div key={"green"}>{greenScore}</div>);
        if(totalTeams > 3){
            elems.push(<div key={"yellow"}>{yellowScore}</div>);
        }
    }

    return (<div className={`${styles.wrapper} ${wrapperClass}`}>{elems}</div>);

}

export default MatchResultSmall;