const json_url = "https://raw.githubusercontent.com/dlacksthd94/DAV-project/main/backend/data/graph_epi.json";
const csv_url = "https://raw.githubusercontent.com/dlacksthd94/DAV-project/main/backend/data/Aesop.csv";

function renderButtons() {
    $.getJSON(json_url, function (json){
        var container = document.getElementById('buttons')
        for (var i = 0; i < json.nodes.length; i++){
            var obj = json.nodes[i]
            var html = '<button type="button" class="btn btn-primary m-1" data-bs-toggle="button" autocomplete="off">' + obj.name + '</button>'
            container.innerHTML += html
        }
    })
}

function addAccordion(container, num, title, episode){
    var html = '<div class="accordion-item"><h2 class="accordion-header" id="heading' + num + '"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' + num + '" aria-expanded="true" aria-controls="collapse' + num + '">' + title + '</button></h2><div id="collapse' + num + '" class="accordion-collapse collapse" aria-labelledby="heading' + num + '" data-bs-parent="#accordionGroup"><div class="accordion-body">' + episode + '</div></div></div>'
    container.innerHTML += html
};

function renderAccordion(){
    d3.csv(csv_url, function (csv){
        titles = [...new Set(csv.map(d => d.title))];
        episodes = [...new Set(csv.map(d => d.episode))];
        var container = document.getElementById("accordionGroup")
        container.innerHTML = ""
        for (var i = 0; i < titles.length; i++){
            title = titles[i]
            episode = episodes[i]
            num = (i + 1).toString()
            addAccordion(container = container, num = num, title = title, episode = episode)
        }
    })
}

function allBtns() {
    var buttons = document.querySelectorAll(".btn-primary")
    var all_buttons = [];
    buttons.forEach(button => all_buttons.push(button.innerHTML))
    return all_buttons;
}

function selectedBtns() {
    var actives = document.querySelectorAll(".btn-primary.active")
    var selected_buttons = [];
    actives.forEach(button => selected_buttons.push(button.innerHTML))
    return selected_buttons;
}

function updateSelectedWords(){
    document.getElementById('values').innerHTML = "Selected words: " + selectedBtns().join(", ").toString()
}

function changeNodeColor() {
    console.log("changeNodeColor")
    var all = allBtns();
    var selected = selectedBtns()
    all.forEach(function (value) {
        var group = document.getElementById(value)
        // console.log(group)
        circle = group.childNodes[0]
        rect = group.childNodes[1]
        text = group.childNodes[2]
        if (selected.includes(value)){
            circle.setAttribute("fill", "red")
            rect.style.fill = "red"
            text.style.fill = "white"
        }else{
            circle.setAttribute("fill", "black")
            rect.style.fill = "white"
            text.style.fill = "black"
        }
    })
}
function changeEdgeColor(){
    var i = 0;
    var all = allBtns();
    var selected = selectedBtns()
    console.log('changeEdgeColor')
    // var selected_num = selected.map(v => all.indexOf(v).toString())
    // console.log("selected_num: "+selected_num.join(", "))
    edges = document.querySelectorAll(".link")
    // console.log(edges)
    edges.forEach(function(edge){
        // console.log(edge)
        var names = edge.id.split("-")
        if(selected.some(name => names.includes(name))){
            // console.log(edge)
            edge.setAttribute("stroke", "red")
            // console.log('--------------start-------------')
            names.forEach(function(name){
                
                var group = document.getElementById(name)
                circle = group.childNodes[0]
                rect = group.childNodes[1]
                text = group.childNodes[2]
                if (!selected.includes(name)){
                    // console.log(name)
                    circle.setAttribute("fill", "orange")
                    rect.style.fill = "orange"
                    i += 1
                }
            })
        }else{
            edge.setAttribute("stroke", "black")
        }
    })
    // console.log(i)
    // 
    
}
function updateAccordion() {
    var all = allBtns();
    var selected = selectedBtns();
    d3.csv(csv_url, function (csv){
        titles = [...new Set(csv.map(d => d.title))];
        episodes = [...new Set(csv.map(d => d.episode))];
        var accordions = document.querySelectorAll(".accordion-item")
        accordions.forEach(function (d){
            var title = d.getElementsByClassName('accordion-button')[0].innerHTML
            var episode = d.getElementsByClassName('accordion-body')[0].innerHTML
            var string = (title + " " + episode).toLowerCase()
            if (selected.every(v => string.includes(v))){
                d.hidden = false
            }else{
                d.hidden = true
            }
        })
    });
}

function searchAccordion() {
    search_query = document.getElementById('search-query').value
    // console.log(search_query)
    items = document.querySelectorAll(".accordion-item:not([hidden])")
    console.log(items.length)
    // saved_items = []
    items.forEach(function (d) {
        var title = d.getElementsByClassName('accordion-button')[0].innerHTML
        var episode = d.getElementsByClassName('accordion-body')[0].innerHTML
        var string = (title + " " + episode).toLowerCase()
        // console.log(string)
        if (string.includes(search_query)) {
            // saved_items.push(d.outerHTML)
            d.hidden = false
        } else {
            d.hidden = true
        }
        // console.log(title)
    });
}

function renderSVG() {
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

        

        var node = svg.selectAll(".node")
            .data(json.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) { return d.name })
            
            .call(force.drag);

        node.append("circle")
            .attr("r", "5");

        node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function (d) { return d.name })
            .call(getBBox)
        function getBBox(selection){
            selection.each(function(d){
                d.bbox = this.getBBox();
            });
        };

        node.insert('rect', 'text')
            .attr({
                'x': d => d.bbox.x,
                'y': d => d.bbox.y,
                'width': d => d.bbox.width,
                'height': d => d.bbox.height,
                'class': "bbox",
                'fill': 'white'
            });
        
        var link = svg.selectAll(".link")
            .data(json.links)
            .enter().append("line")
            .filter(function(d){return d.weight > 20})
            .attr("class", "link")
            .style("stroke-width", function (d) { return d.weight/50})
            .attr('stroke', 'black')
            .attr('id', function(d){
                return d.source.name+"-"+d.target.name
            });
        
        force.on("tick", function () {
            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
            this.parentNode.appendChild(this);
            });
        };
        d3.selectAll('g').moveToFront();
        // d3.selectAll('text').moveToFront();
    });
    
    
};

function update() {
    updateSelectedWords();
    changeNodeColor();
    changeEdgeColor();
    updateAccordion();
    searchAccordion();
}

function resetWords() {
    console.log('reset button pressed')
    var actives = document.querySelectorAll(".btn-primary.active");

    actives.forEach(function (d) {
        console.log(d.className)
        d.className = d.className.replace("active", "")
    });
    update()
};

$(document).ready(function () {
    renderButtons()
    console.log('buttons rendered')
    updateSelectedWords()
    console.log('words updated')
    renderAccordion()
    console.log('accordion rendered')
    renderSVG()
    console.log('svg rendered')
    console.log(selectedBtns())

    // $(".btn-primary").on('click') does not work
    $(document).on('click', ".btn-primary", function () {
        console.log("clicked")
        update();
    })
    $(document).on('click', '#reset-button', function () {
        resetWords()
    })
    $(document).on('click', '#search-button', function (){
        searchAccordion();
        // update()
    })
    $(document).on('search', '#search-query', function (){
        updateAccordion()
        searchAccordion()
        // update()
    })
    $(document).on('keyup', '#search-query', function (event) {
        var key = event.key
        console.log(key)
        if(key == "Backspace" || key == 'Delete'){
            updateAccordion()
            searchAccordion()
        }else{
            searchAccordion()
        }
        // searchAccordion()
        // update()
    })
    
})

// episode = episodes[i].replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();