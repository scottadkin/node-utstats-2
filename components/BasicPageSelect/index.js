import React from "react";
import styles from "./BasicPageSelect.module.css"


class BasicPageSelect extends React.Component{

    constructor(props){

        super(props);

        this.state = {"perPage": (this.props.perPage !== undefined) ? this.props.perPage : 25, "results": this.props.results};
    }

    render(){

        return <div className={`${styles.wrapper} center`}>

            <div className={styles.button} onClick={(() =>{
                this.props.changePage(this.props.page - 1);
            })}>Previous</div>

            <div className={styles.info}>Displaying page {this.props.page + 1} of {Math.ceil(this.props.results / this.state.perPage)}</div>
            <div className={styles.button} onClick={(() =>{
                this.props.changePage(this.props.page + 1);
            })}>Next</div>
        </div>
    }
}

export default BasicPageSelect;