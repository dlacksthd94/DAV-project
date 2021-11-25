import pandas as pd
import numpy as np
import re
import os
import nltk
import json

from math import log
from tqdm import tqdm
from nltk import pos_tag
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.stem.snowball import SnowballStemmer
from itertools import combinations, chain
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer

list_all = ['NN', 'NNS', 'NNP', 'NNPS', 'VB', 'VBG', 'VBD', 'VBN', 'VBP', 'VBZ', 'JJ', 'JJR', 'JJS']
dict_pos2num = {'n': 1, 'v': 2, 'j': 3}
dict_num2pos = {1: 'n', 2: 'v', 3: 'a'}

def dav_text_preprocess(text:str, dict_contraction:dict = None):
    if dict_contraction == None:
        dict_contraction = {
            "ain't": "are not", "'s":" is", "aren't": "are not", "can't": "cannot", 
            "can't've": "cannot have", "'cause": "because", "could've": "could have", 
            "couldn't": "could not", "couldn't've": "could not have", "didn't": "did not", 
            "doesn't": "does not", "don't": "do not", "hadn't": "had not", "hadn't've": "had not have", 
            "hasn't": "has not", "haven't": "have not", "he'd": "he would", "he'd've": "he would have", 
            "he'll": "he will", "he'll've": "he will have", "how'd": "how did", "how'd'y": "how do you", 
            "how'll": "how will", "I'd": "I would", "I'd've": "I would have", "I'll": "I will", 
            "I'll've": "I will have", "I'm": "I am", "I've": "I have", "isn't": "is not", "it'd": "it would", 
            "it'd've": "it would have", "it'll": "it will", "it'll've": "it will have", "let's": "let us", 
            "ma'am": "madam", "mayn't": "may not", "might've": "might have", "mightn't": "might not", 
            "mightn't've": "might not have", "must've": "must have", "mustn't": "must not", 
            "mustn't've": "must not have", "needn't": "need not", "needn't've": "need not have", 
            "o'clock": "of the clock", "oughtn't": "ought not", "oughtn't've": "ought not have", 
            "shan't": "shall not", "sha'n't": "shall not", "shan't've": "shall not have", "she'd": "she would", 
            "she'd've": "she would have", "she'll": "she will", "she'll've": "she will have", 
            "should've": "should have", "shouldn't": "should not", "shouldn't've": "should not have", 
            "so've": "so have", "that'd": "that would", "that'd've": "that would have", "there'd": "there would", 
            "there'd've": "there would have", "they'd": "they would", "they'd've": "they would have",
            "they'll": "they will", "they'll've": "they will have", "they're": "they are", "they've": "they have", 
            "to've": "to have", "wasn't": "was not", "we'd": "we would", "we'd've": "we would have", 
            "we'll": "we will", "we'll've": "we will have", "we're": "we are", "we've": "we have", 
            "weren't": "were not","what'll": "what will", "what'll've": "what will have", "what're": "what are", 
            "what've": "what have", "when've": "when have", "where'd": "where did", "where've": "where have", 
            "who'll": "who will", "who'll've": "who will have", "who've": "who have", "why've": "why have", 
            "will've": "will have", "won't": "will not", "won't've": "will not have", "would've": "would have", 
            "wouldn't": "would not", "wouldn't've": "would not have", "y'all": "you all", "y'all'd": "you all would", 
            "y'all'd've": "you all would have", "y'all're": "you all are", "y'all've": "you all have", 
            "you'd": "you would", "you'd've": "you would have", "you'll": "you will", "you'll've": "you will have", 
            "you're": "you are", "you've": "you have"
        }
        
    # 2021-11-18 jh park: first change npcs to a spacing, and then change spacings to a spacing.
    text = re.sub('\s', ' ', text)
    text = re.sub(' +', ' ', text)
    
    # 2021-11-18 jh park: fix chansong's code.
    for key, value in dict_contraction.items():
        text = re.sub(key, value, text)
    
    text = text.lower()
    
    # 2021-11-18 jh park: change end-marks to period mark and remove quote marks.
    text = re.sub('[:;?!]', '.', text)
    text = re.sub('"', '', text)
    
    # 2021-11-25 cs lim: change i to I
    text = re.sub('(?<= )i(?= |\.)', 'I', text)

    return text

def merge_duplicate(data:pd.DataFrame) -> pd.DataFrame:
    keys_tf = {}
    columns = data.columns.tolist()
    
    for element in data.values:
        keys = tuple(element[:-1])
        if keys in keys_tf:
            keys_tf[keys] += element[-1]
        else: 
            keys_tf[keys] = element[-1]
    
    data = []
    
    for keys, tf in keys_tf.items():
        row = [keys[i] for i in range(len(keys))]
        row.append(tf)
        data.append(row)
    
    data = pd.DataFrame(data, columns=columns)    
    
    return data


def dav_data_transform(input_path:str, save_path:str) -> None:    
    
    data = pd.read_csv(input_path)

    data['episode'] = data['episode'].apply(lambda x: dav_text_preprocess(x))
    data['episode'] = data['episode'].apply(sent_tokenize)
    data['episode'] = data['episode'].apply(
        lambda list_sent: [word_tokenize(sent) for sent in list_sent]
    )
    data['episode'] = data['episode'].apply(
        lambda list_sent: [pos_tag(list_token) for list_token in list_sent]
    )
    data['episode'] = data['episode'].apply(
            lambda list_sent: [
                [
                    (token[0], dict_pos2num[token[1][0].lower()])
                    for token in list_token if token[1] in list_all
                ] 
                for list_token in list_sent
            ]
        )

    data['episode'] = data['episode'].apply(
        lambda list_sent: [
            [
                (WordNetLemmatizer().lemmatize(
                    token[0], pos=dict_num2pos[token[1]]
                ), token[1]) for token in list_token] for list_token in list_sent
            ]
        )
    
    # 2021-11-25 cs lim: manually correct some wrong-lemmatized words
    dict_src2trg = {'saw': 'see', 'as': 'ass'}
    data['episode'] = data['episode'].apply(lambda list_sent: [[token if token[0] not in dict_src2trg else (dict_src2trg[token[0]], token[1]) for token in list_token ] for list_token in list_sent])

    data_dict = {}
    for idx, title_id, title, doc in data.itertuples(): # 2021-11-25 cs lim: fixed IndexError
        column = ['doc_len', 'word', 'pos', 'episode_id', 'tf']
        sub_data = []
        for sent_id, sent in enumerate(doc):
            doc_len = len(doc)
            sent_len = len(sent)
            dummy = [
                sub_data.append([doc_len, sent[i][0], sent[i][1], sent_id+1, 1/sent_len])
                for i in range(sent_len)
            ]
        data_dict[title] = pd.DataFrame(sub_data, columns=column)
        
        data = []

    for key, value in data_dict.items():
        data_dict[key] = merge_duplicate(value)
        temp_data = data_dict[key]
        data_dict[key]['count'] = [
            temp_data['word'].tolist().count(episode) for episode in temp_data['word']
        ]
        data_dict[key]['idf'] = np.log(temp_data['doc_len']/temp_data['count'])
        data_dict[key]['tfidf'] = temp_data['tf'] * temp_data['idf']
        data_dict[key].drop(columns=['count'], inplace=True)
        dummy = [
            data.append([key, row[0], row[1], row[2], row[3], row[4], row[5], row[6]])
            for _, row in data_dict[key].iterrows()
        ]
    
    data = pd.DataFrame(
        data, columns=['title', 'doc_len', 'word', 'pos', 'sent_id', 'tf', 'idf', 'tf_idf']
    )

    data.to_csv(save_path, index=False)

# 2021-11-25 cs lim: make N-node graph file
def dav_make_graph_file(input_path: str, output_path: str, N: int) -> None:
    # open file
    df = pd.read_csv(input_path)

    # select N nodes
    list_node_all = list(map(tuple, chain(df[['word', 'pos']].to_records(index=False))))
    cnt_node_selected = Counter(list_node_all).most_common(N)
    list_node_selected = list(map(lambda x: x[0], cnt_node_selected))
    dict_idx2node = dict(enumerate(list_node_selected))
    dict_node2idx = dict(map(lambda x: (x[1], x[0]), dict_idx2node.items()))
    dict_idx2count = dict(map(lambda x: (dict_node2idx[x[0]], x[1]), cnt_node_selected))
    df['pair_id'] = df[['word', 'pos']].apply(lambda pair: dict_node2idx[tuple(pair)] if tuple(pair) in list_node_selected else -1, axis=1)
    df = df[df['pair_id'] != -1].reset_index(drop=True)
    df['count'] = df['pair_id'].apply(lambda x: dict_idx2count[x])

    # make node list
    df_node = df[['word', 'pos', 'count']].drop_duplicates().sort_values('count', ascending=False).reset_index(drop=True)
    df_node.columns = ['name', 'group', 'count']

    # make edge list
    list_edge_selected = list(map(lambda x: tuple(sorted(x)), chain.from_iterable(df.groupby('title').apply(lambda x: list(combinations(set(x['pair_id']), 2))))))
    cnt_edge_selected = Counter(list_edge_selected)
    df_edge = pd.DataFrame(map(lambda x: x[0] + (x[1],), cnt_edge_selected.items()), columns=['source', 'target', 'weight'])

    with open(output_path, 'w') as f:
        json_graph = {'nodes': df_node.to_dict(orient='records'), 'links': df_edge.to_dict(orient='records')}
        json.dump(json_graph, f, indent=4)