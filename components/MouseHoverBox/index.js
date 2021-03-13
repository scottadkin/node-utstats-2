import React from 'react';
import styles from './MouseHoverBox.module.css';
import Functions from '../../api/functions';
/*
const showMouseOver = (e, title, content) =>{


    if(content === "") return;
    
    const elem = document.getElementById("mouse-over");
    const titleElem = document.getElementById("mouse-over-title");
    const contentElem = document.getElementById("mouse-over-content");

    const x = e.pageX + 10;
    const y = e.pageY + 10;

    //if(titleElem.innerHTML !== title && contentElem.innerHTML !== content){
        titleElem.innerHTML = title
        contentElem.innerHTML = content;
    //}
    elem.style.cssText = `display:inline-block;margin-left:${x}px;margin-top:${y}px`;
}

const hideMouseOver = () =>{

    const elem = document.getElementById("mouse-over");
    elem.style.cssText = `display:none;`;
}

const MouseHoverBox = ({title, display, content}) =>{

    return <span onMouseMove={((e) =>{
        showMouseOver(e, title, content);
    })}

        onMouseLeave={hideMouseOver}
    
    >
       
        {display}
    </span>
}
*/

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

            let p = 0;

            for(let i = 0; i < this.props.content.length; i++){

                p = this.props.content[i].content;

                for(let x = 0; x < p.length; x++){
                    currentColumns.push(<td>{p[x]}</td>);
                }
                elems.push(<tr>
                    {currentColumns}
                </tr>);
            }
        }

        if(elems.length > 0){

            const headers = [];
            let p = 0;

            for(let i = 0; i < this.props.content[0].headers.length; i++){

                p = this.props.content[0].headers[i];

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

        console.log(this.props.content);
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