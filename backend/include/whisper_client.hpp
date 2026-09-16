#ifndef WHISPER_CLIENT_HPP
#define WHISPER_CLIENT_HPP

#include <string>
#include <vector>
#include <fstream>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <array>

#ifdef _WIN32
#define POPEN _popen
#define PCLOSE _pclose
#else
#define POPEN popen
#define PCLOSE pclose
#endif

class WhisperClient {
    std::string model_path;
    std::string bin_path;

public:
    WhisperClient(const std::string& bin = "whisper", const std::string& model = "models/ggml-base.en.bin")
        : bin_path(bin), model_path(model) {}

    bool is_available() {
        std::ifstream f(bin_path);
        return f.good();
    }

    std::string transcribe(const std::string& audio_file_path) {
        std::string command = bin_path + " -m " + model_path + " -f " + audio_file_path + " 2>/dev/null";

        std::array<char, 128> buffer;
        std::string result;

        FILE* pipe = POPEN(command.c_str(), "r");
        if (!pipe) {
            throw std::runtime_error("popen() failed!");
        }

        while (fgets(buffer.data(), buffer.size(), pipe) != nullptr) {
            result += buffer.data();
        }
        PCLOSE(pipe);

        return result;
    }
};

#endif
