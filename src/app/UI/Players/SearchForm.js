"use client"
//import Countires from "../../../../api/countries";
import { orderedCountriesArray } from "../../../../api/countries";
import { useRouter } from "next/navigation";

function getCountryOptions(selectedValue){

    const countryList = orderedCountriesArray(); //Countires("ALL");

    const options = [
        <option key={-1} value={""}>Any Country</option>
    ];

    for(let i = 0; i < countryList.length; i++){

        const {code, name} = countryList[i];

        let fixedKey = code.toLowerCase();

        if(fixedKey === "uk") fixedKey = "gb";

        if(selectedValue === name){
            options.push(<option selected key={options.length - 1} value={fixedKey}>{name}</option>);
        }else{
            options.push(<option key={options.length - 1} value={fixedKey}>{name}</option>);
        }
    }

    return options;
}

export default function SearchForm({name, country, active, sortBy, perPage, order}){

    const router = useRouter();

    return <form className="form" onSubmit={(e) =>{
        e.preventDefault();
    }}>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input className="default-textbox" defaultValue={name} placeholder="player name..." type="text" id="name" onChange={(e) =>{
                router.push(`/players?name=${e.target.value}&country=${country}&active=${active}&sb=${sortBy}&pp=${perPage}&o=${order}`);
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="country">Country</label>
            <select id={"country"} defaultValue={country} className="default-select" onChange={(e) =>{
                router.push(`/players?name=${name}&country=${e.target.value}&active=${active}&sb=${sortBy}&pp=${perPage}&o=${order}`);
            }}>{getCountryOptions(country)}</select>
        </div>
        <div className="form-row">
            <label htmlFor="active">Active</label>
            <select id="active" defaultValue={active} className="default-select" onChange={(e) =>{
                router.push(`/players?name=${name}&country=${country}&active=${e.target.value}&sb=${sortBy}&pp=${perPage}&o=${order}`);
            }}>
                <option value="0">All Time</option>
                <option value="1">Past 24 Hours</option>
                <option value="2">Past 7 Days</option>
                <option value="3">Past 28 Days</option>
                <option value="4">Past Year</option>
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="sort">Sort By</label>
            <select id="sort" className="default-select" onChange={(e) =>{
                router.push(`/players?name=${name}&country=${country}&active=${active}&sb=${e.target.value}&pp=${perPage}&o=${order}`);
            }}>
                <option value="name">Name</option>
                <option value="playtime">Playtime</option>
                <option value="matches">Matches Played</option>
                <option value="score">Score</option>
                <option value="kills">Kills</option>
                <option value="last">Last Active</option>
            </select>
        </div>

        <div className="form-row">
            <label htmlFor="order">Order</label>
            <select id="order" className="default-select" onChange={(e) =>{
                router.push(`/players?name=${name}&country=${country}&active=${active}&sb=${sortBy}&pp=${perPage}&o=${e.target.value}`);
            }}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="results">Results Per Page</label>
            <select id="results" defaultValue={perPage} className="default-select" onChange={(e) =>{
                router.push(`/players?name=${name}&country=${country}&active=${active}&sb=${sortBy}&pp=${e.target.value}&o=${order}`);
            }}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
            </select>
        </div>
    </form>
}