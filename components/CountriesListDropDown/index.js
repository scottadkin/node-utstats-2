import DropDown from "../DropDown";
import Countires from "../../api/countries";
import CountryFlag from "../CountryFlag";

const CountriesListDropDown = ({changeSelected, dName, selectedValue}) =>{

    const countryList = Countires("ALL");

    const data = [{
        "displayValue": <><CountryFlag bNoHover={true} country={"xx"}/>Any Country</>, "value": ""
    }];

    for(const [key, value] of Object.entries(countryList)){

        let fixedKey = key.toLowerCase();

        if(fixedKey === "uk") fixedKey = "gb";

        data.push({"displayValue": <><CountryFlag bNoHover={true} country={fixedKey}/>{value}</>, "value": fixedKey});
    }

    return <DropDown 
        dName="Country" 
        data={data}
        selectedValue={selectedValue}
        changeSelected={changeSelected}
    />
}


export default CountriesListDropDown;