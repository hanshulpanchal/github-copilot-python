from pathlib import Path


STYLESHEET = Path(__file__).parents[1] / 'static' / 'styles.css'


def test_stylesheet_defines_all_alternating_three_by_three_box_regions():
    styles = STYLESHEET.read_text()

    selectors = [
        '.sudoku-row:nth-child(-n+3) .sudoku-cell:nth-child(-n+3)',
        '.sudoku-row:nth-child(-n+3) .sudoku-cell:nth-child(n+7)',
        '.sudoku-row:nth-child(n+4):nth-child(-n+6) .sudoku-cell:nth-child(n+4):nth-child(-n+6)',
        '.sudoku-row:nth-child(n+7):nth-child(-n+9) .sudoku-cell:nth-child(-n+3)',
        '.sudoku-row:nth-child(n+7):nth-child(-n+9) .sudoku-cell:nth-child(n+7)',
    ]

    assert all(selector in styles for selector in selectors)
    assert '--box-alt-bg' in styles
    assert 'background: var(--box-alt-bg)' in styles


def test_stylesheet_keeps_theme_and_mobile_board_rules():
    styles = STYLESHEET.read_text()

    assert 'body.dark-mode' in styles
    assert '@media (max-width: 400px)' in styles
    assert 'width: calc(100% / 9)' in styles
    assert 'aspect-ratio: 1' in styles
    assert '.sudoku-cell.prefilled' in styles
    assert '.sudoku-cell.hinted' in styles
    assert '.sudoku-cell.invalid' in styles