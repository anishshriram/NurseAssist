import React, {useState}  from "react"
import Login from "./pages/login"
import Register from "./pages/register"
import NurseDashboard from "./pages/NurseDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard.js";
import DemoDashboard from "./pages/DemoDashboard";


function App(){
    const [showLogin, setShowLogin] = useState(true); // true -> show login, false -> show register
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
    const [userName, setUserName] = useState(localStorage.getItem("userName"));
    const [showDemo, setShowDemo] = useState(false); // To control demo mode visibility

    function togglePage(){
        setShowLogin(!showLogin); // Switch between pages, this basically switches the state value
        setShowDemo(false); // Make sure demo is hidden when toggling between login/register
    }
    
    function toggleDemo(){
        setShowDemo(!showDemo); // Toggle demo mode
    }

    function handleLogout(){
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userToken");
        setUserRole(null);
        setUserName(null);
        setShowDemo(false);
    }

    // If demo mode is active, show the demo dashboard
    if (showDemo) {
        return React.createElement("div", null, [
            React.createElement(DemoDashboard, { key: "demo" }),
            React.createElement("div", { 
                key: "back-to-login",
                style: {
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000
                }
            }, [
                React.createElement("button", {
                    onClick: toggleDemo,
                    style: {
                        padding: '10px 15px',
                        backgroundColor: '#1976D2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }
                }, "Back to Login")
            ])
        ]);
    }
    
    // If user is logged in, show the correct dashboard
    if (userRole === "Nurse") {
        return React.createElement(NurseDashboard, {handleLogout, userName});
    } else if (userRole === "Doctor") {
        return React.createElement(DoctorDashboard, {handleLogout, userName});
    } else if (userRole === "Admin") {
        return React.createElement(AdminDashboard, {handleLogout, userName});
    }
    
    // If not logged in, show login or register
    return React.createElement("div", null, [
        showLogin
            ? React.createElement(Login, { 
                key: "login", 
                togglePage, 
                setUserRole, 
                setUserName,
                toggleDemo // Pass the demo toggle function to the login page
            })
            : React.createElement(Register, { 
                key: "register", 
                togglePage, 
                setUserRole, 
                setUserName 
            })
    ]);

   
}

export default App;