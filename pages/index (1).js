
import React, { useState } from "react";

export default function Home() {
  const [audioFile, setAudioFile] = useState(null);
  const [participant, setParticipant] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [supportType, setSupportType] = useState("Social & Domestic Support");
  const [transcript, setTranscript] = useState("");
  const [formattedNote, setFormattedNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const handleRecord = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "recording.webm");
        setAudioFile(file);
        setRecordedChunks(chunks);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } else {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleGenerateNote = async () => {
    if (!audioFile || !participant || !startTime || !endTime) {
      alert("Please complete all fields and record or upload audio.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("participant", participant);
    formData.append("start", startTime);
    formData.append("end", endTime);
    formData.append("support", supportType);

    const res = await fetch("https://ezinotes-backend.up.railway.app/process", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setTranscript(data.transcript);
    setFormattedNote(data.formatted_note);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>EziNotes - Voice Note to NDIS Session Report</h1>

      <div style={{ marginBottom: 10 }}>
        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
        <button onClick={handleRecord} style={{ marginLeft: 10 }}>
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Participant (e.g., John S)"
        value={participant}
        onChange={(e) => setParticipant(e.target.value)}
        style={{ marginRight: 5 }}
      />
      <input
        type="text"
        placeholder="Start Time (e.g., 9:00 AM)"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        style={{ marginRight: 5 }}
      />
      <input
        type="text"
        placeholder="End Time (e.g., 10:00 AM)"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        style={{ marginRight: 5 }}
      />
      <select value={supportType} onChange={(e) => setSupportType(e.target.value)} style={{ marginRight: 5 }}>
        <option>Social & Domestic Support</option>
        <option>Community Participation</option>
        <option>Transport Support</option>
        <option>Personal Care</option>
      </select>
      <button onClick={handleGenerateNote}>Generate Note</button>

      <h2>Transcript</h2>
      <pre>{transcript}</pre>

      <h2>Formatted Note</h2>
      <pre>{formattedNote}</pre>
    </div>
  );
}
