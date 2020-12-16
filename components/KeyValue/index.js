const KeyValue = (props) =>{

    return (
        <div className="kv">
            <div>{props.label}</div>
            <div>{props.value}</div>
        </div>
    );
}

export default KeyValue;