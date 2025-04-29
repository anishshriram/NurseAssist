import React, { useState, useEffect } from "react";
import { getDoctorDiagnosesApi, confirmDiagnosisApi } from '../services/symptomService';

function DoctorDashboard({handleLogout, userName}){
    // State for patient diagnoses data
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState(""); // Tracks what's typed into the search bar
    
    // For diagnosis confirmation popup
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    
    // Fetch diagnoses for all patients assigned to this doctor
    useEffect(() => {
        const fetchDiagnoses = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get token from localStorage
                const token = localStorage.getItem('userToken');
                if (!token) {
                    throw new Error('Authentication required. Please login again.');
                }
                
                // Fetch diagnoses from API
                const diagnosesData = await getDoctorDiagnosesApi(token);
                console.log('Fetched diagnoses:', diagnosesData);
                setDiagnoses(diagnosesData);
                
            } catch (err) {
                console.error('Error fetching diagnoses:', err);
                setError(err.message || 'Failed to load diagnoses');
            } finally {
                setLoading(false);
            }
        };
        
        fetchDiagnoses();
    }, []);
    

    /**
     * View detailed information about a diagnosis
     * This is called from the openDiagnosisDetails function
     */
    function openDiagnosisDetails(diagnosisId) {
        const diagnosis = diagnoses.find(d => d.id === diagnosisId);
        if (diagnosis) {
            setSelectedDiagnosis(diagnosis);
        }
    }
    
    /**
     * Confirm a diagnosis (doctor approves)
     */
    async function handleConfirmDiagnosis(diagnosisId, isApproved = true) {
        try {
            setIsConfirming(true);
            
            // Get token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }
            
            // Call the API to confirm or reject the diagnosis
            await confirmDiagnosisApi(diagnosisId, isApproved, token);
            
            // Update local state - update the status of the confirmed diagnosis
            setDiagnoses(prev => prev.map(d => {
                if (d.id === diagnosisId) {
                    return { ...d, doctor_confirmation: isApproved };
                }
                return d;
            }));
            
            // Close the detail popup
            setSelectedDiagnosis(null);
            
            // Show feedback
            alert(`Diagnosis has been ${isApproved ? 'confirmed' : 'rejected'}.`);
            
        } catch (error) {
            console.error('Error confirming diagnosis:', error);
            alert(`Failed to ${isApproved ? 'confirm' : 'reject'} diagnosis: ${error.message}`);
        } finally {
            setIsConfirming(false);
        }
    }
    
    /**
     * Reject a diagnosis (doctor disagrees)
     */
    function handleRejectDiagnosis(diagnosisId) {
        handleConfirmDiagnosis(diagnosisId, false);
    }
    


    /**
     * Export diagnosis data as CSV
     */
    function handleExportPatients() {
        if (diagnoses.length === 0) {
            alert("No diagnosis data to export");
            return;
        }
        
        // Create CSV string with diagnosis data
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Patient,Condition,Confidence,Date,Status,Nurse\n" 
            + diagnoses.map(d => 
                `"${d.patient_name || 'Unknown'}",` +
                `"${d.condition_name || 'Unknown'}",` +
                `${parseFloat(d.confidence_score || 0).toFixed(1)}%,` +
                `${new Date(d.diagnosis_date).toLocaleDateString() || 'Unknown'},` +
                `${d.doctor_confirmation ? 'Confirmed' : 'Pending'},` +
                `"${d.nurse_name || 'Unknown'}"`
            ).join("\n");

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "diagnosis_data.csv");
        document.body.appendChild(link);

        // Trigger download
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Sort diagnoses by different criteria
     */
    function handleSortChange(e) {
        const selected = e.target.value;
        setSortType(selected);
        
        // We don't need to modify the diagnoses array directly,
        // sorting will be applied during render
    }

    // Prepare sorted and filtered diagnoses for display
    const displayDiagnoses = [...diagnoses]
        // Apply sorting
        .sort((a, b) => {
            if (sortType === "name") {
                return a.patient_name?.localeCompare(b.patient_name || '') || 0;
            } else if (sortType === "date") {
                return new Date(b.diagnosis_date || 0) - new Date(a.diagnosis_date || 0);
            } else if (sortType === "confidence") {
                return (b.confidence_score || 0) - (a.confidence_score || 0);
            }
            return 0;
        })
        // Apply filtering
        .filter(diagnosis => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                (diagnosis.patient_name?.toLowerCase().includes(searchTermLower)) ||
                (diagnosis.condition_name?.toLowerCase().includes(searchTermLower)) ||
                (diagnosis.doctor_confirmation ? 'confirmed' : 'pending').includes(searchTermLower)
            );
        });

    return React.createElement("div", { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } }, [
        // Title and header section
        React.createElement("div", { key: "header", style: { marginBottom: '20px' } }, [
            React.createElement("h2", { key: "title" }, 
                userName ? `Welcome Dr. ${userName}!` : "Welcome Doctor!"
            ),
            
            React.createElement("div", { key: "controls", style: { display: 'flex', justifyContent: 'space-between', marginTop: '15px' } }, [
                React.createElement("button", {
                    key: "exportData",
                    onClick: handleExportPatients,
                    style: { padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
                }, "Export Patient Data"),
                
                React.createElement("input", {
                    key: "searchBar",
                    type: "text",
                    placeholder: "Search by patient name or condition...",
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    style: { padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ddd' }
                }),
            ])
        ]),
        
        // Display loading, error or content
        loading ? React.createElement("p", { key: "loading" }, "Loading diagnoses...") :
        error ? React.createElement("p", { key: "error", style: { color: 'red' } }, `Error: ${error}`) :
        diagnoses.length === 0 ? React.createElement("p", { key: "empty" }, "No diagnoses found for your patients.") :
        React.createElement("div", { key: "diagnoses-container" }, [
            // Header for diagnoses list
            React.createElement("div", { key: "diagnoses-header", style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } }, [
                React.createElement("h3", { key: "diagnoses-title" }, "Patient Diagnoses"),
                
                // Sorting dropdown
                React.createElement("select", {
                    key: "sortDropdown",
                    value: sortType,
                    onChange: handleSortChange,
                    style: { padding: '5px', borderRadius: '4px' }
                }, [
                    React.createElement("option", { key: "name", value: "name" }, "Sort by Patient Name"),
                    React.createElement("option", { key: "date", value: "date" }, "Sort by Date"),
                    React.createElement("option", { key: "confidence", value: "confidence" }, "Sort by Confidence")
                ])
            ]),
            
            // Diagnoses list
            ...displayDiagnoses.map(diagnosis => 
                React.createElement("div", {
                    key: `diagnosis-${diagnosis.id}`,
                    style: { 
                        padding: '15px', 
                        marginBottom: '15px', 
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        borderLeft: diagnosis.critical_flag ? '5px solid #ff4444' : '1px solid #ddd',
                        backgroundColor: diagnosis.doctor_confirmation ? '#e8f5e9' : '#fff'
                    }
                }, [
                    // Diagnosis header with patient name and status
                    React.createElement("div", { key: `diag-header-${diagnosis.id}`, style: { display: 'flex', justifyContent: 'space-between' } }, [
                        React.createElement("h4", { key: `patient-${diagnosis.id}`, style: { margin: '0 0 10px' } }, 
                            `Patient: ${diagnosis.patient_name || 'Unknown'}`
                        ),
                        React.createElement("span", { 
                            key: `status-${diagnosis.id}`,
                            style: {
                                padding: '3px 8px',
                                backgroundColor: diagnosis.doctor_confirmation ? '#4CAF50' : '#ff9800',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }
                        }, 
                            diagnosis.doctor_confirmation ? "Confirmed" : "Pending Review"
                        )
                    ]),
                    
                    // Diagnosis details
                    React.createElement("p", { key: `condition-${diagnosis.id}` },
                        React.createElement("strong", null, "Condition: "),
                        `${diagnosis.condition_name || 'Unknown'}`
                    ),
                    React.createElement("p", { key: `confidence-${diagnosis.id}` },
                        React.createElement("strong", null, "Confidence: "),
                        `${parseFloat(diagnosis.confidence_score || 0).toFixed(1)}%`
                    ),
                    React.createElement("p", { key: `date-${diagnosis.id}` },
                        React.createElement("strong", null, "Date: "),
                        `${new Date(diagnosis.diagnosis_date).toLocaleDateString() || 'Unknown'}`
                    ),
                    React.createElement("p", { key: `nurse-${diagnosis.id}` },
                        React.createElement("strong", null, "Nurse: "),
                        `${diagnosis.nurse_name || 'Unknown'}`
                    ),
                    
                    // Buttons for actions
                    React.createElement("div", { key: `actions-${diagnosis.id}`, style: { marginTop: '15px', display: 'flex', gap: '10px' } }, [
                        React.createElement("button", {
                            key: `view-${diagnosis.id}`,
                            onClick: () => openDiagnosisDetails(diagnosis.id),
                            style: {
                                padding: '5px 10px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }
                        }, "View Details"),
                        
                        !diagnosis.doctor_confirmation && React.createElement("button", {
                            key: `confirm-${diagnosis.id}`,
                            onClick: () => handleConfirmDiagnosis(diagnosis.id, true),
                            disabled: isConfirming,
                            style: {
                                padding: '5px 10px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                opacity: isConfirming ? 0.7 : 1
                            }
                        }, isConfirming ? "Confirming..." : "Confirm"),
                        
                        !diagnosis.doctor_confirmation && React.createElement("button", {
                            key: `reject-${diagnosis.id}`,
                            onClick: () => handleRejectDiagnosis(diagnosis.id),
                            disabled: isConfirming,
                            style: {
                                padding: '5px 10px',
                                backgroundColor: '#F44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                opacity: isConfirming ? 0.7 : 1
                            }
                        }, isConfirming ? "Rejecting..." : "Reject")
                    ])
                ])
            )
        ]),
        
        // Diagnosis details popup
        selectedDiagnosis && React.createElement("div", {
            key: "diagnosis-detail-popup",
            style: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxWidth: '600px',
                backgroundColor: 'white',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                zIndex: 1000
            }
        }, [
            // Popup header
            React.createElement("div", { key: "popup-header", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } }, [
                React.createElement("h3", { key: "popup-title" }, `Diagnosis Details: ${selectedDiagnosis.condition_name}`),
                React.createElement("button", {
                    key: "close-popup",
                    onClick: () => setSelectedDiagnosis(null),
                    style: {
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }
                }, "×")
            ]),
            
            // Patient and diagnosis info
            React.createElement("div", { key: "popup-patient-info", style: { marginBottom: '15px' } }, [
                React.createElement("p", null, [
                    React.createElement("strong", null, "Patient: "),
                    selectedDiagnosis.patient_name
                ]),
                React.createElement("p", null, [
                    React.createElement("strong", null, "Diagnosed by: "),
                    selectedDiagnosis.nurse_name
                ]),
                React.createElement("p", null, [
                    React.createElement("strong", null, "Date: "),
                    new Date(selectedDiagnosis.diagnosis_date).toLocaleDateString()
                ]),
                React.createElement("p", null, [
                    React.createElement("strong", null, "Confidence Score: "),
                    `${selectedDiagnosis.confidence_score?.toFixed(1)}%`
                ]),
                selectedDiagnosis.critical_flag && React.createElement("p", { style: { color: '#ff4444', fontWeight: 'bold' } }, "⚠️ Critical Condition")
            ]),
            
            // Symptoms section
            React.createElement("div", { key: "popup-symptoms", style: { marginBottom: '15px' } }, [
                React.createElement("h4", null, "Symptoms"),
                selectedDiagnosis.symptoms && selectedDiagnosis.symptoms.length > 0 ?
                    React.createElement("ul", { style: { paddingLeft: '20px' } },
                        selectedDiagnosis.symptoms.map((symptom, index) =>
                            React.createElement("li", { key: `symptom-${index}` },
                                `${symptom.name} (${symptom.severity || 'moderate'})${symptom.duration ? ` - Duration: ${symptom.duration}` : ''}`
                            )
                        )
                    ) :
                    React.createElement("p", null, "No detailed symptoms available")
            ]),
            
            // Action buttons
            !selectedDiagnosis.doctor_confirmation && React.createElement("div", { key: "popup-actions", style: { display: 'flex', justifyContent: 'space-between', marginTop: '20px' } }, [
                React.createElement("button", {
                    onClick: () => handleConfirmDiagnosis(selectedDiagnosis.id, true),
                    disabled: isConfirming,
                    style: {
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1,
                        marginRight: '10px'
                    }
                }, isConfirming ? "Processing..." : "Confirm Diagnosis"),
                
                React.createElement("button", {
                    onClick: () => handleRejectDiagnosis(selectedDiagnosis.id),
                    disabled: isConfirming,
                    style: {
                        padding: '8px 16px',
                        backgroundColor: '#F44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1
                    }
                }, isConfirming ? "Processing..." : "Reject Diagnosis")
            ])
        ]),
        
        // Logout button
        React.createElement("button", {
            key: "logoutButton",
            onClick: handleLogout,
            style: {
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
            }
        }, "Logout")
        
    ]);
}

export default DoctorDashboard;