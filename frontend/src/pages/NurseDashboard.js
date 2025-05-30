import React, { useState, useEffect, useMemo } from "react"; 
import { searchSymptomsApi, getDiagnosisApi, saveDiagnosisApi } from '../services/symptomService';
import { getPatients } from '../services/patientService';
import { v4 as uuidv4 } from 'uuid'; 
import { debounce } from 'lodash'; 

const mockPatients = [
    {id: 1, name: "patient1", status: "Pending Diagnosis", symptoms: "", diagnosis: "", age: "", sex: ""},
    {id: 2, name: "patient2", status: "Diagnosis Confirmed", symptoms: "", diagnosis: "", age: "", sex: ""},
    {id: 3, name: "patiente3", status: "Awaiting Symptoms", symptoms: "", diagnosis: "", age: "", sex: ""}
]

function NurseDashboard({handleLogout, userName}){
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
        // Patient List
        patientList: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        patientCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #E0E0E0'
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
        statusBadge: {
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
        },
        patientDetails: {
            marginBottom: '15px',
            fontSize: '14px',
            color: '#757575'
        },
        actionButtons: {
            display: 'flex',
            gap: '10px',
            marginTop: 'auto'
        },
        primaryButton: {
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        primaryButtonHover: {
            backgroundColor: '#1565C0'
        },
        secondaryButton: {
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
            border: '1px solid #1976D2',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        secondaryButtonHover: {
            backgroundColor: '#BBDEFB'
        },
        successButton: {
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        successButtonHover: {
            backgroundColor: '#388E3C'
        },
        warningButton: {
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
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
            padding: '8px 12px',
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
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'not-allowed'
        },
        // Diagnosis Workspace
        diagnosisWorkspace: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '20px',
            marginTop: '20px'
        },
        workspaceTitle: {
            color: '#1976D2',
            fontSize: '18px',
            fontWeight: '500',
            marginBottom: '15px',
            borderBottom: '1px solid #E0E0E0',
            paddingBottom: '10px'
        },
        inputGroup: {
            marginBottom: '15px'
        },
        inputLabel: {
            display: 'block',
            marginBottom: '8px',
            color: '#333333',
            fontSize: '14px',
            fontWeight: '500'
        },
        inputField: {
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            fontSize: '14px',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
        },
        messageBox: {
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
        },
        success: {
            backgroundColor: '#E8F5E9',
            color: '#388E3C',
            border: '1px solid #C8E6C9'
        },
        error: {
            backgroundColor: '#FFEBEE',
            color: '#D32F2F',
            border: '1px solid #FFCDD2'
        },
        info: {
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
            border: '1px solid #BBDEFB'
        },
        warning: {
            backgroundColor: '#FFF3E0',
            color: '#E65100',
            border: '1px solid #FFE0B2'
        },
        tag: {
            backgroundColor: '#E3F2FD',
            color: '#1976D2',
            padding: '5px 10px',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            margin: '3px',
            fontSize: '14px'
        },
        tagLabel: {
            marginRight: '5px'
        },
        tagDelete: {
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '10px'
        },
        // Diagnosis Results
        diagnosisResults: {
            backgroundColor: '#F8FAFC',
            border: '1px solid #BBDEFB',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '20px'
        },
        diagnosisConditions: {
            borderLeft: '4px solid #4CAF50',
            backgroundColor: '#E8F5E9',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '10px'
        },
        questionBox: {
            backgroundColor: '#E3F2FD',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid #BBDEFB'
        },
        questionText: {
            color: '#0D47A1',
            marginBottom: '10px',
            fontWeight: '500'
        },
        choiceButtons: {
            display: 'flex',
            gap: '8px',
            marginTop: '10px',
            flexWrap: 'wrap'
        },
        // Loading
        loadingSpinner: {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderRadius: '50%',
            borderTopColor: '#1976D2',
            animation: 'spin 1s linear infinite',
            marginRight: '10px'
        },
        loading: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            color: '#1976D2'
        }
    };

    const [patients, setPatients] = useState([]); 
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

    const [selectedSymptoms, setSelectedSymptoms] = useState([]); 

    const [diagnosisResult, setDiagnosisResult] = useState(null);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [diagnosisError, setDiagnosisError] = useState(null);

    const [gatheredEvidence, setGatheredEvidence] = useState([]); // State for all evidence during interview

    const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);
    const [saveDiagnosisError, setSaveDiagnosisError] = useState(null);
    const [diagnosisSaved, setDiagnosisSaved] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null); 

    // UseEffect for initial data fetch or other side effects
    useEffect(() => {
        // Fetch real patients from the database
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    console.error('No authentication token found');
                    return;
                }
                
                // Get all patients assigned to this nurse
                const patientsData = await getPatients(token);
                console.log('Fetched patients:', patientsData);
                setPatients(patientsData);
            } catch (error) {
                console.error('Error fetching patients:', error);
                // Fallback to mock data if API fails
                setPatients(mockPatients);
            }
        };
        
        fetchPatients();
    }, []);

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
        setDiagnosisResult(null);
        setDiagnosisError('');
        setGatheredEvidence([]); // Clear accumulated evidence on new search

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


    const handleSelectSymptom = (symptom) => {
        console.log(">>> NurseDashboard: Selecting symptom:", symptom);
        // Add symptom only if it's not already selected
        if (!selectedSymptoms.some(s => s.id === symptom.id)) {
            setSelectedSymptoms(prevSelected => [...prevSelected, symptom]);
        }
        // Optionally clear search term/results after selection
        setSymptomSearchTerm('');
        setSymptomSearchResults([]);
    };

    const handleRemoveSymptom = (symptomIdToRemove) => {
        console.log(">>> NurseDashboard: Removing symptom ID:", symptomIdToRemove);
        setSelectedSymptoms(prevSelected => 
            prevSelected.filter(symptom => symptom.id !== symptomIdToRemove)
        );
    };

    const handleGetDiagnosis = async (evidenceToUse = null) => {
        console.log(">>> NurseDashboard: handleGetDiagnosis triggered with evidenceToUse type:", evidenceToUse ? (Array.isArray(evidenceToUse) ? 'array' : typeof evidenceToUse) : 'null');
        // Safe logging for complex objects - avoid JSON.stringify for potentially circular structures
        if (evidenceToUse && Array.isArray(evidenceToUse)) {
            console.log(">>> NurseDashboard: evidenceToUse contains", evidenceToUse.length, "items");
            try {
                console.log(">>> Evidence items:", evidenceToUse.map(e => ({id: e.id, choice_id: e.choice_id})));
            } catch (err) {
                console.log(">>> NurseDashboard: Could not log evidence items:", err.message);
            }
        }
        
        const token = localStorage.getItem('userToken');

        // Log all potentially relevant state values to diagnose issues
        console.log(">>> NurseDashboard: Current state for diagnosis:", { 
            patientAge, 
            patientSex, 
            interviewId, 
            selectedSymptomsCount: selectedSymptoms.length,
            gatheredEvidenceCount: gatheredEvidence.length,
            hasToken: !!token,
            isDiagnosing
        });

        if (!patientAge || !patientSex || !interviewId || !token) {
            console.error(">>> NurseDashboard: VALIDATION FAILED - Missing required info for diagnosis:", { 
                hasAge: !!patientAge, 
                hasSex: !!patientSex, 
                hasInterviewId: !!interviewId, 
                hasToken: !!token 
            });
            setDiagnosisError("Missing patient age, sex, or authentication.");
            return;
        }

        // Initialize evidence array
        let currentEvidence = [];
        console.log(">>> NurseDashboard: Determining evidence source...");

        // Determine which evidence source to use
        if (Array.isArray(evidenceToUse) && evidenceToUse.length > 0) {
            // Use the directly provided evidence array
            console.log(">>> NurseDashboard: Using provided evidence array:", 
                evidenceToUse.map(e => `${e.id}:${e.choice_id}`));
            currentEvidence = evidenceToUse;
        } else if (gatheredEvidence.length > 0) {
            // Use existing gathered evidence
            console.log(">>> NurseDashboard: Using existing gatheredEvidence:", 
                gatheredEvidence.map(e => `${e.id}:${e.choice_id}`));
            currentEvidence = gatheredEvidence;
        } else if (selectedSymptoms.length > 0) {
            // Create new evidence from selected symptoms
            console.log(">>> NurseDashboard: Creating initial evidence from selectedSymptoms:", 
                selectedSymptoms.map(s => s.id));
                
            currentEvidence = selectedSymptoms.map(symptom => ({
                id: symptom.id,
                choice_id: 'present' // Assuming initial symptoms are 'present'
            }));
            // Store this as our gathered evidence base
            setGatheredEvidence(currentEvidence);
        } else {
            // No evidence available from any source
            console.error(">>> NurseDashboard: No evidence available!");
            setDiagnosisError("Please select at least one symptom first.");
            return;
        }

        // Format evidence for the API
        const evidence = currentEvidence;

        // Verify evidence format
        if (!Array.isArray(evidence)) {
            console.error(">>> NurseDashboard: FATAL - Evidence is not an array!", evidence);
            setDiagnosisError("Internal error: Evidence data is invalid.");
            return;
        }
        
        if (evidence.length === 0) {
            console.error(">>> NurseDashboard: FATAL - Evidence array is empty!");
            setDiagnosisError("At least one symptom is required.");
            return;
        }

        // Validate evidence item format
        const invalidItems = evidence.filter(item => !item.id || !item.choice_id);
        if (invalidItems.length > 0) {
            console.error(">>> NurseDashboard: FATAL - Evidence contains invalid items:", invalidItems);
            setDiagnosisError("Internal error: Evidence data is in wrong format.");
            return;
        }

        console.log(">>> NurseDashboard: Calling getDiagnosisApi with:", { 
            sex: patientSex, 
            age: patientAge, 
            evidence: Array.isArray(evidence) ? evidence.map(e => `${e.id}:${e.choice_id}`) : "NOT AN ARRAY", 
            interviewId 
        });
        
        setIsDiagnosing(true);
        setDiagnosisError(null);
        setDiagnosisResult(null); // Clear previous results

        try {
            const result = await getDiagnosisApi(patientSex, patientAge, evidence, interviewId, token);
            console.log(">>> NurseDashboard: Diagnosis API call successful. Response contains:", {
                hasQuestion: !!result.question,
                questionType: result.question?.type,
                questionItemsCount: result.question?.items?.length || 0,
                conditionsCount: result.conditions?.length || 0,
                shouldStop: result.should_stop
            });
            setDiagnosisResult(result);
        } catch (error) {
            console.error(">>> NurseDashboard: Diagnosis API call FAILED:", {
                message: error.message,
                stack: error.stack?.substring(0, 200) // Just log part of the stack trace
            });
            setDiagnosisError(error.message || "Failed to get diagnosis from backend");
        } finally {
            setIsDiagnosing(false);
        }
    };

    const handleQuestionAnswer = async (itemId, choiceId) => {
        console.log(`>>> NurseDashboard: handleQuestionAnswer called for item ${itemId} with choice ${choiceId}`);
        console.log(">>> NurseDashboard: Current gatheredEvidence before answer:", 
            Array.isArray(gatheredEvidence) ? gatheredEvidence.map(e => `${e.id}:${e.choice_id}`) : "NOT AN ARRAY");

        // Validate inputs
        if (!itemId || !choiceId) {
            console.error(">>> NurseDashboard: ERROR - Invalid question answer parameters", { itemId, choiceId });
            setDiagnosisError("Cannot process answer: Invalid parameters");
            return;
        }

        // Check if we're already processing a diagnosis request
        if (isDiagnosing) {
            console.log(">>> NurseDashboard: Ignoring answer while previous diagnosis is in progress");
            return;
        }

        // Create new evidence object from the answer
        const newEvidence = { id: itemId, choice_id: choiceId };
        console.log(">>> NurseDashboard: Created new evidence object:", newEvidence);

        // Create updated evidence list with the new answer
        let updatedEvidence;
        
        // Make sure we're working with a proper array of existing evidence
        const currentEvidence = Array.isArray(gatheredEvidence) ? gatheredEvidence : [];
        
        // Check if we've already answered this question - if so, replace the answer
        const existingIndex = currentEvidence.findIndex(e => e.id === itemId);
        if (existingIndex >= 0) {
            console.log(`>>> NurseDashboard: Replacing existing answer for ${itemId}`);
            updatedEvidence = [...currentEvidence];
            updatedEvidence[existingIndex] = newEvidence;
        } else {
            // Otherwise add as a new piece of evidence
            console.log(`>>> NurseDashboard: Adding new answer for ${itemId}`);
            updatedEvidence = [...currentEvidence, newEvidence];
        }
        
        console.log(">>> NurseDashboard: Updated evidence array:", 
            updatedEvidence.map(e => `${e.id}:${e.choice_id}`));
            
        // Update state (for future reference)
        setGatheredEvidence(updatedEvidence);

        try {
            // Immediately trigger diagnosis with the updated evidence directly
            // Instead of waiting for gatheredEvidence state to update
            console.log(">>> NurseDashboard: Calling handleGetDiagnosis with updated evidence array...");
            await handleGetDiagnosis(updatedEvidence);
        } catch (error) {
            console.error(">>> NurseDashboard: ERROR in handleQuestionAnswer:", error);
            setDiagnosisError("Failed to process your answer. Please try again.");
        }
    };

    const handleEnterSymptoms = (patientID) => {
        // Get current patient to extract age and sex
        const currentPatient = patients.find(patient => patient.id === patientID);
        
        // Clear previous symptoms/diagnosis state
        setSymptomsInput(""); 
        setSymptomSearchResults([]);
        setSelectedSymptoms([]);
        setGatheredEvidence([]);
        setDiagnosisResult(null);
        setDiagnosisError(null);
        setDiagnosisSaved(false);
        setSaveDiagnosisError(null);
        
        // Set patient age and sex for API calls
        setPatientAge(currentPatient?.age || '');
        setPatientSex(currentPatient?.sex || 'male');
        
        // IMPORTANT: Set both patient ID variables to ensure consistency
        // This fixes the missing patient ID when saving the diagnosis
        setSelectedPatientID(patientID); // For displaying patient info in UI
        setSelectedPatientId(patientID); // For saving the diagnosis to database
        
        console.log(`Entering symptoms for patient ID: ${patientID}`);
    }
    
    /**
     * Save the current diagnosis to the database
     */
    const handleSaveDiagnosis = async (condition) => {
        // Debug the selectedPatientId - this will help identify the issue
        console.log('Saving diagnosis for patient:', { 
            selectedPatientId, 
            selectedPatientID, 
            patientIdType: typeof selectedPatientId,
            condition
        });
        
        if (!selectedPatientId) {
            setSaveDiagnosisError("No patient selected. Please select a patient first.");
            return;
        }
        
        // Ensure the patient ID is a valid string or number
        const patientId = String(selectedPatientId);
        if (!patientId) {
            setSaveDiagnosisError("Invalid patient ID.");
            return;
        }
        
        if (!condition || !condition.id || !condition.name) {
            setSaveDiagnosisError("Invalid condition data.");
            return;
        }
        
        // Parse and prepare symptoms from gathered evidence
        let symptoms = [];
        
        // Only process symptoms that were confirmed as 'present'
        if (gatheredEvidence && gatheredEvidence.length > 0) {
            console.log(`Processing ${gatheredEvidence.length} evidence items to extract symptoms`);
            
            // Filter only present symptoms (not absent or unknown)
            const presentSymptoms = gatheredEvidence.filter(evidence => evidence.choice_id === 'present');
            console.log(`Found ${presentSymptoms.length} present symptoms/findings`);
            
            symptoms = presentSymptoms.map(evidence => {
                // Determine if this is a symptom (s_) or finding (p_)
                const isSymptom = evidence.id.startsWith('s_');
                
                // Look for a name in our selected symptoms first
                let symptomName = `${isSymptom ? 'Symptom' : 'Finding'} ${evidence.id}`;
                let severityLevel = 'moderate'; // Default severity
                
                // Try to find the proper name from selectedSymptoms
                const selectedSymptom = selectedSymptoms.find(s => s.id === evidence.id);
                if (selectedSymptom) {
                    symptomName = selectedSymptom.name || selectedSymptom.common_name || symptomName;
                    // Optional: could extract severity from selectedSymptom if available
                }
                
                // Construct a clean symptom object for database storage
                // IMPORTANT: Follow the backend schema exactly - remove type field
                return {
                    id: evidence.id || '', // Ensure non-empty string
                    name: symptomName || `${isSymptom ? 'Symptom' : 'Finding'} ${evidence.id || 'unknown'}`, // Ensure non-empty string
                    severity: severityLevel || 'moderate' // Ensure valid enum value
                    // Do NOT include fields not in the backend schema
                };
            });
        } else if (selectedSymptoms && selectedSymptoms.length > 0) {
            // Fallback to using directly selected symptoms if no interview was conducted
            console.log(`Using ${selectedSymptoms.length} directly selected symptoms`);
            symptoms = selectedSymptoms.map(s => ({
                id: s.id || '',  // Ensure non-empty string
                name: s.name || s.common_name || `Symptom ${s.id || 'unknown'}`,  // Ensure non-empty string
                severity: 'moderate'
                // Do NOT include type - not in backend schema
            }));
        }
        
        console.log(`Final symptom list for saving diagnosis:`, symptoms);
        
        if (symptoms.length === 0) {
            setSaveDiagnosisError("No symptoms identified. Cannot save diagnosis without symptoms.");
            return;
        }
        
        // Get the token for authentication
        const token = localStorage.getItem('userToken');
        if (!token) {
            setSaveDiagnosisError("Authentication required. Please log in again.");
            return;
        }
        
        try {
            setIsSavingDiagnosis(true);
            setSaveDiagnosisError(null);
            
            // Determine if this is potentially critical based on probability
            const isCritical = condition.probability > 0.7;
            const confidenceScore = condition.probability * 100;

            // Call the API to save the diagnosis
            await saveDiagnosisApi(
                patientId, // Use the validated patient ID string
                condition.id,
                condition.name,
                confidenceScore,
                isCritical,
                symptoms,
                token
            );
            
            setDiagnosisSaved(true);
            // Optional: Show a success message or navigate
            // navigate(`/patients/${selectedPatientId}`);
            
        } catch (error) {
            console.error("Error saving diagnosis:", error);
            setSaveDiagnosisError(error.message || "Failed to save diagnosis");
            setDiagnosisSaved(false);
        } finally {
            setIsSavingDiagnosis(false);
        }
    };

    const handleSubmitSymptoms = (patientID) => {
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

    function handleGenerateDiagnosis(patientID){
        // Starting the interface for infermedica interaction for a patient
        const currentPatient = patients.find(patient => patient.id === patientID);
        
        // Reset all diagnosis-related state
        setGatheredEvidence([]);
        setSelectedSymptoms([]);
        setDiagnosisResult(null);
        setDiagnosisError(null);
        setDiagnosisSaved(false);
        setSaveDiagnosisError(null);
        
        // Set the patient information for the diagnosis
        setPatientAge(currentPatient?.age || '')
        setPatientSex(currentPatient?.sex || 'male');
        
        // IMPORTANT: Set both patient ID variables to ensure consistency
        // This fixes the missing patient ID when saving the diagnosis
        setSelectedPatientID(patientID); // For displaying patient info
        setSelectedPatientId(patientID); // For saving the diagnosis to database
        
        console.log(`Starting diagnosis for patient ID: ${patientID}`);
        
        // Update patient status in the UI
        const updatedPatients = patients.map(patient => {
            if (patient.id === patientID) {
                return { ...patient, status: "Diagnosis In Progress" };
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

    return React.createElement("div", { style: styles.container }, [
        // Header with user info and title
        React.createElement("div", { key: "header", style: styles.header }, [
            React.createElement("h1", { key: "title", style: styles.title }, "NurseAssist Dashboard"),
            React.createElement("div", { key: "user-info", style: styles.userInfo }, [
                React.createElement("div", { key: "user-icon", style: styles.userIcon }, userName?.charAt(0) || "N"),
                React.createElement("span", { key: "user-name" }, userName ? `Welcome, ${userName}` : "Nurse")
            ])
        ]),

        React.createElement("div", {key: "symptom-search-section", style: { marginTop: '20px', padding: '15px', border: '1px solid lightgrey', borderRadius: '5px' } }, [
            React.createElement("h3", { key: "symptom-search-title" }, "Symptom Search"),
            
            // Active Patient Banner - clearly shows which patient is selected
            selectedPatientId && React.createElement("div", {
                key: "active-patient-banner",
                style: {
                    backgroundColor: '#e3f2fd',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    border: '1px solid #2196f3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                React.createElement("div", {key: "patient-identifier"}, [
                    React.createElement("strong", null, "Currently Working With: "),
                    React.createElement("span", {style: {fontWeight: 'bold'}}, 
                        patients.find(p => p.id === parseInt(selectedPatientId))?.name || `Patient #${selectedPatientId}`
                    )
                ]),
                React.createElement("button", {
                    key: "change-patient-button",
                    onClick: () => {
                        // Reset patient selection
                        setSelectedPatientId(null);
                        setSelectedPatientID(null);
                        setSelectedSymptoms([]);
                        setGatheredEvidence([]);
                        setDiagnosisResult(null);
                        setDiagnosisError(null);
                        setDiagnosisSaved(false);
                        setSaveDiagnosisError(null);
                    },
                    style: {
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }
                }, "Change Patient")
            ]),
            
            React.createElement("div", {key: "patient-context", style: { marginBottom: '10px'} }, [
                React.createElement("label", { htmlFor: "patientAgeInput", style: { marginRight: '5px'} }, "Patient Age:"),
                React.createElement("input", {
                    id: "patientAgeInput",
                    key: "patientAgeInput",
                    type: "number",
                    placeholder: "e.g., 30",
                    value: patientAge,
                    onChange: handlePatientAgeChange,
                    style: { width: '80px', padding: '8px', marginRight: '15px' } 
                }),
                React.createElement("label", { htmlFor: "patientSexInput", style: { marginRight: '5px'} }, "Patient Sex:"),
                React.createElement("select", {
                    id: "patientSexInput",
                    key: "patientSexSelect",
                    value: patientSex,
                    onChange: handlePatientSexChange,
                    style: { padding: '8px' }
                }, [
                    React.createElement("option", { key: "sex-blank", value: "" }, "Select..."),
                    React.createElement("option", { key: "sex-male", value: "male" }, "Male"),
                    React.createElement("option", { key: "sex-female", value: "female" }, "Female")
                ]),
                 // Display error if age/sex missing
                 (!patientAge || !patientSex) && symptomSearchTerm && React.createElement("p", {key: "age-sex-warning", style: { color: 'orange', fontSize: '0.9em', marginTop: '5px'}}, "Please enter patient age and sex to enable search.")
            ]),
            React.createElement("input", {
                key: "symptomSearchInput",
                type: "text",
                placeholder: "Search for symptoms...",
                value: symptomSearchTerm,
                onChange: (e) => setSymptomSearchTerm(e.target.value),
                disabled: !patientAge || !patientSex, // Disable if age/sex missing
                style: { width: '95%', padding: '10px', marginBottom: '5px' } 
            }),

            // RENDER SEARCH RESULTS HERE
            isSearchingSymptoms && React.createElement("p", { key: "searching-indicator" }, "Searching..."),
            symptomSearchError && React.createElement("p", { key: "search-error", style: { color: 'red' } }, symptomSearchError),
            !isSearchingSymptoms && symptomSearchResults.length > 0 && React.createElement("ul", {
                key: "symptom-results-list",
                style: { listStyle: 'none', padding: 0, margin: 0, border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto' }
            }, symptomSearchResults.map(symptom => (
                React.createElement("li", {
                    key: symptom.id,
                    style: { padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
                }, [
                    React.createElement("span", { key: `label-${symptom.id}` }, symptom.label),
                    React.createElement("button", {
                        key: `add-${symptom.id}`,
                        onClick: () => handleSelectSymptom(symptom),
                        style: { padding: '3px 8px', cursor: 'pointer' }
                    }, "Add")
                ])
            )))
        ]),

        // DISPLAY SELECTED SYMPTOMS
        selectedSymptoms.length > 0 && React.createElement("div", {
            key: "selected-symptoms-section",
            style: { marginTop: '15px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' }
        }, [
            React.createElement("h4", { key: "selected-title", style: { marginBottom: '10px'} }, "Selected Symptoms:"),
            React.createElement("div", { key: "selected-list", style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, 
                selectedSymptoms.map(symptom => (
                    React.createElement("span", {
                        key: `selected-${symptom.id}`,
                        style: { 
                            backgroundColor: '#e0e0e0', 
                            padding: '5px 10px', 
                            borderRadius: '15px', 
                            display: 'inline-flex', 
                            alignItems: 'center' 
                        }
                    }, [
                        React.createElement("span", { key: `text-${symptom.id}`, style: { marginRight: '8px' } }, symptom.label),
                        React.createElement("button", {
                            key: `remove-${symptom.id}`,
                            onClick: () => handleRemoveSymptom(symptom.id),
                            style: { 
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
                            }
                        }, "x") // Simple 'x' for remove
                    ])
                ))
            ),
            React.createElement("button", {
                key: "get-diagnosis",
                onClick: handleGetDiagnosis,
                disabled: isDiagnosing || selectedSymptoms.length === 0, // Disable if diagnosing or no symptoms selected
                style: { padding: '8px', cursor: 'pointer', marginTop: '10px' } // Added margin
            }, isDiagnosing ? "Getting Diagnosis..." : "Get Diagnosis")
        ]),

        // ---> DISPLAY DIAGNOSIS RESULTS / LOADING / ERROR
        React.createElement("div", { 
            key: "diagnosis-output-section",
            style: { marginTop: '20px', padding: '15px', border: '1px solid lightblue', borderRadius: '5px', minHeight: '50px' }
        }, [
            // Show which patient this diagnosis is for (if a patient is selected)
            selectedPatientId && React.createElement("div", {
                key: "diagnosis-patient-context",
                style: {
                    backgroundColor: '#e8f5e9',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    border: '1px solid #4caf50',
                    display: 'flex',
                    alignItems: 'center'
                }
            }, [
                React.createElement("div", null, [
                    React.createElement("span", {style: {fontWeight: 'bold', marginRight: '10px'}}, "Diagnosis For:"),
                    React.createElement("span", null, 
                        patients.find(p => p.id === parseInt(selectedPatientId))?.name || `Patient #${selectedPatientId}`
                    )
                ])
            ]),
            isDiagnosing && React.createElement("p", {key: "diag-loading"}, "Loading diagnosis..."),
            diagnosisError && React.createElement("p", {key: "diag-error", style: { color: 'red' } }, `Error: ${diagnosisError}`),
            diagnosisResult && React.createElement("div", {key: "diag-result"}, [
                // Check if the result is a question
                diagnosisResult.question && React.createElement("div", {key: "diag-question"}, [
                    React.createElement("h4", {key: "question-title"}, "Next Question:"),
                    React.createElement("p", {key: "question-text"}, diagnosisResult.question.text),
                    React.createElement("ul", {key: "question-items", style: {listStyle: 'none', paddingLeft: '10px'}}, 
                        diagnosisResult.question.items.map(item => (
                            React.createElement("li", {key: item.id, style: { marginBottom: '10px' } }, [
                                React.createElement("span", {key: `item-name-${item.id}`, style: { marginRight: '10px' } }, item.name),
                                // Render buttons for each choice provided by the API
                                item.choices.map(choice => (
                                    React.createElement("button", {
                                        key: `${item.id}-${choice.id}`,
                                        onClick: () => handleQuestionAnswer(item.id, choice.id),
                                        disabled: isDiagnosing, // Disable buttons while waiting for API response
                                        style: { marginLeft: '5px', padding: '5px 8px', cursor: 'pointer' }
                                    }, choice.label) // Use the label from the API (e.g., 'Yes', 'No')
                                ))
                            ])
                        ))
                    )
                ]),
                // Check if the result contains conditions (final diagnosis)
                diagnosisResult.conditions && diagnosisResult.conditions.length > 0 && React.createElement("div", {
                    key: "diag-conditions",
                    style: { 
                        backgroundColor: '#f8f9fa', 
                        border: '2px solid #28a745', 
                        borderRadius: '8px', 
                        padding: '15px',
                        marginTop: '20px'
                    }
                }, [
                    // Diagnosis complete banner
                    React.createElement("div", {
                        key: "diagnosis-complete-banner",
                        style: {
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '5px',
                            marginBottom: '15px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            textAlign: 'center'
                        }
                    }, "✅ INTERVIEW COMPLETE - Please review and save the diagnosis"),
                    
                    React.createElement("h4", {key: "conditions-title", style: {fontSize: '18px', marginBottom: '10px'}}, "Diagnosis Results:"),
                    
                    // Show top conditions
                    React.createElement("div", {key: "top-conditions", style: {marginBottom: '20px'}}, [
                        React.createElement("ul", {key: "conditions-list", style: {listStyle: 'disc', paddingLeft: '20px'}}, 
                            diagnosisResult.conditions.map(condition => (
                                React.createElement("li", 
                                    {key: condition.id, style: { marginBottom: '12px', padding: '8px', backgroundColor: condition.probability > 0.1 ? '#f0f7ff' : '#fff', borderRadius: '5px' }}, 
                                    [
                                        React.createElement("div", {key: `condition-text-${condition.id}`, style: {fontWeight: condition.probability > 0.3 ? 'bold' : 'normal'}},
                                            `${condition.name} (Confidence: ${(condition.probability * 100).toFixed(1)}%)`
                                        )
                                    ]
                                )
                            ))
                        )
                    ]),
                    
                    // PROMINENT SAVE SECTION
                    React.createElement("div", {
                        key: "save-diagnosis-section",
                        style: {
                            backgroundColor: '#e8f4f8', 
                            border: '1px solid #007bff',
                            borderRadius: '5px',
                            padding: '15px',
                            marginTop: '10px',
                            textAlign: 'center'
                        }
                    }, [
                        React.createElement("h4", {key: "save-title", style: {marginTop: '0'}}, "Save Diagnosis to Database"),
                        React.createElement("p", {key: "save-instruction"}, "Select the most likely condition to save the diagnosis for this patient. The diagnosis and symptoms will be stored in the database for doctor review."),
                        
                        // Top conditions with large save buttons
                        React.createElement("div", {key: "save-conditions-buttons", style: {marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px'}},
                            diagnosisResult.conditions
                                .filter(condition => condition.probability > 0.1) // Only show conditions with >10% confidence
                                .slice(0, 3) // Show top 3 conditions
                                .map(condition => (
                                    React.createElement("button", {
                                        key: `save-condition-${condition.id}`,
                                        onClick: () => handleSaveDiagnosis(condition),
                                        disabled: isSavingDiagnosis || diagnosisSaved,
                                        style: { 
                                            padding: '12px 20px', 
                                            backgroundColor: diagnosisSaved ? '#8bc34a' : '#2196f3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }
                                    }, [
                                        React.createElement("span", null, `${diagnosisSaved ? "Saved" : "Save Diagnosis"}: ${condition.name}`),
                                        React.createElement("span", {style: {fontWeight: 'bold'}}, `${(condition.probability * 100).toFixed(1)}%${diagnosisSaved ? " ✓" : ""}`)
                                    ])
                                ))
                        ),
                        
                        // Show message if no conditions meet threshold
                        diagnosisResult.conditions.filter(c => c.probability > 0.1).length === 0 && 
                            React.createElement("p", {style: {color: '#dc3545', marginTop: '10px'}}, 
                                "No conditions with sufficient confidence (>10%) to save. Please continue the interview or start over."
                            ),
                            
                        // Status message
                        diagnosisSaved && React.createElement("p", {style: {color: '#28a745', marginTop: '15px', fontWeight: 'bold'}}, 
                            "✅ Diagnosis successfully saved to database and will be reviewed by the doctor."
                        ),
                        
                        isSavingDiagnosis && React.createElement("p", {style: {color: '#007bff', marginTop: '10px'}}, 
                            "Saving diagnosis to database..."
                        )
                    ]),
                    
                    // Error message for diagnosis saving
                    saveDiagnosisError && React.createElement("p", {
                        key: "save-error", 
                        style: { color: '#dc3545', marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px' }
                    }, `Error saving diagnosis: ${saveDiagnosisError}`)
                ]),
                // Handle case where API might return neither (shouldn't happen often)
                !diagnosisResult.question && (!diagnosisResult.conditions || diagnosisResult.conditions.length === 0) && React.createElement("p", {key: "diag-unknown"}, "Received an unexpected response from the diagnosis API.")
            ])
        ]),

        // Controls section
        React.createElement("div", { key: "controls", style: styles.controls }, [
            // Search bar
            React.createElement("div", { key: "search-bar", style: styles.searchBar }, [
                React.createElement("input", {
                    key: "searchBox", 
                    type: "text", 
                    placeholder: "Search patients...", 
                    value: searchTerm, 
                    onChange: (e) => setSearchTerm(e.target.value),
                    style: styles.searchInput
                })
            ]),
            // Filter controls
            React.createElement("div", { key: "filter-controls", style: styles.filterControls }, [
                React.createElement("select", {
                    key: "sortSelector",
                    value: sortType,
                    onChange: handleSortChange,
                    style: styles.select
                }, [
                    React.createElement("option", { key: "sort-name", value: "name" }, "Sort by Name"),
                    React.createElement("option", { key: "sort-status", value: "status" }, "Sort by Status")
                ]),
                React.createElement("button", {
                    key: "exportButton",
                    onClick: handleExportPatients,
                    style: styles.secondaryButton
                }, "Export Data")
            ])
        ]),

        // Patients List
        React.createElement("h3", { key: "patient-section-title", style: { color: styles.colors.primary, marginTop: '30px', marginBottom: '15px' } }, "My Patients"),
            
        React.createElement("div", { key: "patients-list", style: styles.patientList },
            // Display a message if no patients are loaded
            patients.length === 0 ? 
                React.createElement("div", { style: styles.loading }, [
                    React.createElement("span", { style: styles.loadingSpinner }),
                    React.createElement("span", null, "Loading patients...")
                ]) :
                patients.filter((patient) =>
                    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (patient.status?.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((patient) =>
                    // Patient Card
                    React.createElement("div", {
                        key: `patient-${patient.id}`, 
                        style: Object.assign({}, 
                            styles.patientCard, 
                            selectedPatientId === patient.id ? { borderColor: styles.colors.primary, borderWidth: '2px' } : {}
                        )
                    }, [ 
                        // Patient header with name and status badge
                        React.createElement("div", {
                            key: `patient-header-${patient.id}`,
                            style: styles.patientHeader
                        }, [
                            React.createElement("h4", {
                                key: `patient-name-${patient.id}`,
                                style: styles.patientName
                            }, patient.name),
                            
                            // Status badge with color based on status
                            React.createElement("span", {
                                key: `patient-status-${patient.id}`,
                                style: Object.assign({}, 
                                    styles.statusBadge, 
                                    {
                                        backgroundColor: 
                                            patient.status === "Diagnosis Confirmed" ? '#E8F5E9' : 
                                            patient.status === "Pending Diagnosis" ? '#FFF3E0' : 
                                            '#E3F2FD',
                                        color: 
                                            patient.status === "Diagnosis Confirmed" ? '#388E3C' : 
                                            patient.status === "Pending Diagnosis" ? '#E65100' : 
                                            '#0D47A1'
                                    }
                                )
                            }, patient.status)
                        ]),
                        
                        // Patient details
                        React.createElement("div", {
                            key: `patient-details-${patient.id}`,
                            style: styles.patientDetails
                        }, [
                            // Display patient demographics
                            React.createElement("div", { 
                                key: `patient-demographics-${patient.id}`, 
                                style: { display: 'flex', alignItems: 'center', marginBottom: '8px' } 
                            }, [
                                React.createElement("span", { 
                                    key: `patient-age-${patient.id}`,
                                    style: { 
                                        backgroundColor: '#E3F2FD', 
                                        color: '#1976D2',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        marginRight: '8px'
                                    }
                                }, patient.age ? `${patient.age} yrs` : 'Age: N/A'),
                                
                                React.createElement("span", { 
                                    key: `patient-gender-${patient.id}`,
                                    style: { 
                                        backgroundColor: '#F3E5F5', 
                                        color: '#9C27B0',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }
                                }, patient.gender || patient.sex || 'Sex: N/A')
                            ]),
                            
                            // Symptoms preview
                            React.createElement("p", { 
                                key: `patient-symptoms-${patient.id}`, 
                                style: { margin: '5px 0', fontSize: '14px', color: styles.colors.lightText } 
                            }, [
                                React.createElement("strong", { key: `symptoms-label-${patient.id}`, style: { color: styles.colors.darkText } }, "Symptoms: "),
                                patient.symptoms ? 
                                    patient.symptoms.substring(0, 50) + (patient.symptoms.length > 50 ? '...' : '') : 
                                    React.createElement("span", { key: `no-symptoms-${patient.id}`, style: { fontStyle: 'italic' } }, "Not recorded")
                            ])
                        ]),

                        // Action buttons
                        React.createElement("div", {
                            key: `patient-actions-${patient.id}`,
                            style: styles.actionButtons
                        }, [
                            // Primary action - Enter symptoms
                            React.createElement("button", {
                                key: `enterSymptoms-${patient.id}`,
                                onClick: () => handleEnterSymptoms(patient.id),
                                style: styles.primaryButton
                            }, "Enter Symptoms"),
                            
                            // Generate diagnosis
                            React.createElement("button", {
                                key: `generateDiagnosis-${patient.id}`,
                                onClick: () => handleGenerateDiagnosis(patient.id),
                                disabled: !patient.symptoms,
                                style: patient.symptoms ? styles.successButton : styles.disabledButton
                            }, "Generate Diagnosis"),
                            
                            // Secondary action - View diagnosis
                            React.createElement("button", {
                                key: `viewDiagnosis-${patient.id}`,
                                onClick: () => handleViewDiagnoses(patient.id),
                                disabled: !patient.diagnosis,
                                style: patient.diagnosis ? styles.secondaryButton : styles.disabledButton
                            }, "View Diagnosis"),
                            
                            // Symptom input form when patient is selected
                            selectedPatientID === patient.id
                            ? React.createElement("div", {
                                key: `symptomForm-${patient.id}`,
                                style: {
                                    marginTop: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    padding: '15px',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                    border: '1px solid #E0E0E0'
                                }
                            }, [
                                React.createElement("input", {
                                    key: `symptomInput-${patient.id}`,
                                    type: "text",
                                    placeholder: "Enter symptoms manually...",
                                    value: symptomsInput,
                                    onChange: (e) => setSymptomsInput(e.target.value),
                                    style: styles.inputField
                                }),
                                React.createElement("button", {
                                    key: `submitSymptoms-${patient.id}`,
                                    onClick: () => handleSubmitSymptoms(patient.id),
                                    style: styles.successButton
                                }, "Submit Symptoms")
                            ])
                            : null
                        ])
                    ])
                )
        ),

        handleLogout && React.createElement("button", {
            key: "logout",
            onClick: handleLogout,
            style: Object.assign({}, styles.dangerButton, { marginTop: '30px' })
        }, "Sign Out")

    ]); 
}

export default NurseDashboard;