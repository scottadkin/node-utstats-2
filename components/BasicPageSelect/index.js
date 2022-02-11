import React from "react";
import styles from "./BasicPageSelect.module.css"


class BasicPageSelect extends React.Component{

    constructor(props){

        super(props);

        this.state = {"perPage": (this.props.perPage !== undefined) ? this.props.perPage : 25, "results": this.props.results};
    }

    render(){

        let totalPages = Math.ceil(this.props.results / this.state.perPage);

        if(totalPages < 1) totalPages = 1;

        const width = this.props.width ?? 1;

        let widthClass = `var(--max-width-${width})`;

    

        return <div className={`${styles.wrapper} center`} style={{"maxWidth": widthClass}}>

            <div className={styles.button} onClick={(() =>{
                this.props.changePage(this.props.page - 1);
            })}>Previous</div>

            <div className={styles.info}>Displaying page {this.props.page + 1} of {totalPages}</div>
            <div className={styles.button} onClick={(() =>{
                this.props.changePage(this.props.page + 1);
            })}>Next</div>
        </div>
    }
}

export default BasicPageSelect;