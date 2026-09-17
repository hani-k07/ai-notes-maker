#include <iostream>
#include <cassert>
#include <thread>
#include <vector>
#include "../include/note_store.hpp"

void test_note_creation() {
    std::cout << "Running test_note_creation..." << std::endl;
    std::remove("test_creation_tmp.db");
    NoteStore store("test_creation_tmp.db");

    json new_note = {
        {"title", "Test Note"},
        {"content", "Hello World"},
        {"subject", "Testing"}
    };

    json saved = store.save_note(new_note);
    int id = saved["id"];
    assert(id > 0);

    json notes = store.get_all_notes();
    assert(notes.size() == 1);
    std::cout << "PASS" << std::endl;
}

void test_note_update() {
    std::cout << "Running test_note_update..." << std::endl;
    std::remove("test_update_tmp.db");
    NoteStore store("test_update_tmp.db");

    json note = {{"title", "Initial"}, {"content", "Old content"}, {"subject", "S1"}};
    json saved = store.save_note(note);
    int id = saved["id"];

    json update = {{"id", id}, {"title", "Updated"}, {"content", "New content"}, {"subject", "S1"}};
    store.save_note(update);

    json notes = store.get_all_notes();
    assert(notes[0]["title"] == "Updated");
    assert(notes[0]["content"] == "New content");
    std::cout << "PASS" << std::endl;
}

void test_note_deletion() {
    std::cout << "Running test_note_deletion..." << std::endl;
    std::remove("test_deletion_tmp.db");
    NoteStore store("test_deletion_tmp.db");

    json note = {{"title", "Delete Me"}, {"content", "Bye"}, {"subject", "S2"}};
    json saved = store.save_note(note);
    int id = saved["id"];

    bool deleted = store.delete_note(id);
    assert(deleted == true);

    json notes = store.get_all_notes();
    assert(notes.size() == 0);
    std::cout << "PASS" << std::endl;
}

void test_concurrent_access() {
    std::cout << "Running test_concurrent_access..." << std::endl;
    std::remove("test_concurrent_tmp.db");
    NoteStore store("test_concurrent_tmp.db");

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
