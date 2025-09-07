function Tab({name, value, bSelected, changeSelected}){

    const className = (bSelected) ? "tab tab-selected" : "tab";
    return <div className={className} onClick={() => changeSelected(value) }>
        {name}
    </div>
}

export default function Tabs({options, selectedValue, changeSelected}){

    const elems = [];

    for(let i = 0; i < options.length; i++){

        const o = options[i];

        elems.push(<Tab 
            key={o.value} 
            name={o.name} 
            value={o.value} 
            bSelected={selectedValue === o.value}
            changeSelected={changeSelected}
        />);
    }

    return <div className="tabs">
        {elems}
    </div>
}
