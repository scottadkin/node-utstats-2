import Link from "next/link";

const TabLink = ({name, value, selectedValue, url, anchor}) =>{

    let link = `${url}${value}`;

    if(anchor !== undefined){
        link = `${link}${anchor}`;
    }

    const className = (value === selectedValue) ? "tab tab-selected" : "tab";
    return <Link href={link}><div className={className}>
        {name}
    </div></Link>
}

export default TabLink;