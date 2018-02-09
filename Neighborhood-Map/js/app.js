//数据
var universities = [{
		name: '济南东站',
		location: [117.02841,36.681155]
	},
	{
		name: '济南火车站',
		location: [116.989271,36.670692]
	},
	{
		name: '芙蓉街',
		location: [117.023432,36.666974]
	},
	{
		name: '齐鲁软件园',
		location: [117.134031,36.671526]
	},
	{
		name: '济南长途汽车站',
		location: [117.075074,36.669073]
	},
	{
		name: '济南大学',
		location: [116.966558,36.613066]
	},
	{
		name: '泉城广场',
		location: [117.021486,36.661715]
	},
	{
		name: '济南国际园博园',
		location: [116.810142,36.538124]
	},
];

//初始化地图
var map;

function init() {
	map = new AMap.Map('map', {
		resizeEnable: true,
		center: [117.026865,36.673962],
		zoom: 13,
		mapStyle: 'amap://styles/4dfd6e52d470ba9eb4ca32744883a8b9',
	});

	ko.applyBindings(new MapViewModel(universities));

}

//为每个学校的属性创建观察变量
var University = function(university) {
	//基本数据
	this.name = ko.observable(university.name);
	this.location = ko.observable(university.location);
	//点击li，触发其绑定的事件
	this.marker = ko.observable();
	//绑定li是否可见
	this.visible = ko.observable(true);
	//ajax查询
	// this.id= ko.observable(university.id);

}

//VM

var MapViewModel = function(data) {
	var self = this;
	//创建数据的观察数组
	self.universityList = ko.observableArray([]);

	data.forEach(function(university) {
		self.universityList.push(new University(university));
	});

	//创建信息窗口，并有一定的偏移
	var infowindow = new AMap.InfoWindow({
		offset: new AMap.Pixel(0, -28)
	});

	var marker;

	self.universityList().forEach(function(university, index) {

		//用已有图片替换marker默认的icon
		var icon = new AMap.Icon();
		//创建标记
		marker = new AMap.Marker({
			icon: icon,
			position: university.location(),
			map: map,
			animation: 'AMAP_ANIMATION_DROP',
		});

		university.marker = marker;

		let i = index;

		$.ajax({
			// url:"http://v.juhe.cn/weather/index?cityname=武汉&dtype=&format=&key=630a5114bc1d2bf4729275b4f07d532a",
			// url:"http://v.juhe.cn/toutiao/index?type=keji&key=793bdd1e7aaeb952e409b5c544e9257a",
			url: "http://v.juhe.cn/expressonline/getCarriers.php?dtype=&ex_category=&key=e215be13cf65992c602ecddeeba1bd62",

			dataType: "jsonp",

			success: function(responce) {
				var data = responce.result;

				AMap.event.addListener(university.marker, 'click', function() {
					var info = [];
					info.push("<h2>" + university.name() + "</h2>");
					var src = "http://api.map.baidu.com/panorama/v2?ak=I8yKhCGTcuIEU9fBlwppGcXUA9klckhF&width=256&height=128&coordtype=wgs84ll&location=" + university.location() + "&fov=180";

					info.push("<div><img src=" + src + " alt='无法获取图片'>");
					infowindow.setContent(info.join("<br>"));
					infowindow.open(map, this.getPosition());

					university.marker.setAnimation('AMAP_ANIMATION_BOUNCE');
					setTimeout(function() {
						university.marker.setAnimation(null);
					}, 1200);

					map.setCenter(university.marker.getPosition());
				});

			},

			error: function(e) {
				alert("无法获取信息！");
			},
		});
	});

	//显示所点击的list对应的infowindow
	self.showInfo = function(university) {
		AMap.event.trigger(university.marker, 'click');

	};

	self.isShow = ko.observable(50);
	self.toggleList = function() {
		return self.isShow(-self.isShow());
	}

	self.userInput = ko.observable('');

	//存储搜索对应的标记
	self.show = ko.observableArray();

	//监测输入框中内容
	self.userInput = ko.observable('');

	//搜索函数
	self.filterMarkers = function() {

		var searchInput = self.userInput();
		self.show.removeAll();

		self.universityList().forEach(function(university) {

			university.marker.hide();
			university.visible(false);

			if(university.name().indexOf(searchInput) !== -1) {
				self.show.push(university);
				university.visible(true);

			}

		});
		self.show().forEach(function(university) {
			university.marker.show();
		});

	};

};