import DropDown from "../DropDown";

const PerPageDropDown = ({changeSelected, originalValue}) =>{

    const data = [
        {"displayValue": "5", "value": 5},
        {"displayValue": "10", "value": 10},
        {"displayValue": "25", "value": 25},
        {"displayValue": "50", "value": 50},
        {"displayValue": "75", "value": 75},
        {"displayValue": "100", "value": 100}
    ];
    return <>
        <DropDown 
            data={data}
            dName={"Results Per Page"} 
            changeSelected={changeSelected} 
            originalValue={originalValue}
        />
    </>
}

export default PerPageDropDown;