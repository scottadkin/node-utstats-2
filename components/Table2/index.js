import React from 'react';
import styles from './Table2.module.css';
import TableHeader from '../TableHeader';


export default function Table2({width, header, players, noBottomMargin, compressed, children}){

    const widthId = (width !== undefined) ? width : 0;

        const widthClass = `t-width-${widthId}`;

        const playerClass = (players !== undefined) ? (players) ? "player-td-1" : "" : "";



        if(noBottomMargin !== undefined){
            noBottomMargin = noBottomMargin;
        }

        const bCompressed = (compressed !== undefined) ? true : false;

        let headerElem = null;

        if(header !== undefined){
            headerElem = <TableHeader width={widthId}>{header}</TableHeader>
        }

        return <div className={`${styles.wrapper}`} style={{"marginBottom": `${(noBottomMargin) ? 0 : 25}px`}}>
            {headerElem}
            <table className={`${widthClass} ${playerClass}`} style={(bCompressed) ? {"lineHeight": "10px"} : {}}>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>;
}