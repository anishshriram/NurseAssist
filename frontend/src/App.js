import React, {useState}  from "react"
import Login from "./pages/login"
import Register from "./pages/register"
import NurseDashboard from "./pages/NurseDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard.js";


function App(){
    const [showLogin, setShowLogin] = useState(true); // true -> show login, false -> show register
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
    const [userName, setUserName] = useState(localStorage.getItem("userName"));

    function togglePage(){
        setShowLogin(!showLogin); // Switch between pages, this basically switches the state value
    }

    function handleLogout(){
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userToken");
        setUserRole(null);
        setUserName(null);
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
            ? React.createElement(Login, { key: "login", togglePage, setUserRole, setUserName })
            : React.createElement(Register, { key: "register", togglePage, setUserRole, setUserName })
    ]);

   
}

export default App;