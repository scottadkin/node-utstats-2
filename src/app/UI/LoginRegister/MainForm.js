"use client";
import styles from "../../../../styles/Login.module.css";
import { loginUser, registerUser } from "../../actions";
import { useRouter } from "next/navigation";
import ErrorMessage from "../../../../components/ErrorMessage";
import { useReducer } from "react";
import Tabs from "../../../../components/Tabs";
import LoginForm from "./LoginForm";

function reducer(state, action){

    switch(action.type){
        case "set-error": {
            return {
                ...state,
                "errorText": action.text,
                "errorTitle": action.title
            }
        }
        case "change-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
    }

    return state;
}

/**async (e) =>{
            
            dispatch({"type": "set-error", "title": null, "text": null});
            const result = await loginUser(e);

            if(result.errors.length === 0){
                router.push("/#loggedin");
            }else{

                let errorElems = result.errors.map((r, i) =>{
                    return <div key={`error-${i}`}>{r}</div>
                });

                dispatch({"type": "set-error", "title": "Failed To Login", "text": errorElems});
            }
        } */



export default function LoginRegisterForms(){

    const [state, dispatch] = useReducer(reducer, {
        "mode": "login",
        "errorText": null,
        "errorTitle": null
    }); 


    return <div className="default">
        <div className="default-header">Login/Register</div>
        <Tabs selectedValue={state.mode} changeSelected={(value) =>{
            dispatch({"type": "change-mode", "value": value});
        }} options={
            [
                {
                    "name": "Login",
                    "value": "login"
                },
                {
                    "name": "Register",
                    "value": "register"
                }
            ]
        }/>
        <ErrorMessage text={state.errorText} title={state.errorTitle}/>
        <LoginForm />
        
    </div>
}