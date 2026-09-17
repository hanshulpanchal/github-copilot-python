import copy
import random

from sudoku.solver import fill_board, is_safe

SIZE = 9
EMPTY = 0

DIFFICULTY_CLUES = {
    'easy': 45,
    'medium': 35,
    'hard': 30,
}
MAX_GENERATION_ATTEMPTS = 10


def deep_copy(board):
    return copy.deepcopy(board)


def clues_for_difficulty(difficulty):
    try:
        return DIFFICULTY_CLUES[difficulty.lower()]
    except (AttributeError, KeyError):
        raise ValueError(f'Unknown difficulty: {difficulty}')


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_valid_board_shape(board):
    if not isinstance(board, list) or len(board) != SIZE:
        return False
    return all(
        isinstance(row, list) and len(row) == SIZE and
        all(isinstance(cell, int) and not isinstance(cell, bool) and 0 <= cell <= SIZE for cell in row)
        for row in board
    )


def find_empty_cell(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def count_solutions(board, limit=2):
    if not is_valid_puzzle(board):
        return 0

    empty_cell = find_empty_cell(board)
    if empty_cell is None:
        return 1

    row, col = empty_cell
    solutions = 0

    for candidate in range(1, SIZE + 1):
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            solutions += count_solutions(board, limit)
            board[row][col] = EMPTY
            if solutions >= limit:
                return solutions
    return solutions


def has_unique_solution(board):
    return count_solutions(board, limit=2) == 1


def is_valid_puzzle(board):
    for row in range(SIZE):
        values = [cell for cell in board[row] if cell != EMPTY]
        if len(values) != len(set(values)):
            return False

    for col in range(SIZE):
        values = [board[row][col] for row in range(SIZE) if board[row][col] != EMPTY]
        if len(values) != len(set(values)):
            return False

    for start_row in range(0, SIZE, 3):
        for start_col in range(0, SIZE, 3):
            values = []
            for row in range(start_row, start_row + 3):
                for col in range(start_col, start_col + 3):
                    value = board[row][col]
                    if value != EMPTY:
                        values.append(value)
            if len(values) != len(set(values)):
                return False

    return True


def is_valid_move(board, row, col, value):
    if not 0 <= row < SIZE or not 0 <= col < SIZE or not 1 <= value <= SIZE:
        return False

    for index in range(SIZE):
        if index != col and board[row][index] == value:
            return False
        if index != row and board[index][col] == value:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for box_row in range(start_row, start_row + 3):
        for box_col in range(start_col, start_col + 3):
            if (box_row, box_col) != (row, col) and board[box_row][box_col] == value:
                return False

    return True


def find_hint(puzzle, solution, board):
    for row in range(SIZE):
        for col in range(SIZE):
            if puzzle[row][col] == EMPTY and board[row][col] == EMPTY:
                return row, col, solution[row][col]
    return None


def find_incorrect_cells(puzzle, solution, board):
    incorrect = []
    for row in range(SIZE):
        for col in range(SIZE):
            if puzzle[row][col] == EMPTY and board[row][col] != EMPTY:
                if board[row][col] != solution[row][col]:
                    incorrect.append([row, col])
    return incorrect


def remove_cells(board, clues):
    if not 0 <= clues <= SIZE * SIZE:
        raise ValueError('clues must be between 0 and 81')

    positions = [(row, col) for row in range(SIZE) for col in range(SIZE) if board[row][col] != EMPTY]
    random.shuffle(positions)

    while sum(cell != EMPTY for row in board for cell in row) > clues:
        removed = False
        for row, col in positions:
            original = board[row][col]
            board[row][col] = EMPTY
            if has_unique_solution(board):
                removed = True
                break
            board[row][col] = original

        if not removed:
            break

        positions = [position for position in positions if position != (row, col)]


def generate_puzzle(clues=35):
    if not 0 <= clues <= SIZE * SIZE:
        raise ValueError('clues must be between 0 and 81')

    for _ in range(MAX_GENERATION_ATTEMPTS):
        board = create_empty_board()
        if not fill_board(board):
            continue

        solution = deep_copy(board)
        remove_cells(board, clues)
        if sum(cell != EMPTY for row in board for cell in row) == clues:
            return deep_copy(board), solution

    raise RuntimeError('Unable to generate a puzzle with the requested clue count')
