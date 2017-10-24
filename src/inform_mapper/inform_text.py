"""
Contains all the logic for decoding inform text strings.

http://inform-fiction.org/zmachine/standards/z1point0/sect03.html describes the text
encoding scheme.

This package does not handle custom dictionaries, abbrevations, and v1 files as I
have not been able to find any while testing.
"""

"""
The base (a1 and a2) alphabet dictionary. Some special characters:
0       -   space
1,2,3   -   use an abbrevation stored at 32((1,2,3)-1) + next z-character. Not implemented.
4       -   shift lock to uppercase the next character
5       -   shift lock to use the shift dictionary for the next character
"""
ALPHABET_DICT = {0: " ", 1: "", 2: "", 3: "", 4: "", 5: "", 6: "a", 7: "b", 8: "c", 9: "d", 10: "e",
                 11: "f", 12: "g", 13: "h", 14: "i", 15: "j", 16: "k", 17: "l", 18: "m", 19: "n",
                 20: "o", 21: "p", 22: "q", 23: "r", 24: "s", 25: "t", 26: "u", 27: "v",
                 28: "w", 29: "x", 30: "y", 31: "z"}

"""
The shift (a3) alphabet dictionary. Some special characters:
0       -   space
1,2,3   -   use an abbrevation stored at 32((1,2,3)-1) + next z-character. Not implemented.
4       -   shift lock to uppercase the next character
5       -   shift lock to use the shift dictionary for the next character
6       -   the next ten bits represent an ascii character code
7       -   newline
"""
SHIFT_DICT = {0: " ", 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "0", 9: "1", 10: "2",
              11: "3", 12: "4", 13: "5", 14: "6", 15: "7", 16: "8", 17: "9", 18: ".", 19: ",",
              20: "!", 21: "?", 22: "_", 23: "#", 24: "'", 25: "\"", 26: "/", 27: "\\",
              28: "-", 29: ":", 30: "(", 31: ")"}


def decode_z_bytes_into_z_chars(z_bytes):
    """
    z bytes are grouped in 16 bit segments (words) that contain 3 z characters and 1 end of word
    bit. Since a z string can have any amount of z characters, this function creates a stream of
    each word's z characters.
    """
    binary_representation = bin(int(z_bytes, 16))[2:].zfill(16)

    is_end_byte = binary_representation[0]

    return (is_end_byte, [binary_representation[1:6], binary_representation[6:11],
                          binary_representation[11:16]])


def decode_z_word(z_bytes):
    """Given an array of bytes, decode the z word."""
    word = ""
    is_end_byte = False
    shift_code = 0

    if len(z_bytes) % 2 != 0:
        return word

    # Loop through the byte stream and assemble all the character bits.
    word_binary_stream = []
    for i in range(0, len(z_bytes), 4):
        (is_end_byte, temp_binary) = decode_z_bytes_into_z_chars(
            z_bytes[i:i + 4])
        word_binary_stream += temp_binary

        if is_end_byte is True:
            break

    i = 0

    # Loop through all the character bits and encode them according to the z-engine rules.
    while i < len(word_binary_stream):
        temp_code = int(word_binary_stream[i], 2)

        if temp_code == 4 or temp_code == 5:
            shift_code = temp_code
        else:
            if shift_code == 4:
                word += ALPHABET_DICT[temp_code].upper()
            elif shift_code == 5:
                if temp_code == 6:
                    word += chr(int(word_binary_stream[i + 1] +
                                    word_binary_stream[i + 2], 2))
                    i += 2
                else:
                    word += SHIFT_DICT[temp_code]
            else:
                word += ALPHABET_DICT[temp_code]

            shift_code = 0

        i += 1

    return word


def decode_ascii_bytes(ascii_bytes, amount):
    """Given an array of bytes and an amount, return the ascii representation of them."""
    letters = ""

    for i in range(0, amount * 2, 2):
        letters += chr(int(ascii_bytes[i:i + 2], 16))

    return letters
