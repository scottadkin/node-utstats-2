import React from 'react';
import styles from './Table2.module.css';
import TableHeader from '../TableHeader';

class Table2 extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        const widthId = (this.props.width !== undefined) ? this.props.width : 0;

        const widthClass = `t-width-${widthId}`;

        const playerClass = (this.props.players !== undefined) ? (this.props.players) ? "player-td-1" : "" : "";

       // const noBottomMargin = (this.props.noBottomMargin !== undefined) ? true : false;

        let noBottomMargin = false;

        if(this.props.noBottomMargin !== undefined){
            noBottomMargin = this.props.noBottomMargin;
        }

        const bCompressed = (this.props.compressed !== undefined) ? true : false;

        let headerElem = null;

        if(this.props.header !== undefined){
            headerElem = <TableHeader width={widthId}>{this.props.header}</TableHeader>
        }

        return <div className={`${styles.wrapper}`} style={{"marginBottom": `${(noBottomMargin) ? 0 : 25}px`}}>
            {headerElem}
            <table className={`${widthClass} ${playerClass}`} style={(bCompressed) ? {"lineHeight": "10px"} : {}}>
                <tbody>
                    {this.props.children}
                </tbody>
            </table>
        </div>;
    }
}

export default Table2;