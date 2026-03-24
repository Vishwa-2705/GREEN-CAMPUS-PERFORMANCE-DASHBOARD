import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/apiService";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }

      const returnedRole = result.data.user.role || "user";
      // Compare selected role to returned role
      if (returnedRole.toLowerCase() !== role.toLowerCase()) {
        setError("Selected role does not match account role.");
        setLoading(false);
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        email: result.data.user.email,
        role: returnedRole
      }));

      // Navigate according to role
      if (returnedRole === "admin") {
        navigate("/admin/overall");
      } else {
        navigate("/user/overall");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="leaf leaf-left"></div>
      <div className="leaf leaf-right"></div>

      <div className="login-card">
        <div className="login-left">
          <h1>GREEN CAMPUS</h1>
          <p>Sustainable Green Campus Performance<br />Dashboard</p>
        </div>

        <div className="login-right">
          <h2>Welcome Back!</h2>
          <span className="subtitle">Please login to your account</span>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Admin</option>
              <option>User</option>
            </select>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
