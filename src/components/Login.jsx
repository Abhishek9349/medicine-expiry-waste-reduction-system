import { useState } from "react";
import axios from "axios";

function Login({ setIsLoggedIn }) {

  // Email state
  const [email, setEmail] = useState("");

  // Password state
  const [password, setPassword] = useState("");

  // Show / Hide password
  const [showPassword, setShowPassword] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Login function
  const handleLogin = async (e) => {

    // Page refresh ko stop karta hai
    e.preventDefault();

    // Previous error remove
    setError("");

    // Loading start
    setLoading(true);

    try {

      // Spring Boot backend login API
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email,
          password: password
        }
      );

      // Backend se response
      const data = response.data;

      // Login successful
      if (data.success) {

        // JWT token browser mein save
        localStorage.setItem("token", data.token);

        // User information save
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRole", data.role);

        // Error remove
        setError("");

        // Parent App ko login successful batao
        setIsLoggedIn(true);

      } else {

        setError(
          data.message || "Invalid email or password"
        );

      }

    } catch (err) {

      console.error("Login Error:", err);

      // Backend response ka error
      if (err.response) {

        setError(
          err.response.data?.message ||
          "Invalid email or password"
        );

      } else {

        // Backend/server down
        setError(
          "Cannot connect to server. Please make sure Spring Boot is running."
        );

      }

    } finally {

      // Loading stop
      setLoading(false);

    }
  };

  return (
    <div className="login-page">

      {/* =========================
          LEFT SIDE
      ========================== */}

      <div className="login-left">

        <h1>MedWaste AI</h1>

        <p className="tagline">
          Smart Medicine Management
        </p>

        <h2>
          Reduce Medicine Expiry Waste
        </h2>

        <p>
          Manage medicine inventory, track expiry dates,
          reduce waste and use AI-based predictions.
        </p>

        <div className="features">

          <div>
            📦 Smart Inventory
          </div>

          <div>
            🔔 Expiry Alerts
          </div>

          <div>
            🤖 AI Prediction
          </div>

        </div>

      </div>


      {/* =========================
          RIGHT SIDE
      ========================== */}

      <div className="login-right">

        <div className="login-box">

          <h2>
            Welcome Back
          </h2>

          <p>
            Login to your medicine management system
          </p>


          {/* =========================
              LOGIN FORM
          ========================== */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />


            {/* PASSWORD */}

            <label>
              Password
            </label>

            <div className="password-box">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            {/* ERROR MESSAGE */}

            {error && (
              <p className="error">
                {error}
              </p>
            )}


            {/* OPTIONS */}

            <div className="login-options">

              <label>

                <input
                  type="checkbox"
                />

                Remember me

              </label>


              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset feature will be available soon."
                  )
                }
              >
                Forgot Password?
              </button>

            </div>


            {/* LOGIN BUTTON */}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

          </form>


          {/* SECURITY */}

          <div className="security">

            🔒 Your information is securely protected.

          </div>


          {/* DEMO LOGIN */}

          <div className="demo">

            <strong>
              Demo Login
            </strong>

            <br />

            Email: admin@medicine.com

            <br />

            Password: admin123

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;