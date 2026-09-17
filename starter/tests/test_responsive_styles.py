from pathlib import Path


STYLESHEET = Path(__file__).parents[1] / 'static' / 'styles.css'


def test_responsive_styles_keep_board_within_viewport_and_controls_touch_friendly():
    styles = STYLESHEET.read_text()

    assert 'overflow-x: hidden' in styles
    assert 'width: min(90vw, 396px)' in styles
    assert 'aspect-ratio: 1' in styles
    assert 'min-height: 44px' in styles
    assert '@media (max-width: 400px)' in styles
    assert 'flex-direction: column' in styles