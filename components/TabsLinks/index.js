import TabLink from "../TabLink";

const TabsLinks = ({options, selectedValue, url}) =>{

    const elems = [];

    for(let i = 0; i < options.length; i++){

        const o = options[i];

        elems.push(
                <TabLink 
                    key={o.value} 
                    name={o.name} 
                    value={o.value} 
                    selectedValue={selectedValue}
                    url={url}
                />
        );
    }

    return <div className="tabs">
        {elems}
    </div>
}

export default TabsLinks;