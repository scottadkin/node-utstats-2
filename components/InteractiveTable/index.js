import React from "react";
import Table2 from "../Table2";
import styles from "./InteractiveTable.module.css";
import Link from "next/link";
import TableHeader from "../TableHeader";

class InteractiveTable extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "orderBy": null, 
            "bAsc": true,
            "bDisplayMouseOver": false,
            "mouseTitle": "",
            "mouseContent": ""
        };

        this.hideMouseOver = this.hideMouseOver.bind(this);
    }

    hideMouseOver(){
        this.setState({"bDisplayMouseOver": false});
    }

    updateMouseOver(title, content){
        this.setState({"mouseTitle": title, "mouseContent": content, "bDisplayMouseOver": true});
    }

    changeOrder(orderBy){
        
        if(orderBy === this.state.orderBy){
            this.setState({"bAsc": !this.state.bAsc});
        }else{
            this.setState({"orderBy": orderBy});
        }
    }

    renderHeaders(){

        const headers = [];

        for(const [key, value] of Object.entries(this.props.headers)){

            const type = typeof value;

            if(type === "string"){

                headers.push(<th className={`pointer`} key={key} onClick={(() =>{
                    this.changeOrder(key);
                })}>
                    {value}
                </th>);

            }else{

                let title = value.title;

                if(value.detailedTitle !== undefined){
                    title = value.detailedTitle;
                }

                headers.push(<th className={`pointer`} key={key} 
                onMouseOver={(() =>{
                    this.updateMouseOver(title, value.content);
                })} 
                onClick={(() =>{
                    this.changeOrder(key);
                })}>
                    {value.title}
                </th>);

            }

        }

        return <tr>{headers}</tr>
    }

    renderData(){

        const rows = [];

        const data = [...this.props.data];

        if(this.state.orderBy !== null){

            data.sort((a, b) =>{

                a = a[this.state.orderBy].value;
                b = b[this.state.orderBy].value;


                if(a < b){

                    if(this.state.bAsc){
                        return -1;
                    }else{
                        return 1;
                    }
                }

                if(a > b){
                    
                    if(this.state.bAsc){
                        return 1;
                    }else{
                        return -1;
                    }
                }
                
                return 0;
            });
        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const columns = [];

            for(const key of Object.keys(this.props.headers)){

                let value = null;

                if(d[key].displayValue !== undefined){
                    value = d[key].displayValue;
                }else{
                    value = d[key].value;
                }
                
                if(d[key].url !== undefined){
                    value = <Link href={d[key].url}>{value}</Link>
                }

                if(d[key].className !== undefined){
                    columns.push(<td className={d[key].className} key={`${i}-${key}`}>{value}</td>);
                }else{
                    columns.push(<td key={`${i}-${key}`}>{value}</td>);
                }

                
            }

            rows.push(<tr key={i}>{columns}</tr>);
        }

        return rows;
    }

    renderMouseOver(){

        if(!this.state.bDisplayMouseOver) return null;

        return <div className={`${styles.mo} center t-width-${this.props.width}`}>
            <div className={styles.mt}>{this.state.mouseTitle}</div>
            <div className={styles.mc}>
                {this.state.mouseContent}
            </div>
            <div className={styles.mi}>
                Click header to sort by that value.
            </div>
        </div>
    }

    render(){

        let tableTitle = null;

        if(this.props.title !== undefined){
            tableTitle = <TableHeader width={this.props.width}>{this.props.title}</TableHeader>
        }

        return <div className={styles.wrapper} onMouseLeave={this.hideMouseOver}>
            {tableTitle}
            {this.renderMouseOver()}
            <Table2 width={this.props.width}>
                {this.renderHeaders()}
                {this.renderData()}
            </Table2>
            
        </div>
    }
}

export default InteractiveTable;