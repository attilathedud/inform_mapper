from .inform_text import decode_z_word, decode_ascii_bytes
import os

HEADER_SIZE = 64

class Inform_Header:
    pass

class Inform_Abbrevations:
    pass

class Inform_Dictionary:
    pass

class Inform_Object:
    pass

def get_header_info(uploaded_file):
    header = Inform_Header()

    uploaded_file.seek(0, os.SEEK_END)
    actual_file_size = uploaded_file.tell()
    if actual_file_size < HEADER_SIZE:
        raise ValueError('Invalid header')

    uploaded_file.seek(0)

    header.version = int(uploaded_file.read(1).hex(), 16)
    if header.version < 1 or header.version > 8:
        raise ValueError('Invalid header number')

    uploaded_file.seek(4)
    header.base_of_high_memory = uploaded_file.read(2).hex()
    header.initial_program_counter = uploaded_file.read(2).hex()
    header.dictionary_address = uploaded_file.read(2).hex()
    if int(header.dictionary_address, 16) > actual_file_size:
        raise ValueError('Invalid dictionary address')

    header.object_table = uploaded_file.read(2).hex()
    if int(header.object_table, 16) > actual_file_size:
        raise ValueError('Invalid object table address')

    header.global_variables_table = uploaded_file.read(2).hex()
    header.base_of_static_memory = uploaded_file.read(2).hex()
    uploaded_file.seek(24)
    header.abbrevations_table = uploaded_file.read(2).hex()
    if int(header.abbrevations_table, 16) > actual_file_size:
        raise ValueError('Invalid abbrevations table address')

    header.file_length = "%04x" % int(int(uploaded_file.read(2).hex(), 16) / 4)
    header.checksum = uploaded_file.read(2).hex()

    uploaded_file.seek(HEADER_SIZE)
    calculated_checksum = 0
    bytes_read = uploaded_file.read(1).hex()
    while bytes_read != "":
        calculated_checksum += int(bytes_read, 16)
        bytes_read = uploaded_file.read(1).hex()

    calculated_checksum = hex(calculated_checksum & 0xffff)

    if calculated_checksum != hex(int(header.checksum, 16)):
        raise ValueError('Invalid checksum')

    return header

def get_abbrevation_info(uploaded_file, version, abbrevations_table_address ):
    abbrevations = Inform_Abbrevations()

    if version == 1:
        abbrevations.count = 32
    else:
        abbrevations.count = 96

    abbrevations.items = []
    uploaded_file.seek(int(abbrevations_table_address, 16))

    for i in range(0, abbrevations.count):
        abbrevations.items.append((i+1, decode_z_word(uploaded_file.read(2).hex())))

    return abbrevations

def get_dictionary_info(uploaded_file, dictionary_address):
    dictionary = Inform_Dictionary()

    uploaded_file.seek(int(dictionary_address, 16))
    dictionary.separator_length = int(uploaded_file.read(1).hex(), 16)
    dictionary.separator = decode_ascii_bytes(uploaded_file.read(dictionary.separator_length).hex(),
                                              dictionary.separator_length)
    dictionary.entry_length = int(uploaded_file.read(1).hex(), 16)
    dictionary.entries = int(uploaded_file.read(2).hex(), 16)

    dictionary.words = []

    for i in range(0, dictionary.entries):
        uploaded_file.seek(int(dictionary_address, 16) + dictionary.separator_length + 1
                           + 1 + 2 + (i * dictionary.entry_length))
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
        cur_object.description_length = int(uploaded_file.read(1).hex(), 16)
        cur_object.description_bytes = uploaded_file.read(cur_object.description_length * 2).hex()
        cur_object.description = decode_z_word(cur_object.description_bytes)

        cur_object.property_list = []

        property_size_and_number = bin(int(uploaded_file.read(1).hex(), 16))[2:].zfill(8)
        property_data = ''
        while property_size_and_number != '00000000':
            if property_size_and_number[0] is '0':
                if property_size_and_number[1] is '0':
                    property_data = uploaded_file.read(1).hex()
                else:
                    property_data = uploaded_file.read(2).hex()
            else:
                property_data_size_and_number = bin(int(uploaded_file.read(1).hex(), 16))[2:].zfill(8)
                property_data = uploaded_file.read(int(property_data_size_and_number[2:8],2)).hex()

            cur_object.property_list.append((int(property_size_and_number[2:8], 2), property_data))

            property_size_and_number = bin(int(uploaded_file.read(1).hex(), 16))[2:].zfill(8)
            property_data = ''

        uploaded_file.seek(cur_pos_in_obj_list)

        objects.append(cur_object)

    return objects
