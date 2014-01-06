(function(){ //don't accidentially pollute the global scope

  	var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

	//create the main svg
	var svg = d3.select("svg")
		.attr("width", width)
		.attr("height", height);

	var x = d3.time.scale()
		.range([0, width]);//auch roundBands möglich??

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = d3.scale.category20c();

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("top");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var area = d3.svg.area()
		.x(function(d){ return x(d.Jahr); })
		//.y0(function(d){ return y(d.aLpP); })
		.y0(function(d){ return y(d.y0); })
		.y1(function(d){ return y(d.y0 + d.y); });

	var stack = d3.layout.stack()
		.values(function(d){ return d.values });

	var canvas = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append ("g")
		.attr("transform", "translate(" + margin.left +"," + margin.top + ")");
	
	d3.json("Bodenverbrauchsindex.json", function (data){
		data.forEach(function(d){ d.Jahr = new Date(d.Jahr); });

		x.domain(d3.extent(data, function(d) { return d.Jahr; }));
		//y.domain([0, 5185]);
		y.domain([0, d3.max( data, function(d){return d.aLpP+d.aL+d.bFlpP+d.bFl;}) ]);
		color.domain([ "aLpP", "aL", "bFlpP", "bFl"]); 
		//SiFu: hier kommen je nach POsition andere Bilder raus - siehe Screenshots

		var allLand = stack(color.domain().map(function(name){
			return{
				name: name,
				values: data.map(function(d){
					return {Jahr: d.Jahr, y: d[name] };
				})
			}
		}))

		var land = canvas.selectAll("land")
			.data(allLand)
		   .enter().append("g")
		   	.attr("class", "land");
		
		land.append("path")
			.attr("class", "area")
			.attr("d", function(d){return area(d.values); })
			//console.log(area(d.x));
			.style("fill", function(d){ return color(d.name) });

		land.append("text")
			.datum(function(d) { return {name: d.name, value: d.values[d.values.length-1]}; } )
			//erklären! 
			.attr("transform", function(d){ return "translate(" + x(d.value.Jahr) + ", "+ y(d.value.y0 + d.value.y / 2) +")"; })
			//erklären - woher kommen die 2 y Werte??
			.attr("x", -60)
			// interessant: das verschiebt nach links, aber erst NACH dem transform....WIeso?
			.attr("dy", "0.35em")
			.text(function(d) {return d.name});
			//wie baue ich hier ein Switch für bessere Namen ein?

		canvas.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		canvas.append("g")
			.attr("class", "y axis")
			.call(yAxis);

	})

})();
