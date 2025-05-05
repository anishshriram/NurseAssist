import React, {useState} from "react";
import {loginUser} from "../services/authenticationService"

// Healthcare themed logo component
const Logo = () => {
    return React.createElement("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
        }
    }, [
        React.createElement("div", {
            key: "logo-icon",
            style: {
                width: '40px',
                height: '40px',
                backgroundColor: '#1976D2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
            }
        }, "+"),
        React.createElement("div", {
            key: "logo-text",
            style: {
                fontSize: '24px',
                fontWeight: '600',
                color: '#1976D2'
            }
        }, "NurseAssist")
    ])
}

function Login({togglePage, setUserRole, setUserName, toggleDemo}){
    // Define styles matching our healthcare theme
    const styles = {
        // Color palette
        colors: {
            primary: '#1976D2',        // Blue - primary actions
            secondary: '#03A9F4',      // Light blue - secondary actions
            success: '#4CAF50',        // Green - success states & actions
            warning: '#FF9800',        // Orange - warnings & edits
            danger: '#F44336',         // Red - destructive actions
            info: '#673AB7',           // Purple - informational
            lightBg: '#F5F5F5',        // Light gray - backgrounds
            darkText: '#333333',       // Dark gray - primary text
            lightText: '#757575',      // Medium gray - secondary text
            border: '#E0E0E0',         // Light gray - borders
            white: '#FFFFFF'           // White - card backgrounds, text on dark
        },
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#F8FAFC',
            padding: '20px'
        },
        loginCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            padding: '40px',
            width: '100%',
            maxWidth: '400px'
        },
        title: {
            fontSize: '24px',
            color: '#1976D2',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: '500'
        },
        inputGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: '#333333',
            fontSize: '14px',
            fontWeight: '500'
        },
        inputField: {
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #E0E0E0',
            fontSize: '14px',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
        },
        primaryButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s'
        },
        secondaryButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#1976D2',
            border: '1px solid #1976D2',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        successMessage: {
            backgroundColor: '#E8F5E9',
            color: '#388E3C',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '20px',
            fontSize: '14px'
        },
        errorMessage: {
            backgroundColor: '#FFEBEE',
            color: '#D32F2F',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '20px',
            fontSize: '14px'
        },
        infoMessage: {
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '20px',
            fontSize: '14px'
        }
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); // Success or error message
    const [messageType, setMessageType] = useState(""); // success, error, or info

    async function handleLogin(){
        if(!email || !password){
            setMessage("Please enter both email and password");
            setMessageType("error");
            return;
        }

        setMessage("Logging in..."); 
        setMessageType("info");

        const result = await loginUser(email, password);

        if(result.error){
            setMessage(result.error); // Show backend error message
            setMessageType("error");
        }else{
            // Check for token AND the nested user object with role and name
            if (result.token && result.user && result.user.role && result.user.name) {
                setMessage("Login successful!"); // Keep success message brief
                setMessageType("success");
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
                setMessageType("error");
                console.error("Unexpected login response structure:", result);
            }
        }
    }

    return React.createElement("div", { style: styles.container }, 
        React.createElement("div", { style: styles.loginCard }, [
            // Logo Component
            React.createElement(Logo, { key: "logo" }),
            
            React.createElement("h2", { key: "title", style: styles.title }, "Sign In to NurseAssist"),

            // Email input group
            React.createElement("div", { key: "email-group", style: styles.inputGroup }, [
                React.createElement("label", { key: "email-label", style: styles.label }, "Email Address"),
                React.createElement("input", {
                    key: "email-input",
                    type: "text",
                    placeholder: "Enter your email",
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    style: styles.inputField
                })
            ]),

            // Password input group
            React.createElement("div", { key: "password-group", style: styles.inputGroup }, [
                React.createElement("label", { key: "password-label", style: styles.label }, "Password"),
                React.createElement("input", {
                    key: "password-input",
                    type: "password",
                    placeholder: "Enter your password",
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    style: styles.inputField
                })
            ]),

            // Login button
            React.createElement("button", {
                key: "login-button",
                onClick: handleLogin,
                style: styles.primaryButton
            }, "Sign In"),

            // Register link
            React.createElement("button", {
                key: "register-button",
                onClick: () => togglePage(),
                style: styles.secondaryButton
            }, "Don't have an account? Create One"),
            
            // Demo button - with different styling to differentiate it
            React.createElement("button", {
                key: "demo-button",
                onClick: toggleDemo,
                style: {
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#E3F2FD',
                    color: '#1976D2',
                    border: '1px solid #BBDEFB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '15px',
                    marginBottom: '15px',
                    transition: 'background-color 0.2s'
                }
            }, "Try Demo Mode - No Login Required"),

            // Message display
            message && React.createElement("div", {
                key: "message-box", 
                style: messageType === "success" ? styles.successMessage : 
                       messageType === "error" ? styles.errorMessage : 
                       styles.infoMessage
            }, message)
        ])
    );
}

export default Login;
