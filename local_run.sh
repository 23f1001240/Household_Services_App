#! /bin/sh
if [ -d ".env" ];
then
    echo "Enabling virtual Environment."
else
    echo "No Virtual Environment. Please run setup.sh first."
    exit N
fi

# Activate virtual env
. .env/bin/activate
python3 app.py
deactivate