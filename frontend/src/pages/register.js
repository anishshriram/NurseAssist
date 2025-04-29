import React, {useState}  from "react";
import { registerUser } from "../services/authenticationService"; 

function Register({togglePage, setUserRole, setUserName}){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Nurse");
    const [message, setMessage] = useState("");

    async function handleRegistration(){
        console.log("Attempting registration for:", name, email, role);
        if(!name || !email || !password || !role) {
            setMessage("Please fill out all fields.");
            return;
        }

        setMessage("Registering..."); 

        const result = await registerUser(name, email, password, role);

        if (result.error) {
            setMessage(result.error); 
        } else {
            setMessage(`Account created successfully for ${email}. Please log in.`);
            // Optionally clear form fields here if desired
            // setName(''); setEmail(''); setPassword(''); setRole('Nurse');
        }
    }

    return React.createElement("div", null, [
        React.createElement("h2", {key: "title"}, "Create Account"),

        React.createElement("input", {
            key: "name",
            type: "text",
            placeholder: "Full Name",
            value: name,
            onChange: (e) => setName(e.target.value),
            style: { display: 'block', marginBottom: '10px' } 
        }),

        React.createElement("input", {
            key: "email",
            type: "email", 
            placeholder: "Email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            style: { display: 'block', marginBottom: '10px' }
        }),

        React.createElement("input", {
            key: "password",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            style: { display: 'block', marginBottom: '10px' }
        }),

        React.createElement("select", {
            key: "role",
            value: role,
            onChange: (e) => setRole(e.target.value),
            style: { display: 'block', marginBottom: '10px', padding: '5px' } 
        }, [
            React.createElement("option", { key: "nurse", value: "Nurse" }, "Nurse"),
            React.createElement("option", { key: "doctor", value: "Doctor" }, "Doctor"),
            React.createElement("option", { key: "admin", value: "Admin" }, "Admin")
        ]),

        React.createElement("button", {
            key: "registerButton",
            onClick: handleRegistration,
            style: { marginRight: '10px' } 
        }, "Register"),

        React.createElement("button", {
            key: "goToLogin",
            onClick: () => togglePage()
        }, "Already have an account? Login Here"),

        message && React.createElement("p", {key: "message", style: { marginTop: '10px'}}, message) 
    ]);
}

export default Register;