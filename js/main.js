var svg = d3.select('svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object (top, right, bottom, left)
var padding = {t: 20, r: 20, b: 60, l: 60};

histoWidth = (svgWidth - 250) / 3 -  padding.r;
histoHeight = svgHeight - padding.t;

chartWidth = (svgWidth - 500) / 3 -  padding.r;
chartHeight = svgHeight / 2;

barBand = chartHeight / 18;
barHeight = barBand * 0.4;

// Color mapping based on year
var yearColors = {2000: '#8c8c8c', 2010: '#d86763'};
var valueColors = ['#fcc9b5','#fa8873','#d44951','#843540'];

// ************ some tools and variables for brushing **************** //
// ************** copy pasted code from lab 8 TODO ****************** //

// *******Create a brush object that spans the cells' dimensions******* // 
console.log(histoWidth, histoHeight);

var extentByAttribute = {};
var brushCell;

var densityBrush = d3.brushX()
	.extent([[200, -665],[550, 0]])
    .on("start", brushstart)
    .on("brush", brushmove)
    .on("end", brushend);

var popBrush = d3.brushX()
	.extent([[450, -665],[800, 0]])
	.on("start", brushstart)
    .on("brush", brushmove)
    .on("end", brushend);

var landBrush = d3.brushX()
	.extent([[285, -665],[680, 0]])
	.on("start", brushstart)
    .on("brush", brushmove)
    .on("end", brushend);

// Dataset from http://nbremer.github.io/urbanization/
d3.csv('./data/asia_urbanization.csv',
function(row){
    // This callback formats each row of the data
    return {
        city: row.city,
        country: row.country,
        type_country: row.type_country,
        land_2000: +row.land_2000,
        land_2010: +row.land_2010,
        land_growth: +row.land_growth,
        pop_2000: +row.pop_2000,
        pop_2010: +row.pop_2010,
        pop_growth: +row.pop_growth,
        density_2000: +row.density_2000,
        density_2010: +row.density_2010,
        density_growth: +row.density_growth
    }
},
function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/asia_urbanization.csv dataset.');
        console.error(error);
        return;
    }
// ************************************************************************ //
// ********************* start working on histogram *********************** //
// ************************************************************************ //

// ********************* get the extent of each growth ************************** //
    var densityExtent = d3.extent(dataset, function(d) {
    	return +d.density_growth;
    });

    var popExtent = d3.extent(dataset, function(d) {
    	return +d.pop_growth;
    });

    var landExtent = d3.extent(dataset, function(d) {
    	return d.land_growth;
    });

// **************** create scales for each growth and y scale ******************* //
    densityScale = d3.scaleLinear()
    	.range([200, 550])
    	.domain(densityExtent);

    popScale = d3.scaleLinear()
    	.domain(popExtent)
    	.range([450, 800]);

    landScale = d3.scaleLinear()
    	.domain(landExtent)
    	.range([290, 700]);

    var yScale = d3.scaleLinear()
    	.domain([0, 160])
    	.range([0, -700]);

    var densityBin = d3.histogram()
    	.value(function(d) { return +d.density_growth})
	    .domain(densityScale.domain())
	    .thresholds(densityScale.ticks(80))
	    (dataset);

    var popBin = d3.histogram()
    	.value(function(d) { return +d.pop_growth})
	    .domain(popScale.domain())
	    .thresholds(popScale.ticks(80))
	    (dataset);

	var landBin = d3.histogram()
		.value(function(d) { return +d.land_growth})
	    .domain(landScale.domain())
	    .thresholds(landScale.ticks(80))
	    (dataset);


	var nested = ["one"];

// *********************** create histograms for each bin ********************** //
// *********************** and append corresponding brush ********************** //
	var densityHistogram = svg.selectAll('.histogram')
		.data(nested)
		.enter()
		.append('g')
		.attr('class','densityHistogram')
		.attr('transform', 'translate('+[0, 675]+')');
	
	densityHistogram.append('g')
		.attr('class', 'brush')
		.attr('id', 'density_growth')
		.call(densityBrush);


	var popHistogram = svg.selectAll('.histogram')
		.data(nested)
		.enter()
		.append('g')
		.attr('class','popHistogram')
		.attr('transform', 'translate('+[(histoWidth) - 200, 675]+')');

	popHistogram.append('g')
		.attr('class', 'brush')
		.attr('id', 'pop_growth')
		.call(popBrush);


	var landHistogram = svg.selectAll('.histogram')
		.data(nested)
		.enter()
		.append('g')
		.attr('class','landHistogram')
		.attr('transform', 'translate('+[2 * (histoWidth), 675]+')');	

	landHistogram.append('g')
		.attr('class', 'brush')
		.attr('id', 'land_growth')
		.call(landBrush);


// ******************* create axises for each histogram ********************** //

	var formatPercent = d3.format(".0%");

	var yAxis = d3.axisLeft(yScale)
		.tickSize(350)
		.ticks(8);

	var densityAxis = d3.axisBottom(densityScale)
		.tickFormat(formatPercent)
		.ticks(8);

	var popAxis = d3.axisBottom(popScale)
		.tickFormat(formatPercent)
		.ticks(8);

	var landAxis = d3.axisBottom(landScale)
		.tickFormat(formatPercent)
		.ticks(8);

	densityHistogram.append('g')
		.attr('transform', 'translate(0,0)')
		.call(densityAxis);

	popHistogram.append('g')
		.attr('transform', 'translate(0,0)')
		.call(popAxis);

	landHistogram.append('g')
		.attr('transform', 'translate(0,0)')
		.call(landAxis);

	densityHistogram.append('g')
		.attr('transform', 'translate(550 ,0)')
		.attr('class', 'densityYAxis')
		.attr('opacity', '0.4')
		.call(yAxis);
	
	popHistogram.append('g')
		.attr('transform', 'translate(800,0)')
		.attr('class', 'densityYAxis')
		.attr('opacity', '0.4')
		.call(yAxis);
	
	landHistogram.append('g')
		.attr('transform', 'translate(635,0)')
		.attr('class', 'densityYAxis')
		.attr('opacity', '0.4')
		.call(yAxis);



// ********* create groups for each bin inside its corresponding histograms ******** //

	var densityGroup = densityHistogram.selectAll('.densityG')
		.data(densityBin)
		.enter()
		.append('g')
		.attr('class', 'densityG')
		.attr('transform', function(d, i) {
			return 'translate (' + densityScale(d.x0) + ')';
		});

	var popGroup = popHistogram.selectAll('.popG')
		.data(popBin)
		.enter()
		.append('g')
		.attr('class', 'popG')
		.attr('transform', function(d, i) {
			return 'translate (' + popScale(d.x0) + ')';
		});

	var landGroup = landHistogram.selectAll('.landG')
		.data(landBin)
		.enter()
		.append('g')
		.attr('class', 'landG')
		.attr('transform', function(d, i) {
			return 'translate (' + landScale(d.x0) + ')';
		});

// *********************** append circles in each bin *****************************//

	// ************** density histogram  *****************//

	var nodeEnter = densityGroup.selectAll('.node')
		.data(
			function(d, i) {
			d.sort(function(d, i) {
				return d3.descending(d.density_2010, i.density_2010);
			})
				return d;
			})
		.enter()
		.append('circle')
		.attr('class', 'node')
		.attr('cy', function(d, i) {
			return yScale(i);
		})
		.attr('id', function(d) {
			return d.country;
		})
		.attr('r', 2)
		.style(
			// 'fill', function(d) {
			// var color = d3.scaleT()
			// 			.domain(d3.extent(dataset, function(d) {
			// 				return +d.density_2010;
			// 			}))
			// 			.range(valueColors);
			
			// return color(d.density_2010);
			'fill', function(d) {
			if(d.density_2010 > 15000){
				return valueColors[3];
			} else if(d.density_2010 > 10000 && d.density_2010 < 15000) {
				return valueColors[2];
			} else if(d.density_2010 > 5000 && d.density_2010 < 10000) {
				return valueColors[1];
			} else {
				return valueColors[0];
			}
		});

	// ************** population histogram  *****************//
	var popEnter = popGroup.selectAll('.node')
		.data(function(d, i) {
			return d;
		})
		.enter()
		.append('circle')
		.attr('class', 'node')
		.attr('cy', function(d, i) {
			return yScale(i);
		})
		.attr('r', 2)
		.style('fill', function(d) {
			if(d.pop_2010 > 4000000){
				return valueColors[3];
			} else if(d.pop_2010 > 3000000 && d.pop_2010 < 4000000) {
				return valueColors[2];
			} else if(d.pop_2010 > 2000000 && d.pop_2010 < 3000000) {
				return valueColors[1];
			} else {
				return valueColors[0];
			}
		});


	// ************** land histogram  *****************//
	landGroup.selectAll('.node')
		.data(			function(d, i) {
			d.sort(function(d, i) {
				return d3.descending(d.land_2010, i.land_2010);
			})
				return d;
			})
		.enter()
		.append('circle')
		.attr('class', 'node')
		.attr('cy', function(d, i) {
			return yScale(i);
		})
		.attr('r', 2)
		.style('fill', function(d) {
			if(d.land_2010 > 800){
				return valueColors[3];
			} else if(d.land_2010 > 600 && d.land_2010 < 800) {
				return valueColors[2];
			} else if(d.land_2010 > 400 && d.land_2010 < 600) {
				return valueColors[1];
			} else {
				return valueColors[0];
			}
		});

// ************************************************************************ //
// ********************* start working on bar chart *********************** //
// ************************************************************************ //

// *********** aggregate data into density mean, pop & land sum *********** //

    var nestedChartData = d3.nest()
    	.key(function(d) {
    		return d.country;
    	})
    	.rollup(function(d) {
    		return {
    			pop_2000_agg: d3.sum(d, function(d) {
    				return +d.pop_2000;
    			}), 
    			pop_2010_agg: d3.sum(d, function(d) {
    				return +d.pop_2010;
    			}), 
    			density_2000_agg: d3.mean(d, function(d) {
    				return +d.density_2000;
    			}), 
    			density_2010_agg: d3.mean(d, function(d) {
    				return +d.density_2010;
    			}), 
    			land_2000_agg:d3.sum(d, function(d) {
    				return +d.land_2000;
    			}), 
    			land_2010_agg:d3.sum(d, function(d) {
    				return +d.land_2010;
    			}), 
    		}
    	})
    	.entries(dataset);

// ****************** scales based on calculated values above ****************** //

	var urbanExtentChart = d3.extent(nestedChartData, function(d) {
		return d.value.pop_2000;
	});

	var densityMeanExtent = d3.extent(nestedChartData, function(d) {
		return +d.value.density_2000_agg;
	});

    var densityBarScale = d3.scaleLinear()
    	.range([10, 250])
    	.domain(densityMeanExtent);

    var popBarScale = d3.scaleLinear()
    	.domain([0, 477232691])
    	.range([0, 220]);

    var landBarScale = d3.scaleLinear()
    	.domain([0, 89413])
    	.range([0, 230]);

    var yBarScale = d3.scaleLinear()
    	.domain([0, 160])
    	.range([0, -700]);

// **************** begin appending the box container into the svg ************ //

	svg.append('rect')
		.attr('class', 'back box')
		.attr('transform', 'translate(200, 10)')
		.attr('width', 370)
		.attr('height', 370)
		.attr('fill', 'white')
		.attr('opacity', '0.8')
		.attr('stroke', 'lightgray');



	svg.append('rect')
		.attr('class', 'back box')
		.attr('transform', 'translate(670, 10)')
		.attr('width', 330)
		.attr('height', 370)
		.attr('fill', 'white')
		.attr('opacity', '0.65')
		.attr('stroke', 'lightgray');

	svg.append('rect')
		.attr('class', 'back box')
		.attr('transform', 'translate(1070, 10)')
		.attr('width', 340)
		.attr('height', 370)
		.attr('fill', 'white')
		.attr('opacity', '0.8')
		.attr('stroke', 'lightgray');

// **************** begin appending the charts into the svg ************ //

    var test = ['one'];

    var densityChart = svg.selectAll('.chartG')
    	.data(test)
    	.enter()
    	.append('g')
    	.attr('class', 'densityChart')
    	.attr('transform', 'translate('+[300, 350]+')');

    var popChart = svg.selectAll('.chartG')
    	.data(test)
    	.enter()
    	.append('g')
    	.attr('class', 'popChart')
    	.attr('transform', 'translate('+[1.3 * chartWidth, 350]+')');

    var landChart = svg.selectAll('.chartG')
    	.data(test)
    	.enter()
    	.append('g')
    	.attr('class', 'landChart')
    	.attr('transform', 'translate('+[2.5 * chartWidth, 350]+')');

// ************************ density chart *****************************//
	
	var sorted = nestedChartData.sort(function(d, i) {
			return d3.descending(d.value.density_2010_agg, i.value.density_2010_agg)
		});

	var groupGBarChart = densityChart.selectAll('.barGroup')
		.data(nestedChartData)
		.enter()
		.append('g')
		.attr('class', 'barGroup')
		.attr('id', function(d) {
			return d.key;
		})
		.attr('transform', function(d, i) {
			return 'translate(' + 0 + ',' + (-310 + i*18)+')'   
		})
		.on('mouseover', function(d) {

		    var thisId = d3.select(this).attr('id');

		    svg.selectAll('.barGroup')
		    	.classed('hidden', function(d) {
		    		if(d.key != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})
		    	.classed('hovered', function(d) {
		    		if(d.key != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})

		    svg.selectAll('.node')
		    	.classed('hidden', function(d) {
		    		if(d.country != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})
		    	.classed('hovered', function(d) {
		    		if(d.country != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})

		})
		.on('mouseout', function(d, i) {
			var hovered = d3.select(this);
			svg.selectAll('.barGroup')
				.classed('hovered', false)
				.classed('hidden', false);
			svg.selectAll('.node')
				.classed('hovered', false)
				.classed('hidden', false);
    		hovered.select('text.value').remove();
		});

	groupGBarChart.append('rect')
		.attr('class', 'year_2000_bar')
		.attr('width', function(d) {
			return densityBarScale(d.value.density_2000_agg)
		})
		.attr('height', 5)
		.style('fill', yearColors[2000]);

	groupGBarChart.append('rect')
		.attr('class', 'year_2010_bar')
		.attr('width', function(d) {
			return densityBarScale(d.value.density_2010_agg)
		})
		.attr('height', 5)
		.attr('transform', 'translate(0, 5)')
		.style('fill', yearColors[2010]);

	groupGBarChart.append('text')
		.attr('class', 'densitychartLabel')
		.attr('width', 10)
		.attr('height', 5)
		.attr('transform', 'translate(-5, 8)')
		.text(function(d) {
			return d.key
		})
		.style('text-anchor', 'end')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');


// ******************************* population chart **************************************//
	
	var sorted = nestedChartData.sort(function(d, i) {
			return d3.descending(d.value.pop_2010_agg, i.value.pop_2010_agg)
		});

	var groupGBarChart = popChart.selectAll('.barGroup')
		.data(nestedChartData)
		.enter()
		.append('g')
		.attr('class', 'barGroup')
		.attr('id', function(d) {
			return d.key;
		})
		.attr('transform', function(d, i) {
			return 'translate(' + 400 + ',' + (-310 + i*18)+')'   
		})
		.on('mouseover', function(d) {

		    var thisId = d3.select(this).attr('id');

		    svg.selectAll('.barGroup')
		    	.classed('hidden', function(d) {
		    		if(d.key != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})
		    	.classed('hovered', function(d) {
		    		if(d.key != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})

		    svg.selectAll('.node')
		    	.classed('hidden', function(d) {
		    		if(d.country != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})
		    	.classed('hovered', function(d) {
		    		if(d.country != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})

		})
		.on('mouseout', function(d, i) {
			var hovered = d3.select(this);
			svg.selectAll('.barGroup')
				.classed('hovered', false)
				.classed('hidden', false);
			svg.selectAll('.node')
				.classed('hovered', false)
				.classed('hidden', false);
    		hovered.select('text.value').remove();
		});

	groupGBarChart.append('rect')
		.attr('class', 'year_2000_bar')
		.attr('width', function(d) {
			return popBarScale(d.value.pop_2000_agg)
		})
		.attr('height', 5)
		.style('fill', yearColors[2000]);

	groupGBarChart.append('rect')
		.attr('class', 'year_2010_bar')
		.attr('width', function(d) {
			return popBarScale(d.value.pop_2010_agg)
		})
		.attr('height', 5)
		.attr('transform', 'translate(0, 5)')
		.style('fill', yearColors[2010]);

	groupGBarChart.append('text')
		.attr('class', 'densitychartLabel')
		.attr('width', 10)
		.attr('height', 5)
		.attr('transform', 'translate(-5, 8)')
		.text(function(d) {
			return d.key
		})
		.style('text-anchor', 'end')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

// ******************************* land chart **************************************//
	
	var sorted = nestedChartData.sort(function(d, i) {
			return d3.descending(d.value.land_2010_agg, i.value.land_2010_agg)
		});

	var groupGBarChart = landChart.selectAll('.barGroup')
		.data(nestedChartData)
		.enter()
		.append('g')
		.attr('class', 'barGroup')
		.attr('id', function(d) {
			return d.key;
		})
		.attr('transform', function(d, i) {
			return 'translate(' + 450 + ',' + (-310 + i*18)+')'   
		})
		.on('mouseover', function(d) {

		    var thisId = d3.select(this).attr('id');

		    svg.selectAll('.barGroup')
		    	.classed('hidden', function(d) {
		    		if(d.key != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})
		    	.classed('hovered', function(d) {
		    		if(d.key != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})

		    svg.selectAll('.node')
		    	.classed('hidden', function(d) {
		    		if(d.country != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})
		    	.classed('hovered', function(d) {
		    		if(d.country != thisId) {
		    			return true;
		    		} else {
		    			false;
		    		}
		    	})

		})
		.on('mouseout', function(d, i) {
			var hovered = d3.select(this);
			svg.selectAll('.barGroup')
				.classed('hovered', false)
				.classed('hidden', false);
			svg.selectAll('.node')
				.classed('hovered', false)
				.classed('hidden', false);
    		hovered.select('text.value').remove();
		});

	groupGBarChart.append('rect')
		.attr('class', 'year_2000_bar')
		.attr('width', function(d) {
			return landBarScale(d.value.land_2000_agg)
		})
		.attr('height', 5)
		.style('fill', yearColors[2000]);

	groupGBarChart.append('rect')
		.attr('class', 'year_2010_bar')
		.attr('width', function(d) {
			return landBarScale(d.value.land_2010_agg)
		})
		.attr('height', 5)
		.attr('transform', 'translate(0, 5)')
		.style('fill', yearColors[2010]);

	groupGBarChart.append('text')
		.attr('class', 'densitychartLabel')
		.attr('width', 10)
		.attr('height', 5)
		.attr('transform', 'translate(-5, 8)')
		.text(function(d) {
			return d.key
		})
		.style('text-anchor', 'end')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');


// ************************* axises for the bar charts ***************************** //

	var densityChartAxis = d3.axisBottom(densityBarScale)
		.ticks(4)
		.tickFormat(function(d) {
			if(d / 1000 >= 1) {
				d = d / 1000 + 'k'; 
			}
			return d;
		});

	var popChartAxis = d3.axisBottom(popBarScale)
		.ticks(4)
		.tickFormat(function(d) {
			if(d / 10000000 >= 1) {
				d = d / 10000000 + 'M'; 
			}
			return d;
		});

	var landChartAxis = d3.axisBottom(landBarScale)
		.ticks(4)
		.tickFormat(function(d) {
			if(d / 10000 >= 1) {
				d = d / 1000 + 'k'; 
			}
			return d;
		});


	densityChart.append('g')
		.attr('transform', 'translate(-10,10)')
		.call(densityChartAxis);

	popChart.append('g')
		.attr('transform', 'translate(400, 10)')
		.call(popChartAxis);
	
	landChart.append('g')
		.attr('transform', 'translate(450, 10)')
		.call(landChartAxis);

// ************************* legends and titles  ***************************** //


	svg.append('text')
		.attr('transform', 'translate(270, 25)')
		.text('Avg. population density(in person/sq. km)')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	svg.append('text')
		.attr('transform', 'translate(790, 25)')
		.text('Urban population')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	svg.append('text')
		.attr('transform', 'translate(1200, 25)')
		.text('Urban land(in sq. km)')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	svg.append('text')
		.attr('transform', 'translate(20, 550)')
		.text('Growth in avg. population density between 2000 and 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	svg.append('text')
		.attr('transform', 'translate(750, 550)')
		.text('Growth in population between 2000 and 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	svg.append('text')
		.attr('transform', 'translate(1100, 550)')
		.text('Growth in urban land between 2000 and 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	svg.append('text')
		.attr('transform', 'translate(1100, 550)')
		.text('Growth in urban land between 2000 and 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');

	var three = ['one', 'two', 'three'];
	var four = ['1', '2', '3', '4'];	
	
	var legend = svg.selectAll('.legend0')
		.data(three)
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i, j) {
			console.log('this is workdin?');
			var tx = (i) * (400) + 450;
			var ty = (420);
			return 'translate(' +[tx, ty]+ ')';
		})
		.append('rect')
		.attr('class', 'legend')
		.attr('height', '25')
		.attr('width', '25')
		.attr('translate', 'transform(500, 500)')
		.style('fill', valueColors[3]);

	var legend = svg.selectAll('.legend1')
		.data(three)
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i, j) {
			var tx = (i) * (400) + 450;
			var ty = (445);
			console.log('this is not working');
			return 'translate(' +[tx, ty]+ ')';
		})
		.append('rect')
		.attr('class', 'legend3')
		.attr('height', '25')
		.attr('width', '25')
		.attr('translate', 'transform(500, 500)')
		.style('fill', valueColors[2]);

	var legend = svg.selectAll('.legend2')
		.data(three)
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i, j) {
			var tx = (i) * (400) + 450;
			var ty = (470);
			return 'translate(' +[tx, ty]+ ')';
		})
		.append('rect')
		.attr('class', 'legend')
		.attr('height', '25')
		.attr('width', '25')
		.attr('translate', 'transform(500, 500)')
		.style('fill', valueColors[1]);

	var legend = svg.selectAll('.legend4')
		.data(three)
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i, j) {
			var tx = (i) * (400) + 450;
			var ty = (495);
			return 'translate(' +[tx, ty]+ ')';
		})
		.append('rect')
		.attr('class', 'legend')
		.attr('height', '25')
		.attr('width', '25')
		.attr('translate', 'transform(500, 500)')
		.style('fill', valueColors[0]);

	svg.append('text')
		.data(four)
		.attr('transform', 'translate(480, 435)')
		.text('> 1.5k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(480, 460)')
		.text('10k - 15k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(480, 485)')
		.text('5k - 10k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(480, 510)')
		.text('< 5k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(885, 435)')
		.text('> 4M')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');	
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(885, 460)')
		.text('3M - 4M')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(885, 485)')
		.text('2M - 3M')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(885, 510)')
		.text('< 2M')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(1280, 435)')
		.text('> 0.8k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(1280, 460)')
		.text('0.6k - 0.8k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(1280, 485)')
		.text('0.4k - 0.6k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(1280, 510)')
		.text('< 0.4k')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(440, 410)')
		.text('Urban density - 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(840, 410)')
		.text('Urban population - 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');
	svg.append('text')
		.data(four)
		.attr('transform', 'translate(1240, 410)')
		.text('Urban land - 2010')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('font-weight', 'bold');


});


// ************************************************************************ //
// ***************** start working on brushing & linking ****************** //
// ************************************************************************ //

function brushstart(histogram) {
	// 
    // Check if this g element is different than the previous brush

    if(brushCell !== this) {

        // Clear the old brush
        densityBrush.move(d3.select(brushCell), null);

        // Save the state of this g element as having an active brush
        brushCell = this;
    }
}

function brushmove(histogram) {

 	var brushScale = {
 			'density_growth': densityScale, 
 			'pop_growth': popScale, 
 			'land_growth': landScale
 		};

    var id = d3.select(this).attr('id');
    var e = d3.event.selection;

    if(e) {

       svg.selectAll(".node")
            .classed("hidden", function(d, i){
                return e[0] > brushScale[id](d[id]) || brushScale[id](d[id]) > e[1];
            });
    }
}

function brushend() {
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);

        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}
