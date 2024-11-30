#! /bin/sh
if [ -d ".env" ];
then
    echo ".env folder exits. Installing using pip"
else
    echo "Creating .env and install using pip"
    python3 -m venv .env
fi

. .env/bin/activate

pip install -r requirements.txt
echo "Work done deactivating .env"
deactivate