import copy

import pytest

import app as app_module


def test_flask_debug_mode_is_disabled_by_default():
    assert app_module.app.debug is False


def test_index_returns_game_page(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'Sudoku Game' in response.data
    assert b'name="viewport" content="width=device-width, initial-scale=1"' in response.data
    assert b'id="hint"' in response.data
    assert b'id="timer"' in response.data
    assert b'id="leaderboard"' in response.data
    assert b'id="theme-toggle"' in response.data


@pytest.mark.parametrize('difficulty', ['easy', 'medium', 'hard'])
def test_new_game_uses_selected_difficulty(client, difficulty):
    response = client.get(f'/new?difficulty={difficulty}')

    assert response.status_code == 200
    puzzle = response.get_json()['puzzle']
    expected_clues = app_module.sudoku_logic.DIFFICULTY_CLUES[difficulty]
    assert sum(cell != app_module.sudoku_logic.EMPTY for row in puzzle for cell in row) == expected_clues


def test_new_game_defaults_to_easy(client):
    response = client.get('/new')

    assert response.status_code == 200
    puzzle = response.get_json()['puzzle']
    assert sum(cell != app_module.sudoku_logic.EMPTY for row in puzzle for cell in row) == 45


def test_new_game_rejects_unknown_difficulty(client):
    response = client.get('/new?difficulty=expert')

    assert response.status_code == 400
    assert response.get_json() == {'error': 'Invalid difficulty'}


@pytest.mark.parametrize('query', ['/new?clues=invalid', '/new?clues=82', '/new?clues=-1'])
def test_new_game_rejects_invalid_clues(client, query):
    response = client.get(query)

    assert response.status_code == 400
    assert response.get_json() == {'error': 'Clues must be an integer between 0 and 81'}


def test_new_game_returns_requested_puzzle(client):
    response = client.get('/new?clues=40')

    assert response.status_code == 200
    puzzle = response.get_json()['puzzle']
    assert len(puzzle) == app_module.sudoku_logic.SIZE
    assert all(len(row) == app_module.sudoku_logic.SIZE for row in puzzle)
    assert sum(cell != app_module.sudoku_logic.EMPTY for row in puzzle for cell in row) == 40


def test_check_solution_requires_a_game_in_progress(client):
    response = client.post('/check', json={'board': []})

    assert response.status_code == 400
    assert response.get_json() == {'error': 'No game in progress'}


@pytest.mark.parametrize('payload', [None, {}, {'board': []}, {'board': [[0] * 9 for _ in range(8)]}])
def test_check_solution_rejects_malformed_boards(client, payload):
    client.get('/new')

    response = client.post('/check', json=payload)

    assert response.status_code == 400
    assert response.get_json() == {'error': 'Board must be a 9x9 grid containing values from 0 to 9'}


def test_check_solution_returns_no_incorrect_cells_for_solution(client):
    client.get('/new')

    response = client.post('/check', json={'board': app_module.CURRENT['solution']})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}


def test_check_solution_does_not_mark_empty_cells_as_incorrect(client):
    client.get('/new')

    response = client.post('/check', json={'board': app_module.CURRENT['puzzle']})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}


def test_check_solution_identifies_incorrect_cells(client):
    client.get('/new')
    board = copy.deepcopy(app_module.CURRENT['solution'])
    puzzle = app_module.CURRENT['puzzle']
    row, column = next(
        (row, column)
        for row in range(app_module.sudoku_logic.SIZE)
        for column in range(app_module.sudoku_logic.SIZE)
        if puzzle[row][column] == app_module.sudoku_logic.EMPTY
    )
    board[row][column] = board[row][column] % app_module.sudoku_logic.SIZE + 1

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    assert response.get_json()['incorrect'] == [[row, column]]


def test_check_solution_does_not_mark_prefilled_cells_as_incorrect(client):
    client.get('/new')
    board = copy.deepcopy(app_module.CURRENT['solution'])
    puzzle = app_module.CURRENT['puzzle']
    row, column = next(
        (row, column)
        for row in range(app_module.sudoku_logic.SIZE)
        for column in range(app_module.sudoku_logic.SIZE)
        if puzzle[row][column] != app_module.sudoku_logic.EMPTY
    )
    board[row][column] = board[row][column] % app_module.sudoku_logic.SIZE + 1

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}


def test_hint_returns_one_empty_cell_with_correct_value(client):
    client.get('/new')
    puzzle = copy.deepcopy(app_module.CURRENT['puzzle'])
    board = copy.deepcopy(puzzle)

    response = client.post('/hint', json={'board': board})

    assert response.status_code == 200
    hint = response.get_json()['hint']
    row, column = hint['row'], hint['col']
    assert puzzle[row][column] == app_module.sudoku_logic.EMPTY
    assert hint['value'] == app_module.CURRENT['solution'][row][column]


def test_hints_progress_to_different_empty_cells(client):
    client.get('/new')
    board = copy.deepcopy(app_module.CURRENT['puzzle'])

    first_response = client.post('/hint', json={'board': board})
    first_hint = first_response.get_json()['hint']
    board[first_hint['row']][first_hint['col']] = first_hint['value']

    second_response = client.post('/hint', json={'board': board})
    second_hint = second_response.get_json()['hint']

    assert (second_hint['row'], second_hint['col']) != (first_hint['row'], first_hint['col'])


def test_hint_handles_board_with_no_empty_cells(client):
    client.get('/new')
    solution = app_module.CURRENT['solution']

    response = client.post('/hint', json={'board': solution})

    assert response.status_code == 200
    assert response.get_json() == {'hint': None, 'message': 'No empty cells remaining.'}


def test_hint_requires_a_game_in_progress(client):
    response = client.post('/hint', json={'board': []})

    assert response.status_code == 400
    assert response.get_json() == {'error': 'No game in progress'}


def test_hint_rejects_malformed_board(client):
    client.get('/new')

    response = client.post('/hint', json={'board': [[0] * 9 for _ in range(8)]})

    assert response.status_code == 400
    assert response.get_json() == {'error': 'Board must be a 9x9 grid containing values from 0 to 9'}
