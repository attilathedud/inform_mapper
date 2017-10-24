"""
Front-end code for the web app. If we get a file, send it to the tool's parsing functions
and serve the output.
"""
import os

from flask import (Flask, render_template, request)

from .inform_tools import (get_abbrevation_info, get_dictionary_info,
                           get_header_info, get_object_info)


class Inform_Info:
    """Container class for the parsed data."""
    pass


app = Flask(__name__)

# While technically allowed, I can't find any z1, z2, or z4 files to test on.
ALLOWED_EXTENSIONS = set(['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8'])


def allowed_file(file_name):
    """
    Very simplistic check to make sure the file extension matches.

    We rely on the get_header_info code to ensure this is a valid z-game.
    """
    return '.' in file_name and \
           file_name.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_file(file_object):
    """Given a file object, parse it and return the info"""
    message = ''

    info = Inform_Info()

    try:
        info.header = get_header_info(file_object)
        info.dictionary = get_dictionary_info(
            file_object, info.header.dictionary_address)
        info.objects = get_object_info(file_object, info.header.object_table)
        info.abbrevations = get_abbrevation_info(
            file_object, info.header.version, info.header.abbrevations_table)
    except ValueError:
        message = 'There was an issue parsing the file.'

    return (message, info)


@app.route('/')
def main_page():
    """Just render the frontpage on index."""
    return render_template('frontpage.html')


@app.route('/adventureland')
def example():
    """For our example, automatically send Adventureland to be parsed and displayed."""
    file_name = 'Adventureland.z5'
    adventureland_file = open(os.path.join(
        app.root_path, 'static/test_games/' + file_name), 'rb')

    (message, info) = parse_file(adventureland_file)

    adventureland_file.close()
    if message:
        return render_template('frontpage.html', errorcode=message)

    return render_template('graph.html', name=file_name, info=info)


@app.route('/', methods=['POST'])
def upload_file():
    """If we get a post request, verify there is a file and then send it to be parsed."""
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('frontpage.html', errorcode="No file uploaded.")

        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return render_template('frontpage.html', errorcode="File upload failed.")

        if uploaded_file and allowed_file(uploaded_file.filename):
            (message, info) = parse_file(uploaded_file)

            if message:
                return render_template('frontpage.html', errorcode=message)

            return render_template('graph.html', name=uploaded_file.filename, info=info)

    return render_template('frontpage.html', errorcode="Invalid file type uploaded.")
