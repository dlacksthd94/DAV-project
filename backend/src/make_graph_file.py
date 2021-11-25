import os
import re
import json
import pandas as pd
import nltk
from importlib import reload
from tqdm import tqdm
from nltk import pos_tag
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.stem.snowball import SnowballStemmer
from itertools import combinations, chain
from collections import Counter
from backend.utils import helper as hp
FOLDER = 'backend/data'
N = 50



# """ """ """ """ """ make word info file """ """ """ """ """

# file_name = 'Aesop.csv'
# file_path = os.path.join(FOLDER, file_name)
# reload(hp)
# hp.dav_data_transform(file_path, os.path.join(FOLDER, 'word_info.csv'))



""" """ """ """ """ make graph file """ """ """ """ """

file_name = 'word_info.csv'
input_path = os.path.join(FOLDER, file_name)

# episode version
file_name = 'graph_epi.json'
output_path = os.path.join(FOLDER, file_name)

hp.dav_make_graph_file(input_path, output_path, N)