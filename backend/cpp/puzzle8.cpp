#include <iostream>
#include <vector>

struct coordinates
{
    size_t row = 0;
    size_t col = 0;

    coordinates(size_t row, size_t col) : row(row), col(col) {}
};

class puzzleMatrix
{
    std::vector<std::vector<int>> matrix;

public: // Access specifier
    puzzleMatrix(size_t sizeOfMatrix = 3)
    { // Constructor
        for (size_t i = 0; i < sizeOfMatrix; i++)
        {
            std::vector<int> row;
            for (size_t j = 1; j <= sizeOfMatrix; j++)
            {
                row.push_back((i * sizeOfMatrix) + j);
            }
            matrix.push_back(row);
        }
        matrix.back().back() = 0;
    }

    coordinates getEmptyCellFromMatrix()
    {
        for (size_t i = 0; i < matrix.size(); i++)
        {
            for (size_t j = 0; j < matrix.size(); j++)
            {
                if (matrix[i][j] == 0)
                {
                    return {i, j};
                }
            }
        }
    }

    std::vector<coordinates> whatCanISwap()
    {
        const auto &&[row, col] = getEmptyCellFromMatrix();
        std::vector<coordinates> ret;
        if (row > 0)
        {
            ret.emplace_back(row - 1, col);
        }
        if (col > 0)
        {
            ret.emplace_back(row, col - 1);
        }
        if (row < matrix.size() - 1)
        {
            ret.emplace_back(row + 1, col);
        }
        if (col < matrix.size() - 1)
        {
            ret.emplace_back(row, col + 1);
        }
        return ret;
    }

    auto operator<=>(const puzzleMatrix &) const = default;

    friend std::ostream &operator<<(std::ostream &os, const puzzleMatrix &m)
    {
        for (auto &i : m.matrix)
        {
            for (auto j : i)
            {
                os << j << ' ';
            }
            os << '\n';
        }
        return os;
    }
};

class puzzle8
{
    puzzleMatrix matrix;
    puzzleMatrix finalMatrix;

public: // Access specifier
    puzzle8(puzzleMatrix puzzleMatrix = puzzleMatrix()) : matrix(puzzleMatrix)
    { // Constructor
        std::cout << "Hello world from Puzzle!\n";
    }
};

int main()
{
    std::cout << "Ahoj svete!\n";
    std::cout << puzzleMatrix();
    // puzzle8 myVeryFirstPuzzleInCpp;
    return 0;
}

// https: //www.w3schools.com/cpp/cpp_constructors.asp