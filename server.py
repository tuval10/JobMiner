# This file provided by Facebook is for non-commercial testing and evaluation
# purposes only. Facebook reserves all rights not expressly granted.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import json
import sys
import os
import time
import pymysql
from itertools import izip
from flask import Flask, Response, request

app = Flask(__name__, static_url_path='', static_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))

@app.route('/api/jobposts', methods=['GET', 'POST'])
def jopposts_handler():
    conn = pymysql.connect(host='mysqlsrv.cs.tau.ac.il', port=3306, user='DbMysql15', passwd='DbMysql15', db='DbMysql15', autocommit=True)
    cur = conn.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM JobPost")
        returnedList = MySqlToJson(cur)
    else:
        itemsQuery = request.args['q'].lower()
        returnedList = [];
    print returnedList

    print json.dumps([str(item) for item in returnedList]) 
    cur.close()
    return Response(
        json.dumps(returnedList),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )
    conn.close()


def jopposts_handler2():
    with open('jsons/jobposts.json', 'r') as f:
        jobposts = json.loads(f.read())
    if request.method == 'POST':
        itemsQuery = request.data;
        print itemsQuery
        keywords = json.loads(itemsQuery)['keywords']
        print keywords.split(' ')
        filtered_posts = jobposts
        for word in keywords.split(' '):
            filtered_posts = filter(lambda jobpost: (word in jobpost['postContent'].split(' ') != -1) , filtered_posts)

    return Response(
        json.dumps(filtered_posts if request.method == 'POST' else jobposts),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

@app.route('/api/companies', methods=['GET', 'POST'])
def companies_handler():
    return static_handler('Companies', 'company_name')

@app.route('/api/cities', methods=['Get','POST'])
def cities_handler():
    return static_handler('Cities', 'city_name')

@app.route('/api/states', methods=['GET', 'POST'])
def states_handler():
    return static_handler('States', 'state_name')

def static_handler(tableName, name_column):
    conn = pymysql.connect(host='mysqlsrv.cs.tau.ac.il', port=3306, user='DbMysql15', passwd='DbMysql15', db='DbMysql15', autocommit=True)
    cur = conn.cursor()
    if request.method == 'POST':
        itemsQuery = request.data['q'].lower()
    else:
        itemsQuery = request.args['q'].lower()
    #get city list from DB
    cur.execute("SELECT * FROM " + tableName.title()+ " WHERE " + name_column + " Like '" + itemsQuery + "%'")
    returnedList = [];
    for row in cur:
        returnedList.append({'id': row[0], 'name': row[1]})
    cur.close()
    conn.close()
    return Response(
        json.dumps(returnedList),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

def MySqlToJson(cur):
    """Returns all rows from a cursor as a list of dicts"""
    return  [dict((cur.description[i][0], value.) \
               for i, value in enumerate(row)) for row in cur.fetchall()]

if __name__ == '__main__':
    app.run(host=sys.argv[1],port=int(os.environ.get("PORT",int(sys.argv[2]) )))
