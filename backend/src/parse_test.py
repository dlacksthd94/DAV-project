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


""" """ """ """ """ make word info file """ """ """ """ """

file_name = 'Aesop.csv'
input_path = os.path.join(FOLDER, file_name)

file_name = 'word_info.csv'
output_path = os.path.join(FOLDER, file_name)

reload(hp)
hp.dav_data_transform(input_path, output_path)



# """ """ """ """ """ make graph file """ """ """ """ """

# file_name = 'word_info.csv'
# input_path = os.path.join(FOLDER, file_name)

# # episode version
# file_name = f'graph_{BY}.json'
# output_path = os.path.join(FOLDER, file_name)

# hp.dav_make_graph_file(input_path, output_path, NUM_NODE, WEIGHT_THRES, BY)


data = pd.read_csv(input_path)
data

text = "The old oak tree from India fell down."
text = "I put the book in the box on the table."

from pycorenlp import StanfordCoreNLP
nlp = StanfordCoreNLP('http://localhost:9000')

output = nlp.annotate(text, properties={
  'annotators': 'parse',
  'outputFormat': 'json'
})

print(output['sentences'][0]['parse']) # tagged output sentence
output['sentences'][0]['parse']




from nltk.parse.corenlp import CoreNLPServer
STANFORD = "stanford-corenlp-4.3.2"

server = CoreNLPServer(
   os.path.join(STANFORD, "stanford-corenlp-4.3.2.jar"),
   os.path.join(STANFORD, "stanford-corenlp-4.3.2-models.jar"),
)

server.start()

from nltk.parse.corenlp  import CoreNLPParser
parser = CoreNLPParser()
parse = next(parser.raw_parse(text))

from nltk.parse.corenlp import CoreNLPDependencyParser
parser = CoreNLPDependencyParser()
parse = next(parser.raw_parse(text))

server.stop()


jars = (
    os.path.join(STANFORD, "stanford-corenlp-4.3.2.jar"),
    os.path.join(STANFORD, "stanford-corenlp-4.3.2-models.jar"),
)

with CoreNLPServer(*jars):
    parser = CoreNLPParser()

    text = "The runner scored from second on a base hit"
    parse = next(parser.parse_text(text))
    parse.draw()

dir(parse)
parse.tree()
G_tree = parse.nx_graph()
G_tree.nodes
G_tree.edges
G_tree.get_edge_data(1, 2)
G_tree.adj

import networkx as nx
import numpy as np
import matplotlib.pyplot as plt
from pyvis import network

nt = network.Network()
nt.from_nx(G_tree)
nt.show('parse_test.html')