import ErrorMessage from "./ErrorMessage";
import Nav from "./Nav";

export default function ErrorPage({navSettings, sessionSettings, title, children}){

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Error</div>
                <ErrorMessage title={title}>
                    {children}
                </ErrorMessage>
            </div>    
        </div>   
    </main>; 
}