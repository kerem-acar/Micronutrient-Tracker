FROM python:3.10

WORKDIR /docker_code

COPY ./requirements.txt /docker_code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /docker_code/requirements.txt

COPY . /docker_code/backend

CMD ["fastapi", "run", "backend/main.py", "--port", "80"]

