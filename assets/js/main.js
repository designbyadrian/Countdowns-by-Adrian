localforage.config({
	name        : 'Countdowns',
	version     : 1.0,
	size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
	storeName   : 'countdowns', // Should be alphanumeric, with underscores.
	description : 'locally stored timers'
});

var countdowns = {
	counter: -1,
	setup: function(){
		var _this = this;

		this.timerPrototype = $('.timer.prototype').clone().removeClass('prototype');
		this.timers = $('.timers').first();
		this.add = $('.add').first();
		this.picker = new Pikaday({
			field: $("#datepicker")[0],
			onSelect: function(){
				_this.add.data('date',this.getMoment().valueOf())
			}
		});

		$("#cTitle").keyup(function(){
			_this.add.data('title',$(this).val());
		});

		$("#add").click(function(){

			var data = _this.add.data();

			if(data.title.length>0 && data.date.toString().length>0) {
				_this.saveTimer(data.title,data.date).then(function(){
					window.location.reload();
				});
			}

		});

		$("#clearDB").click(function(){
			if(confirm("Are you sure you want to clear your countdown database?")) {
				localforage.clear(function(){
					window.location.reload();
				});
			}
		});

		$(document).on('click','.delete',function(){
			var data = $(this).closest('.timer').data();

			if(confirm("Are you sure you want to delete \""+data.title+"\"?")) {
				_this.deleteTimer(data.id);
			}

		});

		this.drawTimers().then(function(){
			_this.loop();
		});

	},
	saveTimer: function(title,date){
		var d = $.Deferred();
		
		localforage.getItem("timers").then(function(data){
			if(!data) {
				data = {timers:[]};
			}

			data.timers.push({
				id: +new Date(),
				title: title,
				date: date
			});

			localforage.setItem("timers",data).then(function(){
				d.resolve();
			});
			
		});

		return d.promise();
	},
	deleteTimer: function(id){
		localforage.getItem("timers").then(function(data){
			if(!data) {
				data = {timers:[]};
			}

			for(var i=0,ii=data.timers.length;i<ii;i++) {
				if(data.timers[i].id == id) {
					data.timers.splice(i,1);
					break;
				}
			}

			localforage.setItem("timers",data).then(function(){
				window.location.reload();
			});
		});
	},
	drawTimers: function(){
		var _this = this,
			d = $.Deferred();
		
		localforage.getItem("timers").then(function(data){
			if(data) {

				data.timers.sort(function(a,b){
					if(a.date > b.date) {
						return -1;
					}
					if(a.date < b.date) {
						return 1;
					}
					return 0;
				});

				$.each(data.timers,function(){
					var $timer = _this.timerPrototype.clone();

					$timer.data({
						'date': 	this.date,
						'id': 		this.id,
						'title': 	this.title
					}).find('.title').text(this.title);

					_this.timers.prepend($timer);
				});

				d.resolve();

			} else {
				d.resolve();
			}
		});

		return d.promise();
	},
	loop: function(){
		var _this = this;

		_this.counter++;
		if(_this.counter>60) {
			_this.counter = 0;
		}

		$('.timer').each(function(){
			var time = moment().diff($(this).data('date'),'ms'),milliseconds = moment.duration(time).milliseconds();

			if(time<1 && _this.counter==0) {

				var days = moment.duration(time).asDays(),
					hours = moment.duration(time).hours(),
					minutes = moment.duration(time).minutes(),
					seconds = moment.duration(time).seconds();

				if(days>0) {
					days = 0;
				} else {
					days = Math.round(Math.abs(days))
				}
				if(hours>0) {
					hours = 0;
				} else {
					hours = Math.abs(hours)
				}
				if(minutes>0) {
					minutes = 0;
				} else {
					minutes = Math.abs(minutes)
				}
				if(seconds>0) {
					seconds = 0;
				} else {
					seconds = Math.abs(seconds)
				}
				if(milliseconds>0) {
					milliseconds = 0;
				} else {
					milliseconds = Math.abs(milliseconds)
				}

				$(this).find('.d').text(days);
				$(this).find('.h').text(("00"+hours).slice(-2));
				$(this).find('.m').text(("00"+minutes).slice(-2));
				$(this).find('.s').text(("00"+seconds).slice(-2));
				$(this).find('.ms').text(("00"+milliseconds).slice(-3));

			} else if(time<1) {

				if(milliseconds>0) {
					milliseconds = 0;
				} else {
					milliseconds = Math.abs(milliseconds)
				}

				$(this).find('.ms').text(("00"+milliseconds).slice(-3));
			}
		});

		requestAnimationFrame(function(){
			_this.loop();
		});
	},
};

$(function(){

	localforage.ready(function(){
		countdowns.setup();
	});
});
