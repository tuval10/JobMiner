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
		
		return newJson;
	},
	onlyPartTimeJobChecked: function(){
		var jobtypesChosen = this.state[[itemLists[0][0]]].data.filter( item => item.checked);
		if(jobtypesChosen.length != 1)
			return false;
		return jobtypesChosen[0].id == 2;
	},
	handleSliderVisibility: function(){
		document.getElementById('sliderDiv').style['visibility'] = 
			(! this.onlyPartTimeJobChecked()) ? 'hidden' : 'visible';
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
		this.replaceState(newState);
	},
	updateList: function(listName, listData, includeUndef){
		var newState = {};
		newState[listName] = {};
		newState[listName].data = listData;
		newState[listName].includeUndef = includeUndef;
		if(listName == 'jobtypes')
			this.handleSliderVisibility();
		this.setState(newState);
	},
	loadListsFromServer: function(){
		itemLists.forEach( list => {
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
		});	
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
				request[list[0]] = {};
				request[list[0]].data = listRequestData;
				request[list[0]].includeUndef = this.state[list[0]].includeUndef;
			}
		});
		if(this.onlyPartTimeJobChecked()){
			request.job_precentage = {};
			request.job_precentage['min'] = document.getElementById('value-min').innerHTML;
			request.job_precentage['max'] = document.getElementById('value-max').innerHTML;
		}
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
				 <div id='sliderDiv' className='sliderWrapper'>
				  	<div><span id="value-min" className='sliderValue'></span></div>
				  	<div id='range'></div>
					<div><span id="value-max" className='sliderValue'></span></div>
					<div className='precentage-word'>אחוז משרה:</div>
				</div>
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
				<JobPost key={jobPost.id} data={jobPost}>
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
	handlePostClick: function(event, link){
		if(link != undefined){
		  	var win=window.open(link, '_blank');
	  		win.focus();
  		}
	},
	getOptionalPostDetails: function(){
		var optional = [['jobType', 'סוג עבודה'], ['precentage', 'אחוז משרה'], ['region','אזור'], ['city','עיר'], ['email','מייל']];
		var optionalNodes = optional.filter(field => (this.props.data[field[0]] != undefined && this.props.data[field[0]].length != 0))
			.map( (field, i) => {
				if (field[0] == 'email')
					return(
						<div key={i} className = 'jobDetails clickable' onClick={this.handlePostClick.bind(null, event, 'mailto:'+this.props.data.email)}>
							{field[1] + ': '}
							<u> {this.props.data[field[0]]} </u>
						</div>
						);
				return (
					<div className = 'jobDetails' key={i}>
						{field[1] + ': ' + this.props.data[field[0]]}
					</div>
					);
			});
		return optionalNodes;
	},
	render: function(){
		var optionalDetailsNode = this.getOptionalPostDetails();
		
		return(
			<div className = 'jobPost' onClick={this.handlePostClick}>
				<div className = 'groupTitle'>
					<div className = 'jobDetails clickable' onClick={this.handlePostClick.bind(null, event, this.props.data.groupLink)}>
						<u>{this.props.data.groupName}</u>
					</div>
					{optionalDetailsNode}
				</div>
				<div className = 'postContent'
					style= {{direction: (this.props.data.language=='english' ? 'ltr' : 'rtl')}} 
					onClick={this.handlePostClick.bind(null, event, this.props.data.groupLink+'permalink/'+this.props.data.postStoryNumber)}
				>
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

// slider outside 
var range = document.getElementById('range');
noUiSlider.create(range, {
	start: [ 0, 100 ], // Handle start position
	step: 20, // Slider moves in increments of '10'
	margin: 0, // Handles must be more than '20' apart
	connect: true, // Display a colored bar between the handles
	behaviour: 'tap-drag', // Move handle on tap, bar is draggable
	range: { // Slider can select '0' to '100'
		'min': 0,
		'max': 100
	}
});

var valueDivs = [document.getElementById('value-min'), document.getElementById('value-max')]

// When the slider value changes, update the input and span
range.noUiSlider.on('update', function( values, handle ) {
	valueDivs[handle].innerHTML = values[handle].replace('.00','') + '%';
});

