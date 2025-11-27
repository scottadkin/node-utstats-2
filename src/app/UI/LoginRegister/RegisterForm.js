"use client"
import { registerUser } from "../../actions";
import { useActionState } from "react";
import ErrorMessage from "../ErrorMessage";


export default function RegisterForm(){

    const [state, formAction] = useActionState(registerUser, {
        "errors": [],
        "username": ""
    });


    let errorElems = null;

    if(state.errors.length > 0){
        errorElems = state.errors.map((e,i) =>{
             return <div key={`error-${i}`}>{e}</div>
        });
    }

    return <div className={`form`}>
        <ErrorMessage title="Failed To Register Account" text={errorElems}/>
        <form action={formAction}>
            <div className="select-row">
                <div className="select-label">Username</div>
                <input type="text" defaultValue={state?.username} className="default-textbox" id="username" name="username" placeholder="Username..."/>
            </div>
            <div className="select-row">
                <div className="select-label">Password</div>
                <input type="password" className="default-textbox" id="password" name="password" placeholder="Password..."/>
            </div>
            <div className="select-row">
                <div className="select-label">Password Again</div>
                <input type="password" className="default-textbox" id="password2" name="password2" placeholder="Password..."/>
            </div>
            <input type="hidden" className="default-textbox" id="mode" name="mode" value="0"/>
            <input className="search-button" type="submit" id="submit" name="submit" value="Register"/>
        </form>
    </div>
}