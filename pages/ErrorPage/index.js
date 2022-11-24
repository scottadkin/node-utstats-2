import React from "react";
import DefaultHead from "../../components/defaulthead";
import ErrorMessage from "../../components/ErrorMessage";

class ErrorPage extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div>
            <DefaultHead 
                title={`ERROR`} 
                description={`error`} 
                keywords={`error`}
                />
            <main>
                <div id="content">

                    <div className="default">
                        
                        <div className="default-header">Page Error</div>
                        <ErrorMessage title="Match Report" text={this.props.children}/>
                    </div>
                </div>
            </main>
        </div>
    }
}

export default ErrorPage;