#ifndef NOTE_STORE_HPP
#define NOTE_STORE_HPP

#include <string>
#include <vector>
#include <sqlite3.h>
#include "json.hpp"

using json = nlohmann::json;

struct Note {
    int id;
    std::string title;
    std::string content;
    std::string subject;
    std::string created_at;
    std::string updated_at;
};

class NoteStore {
    sqlite3* db;

public:
    NoteStore(const std::string& db_path) {
        if (sqlite3_open(db_path.c_str(), &db) != SQLITE_OK) {
            throw std::runtime_error("Failed to open database");
        }
        initialize();
    }

    ~NoteStore() {
        sqlite3_close(db);
    }

    void initialize() {
        const char* sql =
            "CREATE TABLE IF NOT EXISTS notes ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "title TEXT NOT NULL, "
            "content TEXT, "
            "subject TEXT, "
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
            "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"
            ");"
            "CREATE TABLE IF NOT EXISTS note_versions ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "note_id INTEGER, "
            "content TEXT, "
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
            "FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE"
            ");"
            "CREATE TABLE IF NOT EXISTS flashcards ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "note_id INTEGER, "
            "question TEXT, "
            "answer TEXT, "
            "next_review DATETIME DEFAULT CURRENT_TIMESTAMP, "
            "interval INTEGER DEFAULT 1, "
            "ease FACTOR DEFAULT 2.5, "
            "FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE"
            ");";

        char* errMsg = 0;
        if (sqlite3_exec(db, sql, 0, 0, &errMsg) != SQLITE_OK) {
            std::string err = errMsg;
            sqlite3_free(errMsg);
            throw std::runtime_error("SQL error: " + err);
        }
    }


    json get_all_notes() {
        std::vector<Note> notes;
        const char* sql = "SELECT id, title, content, subject, created_at, updated_at FROM notes ORDER BY updated_at DESC";
        sqlite3_stmt* stmt;

        if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                notes.push_back({
                    sqlite3_column_int(stmt, 0),
                    (const char*)sqlite3_column_text(stmt, 1),
                    (const char*)sqlite3_column_text(stmt, 2),
                    (const char*)sqlite3_column_text(stmt, 3),
                    (const char*)sqlite3_column_text(stmt, 4),
                    (const char*)sqlite3_column_text(stmt, 5)
                });
            }
        }
        sqlite3_finalize(stmt);

        json j = json::array();
        for (const auto& n : notes) {
            j.push_back({
                {"id", n.id}, {"title", n.title}, {"content", n.content},
                {"subject", n.subject}, {"created_at", n.created_at}, {"updated_at", n.updated_at}
            });
        }
        return j;
    }

    int save_note(const json& data) {
        int id = data.value("id", -1);
        std::string title = data.value("title", "Untitled");
        std::string content = data.value("content", "");
        std::string subject = data.value("subject", "General");

        if (id == -1) {
            // Create
            const char* sql = "INSERT INTO notes (title, content, subject) VALUES (?, ?, ?)";
            sqlite3_stmt* stmt;
            if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
                sqlite3_bind_text(stmt, 1, title.c_str(), -1, SQLITE_STATIC);
                sqlite3_bind_text(stmt, 2, content.c_str(), -1, SQLITE_STATIC);
                sqlite3_bind_text(stmt, 3, subject.c_str(), -1, SQLITE_STATIC);
                if (sqlite3_step(stmt) == SQLITE_DONE) {
                    id = (int)sqlite3_last_insert_rowid(db);
                }
                sqlite3_finalize(stmt);
            }
        } else {
            // Update & Versioning
            // First, save current version to note_versions before updating
            const char* v_sql = "INSERT INTO note_versions (note_id, content) SELECT id, content FROM notes WHERE id = ?";
            sqlite3_stmt* v_stmt;
            if (sqlite3_prepare_v2(db, v_sql, -1, &v_stmt, 0) == SQLITE_OK) {
                sqlite3_bind_int(v_stmt, 1, id);
                sqlite3_step(v_stmt);
                sqlite3_finalize(v_stmt);
            }

            const char* sql = "UPDATE notes SET title = ?, content = ?, subject = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            sqlite3_stmt* stmt;
            if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
                sqlite3_bind_text(stmt, 1, title.c_str(), -1, SQLITE_STATIC);
                sqlite3_bind_text(stmt, 2, content.c_str(), -1, SQLITE_STATIC);
                sqlite3_bind_text(stmt, 3, subject.c_str(), -1, SQLITE_STATIC);
                sqlite3_bind_int(stmt, 4, id);
                sqlite3_step(stmt);
                sqlite3_finalize(stmt);
            }
        }
        return id;
    }

    bool delete_note(int id) {
        const char* sql = "DELETE FROM notes WHERE id = ?";
        sqlite3_stmt* stmt;
        bool success = false;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, id);
            if (sqlite3_step(stmt) == SQLITE_DONE) success = true;
            sqlite3_finalize(stmt);
        }
        return success;
    }

    void add_flashcard(int note_id, const std::string& q, const std::string& a) {
        const char* sql = "INSERT INTO flashcards (note_id, question, answer) VALUES (?, ?, ?)";
        sqlite3_stmt* stmt;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, note_id);
            sqlite3_bind_text(stmt, 2, q.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(stmt, 3, a.c_str(), -1, SQLITE_STATIC);
            sqlite3_step(stmt);
            sqlite3_finalize(stmt);
        }
    }

    json get_flashcards(int note_id) {
        std::vector<json> cards;
        const char* sql = "SELECT id, question, answer, next_review FROM flashcards WHERE note_id = ?";
        sqlite3_stmt* stmt;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, note_id);
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                cards.push_back({
                    {"id", sqlite3_column_int(stmt, 0)},
                    {"question", (const char*)sqlite3_column_text(stmt, 1)},
                    {"answer", (const char*)sqlite3_column_text(stmt, 2)},
                    {"next_review", (const char*)sqlite3_column_text(stmt, 3)}
                });
            }
        }
        sqlite3_finalize(stmt);
        return json(cards);
    }

    void update_card_review(int card_id, int quality) {
        // Simple SM-2 like update
        // quality: 0-5 (0=forgot, 5=perfect)
        // In a real app, we'd calculate next_review date here
        const char* sql = "UPDATE flashcards SET next_review = datetime('now', '+' || ? || ' days') WHERE id = ?";
        sqlite3_stmt* stmt;
        int interval = (quality < 3) ? 1 : (quality < 5 ? 3 : 7);
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, interval);
            sqlite3_bind_int(stmt, 2, card_id);
            sqlite3_step(stmt);
            sqlite3_finalize(stmt);
        }
    }
};

#endif
