import React from "react";
import styles from "./TableHeader.module.css";


class TableHeader extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const width = this.props.width ?? 1;

        return <div className={`${styles.wrapper} t-width-${width} center`}>{this.props.children}</div>
    }
}

export default TableHeader;