import requests
import pandas as pd
from tqdm import tqdm
from bs4 import BeautifulSoup

URL = 'http://mythfolklore.net/aesopica/aesop1884/index.htm'
response = requests.get(URL)
html = response.text
soup = BeautifulSoup(html, 'html.parser')
table = soup.findAll('table')[2]
list_content = table.td.text.split('\n')[8:-4]

df = pd.DataFrame(list_content)
df[0] = df[0].str.strip()
df = df[0].str.split('\. ', expand=True)
df[1] = df[1].str.strip('\.')
df = df.dropna()
df[0] = df[0].astype(int)
df = df.set_index(0)
df.columns = ['title']
df['title'] = df['title'].str.upper()
df = df.drop_duplicates('title')
df['image_urls'] = ''

for i in tqdm(df.index.tolist()):
    URL = f'http://mythfolklore.net/aesopica/aesop1884/{i}.htm'
    df.loc[i, 'url'] = URL
    response = requests.get(URL)
    html = response.text
    soup = BeautifulSoup(html, 'html.parser')
    list_image = soup.findAll('img')[4:]
    list_image = list(map(lambda x: 'http://mythfolklore.net/aesopica/' + x.get_attribute_list('src')[0].strip('.'), list_image))
    df.at[i, 'image_urls'] = list_image

# df = df.reset_index()
# df.columns = ['id', 'title', 'image_urls', 'url']
# df = df.set_index('title')

# df_copy = df.copy(deep=True)
FOLDER = 'backend/data/'
df.to_json(FOLDER + 'picture.json', orient='records', indent=4)
