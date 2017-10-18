from flask import Flask, request, redirect, render_template, jsonify, send_from_directory
from .inform_tools import get_header_info, get_dictionary_info, get_object_info

import os

app = Flask(__name__)

ALLOWED_EXTENSIONS = set(['z5'])

@app.route('/')
def main_page():
    return render_template('frontpage.html')

@app.route('/adventureland')
def example():
    adventureland_file = open( os.path.join( app.root_path, 'static/test_games/Adventureland.z5' ), 'rb' )

    header = get_header_info(adventureland_file)
    dictionary = get_dictionary_info(adventureland_file, header.dictionary_address)
    objects = get_object_info(adventureland_file, header.object_table)

    adventureland_file.close()

    return render_template('graph.html', name='Adventureland.z5', header=header, dictionary=dictionary, objects=objects)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('frontpage.html', errorcode="No file uploaded.")

        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return render_template('frontpage.html', errorcode="File upload failed.")

        if uploaded_file and allowed_file(uploaded_file.filename):
            header = get_header_info(uploaded_file)
            dictionary = get_dictionary_info(uploaded_file, header.dictionary_address)
            objects = get_object_info(uploaded_file, header.object_table)

            return render_template('graph.html', name=uploaded_file.filename, header=header, dictionary=dictionary, objects=objects)

    return render_template('frontpage.html', errorcode="Invalid file type uploaded.")
