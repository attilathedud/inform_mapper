from flask import Flask, request, redirect, render_template, jsonify, send_from_directory
from .inform_tools import get_header_info, get_dictionary_info, get_object_info

import os

app = Flask(__name__)

ALLOWED_EXTENSIONS = set(['z5'])

def allowed_file(file_name):
    return '.' in file_name and \
           file_name.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_file(file_object):
    message = ''
    header = None
    dictionary = None
    objects = None

    try:
        header = get_header_info(file_object)
        dictionary = get_dictionary_info(file_object, header.dictionary_address)
        objects = get_object_info(file_object, header.object_table)
    except ValueError:
        message = 'There was an issue parsing the file.'

    return (message, header, dictionary, objects)

@app.route('/')
def main_page():
    return render_template('frontpage.html')

@app.route('/adventureland')
def example():
    file_name = 'Adventureland.z5'
    adventureland_file = open(os.path.join(app.root_path, 'static/test_games/' + file_name), 'rb')

    (message, header, dictionary, objects) = parse_file(adventureland_file)

    adventureland_file.close()
    if message:
        return render_template('frontpage.html', errorcode=message)

    return render_template('graph.html', name=file_name,
                           header=header, dictionary=dictionary, objects=objects)

@app.route('/', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('frontpage.html', errorcode="No file uploaded.")

        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return render_template('frontpage.html', errorcode="File upload failed.")

        if uploaded_file and allowed_file(uploaded_file.filename):
            (message, header, dictionary, objects) = parse_file(uploaded_file)

            if message:
                return render_template('frontpage.html', errorcode=message)

            return render_template('graph.html', name=uploaded_file.filename,
                                   header=header, dictionary=dictionary, objects=objects)

    return render_template('frontpage.html', errorcode="Invalid file type uploaded.")
