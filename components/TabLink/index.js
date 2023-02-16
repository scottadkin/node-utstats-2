import Link from "next/link";

const TabLink = ({name, value, selectedValue, url}) =>{

    console.log(value, selectedValue);

    const className = (value === selectedValue) ? "tab tab-selected" : "tab";
    return <Link href={`${url}${value}`}><a><div className={className}>
        {name}
    </div></a></Link>
}

export default TabLink;