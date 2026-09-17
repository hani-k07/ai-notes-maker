cmake_minimum_required(VERSION 3.10)
project(AINotesBackend CXX C)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

find_package(Threads REQUIRED)

# Main server
add_executable(ai_notes_server src/main.cpp src/sqlite3.c)
set_source_files_properties(src/sqlite3.c PROPERTIES LANGUAGE C)
target_include_directories(ai_notes_server PRIVATE include)
target_link_libraries(ai_notes_server PRIVATE Threads::Threads)

if(MSVC)
  target_compile_options(ai_notes_server PRIVATE /O2)
else()
  target_compile_options(ai_notes_server PRIVATE -O2)
endif()

# Tests
add_executable(backend_tests tests/test_main.cpp src/sqlite3.c)
set_source_files_properties(src/sqlite3.c PROPERTIES LANGUAGE C)
target_include_directories(backend_tests PRIVATE include)
target_link_libraries(backend_tests PRIVATE Threads::Threads)
