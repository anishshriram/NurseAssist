import React, { useState, useEffect, useMemo } from "react"; 
import { searchSymptomsApi } from '../services/symptomService'; 
import { v4 as uuidv4 } from 'uuid'; 
import { debounce } from 'lodash'; 

const mockPatients = [
    {id: 1, name: "patient1", status: "Pending Diagnosis", symptoms: "", diagnosis: "", age: "", sex: ""},
    {id: 2, name: "patient2", status: "Diagnosis Confirmed", symptoms: "", diagnosis: "", age: "", sex: ""},
    {id: 3, name: "patiente3", status: "Awaiting Symptoms", symptoms: "", diagnosis: "", age: "", sex: ""}
]

function NurseDashboard({handleLogout, userName}){
    const [patients, setPatients] = useState(mockPatients); 
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedPatientID, setSelectedPatientID] = useState(null); 
    const [symptomsInput, setSymptomsInput] = useState(""); 

    const [symptomSearchTerm, setSymptomSearchTerm] = useState('');
    const [symptomSearchResults, setSymptomSearchResults] = useState([]);
    const [isSearchingSymptoms, setIsSearchingSymptoms] = useState(false);
    const [symptomSearchError, setSymptomSearchError] = useState(null);

    const [patientAge, setPatientAge] = useState(''); 
    const [patientSex, setPatientSex] = useState(''); 
    const [interviewId, setInterviewId] = useState('');

    useEffect(() => {
        const newId = uuidv4();
        setInterviewId(newId);
        console.log(">>> NurseDashboard: Generated Interview ID:", newId);
    }, []);

    const performSearch = async (phrase, age, sex, id) => {
        console.log(">>> NurseDashboard: --- performSearch ACTUAL EXECUTION ---", { phrase, age, sex, id });
        const token = localStorage.getItem('userToken');

        if (!phrase?.trim() || !age || !sex || !id || !token) { 
            setSymptomSearchResults([]);
            setIsSearchingSymptoms(false);
            let reason = 'Unknown prerequisite missing in performSearch';
            if (!phrase?.trim()) reason = 'Missing search phrase';
            else if (!age) reason = 'Missing patient age';
            else if (!sex) reason = 'Missing patient sex';
            else if (!id) reason = 'Missing interview ID';
            else if (!token) reason = 'Missing auth token';

            console.log(`>>> NurseDashboard: performSearch SKIPPED. Reason: ${reason}`);

            if (!patientAge || !patientSex) {
                 // Keep existing error
            } else {
                setSymptomSearchError(''); // Clear other errors
            }
            return;
        }

        console.log(`>>> NurseDashboard: Calling searchSymptomsApi via performSearch...`);
        setIsSearchingSymptoms(true);
        setSymptomSearchError(''); // Clear previous errors before new search

        try {
            const results = await searchSymptomsApi(phrase, age, sex, id, token);
            console.log(">>> NurseDashboard: API call successful, results:", results);
            setSymptomSearchResults(results || []); 
        } catch (error) {
            console.error(">>> NurseDashboard: Symptom search API call failed:", error);
            setSymptomSearchError(error.message || "Failed to fetch symptoms");
            setSymptomSearchResults([]); 
        } finally {
            setIsSearchingSymptoms(false);
        }
    };

    const debouncedSearchHandler = useMemo(
        () => {
            console.log(">>> NurseDashboard: Creating debounced function instance.");
            return debounce(performSearch, 500);
        },
        [] 
    );

    useEffect(() => {
        console.log(">>> NurseDashboard: Search useEffect triggered with:", { symptomSearchTerm, patientAge, patientSex, interviewId });

        if (symptomSearchTerm.trim() && patientAge && patientSex && interviewId) {
             console.log(">>> NurseDashboard: Calling debouncedSearchHandler...");
            debouncedSearchHandler(symptomSearchTerm, patientAge, patientSex, interviewId);
        } else {
             console.log(">>> NurseDashboard: Prerequisites not met or search term empty, clearing results and cancelling debounce.");
            setSymptomSearchResults([]);
             if (symptomSearchTerm.trim() && (!patientAge || !patientSex)){
                 setSymptomSearchError('Please enter patient age and sex before searching.');
             } else {
                 setSymptomSearchError(''); // Clear error if search term is empty or all details present
             }
            debouncedSearchHandler.cancel(); // Cancel any pending debounce
        }

        return () => {
             console.log(">>> NurseDashboard: useEffect cleanup - cancelling debounce.");
            debouncedSearchHandler.cancel();
        };
    }, [symptomSearchTerm, patientAge, patientSex, interviewId, debouncedSearchHandler]); 


    function handleEnterSymptoms(patientID){
        setSelectedPatientID(patientID);
        setSymptomsInput(""); 
    }

    function handleSubmitSymptoms(patientID){
        alert("Submitting manually entered symptoms for patient ID " + patientID + ": " + symptomsInput); 
        const updatedPatients = patients.map(patient => {
            if (patient.id === patientID) {
                 return { ...patient, symptoms: symptomsInput };
            }
            return patient;
        });
        setPatients(updatedPatients);
        setSelectedPatientID(null); 
    }

    function handleViewDiagnoses(patientID){
        const patient = patients.find(p => p.id === patientID);
        if (patient && patient.diagnosis) {
            alert(`Diagnosis for ` + patient.name + `: ` + patient.diagnosis);
        } else {
            alert("No diagnosis available for this patient yet.");
        }
    }

    function handleGenerateDiagnosis(patientID) {
        alert(`Generating diagnosis for patient ID ` + patientID + ". Needs backend integration.");
        const updatedPatients = patients.map(patient => {
             if (patient.id === patientID) {
                 if (patient.symptoms) {
                     return { ...patient, status: "Diagnosis Pending", diagnosis: "Auto Diagnosis Based on Symptoms" };
                 } else {
                     alert("No symptoms entered yet for this patient!");
                     return patient;
                 }
             }
             return patient;
         });
         setPatients(updatedPatients);
    }

    function handleExportPatients(){
        alert("Exporting patient data"); 
        const csvContent = "data:text/csv;charset=utf-8,"
        + "Name,Status,Symptoms,Diagnosis\n"
        + patients.map(p =>
            `${p.name},${p.status},"${p.symptoms || "N/A"}","${p.diagnosis || "N/A"}"` 
        ).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "patient_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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
        setPatients(sorted); 
    }

    function handlePatientAgeChange(e){
        setPatientAge(e.target.value);
    }

    function handlePatientSexChange(e){
        setPatientSex(e.target.value);
    }

    return React.createElement("div", { style: { padding: '20px' } }, [ 
        React.createElement("h2", {key: "title"},
            userName ? "Welcome Nurse " + userName + "!" : "Welcome Nurse!"
        ),

        React.createElement("div", { key: "symptomSearchSection", style: { margin: '20px 0', padding: '10px', border: '1px solid #ccc' } }, [
            React.createElement("h3", { key: "symptomSearchTitle" }, "Symptom Search (via Infermedica)"),
            React.createElement("input", {
                key: "symptomSearchBar",
                type: "text",
                placeholder: "Type to search symptoms...",
                value: symptomSearchTerm,
                onChange: (e) => setSymptomSearchTerm(e.target.value),
                style: { width: '300px', padding: '8px', marginBottom: '10px' }
            }),
            React.createElement("label", {key: "patientAgeLabel"}, "Patient Age:"),
            React.createElement("input", {
                key: "patientAgeInput",
                type: "number",
                value: patientAge,
                onChange: handlePatientAgeChange,
                style: { width: '100px', padding: '8px', marginBottom: '10px' }
            }),
            React.createElement("label", {key: "patientSexLabel"}, "Patient Sex:"),
            React.createElement("select", {
                key: "patientSexSelect",
                value: patientSex,
                onChange: handlePatientSexChange,
                style: { width: '100px', padding: '8px', marginBottom: '10px' }
            }, [
                React.createElement("option", {key: "maleOption", value: "male"}, "Male"),
                React.createElement("option", {key: "femaleOption", value: "female"}, "Female")
            ]),
            isSearchingSymptoms && React.createElement("p", { key: "symptomLoading" }, "Searching..."),
            symptomSearchError && React.createElement("p", { key: "symptomError", style: { color: 'red' } }, `Error: ${symptomSearchError}`),
            !isSearchingSymptoms && !symptomSearchError && React.createElement("ul", { key: "symptomResultsList", style: { listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto' } },
                 Array.isArray(symptomSearchResults) && symptomSearchResults.length > 0
                    ? symptomSearchResults.map((symptom, index) =>
                        React.createElement("li", { key: symptom.id || `symptom-${index}`, style: { padding: '5px', borderBottom: '1px solid #eee' } },
                           symptom.label || symptom.name || JSON.stringify(symptom) 
                        )
                      )
                    : !isSearchingSymptoms && symptomSearchTerm.trim() !== '' && React.createElement("li", { key: "noSymptomsFound" }, "No symptoms found.") 
            )
        ]),

        React.createElement("button", {
            key: "exportPatitents",
            onClick: handleExportPatients,
            style: { marginRight: '10px' } 
        }, "Export All Patient Data"),

        React.createElement("input", {
            key: "searchBar",
            type: "text",
            placeholder: "Search patients by name or status...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            style: { width: '300px', padding: '8px', marginRight: '10px' } 
        }),

        React.createElement("select", {
            key: "sortDropdown",
            value: sortType,
            onChange: handleSortChange,
            style: { padding: '8px' } 
        }, [
            React.createElement("option", { key: "name", value: "name" }, "Sort by Name"),
            React.createElement("option", { key: "status", value: "status" }, "Sort by Status")
        ]),


        React.createElement("h3", { key: "patientListTitle", style: { marginTop: '20px' } }, "Patient List"), 

        ...patients.filter((patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.status.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((patient) =>
            React.createElement("div", {key: `patient-${patient.id}`, style: { border: '1px solid #eee', padding: '10px', marginBottom: '10px' } }, [ 
                React.createElement("p", {key: `patient-info-${patient.id}`, style: { fontWeight: 'bold' } }, 
                    patient.name + " - " + patient.status
                ),

                patient.symptoms && React.createElement("p", { key: `patient-symptoms-display-${patient.id}`},
                    "Symptoms Entered: " + patient.symptoms
                 ),

                React.createElement("button", {
                    key: `enterSymptoms-${patient.id}`,
                    onClick: () => handleEnterSymptoms(patient.id),
                    style: { marginRight: '5px' } 
                }, "Enter/Edit Symptoms Manually"),

                React.createElement("button", {
                    key: `generateDiagnosis-${patient.id}`,
                    onClick: () => handleGenerateDiagnosis(patient.id),
                     disabled: !patient.symptoms, 
                    style: { marginRight: '5px' } 
                }, "Generate Diagnosis"),

                React.createElement("button", {
                    key: `viewDiagnosis-${patient.id}`,
                    onClick: () => handleViewDiagnoses(patient.id),
                    disabled: !patient.diagnosis, 
                    style: { marginRight: '5px' } 
                }, "View Diagnosis"),

                patient.diagnosis && React.createElement("p", { key: `patient-diagnosis-display-${patient.id}`},
                    "Diagnosis Result: " + patient.diagnosis
                 ),


                selectedPatientID === patient.id
                ? React.createElement("div", {key: `symptomForm-${patient.id}`, style: { marginTop: '10px' } }, [ 
                    React.createElement("input", {
                        key: `symptomInput-${patient.id}`,
                        type: "text",
                        placeholder: "Enter Symptoms Manually Here...",
                        value: symptomsInput,
                        onChange: (e) => setSymptomsInput(e.target.value),
                        style: { marginRight: '5px', padding: '5px' } 
                    }),
                    React.createElement("button", {
                        key: `submitSymptoms-${patient.id}`,
                        onClick: () => handleSubmitSymptoms(patient.id)
                    }, "Submit Manual Symptoms")
                ])
                : null
            ])
        ),

        handleLogout && React.createElement("button", {
            key: "logout",
            onClick: handleLogout,
            style: { marginTop: '20px', display: 'block' } 
        }, "Logout")

    ]); 
}

export default NurseDashboard;