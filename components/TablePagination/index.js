import React from "react";
import styles from "./TablePagination.module.css";

class TablePagination extends React.Component{

    constructor(props){

        super(props);
        this.state = {"totalPages": 0};

        this.next = this.next.bind(this);
    }

    next(){

        if(this.props.page + 1 > this.state.totalPages) return;
        this.props.next();
    }

    componentDidMount(){

        this.setTotalPages();
    }

    setTotalPages(){

        if(this.props.perPage > 0){

            if(this.props.totalResults > 0){
                const pages = Math.ceil(this.props.totalResults / this.props.perPage);
                this.setState({"totalPages": pages});
            }
        }
    }

    componentDidUpdate(prevProps){

        if(this.props.totalResults !== prevProps.totalResults){
            this.setTotalPages();
        }
    }

    render(){

        if(this.state.totalPages < 2) return null;

        return <div className={`${styles.wrapper} center t-width-${this.props.width}`}>
            <div className={styles.button} onClick={this.props.previous}>Previous</div>
            <div className={styles.info}>Page {this.props.page} of {this.state.totalPages}</div>
            <div className={styles.button} onClick={this.next}>Next</div>
        </div>
    }
}

export default TablePagination;