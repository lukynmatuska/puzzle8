#include <iostream>
#include <vector>
#include <array>
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

    friend std::ostream &operator<<(std::ostream &os, const coordinates &c) {
        return os << "row: " << c.row << ", col: " << c.col;
    }
};

class puzzleMatrix
{
    std::array<std::array<int,3>,3> matrix = {};
    static const size_t sizeOfMatrix = 3;

public: // Access specifier
    puzzleMatrix()
    { // Constructor
        for (size_t i = 0; i < sizeOfMatrix; i++)
        {
            for (size_t j = 1; j <= sizeOfMatrix; j++)
            {
                matrix[i][j-1] = (i * sizeOfMatrix) + j;
            }
        }
        matrix.back().back() = 0;
    }

    void shuffle()
    {
        for (size_t i = 0; i < 200; i++)
        {
            const auto to_swap_variants = whatCanISwap();
            move(to_swap_variants[std::rand() % to_swap_variants.size()]);
        }
    }

    coordinates getEmptyCellFromMatrix() const {
        for (size_t i = 0; i < sizeOfMatrix; i++)
        {
            for (size_t j = 0; j < sizeOfMatrix; j++)
            {
                if (matrix[i][j] == 0)
                {
                    return {i, j};
                }
            }
        }
        return {0, 0};
    }

    std::vector<coordinates> whatCanISwap() const {
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
            std::cout << "destinationOfCell: " << destinationOfCell << std::endl;
            std::cout << "emptyCell: " << emptyCell << std::endl;
            std::cout << *this << std::endl;
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

    int distance() const {
        const std::array<coordinates,9> origin {
            coordinates{ 2, 2 }, // 0
            coordinates{ 0, 0 }, // 1
            coordinates{ 0, 1 }, // 2
            coordinates{ 0, 2 }, // 3
            coordinates{ 1, 0 }, // 4
            coordinates{ 1, 1 }, // 5
            coordinates{ 1, 2 }, // 6
            coordinates{ 2, 0 }, // 7
            coordinates{ 2, 1 }  // 8
        };
        int dist = 0;
        for (size_t row = 0; row < sizeOfMatrix; row++) {
            for (size_t col = 0; col < sizeOfMatrix; col++) {
                const auto coordinates = origin[matrix[row][col]];
                dist += std::abs(static_cast<int>(coordinates.row - row)) + std::abs(static_cast<int>(coordinates.col - col));
            }
        }
        return dist;
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

        bool operator< (const queue_node& node) const {
            return matrix.distance() > node.matrix.distance();
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
        std::priority_queue<queue_node> queue;
        queue.emplace(matrix, std::vector<int>());
        while (!solved)
        {
            for (coordinates const &move : queue.top().matrix.whatCanISwap())
            {
                auto moves = queue.top().moves;
                auto matrix = queue.top().matrix;
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
                    return queue.top().moves;
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