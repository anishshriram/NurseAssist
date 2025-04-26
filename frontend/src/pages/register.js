import React, {useState}  from "react";

function Register({togglePage, setUserRole}){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Nurse");          
    const [message, setMessage] = useState("");

    function handleRegistration(){
        console.log("name:", name, "email:", email, "password:", password, "role:", role);
        // Ensures formatting is correct
        if(!name || !email || !password || !role) {
            setMessage("Please fill out all fields.");
            return;
        }

        // Temporary placeholder -> Replace with real API call
        localStorage.setItem("userRole", role);
        setUserRole(role);
        setMessage(`Account created for ${role}: ${name}`);
    }

    return React.createElement("div", null, [
        // Heading element
        React.createElement("h2", {key: "title"}, "Create Account"),

        // Input field for name
        React.createElement("input", {
            key: "name",
            type: "text",
            placeholder: "Full Name",
            value: name,
            onChange: (name) => setName(name.target.value)
        }),

        // Input field for email
        React.createElement("input", {
            key: "email",
            type: "text",
            placeholder: "Email",
            value: email,
            onChange: (email) => setEmail(email.target.value)
        }),

        // Input field for password
        React.createElement("input", {
            key: "password",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: (password) => setPassword(password.target.value)
        }),

        // Multi-select option for role (doctor, nurse, admin)
        React.createElement("select", {
            key: "role",
            value: role,
            onChange: (role) => setRole(role.target.value)
        }, [
            React.createElement("option", { key: "nurse", value: "Nurse" }, "Nurse"),
            React.createElement("option", { key: "doctor", value: "Doctor" }, "Doctor"),
            React.createElement("option", { key: "admin", value: "Admin" }, "Admin")
        ]),

        // Register button (similar to the login button which calls handleLogin, but this 
        // time its for handleRegister)
        React.createElement("button", {
            key: "registerButton",
            onClick: handleRegistration
        }, "Register"),

        // Welcome message or error message
        React.createElement("p", {key: "message"}, message)
    ]);
}

export default Register;