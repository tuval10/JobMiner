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
        print "request data to POST search:"
        print request.data
        keywords = json.loads(request.data)['keywords']
        print keywords
        filtered_posts = jobposts
        for word in keywords.split(' '):
            filtered_posts = filter(lambda jobpost: (str(jobpost).find(word) != -1) , filtered_posts)
        

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
    with open('jsons/companies.json', 'r') as f:
        companies = json.loads(f.read()) 

    return Response(
        json.dumps(companies),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )
    
@app.route('/api/cities', methods=['GET', 'POST'])
def cities_handler():
    with open('jsons/cities.json', 'r') as f:
        cities = json.loads(f.read()) 

    return Response(
        json.dumps(cities),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )
    
@app.route('/api/regions', methods=['GET', 'POST'])
def regions_handler():
    with open('jsons/regions.json', 'r') as f:
        regions = json.loads(f.read()) 

    return Response(
        json.dumps(regions),
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
    app.run(port=int(os.environ.get("PORT", 3000)))
