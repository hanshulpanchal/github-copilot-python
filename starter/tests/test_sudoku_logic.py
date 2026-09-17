import random

import pytest

import sudoku_logic


def is_valid_solution(board):
    expected = set(range(1, sudoku_logic.SIZE + 1))

    rows_valid = all(set(row) == expected for row in board)
    columns_valid = all(
        {board[row][column] for row in range(sudoku_logic.SIZE)} == expected
        for column in range(sudoku_logic.SIZE)
    )
    boxes_valid = all(
        {
            board[row][column]
            for row in range(box_row, box_row + 3)
            for column in range(box_column, box_column + 3)
        }
        == expected
        for box_row in range(0, sudoku_logic.SIZE, 3)
        for box_column in range(0, sudoku_logic.SIZE, 3)
    )

    return rows_valid and columns_valid and boxes_valid


def test_create_empty_board_has_expected_shape_and_values():
    board = sudoku_logic.create_empty_board()

    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_is_safe_rejects_existing_row_column_and_box_values():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1

    assert sudoku_logic.is_safe(board, 0, 1, 1) is False
    assert sudoku_logic.is_safe(board, 1, 0, 1) is False
    assert sudoku_logic.is_safe(board, 1, 1, 1) is False
    assert sudoku_logic.is_safe(board, 1, 1, 2) is True


def test_is_valid_move_rejects_row_column_and_box_conflicts():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1
    board[1][1] = 2
    board[2][2] = 3

    assert sudoku_logic.is_valid_move(board, 0, 1, 1) is False
    assert sudoku_logic.is_valid_move(board, 1, 0, 2) is False
    assert sudoku_logic.is_valid_move(board, 2, 1, 3) is False


def test_is_valid_move_allows_non_conflicting_value_and_rejects_invalid_values():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1

    assert sudoku_logic.is_valid_move(board, 1, 1, 2) is True
    assert sudoku_logic.is_valid_move(board, 1, 1, 0) is False
    assert sudoku_logic.is_valid_move(board, 1, 1, 10) is False


def test_fill_board_creates_a_valid_complete_solution():
    board = sudoku_logic.create_empty_board()

    assert sudoku_logic.fill_board(board) is True
    assert is_valid_solution(board)


def test_generate_puzzle_returns_valid_solution_and_requested_clues():
    clues = 35

    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    assert is_valid_solution(solution)
    assert len(puzzle) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == clues

    for row in range(sudoku_logic.SIZE):
        for column in range(sudoku_logic.SIZE):
            if puzzle[row][column] != sudoku_logic.EMPTY:
                assert puzzle[row][column] == solution[row][column]


def test_generate_puzzle_has_exactly_one_valid_solution():
    random.seed(0)

    puzzle, solution = sudoku_logic.generate_puzzle(35)

    assert is_valid_solution(solution)
    assert sudoku_logic.has_unique_solution(puzzle) is True
    assert sudoku_logic.count_solutions(puzzle) == 1


@pytest.mark.parametrize('difficulty', ['easy', 'medium', 'hard'])
@pytest.mark.parametrize('seed', [1, 2, 3])
def test_multiple_generated_puzzles_have_configured_clues_and_unique_solutions(difficulty, seed):
    random.seed(seed)
    clues = sudoku_logic.clues_for_difficulty(difficulty)

    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == clues
    assert is_valid_solution(solution)
    assert sudoku_logic.count_solutions(puzzle) == 1


@pytest.mark.parametrize('difficulty, expected_clues', [
    ('easy', 45),
    ('medium', 35),
    ('hard', 30),
])
def test_difficulty_generates_expected_clues_and_unique_solution(difficulty, expected_clues):
    random.seed(0)

    clues = sudoku_logic.clues_for_difficulty(difficulty)
    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    assert clues == expected_clues
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == expected_clues
    assert is_valid_solution(solution)
    assert sudoku_logic.has_unique_solution(puzzle) is True


def test_unknown_difficulty_is_rejected():
    with pytest.raises(ValueError):
        sudoku_logic.clues_for_difficulty('expert')


def test_empty_board_has_multiple_solutions():
    board = sudoku_logic.create_empty_board()

    assert sudoku_logic.has_unique_solution(board) is False
    assert sudoku_logic.count_solutions(board) > 1
