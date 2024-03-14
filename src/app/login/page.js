
import { login } from "../lib/authentication";
import Header from "../UI/Header";

export default function Login(){

    return <div>
        <Header>Login</Header>
        <form action={login}>
            <div className="form-row">
                <label htmlFor="username">Username</label>
                <input type="text" className="textbox" name="username" placeholder="Username..."/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input type="password" className="textbox" name="password" placeholder="Password..."/>
            </div>
            <input type="submit" className="submit-button" value="Login"/>
        </form>
    </div>
}