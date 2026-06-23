#!/bin/sh
python manage.py migrate --noinput
python seed_all.py
exec gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 backend.wsgi:application
