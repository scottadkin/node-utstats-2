import React from 'react';
import styles from './MouseHoverBox.module.css';


class MouseHoverBox extends React.Component{

    constructor(props){

        super(props);

        let bTable = false;

        if(Array.isArray(this.props.content)) bTable = true;
        
        this.state = {"bDisplay": 0, "mouse": {"x": 0, "y": 0}, "bTable": bTable};
        this.showHover = this.showHover.bind(this);
        this.hideHover = this.hideHover.bind(this);
    }

    showHover(e){

        this.setState({"bDisplay": 1});
    }

    hideHover(){
        this.setState({"bDisplay": 0});
    }

    createTable(){

        const elems = [];

        if(this.state.bTable){

            let currentColumns = [];
            let bMultiRows = false;

            for(let i = 0; i < this.props.content.length; i++){

                const p = this.props.content[i].content;
   
                for(let x = 0; x < p.length; x++){

                    if(!Array.isArray(p[x])){
                        //for just a single table row
                        currentColumns.push(<td key={-x}>{p[x]}</td>);

                    }else{
                        //for multiple table rows
                        bMultiRows = true;
                        for(let z = 0; z < p[x].length; z++){
                            currentColumns.push(<td key={z}>{p[x][z]}</td>);
                        }
                        elems.push(<tr key={x}>{currentColumns}</tr>);
                        currentColumns = [];
                        
                    }
                }
                
                if(!bMultiRows){
                    elems.push(<tr key={i}>
                        {currentColumns}
                    </tr>);
                }
                
            }
        }

        if(elems.length > 0){

            const headers = [];

            for(let i = 0; i < this.props.content[0].headers.length; i++){

                const p = this.props.content[0].headers[i];

                headers.push(<th>
                    {p}
                </th>);

            }

            if(headers.length > 0){
                elems.unshift(<tr>{headers}</tr>);
            }

            return <table>
                <tbody>
                    {elems}
                </tbody>
            </table>

        }
        return [];
    }

    render(){

        const boxClass = (this.state.bDisplay) ? '' : 'hidden';
        const boxStyle = {"marginLeft": 20, "marginTop": 20};

        let content = [];

        
        if(this.state.bDisplay){

            if(!this.state.bTable){
                content = <div style={boxStyle} className={`${styles.box} ${boxClass}`}>
                    <div className={styles.title}>{this.props.title}</div>
                    {this.props.content}
                </div>
            }else{

                content = <div style={boxStyle} className={`${styles.box} ${boxClass}`}>
                    <div className={styles.title}>{this.props.title}</div>
                    {this.createTable()}
                </div>

            }
        }

        return (<div className={styles.wrapper}>
        <span onMouseOut={this.hideHover} onMouseOver={((e) =>{
            this.showHover(e);
        })}>
            {this.props.display}
        </span>
        {content}
        </div>);
    }
}

export default MouseHoverBox;