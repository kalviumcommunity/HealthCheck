import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
 // ZERO-SHOT PROMPT DESIGN
  // Zero-shot prompting means we give the AI NO prior examples — only clear, explicit instructions.
  // The model must generate the output from scratch, based purely on our description of the task.
function App() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
  setLoading(true);
  setResult(null);
  // This ensures correctness (strict instructions), efficiency (short prompt, no extra data),
  // and scalability (lightweight and repeatable for multiple requests).
  const prompt = `
You are HealthCheck, a safe, helpful chatbot for medical symptom checks only.

Rules:
1. You ONLY answer about symptoms, possible causes, severity, remedies, and doctor recommendations.
2. If the user's input is unrelated to a medical symptom check, respond with this exact JSON:
{
  "error": "I can only help with health symptom checks."
}
3. You are not a medical professional. Never give a definitive diagnosis.
4. Always output valid JSON without markdown or code fences.

JSON format for valid medical checks:
{
  "possible_causes": ["string", "string", ...],
  "severity_level": "mild | moderate | severe",
  "suggested_remedies": ["string", "string", ...],
  "doctor_visit_recommendation": "yes | no"
}

User symptoms: "${symptoms}"
`;


  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    let text = response.response.text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonData = JSON.parse(text);
    setResult(jsonData);
  } catch (err) {
    console.error(err);
    setResult({ error: "Error occurred" });
  }
  setLoading(false);
};


  return (
    <div style={{display: "flex", flexDirection: "column", alignItems:"center",padding: "20px", fontFamily: "sans-serif" }}>
      <h1>HealthCheck AI</h1>
      <textarea
        rows="3"
        placeholder="Enter your symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />
      <button onClick={checkHealth} disabled={loading} style={{ marginTop: "10px" }}>
        {loading ? "Checking..." : "Check Health"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop: "20px" }}>
          <h2>Possible Causes</h2>
          <ul>
            {result.possible_causes.map((cause, i) => (
              <li key={i}>{cause}</li>
            ))}
          </ul>

          <h2>Severity Level</h2>
          <p>{result.severity_level}</p>

          <h2>Suggested Remedies</h2>
          <ul>
            {result.suggested_remedies.map((remedy, i) => (
              <li key={i}>{remedy}</li>
            ))}
          </ul>

          <h2>Doctor Visit Recommended?</h2>
          <p>{result.doctor_visit_recommendation === "yes" ? "Yes" : "No"}</p>
        </div>
      )}

      {result && result.error && <p style={{ color: "red" }}>{result.error}</p>}
    </div>
  );
}

export default App;
