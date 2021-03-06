let width = 600;
let height = 600;

// 数据
let total_links;
let total_nodes;
let links;
let nodes;
let rela_p2a;
let rela_a2p;

// D3变量
let node;
let link;
let node_text;
let force_svg;

let div;
let simulation;

let font_size = 5;
let font_size_highlight = 7;
let paper_color = "green";
let author_color = "blue";
let image_size = 8;

//拖拽开始绑定的回调函数参数为node节点，首先判断事件是否活动并设置动画的a曲线值。
//这个值是设置动画效果的，然后重新渲染。
//这里fx为当前节点的固定坐标，x为节点的原始坐标。
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
//拖拽中的回调函数，参数还是为node节点，这里不断的更新节点的固定坐标根据鼠标事件的坐标
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
//拖拽结束回调函数，参数也是node节点，判断事件状态动画系数设置为0结束动画，并设置固定坐标都为null。
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}



// node_name : info['title']
// node_id : "paper" + "-" + year + "-" + str(info['id'])
function click_update(node_name, node_id){
    help();

    if (node_id[0] == 'a'){
        return;
    }

    nodes = [];
    links = [];
    let author = [];
    for (i in rela_p2a[node_name]){
        let idx = rela_p2a[node_name][i];
        author.push(total_nodes[idx]);
        nodes.push(total_nodes[idx]);
    }
    for (i in author){
        let auth = author[i].node_name;
        for (j in rela_a2p[auth]){
            let idx = rela_a2p[auth][j];
            if (nodes.indexOf(total_nodes[idx]) == -1){
                nodes.push(total_nodes[idx]);
            }
            let l = {};
            l['source'] = author[i].node_id;
            l['target'] = total_nodes[idx].node_id;
            links.push(l);

        }
    }

    div.transition()
        .duration(200)
        .style("opacity", 0);

    console.log(nodes);
    console.log(links);

    // nodes = nodes.map(d => Object.create(d));
    // links = links.map(d => Object.create(d));

    // console.log(nodes);
    // console.log(links);

    // update();
    showForce();
}

function simulate(strengh_force){
    simulation = d3.forceSimulation(nodes)
    // 表示link连接时，使用node的id字段
    .force("link", d3.forceLink(links).id(d => d.node_id))
    .force("charge", d3.forceManyBody().strength(strengh_force))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    // .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        // 更新文字坐标
        node_text.attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });
    });
}

function help(){
    nodes = []
    links = []
    links = links.map(d => Object.create(d));
    nodes = nodes.map(d => Object.create(d));

    link = link.data(links);
    link.exit().remove();

    node = node.data(nodes);
    node.exit().remove();
}

function update(){
    links = links.map(d => Object.create(d));
    nodes = nodes.map(d => Object.create(d));

    // simulate(-10);
    simulate(-1000);
    // simulation.nodes(nodes);
    // simulation.force("link").links(links);
    // simulation.alpha(1).restart();


    // simulation = d3.forceSimulation(nodes)
    // // 表示link连接时，使用node的id字段
    // .force("link", d3.forceLink(links).id(d => d.node_id))
    // .force("charge", d3.forceManyBody().strength(strengh_force))
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
    // // .force("charge", d3.forceManyBody())
    // .force("center", d3.forceCenter(width / 2, height / 2));

    // node = force_svg.select("#node_group").selectAll(".node");
    // link = force_svg.select("#link_group").selectAll(".line");

    link = link.data(links);
    link.exit().remove();
    var linkEnter = link
        .enter()
        .append("line")
        .attr("class","link")
        .attr("id",function(d,i) {
            // console.log(d.target);
            return 'line'+i
        })
        .attr('marker-end','url(#end)')
        .style("stroke","#ccc")
        .style("pointer-events", "none");
    // console.log(link);
    link = linkEnter.merge(link);
    
    node = node.data(nodes);
    node.exit().remove();
    // console.log(node);

    // console.log(nodes);
    let nodeEnter = node.enter()
        // .data(nodes)
        .append("g")
        .attr("class","node")
        .on("mouseover", function(d) {
            
            // console.log(this);
            // 额外增加一个标签
            div.transition()
                .duration(200)
                .style("opacity", .9);
            // 细节：增加论文的引用数
            // div.html(d.node_name)
            div.html(() => {
                    if (d.node_id[0] == 'p'){
                        return d.node_name + "<br>year: " + d.node_id.substring(6, 10) + " cite: " + d.node_cite;
                    }else{
                        return d.node_name;
                    }
                })
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY) + "px");

            d3.select(this).select("image").transition()
                .duration(200)
                .attr("x", -2 * image_size)
                .attr("y", -2 * image_size)
                .attr("width", 4 * image_size)
                .attr("height", 4 * image_size); 

            // 将已有的text内容上移
            d3.select(this).select("text")
                // .transition()
                // .duration(200)
                .attr("dx", -10)
                .attr("dy",-10)
                .style("fill", "blue")
                .style("stroke", "blue")
                .style("stroke-width", ".5px")
                .style("font-size", font_size_highlight)
                .style("opacity", 0);
                // .style("z-index",999);
        })
        .on("mouseout", function () {
            div.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).select("image").transition()
                .duration(200)
                .attr("x", -image_size)
                .attr("y", -image_size)
                .attr("width", 2 * image_size)
                .attr("height", 2 * image_size); 

            d3.select(this).select("text")
                // .transition()
                // .duration(200)
                .attr("dx",5)
                .attr("dy",5)
                .style("fill", "black")
                .style("stroke", null)
                .style("stroke-width", "0px")
                .style("font-size", font_size)
                .style("opacity", 1)
                .style("z-index", null);
        })
        .on("click", function (d){
            click_update(d.node_name, d.node_id);
        })
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        ).merge(node);
    
    // update
    let nodeText = node.select("text").text(function(d) {
        // console.log(d.node_id);
        if (d.node_id[0] == "a") {
            return d.node_name;
        } else{
            return "";
        }
    }).merge(node);

    // console.log(nodeText);

    // update
    let nodeCircle = node.select("circle")
    .style("stroke", function(d,i){
        // console.log(d.node_id);
        if (d.node_id[0] == 'p'){
            return paper_color;
        }else{
            return author_color;
        }
    })
    .attr("r", function(d,i){
        if (d.node_id[0] == 'p'){
            return Math.min(6, Math.max(2, Math.sqrt(d.node_cite / 2)));
        }else{
            return 3;
        }
    })
    .style("fill", function(d,i){
        if (d.node_id[0] == 'p'){
            return paper_color;
        }else{
            return author_color;
        }
    })
    .style("opacity", function(d,i){
        if (d.node_id[0] == 'p'){
            return 1;
        }else{
            return 0;
        }
    }).merge(node);

    // console.log(nodeCircle);

    let nodeImg = node.select("image").attr("xlink:href", function(d, i) {
        // console.log(d.node_id);
        if (d.node_id[0] == 'a') {
            // console.log("judge true", d.node_id);
            return "./img/people.png";
        } else {
            return null;
        }
    }).merge(node);

    // console.log(nodeImg);

    // simulation.alpha(1).restart();

    // node = nodeEnter.merge(node);
    // node = nodeText.merge(node);
    // node = nodeCircle.merge(node);
}

function showForce(){
    links = links.map(d => Object.create(d));
    nodes = nodes.map(d => Object.create(d));

    simulate(-1000);

    link = link.data(links);
    link.exit().remove();
    var linkEnter = link
        .enter()
        .append("line")
        .attr("class","link")
        .attr("id",function(d,i) {return 'line'+i})
        .attr('marker-end','url(#end)')
        .style("stroke","#ccc")
        .style("pointer-events", "none");

    link = linkEnter.merge(link);

    // remove 
    node = node.data(nodes);
    node.exit().remove();
    var nodeEnter = node.enter()
        .append("g")
        .attr("class","node")
        .on("mouseover", function(d) {
            // console.log(d.node_id);
            // console.log(this);
            // 额外增加一个标签
            div.transition()
                .duration(200)
                .style("opacity", .9);
            // 细节：增加论文的引用数
            // div.html(d.node_name)
            div.html(() => {
                    if (d.node_id[0] == 'p'){
                        return d.node_name + "<br>year: " + d.node_id.substring(6, 10) + " cite: " + d.node_cite;
                    }else{
                        return d.node_name;
                    }
                })
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY) + "px");

            d3.select(this).select("image").transition()
                .duration(200)
                .attr("x", -2 * image_size)
                .attr("y", -2 * image_size)
                .attr("width", 4 * image_size)
                .attr("height", 4 * image_size); 

            // 将已有的text内容上移
            d3.select(this).select("text")
                // .transition()
                // .duration(200)
                .attr("dx", -10)
                .attr("dy",-10)
                .style("fill", "blue")
                .style("stroke", "blue")
                .style("stroke-width", ".5px")
                .style("font-size", font_size_highlight)
                .style("opacity", 0);
                // .style("z-index",999);
        })
        .on("mouseout", function () {
            div.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).select("image").transition()
                .duration(200)
                .attr("x", -image_size)
                .attr("y", -image_size)
                .attr("width", 2 * image_size)
                .attr("height", 2 * image_size); 

            d3.select(this).select("text")
                // .transition()
                // .duration(200)
                .attr("dx",5)
                .attr("dy",5)
                .style("fill", "black")
                .style("stroke", null)
                .style("stroke-width", "0px")
                .style("font-size", font_size)
                .style("opacity", 1)
                .style("z-index", null);
        })
        .on("click", function (d){
            click_update(d.node_name, d.node_id);
        })
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

    // update
    // node.select("text").text(function(d) {
    //     if (d.node_id[0] == "a") {
    //         return d.node_name;
    //     } else{
    //         return "";
    //     }
    // });
    //new 
    node_text = nodeEnter.append("text")
        .style("fill", "black")
        .style("font-size", font_size)
        .attr("dx", 5)
        .attr("dy", 5)
        .text(function(d) {
            // console.log(d.node_id);
            if (d.node_id[0] == "a") {
                // console.log("judge true", d.node_id);
                return d.node_name;
            } else{
                return "";
            }
        });

    // update
    // node.select("circle")
    //     .style("stroke", function(d,i){
    //         if (d.node_id[0] == 'p'){
    //             return paper_color;
    //         }else{
    //             return author_color;
    //         }
    //     })
    //     .style("opacity", function(d,i){
    //         if (d.node_id[0] == 'p'){
    //             return 1;
    //         }else{
    //             return 0;
    //         }
    //     });

    //new
    node_circle = nodeEnter
        .append("circle")
        .attr("r", function(d,i){
            if (d.node_id[0] == 'p'){
                return Math.min(6, Math.max(2, Math.sqrt(d.node_cite / 2)));
            }else{
                return 3;
            }
        })
        .style("fill", function(d,i){
            if (d.node_id[0] == 'p'){
                return paper_color;
            }else{
                return author_color;
            }
        })
        .style("stroke-width","1")
        .style("stroke", function(d,i){
            if (d.node_id[0] == 'p'){
                return paper_color;
            }else{
                return author_color;
            }
        })
        .style("opacity", function(d,i){
            if (d.node_id[0] == 'p'){
                return 1;
            }else{
                return 0;
            }
        });

    //update
    // node.select("image").attr("xlink:href", function(d, i) {
    //     if (d.node_id[0] == 'a') {
    //         return "./img/people.png";
    //     } else {
    //         return null;
    //     }
    // });		
    
    //new
    var node_image = nodeEnter.append("image")
    .attr("xlink:href", function(d, i) {
        if (d.node_id[0] == 'a') {
            return "./img/people.png";
        } else {
            return null;
        }
    })
    .attr("x", -image_size)
    .attr("y", -image_size)
    .attr("width", 2 * image_size)
    .attr("height", 2 * image_size); 

    node = nodeEnter.merge(node);

    // simulation.stop();
                
    // simulation.nodes(nodes);

    // // 设定边之间的距离
    // // simulation.force("link").links(links).distance(120);

    // simulation.alpha(1);
    // simulation.restart();
}

// 读取json文件
d3.json("./data/FDG-info.json", function(data){

    total_links = data.links;
    total_nodes = data.nodes;

    nodes = total_nodes;
    links = total_links;

    // nodes = [{"node_id": "paper-2001-45", "node_name": "Human tracking in multiple cameras", "node_cite": 110}, {"node_id": "author-S. Khan", "node_name": "S. Khan"}];
    // links = [{"source": "author-S. Khan", "target": "paper-2001-45"}];

    // console.log(nodes);

    // links = total_links;
    // nodes = total_nodes;

    rela_p2a = data.rela_p2a;
    rela_a2p = data.rela_a2p;


    div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // 缩放功能
    force_svg = d3.select("body").append("div")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    // 设置div的宽和高
    // .attr("width", width)
    // .attr("height", height)
    .style("fill","white")
    .call(d3.zoom().scaleExtent([1 / 2, 8]).on("zoom", function () {force_svg.attr("transform", d3.event.transform)})).append("g");
    
    force_svg.append("g").attr("id","link_group");
    force_svg.append("g").attr("id","node_group");

    node = force_svg.select("#node_group").selectAll(".node");
    link = force_svg.select("#link_group").selectAll(".line");

    showForce();

});