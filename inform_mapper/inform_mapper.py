from flask import Flask, request, redirect, render_template, jsonify
from .inform_tools import get_header_info, get_dictionary_info, get_object_info

app = Flask(__name__)

ALLOWED_EXTENSIONS = set(['z5'])

@app.route('/')
def main_page():
    return render_template('frontpage.html')

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

            return render_template('graph.html', header=header, dictionary=dictionary, objects=objects)

    return render_template('frontpage.html', errorcode="Invalid file type uploaded.")
