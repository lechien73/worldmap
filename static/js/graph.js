window.onresize = function() { 
    location.reload(); 
}

queue()
   .defer(d3.csv, "./life_data_hpi.csv")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

    var mapWidth = $("#World-chart").width();
    var mapHeight = mapWidth / 2.222;
    var mapScale = mapWidth / 6.667;
    var translateX = mapWidth / 2;
    var translateY = mapHeight / 2;

    console.log(mapWidth);   

    lifehpi = projectsJson;

    //Create a Crossfilter instance
    var ndx = crossfilter(lifehpi);

    //Define Dimensions
    var countryDim = ndx.dimension(function (d) {
        return d["Country"]; 
    });

    var ccDim = ndx.dimension(function (d) {
        return d["CountryCode"];
    });

    //Calculate metrics
    var lifeYears = countryDim.group().reduceSum(dc.pluck('Life Expectancy'));

    var worldlifeYears = ccDim.group().reduceSum(dc.pluck('Life Expectancy'));

    //Define charts
    var countryChart = dc.barChart("#Country-chart");

    var worldChart = dc.geoChoroplethChart("#World-chart");
    
    var colors = d3.scale.linear().range(["#17202A", "#424949", "#4D5656", "#626567", "#7B7D7D", "#B3B6B7", "#D0D3D4"]);

    countryChart
        .width(mapWidth)
        .height(200)
        .margins({top: 10, right: 40, bottom: 100, left: 40})
        .dimension(countryDim)
        .group(lifeYears)
        .x(d3.scale.ordinal().domain(countryDim))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Countries")
        .yAxis().ticks(4);

    // Load the json geodata first

    d3.json("/static/lib/js/countries.json", function(worldcountries) {
    worldChart
        .dimension(ccDim)
        .width(mapWidth)
        .height(mapHeight)
        .group(worldlifeYears)
        .colors(d3.scale.quantize().range(["#17202A", "#424949", "#4D5656", "#626567", "#7B7D7D", "#B3B6B7", "#D0D3D4"]))
        .colorDomain([0, 90])
        .colorCalculator(function (d) { return d ? worldChart.colors()(d) : '#ccc'; })
        .overlayGeoJson(worldcountries.features, "country", function(d) {
            return d.id;
        })
        .projection(d3.geo.mercator()
            .translate([translateX,translateY])
            .scale(mapScale)
            );

   dc.renderAll();
   });
}