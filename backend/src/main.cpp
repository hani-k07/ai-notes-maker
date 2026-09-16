#include <iostream>
#include <string>
#include <chrono>
#include <iomanip>
#include <fstream>
#include <sstream>
#include "httplib.h"
#include "json.hpp"
#include "note_store.hpp"
#include "whisper_client.hpp"

using json = nlohmann::json;

enum class LogLevel { L_DEBUG, L_INFO, L_ERROR };
LogLevel current_log_level = LogLevel::L_INFO;

void log_msg(LogLevel level, const std::string& msg) {
    if (level < current_log_level) return;
    auto now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    std::string label;
    switch(level) {
        case LogLevel::L_DEBUG: label = "[DEBUG]"; break;
        case LogLevel::L_INFO:  label = "[INFO]";  break;
        case LogLevel::L_ERROR: label = "[ERROR]"; break;
    }
    std::cout << std::put_time(std::localtime(&now), "%Y-%m-%d %H:%M:%S ") << label << " " << msg << std::endl;
}

void send_error(httplib::Response& res, int status, const std::string& message) {
    res.status = status;
    json err = {{"error", message}, {"status", status}};
    res.set_content(err.dump(), "application/json");
    log_msg(LogLevel::L_ERROR, "Response Error " + std::to_string(status) + ": " + message);
}

int main() {
    httplib::Server svr;
    NoteStore store("ai_notes.db");
    WhisperClient whisper;

    auto setup_cors = [](httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
    };

    auto options_handler = [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        res.status = 200;
    };
    svr.Options("/enhance", options_handler);
    svr.Options("/health", options_handler);
    svr.Options("/notes", options_handler);
    svr.Options("/models", options_handler);
    svr.Options("/transcribe", options_handler);
    svr.Options("/flashcards", options_handler);

    // --- Health Check ---
    svr.Get("/health", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        httplib::Client cli("localhost", 11434);
        auto ollama_res = cli.Get("/api/tags");
        json health_status;
        if (ollama_res && ollama_res->status == 200) {
            health_status["ollama"] = "connected";
            health_status["status"] = "healthy";
            json tags = json::parse(ollama_res->body);
            bool model_found = false;
            for (auto& model : tags["models"]) {
                if (model["name"].get<std::string>().find("qwen2.5") != std::string::npos) {
                    model_found = true;
                    break;
                }
            }
            health_status["model_ready"] = model_found;
            if (!model_found) health_status["status"] = "degraded";
        } else {
            health_status["ollama"] = "disconnected";
            health_status["status"] = "unhealthy";
            health_status["model_ready"] = false;
        }
        health_status["whisper"] = whisper.is_available() ? "connected" : "disconnected";
        if (health_status["whisper"] == "disconnected") health_status["status"] = "degraded";
        res.set_content(health_status.dump(), "application/json");
    });

    // --- Transcription Endpoint ---
    svr.Post("/transcribe", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        try {
            if (req.body.empty()) { send_error(res, 400, "Empty audio body"); return; }

            std::string temp_file = "temp_audio.wav";
            std::ofstream ofs(temp_file, std::ios::binary);
            ofs.write(req.body.data(), req.body.size());
            ofs.close();

            if (!whisper.is_available()) {
                send_error(res, 503, "Whisper engine not installed. See README.");
                return;
            }

            std::string transcript = whisper.transcribe(temp_file);
            json resp = {{"transcript", transcript}, {"status", "success"}};
            res.set_content(resp.dump(), "application/json");
            log_msg(LogLevel::L_INFO, "Transcription completed");
        } catch (const std::exception& e) {
            send_error(res, 500, std::string("Transcription failed: ") + e.what());
        }
    });

    // --- Model Listing ---
    svr.Get("/models", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        httplib::Client cli("localhost", 11434);
        auto ollama_res = cli.Get("/api/tags");
        if (ollama_res && ollama_res->status == 200) {
            res.set_content(ollama_res->body, "application/json");
        } else {
            send_error(res, 502, "Could not fetch models from Ollama");
        }
    });

    // --- Notes Persistence API ---
    svr.Get("/notes", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        res.set_content(store.get_all_notes().dump(), "application/json");
    });

    svr.Get(R"(/notes/export/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        int id = std::stoi(req.matches[1]);
        try {
            json notes = store.get_all_notes();
            json target = nullptr;
            for(auto& n : notes) {
                if(n["id"] == id) {
                    target = n;
                    break;
                }
            }
            if (target == nullptr) {
                send_error(res, 404, "Note not found");
                return;
            }
            std::string md_content = "# " + target.value("title", "Untitled") + "\n\n";
            md_content += "**Subject:** " + target.value("subject", "General") + "\n";
            md_content += "**Date:** " + target.value("created_at", "") + "\n\n";
            md_content += "--- \n\n";
            md_content += target.value("content", "");
            res.set_content(md_content, "text/markdown");
            res.set_header("Content-Disposition", "attachment; filename=\"note_" + std::to_string(id) + ".md\"");
        } catch (...) {
            send_error(res, 500, "Export failed");
        }
    });

    svr.Post("/notes", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        try {
            json data = json::parse(req.body);
            int id = store.save_note(data);
            json resp = {{"id", id}, {"status", "created"}};
            res.set_content(resp.dump(), "application/json");
        } catch (...) { send_error(res, 400, "Invalid note data"); }
    });

    svr.Put("/notes", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        try {
            json data = json::parse(req.body);
            if (!data.contains("id")) { send_error(res, 400, "Missing note id"); return; }
            int id = store.save_note(data);
            json resp = {{"id", id}, {"status", "updated"}};
            res.set_content(resp.dump(), "application/json");
        } catch (...) { send_error(res, 400, "Invalid note data"); }
    });

    svr.Delete("/notes", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        try {
            json data = json::parse(req.body);
            if (!data.contains("id")) { send_error(res, 400, "Missing note id"); return; }
            if (store.delete_note(data["id"])) {
                res.status = 204;
            } else {
                send_error(res, 404, "Note not found");
            }
        } catch (...) { send_error(res, 400, "Invalid request"); }
    });

    // --- Flashcard API ---
    svr.Get(R"(/flashcards/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        int note_id = std::stoi(req.matches[1]);
        res.set_content(store.get_flashcards(note_id).dump(), "application/json");
    });

    svr.Post("/flashcards/generate", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        try {
            json data = json::parse(req.body);
            int note_id = data.value("id", -1);
            std::string content = data.value("content", "");
            if (note_id == -1 || content.empty()) {
                send_error(res, 400, "Missing note id or content");
                return;
            }
            httplib::Client cli("localhost", 11434);
            json payload;
            payload["model"] = "qwen2.5";
            payload["prompt"] = "Generate 5 study flashcards from the following text. Format each card as: Q: [Question] | A: [Answer]. One card per line.\n\nText:\n" + content;
            payload["stream"] = false;
            auto ollama_res = cli.Post("/api/generate", payload.dump(), "application/json");
            if (ollama_res && ollama_res->status == 200) {
                json ollama_json = json::parse(ollama_res->body);
                std::string response = ollama_json.value("response", "");
                std::stringstream ss(response);
                std::string line;
                int count = 0;
                while (std::getline(ss, line)) {
                    size_t pos = line.find(" | ");
                    if (pos != std::string::npos) {
                        std::string q = line.substr(0, pos);
                        std::string a = line.substr(pos + 3);
                        store.add_flashcard(note_id, q, a);
                        count++;
                    }
                }
                res.set_content(json({{"status", "success"}, {"cards_created", count}}).dump(), "application/json");
            } else {
                send_error(res, 502, "Ollama failed to generate cards");
            }
        } catch (...) { send_error(res, 500, "Generation failed"); }
    });

    svr.Post("/flashcards/review", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        try {
            json data = json::parse(req.body);
            int card_id = data.value("id", -1);
            int quality = data.value("quality", 3);
            if (card_id == -1) { send_error(res, 400, "Missing card id"); return; }
            store.update_card_review(card_id, quality);
            res.status = 200;
        } catch (...) { send_error(res, 400, "Invalid review data"); }
    });

    // --- AI Enhance ---
    svr.Post("/enhance", [&](const httplib::Request& req, httplib::Response& res) {
        setup_cors(res);
        auto start_time = std::chrono::steady_clock::now();
        try {
            if (req.body.empty()) { send_error(res, 400, "Empty request body"); return; }
            if (req.body.size() > 100000) { send_error(res, 413, "Payload too large"); return; }
            json incoming_data = json::parse(req.body);
            std::string user_text = incoming_data.value("text", "");
            std::string mode = incoming_data.value("mode", "enhance");
            std::string model = incoming_data.value("model", "qwen2.5");
            bool stream = incoming_data.value("stream", false);
            if (user_text.empty()) { send_error(res, 400, "No text provided"); return; }
            std::string system_prompt;
            if (mode == "bullet") system_prompt = "Convert these notes into a structured, easy-to-read bulleted list. Use bolding for key terms.";
            else if (mode == "summarize") system_prompt = "Summarize these notes into one powerful, high-level paragraph for quick review.";
            else if (mode == "quiz") system_prompt = "Act as a teacher. Create 3 multiple-choice questions based on these notes to test the student.";
            else if (mode == "simplify") system_prompt = "Explain these notes like I am 5 years old. Use very simple language and analogies.";
            else system_prompt = "Professionaly rewrite and enhance these notes. Use clear headings and academic Markdown formatting.";
            httplib::Client cli("localhost", 11434);
            cli.set_read_timeout(120, 0);
            json ollama_payload;
            ollama_payload["model"] = model;
            ollama_payload["prompt"] = system_prompt + "\n\nStudent Notes:\n" + user_text;
            ollama_payload["stream"] = stream;

            if (stream) {
                res.set_content_provider(
                    "application/x-ndjson",
                    [&](auto& chunk) {
                        auto ollama_res = cli.Post("/api/generate", ollama_payload.dump(), "application/json",
                            [&](const char* data, size_t data_len) {
                                chunk.write(data, data_len);
                                return true;
                            }
                        );
                        return true;
                    },
                    -1
                );
            } else {
                auto ollama_res = cli.Post("/api/generate", ollama_payload.dump(), "application/json");
                if (ollama_res && ollama_res->status == 200) {
                    json ollama_json = json::parse(ollama_res->body);
                    json response_data;
                    response_data["enhanced"] = ollama_json.value("response", "");
                    res.set_content(response_data.dump(), "application/json");
                    auto end_time = std::chrono::steady_clock::now();
                    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time).count();
                    log_msg(LogLevel::L_INFO, "Enhance request processed in " + std::to_string(elapsed) + "ms");
                } else {
                    send_error(res, 502, "Ollama connection lost or failed");
                }
            }
        } catch (const json::parse_error& e) { send_error(res, 400, "Invalid JSON payload"); }
        catch (const std::exception& e) { send_error(res, 500, std::string("Internal Server Error: ") + e.what()); }
    });

    std::cout << ">>> AI Study Backend Running on http://127.0.0.1:8080 <<<" << std::endl;
    svr.listen("127.0.0.1", 8080);
    return 0;
}
