class Inform_Header:
    pass

class Inform_Dictionary:
    pass

class Inform_Object:
    pass

# 4 and 5 are shift lock
ALPHABET_DICT = {0:" ", 1:"", 2:"", 3:"", 4:"", 5:"", 6:"a", 7:"b", 8:"c", 9:"d", 10:"e", 11:"f",
                   12:"g", 13:"h", 14:"i", 15:"j", 16:"k", 17:"l", 18:"m", 19:"n",
                   20:"o", 21:"p", 22:"q", 23:"r", 24:"s", 25:"t", 26:"u", 27:"v",
                   28:"w", 29:"x", 30:"y", 31:"z"}

# 6 weird, 7 newline
SHIFT_DICT = {0:" ", 1:"", 2:"", 3:"", 4:"", 5:"", 6:"", 7:"", 8:"0", 9:"1", 10:"2", 11:"3",
                12:"4", 13:"5", 14:"6", 15:"7", 16:"8", 17:"9", 18:".", 19:",",
                20:"!", 21:"?", 22:"_", 23:"#", 24:"'", 25:"\"", 26:"/", 27:"\\",
                28:"-", 29:":", 30:"(", 31:")"}

def decode_z_bytes_into_z_chars(z_bytes):
    z_chars = []
    binary_representation = bin(int(z_bytes, 16))[2:].zfill(16)

    is_end_byte = binary_representation[0]

    return (is_end_byte, [binary_representation[1:6], binary_representation[6:11], binary_representation[11:16]])

def decode_z_word(z_bytes):
    word = ""
    is_end_byte = False
    shift_code = 0

    if len(z_bytes) % 2 != 0:
        return word

    word_binary_stream = []
    for i in range(0, len(z_bytes), 4):
        (is_end_byte, temp_binary) = decode_z_bytes_into_z_chars(z_bytes[i:i+4])
        word_binary_stream += temp_binary

        if is_end_byte is True:
            break

    i = 0

    while i < len(word_binary_stream):
        temp_code = int(word_binary_stream[i], 2)

        if temp_code == 4 or temp_code == 5:
            shift_code = temp_code
        else:
            if shift_code == 4:
                word += ALPHABET_DICT[temp_code].upper()
            elif shift_code == 5:
                if temp_code == 6:
                    word += chr(int(word_binary_stream[i+1] + word_binary_stream[i+2], 2))
                    i += 2
                else:
                    word += SHIFT_DICT[temp_code]
            else:
                word += ALPHABET_DICT[temp_code]

            shift_code = 0

        i += 1

    return word

def decode_ascii_bytes(ascii_bytes, amount):
    letters = ""

    for i in range(0, amount * 2, 2):
        letters += chr(int(ascii_bytes[i:i+2], 16))

    return letters

def get_header_info(uploaded_file):
    header = Inform_Header()

    header.version = ord(uploaded_file.read(1))
    uploaded_file.seek(4)
    header.base_of_high_memory = uploaded_file.read(2).hex()
    header.initial_program_counter = uploaded_file.read(2).hex()
    header.dictionary_address = uploaded_file.read(2).hex()
    header.object_table = uploaded_file.read(2).hex()
    header.global_variables_table = uploaded_file.read(2).hex()
    header.base_of_static_memory = uploaded_file.read(2).hex()
    uploaded_file.seek(24)
    header.abbrevations_table = uploaded_file.read(2).hex()
    header.file_length = "%04x" % int(int(uploaded_file.read(2).hex(), 16) / 4)
    header.checksum = uploaded_file.read(2).hex()

    return header

def get_dictionary_info(uploaded_file, dictionary_address):
    dictionary = Inform_Dictionary()

    uploaded_file.seek(int(dictionary_address, 16))
    dictionary.separator_length = ord(uploaded_file.read(1))
    dictionary.separator = decode_ascii_bytes(uploaded_file.read(dictionary.separator_length).hex(), dictionary.separator_length)
    dictionary.entry_length = ord(uploaded_file.read(1))
    dictionary.entries = int(uploaded_file.read(2).hex(), 16)

    dictionary.words = []

    for i in range( 0, dictionary.entries ):
        uploaded_file.seek(int(dictionary_address, 16) + dictionary.separator_length + 1 + 1 + 2 + (i * dictionary.entry_length))
        dictionary.words.append((i+1, decode_z_word(uploaded_file.read(6).hex())))

    return dictionary

def get_object_info(uploaded_file, object_table_address):
    objects = []

    beginning_of_properties_section = 0
    cur_object_id = 1

    uploaded_file.seek(int(object_table_address, 16) + 126)

    while beginning_of_properties_section is 0 or uploaded_file.tell() < beginning_of_properties_section:
        cur_object = Inform_Object()

        cur_object.id = cur_object_id
        cur_object_id += 1

        # Attributes at the front of the object
        temp_attributes = bin(int(uploaded_file.read(6).hex(), 16))[2:].zfill(48)
        temp_attribute_list = []
        for i in range(0, len(temp_attributes)):
            if temp_attributes[i] is not '0':
                temp_attribute_list.append(i)
        cur_object.attributes = temp_attribute_list

        # Next comes parent, sibling, and child
        cur_object.parent = int(uploaded_file.read(2).hex(), 16)
        cur_object.sibling = int(uploaded_file.read(2).hex(), 16)
        cur_object.child = int(uploaded_file.read(2).hex(), 16)

        # Property Location is next
        cur_object.properties = uploaded_file.read(2).hex()

        if beginning_of_properties_section is 0:
            beginning_of_properties_section = int(cur_object.properties, 16)

        cur_pos_in_obj_list = uploaded_file.tell()

        # Get our properties
        uploaded_file.seek(int(cur_object.properties, 16))
        cur_object.description_length = ord(uploaded_file.read(1))
        cur_object.description_bytes = uploaded_file.read(cur_object.description_length * 2).hex()
        cur_object.description = decode_z_word(cur_object.description_bytes)

        cur_object.property_list = []

        temp_property_size_and_number = bin(int(uploaded_file.read(1).hex(), 16))[2:].zfill(8)
        temp_property_data = ''
        while temp_property_size_and_number != '00000000':
            if temp_property_size_and_number[0] is '0':
                if temp_property_size_and_number[1] is '0':
                    temp_property_data = uploaded_file.read(1).hex()
                else:
                    temp_property_data = uploaded_file.read(2).hex()
            else:
                temp_property_data_size_and_number = bin(int(uploaded_file.read(1).hex(), 16))[2:].zfill(8)
                temp_property_data = uploaded_file.read(int(temp_property_data_size_and_number[2:8],2)).hex()

            cur_object.property_list.append((int(temp_property_size_and_number[2:8], 2), temp_property_data))

            temp_property_size_and_number = bin(int(uploaded_file.read(1).hex(), 16))[2:].zfill(8)
            temp_property_data = ''

        uploaded_file.seek(cur_pos_in_obj_list)

        objects.append(cur_object)

    return objects
