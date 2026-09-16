#include <iostream>
#include <cassert>
#include "../include/note_store.hpp"

void test_note_creation() {
    std::cout << "Running test_note_creation..." << std::endl;
    NoteStore store("test_notes.db");

    json new_note = {
        {"title", "Test Note"},
        {"content", "Hello World"},
        {"subject", "Testing"}
    };

    int id = store.save_note(new_note);
    assert(id > 0);

    json notes = store.get_all_notes();
    assert(notes.size() == 1);
    assert(notes[0]["title"] == "Test Note");
    std::cout << "PASS" << std::endl;
}

void test_note_update() {
    std::cout << "Running test_note_update..." << std::endl;
    NoteStore store("test_notes.db");

    json note = {{"title", "Initial"}, {"content", "Old content"}, {"subject", "S1"}};
    int id = store.save_note(note);

    json update = {{"id", id}, {"title", "Updated"}, {"content", "New content"}, {"subject", "S1"}};
    store.save_note(update);

    json notes = store.get_all_notes();
    assert(notes[0]["title"] == "Updated");
    assert(notes[0]["content"] == "New content");
    std::cout << "PASS" << std::endl;
}

void test_note_deletion() {
    std::cout << "Running test_note_deletion..." << std::endl;
    NoteStore store("test_notes.db");

    json note = {{"title", "Delete Me"}, {"content", "Bye"}, {"subject", "S2"}};
    int id = store.save_note(note);

    bool deleted = store.delete_note(id);
    assert(deleted == true);

    json notes = store.get_all_notes();
    assert(notes.size() == 0);
    std::cout << "PASS" << std::endl;
}

int main() {
    try {
        test_note_creation();
        test_note_update();
        test_note_deletion();
        std::cout << "\nALL TESTS PASSED SUCCESSFULLY!" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "TEST FAILED: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
