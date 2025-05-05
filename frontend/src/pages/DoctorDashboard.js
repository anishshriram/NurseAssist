import React, { useState, useEffect } from "react";
import { getDoctorDiagnosesApi, confirmDiagnosisApi } from '../services/symptomService';

function DoctorDashboard({handleLogout, userName}){
    // Define styles and theme colors for the dashboard
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
        // Layout
        container: {
            padding: '20px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #E0E0E0',
            paddingBottom: '15px'
        },
        title: {
            color: '#1976D2',
            fontSize: '24px',
            fontWeight: '500',
            margin: '0'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#E3F2FD',
            padding: '8px 15px',
            borderRadius: '20px',
            color: '#0D47A1'
        },
        userIcon: {
            backgroundColor: '#1976D2',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            fontSize: '14px',
            fontWeight: 'bold'
        },
        controls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        searchBar: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: '4px',
            padding: '8px 15px',
            width: '300px'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '14px'
        },
        filterControls: {
            display: 'flex',
            gap: '15px'
        },
        select: {
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            backgroundColor: 'white',
            outline: 'none'
        },
        diagnosisCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '20px',
            marginBottom: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #E0E0E0',
            borderLeft: '5px solid #1976D2'
        },
        diagnosisCardConfirmed: {
            borderLeft: '5px solid #4CAF50'
        },
        diagnosisCritical: {
            borderLeft: '5px solid #F44336'
        },
        diagnosisHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
        },
        diagnosisTitle: {
            margin: '0',
            fontSize: '18px',
            fontWeight: '500',
            color: '#333333'
        },
        statusBadge: {
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'inline-block'
        },
        pendingBadge: {
            backgroundColor: '#FFF3E0',
            color: '#E65100'
        },
        confirmedBadge: {
            backgroundColor: '#E8F5E9',
            color: '#388E3C'
        },
        diagnosisDetails: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px',
            fontSize: '14px'
        },
        detailItem: {
            marginBottom: '5px'
        },
        detailLabel: {
            fontWeight: '500',
            color: '#757575',
            marginRight: '5px'
        },
        detailValue: {
            color: '#333333'
        },
        actionButtons: {
            display: 'flex',
            gap: '10px',
            marginTop: '15px'
        },
        primaryButton: {
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 15px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        successButton: {
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 15px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        dangerButton: {
            backgroundColor: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 15px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        secondaryButton: {
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
            border: '1px solid #1976D2',
            borderRadius: '4px',
            padding: '8px 15px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        disabledButton: {
            backgroundColor: '#E0E0E0',
            color: '#9E9E9E',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 15px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'not-allowed'
        },
        modal: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '25px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #E0E0E0',
            paddingBottom: '15px'
        },
        modalTitle: {
            margin: '0',
            color: '#1976D2',
            fontSize: '20px',
            fontWeight: '500'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#757575'
        },
        modalSection: {
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '16px',
            fontWeight: '500',
            color: '#333333',
            marginBottom: '10px',
            borderBottom: '1px solid #E0E0E0',
            paddingBottom: '5px'
        },
        symptomsList: {
            padding: '0 0 0 20px',
            margin: '10px 0',
            listStyle: 'disc'
        },
        symptomItem: {
            marginBottom: '5px'
        },
        criticalFlag: {
            display: 'inline-block',
            padding: '5px 10px',
            backgroundColor: '#FFEBEE',
            color: '#D32F2F',
            borderRadius: '4px',
            fontWeight: '500',
            marginBottom: '15px'
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px',
            marginTop: '30px'
        }
    };
    
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

    return React.createElement("div", { style: styles.container }, [
        // Header with user info and title
        React.createElement("div", { key: "header", style: styles.header }, [
            React.createElement("h1", { key: "title", style: styles.title }, "NurseAssist Doctor Dashboard"),
            React.createElement("div", { key: "user-info", style: styles.userInfo }, [
                React.createElement("div", { key: "user-icon", style: styles.userIcon }, "Dr"),
                React.createElement("span", { key: "user-name" }, userName ? `Dr. ${userName}` : "Doctor")
            ])
        ]),
        
        // Controls section
        React.createElement("div", { key: "controls", style: styles.controls }, [
            // Search bar
            React.createElement("div", { key: "search-bar", style: styles.searchBar }, [
                React.createElement("input", {
                    key: "searchBox", 
                    type: "text", 
                    placeholder: "Search by patient name or condition...", 
                    value: searchTerm, 
                    onChange: (e) => setSearchTerm(e.target.value),
                    style: styles.searchInput
                })
            ]),
            // Filter controls
            React.createElement("div", { key: "filter-controls", style: styles.filterControls }, [
                React.createElement("select", {
                    key: "sortDropdown",
                    value: sortType,
                    onChange: handleSortChange,
                    style: styles.select
                }, [
                    React.createElement("option", { key: "name", value: "name" }, "Sort by Patient Name"),
                    React.createElement("option", { key: "date", value: "date" }, "Sort by Date"),
                    React.createElement("option", { key: "confidence", value: "confidence" }, "Sort by Confidence")
                ]),
                React.createElement("button", {
                    key: "exportButton",
                    onClick: handleExportPatients,
                    style: styles.secondaryButton
                }, "Export Data")
            ])
        ]),
        
        // Display heading for diagnoses section
        React.createElement("h3", { key: "diagnoses-section-title", style: { color: styles.colors.primary, marginTop: '30px', marginBottom: '15px' } }, "Patient Diagnoses"),
        
        // Display loading, error or content
        loading ? 
            React.createElement("div", { key: "loading", style: styles.loading }, [
                React.createElement("span", { style: styles.loadingSpinner }),
                React.createElement("span", null, "Loading diagnoses...")
            ]) :
        error ? 
            React.createElement("div", { key: "error", style: Object.assign({}, styles.messageBox, styles.error) }, `Error: ${error}`) :
        diagnoses.length === 0 ? 
            React.createElement("div", { key: "empty", style: Object.assign({}, styles.messageBox, styles.info) }, "No diagnoses found for your patients.") :
        React.createElement("div", { key: "diagnoses-container" }, [

            
            // Diagnoses list
            ...displayDiagnoses.map(diagnosis => 
                React.createElement("div", {
                    key: `diagnosis-${diagnosis.id}`,
                    style: Object.assign({}, 
                        styles.diagnosisCard, 
                        diagnosis.doctor_confirmation ? styles.diagnosisCardConfirmed : {},
                        diagnosis.critical_flag ? styles.diagnosisCritical : {}
                    )
                }, [
                    // Diagnosis header with patient name and status
                    React.createElement("div", { key: `diag-header-${diagnosis.id}`, style: styles.diagnosisHeader }, [
                        React.createElement("h4", { key: `patient-${diagnosis.id}`, style: styles.diagnosisTitle }, 
                            diagnosis.patient_name || 'Unknown Patient'
                        ),
                        React.createElement("span", { 
                            key: `status-${diagnosis.id}`,
                            style: Object.assign({}, 
                                styles.statusBadge,
                                diagnosis.doctor_confirmation ? styles.confirmedBadge : styles.pendingBadge
                            )
                        }, 
                            diagnosis.doctor_confirmation ? "Confirmed" : "Pending Review"
                        )
                    ]),
                    
                    // Critical flag if applicable
                    diagnosis.critical_flag && React.createElement("div", { 
                        key: `critical-flag-${diagnosis.id}`,
                        style: styles.criticalFlag
                    }, "⚠️ Critical Condition"),
                    
                    // Diagnosis details in a grid layout
                    React.createElement("div", { key: `details-grid-${diagnosis.id}`, style: styles.diagnosisDetails }, [
                        React.createElement("div", { key: `condition-detail-${diagnosis.id}`, style: styles.detailItem }, [
                            React.createElement("span", { key: `condition-label-${diagnosis.id}`, style: styles.detailLabel }, "Condition:"),
                            React.createElement("span", { key: `condition-value-${diagnosis.id}`, style: styles.detailValue }, 
                                diagnosis.condition_name || 'Unknown')
                        ]),
                        React.createElement("div", { key: `confidence-detail-${diagnosis.id}`, style: styles.detailItem }, [
                            React.createElement("span", { key: `confidence-label-${diagnosis.id}`, style: styles.detailLabel }, "Confidence:"),
                            React.createElement("span", { key: `confidence-value-${diagnosis.id}`, style: styles.detailValue }, 
                                `${parseFloat(diagnosis.confidence_score || 0).toFixed(1)}%`)
                        ]),
                        React.createElement("div", { key: `date-detail-${diagnosis.id}`, style: styles.detailItem }, [
                            React.createElement("span", { key: `date-label-${diagnosis.id}`, style: styles.detailLabel }, "Date:"),
                            React.createElement("span", { key: `date-value-${diagnosis.id}`, style: styles.detailValue }, 
                                new Date(diagnosis.diagnosis_date).toLocaleDateString() || 'Unknown')
                        ]),
                        React.createElement("div", { key: `nurse-detail-${diagnosis.id}`, style: styles.detailItem }, [
                            React.createElement("span", { key: `nurse-label-${diagnosis.id}`, style: styles.detailLabel }, "Nurse:"),
                            React.createElement("span", { key: `nurse-value-${diagnosis.id}`, style: styles.detailValue }, 
                                diagnosis.nurse_name || 'Unknown')
                        ])
                    ]),
                    
                    // Buttons for actions
                    React.createElement("div", { key: `actions-${diagnosis.id}`, style: styles.actionButtons }, [
                        React.createElement("button", {
                            key: `view-${diagnosis.id}`,
                            onClick: () => openDiagnosisDetails(diagnosis.id),
                            style: styles.primaryButton
                        }, "View Details"),
                        
                        !diagnosis.doctor_confirmation && React.createElement("button", {
                            key: `confirm-${diagnosis.id}`,
                            onClick: () => handleConfirmDiagnosis(diagnosis.id, true),
                            disabled: isConfirming,
                            style: isConfirming ? styles.disabledButton : styles.successButton
                        }, isConfirming ? "Confirming..." : "Confirm"),
                        
                        !diagnosis.doctor_confirmation && React.createElement("button", {
                            key: `reject-${diagnosis.id}`,
                            onClick: () => handleRejectDiagnosis(diagnosis.id),
                            disabled: isConfirming,
                            style: isConfirming ? styles.disabledButton : styles.dangerButton
                        }, isConfirming ? "Rejecting..." : "Reject")
                    ])
                ])
            )
        ]),
        
        // Diagnosis details popup (modal)
        selectedDiagnosis && React.createElement("div", {
            key: "diagnosis-detail-popup",
            style: styles.modal
        }, [
            React.createElement("div", { key: "modal-content", style: styles.modalContent }, [
                // Modal header
                React.createElement("div", { key: "modal-header", style: styles.modalHeader }, [
                    React.createElement("h3", { key: "modal-title", style: styles.modalTitle }, 
                        `Diagnosis Details: ${selectedDiagnosis.condition_name}`
                    ),
                    React.createElement("button", {
                        key: "close-modal",
                        onClick: () => setSelectedDiagnosis(null),
                        style: styles.closeButton
                    }, "×")
                ]),
                
                // Critical flag if applicable
                selectedDiagnosis.critical_flag && React.createElement("div", { 
                    key: "modal-critical-flag",
                    style: styles.criticalFlag
                }, "⚠️ Critical Condition"),
                
                // Patient and diagnosis info section
                React.createElement("div", { key: "modal-patient-section", style: styles.modalSection }, [
                    React.createElement("h4", { key: "patient-section-title", style: styles.sectionTitle }, "Patient Information"),
                    React.createElement("div", { key: "modal-details-grid", style: styles.diagnosisDetails }, [
                        React.createElement("div", { key: "modal-patient", style: styles.detailItem }, [
                            React.createElement("span", { key: "modal-patient-label", style: styles.detailLabel }, "Patient:"),
                            React.createElement("span", { key: "modal-patient-value", style: styles.detailValue }, 
                                selectedDiagnosis.patient_name || 'Unknown')
                        ]),
                        React.createElement("div", { key: "modal-nurse", style: styles.detailItem }, [
                            React.createElement("span", { key: "modal-nurse-label", style: styles.detailLabel }, "Diagnosed by:"),
                            React.createElement("span", { key: "modal-nurse-value", style: styles.detailValue }, 
                                selectedDiagnosis.nurse_name || 'Unknown')
                        ]),
                        React.createElement("div", { key: "modal-date", style: styles.detailItem }, [
                            React.createElement("span", { key: "modal-date-label", style: styles.detailLabel }, "Date:"),
                            React.createElement("span", { key: "modal-date-value", style: styles.detailValue }, 
                                new Date(selectedDiagnosis.diagnosis_date).toLocaleDateString())
                        ]),
                        React.createElement("div", { key: "modal-confidence", style: styles.detailItem }, [
                            React.createElement("span", { key: "modal-confidence-label", style: styles.detailLabel }, "Confidence Score:"),
                            React.createElement("span", { key: "modal-confidence-value", style: styles.detailValue }, 
                                `${selectedDiagnosis.confidence_score?.toFixed(1)}%`)
                        ])
                    ])
                ]),
                
                // Symptoms section
                React.createElement("div", { key: "modal-symptoms-section", style: styles.modalSection }, [
                    React.createElement("h4", { key: "symptoms-section-title", style: styles.sectionTitle }, "Symptoms"),
                    selectedDiagnosis.symptoms && selectedDiagnosis.symptoms.length > 0 ?
                        React.createElement("ul", { key: "symptoms-list", style: styles.symptomsList },
                            selectedDiagnosis.symptoms.map((symptom, index) =>
                                React.createElement("li", { key: `symptom-${index}`, style: styles.symptomItem },
                                    React.createElement("span", { key: `symptom-name-${index}`, style: { fontWeight: '500' } }, symptom.name),
                                    React.createElement("span", { key: `symptom-details-${index}` }, 
                                        ` (${symptom.severity || 'moderate'})${symptom.duration ? ` - Duration: ${symptom.duration}` : ''}`
                                    )
                                )
                            )
                        ) :
                        React.createElement("p", { key: "no-symptoms" }, "No detailed symptoms available")
                ]),
                
                // Action buttons
                !selectedDiagnosis.doctor_confirmation && React.createElement("div", { key: "modal-actions", style: styles.modalActions }, [
                    React.createElement("button", {
                        key: "modal-confirm",
                        onClick: () => handleConfirmDiagnosis(selectedDiagnosis.id, true),
                        disabled: isConfirming,
                        style: isConfirming ? styles.disabledButton : styles.successButton
                    }, isConfirming ? "Processing..." : "Confirm Diagnosis"),
                    
                    React.createElement("button", {
                        key: "modal-reject",
                        onClick: () => handleRejectDiagnosis(selectedDiagnosis.id),
                        disabled: isConfirming,
                        style: isConfirming ? styles.disabledButton : styles.dangerButton
                    }, isConfirming ? "Processing..." : "Reject Diagnosis")
                ])
            ])
        ]),
        
        // Logout button
        React.createElement("button", {
            key: "logoutButton",
            onClick: handleLogout,
            style: Object.assign({}, styles.dangerButton, { marginTop: '30px' })
        }, "Sign Out")
        
    ]);
}

export default DoctorDashboard;