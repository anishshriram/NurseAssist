// Pretty much same as nurse dashboard, only removed functionality to do anything other than see the patients

import React, {useState}  from "react";

// Temporary placeholder -> mock data for testing, replace with real API call later
const mockPatients = [
    {id: 1, name: "patient1", status: "Pending Diagnosis", symptoms: "", diagnosis: ""},
    {id: 2, name: "patient2", status: "Diagnosis Confirmed", symptoms: "", diagnosis: ""},
    {id: 3, name: "patiente3", status: "Awaiting Symptoms", symptoms: "", diagnosis: ""}
]

function AdminDashboard({handleLogout, userName}){
    const [patients, setPatients] = useState(mockPatients); // Update
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState(""); // Tracks whats typed into the search bar
    

    

    // Placeholder function for viewing diagnoses
    function handleViewDiagnoses(patientID){
        //alert("This will show you patient diagnoses"); //Placeholder, not implemented yet
        const patient = patients.find(p => p.id === patientID);
        if (patient && patient.diagnosis) {
            alert(`Diagnosis for ` + patient.name + `: ` + patient.diagnosis);
        } else {
            alert("No diagnosis available for this patient yet.");
        }
    }

    

    // Placeholder function for exporting patient data
    function handleExportPatients(){
        alert("Exporting patient data"); // Placeholder, not implemented yet
        // Create CSV string
        const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Status,Symptoms,Diagnosis\n" 
        + patients.map(p => 
            `${p.name},${p.status},${p.symptoms || "N/A"},${p.diagnosis || "N/A"}`
        ).join("\n");

        //Creating a download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "patient_data.csv");
        document.body.appendChild(link);

        // Trigger download
        link.click();
        document.body.removeChild(link);
    }
    
    // Sort patients whenever sortType changes
    function handleSortChange(e){
        const selected = e.target.value;
        setSortType(selected);

        const sorted = [...patients].sort((a,b) => {
            if(selected === "name"){
                return a.name.localeCompare(b.name);
            }else if(selected === "status"){
                return a.status.localeCompare(b.status);
            }
            return 0;
        });

        setPatients(sorted); // Update list
    }

    return React.createElement("div", null, [
        // Title element
        React.createElement("h2", {key: "title"}, 
            userName ? "Welcome Admin " + userName + "!" : "Welcome Admin!" // Was having issues with naming, this way it just says welcome nurse if name doesnt laod
        ),
        
        // Button to export patient data
        React.createElement("button", {
            key: "exportPatitents",
            onClick: handleExportPatients
        }, "Export All Patient Data"),

        React.createElement("input", {
            key: "searchBar",
            type: "text",
            placeholder: "Search by name or status...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value)
        }),
        

        // List of all patients
        React.createElement("h3", { key: "patientListTitle" }, "Patient List and Status"),
        
        // Dropdown for sorting patitents
        React.createElement("select", {
            key: "sortDropdown",
            value: sortType,
            onChange: handleSortChange
        }, [
            React.createElement("option", { key: "name", value: "name" }, "Sort by Name"),
            React.createElement("option", { key: "status", value: "status" }, "Sort by Status")
        ]),

        // List each patient with their status, sorting too
        ...patients.filter((patient) =>
                    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.status.toLowerCase().includes(searchTerm.toLowerCase())
                    //add filters later for condition and symptom filters if needed
                ).map((patient) =>
                    React.createElement("div", {key: `patient-${patient.id}`}, [
                        // Shwoing the patient name and status
                        React.createElement("p", {key: `patient-info-${patient.id}`},
                            patient.name + " - " + patient.status
                        ),
        
                        React.createElement("button", {
                            key: `viewDiagnosis-${patient.id}`,
                            onClick: () => handleViewDiagnoses(patient.id)
                        }, "View Diagnosis")
                        
                    ])
                    //React.createElement("p", {
                    //    key: `patient-${patient.id}` // backticks for a dynamic string
                    //}, patient.name + " - " + patient.status)
                ),

        React.createElement("button", {
            key: "logoutButton",
            onClick: handleLogout
        }, "Logout")
        
    ]);
}

export default AdminDashboard;