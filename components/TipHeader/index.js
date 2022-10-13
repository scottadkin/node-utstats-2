import React from "react";
import styles from "./TipHeader.module.css";


class TipHeader extends React.Component{

    constructor(props){

        super(props);

        this.state = {"display": false};
    }

    changeDisplay(bDisplay){

        this.setState({"display": bDisplay});
    }

    renderMouseOver(){

        if(!this.state.display) return null;

        return <div className={styles.wrapper}>
            <div className={styles.title}>{this.props.title}</div>
            <div className={styles.content}>{this.props.content}</div>
        </div>
    }

    render(){

        return <th onMouseOver={(() =>{
            this.changeDisplay(true);
        })} onMouseOut={(() =>{
            this.changeDisplay(false);
        })}>
            {this.props.title}
            {this.renderMouseOver()}
        </th>;
    }
}


export default TipHeader;