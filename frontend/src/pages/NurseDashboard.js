import React, {useState}  from "react";

// Temporary placeholder -> mock data for testing, replace with real API call later
const mockPatients = [
    {id: 1, name: "patient1", status: "Pending Diagnosis"},
    {id: 2, name: "patient2", status: "Diagnosis Confirmed"},
    {id: 3, name: "patiente3", status: "Awaiting Symptoms"}
]

function NurseDashboard({handleLogout, userName}){
    const [patients, setPatients] = useState(mockPatients); // Update
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState(""); // Tracks whats typed into the search bar
    const [selectedPatientID, setSelectedPatientID] = useState(null); // Patient ID who we are tracking
    const [symptomsInput, setSymptomsInput] = useState(""); // Symptom text input

    // Function for entering symptoms
    function handleEnterSymptoms(patientID){
        // alert("This will take you to the symptom entry form"); // Placeholder, its not implemented yet
        setSelectedPatientID(patientID);
        setSymptomsInput(""); // Clear input
    }

    function handleSubmitSymptoms(patientID){
        alert("Submitting symptoms for patient ID ${patientID}: ${symptomsInput}");
        setSelectedPatientID(null); // Clear form for input
    }

    // Placeholder function for viewing diagnoses
    function handleViewDiagnoses(){
        alert("This will show you patient diagnoses"); //Placeholder, not implemented yet
    }

    // Placeholder function for generating diagnoses
    function handleGenerateDiagnosis(patientID) {
        alert(`Generating diagnosis for patient ID ${patientID}`);
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
        React.createElement("h2", {key: "title"}, 
            userName ? "Welcome Nurse " + userName + "!" : "Welcome Nurse!" // Was having issues with naming, this way it just says welcome nurse if name doesnt laod
        ),

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
            React.createElement("div", {key: `patient-${patient.id}`}, [
                // Shwoing the patient name and status
                React.createElement("p", {key: `patient-info-${patient.id}`},
                    patient.name + " - " + patient.status
                ),

                // Enter Symptoms button
                React.createElement("button", {
                    key: `enterSymptoms-${patient.id}`,
                    onClick: () => handleEnterSymptoms(patient.id)
                }, "Enter Symptoms"),

                // Generate Diagnosis Button
                React.createElement("button", {
                    key: `generateDiagnosis-${patient.id}`,
                    onClick: () => handleGenerateDiagnosis(patient.id)
                }, "Generate Diagnosis"),

                // Symptoms Input Form
                selectedPatientID === patient.id
                ? React.createElement("div", {key: `symptomForm-${patient.id}`}, [
                    React.createElement("input", {
                        key: `symptomInput-${patient.id}`,
                        type: "text",
                        placeholder: "Enter Symptoms Here...",
                        value: symptomsInput,
                        onChange: (e) => setSymptomsInput(e.target.value)
                    }),
                    React.createElement("button", {
                        key: `submitSymptoms-${patient.id}`,
                        onClick: () => handleSubmitSymptoms(patient.id)
                    }, "Submit Symptoms")
                ])
                : null
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

export default NurseDashboard;