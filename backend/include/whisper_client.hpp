#ifndef WHISPER_CLIENT_HPP
#define WHISPER_CLIENT_HPP

#include <string>
#include <vector>
#include <fstream>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <array>

class WhisperClient {
    std::string model_path;
    std::string bin_path;

public:
    WhisperClient(const std::string& bin = "whisper", const std::string& model = "models/ggml-base.en.bin")
        : bin_path(bin), model_path(model) {}

    bool is_available() {
        // Simple check: does the binary exist?
        // In a real scenario, we'd check if it runs with --help
        std::ifstream f(bin_path);
        return f.good();
    }

    std::string transcribe(const std::string& audio_file_path) {
        // We use the whisper.cpp 'main' executable as a subprocess
        // Command: ./main -m <model> -f <file>
        std::string command = bin_path + " -m " + model_path + " -f " + audio_file_path + " 2>/dev/null";

        std::array<char, 128> buffer;
        std::string result;
        std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(command.c_str(), "r"), pclose);

        if (!pipe) {
            throw std::runtime_error("popen() failed!");
        }

        while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
            result += buffer.data();
        }

        return result;
    }
};

#endif
