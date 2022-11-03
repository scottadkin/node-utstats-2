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
                <a className={(this.props.value === 0) ? styles.selected : null}>
                    {this.props.title1}
                </a>
            </Link>
            <Link href={this.props.url2}>
                <a className={(this.props.value === 1) ? styles.selected : null}>
                    {this.props.title2}
                </a>
            </Link>
        </div>
    }
}

export default Option2Alt;