#include <iostream>
#include <vector>
#include <chrono>
#include <set>
#include <queue>
#include <random>

struct coordinates
{
    size_t row = 0;
    size_t col = 0;

    coordinates(size_t row, size_t col) : row(row), col(col) {}

    auto operator<=>(const coordinates &) const = default;
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

    void shuffle()
    {
        for (size_t i = 0; i < 200; i++)
        {
            const auto to_swap_variants = whatCanISwap();
            move(to_swap_variants[std::random_device()() % to_swap_variants.size()]);
        }
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
        return {0, 0};
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

    void move(coordinates destinationOfCell)
    {
        const auto emptyCell = getEmptyCellFromMatrix();
        const auto availableMoves = whatCanISwap();
        const auto it = std::find(availableMoves.begin(), availableMoves.end(), destinationOfCell);
        if (it == availableMoves.end())
        {
            throw std::runtime_error("Invalid move. Move is out of range.");
        }
        std::swap(matrix[emptyCell.row][emptyCell.col], matrix[destinationOfCell.row][destinationOfCell.col]);
    }

    auto operator<=>(const puzzleMatrix &) const = default;

    int operator[](const coordinates &coordinates) const
    {
        return matrix.at(coordinates.row).at(coordinates.col);
    }

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

    struct queue_node
    {
        puzzleMatrix matrix;
        std::vector<int> moves;

        queue_node(puzzleMatrix matrix, std::vector<int> moves) : matrix(matrix), moves(moves)
        {
        }
    };

public: // Access specifier
    puzzle8(puzzleMatrix puzzleMatrix) : matrix(puzzleMatrix)
    {
    }

    std::vector<int> solve()
    {
        if (matrix == puzzleMatrix())
        {
            std::cout << "The puzzle is already solved.\n";
            return {};
        }
        const auto start = std::chrono::steady_clock::now();
        auto solved = false;
        std::set<puzzleMatrix> set;
        set.insert(matrix);
        std::queue<queue_node> queue;
        queue.emplace(matrix, std::vector<int>());
        while (!solved)
        {
            for (coordinates const &move : queue.front().matrix.whatCanISwap())
            {
                auto moves = queue.front().moves;
                auto matrix = queue.front().matrix;
                auto number = matrix[move];
                matrix.move(move);
                moves.push_back(number);
                if (matrix == puzzleMatrix())
                {
                    const auto end = std::chrono::steady_clock::now();
                    const auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
                    std::cout << "The puzzle is solved.\n";
                    std::cout << "Duration time: " << elapsed.count() << "ms\n";
                    std::cout << "Count of steps: " << moves.size() << "\n";
                    std::cout << "Count of unit nodes: " << set.size() << "\n";
                    // std::cout << "Steps: " << moves << "\n";
                    return queue.front().moves;
                }
                if (set.contains(matrix))
                {
                    continue;
                }
                set.insert(matrix);
                queue.push(queue_node(matrix, moves));
            }
            queue.pop();
        }
        return {};
    }
};

int main()
{
    puzzleMatrix firstPuzzleMatrix;
    // std::cout << firstPuzzleMatrix;
    // firstPuzzleMatrix.move({1, 2});
    // firstPuzzleMatrix.move({1, 1});
    // firstPuzzleMatrix.move({0, 1});
    // std::cout << firstPuzzleMatrix;
    firstPuzzleMatrix.shuffle();
    puzzle8 myVeryFirstPuzzleInCpp(firstPuzzleMatrix);
    myVeryFirstPuzzleInCpp.solve();
    return 0;
}

// https: //www.w3schools.com/cpp/cpp_constructors.asp