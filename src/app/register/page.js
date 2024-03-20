"use client"
import Header from "../UI/Header";
import {useFormState} from "react-dom";
import { register } from "../lib/authentication";
import ErrorBox from "../UI/ErrorBox";
import MessageBox from "../UI/MessageBox";

export default function RegisterPage(){

    const [state, formAction] = useFormState(register, {
        "message": null,
        "error": null
    });

    return <div>
        <Header>Register</Header>
        <form action={formAction}>
            <div className="form-row">
                <label htmlFor="username">Username</label>
                <input type="text" className="textbox" name="username" placeholder="Username..." maxLength={20}/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input type="password" className="textbox" name="password" placeholder="Password..."/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password Again</label>
                <input type="password" className="textbox" name="password2" placeholder="Password again..."/>
            </div>
            <input type="submit" value="Register" className="submit-button"/>
        </form>
        {(state.error === null) ? null :
            <ErrorBox title="Failed to Login">
                {state.error}
            </ErrorBox>
        }
        {(state.message === null) ? null :
            <MessageBox title="Success">
                {state.message}
            </MessageBox>
        }
    </div>
}