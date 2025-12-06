import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Backend e request pathano
      // Note: Backend expects Form Data for OAuth2
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await API.post("/auth/login", formData);

      // 2. Token save kora
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("username", username); // Username tao rekhe dilam

      // 3. Success message & Redirect
      toast.success("Login Successful!");
      navigate("/dashboard");
      
    } catch (error) {
      toast.error("Invalid Username or Password");
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Secure Vault Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={{marginTop: '10px'}}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

// Simple CSS Styles (Inline for simplicity)
const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5" },
  box: { padding: "30px", background: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", textAlign: "center", width: "300px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }
};

export default Login;