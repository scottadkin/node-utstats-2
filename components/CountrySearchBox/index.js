import { useEffect, useReducer } from "react";
import Countries from "../../api/countries";
import DropDown from "../DropDown";
import CountryFlag from "../CountryFlag";

const reducer = (state, action) =>{

    switch(action.type){
        case "set-search":{
            return {
                ...state,
                "searchTerm": action.value
            }
        }
    }
    return state;
}

const renderList = (state, changeSelected, selectedValue) =>{

    let searchTerm = "";

    if(state.searchTerm !== null){
        searchTerm = state.searchTerm.toLowerCase();
    }

    //if(searchTerm === "") return null;

    const list = Countries("all");

    const filtered = [
        //{"value": "", "name": "Please select a value"}
    ];

    let selected = null;

    for(const [code, name] of Object.entries(list)){

        if(code.toUpperCase() === selectedValue){
            selected = {"code": (code === "UK") ? "gb" : code, "name": name};
            continue;
        }

        if(name.toLowerCase().indexOf(searchTerm) !== -1){
            filtered.push({"code": (code === "UK") ? "gb" : code, "name": name});
        }
    }


    if(filtered.length === 0){

        if(state.selectedValue === ""){
            return <div className="form-row">
                <div className="form-label">Selected Country</div>
                <input type="text" className="default-textbox" value="No results found..." disabled/>
            </div>
        }
    }

    if(selected !== null){
        filtered.unshift(selected);
    }
    

    const options = filtered.map((f) =>{
        return {"name": f.name.toLowerCase(),"value": f.code, "displayValue": <><CountryFlag country={f.code}/>{f.name}</>}
    });


    options.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    if(selectedValue === ""){
        options.unshift({"value": "", "displayValue": <>None</>});
    }

    return <>
        <DropDown dName="Selected Country" data={options} selectedValue={selectedValue} changeSelected={(key,value) =>{ changeSelected(value)}}/>
    </>
}

const CountrySearchBox = ({changeSelected, selectedValue, searchTerm}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "searchTerm": searchTerm,
    });


    useEffect(() =>{
        dispatch({"type": "set-search", "value": searchTerm});
    },[searchTerm]);



    return <>
        <div className="form-row">
            <div className="form-label">Filter Countries</div>
            <input type="text" className="default-textbox" value={state.searchTerm} onChange={(e) =>{
                dispatch({"type": "set-search", "value": e.target.value});
            }}/>
        </div>
        {renderList(state, changeSelected, selectedValue)}
    </>
}

export default CountrySearchBox;