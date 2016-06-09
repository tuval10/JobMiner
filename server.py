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
from flask import Flask, Response, request

app = Flask(__name__, static_url_path='', static_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))

@app.route('/api/jobposts', methods=['GET', 'POST'])
def jopposts_handler():
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
    return static_handler('companies')

@app.route('/api/cities', methods=['Get','POST'])
def cities_handler():
    return static_handler('cities')

@app.route('/api/states', methods=['GET', 'POST'])
def states_handler():
    return static_handler('states')

def static_handler(itemName):
    #all this part should be sql
    with open('jsons/' + itemName + '.json', 'r') as f:
        items = json.loads(f.read())
    if request.method == 'POST':
        itemsQuery = request.data['q'].lower()
    else:
        itemsQuery = request.args['q'].lower()
    filtered_items = filter(lambda item: ( item['name'].lower().startswith(itemsQuery)) , items)

    return Response(
        json.dumps(filtered_items),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

@app.route('/api/jobtypes', methods=['GET', 'POST'])
def jobtypes_handler():
    with open('jsons/jobtypes.json', 'r') as f:
        jobtypes = json.loads(f.read())

    return Response(
        json.dumps(jobtypes),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )


if __name__ == '__main__':
    app.run(host=sys.argv[1],port=int(os.environ.get("PORT",int(sys.argv[2]) )))
