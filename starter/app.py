from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    if 'clues' in request.args:
        try:
            clues = int(request.args['clues'])
        except (TypeError, ValueError):
            return jsonify({'error': 'Clues must be an integer between 0 and 81'}), 400
    else:
        difficulty = request.args.get('difficulty', 'easy')
        try:
            clues = sudoku_logic.clues_for_difficulty(difficulty)
        except ValueError:
            return jsonify({'error': 'Invalid difficulty'}), 400
    try:
        puzzle, solution = sudoku_logic.generate_puzzle(clues)
    except ValueError:
        return jsonify({'error': 'Clues must be an integer between 0 and 81'}), 400
    except RuntimeError:
        return jsonify({'error': 'Unable to generate a puzzle'}), 503
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    puzzle = CURRENT.get('puzzle')
    solution = CURRENT.get('solution')
    if puzzle is None or solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    data = request.get_json(silent=True)
    board = data.get('board') if isinstance(data, dict) else None
    if not sudoku_logic.is_valid_board_shape(board):
        return jsonify({'error': 'Board must be a 9x9 grid containing values from 0 to 9'}), 400
    incorrect = sudoku_logic.find_incorrect_cells(puzzle, solution, board)
    return jsonify({'incorrect': incorrect})


@app.route('/hint', methods=['POST'])
def get_hint():
    puzzle = CURRENT.get('puzzle')
    solution = CURRENT.get('solution')
    if puzzle is None or solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    data = request.get_json(silent=True)
    board = data.get('board') if isinstance(data, dict) else None
    if not sudoku_logic.is_valid_board_shape(board):
        return jsonify({'error': 'Board must be a 9x9 grid containing values from 0 to 9'}), 400

    hint = sudoku_logic.find_hint(puzzle, solution, board)
    if hint is None:
        return jsonify({'hint': None, 'message': 'No empty cells remaining.'})

    row, col, value = hint
    return jsonify({'hint': {'row': row, 'col': col, 'value': value}})

if __name__ == '__main__':
    app.run(debug=False)