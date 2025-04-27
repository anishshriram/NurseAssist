// Copied fully from nurse dashboard. Changes Made:
// -Removed enter symptoms, generate diagnosis, submit symptoms button
// -Added confirm diagnosis button
// -minor edits to text and formatting (like nurse -> doctor)

import React, {useState}  from "react";

// Temporary placeholder -> mock data for testing, replace with real API call later
const mockPatients = [
    {id: 1, name: "patient1", status: "Pending Diagnosis", symptoms: "", diagnosis: ""},
    {id: 2, name: "patient2", status: "Diagnosis Confirmed", symptoms: "", diagnosis: ""},
    {id: 3, name: "patiente3", status: "Awaiting Symptoms", symptoms: "", diagnosis: ""}
]

function DoctorDashboard({handleLogout, userName}){
    const [patients, setPatients] = useState(mockPatients); // Update
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState(""); // Tracks whats typed into the search bar
    
    // Controls popup (for the patient that is being viewed)
    const [popupPatient, setPopupPatient] = useState(null);
    
    

    

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

        

    function handleConfirmDiagnosis(patientID){
        const updatedPatients = patients.map(patient => {
            if (patient.id === patientID) {
                return { ...patient, status: "Diagnosis Confirmed" };
            }
            return patient;
        });
    
        setPatients(updatedPatients);
        setPopupPatient(null); //Closes the popup
        alert("Diagnosis confirmed for patient ID " + patientID);
    }

    // If the doctor doesnt agree with the diagnosis, then pushes back to nurse
    function handlePushBack(patientID){
        const updatedPatients = patients.map(patient => {
            if(patient.id === patientID){
                return{...patient, status: "Needs Nurse Review"}
            }
            return patient;
        })

        setPatients(updatedPatients);
        setPopupPatient(null);
        alert("Pushed back to Nurse for review");
    }

    function openConfirmPopup(patientID){
        const patient = patients.find(p => p.id === patientID);
        if(patient){
            setPopupPatient(patient); // Actually opens the popup
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
            userName ? "Welcome Doctor " + userName + "!" : "Welcome Doctor!" // Was having issues with naming, this way it just says welcome nurse if name doesnt laod
        ),
        /*
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
        */
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
                }, "View Diagnosis"),

                React.createElement("button", {
                    key: `confirmDiagnosis-${patient.id}`,
                    onClick: () => openConfirmPopup(patient.id)
                }, "Confirm Diagnosis")
                
            ])
            //React.createElement("p", {
            //    key: `patient-${patient.id}` // backticks for a dynamic string
            //}, patient.name + " - " + patient.status)
        ),

        // Popout to confirm diagnosis, only if necessary
        popupPatient ? React.createElement("div", {key: "popup", style: {border: "1px solid black", padding: "20px", margin: "20px", backgroundColor: "#f0f0f0" }},[
            React.createElement("h3", {key: "popup-title"}, "Confirm Diagnosis for " + popupPatient.name),
            React.createElement("p", {key: "popup-symptoms"}, "Symptoms: " + (popupPatient.symptoms || "No Symptoms Entered")),
            React.createElement("p", {key: "popup-confidence"}, "Confidence Level: xx%"), //Temporary Placeholder
            React.createElement("p", {key: "popup-source"}, "Diagnosis generated via (either AI or system generated)"),
            React.createElement("button", {
                key: "confirmButton",
                onClick: () => handleConfirmDiagnosis(popupPatient.id)
            }, "Confirm Diagnosis"),
            React.createElement("button", {
                key: "pushBackButton",
                onClick: () => handlePushBack(popupPatient.id)
            }, "Push Back to Nurse")
        ])
        : null,

        React.createElement("button", {
            key: "logoutButton",
            onClick: handleLogout
        }, "Logout")
        
    ]);
}

export default DoctorDashboard;