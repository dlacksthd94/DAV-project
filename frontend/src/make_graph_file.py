import os
import re
import json
import pandas as pd
import nltk
from tqdm import tqdm
from nltk import pos_tag
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.stem.snowball import SnowballStemmer
from itertools import combinations, chain
from collections import Counter
FOLDER = 'data'

""" """ """ """ """ open file """ """ """ """ """

file_name = 'Aesop.csv'
file_path = os.path.join(FOLDER, file_name)
df = pd.read_csv(file_path)



""" """ """ """ """ textpos tagging & normalization """ """ """ """ """

# expand contraction
dict_contraction = { "ain't": "are not", "'s":" is", "aren't": "are not", "can't": "cannot", "can't've": "cannot have", "'cause": "because", "could've": "could have", "couldn't": "could not", "couldn't've": "could not have", "didn't": "did not", "doesn't": "does not", "don't": "do not", "hadn't": "had not", "hadn't've": "had not have", "hasn't": "has not", "haven't": "have not", "he'd": "he would", "he'd've": "he would have", "he'll": "he will", "he'll've": "he will have", "how'd": "how did", "how'd'y": "how do you", "how'll": "how will", "I'd": "I would", "I'd've": "I would have", "I'll": "I will", "I'll've": "I will have", "I'm": "I am", "I've": "I have", "isn't": "is not", "it'd": "it would", "it'd've": "it would have", "it'll": "it will", "it'll've": "it will have", "let's": "let us", "ma'am": "madam", "mayn't": "may not", "might've": "might have", "mightn't": "might not", "mightn't've": "might not have", "must've": "must have", "mustn't": "must not", "mustn't've": "must not have", "needn't": "need not", "needn't've": "need not have", "o'clock": "of the clock", "oughtn't": "ought not", "oughtn't've": "ought not have", "shan't": "shall not", "sha'n't": "shall not", "shan't've": "shall not have", "she'd": "she would", "she'd've": "she would have", "she'll": "she will", "she'll've": "she will have", "should've": "should have", "shouldn't": "should not", "shouldn't've": "should not have", "so've": "so have", "that'd": "that would", "that'd've": "that would have", "there'd": "there would", "there'd've": "there would have", "they'd": "they would", "they'd've": "they would have","they'll": "they will", "they'll've": "they will have", "they're": "they are", "they've": "they have", "to've": "to have", "wasn't": "was not", "we'd": "we would", "we'd've": "we would have", "we'll": "we will", "we'll've": "we will have", "we're": "we are", "we've": "we have", "weren't": "were not","what'll": "what will", "what'll've": "what will have", "what're": "what are", "what've": "what have", "when've": "when have", "where'd": "where did", "where've": "where have", "who'll": "who will", "who'll've": "who will have", "who've": "who have", "why've": "why have", "will've": "will have", "won't": "will not", "won't've": "will not have", "would've": "would have", "wouldn't": "would not", "wouldn't've": "would not have", "y'all": "you all", "y'all'd": "you all would", "y'all'd've": "you all would have", "y'all're": "you all are", "y'all've": "you all have", "you'd": "you would", "you'd've": "you would have", "you'll": "you will", "you'll've": "you will have", "you're": "you are", "you've": "you have"}
pat_contraction = re.compile('(%s)'%'|'.join(dict_contraction.keys()))

def expand_contractions(s, dict_contraction=dict_contraction):
  def replace(match):
    return dict_contraction[match.group(0)]
  return pat_contraction.sub(replace, s)

df['episode'] = df['episode'].apply(expand_contractions)

# lower case
df['episode'] = df['episode'].apply(str.lower)
df['episode'].apply(lambda sent: re.sub(' i ', ' I ', sent))

# split by sentence
df['episode'] = df['episode'].apply(sent_tokenize)

# tokenize
df['episode'] = df['episode'].apply(lambda list_sent: [word_tokenize(sent) for sent in list_sent])

# remove punctuation
df['episode'] = df['episode'].apply(lambda list_sent: [[token for token in list_token if token.isalpha()] for list_token in list_sent])

# pos tagg
df['episode'] = df['episode'].apply(lambda list_sent: [pos_tag(list_token) for list_token in list_sent])

# select only V, N, ADJ
list_all = ['NN', 'NNS', 'NNP', 'NNPS', 'VB', 'VBG', 'VBD', 'VBN', 'VBP', 'VBZ', 'JJ', 'JJR', 'JJS']
dict_pos2num = {'n': 1, 'v': 2, 'j': 3}
df['episode'] = df['episode'].apply(lambda list_sent: [[(token[0], dict_pos2num[token[1][0].lower()]) for token in list_token if token[1] in list_all] for list_token in list_sent])

# lemmatize by V, N, ADJ
dict_num2pos = dict_pos2num = {1: 'n', 2: 'v', 3: 'a'}
df['episode'] = df['episode'].apply(lambda list_sent: [[(WordNetLemmatizer().lemmatize(token[0], pos=dict_num2pos[token[1]]), token[1]) for token in list_token] for list_token in list_sent])

# sample
df['episode'].sample().values



""" """ """ """ """ make graph file """ """ """ """ """

# # problem: same word, different pos tag
# set_pair = set(chain.from_iterable(chain.from_iterable(df['episode'].to_list())))
# dict_id2node = dict(enumerate(set_pair))
# temp = []
# for node in set_node:
#     if node[0] in temp:
#         word = node[0]
#         for node in set_node:
#             if word in node:
#                 node
#         break
#     else:
#         temp.append(node[0])

df['epi_pair'] = df['episode'].apply(lambda list_sent: list(combinations(set(chain.from_iterable(list_sent)), 2)))
df['sent_pair'] = df['episode'].apply(lambda list_sent: [list(combinations(set(list_token), 2)) for list_token in list_sent])

def reorder_pair(list_pair):
    result = []
    for pair in list_pair:
        a, b = pair
        if a[0] < b[0]:
            pair = (a, b)
        elif a[0] > b[0]:
            pair = (b, a)
        else:
            if a[1] < b[1]:
                pair = (a, b)
            elif a[1] > b[1]:
                pair = (b, a)
        result.append(pair)
    return result

list_epi_pair = reorder_pair(chain.from_iterable(df['epi_pair'].to_list())) # 283466
list_sent_pair = reorder_pair(chain.from_iterable(chain.from_iterable(df['sent_pair'].to_list()))) # 87730

df_cnt_epi_pair = pd.DataFrame(Counter(list_epi_pair).items(), columns=['pair', 'epi_count'])
df_cnt_sent_pair = pd.DataFrame(Counter(list_sent_pair).items(), columns=['pair', 'sent_count'])
df_cnt_pair_join = pd.merge(df_cnt_epi_pair, df_cnt_sent_pair, 'outer', on='pair').fillna(0)
df_cnt_pair_join['sent_count'] = df_cnt_pair_join['sent_count'].astype(int)
df_cnt_pair_join = df_cnt_pair_join.sort_values('pair').reset_index(drop=True)

df_cnt_epi_pair
df_cnt_sent_pair
df_cnt_pair_join

# episode version
set_node = set(chain.from_iterable(df_cnt_epi_pair['pair'].to_list()))
df_node = pd.DataFrame(set_node, columns=['name', 'group'])
tqdm.pandas()
sr_edge = df_cnt_epi_pair['pair'].progress_apply(lambda pair: (df_node[(df_node['name'] == pair[0][0]) & (df_node['group'] == pair[0][1])].index[0], df_node[(df_node['name'] == pair[1][0]) & (df_node['group'] == pair[1][1])].index[0]))
# df_edge = df_cnt_epi_pair['pair'].apply(lambda pair: ' '.join([pair[0][0], pair[1][0]])).str.split(expand=True)
df_edge = pd.DataFrame(sr_edge.to_list())
df_edge.insert(2, 'count', df_cnt_epi_pair['epi_count'])
df_edge.columns = ['source', 'target', 'weight']


file_name = 'graph_epi.json'
file_path = os.path.join(FOLDER, file_name)
with open(file_path, 'w') as f:
    json_graph = json.dumps({'nodes': df_node.to_dict(orient='records'), 'links': df_edge.to_dict(orient='records')})
    json.dump(json_graph, f)

# sentence version
set_node = set(chain.from_iterable(df_cnt_sent_pair['pair'].to_list()))
df_node = pd.DataFrame(set_node, columns=['name', 'pos'])
df_edge = df_cnt_sent_pair['pair'].apply(lambda pair: ' '.join([pair[0][0], pair[1][0]])).str.split(expand=True)
df_edge.insert(2, 'count', df_cnt_sent_pair['sent_count'])
df_edge.columns = ['from', 'to', 'count']

file_name = 'graph_sent.json'
file_path = os.path.join(FOLDER, file_name)
with open(file_path, 'w') as f:
    json_graph = json.dumps({'nodes': df_node.to_dict(orient='records'), 'edges': df_edge.to_dict(orient='records')})
    json.dump(json_graph, f)