#include <iostream>
#include <fstream>
#include <iomanip>
#include <sstream>
#include <string>
#include <vector>
#include <limits>
#include <algorithm>

std::vector<std::string> split(const std::string &s, char delimiter)
{
    std::vector<std::string> tokens;
    std::istringstream tokenStream(s);
    std::string token;
    while (std::getline(tokenStream, token, delimiter))
    {
        tokens.push_back(token);
    }
    return tokens;
}

bool canConvertToFloat(const std::string& str)
{
    if (str.empty() || str == "< LOD")
    {
        return false;
    }

    char* end;
    std::strtof(str.c_str(), &end);
    return end != str.c_str() && *end == '\0';
}

int main()
{
    std::ifstream file("../data/merged_data.csv");
    std::ofstream outputFile("../data/normalized_data.csv");

    if (!file.is_open())
    {
        std::cerr << "Error opening file" << std::endl;
        return 1;
    }

    std::string line;
    std::getline(file, line); 
    outputFile << line << std::endl;

    std::vector<float> minValues(11, std::numeric_limits<float>::max());
    std::vector<float> maxValues(11, std::numeric_limits<float>::lowest());
    std::vector<std::vector<std::string>> rawData;

    while (std::getline(file, line))
    {
        std::vector<std::string> tokens = split(line, ',');
        std::vector<std::string> rowData(tokens.size());
        for (size_t i = 0; i < tokens.size(); i++)
        {
            rowData[i] = tokens[i];
            if (i >= 2 && i <= 10 && canConvertToFloat(tokens[i]))
            {
                float value = std::stof(tokens[i]);
                minValues[i] = std::min(minValues[i], value);
                maxValues[i] = std::max(maxValues[i], value);
            }
        }
        rawData.push_back(rowData);
    }

    for (const auto& row : rawData)
    {
        for (size_t i = 0; i < row.size(); i++)
        {
            if (i > 0) outputFile << ",";
            if (i >= 2 && i <= 10)
            {
                if (canConvertToFloat(row[i]))
                {
                    float value = std::stof(row[i]);
                    if (maxValues[i] != minValues[i])
                    {
                        value = (value - minValues[i]) / (maxValues[i] - minValues[i]);
                        outputFile << std::fixed << std::setprecision(5) << value;
                    }
                    else
                    {
                        outputFile << "NA";
                    }
                }
                else
                {
                    outputFile << "NA";
                }
            }
            else
            {
                outputFile << row[i];
            }
        }
        outputFile << std::endl;
    }

    file.close();
    outputFile.close();

    std::cout << "Data normalization complete." << std::endl;
    return 0;
}
