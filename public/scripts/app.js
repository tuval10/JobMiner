var Page = React.createClass({
	getInitialState: function(){
		return {data:[]};
	},
	loadPostsFromServer: function(){
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data){
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)		
		});
	},
	onSubmitSearchQuery: function(query, callback){
		console.log('query');
		console.log(JSON.stringify(query));
		$.ajax({
		    type: "POST",
		    url: this.props.url,
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(query),
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
			success: function(data){
				console.log('success');
				this.setState({data: data});
				callback();
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)	
		});
	},
	componentDidMount: function(){
		this.loadPostsFromServer();
	},
	render: function(){
		return(
			<div className='page'>
				<SearchBar onSearchSubmit={this.onSubmitSearchQuery}/>
				<div className="after-search"></div>
				<JobPostList data={this.state.data} />
			</div>
		);
	}
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ searchbar ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var itemLists = [['jobtypes', 'סוג משרה'], ['regions', 'אזורים'], ['cities','ערים'], ['companies','חברות']];

var SearchBar = React.createClass({
	getInitialState: function() {
		var newJson = {keywords: ''};
		var listJsons = itemLists.forEach((list) => {
			var jsonObj = {
				'data': [],
				'includeUndef': true
			};
			var listJsonObj = {};
			newJson[list[0]] = jsonObj;
		});
		console.log(newJson);
		
		return newJson;
	},
	clearSearchBar: function(){
		var newState = this.state;
		newState['keywords'] = '';
		itemLists.forEach((list) => {
			var listChecked = newState[list[0]].data.map( item => {
				item.checked = true;
				return item;
			}); 
			newState[list[0]].data = listChecked;
			newState[list[0]].includeUndef = true;
		});
		console.log("newState");
		console.log(newState);
		this.replaceState(newState);
	},
	updateList: function(listName, listData, includeUndef){
		var newState = {};
		newState[listName] = {};
		newState[listName].data = listData;
		newState[listName].includeUndef = includeUndef;
		this.setState(newState);
	},
	loadListsFromServer: function(){
		async.each(itemLists,function(list,i){
			$.ajax({
				url: '/api/' + list[0],
				dataType: 'json',
				cache: false,
				success: function(data){
					var all_items_checked = data.map(function(item){
						item.checked = true;
						return item;
					});
					this.updateList(list[0], all_items_checked, true);
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)		
			});
		}.bind(this));	
	},
	componentDidMount: function(){
		this.loadListsFromServer();
	},
	formatListData: function(list){
		if(list.data.filter(item => (!item.checked)).length == 0)
			return [];
		else	
			return list.data.filter(item => (item.checked)).map( item => item.id );
	},
	handleKeywordsChange: function(event) {
    	this.setState({keywords: event.target.value});
    },
	handleSubmit: function(e){	
		var request = {};
		request['keywords'] = this.state.keywords;
		itemLists.forEach((list) => {
			var listRequestData = this.formatListData(this.state[list[0]]);
			if(listRequestData.length != 0 || !this.state[list[0]].includeUndef)
			{
				console.log(listRequestData);
				request[list[0]] = {};
				request[list[0]].data = listRequestData;
				request[list[0]].includeUndef = this.state[list[0]].includeUndef;
			}
		});
		this.props.onSearchSubmit(request, this.clearSearchBar);	
	},
	handleOptionToggle: function(listName, item_id){
		var newListData = this.state[listName].data.map(function(item){
			if(item.id == item_id)
				item.checked = ! item.checked;
			return item;
		});
		this.updateList(listName, newListData, this.state[listName].includeUndef);
	},
	handleToggleAll: function(listName, checkedValue){
		var listChecked = this.state[listName].data.map( item => {
			item.checked = checkedValue;
			return item;
		}); 
		this.updateList(listName, listChecked, this.state[listName].includeUndef);
	},
	handleUndefToggle: function(listName){
		this.updateList(listName, this.state[listName].data, ! this.state[listName].includeUndef);
	},
	render: function(){
		var itemListsNodes = itemLists.map(function(list,i){
			return (
				<ItemsList key={i} url={'/api/' + list[0]} listName={list[1]} listEnName={list[0]} 
					items={this.state[list[0]].data} includeUndef={this.state[list[0]].includeUndef} 
					onOptionToggle={this.handleOptionToggle} onToggleAll={this.handleToggleAll} 
					undef={this.state[list[0]].includeUndef} onUndefToggle={this.handleUndefToggle} />
			);
		}.bind(this));
		return (
			<div className='searchbar'>
				<SearchLine value={this.state.keywords} onChange={this.handleKeywordsChange}/>
				{itemListsNodes}
		  		<div className='menu-item menu-button'>מד</div>
		  		<div className='menu-item menu-button' onClick={this.handleSubmit}>חפש</div>
		  		<div className='menu-item menu-button'>הוסף קבוצה</div>
			</div>
		);
	}
});

var SearchLine = React.createClass({
	render: function() {
		return (
			<div className='searchword-container'>
				<div className='searchword'>חפש: </div>
				<input type="text" className='menu-search-line' value={this.props.value} onChange={this.props.onChange} placeholder="אנא הזן טקסט לחיפוש"/>
			</div>
		);
	}
});

var ItemsList = React.createClass({
	getInitialState: function(){
		return {data:[]};
	},
	render: function(){	
		if(this.props.items == undefined){
			return(
				<div className='menu-container menu-dropdown'>
					<div className="menu-item item-name">{this.props.listName}</div>
					<div className="menu-options-container"></div>
				</div>
			);
		}	
		var	items_nodes = this.props.items.map(function(item){
				return (
					<ItemOption key={item.id} id={item.id} name={item.name} 
						onOptionToggle={this.props.onOptionToggle.bind(null , this.props.listEnName)} 
						checked={item.checked} />
				);	
		}.bind(this));
		var undefClass = (this.props.undef) ? "checkbox checkedCheckbox" : "checkbox uncheckedCheckbox";
		return(
			<div className='menu-container menu-dropdown'>
				<div className="menu-item item-name">{this.props.listName}</div>
				<div className="menu-options-container">
					<div className='menu-item menu-option opt' onClick={this.props.onToggleAll.bind(null, this.props.listEnName, true)} >בחר הכל</div>
					<div className='menu-item menu-option opt' onClick={this.props.onToggleAll.bind(null, this.props.listEnName, false)} >נקה הכל</div>
					<div className="menu-item menu-option opt" onClick={this.props.onUndefToggle.bind(null, this.props.listEnName)} >
		  				<div className="menu-option-name">הצג תוצאות ללא</div>
		  				<div className="menuOptionCheckbox">
							<label className={undefClass}></label>
						</div>
		  			</div>
					{items_nodes}
	  			</div>
			</div>
		);
	}
});

var ItemOption = React.createClass({
	render: function(){
		var checkboxClass = (this.props.checked) ? "checkbox checkedCheckbox" : "checkbox uncheckedCheckbox";
		return(
			<div className="menu-item menu-option" onClick={this.props.onOptionToggle.bind(null, this.props.id)} >
  				<div className="menu-option-name">{this.props.name}</div>
  				<div className="menuOptionCheckbox">
					<label className={checkboxClass}></label>
				</div>
  			</div>
		);
		
	}
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ JobPostList ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var JobPostList = React.createClass({
	render: function(){
		var jobPostNodes = this.props.data.map(function(jobPost){
			return(
				<JobPost key={jobPost.id} groupName={jobPost.groupName} groupLink={jobPost.groupLink} email={jobPost.email}>
					{jobPost.postContent}
				</JobPost>
				);
		});
		
		return(
			<div className = 'jobPostList'>
				{jobPostNodes}
			</div>
		);
	}
});


var JobPost = React.createClass({
	handlePostClick: function(event){
	  	var win=window.open(this.props.groupLink, '_blank');
  		win.focus();
	},
	render: function(){
		return(
			<div className = 'jobPost' onClick={this.handlePostClick}>
				<div className = 'groupName'>
					<a className = 'groupLink' href={this.props.groupLink} target="_blank">
						{this.props.groupName}
					</a>
				</div>
				<div className = 'groupName'>
					<a className = 'emailLink' href={'mailto:'+this.props.email} target="_blank">
						{this.props.email}
					</a>
				</div>
				<div className = 'postContent'>
					{this.props.children}
				</div>
			</div>
		);
	}
});


ReactDOM.render(
	<Page url='/api/jobposts' /> ,
	document.getElementById('content')
);