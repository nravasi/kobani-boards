import subprocess
import unittest

EXPECTED_OUTPUT = "Hello, World!\n"
EXPECTED_HEX = "48656c6c6f2c20576f726c64210a"


class TestBashHelloWorld(unittest.TestCase):
    def run_script(self):
        return subprocess.run(
            ["bash", "hello_world.sh"],
            capture_output=True,
            text=True,
        )

    def test_output_exact(self):
        result = self.run_script()
        self.assertEqual(result.stdout, EXPECTED_OUTPUT)

    def test_exit_code(self):
        result = self.run_script()
        self.assertEqual(result.returncode, 0)

    def test_no_stderr(self):
        result = self.run_script()
        self.assertEqual(result.stderr, "")

    def test_byte_level(self):
        result = subprocess.run(
            ["bash", "hello_world.sh"],
            capture_output=True,
        )
        self.assertEqual(result.stdout.hex(), EXPECTED_HEX)


class TestPythonHelloWorld(unittest.TestCase):
    def run_script(self):
        return subprocess.run(
            ["python3", "hello_world.py"],
            capture_output=True,
            text=True,
        )

    def test_output_exact(self):
        result = self.run_script()
        self.assertEqual(result.stdout, EXPECTED_OUTPUT)

    def test_exit_code(self):
        result = self.run_script()
        self.assertEqual(result.returncode, 0)

    def test_no_stderr(self):
        result = self.run_script()
        self.assertEqual(result.stderr, "")

    def test_byte_level(self):
        result = subprocess.run(
            ["python3", "hello_world.py"],
            capture_output=True,
        )
        self.assertEqual(result.stdout.hex(), EXPECTED_HEX)


class TestRubyHelloWorld(unittest.TestCase):
    def run_script(self):
        return subprocess.run(
            ["ruby", "hello_world.rb"],
            capture_output=True,
            text=True,
        )

    def test_output_exact(self):
        result = self.run_script()
        self.assertEqual(result.stdout, EXPECTED_OUTPUT)

    def test_exit_code(self):
        result = self.run_script()
        self.assertEqual(result.returncode, 0)

    def test_no_stderr(self):
        result = self.run_script()
        self.assertEqual(result.stderr, "")

    def test_byte_level(self):
        result = subprocess.run(
            ["ruby", "hello_world.rb"],
            capture_output=True,
        )
        self.assertEqual(result.stdout.hex(), EXPECTED_HEX)


if __name__ == "__main__":
    unittest.main()
