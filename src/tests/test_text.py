import os

# Hack. Append the system path so we can use a relative import
import sys
sys.path.append('../inform_mapper/')
from inform_text import decode_ascii_bytes, decode_z_word

def test_ascii_decode():
    assert decode_ascii_bytes("", 0) == ""
    assert decode_ascii_bytes(b"41", 1) == "A"
    assert decode_ascii_bytes(b"6d4f7a",3) == "mOz"

def test_z_word_decode():
    assert decode_z_word("") == ""
    assert decode_z_word(b"oddnumber") == ""
    assert decode_z_word(b"11060855") == "Cap"