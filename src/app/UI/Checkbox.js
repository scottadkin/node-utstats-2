export default function Checkbox({name, value, setValue}){


    const className = (value) ? "team-green" : "team-red";
    const text = (value) ? "True" : "False";

    return <div className={`checkbox ${className}`} onClick={() =>{
   
        if(setValue !== undefined){
            setValue(!value);
        }
    }}>
        {text}
        <input type="hidden" name={name} value={value}/>
    </div>
}