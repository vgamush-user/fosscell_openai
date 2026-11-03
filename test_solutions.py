import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).parent

def load(path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

DataProcessor = load(ROOT / "level1/data_processor.py").DataProcessor
fibonacci = load(ROOT / "level3/fibonacci.py").fibonacci
squeeze = load(ROOT / "level4/matrix_squeezer.py").squeeze_matrix

class SolutionsTest(unittest.TestCase):
    def test_statistics(self):
        p = DataProcessor([1, 2, 3, 4])
        self.assertEqual(p.calculate_mean(), 2.5)
        self.assertEqual(p.calculate_median(), 2.5)
        self.assertEqual(p.calculate_variance(), 1.25)
        self.assertEqual(DataProcessor([7]).calculate_variance(), 0)
        with self.assertRaises(ValueError):
            DataProcessor().get_summary_statistics()

    def test_validation_and_atomicity(self):
        p = DataProcessor([1])
        for bad in [True, "2", None]:
            with self.assertRaises(TypeError):
                p.batch_add([2, bad])
            self.assertEqual(p.data, [1])
        for bad in [float("nan"), float("inf")]:
            with self.assertRaises(ValueError):
                p.add_data(bad)
        self.assertEqual(p.filter_data(1, 2), [1])
        p.transform_data(3, 2)
        self.assertEqual(p.data, [5])

    def test_csv(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "data.csv"
            p = DataProcessor([1, 2.5, 10**30])
            p.export_to_csv(path)
            other = DataProcessor()
            other.load_from_csv(path)
            self.assertEqual(other.data, p.data)
            path.write_text("value\n1\ninvalid\n")
            with self.assertRaises(ValueError):
                other.load_from_csv(path)
            self.assertEqual(other.data, p.data)

    def test_fibonacci(self):
        self.assertEqual([fibonacci(i) for i in range(8)], [0, 1, 1, 2, 3, 5, 8, 13])
        self.assertEqual(fibonacci(100), 354224848179261915075)
        with self.assertRaises(ValueError):
            fibonacci(-1)
        with self.assertRaises(TypeError):
            fibonacci(True)

    def test_folding(self):
        self.assertEqual(squeeze(["bcdf"], ["left"]), ["fd"])
        self.assertEqual(squeeze(["bcdf"], ["right"]), ["cb"])
        self.assertEqual(squeeze(["bcd"], ["left"]), ["dc"])
        self.assertEqual(squeeze(["bcd"], ["right"]), ["cb"])
        self.assertEqual(squeeze(["aa"], ["left"]), ["A"])
        self.assertEqual(squeeze(["ab"], ["left"]), ["_"])
        self.assertEqual(squeeze(["bb", "dd"], ["left", "up"]), ["D"])
        # Reversing a two-letter pile makes its previous bottom the new top.
        self.assertEqual(squeeze(["bcdf"], ["left", "left"]), ["c"])
        self.assertEqual(squeeze(["b", "c", "d"], ["up"]), ["d", "c"])
        self.assertEqual(squeeze(["b", "c", "d"], ["down"]), ["c", "b"])
        self.assertEqual(squeeze([], []), [])
        with self.assertRaises(ValueError):
            squeeze(["ab", "c"], [])
        with self.assertRaises(ValueError):
            squeeze(["a"], ["sideways"])

if __name__ == "__main__":
    unittest.main()


