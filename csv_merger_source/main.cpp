#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <algorithm>
#include <string>


std::vector<std::string> split(const std::string &s, char delimiter)
{
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(s);
    while (std::getline(tokenStream, token, delimiter))
    {
        tokens.push_back(token);
    }
    return tokens;
}

std::vector<std::string> findCommonColumns(const std::vector<std::string>& header1, const std::vector<std::string>& header2)
{
    std::vector<std::string> common;
    for (auto &col : header1)
    {
        if (std::find(header2.begin(), header2.end(), col) != header2.end())
        {
            common.push_back(col);
        }
    }
    return common;
}

int main()
{
    std::ifstream file1("../data/raw_data/2015-soil.csv");
    std::ifstream file2("../data/raw_data/2018-soil.csv");
    std::ifstream file3("../data/raw_data/2009-soil.csv");
    std::ofstream outputFile("../data/merged_data.csv");

    std::string line, cell;
    std::vector<std::string> header1, header2, header3;

    std::getline(file1, line);
    header1 = split(line, ',');
    std::getline(file2, line);
    header2 = split(line, ',');
    std::getline(file3, line);
    header3 = split(line, ',');

    auto commonColumns = findCommonColumns(header1, header2);
    commonColumns = findCommonColumns(commonColumns, header3);

    outputFile << "Year";
    for (const auto& col : commonColumns)
    {
        outputFile << "," << col;
    }
    outputFile << std::endl;

    while (std::getline(file3, line))
    {
        std::vector<std::string> row = split(line, ',');
        outputFile << "2009";
        for (const auto& col : commonColumns)
        {
            auto it = std::find(header3.begin(), header3.end(), col);
            int index = std::distance(header3.begin(), it);
            outputFile << "," << row[index];
        }
        outputFile << std::endl;
    }

    while (std::getline(file1, line))
    {
        std::vector<std::string> row = split(line, ',');
        outputFile << "2015";
        for (const auto& col : commonColumns)
        {
            auto it = std::find(header1.begin(), header1.end(), col);
            int index = std::distance(header1.begin(), it);
            outputFile << "," << row[index];
        }
        outputFile << std::endl;
    }

    while (std::getline(file2, line))
    {
        std::vector<std::string> row = split(line, ',');
        outputFile << "2018";
        for (const auto& col : commonColumns)
        {
            auto it = std::find(header2.begin(), header2.end(), col);
            int index = std::distance(header2.begin(), it);
            outputFile << "," << row[index];
        }
        outputFile << std::endl;
    }


    file1.close();
    file2.close();
    file3.close();
    outputFile.close();

    std::cout << "CSV files have been merged successfully." << std::endl;

    return 0;
}
