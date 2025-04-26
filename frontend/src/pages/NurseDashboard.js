import React, {useState}  from "react";

// Temporary placeholder -> mock data for testing, replace with real API call later
const mockPatients = [
    {id: 1, name: "patient1", status: "Pending Diagnosis"},
    {id: 2, name: "patient2", status: "Diagnosis Confirmed"},
    {id: 3, name: "patiente3", status: "Awaiting Symptoms"}
]

function NurseDashboard({handleLogout}){
    const [patients, setPatients] = useState(mockPatients); // Update
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState(""); // Tracks whats typed into the search bar

    // Placeholder function for entering symptoms
    function handleEnterSymptoms(){
        alert("This will take you to the symptom entry form"); // Placeholder, its not implemented yet
    }

    // Placeholder function for viewing diagnoses
    function handleViewDiagnoses(){
        alert("This will show you patient diagnoses"); //Placeholder, not implemented yet
    }

    // Placeholder function for exporting patient data
    function handleExportPatients(){
        alert("Exporting patient data"); // Placeholder, not implemented yet
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
        React.createElement("h2", {key: "title"}, "Welcome Nurse!"),

        // Button to take you to the enter symptoms page
        React.createElement("button", {
            key: "enterSymptoms",
            onClick: handleEnterSymptoms
        }, "Enter Symptoms"),

        // Button to view diagnoses
        React.createElement("button", {
            key: "viewDiagnoses",
            onClick: handleViewDiagnoses
        }, "View Diagnoses"),

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
            React.createElement("p", {
                key: `patient-${patient.id}` // backticks for a dynamic string
            }, patient.name + " - " + patient.status)
        ),

        React.createElement("button", {
            key: "logoutButton",
            onClick: handleLogout
        }, "Logout")
        
    ]);
}

export default NurseDashboard;