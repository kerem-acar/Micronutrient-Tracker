import logging

def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(20)
    file_handler = logging.FileHandler("app.log", mode='a', encoding='utf-8')
    logger.addHandler(file_handler)
    formatter = logging.Formatter("{asctime} - {levelname} - {message}", style="{", datefmt="%Y-%m-%d %H:%M")
    file_handler.setFormatter(formatter)
    logger.propagate = False
    return logger