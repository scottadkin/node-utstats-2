export default function Checkbox({name, value, setValue, bTableElem}){


    const className = (value) ? "team-green" : "team-red";
    const text = (value) ? "True" : "False";
    if(bTableElem === undefined) bTableElem = false;

    if(bTableElem){

        return <td className={`checkbox-table ${className}`} onClick={() =>{
   
        if(setValue !== undefined){
            setValue(!value);
        }
    }}>
        {text}
        <input type="hidden" name={name} value={value}/>
    </td>
    }

    return <div className={`checkbox ${className}`} onClick={() =>{
   
        if(setValue !== undefined){
            setValue(!value);
        }
    }}>
        {text}
        <input type="hidden" name={name} value={value}/>
    </div>
}