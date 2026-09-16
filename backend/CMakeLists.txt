cmake_minimum_required(VERSION 3.10)
project(AINotesBackend CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Find SQLite3
find_package(SQLite3 REQUIRED)

# Main server
add_executable(ai_notes_server src/main.cpp)
target_include_directories(ai_notes_server PRIVATE include)
target_link_libraries(ai_notes_server PRIVATE SQLite::SQLite3)

# Tests
add_executable(backend_tests tests/test_main.cpp)
target_include_directories(backend_tests PRIVATE include)
target_link_libraries(backend_tests PRIVATE SQLite::SQLite3)
