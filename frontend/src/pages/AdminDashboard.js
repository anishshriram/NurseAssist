import React, { useState, useEffect } from "react";
import { getAllPatientsApi, createPatientApi, updatePatientApi, getDoctorsApi, getNursesApi, deletePatientApi, getAllApiLogsApi } from '../services/adminService';

function AdminDashboard({ handleLogout, userName }) {
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
        wrapper: { 
            padding: '30px', 
            maxWidth: '1300px', 
            margin: '0 auto',
            backgroundColor: '#F8FAFC',
            minHeight: '100vh'
        },
        // Header section
        header: { 
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        },
        title: { 
            margin: 0,
            fontSize: '28px',
            color: '#1976D2',
            borderBottom: '2px solid #E0E0E0',
            paddingBottom: '15px',
            fontWeight: '500'
        },
        // Action buttons
        topActions: { 
            display: 'flex', 
            gap: '15px', 
            marginTop: '10px',
            flexWrap: 'wrap' 
        },
        button: { 
            padding: '10px 18px', 
            backgroundColor: '#1976D2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s, transform 0.2s'
        },
        // Search and filter bar
        searchFilterBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            flexWrap: 'wrap',
            gap: '15px'
        },
        // Form inputs
        inputField: {
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #E0E0E0',
            width: '100%',
            maxWidth: '300px',
            fontSize: '14px'
        },
        selectField: {
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #E0E0E0',
            backgroundColor: 'white',
            minWidth: '150px',
            fontSize: '14px',
            cursor: 'pointer'
        }
    };
    
    // State for patient data
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for UI controls
    const [sortType, setSortType] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    
    // State for doctors and nurses lists (for assignment dropdowns)
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [nurses, setNurses] = useState([]);
    const [loadingNurses, setLoadingNurses] = useState(false);
    
    // State for patient creation form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: "",
        age: "",
        gender: "",
        medical_history: "",
        doctor_id: "",
        nurse_id: ""
    });
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // State for patient editing
    const [showEditForm, setShowEditForm] = useState(false);
    const [editPatient, setEditPatient] = useState(null);
    const [editError, setEditError] = useState(null);
    const [editSuccess, setEditSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // State for patient deletion
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(null);
    
    // State for API logs
    const [apiLogs, setApiLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logsError, setLogsError] = useState(null);
    const [showLogs, setShowLogs] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    
    // Fetch patients from API on component mount
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get token from localStorage
                const token = localStorage.getItem('userToken');
                if (!token) {
                    throw new Error('Authentication required. Please login again.');
                }
                
                // Fetch patients from API
                const data = await getAllPatientsApi(token);
                console.log('Fetched patients:', data);
                setPatients(data);
                
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError(err.message || 'Failed to load patients');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPatients();
    }, []);
    
    // Fetch doctors and nurses for the dropdowns
    useEffect(() => {
        const fetchProvidersData = async () => {
            try {
                setLoadingDoctors(true);
                setLoadingNurses(true);
                
                // Get token from localStorage
                const token = localStorage.getItem('userToken');
                if (!token) {
                    throw new Error('Authentication required. Please login again.');
                }
                
                // Fetch doctors from API
                const doctorsData = await getDoctorsApi(token);
                console.log('Fetched doctors:', doctorsData);
                setDoctors(doctorsData);
                
                // Fetch nurses from API
                const nursesData = await getNursesApi(token);
                console.log('Fetched nurses:', nursesData);
                setNurses(nursesData);
                
            } catch (err) {
                console.error('Error fetching providers data:', err);
                // We won't set a visible error for this, just log it
            } finally {
                setLoadingDoctors(false);
                setLoadingNurses(false);
            }
        };
        
        // Fetch data when either create or edit form is shown
        if (showCreateForm || showEditForm) {
            fetchProvidersData();
        }
    }, [showCreateForm, showEditForm]);
    
    /**
     * Handle form input changes for creating a new patient
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Convert numeric fields to numbers
        let processedValue = value;
        if (value !== '') {
            if (name === 'age' || name === 'doctor_id' || name === 'nurse_id') {
                processedValue = parseInt(value, 10);
            }
        }
        
        setNewPatient(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };
    
    /**
     * Handle form input changes for editing an existing patient
     */
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        
        // Convert numeric fields to numbers
        let processedValue = value;
        if (value !== '') {
            if (name === 'age' || name === 'doctor_id' || name === 'nurse_id') {
                processedValue = parseInt(value, 10);
            }
        }
        
        setEditPatient(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };
    
    /**
     * Open the edit form for a patient
     */
    const handleOpenEditForm = async (patient) => {
        // Make sure we have loaded the doctors and nurses before opening the form
        try {
            // Get token
            const token = localStorage.getItem('userToken');
            if (!token) {
                alert('Authentication required. Please login again.');
                return;
            }
            
            // Load doctors and nurses if they haven't been loaded yet
            let doctorsData = doctors;
            let nursesData = nurses;
            
            if (!doctors.length) {
                setLoadingDoctors(true);
                doctorsData = await getDoctorsApi(token);
                setDoctors(doctorsData);
                setLoadingDoctors(false);
                console.log('Loaded doctors for edit form:', doctorsData);
            }
            
            if (!nurses.length) {
                setLoadingNurses(true);
                nursesData = await getNursesApi(token);
                setNurses(nursesData);
                setLoadingNurses(false);
                console.log('Loaded nurses for edit form:', nursesData);
            }
            
            // Clone the patient object to avoid mutating the original
            setEditPatient({
                ...patient,
                // Convert string IDs to numbers if needed
                doctor_id: patient.doctor_id ? parseInt(patient.doctor_id, 10) : "",
                nurse_id: patient.nurse_id ? parseInt(patient.nurse_id, 10) : ""
            });
            
            setShowEditForm(true);
            setEditError(null);
            setEditSuccess(null);
        } catch (err) {
            console.error('Error loading data for edit form:', err);
            alert('Error loading required data for edit form: ' + (err.message || 'Unknown error'));
        }
    };
    
    /**
     * Cancel editing and close the form
     */
    const handleCancelEdit = () => {
        setShowEditForm(false);
        setEditPatient(null);
        setEditError(null);
        setEditSuccess(null);
    };
    
    /**
     * Submit the form to update an existing patient
     */
    const handleUpdatePatient = async (e) => {
        e.preventDefault();
        setEditError(null);
        setEditSuccess(null);
        setIsEditing(true);
        
        try {
            // Validate form data
            if (!editPatient.name.trim()) {
                throw new Error('Patient name is required');
            }
            
            if (!editPatient.age || editPatient.age <= 0) {
                throw new Error('Age must be a positive number');
            }
            
            if (!editPatient.gender.trim()) {
                throw new Error('Gender is required');
            }
            
            if (!editPatient.nurse_id) {
                throw new Error('Nurse assignment is required');
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }
            
            // Prepare the data - ensure IDs are numbers
            const patientData = {
                ...editPatient,
                nurse_id: parseInt(editPatient.nurse_id, 10),
                doctor_id: editPatient.doctor_id ? parseInt(editPatient.doctor_id, 10) : undefined
            };
            
            // Remove the id from the data object since we don't want to update it
            delete patientData.id;
            delete patientData.created_at;
            
            console.log('Updating patient with data:', patientData);
            
            // Call API to update patient
            await updatePatientApi(editPatient.id, patientData, token);
            
            // Update UI with success message
            setEditSuccess(`Patient ${editPatient.name} updated successfully`);
            
            // Refresh patient list
            const updatedPatients = await getAllPatientsApi(token);
            setPatients(updatedPatients);
            
            // Close the form after a delay
            setTimeout(() => {
                setShowEditForm(false);
                setEditPatient(null);
            }, 2000);
            
        } catch (err) {
            console.error('Error updating patient:', err);
            setEditError(err.message || 'Failed to update patient');
        } finally {
            setIsEditing(false);
        }
    };
    
    /**
     * Submit the form to create a new patient
     */
    const handleCreatePatient = async (e) => {
        e.preventDefault();
        setCreateError(null);
        setCreateSuccess(null);
        setIsCreating(true);
        
        try {
            // Validate form data
            if (!newPatient.name.trim()) {
                throw new Error('Patient name is required');
            }
            
            if (!newPatient.age || newPatient.age <= 0) {
                throw new Error('Age must be a positive number');
            }
            
            if (!newPatient.gender.trim()) {
                throw new Error('Gender is required');
            }
            
            if (!newPatient.nurse_id) {
                throw new Error('Nurse assignment is required');
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }
            
            // Prepare the data - ensure IDs are numbers
            const patientData = {
                ...newPatient,
                nurse_id: parseInt(newPatient.nurse_id, 10),
                doctor_id: newPatient.doctor_id ? parseInt(newPatient.doctor_id, 10) : undefined
            };
            
            console.log('Sending patient data:', patientData);
            
            // Call API to create patient
            const result = await createPatientApi(patientData, token);
            
            // Update UI with success message
            setCreateSuccess(`Patient ${newPatient.name} created successfully with ID: ${result.patient_id}`);
            
            // Reset form
            setNewPatient({
                name: "",
                age: "",
                gender: "",
                medical_history: "",
                doctor_id: "",
                nurse_id: ""
            });
            
            // Refresh patient list
            const updatedPatients = await getAllPatientsApi(token);
            setPatients(updatedPatients);
            
        } catch (err) {
            console.error('Error creating patient:', err);
            setCreateError(err.message || 'Failed to create patient');
        } finally {
            setIsCreating(false);
        }
    };

    /**
     * View diagnoses for a patient
     */
    function handleViewDiagnoses(patientID) {
        const patient = patients.find(p => p.id === patientID);
        if (!patient) {
            alert("Patient not found.");
            return;
        }
        
        // Check if the patient has diagnoses
        if (patient.diagnoses && patient.diagnoses.length > 0) {
            const diagnosisText = patient.diagnoses
                .map(d => `${d.condition_name} (${d.confidence_score}% confidence)`)
                .join("\n");
            alert(`Diagnoses for ${patient.name}:\n${diagnosisText}`);
        } else {
            alert(`No diagnoses available for ${patient.name}.`);
        }
    }
    
    /**
     * Delete a patient after confirmation
     */
    const handleDeletePatient = async (patientId, patientName) => {
        // Ask for confirmation first
        if (!window.confirm(`Are you sure you want to delete patient ${patientName}? This action cannot be undone.`)) {
            return; // User canceled
        }
        
        setDeleteError(null);
        setDeleteSuccess(null);
        
        try {
            // Get token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }
            
            // Call the API to delete the patient
            await deletePatientApi(patientId, token);
            
            // Show success message
            setDeleteSuccess(`Patient ${patientName} deleted successfully`);
            
            // Remove patient from the local state
            setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
            
            // Clear the success message after a delay
            setTimeout(() => {
                setDeleteSuccess(null);
            }, 3000);
            
        } catch (err) {
            console.error('Error deleting patient:', err);
            setDeleteError(err.message || 'Failed to delete patient');
            
            // Clear the error message after a delay
            setTimeout(() => {
                setDeleteError(null);
            }, 5000);
        }
    };
    
    /**
     * Fetch API logs
     */
    const handleFetchApiLogs = async () => {
        setLoadingLogs(true);
        setLogsError(null);
        setShowLogs(true);
        
        try {
            // Get token from localStorage
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }
            
            // Fetch API logs
            const logs = await getAllApiLogsApi(token);
            setApiLogs(logs);
            
        } catch (err) {
            console.error('Error fetching API logs:', err);
            setLogsError(err.message || 'Failed to fetch API logs');
        } finally {
            setLoadingLogs(false);
        }
    };
    
    /**
     * View details of a specific log
     */
    const handleViewLogDetails = (log) => {
        setSelectedLog(log);
    };
    
    /**
     * Close log details modal
     */
    const handleCloseLogDetails = () => {
        setSelectedLog(null);
    };
    
    /**
     * Export patient data as CSV
     */
    function handleExportPatients() {
        if (patients.length === 0) {
            alert("No patient data to export");
            return;
        }
        
        // Create CSV content
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Name,Age,Gender,Medical History,Nurse ID,Doctor ID\n" 
            + patients.map(p => 
                `${p.id},"${p.name}",${p.age},"${p.gender}","${p.medical_history || 'N/A'}",${p.nurse_id || 'N/A'},${p.doctor_id || 'N/A'}`
            ).join("\n");
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "patient_data.csv");
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Handle sorting of patients
     */
    function handleSortChange(e) {
        const selected = e.target.value;
        setSortType(selected);
    }
    
    // Apply sorting and filtering to patients
    const displayPatients = [...patients]
        .sort((a, b) => {
            if (sortType === "name") {
                return a.name?.localeCompare(b.name || '') || 0;
            } else if (sortType === "age") {
                return (a.age || 0) - (b.age || 0);
            } else if (sortType === "gender") {
                return a.gender?.localeCompare(b.gender || '') || 0;
            }
            return 0;
        })
        .filter(patient => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (patient.name?.toLowerCase().includes(searchLower)) ||
                (patient.gender?.toLowerCase().includes(searchLower)) ||
                (String(patient.age).includes(searchLower)) ||
                (patient.medical_history?.toLowerCase().includes(searchLower))
            );
        });

    return React.createElement("div", { style: styles.wrapper }, [
        // Header with title and admin name
        React.createElement("div", { key: "header", style: styles.header }, [
            React.createElement("h2", { key: "title", style: styles.title }, 
                userName ? `Welcome, Admin ${userName}!` : "Welcome, Admin!"
            ),
            
            // Top admin actions
            React.createElement("div", { key: "top-actions", style: styles.topActions }, [
                React.createElement("button", {
                    key: "createPatientBtn",
                    onClick: () => setShowCreateForm(!showCreateForm),
                    style: { 
                        ...styles.button,
                        backgroundColor: styles.colors.success
                    }
                }, showCreateForm ? "Hide Patient Form" : "Create New Patient"),
                
                React.createElement("button", {
                    key: "exportPatients",
                    onClick: handleExportPatients,
                    style: { 
                        ...styles.button,
                        backgroundColor: styles.colors.secondary,
                        marginRight: '10px'
                    }
                }, "Export Patient Data"),
                
                React.createElement("button", {
                    key: "viewApiLogs",
                    onClick: handleFetchApiLogs,
                    style: { 
                        ...styles.button,
                        backgroundColor: styles.colors.info
                    }
                }, showLogs ? "Hide API Logs" : "View API Logs")
            ])
        ]),
        
        // Create Patient Form
        showCreateForm && React.createElement("div", { 
            key: "create-form", 
            style: { 
                marginBottom: '30px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
            } 
        }, [
            React.createElement("h3", { key: "form-title" }, "Create New Patient"),
            
            // Form error/success messages
            createError && React.createElement("div", { 
                key: "create-error", 
                style: { color: 'red', marginBottom: '10px' } 
            }, createError),
            
            createSuccess && React.createElement("div", { 
                key: "create-success", 
                style: { color: 'green', marginBottom: '10px' } 
            }, createSuccess),
            
            // Form fields
            React.createElement("form", { 
                key: "patient-form",
                onSubmit: handleCreatePatient,
                style: { display: 'flex', flexDirection: 'column', gap: '15px' }
            }, [
                // Name field
                React.createElement("div", { key: "name-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                    React.createElement("label", { htmlFor: "name" }, "Patient Name: *"),
                    React.createElement("input", {
                        id: "name",
                        name: "name",
                        type: "text",
                        value: newPatient.name,
                        onChange: handleInputChange,
                        required: true,
                        style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
                    })
                ]),
                
                // Age field
                React.createElement("div", { key: "age-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                    React.createElement("label", { htmlFor: "age" }, "Age: *"),
                    React.createElement("input", {
                        id: "age",
                        name: "age",
                        type: "number",
                        min: "1",
                        value: newPatient.age,
                        onChange: handleInputChange,
                        required: true,
                        style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
                    })
                ]),
                
                // Gender field
                React.createElement("div", { key: "gender-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                    React.createElement("label", { htmlFor: "gender" }, "Gender: *"),
                    React.createElement("select", {
                        id: "gender",
                        name: "gender",
                        value: newPatient.gender,
                        onChange: handleInputChange,
                        required: true,
                        style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
                    }, [
                        React.createElement("option", { value: "" }, "Select gender"),
                        React.createElement("option", { value: "Male" }, "Male"),
                        React.createElement("option", { value: "Female" }, "Female"),
                        React.createElement("option", { value: "Other" }, "Other")
                    ])
                ]),
                
                // Medical history field
                React.createElement("div", { key: "history-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                    React.createElement("label", { htmlFor: "medical_history" }, "Medical History:"),
                    React.createElement("textarea", {
                        id: "medical_history",
                        name: "medical_history",
                        value: newPatient.medical_history,
                        onChange: handleInputChange,
                        rows: "4",
                        style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
                    })
                ]),
                
                // Nurse assignment field - REQUIRED
                React.createElement("div", { key: "nurse-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                    React.createElement("label", { htmlFor: "nurse_id" }, "Assign Nurse: *"),
                    React.createElement("select", {
                        id: "nurse_id",
                        name: "nurse_id",
                        value: newPatient.nurse_id,
                        onChange: handleInputChange,
                        required: true,
                        style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
                    }, [
                        React.createElement("option", { value: "" }, "-- Select a nurse --"),
                        ...nurses.map(nurse => 
                            React.createElement("option", { 
                                key: `nurse-${nurse.id}`,
                                value: nurse.id 
                            }, nurse.name)
                        )
                    ]),
                    loadingNurses && React.createElement("p", { style: { fontSize: '0.8em', margin: '2px 0 0 0' } }, "Loading nurses...")
                ]),

                // Doctor assignment field - OPTIONAL
                React.createElement("div", { key: "doctor-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                    React.createElement("label", { htmlFor: "doctor_id" }, "Assign Doctor:"),
                    React.createElement("select", {
                        id: "doctor_id",
                        name: "doctor_id",
                        value: newPatient.doctor_id,
                        onChange: handleInputChange,
                        style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
                    }, [
                        React.createElement("option", { value: "" }, "-- Select a doctor (optional) --"),
                        ...doctors.map(doctor => 
                            React.createElement("option", { 
                                key: `doctor-${doctor.id}`,
                                value: doctor.id 
                            }, doctor.name)
                        )
                    ]),
                    loadingDoctors && React.createElement("p", { style: { fontSize: '0.8em', margin: '2px 0 0 0' } }, "Loading doctors...")
                ]),
                
                // Submit button
                React.createElement("button", {
                    type: "submit",
                    disabled: isCreating,
                    style: styles.inputField
                }, isCreating ? "Creating..." : "Create Patient")
            ])
        ]),
        
        // Patient list section
        React.createElement("div", { key: "patients-section" }, [
            // Search and sort controls
            React.createElement("div", { 
                key: "search-filter-bar", 
                style: styles.searchFilterBar
            }, [
                React.createElement("h3", { key: "patients-title", style: { margin: 0 } }, "Patient Management"),
                
                React.createElement("div", { key: "list-controls", style: { display: 'flex', gap: '10px' } }, [
                    // Search input
                    React.createElement("input", {
                        key: "searchBar",
                        type: "text",
                        placeholder: "Search patients...",
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value),
                        style: styles.inputField
                    }),
                    
                    // Sort dropdown
                    React.createElement("select", {
                        key: "sortDropdown",
                        value: sortType,
                        onChange: handleSortChange,
                        style: styles.selectField
                    }, [
                        React.createElement("option", { key: "name", value: "name" }, "Sort by Name"),
                        React.createElement("option", { key: "age", value: "age" }, "Sort by Age"),
                        React.createElement("option", { key: "gender", value: "gender" }, "Sort by Gender")
                    ])
                ])
            ]),
            
            // Display delete success/error messages
            deleteSuccess && React.createElement("div", { 
                key: "delete-success", 
                style: { 
                    backgroundColor: '#E8F5E9', 
                    color: '#388E3C', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginBottom: '15px' 
                } 
            }, deleteSuccess),
            
            deleteError && React.createElement("div", { 
                key: "delete-error", 
                style: { 
                    backgroundColor: '#FFEBEE', 
                    color: '#D32F2F', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginBottom: '15px' 
                } 
            }, deleteError),

            // Loading, error, or empty state
            loading ? React.createElement("p", { key: "loading" }, "Loading patients...") :
            error ? React.createElement("p", { key: "error", style: { color: styles.colors.danger } }, `Error: ${error}`) :
            displayPatients.length === 0 ? React.createElement("p", { key: "empty" }, "No patients found.") :
            
            // API Logs section
            showLogs && React.createElement("div", { 
                key: "api-logs-section", 
                style: { 
                    marginBottom: '30px',
                    padding: '20px',
                    border: '1px solid ' + styles.colors.border,
                    borderRadius: '8px',
                    backgroundColor: styles.colors.white,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }
            }, [
                React.createElement("h3", { 
                    key: "logs-title",
                    style: {
                        color: styles.colors.primary,
                        borderBottom: '2px solid ' + styles.colors.border,
                        paddingBottom: '10px',
                        marginTop: 0
                    }
                }, "API Logs"),
                
                // Loading and error states for logs
                loadingLogs ? 
                    React.createElement("div", {
                        key: "logs-loading",
                        style: {
                            padding: '20px',
                            textAlign: 'center',
                            color: styles.colors.lightText
                        }
                    }, "Loading API logs...") :
                logsError ? 
                    React.createElement("div", {
                        key: "logs-error",
                        style: {
                            padding: '15px',
                            backgroundColor: '#FFEBEE',
                            color: styles.colors.danger,
                            borderRadius: '6px',
                            marginBottom: '15px'
                        }
                    }, `Error: ${logsError}`) :
                apiLogs.length === 0 ? 
                    React.createElement("div", {
                        key: "logs-empty",
                        style: {
                            padding: '20px',
                            textAlign: 'center',
                            color: styles.colors.lightText,
                            fontStyle: 'italic'
                        }
                    }, "No API logs found.") :
                
                // Logs table
                React.createElement("div", { key: "logs-table-container", style: { overflowX: 'auto' } }, 
                    React.createElement("table", { 
                        key: "logs-table",
                        style: { 
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginTop: '15px',
                        }
                    }, [
                        // Table header
                        React.createElement("thead", { key: "logs-thead" }, 
                            React.createElement("tr", { key: "logs-header-row" }, [
                                React.createElement("th", { 
                                    key: "log-id-header", 
                                    style: { 
                                        textAlign: 'left',
                                        padding: '12px 8px',
                                        borderBottom: '2px solid ' + styles.colors.border,
                                        color: styles.colors.primary,
                                        fontWeight: '500'
                                    }
                                }, "ID"),
                                React.createElement("th", { 
                                    key: "log-diagnosis-header", 
                                    style: { 
                                        textAlign: 'left',
                                        padding: '12px 8px',
                                        borderBottom: '2px solid ' + styles.colors.border,
                                        color: styles.colors.primary,
                                        fontWeight: '500'
                                    }
                                }, "Diagnosis ID"),
                                React.createElement("th", { 
                                    key: "log-timestamp-header", 
                                    style: { 
                                        textAlign: 'left',
                                        padding: '12px 8px',
                                        borderBottom: '2px solid ' + styles.colors.border,
                                        color: styles.colors.primary,
                                        fontWeight: '500'
                                    }
                                }, "Timestamp"),
                                React.createElement("th", { 
                                    key: "log-actions-header", 
                                    style: { 
                                        textAlign: 'left',
                                        padding: '12px 8px',
                                        borderBottom: '2px solid ' + styles.colors.border,
                                        color: styles.colors.primary,
                                        fontWeight: '500'
                                    }
                                }, "Actions")
                            ])
                        ),
                        
                        // Table body
                        React.createElement("tbody", { key: "logs-tbody" }, 
                            apiLogs.map(log => 
                                React.createElement("tr", { 
                                    key: `log-${log.id}`,
                                    style: {
                                        transition: 'background-color 0.2s',
                                        ':hover': {
                                            backgroundColor: '#f5f8ff'
                                        }
                                    }
                                }, [
                                    React.createElement("td", { 
                                        key: `log-${log.id}-id`, 
                                        style: { padding: '12px 8px', borderBottom: '1px solid ' + styles.colors.border }
                                    }, log.id),
                                    React.createElement("td", { 
                                        key: `log-${log.id}-diagnosis`, 
                                        style: { padding: '12px 8px', borderBottom: '1px solid ' + styles.colors.border }
                                    }, log.diagnosis_id || 'N/A'),
                                    React.createElement("td", { 
                                        key: `log-${log.id}-timestamp`, 
                                        style: { padding: '12px 8px', borderBottom: '1px solid ' + styles.colors.border }
                                    }, new Date(log.timestamp).toLocaleString()),
                                    React.createElement("td", { 
                                        key: `log-${log.id}-actions`, 
                                        style: { padding: '12px 8px', borderBottom: '1px solid ' + styles.colors.border }
                                    }, 
                                        React.createElement("button", {
                                            key: `view-log-${log.id}`,
                                            onClick: () => handleViewLogDetails(log),
                                            style: { 
                                                padding: '6px 10px', 
                                                backgroundColor: styles.colors.secondary, 
                                                color: styles.colors.white, 
                                                border: 'none', 
                                                borderRadius: '6px', 
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '12px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }
                                        }, "View Details")
                                    )
                                ])
                            )
                        )
                    ])
                )
            ]),
            
            // Log details modal
            selectedLog && React.createElement("div", {
                key: "log-details-modal",
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }
            }, 
                React.createElement("div", {
                    key: "log-details-content",
                    style: {
                        backgroundColor: styles.colors.white,
                        padding: '25px',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        width: '80%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }
                }, [
                    React.createElement("h3", { 
                        key: "log-details-title",
                        style: {
                            color: styles.colors.primary,
                            borderBottom: '2px solid ' + styles.colors.border,
                            paddingBottom: '10px',
                            marginTop: 0
                        }
                    }, `API Log Details (ID: ${selectedLog.id})`),
                    
                    React.createElement("div", { key: "log-details-info", style: { marginBottom: '15px' } }, [
                        React.createElement("p", { key: "log-diagnois-info" }, 
                            React.createElement("strong", {
                                style: { color: styles.colors.darkText }
                            }, "Diagnosis ID: "), 
                            selectedLog.diagnosis_id || 'N/A'
                        ),
                        React.createElement("p", { key: "log-timestamp-info" }, 
                            React.createElement("strong", {
                                style: { color: styles.colors.darkText }
                            }, "Timestamp: "), 
                            new Date(selectedLog.timestamp).toLocaleString()
                        )
                    ]),
                    
                    React.createElement("div", { key: "log-request-data", style: { marginBottom: '20px' } }, [
                        React.createElement("h4", { 
                            key: "request-title",
                            style: { color: styles.colors.secondary, marginBottom: '8px' }
                        }, "Request Data"),
                        React.createElement("pre", { 
                            key: "request-content",
                            style: { 
                                backgroundColor: '#f5f5f5', 
                                padding: '15px', 
                                borderRadius: '6px',
                                overflowX: 'auto',
                                maxHeight: '200px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                fontSize: '13px',
                                border: '1px solid ' + styles.colors.border
                            }
                        }, 
                            JSON.stringify(JSON.parse(selectedLog.request_data || '{}'), null, 2)
                        )
                    ]),
                    
                    React.createElement("div", { key: "log-response-data", style: { marginBottom: '15px' } }, [
                        React.createElement("h4", { 
                            key: "response-title",
                            style: { color: styles.colors.secondary, marginBottom: '8px' }
                        }, "Response Data"),
                        React.createElement("pre", { 
                            key: "response-content",
                            style: { 
                                backgroundColor: '#f5f5f5', 
                                padding: '15px', 
                                borderRadius: '6px',
                                overflowX: 'auto',
                                maxHeight: '200px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                fontSize: '13px',
                                border: '1px solid ' + styles.colors.border
                            }
                        }, 
                            JSON.stringify(JSON.parse(selectedLog.response_data || '{}'), null, 2)
                        )
                    ]),
                    
                    React.createElement("button", {
                        key: "close-modal-btn",
                        onClick: handleCloseLogDetails,
                        style: { 
                            padding: '10px 18px', 
                            backgroundColor: styles.colors.danger, 
                            color: styles.colors.white, 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            marginTop: '15px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }
                    }, "Close")
                ])
            ),
            
            // Patient list with cards layout
            React.createElement("div", { 
                key: "patient-list",
                style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }
            }, 
                displayPatients.map(patient => 
                    React.createElement("div", {
                        key: `patient-${patient.id}`,
                        style: { 
                            border: '1px solid ' + styles.colors.border,
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: styles.colors.white,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            ':hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                            }
                        }                  }, [
                        // Patient header with name and ID
                        React.createElement("div", { 
                            key: `patient-header-${patient.id}`,
                            style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }
                        }, [
                            React.createElement("h4", { 
                                key: `patient-name-${patient.id}`,
                                style: { margin: 0 }
                            }, patient.name),
                            React.createElement("span", { 
                                key: `patient-id-${patient.id}`,
                                style: { 
                                    backgroundColor: '#f5f5f5', 
                                    padding: '3px 6px', 
                                    borderRadius: '3px', 
                                    fontSize: '0.8em' 
                                }
                            }, `ID: ${patient.id}`)
                        ]),
                        
                        // Patient details
                        React.createElement("div", { key: `patient-details-${patient.id}` }, [
                            React.createElement("p", { key: `patient-age-${patient.id}`, style: { margin: '5px 0' } },
                                `Age: ${patient.age || 'N/A'}`
                            ),
                            React.createElement("p", { key: `patient-gender-${patient.id}`, style: { margin: '5px 0' } },
                                `Gender: ${patient.gender || 'N/A'}`
                            ),
                            React.createElement("p", { key: `patient-history-${patient.id}`, style: { margin: '5px 0' } },
                                `Medical History: ${patient.medical_history || 'None'}`
                            ),
                            React.createElement("p", { key: `patient-nurse-${patient.id}`, style: { margin: '5px 0' } },
                                `Nurse ID: ${patient.nurse_id || 'Not assigned'}`
                            ),
                            React.createElement("p", { key: `patient-doctor-${patient.id}`, style: { margin: '5px 0' } },
                                `Doctor ID: ${patient.doctor_id || 'Not assigned'}`
                            )
                        ]),
                        
                        // Patient actions
                        React.createElement("div", { 
                            key: `patient-actions-${patient.id}`,
                            style: { marginTop: '15px', display: 'flex', gap: '10px' }
                        }, [
                            React.createElement("button", {
                                key: `viewDiagnosis-${patient.id}`,
                                onClick: () => handleViewDiagnoses(patient.id),
                                style: { 
                                    padding: '8px 12px', 
                                    backgroundColor: styles.colors.secondary, 
                                    color: styles.colors.white, 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    flex: '1',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }
                            }, "View Diagnoses"),
                            React.createElement("button", {
                                key: `editPatient-${patient.id}`,
                                onClick: () => handleOpenEditForm(patient),
                                style: { 
                                    padding: '8px 12px', 
                                    backgroundColor: styles.colors.warning, 
                                    color: styles.colors.white, 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    flex: '1',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }
                            }, "Edit Patient"),
                            React.createElement("button", {
                                key: `deletePatient-${patient.id}`,
                                onClick: () => handleDeletePatient(patient.id, patient.name),
                                style: { 
                                    padding: '8px 12px', 
                                    backgroundColor: styles.colors.danger, 
                                    color: styles.colors.white, 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    flex: '1',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }
                            }, "Delete")
                        ])
                    ])
                )
            )
        ]),
        
        // Edit Patient Form Modal (only shown when editing)
        showEditForm && React.createElement("div", { 
            key: "edit-form-modal", 
            style: { 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            } 
        }, [
            React.createElement("div", { 
                key: "edit-form-container",
                style: {
                    backgroundColor: '#fff',
                    padding: '30px',
                    borderRadius: '8px',
                    width: '500px',
                    maxWidth: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }
            }, [
                // Form header
                React.createElement("div", { key: "edit-form-header", style: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
                    React.createElement("h3", { key: "edit-form-title", style: { margin: 0 } }, `Edit Patient: ${editPatient?.name}`),
                    React.createElement("button", {
                        key: "close-button",
                        onClick: handleCancelEdit,
                        style: {
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#666'
                        }
                    }, "×")
                ]),
                
                // Form error/success messages
                editError && React.createElement("div", { 
                    key: "edit-error", 
                    style: { color: 'red', marginBottom: '10px' } 
                }, editError),
                
                editSuccess && React.createElement("div", { 
                    key: "edit-success", 
                    style: { color: 'green', marginBottom: '10px' } 
                }, editSuccess),
                
                // Edit form
                React.createElement("form", { 
                    key: "edit-form",
                    onSubmit: handleUpdatePatient,
                    style: { display: 'flex', flexDirection: 'column', gap: '15px' }
                }, [
                    // Name field
                    React.createElement("div", { key: "name-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                        React.createElement("label", { htmlFor: "edit-name" }, "Patient Name: *"),
                        React.createElement("input", {
                            id: "edit-name",
                            name: "name",
                            type: "text",
                            value: editPatient?.name || "",
                            onChange: handleEditInputChange,
                            required: true,
                            style: styles.inputField
                        })
                    ]),
                    
                    // Age field
                    React.createElement("div", { key: "age-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                        React.createElement("label", { htmlFor: "edit-age" }, "Age: *"),
                        React.createElement("input", {
                            id: "edit-age",
                            name: "age",
                            type: "number",
                            min: "1",
                            value: editPatient?.age || "",
                            onChange: handleEditInputChange,
                            required: true,
                            style: styles.inputField
                        })
                    ]),
                    
                    // Gender field
                    React.createElement("div", { key: "gender-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                        React.createElement("label", { htmlFor: "edit-gender" }, "Gender: *"),
                        React.createElement("select", {
                            id: "edit-gender",
                            name: "gender",
                            value: editPatient?.gender || "",
                            onChange: handleEditInputChange,
                            required: true,
                            style: styles.selectField
                        }, [
                            React.createElement("option", { value: "" }, "Select gender"),
                            React.createElement("option", { value: "Male" }, "Male"),
                            React.createElement("option", { value: "Female" }, "Female"),
                            React.createElement("option", { value: "Other" }, "Other")
                        ])
                    ]),
                    
                    // Medical history field
                    React.createElement("div", { key: "history-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                        React.createElement("label", { htmlFor: "edit-medical-history" }, "Medical History:"),
                        React.createElement("textarea", {
                            id: "edit-medical-history",
                            name: "medical_history",
                            value: editPatient?.medical_history || "",
                            onChange: handleEditInputChange,
                            rows: "4",
                            style: styles.inputField
                        })
                    ]),
                    
                    // Nurse assignment field
                    React.createElement("div", { key: "nurse-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                        React.createElement("label", { htmlFor: "edit-nurse-id" }, "Assign Nurse: *"),
                        React.createElement("select", {
                            id: "edit-nurse-id",
                            name: "nurse_id",
                            value: editPatient?.nurse_id || "",
                            onChange: handleEditInputChange,
                            required: true,
                            style: styles.selectField
                        }, [
                            React.createElement("option", { value: "" }, "-- Select a nurse --"),
                            ...nurses.map(nurse => 
                                React.createElement("option", { 
                                    key: `nurse-${nurse.id}`,
                                    value: nurse.id 
                                }, nurse.name)
                            )
                        ]),
                        loadingNurses && React.createElement("p", { style: { fontSize: '0.8em', margin: '2px 0 0 0' } }, "Loading nurses...")
                    ]),
                    
                    // Doctor assignment field
                    React.createElement("div", { key: "doctor-field", style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, [
                        React.createElement("label", { htmlFor: "edit-doctor-id" }, "Assign Doctor:"),
                        React.createElement("select", {
                            id: "edit-doctor-id",
                            name: "doctor_id",
                            value: editPatient?.doctor_id || "",
                            onChange: handleEditInputChange,
                            style: styles.selectField
                        }, [
                            React.createElement("option", { value: "" }, "-- Select a doctor (optional) --"),
                            ...doctors.map(doctor => 
                                React.createElement("option", { 
                                    key: `doctor-${doctor.id}`,
                                    value: doctor.id 
                                }, doctor.name)
                            )
                        ]),
                        loadingDoctors && React.createElement("p", { style: { fontSize: '0.8em', margin: '2px 0 0 0' } }, "Loading doctors...")
                    ]),
                    
                    // Form actions
                    React.createElement("div", { key: "form-actions", style: { display: 'flex', gap: '10px', marginTop: '10px' } }, [
                        React.createElement("button", {
                            type: "button",
                            onClick: handleCancelEdit,
                            style: { 
                                padding: '10px', 
                                backgroundColor: '#f5f5f5', 
                                color: '#333', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                flex: '1'
                            }
                        }, "Cancel"),
                        React.createElement("button", {
                            type: "submit",
                            disabled: isEditing,
                            style: { 
                                padding: '10px', 
                                backgroundColor: '#4CAF50', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: isEditing ? 'not-allowed' : 'pointer',
                                opacity: isEditing ? 0.7 : 1,
                                flex: '1'
                            }
                        }, isEditing ? "Updating..." : "Update Patient")
                    ])
                ])
            ])
        ]),

        // Debug test button
        React.createElement("div", { key: "debug-section", style: { marginTop: '30px', padding: '15px', border: '1px dashed #ccc', backgroundColor: '#f9f9f9' } }, [
            React.createElement("h4", { key: "debug-title" }, "Debug Tools"),
            React.createElement("button", {
                key: "testApiButton",
                onClick: async () => {
                    try {
                        const token = localStorage.getItem('userToken');
                        if (!token) {
                            alert('No authentication token found!');
                            return;
                        }
                        
                        // Create a test patient with proper nurse and doctor IDs
                        const testPatient = {
                            name: "Test Patient " + new Date().toISOString(),
                            age: 35,
                            gender: "Male",
                            medical_history: "Test medical history",
                            nurse_id: nurses.length > 0 ? nurses[0].id : null,
                            doctor_id: doctors.length > 0 ? doctors[0].id : null
                        };
                        
                        console.log('Sending test patient data:', testPatient);
                        alert('Check console for detailed logs. Sending test patient data.');
                        
                        const result = await createPatientApi(testPatient, token);
                        alert('Test Patient Created: ' + JSON.stringify(result));
                        
                        // Refresh patient list
                        const updatedPatients = await getAllPatientsApi(token);
                        setPatients(updatedPatients);
                        
                    } catch (err) {
                        console.error('Test API error:', err);
                        alert('Error: ' + (err.message || 'Failed to create test patient'));
                    }
                },
                style: { 
                    padding: '8px 16px', 
                    backgroundColor: '#673AB7', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    marginRight: '10px'
                }
            }, "Test Create Patient API")
        ]),

        // Footer with logout
        React.createElement("div", { key: "footer", style: { marginTop: '30px', textAlign: 'right' } }, [
            React.createElement("button", {
                key: "logoutButton",
                onClick: handleLogout,
                style: { 
                    padding: '8px 16px', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                }
            }, "Logout")
        ])
    ]);
}

export default AdminDashboard;