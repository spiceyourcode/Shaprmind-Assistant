from app.services.model_router import heuristic_is_complex


def test_heuristic_complex_length():
    assert heuristic_is_complex("x" * 300)


def test_heuristic_complex_keywords():
    assert heuristic_is_complex("I need a refund for this service")


def test_heuristic_simple():
    assert not heuristic_is_complex("What are your hours?")
