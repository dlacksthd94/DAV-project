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

NUM_NODE = 50 # select top N nodes
WEIGHT_THRES = 1 # must be >= 1
BY = 'epi' # co-occurence unit. 'sent' or 'epi'


# """ """ """ """ """ make word info file """ """ """ """ """

file_name = 'Aesop.csv'
input_path = os.path.join(FOLDER, file_name)

file_name = 'word_info.csv'
output_path = os.path.join(FOLDER, file_name)

reload(hp)
hp.dav_data_transform(input_path, output_path)



""" """ """ """ """ make graph file """ """ """ """ """

file_name = 'word_info.csv'
input_path = os.path.join(FOLDER, file_name)

# episode version
file_name = f'graph_{BY}.json'
output_path = os.path.join(FOLDER, file_name)

hp.dav_make_graph_file(input_path, output_path, NUM_NODE, WEIGHT_THRES, BY)