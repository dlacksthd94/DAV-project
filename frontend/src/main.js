// 그래프 노드, 엣지 정보 json 파일 url
const json_url = "https://raw.githubusercontent.com/dlacksthd94/DAV-project/main/backend/data/graph_epi.json";
// 스토리 제목과 원문 검색할 수 있는 csv 파일 url 
const csv_url = "https://raw.githubusercontent.com/dlacksthd94/DAV-project/main/backend/data/Aesop.csv";

// 그래프 json에서 node 읽어서 왼쪽 사이드바에 버튼 띄우는 함수
function renderButtons() {
    $.getJSON(json_url, function (json){ // 그래프 json 파일을 json으로 불러와서
        var container = document.getElementById('buttons') // bootstrap.html에서 버튼을 띄울 영역 지정(id=buttons)
        for (var i = 0; i < json.nodes.length; i++){ // 모든 node에 대해서
            var obj = json.nodes[i] // 노드 선택해서
            var html = '<button type="button" class="btn btn-outline-primary m-1" data-bs-toggle="button" autocomplete="off">' + obj.name + '</button>' // 노드 이름을 넣은 버튼 html을 만들어서
            container.innerHTML += html // 위에서 만든 html을 buttons 컨테이너 안에 추가
        }
    })
}

// 오른쪽 사이드바에 우화 제목/내용 항목 1개 추가하는 함수 
function addAccordion(container, num, title, episode){ // 추가할 위치, 각 항목 구분을 위한 번호, 제목, 내용 입력받아서
    var html = '<div class="accordion-item"><h2 class="accordion-header" id="heading' + num + '"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' + num + '" aria-expanded="true" aria-controls="collapse' + num + '">' + title + '</button></h2><div id="collapse' + num + '" class="accordion-collapse collapse" aria-labelledby="heading' + num + '" data-bs-parent="#accordionGroup"><div class="accordion-body">' + episode + '</div></div></div>' // 항목 html 만들기: 번호가 포함된 id 지정, 제목/내용 지정
    container.innerHTML += html // 위에서 만든 html을 container 내에 추가
};

// 선택한 키워드가 있는 우화 검색해서 오른쪽 사이드바에 항목 추가하는 함수 
function renderAccordion(){
    d3.csv(csv_url, function (csv){ // 일단 aesop.csv 읽어와서
        titles = [...new Set(csv.map(d => d.title))]; // 제목의 배열을 만들고
        episodes = [...new Set(csv.map(d => d.episode))]; // 내용의 배열을 만들고
        var container = document.getElementById("accordionGroup") // 내용을 추가할 영역 지정(id=accordionGroup)
        container.innerHTML = "" // 일단 accordionGroup에 표시된 내용 전부 지우고
        for (var i = 0; i < titles.length; i++){ // 모든 제목-내용에 대해서
            title = titles[i] // 제목 선택
            episode = episodes[i] // 내용 선택
            num = (i + 1).toString() // 제목-내용 번호
            addAccordion(container = container, num = num, title = title, episode = episode) // id에 번호 붙여서 제목-내용 항목을 accordionGroup에 추가
        }
    })
}

// html에 있는 모든 버튼의 이름을 읽어와서 배열을 만드는 함수 
function allBtns() {
    var buttons = document.querySelectorAll(".btn-outline-primary") // class=btn-primary인 모든 element 선택
    var all_buttons = []; // 빈 배열 만들고
    buttons.forEach(button => all_buttons.push(button.innerHTML)) // 각 버튼에 대해서 버튼에 있는 텍스트를 배열에 추가
    return all_buttons;
}

// 왼쪽 사이드바에서 선택된 모든 버튼의 이름을 읽어와서 배열로 만드는 함수
function selectedBtns() {
    var actives = document.querySelectorAll(".btn-outline-primary.active") // class="btn-primary active"인 모든 element 선택
    var selected_buttons = []; // 빈 배열 만들고
    actives.forEach(button => selected_buttons.push(button.innerHTML)) // 각 버튼에 대해서 버튼에 있는 텍스트를 배열에 추가
    return selected_buttons;
}

// 왼쪽 사이드바에서 선택된 단어를 가운데 화면에 텍스트로 띄워주는 함수
function updateSelectedWords(){
    document.getElementById('values').innerHTML = "Selected words: " + selectedBtns().join(", ").toString()
    // selectedBtns로 선택된 단어 리스트를 만들어서, join으로 콤마로 구분해서 string으로 만들어서,
    // bootstrap.html에서 id가 values인 영역에 띄우기
}

// 노드 색깔 바꾸는 함수
function changeNodeColor() {
    var all = allBtns(); // 모든 단어 (선택 x + 선택 o)
    var selected = selectedBtns() // 버튼이 선택된 단어

    // 모든 단어에 대하여 (각 단어를 value라고 했을 때)
    all.forEach(function (value) { 
        var group = document.getElementById(value) // id=value인 node를 선택

        // 하나의 노드는 원 하나, 배경 사각형 하나, 이름 텍스트 하나로 구성됨
        circle = group.childNodes[0] // 원
        rect = group.childNodes[1] // 배경 사각형
        text = group.childNodes[2] // 이름 텍스트

        // 만약 단어(value)가 선택되었으면(in selected)
        if (selected.includes(value)){ 
            circle.setAttribute("fill", "red") // 원을 빨간색으로
            rect.style.fill = "red" // 배경 사각형을 빨간색으로
            text.style.fill = "white" // 이름 텍스트를 흰색으로

        // 만약 단어가 선택되지 않았으면
        }else{ 
            circle.setAttribute("fill", "black") // 원을 검은색으로
            rect.style.fill = "white" // 배경 사각형을 흰색으로
            text.style.fill = "black" // 이름 텍스트를 검은색으로
        }
    })
}

// edge 색깔 바꾸는 함수
function changeEdgeColor(){
    var all = allBtns(); // 모든 단어 (선택 x + 선택 o)
    var selected = selectedBtns() // 버튼이 선택된 단어

    // var selected_num = selected.map(v => all.indexOf(v).toString())

    edges = document.querySelectorAll(".link") // 모든 edge 읽어오기(class=link)
    edges.forEach(function(edge){ // 각각의 edge에 대해서
        // 각 edge의 id는 "source-target" 형식으로 만들어짐 (아래쪽 코드 참고)
        var idxs = edge.id.split("-") 
        var names = [all[idxs[0]], all[idxs[1]]] // edge에 연결된 node 이름 2개
        // 만약 source, target 중 하나라도 왼쪽 사이드바에서 선택되었으면
        if(selected.some(name => names.includes(name))){ 
            edge.setAttribute("stroke", "red") // edge 색깔을 빨간색으로 만들기
            names.forEach(function(name){ // 두 개의 node에 대해서
                var group = document.getElementById(name) // 노드 element 선택하기(원+사각형+이름텍스트)
                circle = group.childNodes[0] // 원
                rect = group.childNodes[1] // 배경 사각형
                text = group.childNodes[2] // 이름 텍스트
                if (!selected.includes(name)){ // 두 노드 중에서 선택되지 않은 단어는 
                    circle.setAttribute("fill", "orange") // 원을 주황색으로
                    rect.setAttribute('style', "fill: orange") // 배경 사각형도 주황색으로
                }
            })
        // source, target 중 왼쪽 사이드바에서 선택된 노드가 없으면
        }else{ 
            edge.setAttribute("stroke", "black") // edge 색을 다시 검은색으로
        }
    })
}

// 선택된 단어가 들어간 스토리를 오른쪽 사이드바에 추가하는 함수
// 이슈: 검색 고도화 필요
// Aesop.csv가 아니라 word_info.csv에다가 episode를 추가한 데이터가 필요함 (과거형도 검색되게)
function updateAccordion() {
    var all = allBtns(); // 모든 단어 목록 만들기
    var selected = selectedBtns(); // 선택된 단어 목록 만들기
    d3.csv(csv_url, function (csv){ // Aesop.csv 읽어와서
        titles = [...new Set(csv.map(d => d.title))]; // 제목 배열 만들고
        episodes = [...new Set(csv.map(d => d.episode))]; // 내용 배열 만들고

        // 일단 페이지 로딩 시에는 모든 우화의 제목-내용이 html에 들어가게 해두었음
        // updateAccordion 함수가 실행될 때마다, 선택한 단어가 없는 항목은 화면에서만 안 보이게 하는 것임
        var accordions = document.querySelectorAll(".accordion-item") // 일단 html에 들어가있는 모든 제목-내용 element 선택

        // 각각의 제목-내용 element에 대해서
        accordions.forEach(function (d){ 

            // 검색 고도화 시 수정할 부분!!
            var title = d.getElementsByClassName('accordion-button')[0].innerHTML // 제목을 읽어오고
            var episode = d.getElementsByClassName('accordion-body')[0].innerHTML // 내용을 읽어와서
            var string = (title + " " + episode).toLowerCase() // 제목과 내용을 하나의 문자열로 합친 다음에

            // 버튼을 선택한 모든 단어가 제목+내용 안에 있으면
            if (selected.every(v => string.includes(v))){ 
                d.hidden = false // 화면에서 숨김 해제

            // 버튼을 선택한 단어 중 하나라도 제목+내용 안에 없으면
            }else{ 
                d.hidden = true // 화면에서 숨김
            }
        })
    });
}

// 검색창에 입력한 검색어를 읽어와서, 검색어가 있는 제목-내용만 남기고 나머지를 숨기는 함수
function searchAccordion() {

    search_query = document.getElementById('search-query').value // 검색창(id=search-query)에 입력한 값 읽어오기
    // search_query를 공백을 기준으로 단어별로 쪼개줘야 하려나요?

    items = document.querySelectorAll(".accordion-item:not([hidden])") // 제목-내용 요소 중에서 현재 화면에 남아있는(숨겨지지 않은) 것들만 읽어와서 

    // 화면에 남아있는 모든 제목-내용에 대하여
    items.forEach(function (d) {
        var title = d.getElementsByClassName('accordion-button')[0].innerHTML // 제목을 읽어오고
        var episode = d.getElementsByClassName('accordion-body')[0].innerHTML // 내용을 읽어오고
        var string = (title + " " + episode).toLowerCase() // 제목과 내용을 하나의 문자열로 합쳐서

        // 제목과 내용 안에 검색어가 있으면
        if (string.includes(search_query)) {
            d.hidden = false // 제목-내용 숨김 해제
        // 제목과 내용 안에 검색어가 없으면
        } else {
            d.hidden = true // 제목-내용 숨김
        }
    });
}


// 그래프 시각화하는 함수 (d3 예제 내용)
function renderSVG() {

    // svg 캔버스 가로세로 지정
    var width = 500,
        height = 500

    // id=svg인 영역에다가 빈 svg 추가하기
    var svg = d3.select("#svg").append("svg")
        .attr("width", width)
        .attr("height", height)

        // 1202 추가
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))
        .append('g');


    // 그래프에서 밀집도, 노드 간 거리, 탄성(복원력) 등 설정 
    // var force = d3.layout.force()
    //     .gravity(.05)
    //     .distance(275)
    //     .charge(-100)
    //     .size([width, height]);

    // 1202 추가
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().distance(200).strength(.01))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        // .force('x', d3.forceX(width / 2).strength(.1))
        // .force('y',  d3.forceY(height / 2).strength(.1))

    // 그래프 그리는 부분
    d3.json(json_url, function (json) {
        // 노드와 엣지에 힘 설정
        // force
        //     .nodes(json.nodes)
        //     .links(json.links)
        //     .start();

        // 노드 그리기
        var node = svg.selectAll(".node")
            .data(json.nodes)
            .enter().append("g") // 그룹 추가(원+배경사각형+이름텍스트)
            .attr("class", "node") // 클래스는 node로 지정
            .attr("id", function (d) { return d.name }) // element의 id를 노드 이름으로 지정
            // .call(force.drag);
        
        // 노드에 원 추가
        node.append("circle")
            .attr("r", "5"); // 노드 원 반지름 설정

        // 노드에 텍스트 추가
        node.append("text")
            .attr("dx", 12) // 힘과 관련된 요인인데 잘은 모르겠네요
            .attr("dy", ".35em") // 힘과 관련된 요인인데 잘은 모르겠네요
            .text(function (d) { return d.name }) // 텍스트 내용을 노드 이름으로 지정
            .call(getBBox) // getBBox 함수 실행해서 글자를 둘러싼 사각형 가져오기(배경색 칠하려고) 
        
        // 노드 그룹 데이터를 입력받아서, 각 항목에 bbox라는 이름으로 텍스트의 bounding box의 위치와 크기를 저장
        function getBBox(selection){
            selection.each(function(d){
                d.bbox = this.getBBox();
            });
        };

        // 배경 사각형 만들기
        node.insert('rect', 'text') // node의 text에다가 사각형을 추가해줌
        // 위치, 크기, 클래스, 색상 지정
            .attr('fill', 'white')
            .attr('x', d => d.bbox.x)
            .attr('y', d => d.bbox.y)
            .attr('width', d => d.bbox.width)
            .attr('height', d => d.bbox.height)
            .attr('class', 'bbox')
            .attr('x', d => d.bbox.x)
            
        // 엣지 그리기
        var link = svg.selectAll(".link") // 각 edge의 class는 link로 지정
            .data(json.links)
            .enter().append("line") // 선을 추가함
            .filter(function(d){return d.weight > 20}) // edge 필터링: weight가 20 이상인 edge만
            .attr("class", "link")
            .style("stroke-width", function (d) { return d.weight/50}) // edge 굵기 지정
            .attr('stroke', 'black') // edge 색상 지정
            .attr('id', function(d){
                return d.source+"-"+d.target // edge id 지정: source-target 형식으로
            });
        

        // 1202 추가한 부분

        simulation
            .nodes(json.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(json.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
                // .attr("cx", function(d) { return d.x; })
                // .attr("cy", function(d) { return d.y; });
        }

        // 마우스로 노드를 드래그하면 어떻게 되는지에 관련된 것 같은데 잘 모르겠음
        // tick이라는 이벤트가 발생하면 실행되는 함수인 듯
        // force.on("tick", function () {
        //     link.attr("x1", function (d) { return d.source.x; })
        //         .attr("y1", function (d) { return d.source.y; })
        //         .attr("x2", function (d) { return d.target.x; })
        //         .attr("y2", function (d) { return d.target.y; });
        //     node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        // });

        // moveToFront 함수는 선택한 요소를 화면 맨 위로 올려주는 함수임 (바로 아래에서 쓰임)
        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
            this.parentNode.appendChild(this);
            });
        };
        // 각 노드를 화면 맨 위로 올려줌 (엣지 뒤에 가려지지 않게)
        d3.selectAll('.node').moveToFront();
    });
};

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// 화면 전체를 업데이트하는 함수
function update() {
    updateSelectedWords(); // 선택된 단어를 확인해서 가운데 화면에 써주고
    changeNodeColor(); // 노드 색깔을 바꿔주고
    changeEdgeColor(); // 엣지 색깔도 바꿔주고
    updateAccordion(); // 오른쪽 제목-내용 업데이트해준 다음에
    searchAccordion(); // 혹시나 검색어가 있으면 검색어를 포함하는 항목만 남기기
}

// 리셋 버튼 누르면 버튼 선택이 해제되게 하는 함수
function resetWords() {
    var actives = document.querySelectorAll(".btn-outline-primary.active"); // 선택된 버튼 요소를 읽어와서

    // 선택된 버튼 각각에 대해서
    actives.forEach(function (d) {
        d.className = d.className.replace("active", "") // class에서 "active"를 삭제하면 선택이 풀림
    });
    update() // 버튼 선택을 풀어준 다음에는 가운데 화면에 선택된 단어도 비워주고, 노드/엣지 색깔도 리셋하고, 오른쪽 제목-내용도 업데이트
};

// 아무 것도 없는 빈 깡통 bootstrap.html 렌더링이 완료되면
$(document).ready(function () {
    renderButtons() // 왼쪽 화면에 버튼을 띄우고
    updateSelectedWords() // 가운데 화면에 선택된 단어도 띄우고 (처음이니까 Selected: 하고 빈 칸만)
    renderAccordion() // 오른쪽 화면에 우화 제목-내용도 띄우고
    renderSVG() // 마지막으로 네트워크를 그린다

    // $(".btn-primary").on('click') does not work
    $(document).on('click', ".btn-outline-primary", function () { // 만약 단어 버튼이 클릭되면
        update(); // 가운데 화면에 선택된 단어도 띄워주고, 노드/엣지 색깔도 바꿔주고, 오른쪽 제목-내용도 업데이트
    })
    $(document).on('click', '#reset-button', function () { // 만약 리셋 버튼이 클릭되면
        resetWords() // 선택된 버튼 풀어주고, 가운데 화면에 선택된 단어도 비워주고, 노드/엣지 색깔도 리셋하고, 오른쪽 제목-내용도 업데이트
    })
    $(document).on('click', '#search-button', function (){ // 검색 버튼을 누르면
        searchAccordion(); // 일단 화면에 남아있는 제목-내용 중 검색어에 걸리는 것만 남기고 
    })
    $(document).on('search', '#search-query', function (){ // 검색창에 검색을 하면
        updateAccordion() // 일단 선택된 단어가 들어있는 제목-내용부터 띄운 뒤에 (to make sure)
        searchAccordion() // 검색어가 들어간 항목만 남기기
    })
    $(document).on('keyup', '#search-query', function (event) { // 검색어 타이핑을 하는 와중에(키를 눌렀다가 뗄 때)
        var key = event.key // 무슨 키를 눌렀는지 확인해서

        // 검색어를 지우면 화면에 없던 것을 새로 띄워줘야 하니까 경우의 수를 나눔
        if(key == "Backspace" || key == 'Delete'){ // 만약 백스페이스나 딜리트면
            updateAccordion() // 일단 선택된 단어가 들어있는 제목-내용을 다 띄운 뒤에 (to make sure) 
            searchAccordion() // 검색어가 들어간 항목만 남기고 나머지는 숨기기
        }else{ // 만약 지우는 상황이 아니라면
            searchAccordion() // 지금 화면에 있는 것들 중에서 검색어가 들어간 항목만 남기고 나머지는 숨기기
        }
    })   
})

// episode = episodes[i].replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();