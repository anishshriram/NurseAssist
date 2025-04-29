import React, {useState} from "react";
import {loginUser} from "../services/authenticationService"

function Login({togglePage, setUserRole, setUserName}){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); // Success or error message

    async function handleLogin(){
        if(!email || !password){
            setMessage("Please enter both email and password");
            return;
        }

        setMessage("Logging in..."); 

        const result = await loginUser(email, password);

        if(result.error){
            setMessage(result.error); // Show backend error message
        }else{
            // Check for token AND the nested user object with role and name
            if (result.token && result.user && result.user.role && result.user.name) {
                setMessage("Login successful!"); // Keep success message brief
                // Store token, role, and name (accessing nested properties)
                localStorage.setItem("userToken", result.token);
                localStorage.setItem("userRole", result.user.role); // Access nested role
                localStorage.setItem("userName", result.user.name); // Access nested name
                // Update App state to trigger redirect
                setUserRole(result.user.role);   // Use nested role
                setUserName(result.user.name); // Use nested name
            } else {
                // Handle unexpected response structure from backend
                setMessage("Login failed: Unexpected response structure from server.");
                console.error("Unexpected login response structure:", result);
            }
        }
    }

    return React.createElement("div", null, [
        React.createElement("h2", {key: "title"}, "Login"),

        React.createElement("input", {
            key: "email",
            type: "text",
            placeholder: "Email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            style: { display: 'block', marginBottom: '10px' } 
        }),

        React.createElement("input",{
            key: "password",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            style: { display: 'block', marginBottom: '10px' } 
        }),

        React.createElement("button", {
            key: "loginButton",
            onClick: handleLogin,
            style: { marginRight: '10px' } 
        }, "Login"),

        React.createElement("button", {
            key: "goToRegister",
            onClick: () => togglePage()
        }, "Don't have an account? Register Here"),

        message && React.createElement("p", {key: "message", style: { marginTop: '10px'}}, message) 
    ]);
}

export default Login;
