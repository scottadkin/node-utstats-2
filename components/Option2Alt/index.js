import React from "react";
import Link from "next/link";
import styles from "./Option2Alt.module.css";

class Option2Alt extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        return <div className={styles.wrapper}>
            <Link href={this.props.url1}>
                <span className={(this.props.value === 0) ? styles.selected : null}>
                    {this.props.title1}
                </span>
            </Link>
            <Link href={this.props.url2}>
                <span className={(this.props.value === 1) ? styles.selected : null}>
                    {this.props.title2}
                </span>
            </Link>
        </div>
    }
}

export default Option2Alt;