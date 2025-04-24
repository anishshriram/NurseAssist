// Temporary placeholder -> replace with real API call when backend is finished
const mockUsers = [
    {email: "nurse@example.com", password: "password123", role: "Nurse"},
    {email: "doctor@example.com", password: "password123", role: "Doctor"},
    {email: "admin@example.com", password: "password123", role: "Admin"}
  ];
  
  // Simulates backend login API
  export function loginUser(email, password) {
    // Temporary placeholder -> replace with a fetch() call to POST /auth/login later.
    const user = mockUsers.find(u => u.email === email && u.password === password);
  
    if(user){
      return{message: "Login successful", role: user.role };
    }else{
      return{error: "Invalid email or password"};
    }
  }
  