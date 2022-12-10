import React from "react";
import styles from "./SearchTerms.module.css";

class SearchTerms extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const elems = [];

        for(const [key, value] of Object.entries(this.props.data)){

            elems.push(<div className={styles.term} key={key}>
                <div className={styles.name}>{key}</div>
                <div className={styles.value}>{value}</div>
            </div>);
        }
        
        return <div className={styles.wrapper}>
            <div className={styles.title}>Search Terms</div>
            {elems}
        </div>
    }
}

export default SearchTerms;