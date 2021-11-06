import React from 'react';
import styles from './Table2.module.css';

class Table2 extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        let widthClass = "";

        const widthId = (this.props.width !== undefined) ? this.props.width : -1;

        if(widthId === 1){
            widthClass = "t-width-1";
        }else if(widthId === 2){
            widthClass = "t-width-2";
        }

        const playerClass = (this.props.players !== undefined) ? (this.props.players) ? "player-td-1" : "" : "" ;

        return <div className={`${styles.wrapper}`}>
            <table className={`${widthClass} ${playerClass}`}>
                <tbody>
                    {this.props.children}
                </tbody>
            </table>
        </div>;
    }
}

export default Table2;