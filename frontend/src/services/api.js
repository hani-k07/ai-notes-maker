const API_BASE_URL = "http://localhost:8080";

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  async getModels() {
    const res = await fetch(`${API_BASE_URL}/models`);
    if (!res.ok) throw new Error("Failed to fetch models");
    return res.json();
  },

  async getNotes() {
    const res = await fetch(`${API_BASE_URL}/notes`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
  },

  async saveNote(note) {
    const method = note.id ? 'PUT' : 'POST';
    const res = await fetch(`${API_BASE_URL}/notes`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to save note");
    return res.json();
  },

  async deleteNote(id) {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete note");
    return res.status;
  },

  async enhance(text, mode = 'enhance', model = 'qwen2.5', stream = false) {
    const res = await fetch(`${API_BASE_URL}/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode, model, stream }),
    });
    if (!res.ok) throw new Error("Enhancement failed");

    if (stream) {
      return res.body; // Return the ReadableStream
    }

    return res.json();
  },

  async transcribe(audioBlob) {
    const res = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: audioBlob,
    });
    if (!res.ok) throw new Error("Transcription failed");
    return res.json();
  }
};
