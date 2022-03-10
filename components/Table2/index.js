import React from 'react';
import styles from './Table2.module.css';

class Table2 extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        const widthId = (this.props.width !== undefined) ? this.props.width : 0;

        const widthClass = `t-width-${widthId}`;

        const playerClass = (this.props.players !== undefined) ? (this.props.players) ? "player-td-1" : "" : "";

        const noBottomMargin = (this.props.noBottomMargin !== undefined) ? true : false;

        const bCompressed = (this.props.compressed !== undefined) ? true : false;

        return <div className={`${styles.wrapper}`} style={{"marginBottom": `${(noBottomMargin) ? 0 : 25}px`}}>
            <table className={`${widthClass} ${playerClass}`} style={(bCompressed) ? {"lineHeight": "10px"} : {}}>
                <tbody>
                    {this.props.children}
                </tbody>
            </table>
        </div>;
    }
}

export default Table2;