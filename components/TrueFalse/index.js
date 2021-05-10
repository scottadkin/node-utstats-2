const TrueFalse = ({bTable, value, tDisplay, fDisplay}) =>{

    if(tDisplay === undefined) tDisplay = "True";
    if(fDisplay === undefined) fDisplay = "False";

    let className = "team-red";
    let text = fDisplay;

    if(value){
        className = "team-green";
        text = tDisplay;
    }

    
    

    if(bTable){
        return <td className={className}>
            {text}
        </td>
    }else{
        return <div className={className}>
            {text}
        </div>
    }
}

export default TrueFalse;