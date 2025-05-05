import React, { useState, useEffect } from "react";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; 
import { debounce } from 'lodash';

// Define the base URL for the backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function DemoDashboard() {
    // Define styles for our healthcare-themed UI
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
        demoHeader: {
            backgroundColor: '#E3F2FD',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '25px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #BBDEFB'
        },
        demoTitle: {
            color: '#1976D2',
            fontSize: '24px',
            fontWeight: '500',
            margin: '0 0 10px 0'
        },
        demoDescription: {
            color: '#333333',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: '0'
        },
        demoStep: {
            backgroundColor: '#1976D2',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            fontWeight: 'bold'
        },
        stepContainer: {
            marginBottom: '20px'
        },
        stepTitle: {
            display: 'flex',
            alignItems: 'center',
            color: '#1976D2',
            fontSize: '18px',
            fontWeight: '500',
            marginBottom: '15px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        // Patient Cards
        patientCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #E0E0E0',
            cursor: 'pointer'
        },
        patientCardSelected: {
            borderColor: '#1976D2',
            borderWidth: '2px',
            boxShadow: '0 4px 12px rgba(25,118,210,0.15)'
        },
        patientCardHover: {
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        },
        patientHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
        },
        patientName: {
            fontWeight: 'bold',
            color: '#333333',
            fontSize: '16px',
            margin: '0'
        },
        demoBadge: {
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
        },
        patientDetails: {
            marginBottom: '15px',
            fontSize: '14px',
            color: '#757575'
        },
        // Button styles
        buttonPrimary: {
            padding: '10px 15px',
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
        },
        buttonSuccess: {
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        buttonDisabled: {
            padding: '10px 15px',
            backgroundColor: '#E0E0E0',
            color: '#9E9E9E',
            border: 'none',
            borderRadius: '4px',
            cursor: 'not-allowed',
            fontSize: '14px',
            fontWeight: '500'
        },
        // Form elements
        input: {
            width: '100%', 
            padding: '12px', 
            borderRadius: '4px', 
            border: '1px solid #E0E0E0',
            fontSize: '14px'
        },
        // Footer
        footer: {
            marginTop: '40px',
            padding: '20px 0',
            borderTop: '1px solid #E0E0E0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }
    };
    
    // Demo patient data
    const [demoPatients, setDemoPatients] = useState([
        {
            id: "demo-1", 
            name: "John Demo", 
            age: 42, 
            gender: "male",
            status: "Demo Patient",
            symptoms: "",
            diagnosis: ""
        },
        {
            id: "demo-2", 
            name: "Emily Test", 
            age: 65, 
            gender: "female",
            status: "Demo Patient",
            symptoms: "Chronic joint pain, occasional headaches",
            diagnosis: ""
        },
        {
            id: "demo-3", 
            name: "Alex Sample", 
            age: 8, 
            gender: "male",
            status: "Demo Patient (Pediatric)",
            symptoms: "",
            diagnosis: ""
        }
    ]);
    
    // Current selected demo patient
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    // Symptom search and diagnosis states
    const [symptomSearchTerm, setSymptomSearchTerm] = useState('');
    const [symptomSearchResults, setSymptomSearchResults] = useState([]);
    const [isSearchingSymptoms, setIsSearchingSymptoms] = useState(false);
    const [symptomSearchError, setSymptomSearchError] = useState(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [interviewId, setInterviewId] = useState('');
    
    // Diagnosis states
    const [diagnosisResult, setDiagnosisResult] = useState(null);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [diagnosisError, setDiagnosisError] = useState(null);
    const [gatheredEvidence, setGatheredEvidence] = useState([]);
    
    // Demo workflow states
    const [currentStep, setCurrentStep] = useState(1);
    const [showTutorial, setShowTutorial] = useState(true);
    const [tutorialMessages, setTutorialMessages] = useState({
        step1: "Welcome to the NurseAssist Demo! Start by selecting a sample patient to work with.",
        step2: "Great! Now you can search for symptoms. Try typing common symptoms like 'headache' or 'fever'.",
        step3: "Select symptoms from the search results to add them to your patient's profile.",
        step4: "When you've added enough symptoms, click 'Get Diagnosis' to see the AI-powered diagnosis."
    });
    
    // Generate a unique interview ID for demo mode
    useEffect(() => {
        const newId = uuidv4();
        setInterviewId(newId);
        console.log("Demo mode: Generated Interview ID:", newId);
    }, []);
    
    // Handle patient selection
    const handleSelectPatient = (patientId) => {
        const patient = demoPatients.find(p => p.id === patientId);
        setSelectedPatient(patient);
        setSelectedSymptoms([]);
        setDiagnosisResult(null);
        setCurrentStep(2);
    };
    
    // Perform symptom search - direct API call without authentication for demo mode
    const performSearch = async (phrase, age, gender, id) => {
        if (!phrase?.trim() || !age || !gender || !id) { 
            setSymptomSearchResults([]);
            setIsSearchingSymptoms(false);
            return;
        }

        console.log("Demo mode: Searching for symptoms:", { phrase, age, gender, id });
        setIsSearchingSymptoms(true);
        setSymptomSearchError('');
        setDiagnosisResult(null);
        setGatheredEvidence([]);

        try {
            // Construct the query parameters
            const params = new URLSearchParams();
            params.append('phrase', phrase);
            params.append('age', age.toString());
            params.append('sex', gender); // Match the parameter name expected by the backend

            // Direct API call without authentication token
            const response = await axios.get(`${API_URL}/symptoms/search/demo`, {
                params: params,
                headers: {
                    'X-Interview-ID': id // Still include the interview ID
                }
            });

            console.log("Demo mode: API call successful, results:", response.data);
            setSymptomSearchResults(response.data || []); 
        } catch (error) {
            console.error("Demo mode: Symptom search API call failed:", error);
            setSymptomSearchError("Could not connect to symptom search API. Please try again later.");
            setSymptomSearchResults([]); 
        } finally {
            setIsSearchingSymptoms(false);
        }
    };
    
    // Debounce search to prevent too many API calls
    const debouncedSearchHandler = debounce(performSearch, 500);
    
    // Effect for search term changes
    useEffect(() => {
        if (symptomSearchTerm.trim() && selectedPatient) {
            debouncedSearchHandler(
                symptomSearchTerm, 
                selectedPatient.age, 
                selectedPatient.gender, 
                interviewId
            );
        } else {
            setSymptomSearchResults([]);
            debouncedSearchHandler.cancel();
        }

        return () => {
            debouncedSearchHandler.cancel();
        };
    }, [symptomSearchTerm, selectedPatient, interviewId]);
    
    // Handle selecting a symptom
    const handleSelectSymptom = (symptom) => {
        // Add symptom only if it's not already selected
        if (!selectedSymptoms.find(s => s.id === symptom.id)) {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
            setCurrentStep(Math.max(currentStep, 3));
        }
    };
    
    // Handle removing a symptom
    const handleRemoveSymptom = (symptomIdToRemove) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomIdToRemove));
    };
    
    // Handle getting diagnosis - direct API call without authentication for demo mode
    const handleGetDiagnosis = async () => {
        if (selectedSymptoms.length === 0) return;
        
        setIsDiagnosing(true);
        setDiagnosisError(null);
        
        try {
            // Format evidence the same way as the real app
            const evidence = selectedSymptoms.map(symptom => ({
                id: symptom.id,
                choice_id: "present",
                source: "initial"
            }));
            
            // Make a direct API call without authentication
            // Format the request to match the backend schema expectations
            const response = await axios.post(`${API_URL}/diagnosis/demo`, {
                evidence,
                // Format age as an object with value property as required by backend
                age: {
                    value: selectedPatient.age,
                    unit: 'year'
                },
                sex: selectedPatient.gender, // Match backend parameter name
                // Adding extras is optional but can include useful flags
                extras: {
                    enable_explanations: true
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Interview-ID': interviewId
                }
            });
            
            const result = response.data;
            setDiagnosisResult(result);
            setCurrentStep(4);
            
            // Update the demo patient with diagnosis
            if (result.conditions && result.conditions.length > 0) {
                const topCondition = result.conditions[0];
                updatePatientDiagnosis(selectedPatient.id, topCondition);
            }
        } catch (error) {
            console.error("Demo mode: Diagnosis API call failed:", error);
            setDiagnosisError("Could not connect to diagnosis API. Please try again later.");
            
            // For demo purposes, show mock data if the API fails
            if (selectedSymptoms.length > 0) {
                const mockResult = generateMockDiagnosis(selectedSymptoms, selectedPatient);
                setDiagnosisResult(mockResult);
                setCurrentStep(4);
                
                if (mockResult.conditions && mockResult.conditions.length > 0) {
                    updatePatientDiagnosis(selectedPatient.id, mockResult.conditions[0]);
                }
            }
        } finally {
            setIsDiagnosing(false);
        }
    };
    
    // Generate mock diagnosis data for demo purposes when API is unavailable
    const generateMockDiagnosis = (symptoms, patient) => {
        // Simple mapping of common symptoms to conditions for demo
        const symptomConditionMap = {
            'headache': { name: 'Tension headache', probability: 0.87, common_name: 'Stress headache' },
            'fever': { name: 'Common cold', probability: 0.75, common_name: 'Viral upper respiratory infection' },
            'cough': { name: 'Bronchitis', probability: 0.82, common_name: 'Chest cold' },
            'sore throat': { name: 'Pharyngitis', probability: 0.78, common_name: 'Sore throat' },
            'runny nose': { name: 'Rhinitis', probability: 0.9, common_name: 'Runny nose' },
            'chest pain': { name: 'Gastroesophageal reflux disease', probability: 0.65, common_name: 'GERD' },
            'shortness of breath': { name: 'Asthma', probability: 0.73, common_name: 'Reactive airway disease' },
            'fatigue': { name: 'Chronic fatigue syndrome', probability: 0.6, common_name: 'CFS' },
            'nausea': { name: 'Gastroenteritis', probability: 0.85, common_name: 'Stomach flu' },
            'dizziness': { name: 'Benign paroxysmal positional vertigo', probability: 0.7, common_name: 'Vertigo' },
            'joint pain': { name: 'Osteoarthritis', probability: 0.82, common_name: 'Degenerative joint disease' }
        };
        
        // Find matching conditions for selected symptoms
        const matchedConditions = [];
        const symptomLabels = symptoms.map(s => s.label.toLowerCase());
        
        for (const symptomLabel of symptomLabels) {
            // Find partial matches in the symptom map keys
            const matchingSymptomKey = Object.keys(symptomConditionMap).find(key => 
                symptomLabel.includes(key) || key.includes(symptomLabel)
            );
            
            if (matchingSymptomKey && symptomConditionMap[matchingSymptomKey]) {
                matchedConditions.push({
                    id: `demo_${matchingSymptomKey.replace(/\s/g, '_')}`,
                    name: symptomConditionMap[matchingSymptomKey].name,
                    common_name: symptomConditionMap[matchingSymptomKey].common_name,
                    probability: symptomConditionMap[matchingSymptomKey].probability
                });
            }
        }
        
        // If no matches found, provide a generic response
        if (matchedConditions.length === 0) {
            if (patient.age > 60) {
                matchedConditions.push({
                    id: 'demo_general_1',
                    name: 'Age-related condition',
                    common_name: 'Requires follow-up with primary care',
                    probability: 0.65
                });
            } else {
                matchedConditions.push({
                    id: 'demo_general_2',
                    name: 'Non-specific symptoms',
                    common_name: 'Consider lifestyle factors',
                    probability: 0.55
                });
            }
        }
        
        // Sort conditions by probability (highest first)
        matchedConditions.sort((a, b) => b.probability - a.probability);
        
        // Return mock diagnosis object
        return {
            question_type: 'diagnosis',
            conditions: matchedConditions,
            should_stop: true,
            symptom_prevalence: 0.8,
            interview_id: interviewId
        };
    };
    
    // Update patient diagnosis
    const updatePatientDiagnosis = (patientId, condition) => {
        const diagnosisText = `${condition.name} (${(condition.probability * 100).toFixed(1)}%)`;
        
        // Update the patients list
        setDemoPatients(demoPatients.map(p => {
            if (p.id === patientId) {
                return {
                    ...p,
                    diagnosis: diagnosisText
                };
            }
            return p;
        }));
        
        // Update selected patient
        if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient({
                ...selectedPatient,
                diagnosis: diagnosisText
            });
        }
    };
    
    // Reset demo
    const handleResetDemo = () => {
        setSelectedPatient(null);
        setSelectedSymptoms([]);
        setDiagnosisResult(null);
        setSymptomSearchTerm('');
        setSymptomSearchResults([]);
        setCurrentStep(1);
        
        // Reset patient diagnoses
        setDemoPatients(demoPatients.map(p => ({
            ...p,
            diagnosis: ""
        })));
    };
    
    return (
        <div style={styles.container}>
            {/* Demo Header Banner */}
            <div style={styles.demoHeader}>
                <h1 style={styles.demoTitle}>NurseAssist Demo Mode</h1>
                <p style={styles.demoDescription}>
                    Experience the power of NurseAssist without logging in. This demo lets you search for symptoms, 
                    select sample patients, and generate AI-powered diagnoses to see how our platform works.
                </p>
            </div>
            
            {/* Step 1: Select a Patient */}
            <div style={styles.stepContainer}>
                <div style={styles.stepTitle}>
                    <span style={styles.demoStep}>1</span>
                    Select a Demo Patient
                </div>
                
                {/* Show tutorial message if enabled */}
                {showTutorial && currentStep === 1 && (
                    <div style={{ 
                        padding: '10px 15px',
                        backgroundColor: '#E3F2FD',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '14px',
                        color: '#0D47A1'
                    }}>
                        {tutorialMessages.step1}
                    </div>
                )}
                
                {/* Patient cards grid */}
                <div style={styles.grid}>
                    {demoPatients.map(patient => (
                        <div
                            key={`patient-${patient.id}`}
                            onClick={() => handleSelectPatient(patient.id)}
                            style={{
                                ...styles.patientCard,
                                ...(selectedPatient && selectedPatient.id === patient.id ? styles.patientCardSelected : {})
                            }}
                        >
                            {/* Patient header with name */}
                            <div style={styles.patientHeader}>
                                <h4 style={styles.patientName}>{patient.name}</h4>
                                <span style={styles.demoBadge}>Demo</span>
                            </div>
                            
                            {/* Patient details */}
                            <div style={styles.patientDetails}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ 
                                        backgroundColor: '#E3F2FD', 
                                        color: '#1976D2',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        marginRight: '8px'
                                    }}>
                                        {`${patient.age} yrs`}
                                    </span>
                                    
                                    <span style={{ 
                                        backgroundColor: '#F3E5F5', 
                                        color: '#9C27B0',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {patient.gender === 'male' ? 'Male' : 'Female'}
                                    </span>
                                </div>
                                
                                {/* Show diagnosis if available */}
                                {patient.diagnosis && (
                                    <p style={{ 
                                        margin: '5px 0',
                                        padding: '5px 8px',
                                        backgroundColor: '#E8F5E9',
                                        color: '#388E3C',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        <strong>Diagnosis: </strong>
                                        {patient.diagnosis}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 2 & 3: Symptom Search & Selection (only shown if patient is selected) */}
            {selectedPatient && (
                <div>
                    {/* Step 2: Symptom Search */}
                    <div style={{...styles.stepContainer, marginBottom: '30px'}}>
                        <div style={styles.stepTitle}>
                            <span style={styles.demoStep}>2</span>
                            Search for Symptoms
                        </div>
                        
                        {/* Show tutorial message if enabled */}
                        {showTutorial && currentStep === 2 && (
                            <div style={{ 
                                padding: '10px 15px',
                                backgroundColor: '#E3F2FD',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                fontSize: '14px',
                                color: '#0D47A1'
                            }}>
                                {tutorialMessages.step2}
                            </div>
                        )}
                        
                        {/* Patient context display */}
                        <div style={{
                            backgroundColor: '#E3F2FD',
                            padding: '10px 15px',
                            borderRadius: '5px',
                            marginBottom: '15px',
                            border: '1px solid #BBDEFB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <strong>Selected Patient: </strong>
                                <span style={{ fontWeight: 'bold' }}>{selectedPatient.name}</span>
                                <span style={{ marginLeft: '10px', color: '#757575' }}>
                                    {`${selectedPatient.age} years, ${selectedPatient.gender === 'male' ? 'Male' : 'Female'}`}
                                </span>
                            </div>
                        </div>
                        
                        {/* Symptom search input */}
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Search for symptoms (e.g., headache, fever, cough)..."
                                value={symptomSearchTerm}
                                onChange={(e) => setSymptomSearchTerm(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        
                        {/* Searching indicator */}
                        {isSearchingSymptoms && (
                            <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                color: '#1976D2'
                            }}>
                                Searching for symptoms...
                            </div>
                        )}
                        
                        {/* Search error */}
                        {symptomSearchError && (
                            <div style={{ 
                                padding: '10px 15px',
                                backgroundColor: '#FFEBEE',
                                color: '#D32F2F',
                                borderRadius: '4px',
                                marginBottom: '15px'
                            }}>
                                {symptomSearchError}
                            </div>
                        )}
                        
                        {/* Search results */}
                        {!isSearchingSymptoms && symptomSearchResults.length > 0 && (
                            <ul style={{ 
                                listStyle: 'none', 
                                padding: 0, 
                                margin: 0, 
                                border: '1px solid #E0E0E0', 
                                borderRadius: '4px',
                                maxHeight: '200px', 
                                overflowY: 'auto',
                                backgroundColor: 'white'
                            }}>
                                {symptomSearchResults.map(symptom => (
                                    <li key={symptom.id} style={{ 
                                        padding: '10px 15px', 
                                        borderBottom: '1px solid #E0E0E0', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center'
                                    }}>
                                        <span>{symptom.label}</span>
                                        <button
                                            onClick={() => handleSelectSymptom(symptom)}
                                            style={styles.buttonPrimary}
                                        >
                                            Add
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* Step 3: Selected Symptoms */}
                    <div style={styles.stepContainer}>
                        <div style={styles.stepTitle}>
                            <span style={styles.demoStep}>3</span>
                            Review Selected Symptoms
                        </div>
                        
                        {/* Show tutorial message if enabled */}
                        {showTutorial && currentStep === 3 && (
                            <div style={{ 
                                padding: '10px 15px',
                                backgroundColor: '#E3F2FD',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                fontSize: '14px',
                                color: '#0D47A1'
                            }}>
                                {tutorialMessages.step3}
                            </div>
                        )}
                        
                        {/* Selected symptoms list */}
                        {selectedSymptoms.length > 0 ? (
                            <div style={{ 
                                padding: '15px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #E0E0E0',
                                marginBottom: '20px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '8px', 
                                    marginBottom: '15px' 
                                }}>
                                    {selectedSymptoms.map(symptom => (
                                        <span key={`selected-${symptom.id}`} style={{ 
                                            backgroundColor: '#E3F2FD', 
                                            padding: '5px 10px', 
                                            borderRadius: '15px', 
                                            display: 'inline-flex', 
                                            alignItems: 'center' 
                                        }}>
                                            <span style={{ marginRight: '8px', color: '#1976D2' }}>
                                                {symptom.label}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveSymptom(symptom.id)}
                                                style={{ 
                                                    background: '#a0a0a0', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '50%', 
                                                    width: '18px', 
                                                    height: '18px', 
                                                    cursor: 'pointer', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    fontSize: '12px', 
                                                    lineHeight: '1' 
                                                }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={handleGetDiagnosis}
                                    disabled={isDiagnosing || selectedSymptoms.length === 0}
                                    style={selectedSymptoms.length === 0 || isDiagnosing 
                                        ? styles.buttonDisabled 
                                        : styles.buttonSuccess}
                                >
                                    {isDiagnosing ? "Generating Diagnosis..." : "Get Diagnosis"}
                                </button>
                            </div>
                        ) : (
                            <div style={{ 
                                padding: '15px',
                                backgroundColor: '#FFF3E0',
                                color: '#E65100',
                                borderRadius: '4px',
                                marginBottom: '20px'
                            }}>
                                Search and add symptoms to generate a diagnosis
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Step 4: Diagnosis Results (only shown when diagnosis is available) */}
            {diagnosisResult && (
                <div style={styles.stepContainer}>
                    <div style={styles.stepTitle}>
                        <span style={styles.demoStep}>4</span>
                        View Diagnosis Results
                    </div>
                    
                    {/* Show tutorial message if enabled */}
                    {showTutorial && currentStep === 4 && (
                        <div style={{ 
                            padding: '10px 15px',
                            backgroundColor: '#E3F2FD',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            fontSize: '14px',
                            color: '#0D47A1'
                        }}>
                            {tutorialMessages.step4}
                        </div>
                    )}
                    
                    {/* Diagnosis results section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '20px',
                        marginBottom: '30px'
                    }}>
                        {/* Conditions list (final diagnosis) */}
                        {diagnosisResult.conditions && diagnosisResult.conditions.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ 
                                    fontSize: '18px',
                                    color: '#333333',
                                    marginTop: 0,
                                    marginBottom: '15px',
                                    borderBottom: '1px solid #E0E0E0',
                                    paddingBottom: '10px'
                                }}>
                                    Suggested Diagnoses
                                </h3>
                                
                                {diagnosisResult.conditions.slice(0, 3).map((condition, index) => (
                                    <div key={`condition-${index}`} style={{
                                        padding: '15px',
                                        backgroundColor: index === 0 ? '#E8F5E9' : '#F5F5F5',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        borderLeft: index === 0 ? '4px solid #4CAF50' : 'none'
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            marginBottom: '5px'
                                        }}>
                                            <span style={{ fontWeight: 'bold' }}>{condition.name}</span>
                                            <span style={{
                                                backgroundColor: index === 0 ? '#4CAF50' : '#9E9E9E',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px'
                                            }}>
                                                {`${(condition.probability * 100).toFixed(1)}%`}
                                            </span>
                                        </div>
                                        {condition.common_name && (
                                            <div style={{ fontSize: '14px', color: '#757575', marginBottom: '5px' }}>
                                                Also known as: {condition.common_name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Footer with actions */}
            <div style={styles.footer}>
                <div>
                    {currentStep > 1 && (
                        <button 
                            onClick={handleResetDemo}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: 'transparent',
                                color: '#1976D2',
                                border: '1px solid #1976D2',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginRight: '10px'
                            }}
                        >
                            Reset Demo
                        </button>
                    )}
                </div>
                <div>
                    <button
                        onClick={() => setShowTutorial(!showTutorial)}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: 'transparent',
                            color: showTutorial ? '#F44336' : '#4CAF50',
                            border: `1px solid ${showTutorial ? '#F44336' : '#4CAF50'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {showTutorial ? 'Hide Tutorials' : 'Show Tutorials'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DemoDashboard;
