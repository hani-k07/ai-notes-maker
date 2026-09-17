export const API_URL = "http://localhost:8080";

export const api = {
  /**
   * Checks the health status of the backend and AI engines.
   * @returns {Promise<Object>} Health status object.
   */
  async getHealth() {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  /**
   * Fetches the list of available models from Ollama.
   * @returns {Promise<Object>} List of models.
   */
  async getModels() {
    const res = await fetch(`${API_URL}/models`);
    if (!res.ok) throw new Error("Failed to fetch models");
    return res.json();
  },

  /**
   * Retrieves all saved notes from the database.
   * @returns {Promise<Array>} Array of note objects.
   */
  async getNotes() {
    const res = await fetch(`${API_URL}/notes`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
  },

  /**
   * Saves a new note or updates an existing one.
   * @param {Object} note - The note object to save.
   * @returns {Promise<Object>} The saved note.
   */
  async saveNote(note) {
    const method = note.id ? 'PUT' : 'POST';
    const res = await fetch(`${API_URL}/notes`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to save note");
    return res.json();
  },

  /**
   * Deletes a note by its ID.
   * @param {number} id - Note ID.
   * @returns {Promise<number>} The response status.
   */
  async deleteNote(id) {
    const res = await fetch(`${API_URL}/notes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete note");
    return res.status;
  },

  /**
   * Requests AI enhancement for a piece of text.
   * @param {string} text - Text to enhance.
   * @param {string} mode - Enhancement mode (e.g., 'summarize', 'bullet').
   * @param {string} model - Model identifier.
   * @param {boolean} stream - Whether to stream the response.
   * @returns {Promise<ReadableStream|Object>}
   */
  async enhance(text, mode = 'enhance', model = 'qwen2.5', stream = false) {
    const res = await fetch(`${API_URL}/enhance`, {
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

  /**
   * Transcribes audio blob to text using whisper.cpp.
   * @param {Blob} audioBlob - Audio data.
   * @returns {Promise<Object>} Transcription result.
   */
  async transcribe(audioBlob) {
    const res = await fetch(`${API_URL}/transcribe`, {
      method: 'POST',
      body: audioBlob,
    });
    if (!res.ok) throw new Error("Transcription failed");
    return res.json();
  }
};
