const json_url = "https://raw.githubusercontent.com/dlacksthd94/DAV-project/main/backend/data/graph_epi.json"
const csv_url = "https://raw.githubusercontent.com/dlacksthd94/DAV-project/main/backend/data/word_info.csv"
// create buttons of words
$.getJSON(json_url, function (json) {
    var container = document.getElementById('buttons')
    for (var i = 0; i < json.nodes.length; i++) {
        var obj = json.nodes[i]
        var html = '<button type="button" class="btn btn-primary m-1" data-bs-toggle="button" autocomplete="off">' + obj.name + '</button>'
        container.innerHTML += html
    }
})

function getActiveButtons() {
    var buttons = document.querySelectorAll(".btn-primary")
    var actives = document.querySelectorAll(".btn-primary.active")
    var all = []
    var selected = []
    document.getElementById('values').innerHTML = "Selected: " + selected.join(", ").toString()
    buttons.forEach(button => all.push(button.innerHTML))
    actives.forEach(button => selected.push(button.innerHTML))
    all.forEach(function(value){
        var group = document.getElementById(value)
        circle = group.childNodes[0];
        text = group.childNodes[1];
        if(selected.includes(value)){
            circle.setAttribute("fill", "red");
            text.style.fill = "red";
        }else{
            circle.setAttribute("fill", "black");
            text.style.fill = "black";
        };
        
    });
    d3.csv(csv_url, function(csv){
        result = []
        selected.forEach(function(value){
            filtered = csv.filter(function(d){return d['word']==value})

            // result.concat(filtered)
            

            titles = filtered.map(d=>d.title)
            episodes = filtered.map(d=>d.episodes)
            console.log(titles)
            console.log(episodes)
        })
        // console.log()
        // result = csv.filter(function(row){return selected.includes(row['word'])})
        // console.log(result)
    })   
}


// d3 svg starts
var width = 500,
    height = 500

var svg = d3.select("#svg").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .gravity(.05)
    .distance(275)
    .charge(-100)
    .size([width, height]);
// console.log(force);
d3.json(json_url, function (json) {
    //   console.log(json);

    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    var link = svg.selectAll(".link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function (d) { 
            if(d.weight > 15){
                return Math.sqrt(d.weight)/100;
            }else{
                return 0;
            };
        })
        .attr('stroke', 'black');

    var node = svg.selectAll(".node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("id", function(d){return d.name})
        .call(force.drag);

    node.append("circle")
        .attr("r", "5");

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) { return d.name });

    force.on("tick", function () {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
});





$(document).ready(function () {
    getActiveButtons()
    $(".btn-primary").on('click', function () {
        console.log("clicked")
        getActiveButtons()
    })
})



// for (var i = 0; i < buttons.length; i++) {
//     buttons[i].onclick = function(){
//         getActiveButtons()
//     }
// }

