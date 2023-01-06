import React from "react";
import Table2 from "../Table2";
import styles from "./InteractiveTable.module.css";
import Link from "next/link";
import TableHeader from "../TableHeader";
import MouseOver from "../MouseOver";

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
                onClick={(() =>{
                    this.changeOrder(key);
                })}>
                    <MouseOver title={title} display={value.content}>{value.title}</MouseOver>
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

        let lastRow = null;
        
        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const columns = [];

            if(d.bAlwaysLast !== undefined){
                lastRow = d;
                continue;
            }

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

        if(lastRow !== null){

            const columns = [];

            for(const key of Object.keys(this.props.headers)){

                let value = lastRow[key].value;

                columns.push(<td className={styles.totals} key={`last-${key}`}>{value}</td>);
                 
            }

            rows.push(<tr key={"last"}>{columns}</tr>);
        }

        return rows;
    }

    render(){

        let tableTitle = null;

        if(this.props.title !== undefined){
            tableTitle = <TableHeader width={this.props.width}>{this.props.title}</TableHeader>
        }

        return <div className={styles.wrapper}>
            {tableTitle}
            <Table2 width={this.props.width}>
                {this.renderHeaders()}
                {this.renderData()}
            </Table2>
            
        </div>
    }
}

export default InteractiveTable;