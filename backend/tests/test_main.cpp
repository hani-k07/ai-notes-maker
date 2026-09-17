#include <iostream>
#include <cassert>
#include <thread>
#include <vector>
#include "../include/note_store.hpp"

void test_note_creation() {
    std::cout << "Running test_note_creation..." << std::endl;
    NoteStore store("test_creation.db");

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
    NoteStore store("test_update.db");

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
    NoteStore store("test_deletion.db");

    json note = {{"title", "Delete Me"}, {"content", "Bye"}, {"subject", "S2"}};
    int id = store.save_note(note);

    bool deleted = store.delete_note(id);
    assert(deleted == true);

    json notes = store.get_all_notes();
    std::cout << "Notes size after deletion: " << notes.size() << std::endl;
    assert(notes.size() == 0);
    std::cout << "PASS" << std::endl;
}

void test_concurrent_access() {
    std::cout << "Running test_concurrent_access..." << std::endl;
    NoteStore store("test_concurrent.db");

    std::vector<std::thread> threads;
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&store, i]() {
            json n = {{"title", "Note " + std::to_string(i)}, {"content", "Content"}, {"subject", "S"}};
            store.save_note(n);
        });
    }

    for (auto& t : threads) t.join();

    json notes = store.get_all_notes();
    assert(notes.size() == 10);
    std::cout << "PASS" << std::endl;
}

int main() {
    try {
        test_note_creation();
        test_note_update();
        test_note_deletion();
        test_concurrent_access();
        std::cout << "\nALL TESTS PASSED SUCCESSFULLY!" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "TEST FAILED: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
