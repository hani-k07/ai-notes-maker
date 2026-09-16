cmake_minimum_required(VERSION 3.10)
project(AINotesBackend CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Main server
add_executable(ai_notes_server src/main.cpp src/sqlite3.c)
set_source_files_properties(src/sqlite3.c PROPERTIES LANGUAGE C)
target_include_directories(ai_notes_server PRIVATE include)

# Tests
add_executable(backend_tests tests/test_main.cpp src/sqlite3.c)
set_source_files_properties(src/sqlite3.c PROPERTIES LANGUAGE C)
target_include_directories(backend_tests PRIVATE include)
