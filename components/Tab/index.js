const Tab = ({name, value, bSelected, changeSelected}) =>{

    const className = (bSelected) ? "tab tab-selected" : "tab";
    return <div className={className} onClick={() => changeSelected(value) }>
        {name}
    </div>
}

export default Tab;