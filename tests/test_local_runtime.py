import io
import logging
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from backend.factory import configure_logging
from backend.storage import local


class LocalRuntimeTests(unittest.TestCase):
    def test_default_data_and_override(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with patch.object(local, 'PROJECT_ROOT', root), patch.dict(os.environ, {'COVER_LETTER_DATA_DIR': ''}):
                self.assertEqual(local.data_dir(), root / 'data')
                self.assertTrue(local.data_dir().is_dir())
                with patch.dict(os.environ, {'COVER_LETTER_DATA_DIR': str(root / 'custom')}):
                    self.assertEqual(local.output_dir(), root / 'custom/output')

    def test_service_logs_reach_file_and_console_once(self):
        root_logger = logging.getLogger()
        previous_handlers = root_logger.handlers[:]
        previous_level = root_logger.level
        root_logger.handlers = []
        try:
            with tempfile.TemporaryDirectory() as directory, patch('backend.factory.PROJECT_ROOT', Path(directory)), patch('sys.stderr', new_callable=io.StringIO) as console:
                configure_logging()
                configure_logging()
                logging.getLogger('backend.services.resume').info('runtime-log-check')
                self.assertEqual(console.getvalue().count('runtime-log-check'), 1)
                contents = (Path(directory) / 'logs/backend.log').read_text()
                self.assertEqual(contents.count('runtime-log-check'), 1)
                for handler in root_logger.handlers:
                    handler.close()
        finally:
            root_logger.handlers = previous_handlers
            root_logger.setLevel(previous_level)
