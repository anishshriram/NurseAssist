import React, {useState} from "react";
import {loginUser} from "../services/authenticationService"

function Login({togglePage, setUserRole}){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); // Success or error message

    function handleLogin(){
        // Makes sure that user entered in information properly (email and password)
        if(!email || !password){
            setMessage("Please enter both email and password");
            return;
        }

        const result = loginUser(email, password); // Temporary placeholder -> simulates calling the backend
        
        if(result.error){
            setMessage(result.error);
        }else{
            localStorage.setItem("userRole", result.role);
            localStorage.setItem("userName", result.name);
            setUserRole(result.role); // Creates a redirect to the correct dashboard based on role (doctor, nurse, admin)
        }
    }

    return React.createElement("div", null, [
        // Heading element
        React.createElement("h2", {key: "title"}, "Login"),

        // Input field for email
        React.createElement("input", {
            key: "email",
            type: "text",
            placeholder: "Email",
            value: email,
            onChange: (e) => setEmail(e.target.value)
        }),

        // Input field for password
        React.createElement("input",{
            key: "password",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: (e) => setPassword(e.target.value)
        }),

        // Login button -> calls handleLogin() function when clicked
        React.createElement("button", {
            key: "loginButton",
            onClick: handleLogin
        }, "Login"),

        // Welcome message or error message
        React.createElement("p", {key: "message"}, message),

        // Switch to Register Button
        React.createElement("button", {
            key: "goToRegister",
            onClick: () => togglePage()
        }, "Don't have an account? Register Here")
    ]);
}

export default Login;
